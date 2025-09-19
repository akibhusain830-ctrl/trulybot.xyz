import { NextResponse } from "next/server";
import OpenAI from "openai";

// --- ADD: import your database client here (example shown for Supabase) ---
// import { createClient } from "@supabase/supabase-js";
// const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

// Minimal type for messages
type ChatCompletionMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

interface ChatMessage {
  role: "user" | "bot";
  text: string;
}

// --- ADD: helper to fetch user knowledge/FAQ from DB ---
// Replace this with your actual database logic.
// This mock just returns a sample FAQ for demonstration.
async function getUserKnowledge(userId: string): Promise<string> {
  // Example: Fetch from DB by userId, concatenate as context string
  // const { data, error } = await supabase
  //   .from("faqs")
  //   .select("question,answer")
  //   .eq("user_id", userId);
  // if (error || !data) return "";
  // return data.map((f: any) => `Q: ${f.question}\nA: ${f.answer}`).join("\n");

  // MOCK: Replace/remove this before going live
  return `Q: How do I buy?\nA: Click "Buy" on the product page.\nQ: What is your refund policy?\nA: Refunds within 7 days.`;
}

export async function GET() {
  return NextResponse.json({ ok: true, hasKey: Boolean(apiKey) });
}

export async function POST(req: Request) {
  try {
    // --- CHANGE: Parse userId or widgetToken from the request ---
    // You might get this from body, query, or headers. Adjust as per your actual frontend.
    const body: { messages?: ChatMessage[]; userId?: string; widgetToken?: string } = await req.json().catch(() => ({}));
    const { messages, userId = "", widgetToken } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 });
    }

    if (!openai) {
      return NextResponse.json({ error: "OPENAI_API_KEY not configured on the server" });
    }

    // --- CHANGE: Determine subscriber (userId) ---
    // If you use widgetToken, resolve it to userId here.
    // For now, just use userId directly.
    if (!userId) {
      return NextResponse.json({ error: "Missing user ID (subscriber context)" }, { status: 400 });
    }

    // --- FETCH: Get user's FAQ/knowledge base ---
    const userKnowledge = await getUserKnowledge(userId);

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const preparedMessages: ChatCompletionMessage[] = messages.map((msg) => ({
      role: msg.role === "bot" ? "assistant" : "user",
      content: msg.text,
    }));

    // --- CHANGE: Inject user knowledge into system prompt ---
    const systemPrompt = `You are Anemo, a helpful support assistant for an e-commerce business.
Use ONLY the following knowledge base to answer questions when possible (if not covered, answer politely and suggest contacting support):

${userKnowledge}
`;

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: systemPrompt,
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
    const message =
      err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
