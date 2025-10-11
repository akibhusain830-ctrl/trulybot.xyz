import { createClient } from "@supabase/supabase-js";
import { logger } from "@/lib/logger";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceKey) {
  logger.warn("[leadStore] Missing Supabase env vars");
}

// Server-only admin client
const adminClient = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

export type PersistLeadParams = {
  origin: "demo" | "subscriber";
  workspaceId: string | null;
  sourceBotId: string;
  email?: string;
  phone?: string;
  name?: string;
  company?: string;
  firstMessage: string;
  lastMessage?: string;
  intentKeywords: string[];
  intentPrompt?: boolean;
  followUpRequest?: boolean;
  conversation?: Array<{ role: string; text: string }>;
};

export async function persistLeadIfAny(
  params: PersistLeadParams,
): Promise<{ created: boolean; id?: string }> {
  // Enhanced conditions for lead capture
  if (
    !params.email &&
    !params.phone &&
    !params.intentKeywords.length &&
    !params.intentPrompt &&
    !params.followUpRequest
  ) {
    return { created: false };
  }

  // Ensure workspace isolation - leads must be tied to specific workspace
  if (!params.workspaceId || params.workspaceId === "demo") {
    logger.warn("[leadStore] Invalid workspaceId for lead capture", {
      workspaceId: params.workspaceId,
    });
    return { created: false };
  }

  let name = params.name;
  let company = params.company;
  if (!name || !company) {
    const derived = deriveNameCompanyFromConversation(
      params.conversation || [],
    );
    name = name || derived.name;
    company = company || derived.company;
  }

  const conversation_json = params.conversation
    ? truncateConversation(params.conversation, 4000)
    : null;

  // Check for existing lead by email or phone to avoid duplicates within the same workspace
  if (params.email || params.phone) {
    let existingQuery = adminClient
      .from("leads")
      .select("id,status,email,phone")
      .eq("workspace_id", params.workspaceId)
      .eq("source_bot_id", params.sourceBotId);

    if (params.email) {
      existingQuery = existingQuery.eq("email", params.email);
    } else if (params.phone) {
      existingQuery = existingQuery.eq("phone", params.phone);
    }

    const { data: existing, error: selErr } = await existingQuery
      .limit(1)
      .maybeSingle();

    if (selErr) logger.error("[leadStore] select existing error", selErr);

    if (existing) {
      const { error: updErr } = await adminClient
        .from("leads")
        .update({
          last_message: params.lastMessage,
          conversation_json,
          intent_keywords: params.intentKeywords,
          updated_at: new Date().toISOString(),
          status: existing.status === "incomplete" ? "new" : existing.status,
          name,
          company,
          phone: params.phone ?? existing.phone,
          meta: {
            intentPrompt: params.intentPrompt,
            followUpRequest: params.followUpRequest,
          },
        })
        .eq("id", existing.id);

      if (updErr) logger.error("[leadStore] update existing error", updErr);
      return { created: false, id: existing.id };
    }
  }

  const status = params.email || params.phone ? "new" : "incomplete";

  const { data, error } = await adminClient
    .from("leads")
    .insert({
      workspace_id: params.workspaceId,
      source_bot_id: params.sourceBotId,
      email: params.email ?? null,
      phone: params.phone ?? null,
      name: name ?? null,
      company: company ?? null,
      first_message: params.firstMessage,
      last_message: params.lastMessage ?? params.firstMessage,
      conversation_json,
      intent_keywords: params.intentKeywords,
      status,
      origin: params.origin,
      meta: {
        intentPrompt: params.intentPrompt,
        followUpRequest: params.followUpRequest,
      },
    })
    .select("id")
    .single();

  if (error) {
    logger.error("[leadStore] insert error", error);
    return { created: false };
  }
  return { created: true, id: data?.id };
}

function truncateConversation(
  conv: Array<{ role: string; text: string }>,
  maxChars: number,
) {
  let total = 0;
  const trimmed: typeof conv = [];
  for (const m of conv.slice(-12)) {
    if (total + m.text.length > maxChars) break;
    trimmed.push(m);
    total += m.text.length;
  }
  return trimmed;
}

function deriveNameCompanyFromConversation(
  conv: Array<{ role: string; text: string }>,
) {
  const userTexts = conv
    .filter((c) => c.role === "user")
    .map((c) => c.text)
    .join("\n");
  let name: string | undefined;
  let company: string | undefined;

  const nameMatch = userTexts.match(
    /\b(?:my\s+name\s+is|i'm|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/i,
  );
  if (nameMatch) name = nameMatch[1].trim();

  const companyMatch = userTexts.match(
    /\b(?:at|from)\s+([A-Z][A-Za-z0-9&\-\s]{2,40})(?:[.,\n]|$)/,
  );
  if (companyMatch) {
    const raw = companyMatch[1].trim();
    if (!/\b(pricing|price|plan|support|billing|cost|help)\b/i.test(raw))
      company = raw;
  }

  return { name, company };
}

export function extractIntentKeywords(text: string): string[] {
  if (!text) return [];
  const KW = [
    "pricing",
    "price",
    "plan",
    "plans",
    "buy",
    "purchase",
    "trial",
    "subscribe",
    "integration",
    "support",
    "cost",
    "charge",
    "billing",
    "quote",
    "demo",
  ];
  const lower = text.toLowerCase();
  return KW.filter((k) => lower.includes(k)).slice(0, 8);
}
