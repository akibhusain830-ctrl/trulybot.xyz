// src/app/api/chat/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

// NEW: Define a type for the incoming messages
interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
}

export async function GET() {
  return NextResponse.json({ ok: true, hasKey: Boolean(apiKey) });
}

export async function POST(req: Request) {
  try {
    // FIXED: Define a type for the expected request body
    const body: { messages?: ChatMessage[] } = await req.json().catch(() => ({}));
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    if (!openai) {
      return NextResponse.json({ error: 'OPENAI_API_KEY not configured on the server' });
    }

    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const preparedMessages = messages.map(msg => ({
      role: msg.role === 'bot' ? 'assistant' : 'user',
      content: msg.text
    }));

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: 'You are Anemo, a helpful support assistant for e-commerce.' },
        ...preparedMessages
      ],
      temperature: 0.2,
      max_tokens: 800
    });

    const reply = completion?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return NextResponse.json({ error: 'Model returned an empty response' }, { status: 502 });
    }

    return NextResponse.json({ reply });
  } catch (err: unknown) { // FIXED: Use 'unknown' for better type safety
    console.error('API /chat error:', err);
    const message = err instanceof Error ? err.message : 'Unexpected server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}