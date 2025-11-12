import OpenAI from "openai";
import { PRODUCT_PROFILE } from "./productProfile";
import { config } from "./config/secrets";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const HALLUCINATION_KEYWORDS = [
  "project management",
  "kanban",
  "sprints",
  "sprint planning",
  "gantt",
  "scrum board",
  "task tracking",
  "issue tracking",
];

interface GeneralAnswerOptions {
  mode: "demo" | "fallback" | "customer";
  conversationWindow?: string;
  customerContext?: {
    businessType?: string;
    industry?: string;
    knowledgeBase?: string[];
  };
}

export async function getGeneralAnswer(
  userMessage: string,
  opts: GeneralAnswerOptions,
) {
  const profile = PRODUCT_PROFILE;

  const productFacts = `
[PRODUCT_PROFILE]
Name: ${profile.name}
Tagline: ${profile.tagline}

Positioning:
- ${profile.positioning.join("\n- ")}

Core Features (authoritative):
- ${profile.coreFeatures.join("\n- ")}

Benefits:
- ${profile.benefits.join("\n- ")}

Pricing Summary (do not invent unlisted tiers):
- ${profile.pricingSummary.join("\n- ")}

Disallowed / Out-of-Scope Claims:
- ${profile.disallowedClaims.join("\n- ")}

Tone/Style Constraints:
- Max ~${profile.styleGuidelines.maxWords} words unless deeply clarifying
- Tone: ${profile.styleGuidelines.tone}
- Avoid: ${profile.styleGuidelines.avoid.join(", ")}
[END_PRODUCT_PROFILE]
`.trim();

  const modeNote =
    opts.mode === "demo"
      ? "User is interacting with the public demo bot. Never imply access to private customer documents. If asked about private data, state the demo bot only has general product knowledge."
      : opts.mode === "customer"
        ? "This is a customer's embedded bot. Provide helpful, professional responses. If you don't have specific business information, guide them to contact the business directly or check their website."
        : "Subscriber fallback: No matching customer documents. Provide general, truthful product info grounded ONLY in the PRODUCT_PROFILE.";

  const safetyDirectives = `
RESPONSE POLICY:
1. Base every claim strictly on PRODUCT_PROFILE${opts.mode === "customer" ? " or provided customer context" : ""}.
2. If user asks for an unlisted feature, say it's not currently offered and pivot to real capabilities.
3. Do NOT invent roadmap items unless present.
4. If user goes off-topic, gently steer back.
5. ${opts.mode === "customer" ? "For customer bots: provide helpful business guidance and direct to contact info when needed." : "Avoid describing TrulyBot as project/task management."}
6. Stay within ~${profile.styleGuidelines.maxWords} words unless multi-part clarification needed.
7. Prefer concise paragraphs or bullets.
${opts.mode === "customer" ? '8. For business questions without specific info: "I\'d recommend checking our website or contacting our team directly for the most current information."' : ""}
`.trim();

  const systemPrompt = `
You are the canonical product knowledge assistant for TrulyBot.

${modeNote}

Use the canonical facts below without deviation.
${productFacts}

${safetyDirectives}

THINKING FORMAT (do not output thinking):
1. Classify intent
2. Select ONLY relevant facts
3. Plan concise structured answer
4. Output final answer

Output only the final user-facing answer.
`.trim();

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
  ];

  if (opts.conversationWindow) {
    messages.push({
      role: "system",
      content: `Recent conversation context (for continuity only):\n${opts.conversationWindow}`,
    });
  }

  messages.push({ role: "user", content: userMessage });

  const completion = await client.chat.completions.create({
    model: config.openai.chatModel,
    temperature: 0.3,
    max_tokens: 450,
    messages,
  });

  let answer =
    completion.choices[0]?.message?.content?.trim() ||
    "I’m here to help with TrulyBot.";

  const lower = answer.toLowerCase();
  if (HALLUCINATION_KEYWORDS.some((k) => lower.includes(k))) {
    answer +=
      "\n\n(Note: Correction — TrulyBot is not a project/task management platform; it's an AI e‑commerce chatbot.)";
  }

  return answer;
}
