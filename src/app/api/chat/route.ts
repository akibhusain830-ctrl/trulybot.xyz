// File: src/app/api/chat/route.ts
import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

// The GET function remains the same
export async function GET() {
  return NextResponse.json({ ok: true, hasKey: Boolean(apiKey) });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));
    
    // CHANGED: We now expect a `messages` array instead of a `prompt` string.
    const { messages } = body;

    // CHANGED: The validation now checks for the `messages` array.
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    if (!openai) {
      return NextResponse.json({ error: 'OPENAI_API_KEY not configured on the server' });
    }

    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    // CHANGED: We now format the incoming message history for the OpenAI API.
    const preparedMessages = messages.map(msg => ({
      // The OpenAI API expects the role "assistant" for bot replies.
      role: msg.role === 'bot' ? 'assistant' : 'user', 
      // The OpenAI API expects the key "content" instead of "text".
      content: msg.text 
    }));


    const completion = await openai.chat.completions.create({
      model,
      // CHANGED: We pass the full conversation history to the AI.
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
  } catch (err: any) {
    console.error('API /chat error:', err);
    const message = err?.message || 'Unexpected server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}