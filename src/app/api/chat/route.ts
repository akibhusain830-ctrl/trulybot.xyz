// src/app/api/chat/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

// Type for incoming chat messages
interface ChatMessage {
  role: "user" | "bot";
  text: string;
}

// GET: simple health check
export async function GET() {
  return NextResponse.json({ ok: true, hasKey: Boolean(apiKey) });
}

// POST: handle chat requests
export async function POST(req: Request) {
  try {
    // Parse request body safely
    const body: { messages?: ChatMessage[] } = await req.json().catch(() => ({}));
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 });
    }

    if (!openai) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY not configured on the server" },
        { status: 500 }
      );
    }

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    // Convert messages to OpenAI API format
    const preparedMessages = messages.map((msg) => ({
      role: msg.role === "bot" ? "assistant" : "user",
      content: msg.text,
    }));

    // Call OpenAI Chat API
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are Anemo, a helpful support assistant for e-commerce.",
        },
        ...preparedMessages,
      ],
      temperature: 0.2,
      max_tokens: 800,
    });

    const reply = completion?.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      return NextResponse.json(
        { error: "Model returned an empty response" },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    console.error("API /chat error:", err);
    const message = err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
