export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';
import { Message as VercelChatMessage, StreamingTextResponse } from 'ai';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { Document } from 'langchain/document';
import { RunnableSequence } from '@langchain/core/runnables';
import { BytesOutputParser } from '@langchain/core/output_parsers';
import { getVectorStore } from '@/lib/vector-store';
import { getPineconeClient } from '@/lib/pinecone';
import { supabase } from '@/lib/supabaseClient';

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
        console.error('[chat:general-error]', e);
        reply = deterministicFallback();
      }
    }

    // Brandify final reply (swap legacy brand text -> Trulybot + your domain)
    reply = brandify(reply);

    // -------- Phase D: Lead Persistence --------
    const shouldPersistLead = !!leadDetection?.email || intentKeywords.length > 0 || leadDetection?.intentPrompt;
    let leadPersistResult: { created: boolean; id?: string } | null = null;

    // Prevent lead capture for demo bot
    if (shouldPersistLead && mode === 'subscriber') {
      const normalizedConv = messages.map(m => ({ role: m.role, text: m.content }));
      leadPersistResult = await persistLeadIfAny({
        origin: mode,
        workspaceId: botId,
        sourceBotId: botId,
        email: leadDetection?.email,
        firstMessage: normalizedConv[0]?.text || userText,
        lastMessage: userText,
        intentKeywords,
        intentPrompt: leadDetection?.intentPrompt,
        conversation: normalizedConv,
      });
      log('lead-persist', leadPersistResult);
    }
    const leadPrompt = !leadDetection?.email && leadDetection?.intentPrompt;

    // 5. Build response
    const payload = {
      reply,
      sources,
      usedDocs,
      leadPrompt,
      meta: {
        fallback,
        knowledgeSource,
      },
      debug: {
        tookMs: Date.now() - started,
      },
    };

    log('done', { ms: payload.debug.tookMs, knowledgeSource });
    return NextResponse.json(payload);

  } catch (err: any) {
    // This global catch ensures that any unexpected error still returns a valid JSON response
    return jsonError(err.message || 'An internal server error occurred.', 500);
  }
}

const combineDocumentsFn = (docs: Document[], separator = '\n\n') => {
  const serializedDocs = docs.map((doc) => doc.pageContent);
  return serializedDocs.join(separator);
};

const formatVercelMessages = (chatHistory: VercelChatMessage[]) => {
  const formattedDialogueTurns = chatHistory.map((message) => {
    if (message.role === 'user') {
      return `Human: ${message.content}`;
    } else if (message.role === 'assistant') {
      return `Assistant: ${message.content}`;
    } else {
      return `${message.role}: ${message.content}`;
    }
  });
  return formattedDialogueTurns.join('\n');
};

const CONDENSE_QUESTION_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question, in its original language.

<chat_history>
  {chat_history}
</chat_history>

Follow Up Input: {question}
Standalone question:`;
const condenseQuestionPrompt = PromptTemplate.fromTemplate(CONDENSE_QUESTION_TEMPLATE);

const ANSWER_TEMPLATE = `You are a helpful and enthusiastic support bot who can answer a given question based on the context provided. Try to find the answer in the context. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." And direct the user to a human agent. Don't try to make up an answer. Always speak as if you were chatting to a friend.

<context>
  {context}
</context>

Question: {question}
`;
const answerPrompt = PromptTemplate.fromTemplate(ANSWER_TEMPLATE);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages ?? [];
    const streamed = body.stream;
    const botId = body.botId ?? 'demo';

    if (!messages || messages.length === 0) {
      return new NextResponse('No messages in the request', { status: 400 });
    }

    const pinecone = await getPineconeClient();
    const vectorStore = await getVectorStore(pinecone, botId);

    const llm = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0.2,
    });

    const standaloneQuestionChain = RunnableSequence.from([
      {
        question: (input: { question: string; chat_history: string }) => input.question,
        chat_history: (input: { question: string; chat_history: string }) =>
          formatVercelMessages(messages.slice(0, -1)),
      },
      condenseQuestionPrompt,
      llm,
      new BytesOutputParser(),
    ]);

    const retriever = vectorStore.asRetriever();
    const lastMessage = messages[messages.length - 1].content;

    const sourceDocuments = await retriever.getRelevantDocuments(lastMessage);
    const docs = combineDocumentsFn(sourceDocuments);

    const metadata = {
      usedDocs: sourceDocuments && sourceDocuments.length > 0,
      sources: sourceDocuments,
    };

    const answerChain = RunnableSequence.from([
      {
        context: (input: { context: string, question: string }) => input.context,
        question: (input: { context: string, question: string }) => input.question,
      },
      answerPrompt,
      llm,
    ]);

    const conversationalRetrievalQAChain = RunnableSequence.from([
      {
        question: standaloneQuestionChain,
        context: () => docs,
      },
      answerChain,
      new BytesOutputParser(),
    ]);

    if (!streamed) {
      const result = await conversationalRetrievalQAChain.invoke({
        question: lastMessage,
        chat_history: formatVercelMessages(messages.slice(0, -1)),
      });
      return NextResponse.json({
        text: new TextDecoder().decode(result),
        ...metadata,
      });
    }

    const stream = await conversationalRetrievalQAChain.stream({
      question: lastMessage,
      chat_history: formatVercelMessages(messages.slice(0, -1)),
    });

    const transformStream = new TransformStream({
      start(controller) {
        const metaChunk = JSON.stringify(metadata);
        const endOfMetaMarker = '___END_OF_META___';
        controller.enqueue(new TextEncoder().encode(metaChunk + endOfMetaMarker));
      },
      transform(chunk, controller) {
        controller.enqueue(chunk);
      },
    });

    return new StreamingTextResponse(stream.pipeThrough(transformStream));

  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}