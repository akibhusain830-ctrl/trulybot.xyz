import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { CoreMessage as VercelChatMessage } from "ai";
import { PromptTemplate } from "@langchain/core/prompts";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
import { BytesOutputParser } from "@langchain/core/output_parsers";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";
import { cache, KnowledgeCache } from "@/lib/cache/manager";
import { performanceMonitor } from "@/lib/performance/optimization";

// All imports from your lib directory
import { findKnowledgeAnswer } from "@/lib/productKnowledge";
import { retrieveWorkspaceChunks } from "@/lib/retrieval";
import { generateAnswerFromDocs } from "@/lib/retrievalAnswer";
import { getGeneralAnswer } from "@/lib/generalAnswer";
import { detectLead } from "@/lib/lead";
import { extractIntentKeywords, persistLeadIfAny } from "@/lib/leadStore";
import { BRAND } from "@/lib/branding";
import { getPlanQuota, currentMonthKey } from "@/lib/constants/quotas";
import { createClient } from "@supabase/supabase-js";
import {
  findCustomerKnowledgeAnswer,
  createCustomerFallback,
  ECOMMERCE_FAQ_TEMPLATES,
  DEFAULT_BUSINESS_INFO,
  type BusinessInfo,
} from "@/lib/customerKnowledge";
// Temporarily disabled: import { conversationAI } from '@/lib/conversationIntelligence';

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
  role: "user" | "bot";
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
  console.error("[chat:error]", { error, status });
  // This function ensures a valid JSON response is always sent on error
  return NextResponse.json({ error }, { status });
}

function normalizeMessages(raw: IncomingMsg[]): NormalizedMsg[] {
  return raw.map((m) => ({
    role: m.role === "bot" ? "bot" : "user",
    content: (m.content ?? m.text ?? "").toString(),
  }));
}

function safeSlice(t: string, n = 180) {
  return t.length > n ? t.slice(0, n) + "…" : t;
}

function deterministicFallback(mode?: "demo" | "subscriber") {
  if (mode === "demo") {
    return "I can help answer questions about TrulyBot and our AI chatbot platform. How can I assist you today?";
  } else if (mode === "subscriber") {
    return "I'm here to help! While I don't have specific information about that topic, please feel free to contact our team directly or check our website for the most current details. Is there anything else I can assist you with?";
  }
  return "I can help answer questions about our products and services. How can I assist you today?";
}

// Replace any lingering old brand text in final output
function brandify(text: string) {
  if (!text) return text;
  const host = (() => {
    try {
      return new URL(BRAND.url).hostname;
    } catch {
      return "trulybot.xyz";
    }
  })();
  return text.replace(/\bAnemo\b/g, BRAND.name).replace(/anemo\.ai/gi, host);
}

// ---------------- Handler ----------------
export async function POST(req: NextRequest) {
  const started = Date.now();
  const requestId = randomUUID();

  try {
    // Performance monitoring
    const perfStart = performance.now();

    // 1. Parse with caching consideration
    let body: ChatBody;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON body");
    }

    // Generate cache key for repeated queries
    const cacheKey = `chat:${JSON.stringify({
      botId: body.botId,
      query:
        body.messages?.slice(-1)[0]?.content ||
        body.messages?.slice(-1)[0]?.text,
    })}`;

    // Try cache first for repeated queries
    const cachedResponse = await KnowledgeCache.getAnswer(
      body.messages?.slice(-1)[0]?.content ||
        body.messages?.slice(-1)[0]?.text ||
        "",
      body.botId || "default",
    );

    if (cachedResponse) {
      const responseTime = performance.now() - perfStart;
      return NextResponse.json({
        success: true,
        message: cachedResponse,
        cached: true,
        responseTime: Math.round(responseTime),
      });
    }

    const { botId, messages: raw } = body || {};
    if (!botId) return jsonError("botId is required");
    if (!raw || !Array.isArray(raw) || raw.length === 0) {
      return jsonError("messages array required");
    }

    const mode: "demo" | "subscriber" =
      botId === "demo" ? "demo" : "subscriber";
    const messages = normalizeMessages(raw);
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return jsonError("No user message found");
    const userText = lastUser.content.trim();
    if (!userText) return jsonError("Empty user message");

    log("start", {
      botId,
      mode,
      msgLen: messages.length,
      userText: safeSlice(userText),
      requestId,
    });

    // Conversation quota enforcement (only for subscriber bots)
    if (mode === "subscriber") {
      try {
        const supabaseAdmin = createSupabaseAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false } },
        );

        // Get workspace (botId acts as workspace_id here)
        const workspaceId = botId;
        const monthKey = currentMonthKey();
        // Fetch subscription tier from any profile in workspace (simplest heuristic)
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("subscription_tier")
          .eq("workspace_id", workspaceId)
          .limit(1)
          .maybeSingle();

        const tier = profile?.subscription_tier || "basic";
        const quota = getPlanQuota(tier);
        {
          const { data: usage } = await supabaseAdmin
            .from("usage_counters")
            .select("id, monthly_conversations")
            .eq("workspace_id", workspaceId)
            .eq("month", monthKey)
            .maybeSingle();

          const convs = usage?.monthly_conversations || 0;
          if (quota?.monthlyConversationCap && convs + 1 > quota.monthlyConversationCap) {
            return jsonError(
              "Conversation limit reached for plan. Upgrade to Pro for unlimited.",
              429,
            );
          }
          // Increment afterwards (fire and forget)
          const updates = {
            monthly_conversations: convs + 1,
            workspace_id: workspaceId,
            user_id: null,
            month: monthKey,
          } as any;
          if (usage?.id) {
            await supabaseAdmin
              .from("usage_counters")
              .update(updates)
              .eq("id", usage.id);
          } else {
            await supabaseAdmin.from("usage_counters").insert(updates);
          }
        }
      } catch (quotaErr) {
        console.error("[chat:quota-check-error]", quotaErr);
        // Continue silently; do not block chat if quota check fails unexpectedly.
      }
    }

    // 2. Conversation window (for style continuity in fallback)
    const conversationWindow = messages
      .slice(-8)
      .map((m) => `${m.role === "bot" ? "assistant" : m.role}: ${m.content}`)
      .join("\n");

    // 3. Lead / intent signals (before orchestration)
    const leadDetection = detectLead(userText);
    const intentKeywords = extractIntentKeywords(userText);

    // 4. Conversation Intelligence Analysis - TEMPORARILY DISABLED
    // const conversationContext = await conversationAI.analyzeContext(userText, messages);
    // log('conversation-context', conversationContext);

    // 4.1. Generate contextual welcome for new conversations - TEMPORARILY DISABLED
    /* const isFirstMessage = messages.length <= 1;
    if (isFirstMessage && conversationContext.conversation_stage === 'opening') {
      const contextualWelcome = await conversationAI.generateContextualWelcome(
        conversationContext.page_context || 'home',
        false
      );
      
      // If this looks like a greeting or first interaction, use contextual welcome
      if (/^(hi|hello|hey|good|greetings|start|help)/i.test(userText.trim())) {
        return new Response(
          JSON.stringify({ 
            response: contextualWelcome,
            isWelcome: true,
            context: conversationContext
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              'x-knowledge-source': 'welcome',
              'x-used-docs': 'false',
              'x-fallback': 'false',
              'x-response-time': `${Date.now() - started}ms`
            }
          }
        );
      }
    } */

    // 4. Orchestration state
    let reply = "";
    let sources: Source[] = [];
    let knowledgeSource: "kb" | "customer-kb" | "docs" | "general" | null =
      null;
    let fallback = false;
    let usedDocs = false;

    // -------- Phase A: Knowledge Base (always first) --------
    const kbMatch = findKnowledgeAnswer(userText);
    if (kbMatch) {
      reply = kbMatch.answer;
      knowledgeSource = "kb";
      log("kb-hit", { id: kbMatch.id, score: kbMatch.score });
    }

    // -------- Phase A.5: Customer Knowledge Base (for subscriber bots) --------
    if (!kbMatch && mode === "subscriber") {
      // For now, use template FAQs with default business info
      // In production, this would fetch from customer's database
      const defaultBusinessInfo: BusinessInfo = {
        ...DEFAULT_BUSINESS_INFO,
        businessName: "Your Business",
        website: "your-website.com",
        supportEmail: "support@your-business.com",
        businessHours: "9 AM - 6 PM (Monday - Friday)",
      };

      const customerMatch = findCustomerKnowledgeAnswer(
        userText,
        ECOMMERCE_FAQ_TEMPLATES,
        defaultBusinessInfo,
      );

      if (customerMatch) {
        reply = customerMatch.answer;
        knowledgeSource = "customer-kb";
        log("customer-kb-hit", {
          id: customerMatch.entry.id,
          score: customerMatch.score,
        });
      }
    }

    // -------- Phase B: Retrieval (subscriber only & only if no KB) --------
    if (!kbMatch && mode === "subscriber") {
      const { chunks, qualityHeuristicMet } = await retrieveWorkspaceChunks({
        workspaceId: botId,
        query: userText,
      });

      if (chunks.length && qualityHeuristicMet) {
        const docAns = await generateAnswerFromDocs({
          userMessage: userText,
          chunks,
        });

        if (!docAns.indicatesNoAnswer && docAns.text.trim()) {
          reply = docAns.text.trim();
          sources = docAns.sources;
          usedDocs = true;
          knowledgeSource = "docs";
        }
      }
    }

    // -------- Phase C: General Fallback --------
    if (!reply) {
      fallback = true;
      knowledgeSource = "general";
      try {
        if (mode === "subscriber") {
          // Use customer-friendly fallback for subscriber bots
          const defaultBusinessInfo: BusinessInfo = {
            ...DEFAULT_BUSINESS_INFO,
            businessName: "our business",
            website: "our website",
            supportEmail: "our support team",
          };
          reply = createCustomerFallback(defaultBusinessInfo);
        } else {
          // Use regular general answer for demo mode
          reply = await getGeneralAnswer(userText, {
            mode: mode === "demo" ? "demo" : "customer",
            conversationWindow,
          });
        }
      } catch (e) {
        console.error("[chat:error]", e);
        reply = deterministicFallback(mode);
      }
    }

    // 5. Finalize
    let finalReply = brandify(reply);

    // 5.1. Enhance response with conversation intelligence - TEMPORARILY DISABLED
    // const engagementResponse = await conversationAI.generateEngagingResponse(
    //   finalReply,
    //   conversationContext,
    //   `Mode: ${mode}, UserMessage: ${userText}, Lead: ${leadDetection?.email || leadDetection?.phone ? 'detected' : 'none'}`
    // );

    // Extract the enhanced response text - TEMPORARILY DISABLED
    // finalReply = engagementResponse.response;
    const finalSources = sources.map((s) => ({
      ...s,
      snippet: safeSlice(s.snippet),
    }));

    // 5.5. Parse buttons from response text
    const buttons: Array<{ text: string; url: string; type: "primary" | "secondary" }> = [];

    // Define button patterns with their URLs
    const buttonPatterns = [
      // Primary CTAs
      { pattern: "[Start Free Trial]", text: "Start Free Trial", url: "/start-trial", type: "primary" as const },
      { pattern: "[Start Free Plan]", text: "Start Free Plan", url: "/start-trial", type: "primary" as const },
      
      // Pricing & Plans
      { pattern: "[View Pricing]", text: "View Pricing", url: "/#pricing", type: "secondary" as const },
      { pattern: "[View All Plans]", text: "View All Plans", url: "/#pricing", type: "secondary" as const },
      
      // Features & Demo
      { pattern: "[Features]", text: "View Features", url: "/#features", type: "secondary" as const },
      { pattern: "[See Features]", text: "See Features", url: "/#features", type: "secondary" as const },
      { pattern: "[See Live Demo]", text: "See Live Demo", url: "/#demo-section", type: "secondary" as const },
      { pattern: "[See Demo]", text: "See Demo", url: "/#demo-section", type: "secondary" as const },
      { pattern: "[View Demo]", text: "View Demo", url: "/#demo-section", type: "secondary" as const },
      { pattern: "[Try Widget]", text: "Try Widget", url: "/#demo-section", type: "secondary" as const },
      { pattern: "[Learn More]", text: "Learn More", url: "/ai-chatbot-for-ecommerce", type: "secondary" as const },
      
      // Setup & Integration
      { pattern: "[WooCommerce Setup]", text: "WooCommerce Setup", url: "/docs/woocommerce-setup", type: "secondary" as const },
      { pattern: "[Shopify Setup]", text: "Shopify Setup", url: "/docs/shopify-setup", type: "secondary" as const },
      { pattern: "[General Instructions]", text: "General Instructions", url: "/docs/getting-started", type: "secondary" as const },
      { pattern: "[Download Plugin]", text: "Download Plugin", url: "/dashboard", type: "secondary" as const },
      { pattern: "[Setup Guide]", text: "Setup Guide", url: "/docs/getting-started", type: "secondary" as const },
      
      // Dashboard & Account
      { pattern: "[Dashboard]", text: "Go to Dashboard", url: "/dashboard", type: "secondary" as const },
      { pattern: "[Custom Training]", text: "Custom Training", url: "/dashboard", type: "secondary" as const },
      
      // Support & Contact
      { pattern: "[Contact Sales]", text: "Contact Sales", url: "/contact", type: "secondary" as const },
      { pattern: "[Contact Support]", text: "Contact Support", url: "/contact", type: "secondary" as const },
      
      // Advanced Features
      { pattern: "[Upgrade Your Plan]", text: "Upgrade Your Plan", url: "/#pricing", type: "primary" as const },
      { pattern: "[Upgrade to Ultra]", text: "Upgrade Your Plan", url: "/#pricing", type: "primary" as const },
      { pattern: "[API Documentation]", text: "API Documentation", url: "/docs/api", type: "secondary" as const },
      { pattern: "[Language Demo]", text: "Language Demo", url: "/#demo-section", type: "secondary" as const },
      { pattern: "[View Mobile Demo]", text: "View Mobile Demo", url: "/#demo-section", type: "secondary" as const },
      
      // Legal & Policy
      { pattern: "[Full Privacy Policy]", text: "Privacy Policy", url: "/privacy", type: "secondary" as const },
      { pattern: "[Full Terms]", text: "Terms of Service", url: "/terms", type: "secondary" as const },
      { pattern: "[Legal Questions]", text: "Legal Questions", url: "/contact", type: "secondary" as const },
    ];

    // Parse all button patterns
    const origin = (() => {
      try {
        return new URL(BRAND.url).origin;
      } catch {
        return "https://trulybot.xyz";
      }
    })();
    for (const { pattern, text, url, type } of buttonPatterns) {
      if (finalReply.includes(pattern)) {
        const safeUrl = url.startsWith("/") ? url : new URL(url, origin).toString();
        buttons.push({ text, url: safeUrl, type });
        finalReply = finalReply.replace(new RegExp(`\\s*→?\\s*\\${pattern.replace(/[[\]]/g, "\\$&")}`, "g"), "");
      }
    }

    // Clean up any remaining arrows at the end
    finalReply = finalReply.replace(/\s*→\s*$/, "").trim();

    // Create metadata object
    const metadata = {
      sources: finalSources,
      usedDocs,
      buttons: buttons.length > 0 ? buttons : undefined,
      // Engagement features temporarily disabled
      // followUpQuestions: engagementResponse.follow_up_questions,
      // suggestedTopics: engagementResponse.suggested_topics,
      // engagementHooks: engagementResponse.engagement_hooks,
      meta: {
        fallback,
        knowledgeSource,
        // conversationTone: engagementResponse.tone,
        // conversationContext
      },
    };

    // 6. Lead persistence (if any)
    if (leadDetection) {
      await persistLeadIfAny({
        origin: mode,
        workspaceId: botId,
        sourceBotId: botId,
        email: leadDetection.email,
        phone: leadDetection.phone,
        firstMessage: userText,
        lastMessage: userText,
        intentKeywords,
        intentPrompt: leadDetection.intentPrompt,
        followUpRequest: leadDetection.followUpRequest,
        conversation: [], // Optionally pass recent messages here
      });
    }

    // 7. Response (streaming-like using native Response)
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(finalReply));

        // Send metadata after content if we have buttons
        if (buttons.length > 0) {
          // Add an extra newline for clarity in the output
          controller.enqueue(
            encoder.encode(`\n\n__BUTTONS__${JSON.stringify(buttons)}`),
          );
        }

        controller.close();
      },
    });

    const response = new Response(stream, {
      headers: {
        "x-knowledge-source": knowledgeSource || "none",
        "x-used-docs": usedDocs.toString(),
        "x-fallback": fallback.toString(),
        "x-response-time": `${Date.now() - started}ms`,
        "x-request-id": requestId,
      },
    });

    log("end", {
      source: knowledgeSource,
      fallback,
      usedDocs,
      responseTime: `${Date.now() - started}ms`,
      msgLen: finalReply.length,
      requestId,
    });

    return response;
  } catch (error) {
    console.error("[chat:unhandled]", error);
    return jsonError("Internal server error", 500);
  }
}
