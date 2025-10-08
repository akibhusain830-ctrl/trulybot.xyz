/**
 * CRITICAL SECURITY FIX: Secure Chat API Route
 * Fixes: Tenant isolation bypass, unauthorized workspace access
 * 
 * BEFORE: Users could access any workspace by manipulating botId
 * AFTER: Strict tenant validation and workspace ownership verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { CoreMessage as VercelChatMessage } from 'ai';
import { createTenantApiRoute, createSuccessResponse } from '@/lib/security/secureApiWrapper';
import { TenantContext } from '@/lib/security/tenantIsolation';
import { SecurityValidator, commonSchemas } from '@/lib/security/inputValidation';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { cache, KnowledgeCache } from '@/lib/cache/manager';
import { performanceMonitor } from '@/lib/performance/optimization';

// AI Integration imports
import { findKnowledgeAnswer } from '@/lib/productKnowledge';
import { retrieveWorkspaceChunks } from '@/lib/retrieval';
import { generateAnswerFromDocs } from '@/lib/retrievalAnswer';
import { getGeneralAnswer } from '@/lib/generalAnswer';
import { detectLead } from '@/lib/lead';
import { extractIntentKeywords, persistLeadIfAny } from '@/lib/leadStore';
import { BRAND } from '@/lib/branding';
import { getPlanQuota, currentMonthKey } from '@/lib/constants/quotas';

// Request validation schema
const chatRequestSchema = z.object({
  botId: commonSchemas.uuid.optional(), // Make optional - use tenant workspace instead
  workspaceId: commonSchemas.uuid.optional(), // For explicit workspace specification
  messages: z.array(z.object({
    role: z.enum(['user', 'bot', 'assistant']),
    content: z.string().min(1).max(4000), // Prevent extremely long messages
    text: z.string().optional() // Legacy support
  })).min(1).max(20) // Limit conversation history
});

interface ChatContext {
  workspaceId: string;
  isDemo: boolean;
  userText: string;
  conversationHistory: string;
}

// Secure chat handler with tenant isolation
const secureChatHandler = createTenantApiRoute(
  async (req: NextRequest, { reqId, tenant, validatedData }): Promise<NextResponse> => {
    const perfStart = performance.now();
    
    try {
      const { botId, workspaceId: requestedWorkspaceId, messages } = validatedData;
      
      // Security: Determine which workspace to use
      let targetWorkspaceId = tenant.workspaceId; // Default to user's workspace
      
      // If botId is provided, validate it belongs to user's workspace
      if (botId) {
        const isValidBot = await validateBotOwnership(botId, tenant.workspaceId);
        if (!isValidBot && botId !== 'demo') {
          logger.warn('Unauthorized bot access attempt', {
            reqId,
            userId: tenant.userId,
            botId,
            userWorkspace: tenant.workspaceId
          });
          
          return NextResponse.json({
            error: 'Bot not found or access denied',
            code: 'BOT_ACCESS_DENIED'
          }, { status: 403 });
        }
        
        if (botId === 'demo') {
          targetWorkspaceId = 'demo';
        }
      }
      
      // If explicit workspaceId provided, validate access
      if (requestedWorkspaceId && requestedWorkspaceId !== tenant.workspaceId) {
        const hasAccess = await validateWorkspaceAccess(tenant.userId, requestedWorkspaceId);
        if (!hasAccess) {
          logger.warn('Unauthorized workspace access attempt', {
            reqId,
            userId: tenant.userId,
            requestedWorkspace: requestedWorkspaceId,
            userWorkspace: tenant.workspaceId
          });
          
          return NextResponse.json({
            error: 'Workspace access denied',
            code: 'WORKSPACE_ACCESS_DENIED'
          }, { status: 403 });
        }
        targetWorkspaceId = requestedWorkspaceId;
      }
      
      // Normalize and validate messages
      const normalizedMessages = normalizeMessages(messages);
      const lastUserMessage = [...normalizedMessages].reverse().find(m => m.role === 'user');
      
      if (!lastUserMessage) {
        return NextResponse.json({
          error: 'No user message found in conversation',
          code: 'NO_USER_MESSAGE'
        }, { status: 400 });
      }
      
      const userText = lastUserMessage.content.trim();
      
      // Input validation for user message
      const inputValidation = SecurityValidator.validateInput(userText, {
        maxLength: 4000,
        allowHtml: false,
        allowSpecialChars: true,
        required: true
      });
      
      if (!inputValidation.isValid) {
        logger.warn('Malicious input detected in chat message', {
          reqId,
          threats: inputValidation.threats,
          userId: tenant.userId
        });
        
        return NextResponse.json({
          error: 'Invalid message content',
          code: 'INVALID_INPUT',
          details: 'Message contains potentially harmful content'
        }, { status: 400 });
      }
      
      const sanitizedUserText = inputValidation.sanitized;
      
      // Prepare chat context
      const chatContext: ChatContext = {
        workspaceId: targetWorkspaceId,
        isDemo: targetWorkspaceId === 'demo',
        userText: sanitizedUserText,
        conversationHistory: normalizedMessages
          .slice(-6) // Limit conversation window
          .map(m => `${m.role === 'bot' ? 'assistant' : m.role}: ${m.content}`)
          .join('\n')
      };
      
      logger.info('Secure chat request processed', {
        reqId,
        userId: tenant.userId,
        workspaceId: targetWorkspaceId,
        messageLength: sanitizedUserText.length,
        isDemo: chatContext.isDemo
      });
      
      // Check cache first for repeated queries
      const cacheKey = `chat:${targetWorkspaceId}:${sanitizedUserText}`;
      const cachedResponse = await KnowledgeCache.getAnswer(sanitizedUserText, targetWorkspaceId);
      
      if (cachedResponse) {
        const responseTime = performance.now() - perfStart;
        return createSuccessResponse({
          message: cachedResponse,
          cached: true,
          workspaceId: targetWorkspaceId
        }, {
          metadata: { responseTime: Math.round(responseTime) }
        });
      }
      
      // Quota enforcement for non-demo workspaces
      if (!chatContext.isDemo) {
        const quotaResult = await enforceConversationQuota(tenant, targetWorkspaceId);
        if (!quotaResult.allowed) {
          return NextResponse.json({
            error: quotaResult.error,
            code: 'QUOTA_EXCEEDED',
            details: quotaResult.details
          }, { status: 429 });
        }
      }
      
      // Process chat request with AI
      const chatResponse = await processChatRequest(chatContext, reqId);
      
      // Lead detection and persistence
      if (!chatContext.isDemo) {
        await handleLeadDetection(chatContext, tenant, reqId);
      }
      
      // Cache the response
      if (chatResponse.reply && !chatResponse.fallback) {
        await KnowledgeCache.setAnswer(
          sanitizedUserText,
          targetWorkspaceId,
          chatResponse.reply
        );
      }
      
      const responseTime = performance.now() - perfStart;
      
      // Create streaming response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(chatResponse.reply));
          controller.close();
        }
      });
      
      const response = new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'X-Knowledge-Source': chatResponse.knowledgeSource || 'none',
          'X-Used-Docs': chatResponse.usedDocs.toString(),
          'X-Fallback': chatResponse.fallback.toString(),
          'X-Response-Time': `${Math.round(responseTime)}ms`,
          'X-Workspace-ID': targetWorkspaceId,
          'X-Request-ID': reqId
        }
      });
      
      logger.info('Chat response generated successfully', {
        reqId,
        userId: tenant.userId,
        workspaceId: targetWorkspaceId,
        source: chatResponse.knowledgeSource,
        responseTime: Math.round(responseTime),
        messageLength: chatResponse.reply.length
      });
      
      return response;
      
    } catch (error) {
      logger.error('Secure chat handler error', {
        reqId,
        userId: tenant.userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      return NextResponse.json({
        error: 'Failed to process chat request',
        code: 'CHAT_PROCESSING_ERROR'
      }, { status: 500 });
    }
  },
  {
    rateLimitType: 'chat',
    validation: chatRequestSchema,
    allowedMethods: ['POST']
  }
);

// Helper functions

async function validateBotOwnership(botId: string, workspaceId: string): Promise<boolean> {
  try {
    // In this implementation, botId is typically the same as workspaceId
    // Add additional validation logic here if needed
    return botId === workspaceId || botId === 'demo';
  } catch (error) {
    logger.error('Bot ownership validation error', { botId, workspaceId, error });
    return false;
  }
}

async function validateWorkspaceAccess(userId: string, workspaceId: string): Promise<boolean> {
  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('workspace_id')
      .eq('id', userId)
      .eq('workspace_id', workspaceId)
      .single();
    
    return !!profile;
  } catch (error) {
    logger.error('Workspace access validation error', { userId, workspaceId, error });
    return false;
  }
}

function normalizeMessages(messages: any[]): Array<{role: 'user' | 'bot'; content: string}> {
  return messages.map(m => ({
    role: (m.role === 'bot' || m.role === 'assistant') ? 'bot' as const : 'user' as const,
    content: (m.content ?? m.text ?? '').toString().trim()
  })).filter(m => m.content.length > 0);
}

async function enforceConversationQuota(
  tenant: TenantContext,
  workspaceId: string
): Promise<{ allowed: boolean; error?: string; details?: string }> {
  try {
    const monthKey = currentMonthKey();
    const quota = getPlanQuota(tenant.subscriptionTier);
    
    if (!quota?.monthlyConversationCap) {
      return { allowed: true }; // No quota limit
    }
    
    const { data: usage } = await supabaseAdmin
      .from('usage_counters')
      .select('monthly_conversations')
      .eq('workspace_id', workspaceId)
      .eq('month', monthKey)
      .maybeSingle();
    
    const currentConversations = usage?.monthly_conversations || 0;
    
    if (currentConversations >= quota.monthlyConversationCap) {
      return {
        allowed: false,
        error: 'Monthly conversation limit reached',
        details: `Current plan allows ${quota.monthlyConversationCap} conversations per month. Upgrade for unlimited access.`
      };
    }
    
    // Increment counter (fire and forget)
    supabaseAdmin
      .from('usage_counters')
      .upsert({
        workspace_id: workspaceId,
        user_id: tenant.userId,
        month: monthKey,
        monthly_conversations: currentConversations + 1
      })
      .then(() => {
        logger.debug('Conversation quota incremented', { workspaceId, monthKey });
      });
    // Note: We ignore errors here to not block the chat flow
    
    return { allowed: true };
  } catch (error) {
    logger.error('Quota enforcement error', { workspaceId, error });
    return { allowed: true }; // Fail open for availability
  }
}

async function processChatRequest(
  context: ChatContext,
  reqId: string
): Promise<{
  reply: string;
  sources: any[];
  knowledgeSource: string | null;
  fallback: boolean;
  usedDocs: boolean;
}> {
  let reply = '';
  let sources: any[] = [];
  let knowledgeSource: string | null = null;
  let fallback = false;
  let usedDocs = false;
  
  try {
    // Phase 1: Knowledge Base lookup
    const kbMatch = findKnowledgeAnswer(context.userText);
    if (kbMatch) {
      reply = kbMatch.answer;
      knowledgeSource = 'kb';
      logger.debug('Knowledge base match found', { reqId, id: kbMatch.id });
    }
    
    // Phase 2: Document retrieval (only for non-demo workspaces)
    if (!kbMatch && !context.isDemo) {
      const { chunks, qualityHeuristicMet } = await retrieveWorkspaceChunks({
        workspaceId: context.workspaceId,
        query: context.userText
      });
      
      if (chunks.length && qualityHeuristicMet) {
        const docAnswer = await generateAnswerFromDocs({
          userMessage: context.userText,
          chunks
        });
        
        if (!docAnswer.indicatesNoAnswer && docAnswer.text.trim()) {
          reply = docAnswer.text.trim();
          sources = docAnswer.sources;
          usedDocs = true;
          knowledgeSource = 'docs';
          logger.debug('Document-based answer generated', { reqId, chunkCount: chunks.length });
        }
      }
    }
    
    // Phase 3: General AI fallback
    if (!reply) {
      fallback = true;
      knowledgeSource = 'general';
      
      reply = await getGeneralAnswer(context.userText, {
        mode: context.isDemo ? 'demo' : 'fallback',
        conversationWindow: context.conversationHistory
      });
      
      logger.debug('General AI fallback used', { reqId });
    }
    
    // Finalize response
    const finalReply = brandify(reply);
    const finalSources = sources.map(s => ({ 
      ...s, 
      snippet: safeSlice(s.snippet, 180) 
    }));
    
    return {
      reply: finalReply,
      sources: finalSources,
      knowledgeSource,
      fallback,
      usedDocs
    };
    
  } catch (error) {
    logger.error('Chat processing error', { reqId, error });
    
    return {
      reply: 'I apologize, but I\'m having trouble processing your request right now. Please try again in a moment.',
      sources: [],
      knowledgeSource: 'error',
      fallback: true,
      usedDocs: false
    };
  }
}

async function handleLeadDetection(
  context: ChatContext,
  tenant: TenantContext,
  reqId: string
): Promise<void> {
  try {
    const leadDetection = detectLead(context.userText);
    
    if (leadDetection) {
      const intentKeywords = extractIntentKeywords(context.userText);
      
      await persistLeadIfAny({
        origin: context.isDemo ? 'demo' : 'subscriber',
        workspaceId: context.workspaceId,
        sourceBotId: context.workspaceId,
        email: leadDetection.email,
        firstMessage: context.userText,
        lastMessage: context.userText,
        intentKeywords,
        intentPrompt: leadDetection.intentPrompt,
        conversation: []
      });
      
      logger.info('Lead detected and persisted', {
        reqId,
        workspaceId: context.workspaceId,
        email: leadDetection.email
      });
    }
  } catch (error) {
    logger.error('Lead detection error', { reqId, error });
    // Don't fail the chat request if lead detection fails
  }
}

function brandify(text: string): string {
  if (!text) return text;
  const host = (() => {
    try { 
      return new URL(BRAND.url).hostname; 
    } catch { 
      return 'trulybot.xyz'; 
    }
  })();
  
  return text
    .replace(/\bAnemo\b/g, BRAND.name)
    .replace(/anemo\.ai/gi, host);
}

function safeSlice(text: string, maxLength = 180): string {
  return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
}

// Export the secure handler
export const POST = secureChatHandler;
