import { NextRequest, NextResponse } from 'next/server';
import { CoreMessage as VercelChatMessage } from 'ai';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence, RunnablePassthrough } from '@langchain/core/runnables';
import { BytesOutputParser } from '@langchain/core/output_parsers';
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';
import { cache, KnowledgeCache } from '@/lib/cache/manager';
import { performanceMonitor } from '@/lib/performance/optimization';
import { authenticateRequest } from '@/lib/protectedRoute';
import { secureChatService } from '@/lib/chat/secureChatService';
import { chatRateLimiter } from '@/lib/chat/rateLimiter';

// All imports from your lib directory
import { findKnowledgeAnswer } from '@/lib/productKnowledge';
import { retrieveWorkspaceChunks } from '@/lib/retrieval';
import { generateAnswerFromDocs } from '@/lib/retrievalAnswer';
import { getGeneralAnswer } from '@/lib/generalAnswer';
import { detectLead } from '@/lib/lead';
import { extractIntentKeywords, persistLeadIfAny } from '@/lib/leadStore';
import { BRAND } from '@/lib/branding';
import { getPlanQuota, currentMonthKey } from '@/lib/constants/quotas';
import { createClient } from '@supabase/supabase-js';

// ---------------- Types ----------------
interface IncomingMsg {
  role: string;
  content?: string;
  text?: string;
}

interface ChatBody {
  botId?: string;
  messages?: IncomingMsg[];
}

interface NormalizedMsg {
  role: 'user' | 'bot';
  content: string;
}

interface Source {
  title: string;
  docId: string;
  url?: string;
  snippet: string;
}

// ---------------- Utilities ----------------
function log(stage: string, data: any) {
  try {
    console.log(`[chat:${stage}]`, JSON.stringify(data));
  } catch {
    console.log(`[chat:${stage}]`, data);
  }
}

function jsonError(error: string, status = 400) {
  console.error('[chat:error]', { error, status });
  // This function ensures a valid JSON response is always sent on error
  return NextResponse.json({ error }, { status });
}

function normalizeMessages(raw: IncomingMsg[]): NormalizedMsg[] {
  return raw.map(m => ({
    role: m.role === 'bot' ? 'bot' : 'user',
    content: (m.content ?? m.text ?? '').toString()
  }));
}

function safeSlice(t: string, n = 180) {
  return t.length > n ? t.slice(0, n) + '…' : t;
}

function deterministicFallback() {
  return 'I can help answer questions about our products and services. How can I assist you today?';
}

// Replace any lingering old brand text in final output
function brandify(text: string) {
  if (!text) return text;
  const host = (() => {
    try { return new URL(BRAND.url).hostname; } catch { return 'trulybot.xyz'; }
  })();
  return text
    .replace(/\bAnemo\b/g, BRAND.name)
    .replace(/anemo\.ai/gi, host);
}

// ---------------- Handler ----------------
export async function POST(req: NextRequest) {
  const started = Date.now();

  try {
    // 1. Authentication check
    const authResult = await authenticateRequest(req);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult;

    // 2. Parse and validate request body
    let body: ChatBody;
    try {
      body = await req.json();
    } catch {
      return jsonError('Invalid JSON body');
    }

    const { botId } = body || {};
    if (!botId) return jsonError('botId is required');

    // 3. Rate limiting check
    const rateLimitResult = await chatRateLimiter.checkChatRateLimit(req, user.id, botId);
    if (!rateLimitResult.allowed) {
      return new NextResponse(
        JSON.stringify({ 
          error: rateLimitResult.reason || 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter 
        }),
        { 
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...rateLimitResult.headers
          }
        }
      );
    }

    // 4. Validate bot access and ownership
    const botAccess = await secureChatService.validateBotAccess(user.id, botId);
    if (!botAccess.isValid) {
      return jsonError(botAccess.error || 'Bot access denied', 403);
    }

    // 5. Validate and sanitize messages
    const { messages: raw } = body;
    const messageValidation = secureChatService.validateMessages(raw || []);
    if (!messageValidation.valid) {
      return jsonError(messageValidation.error || 'Invalid messages', 400);
    }

    const messages = messageValidation.sanitized!;
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUser) return jsonError('No user message found');
    
    const userText = secureChatService.sanitizeInput(lastUser.content);
    if (!userText) return jsonError('Empty user message');

    log('start', { 
      botId, 
      userId: user.id,
      workspaceId: botAccess.workspace_id,
      msgLen: messages.length, 
      userText: safeSlice(userText) 
    });

    // 6. Check message limits (skip for demo mode)
    const mode: 'demo' | 'subscriber' = botId === 'demo' ? 'demo' : 'subscriber';
    
    if (mode === 'subscriber') {
      const limitCheck = await secureChatService.checkMessageLimits(
        user.id, 
        botAccess.workspace_id!,
        botAccess.subscription_tier!
      );
      
      if (!limitCheck.allowed) {
        return jsonError(limitCheck.error || 'Message limit exceeded', 429);
      }
    }

    // Performance monitoring
    const perfStart = performance.now();

    // 7. Try cache first for repeated queries
    const cachedResponse = await KnowledgeCache.getAnswer(userText, botId);

    if (cachedResponse) {
      const responseTime = performance.now() - perfStart;
      return new NextResponse(
        JSON.stringify({
          success: true,
          message: cachedResponse,
          cached: true,
          responseTime: Math.round(responseTime),
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...rateLimitResult.headers
          }
        }
      );
    }
    // 8. Conversation window (for style continuity in fallback)
    const conversationWindow = messages
      .slice(-8)
      .map(m => `${m.role === 'assistant' ? 'assistant' : 'user'}: ${m.content}`)
      .join('\n');

    // 3. Lead / intent signals (before orchestration)
    const leadDetection = detectLead(userText);
    const intentKeywords = extractIntentKeywords(userText);

    // 4. Orchestration state
    let reply = '';
    let sources: Source[] = [];
    let knowledgeSource: 'kb' | 'docs' | 'general' | null = null;
    let fallback = false;
    let usedDocs = false;

    // -------- Phase A: Knowledge Base (always first) --------
    const kbMatch = findKnowledgeAnswer(userText);
    if (kbMatch) {
      reply = kbMatch.answer;
      knowledgeSource = 'kb';
      log('kb-hit', { id: kbMatch.id, score: kbMatch.score });
    }

    // -------- Phase B: Retrieval (subscriber only & only if no KB) --------
    if (!kbMatch && mode === 'subscriber') {
      const { chunks, qualityHeuristicMet } = await retrieveWorkspaceChunks({
        workspaceId: botId,
        query: userText
      });

      if (chunks.length && qualityHeuristicMet) {
        const docAns = await generateAnswerFromDocs({
          userMessage: userText,
          chunks
        });

        if (!docAns.indicatesNoAnswer && docAns.text.trim()) {
          reply = docAns.text.trim();
          sources = docAns.sources;
          usedDocs = true;
          knowledgeSource = 'docs';
        }
      }
    }

    // -------- Phase C: General Fallback --------
    if (!reply) {
      fallback = true;
      knowledgeSource = 'general';
      try {
        reply = await getGeneralAnswer(userText, {
          mode: mode === 'demo' ? 'demo' : 'fallback',
          conversationWindow
        });
      } catch (e) {
        console.error('[chat:error]', e);
        reply = deterministicFallback();
      }
    }

    // 5. Finalize
    const finalReply = brandify(reply);
    const finalSources = sources.map(s => ({ ...s, snippet: safeSlice(s.snippet) }));

    // 6. Lead persistence (if any)
    if (leadDetection) {
      await persistLeadIfAny({
        origin: mode,
        workspaceId: botId,
        sourceBotId: botId,
        email: leadDetection.email,
        firstMessage: userText,
        lastMessage: userText,
        intentKeywords,
        intentPrompt: leadDetection.intentPrompt,
        conversation: [] // Optionally pass recent messages here
      });
    }

    // 7. Increment usage counter for subscriber bots
    if (mode === 'subscriber') {
      await secureChatService.incrementMessageUsage(botAccess.workspace_id!);
    }

    // 8. Response (streaming-like using native Response)
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(finalReply));
        controller.close();
      }
    });

    const response = new Response(stream, {
      headers: {
        'x-knowledge-source': knowledgeSource || 'none',
        'x-used-docs': usedDocs.toString(),
        'x-fallback': fallback.toString(),
        'x-response-time': `${Date.now() - started}ms`,
        'x-user-id': user.id,
        'x-workspace-id': botAccess.workspace_id || 'unknown',
        ...rateLimitResult.headers
      }
    });

    log('end', {
      source: knowledgeSource,
      fallback,
      usedDocs,
      responseTime: `${Date.now() - started}ms`,
      msgLen: finalReply.length,
      userId: user.id,
      workspaceId: botAccess.workspace_id
    });

    return response;
  } catch (error) {
    console.error('[chat:unhandled]', error);
    return jsonError('Internal server error', 500);
  }
}
