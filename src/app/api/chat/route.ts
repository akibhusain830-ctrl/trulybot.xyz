export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { CoreMessage as VercelChatMessage, StreamingTextResponse, LangChainAdapter } from 'ai';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { Document } from 'langchain/document';
import { RunnableSequence, RunnablePassthrough } from '@langchain/core/runnables';
import { BytesOutputParser } from '@langchain/core/output_parsers';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { OpenAIEmbeddings } from '@langchain/openai';
import { createClient } from '@supabase/supabase-js';
import { CoreMessage } from '@langchain/core/messages';

// All imports from your lib directory
import { findKnowledgeAnswer } from '@/lib/productKnowledge';
import { retrieveWorkspaceChunks } from '@/lib/retrieval';
import { generateAnswerFromDocs } from '@/lib/retrievalAnswer';
import { getGeneralAnswer } from '@/lib/generalAnswer';
import { detectLead } from '@/lib/lead';
import { extractIntentKeywords, persistLeadIfAny } from '@/lib/leadStore';
import { BRAND } from '@/lib/branding';

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
  return 'I can help with Trulybot setup, embedding, pricing, features, roadmap or knowledge ingestion. Could you clarify your question?';
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
    // 1. Parse
    let body: ChatBody;
    try {
      body = await req.json();
    } catch {
      return jsonError('Invalid JSON body');
    }

    const { botId, messages: raw } = body || {};
    if (!botId) return jsonError('botId is required');
    if (!raw || !Array.isArray(raw) || raw.length === 0) {
      return jsonError('messages array required');
    }

    const mode: 'demo' | 'subscriber' = botId === 'demo' ? 'demo' : 'subscriber';
    const messages = normalizeMessages(raw);
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUser) return jsonError('No user message found');
    const userText = lastUser.content.trim();
    if (!userText) return jsonError('Empty user message');

    log('start', { botId, mode, msgLen: messages.length, userText: safeSlice(userText) });

    // 2. Conversation window (for style continuity in fallback)
    const conversationWindow = messages
      .slice(-8)
      .map(m => `${m.role === 'bot' ? 'assistant' : m.role}: ${m.content}`)
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
    if (leadDetection.isLead) {
      await persistLeadIfAny({
        workspaceId: botId,
        email: leadDetection.email,
        name: leadDetection.name,
        intent: intentKeywords,
        message: userText,
        timestamp: new Date().toISOString(),
        sources: finalSources
      });
    }

    // 7. Response
    const response = new StreamingTextResponse(
      new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          controller.enqueue(encoder.encode(finalReply));
          controller.close();
        }
      }),
      {
        headers: {
          'x-knowledge-source': knowledgeSource || 'none',
          'x-used-docs': usedDocs.toString(),
          'x-fallback': fallback.toString(),
          'x-response-time': `${Date.now() - started}ms`
        }
      }
    );

    log('end', {
      source: knowledgeSource,
      fallback,
      usedDocs,
      responseTime: `${Date.now() - started}ms`,
      msgLen: finalReply.length
    });

    return response;
  } catch (error) {
    console.error('[chat:unhandled]', error);
    return jsonError('Internal server error', 500);
  }
}
