import { PRICING_TIERS } from './constants/pricing';

export const KNOWLEDGE_VERSION = '2025-09-21-1';

export interface KnowledgeEntry {
  readonly id: string;
  readonly category?: string;
  readonly tags?: readonly string[];
  readonly questionPatterns?: readonly string[];
  readonly keywords?: readonly string[];
  readonly answer: string;
  readonly short?: string;
  readonly priority?: number;
  readonly disclaimers?: readonly string[];
}

export interface MatchResult {
  readonly id: string;
  readonly answer: string;
  readonly directPattern: boolean;
  readonly score: number;
  readonly truncated: boolean;
}

const MAX_ANSWER_LENGTH = 1400;
const FUZZY_THRESHOLD = 0.33;
const MIN_KEYWORD_HITS = 2;
const BASE_PRIORITY = 1;
const DIRECT_HIT_SCORE = 1.0;
const FUZZY_BASE_SCORE = 0.5;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}
function uniq<T>(arr: readonly T[]): T[] {
  return Array.from(new Set(arr));
}

const KNOWLEDGE_BASE: readonly KnowledgeEntry[] = [
  {
    id: 'what-is-trulybot',
    category: 'overview',
    tags: ['overview', 'about'],
    questionPatterns: [
      '^(what\\s+is\\s+trulybot\\??)',
      '^(tell\\s+me\\s+about\\s+trulybot)',
      '^(trulybot\\s*\\?)'
    ],
    keywords: ['what', 'trulybot', 'platform', 'ai', 'support', 'ecommerce', 'india'],
    answer: `Trulybot is a focused AI customer support & pre-sales assistant for Indian e-commerce and scaling digital brands. It helps answer FAQs, reduce repetitive agent load, capture soft leads (without spamming), and deliver accurate, context-grounded responses from your own knowledge.

Key pillars:
- Rapid setup (minutes, not weeks)
- Deterministic knowledge answers before AI creativity
- Localized pricing for India
- Soft, trust-first email capture
- Roadmap: deeper integrations (Slack, CRM, docs ingestion)

Goal: push high CSAT and reduced handling cost while staying privacy-conscious. Want details on setup or pricing next?`,
    short: 'AI support & pre-sales assistant for Indian e-commerce; fast setup & deterministic answers.',
    priority: 4
  },
  {
    id: 'core-values',
    category: 'values',
    keywords: ['values', 'principles', 'philosophy', 'mission'],
    questionPatterns: ['values', 'core\\s+values'],
    answer: `Core Values:
1. Speed to Deploy – usable in minutes, not long onboarding.
2. Accuracy & Relevance – deterministic knowledge grounding first.
3. Cost Efficiency – reduce repetitive agent interactions.
4. Customer Empathy – respectful, non-pushy experience.
5. Privacy by Design – minimal data, user consent boundaries.
6. Continuous Improvement – iteration with real usage signals.
7. India-First Focus – localized pricing & market context.

Want to dive into any one of these?`,
    short: 'Speed, Accuracy, Cost Efficiency, Empathy, Privacy, Iteration, India-First.'
  },
  {
    id: 'setup-speed',
    category: 'onboarding',
    keywords: ['setup', 'deploy', 'time', 'install', 'start'],
    questionPatterns: ['how\\s+long\\s+.*setup', 'setup\\s+time', 'deployment\\s+time'],
    answer: `Setup Flow (Minutes):
1. Provide your site / FAQ or policy links.
2. (Optional) Paste structured FAQ entries.
3. Generate + copy the lightweight embed script.
4. Paste before </head> in your storefront or Next.js layout.
5. Chat widget appears; start internal QA then go live.

No deep engineering dependency for a basic launch. Want the embed snippet overview?`,
    short: 'Provide content, copy script, paste before </head>, test. Launch in minutes.'
  },
  {
    id: 'ingest-content',
    category: 'knowledge',
    keywords: ['ingest', 'content', 'faqs', 'policies', 'sources', 'import'],
    questionPatterns: ['(ingest|import)\\s+(content|data)'],
    answer: `Current Supported Ingestion:
- FAQs (structured Q/A)
- Policy pages (shipping, returns, warranty, etc.)
- A main site URL (light parsing / extraction)

Roadmap (clearly labeled):
- Rich docs / knowledge portals
- Notion space import
- PDF parsing pipeline
- Automated sitemap expansion
- Webhooks for incremental refresh

Want to hear about the training process?`,
    short: 'Supports FAQs, policy pages, site URL. Roadmap: docs, Notion, PDFs, automation.'
  },
  {
    id: 'training-process',
    category: 'knowledge',
    keywords: ['training', 'refresh', 'update', 'sync', 'convert'],
    questionPatterns: ['how\\s+.*(train|refresh)', 'model\\s+update'],
    answer: `Training / Refresh Approach:
1. Normalize input content (strip boilerplate, unify formatting).
2. Canonical segmentation (stable answer units).
3. Safety filtering (remove obvious placeholders / broken text).
4. Deterministic matching layer for direct Q→A.
5. AI fallback only if no direct match.

You can re-trigger refresh after editing source content. Goal: minimize hallucination by preferring explicit content blocks. Want embedding details next?`,
    short: 'Content segmented + normalized; deterministic Q→A first, AI fallback second.'
  },
  {
    id: 'embedding',
    category: 'integration',
    keywords: ['embed', 'widget', 'script', 'install', 'snippet', 'placement'],
    questionPatterns: ['how\\s+do\\s+i\\s+embed', 'embed\\s+code', 'chat\\s+widget\\s+snippet'],
    answer: `Embedding Instructions:
1. Copy the provided <script> snippet from the dashboard.
2. Place it just before the closing </head> tag (or in Next.js: inside app/layout.tsx <head>).
3. For Shopify: use theme editor or edit theme.liquid (head section).
4. Data attributes let you configure color, position, greeting.
5. Avoid duplicating the script (check if already injected).
6. After deploy, hard-refresh page to load the widget.

Example (illustrative):
<script async src="https://cdn.trulybot.xyz/widget.js"
  data-project="YOUR_PROJECT_ID"
  data-color="#2C4AF7"
  data-position="right"
  data-greeting="Hi there!">
</script>

Need a framework-specific snippet (Next.js or Shopify)?`,
    short: 'Insert script before </head>; configure with data attributes; avoid duplicates.'
  },
  {
    id: 'pricing-overview',
    category: 'pricing',
    keywords: ['pricing', 'cost', 'plans', 'price', 'tiers', 'inr'],
    questionPatterns: ['pricing', 'price\\s+list', 'plans'],
    answer: `Current INR Tiers:
${PRICING_TIERS.map(t => `- ${t.name} (₹${t.monthlyInr}/mo): ${t.messageAllowance} – ${t.features.slice(0,2).join(', ')}${t.fairUse ? ' (Unlimited under fair use)' : ''}`).join('\n')}

Fair Use: “Unlimited” implies soft caps with a scaling dialogue if usage is atypically high for plan level.

Enterprise / custom? Reach out for a tailored conversation (volume, compliance, advanced support). Want fair use details or feature breakdown next?`,
    short: 'Basic ₹99 (1k msgs), Pro ₹299 (Unlimited*), Ultra ₹499 (Unlimited* + branding).'
  },
  {
    id: 'fair-use',
    category: 'pricing',
    keywords: ['fair', 'use', 'unlimited', 'limit', 'caps'],
    questionPatterns: ['unlimited\\s+plan', 'fair\\s+use'],
    answer: `Fair Use Policy:
“Unlimited” means typical operational use patterns. We monitor:
- Sustained message spikes far above normal plan averages
- Automated abuse or purely synthetic traffic
- Extremely high concurrency anomalies

If thresholds are approached, we start a scaling conversation (upgrade or tailored arrangement). This protects reliability for all users. Want pricing specifics again?`,
    short: 'Unlimited = normal human-scale usage; extreme spikes prompt a scaling conversation.'
  },
  {
    id: 'features',
    category: 'features',
    keywords: ['features', 'capabilities', 'what', 'functions', 'abilities'],
    questionPatterns: ['features', 'capabilities'],
    answer: `Core Feature Pillars:
1. Deterministic Knowledge Answers – direct mapping before LLM fallback.
2. Intent Detection – classify user ask types (support vs pre-sales).
3. Soft Lead Capture – timing & context gating (no spam).
4. Knowledge Ingestion – FAQs + policy pages + site parse.
5. Customizable Widget – style + greeting + positioning.
6. Privacy Guardrails – minimal data capture design.
7. Analytics (Roadmap) – insights on deflection & CSAT proxies.

Want more detail on any single feature?`,
    short: 'Deterministic answers, intent, soft leads, ingestion, customization, privacy, analytics (roadmap).'
  },
  {
    id: 'impact-metrics',
    category: 'metrics',
    keywords: ['metrics', 'impact', 'stats', 'csat', 'hours', 'cost', 'reduction'],
    questionPatterns: ['metrics', 'impact'],
    answer: `Illustrative Sample Metrics (labelled):
- 4.5k+ chats handled
- 92% CSAT (sample internal measurement)
- 100+ agent hours saved
- Up to 80% cost reduction (scenario-based illustrative upper bound)

These are directional; actual performance depends on volume & content quality. Want to explore how we calculate deflection?`,
    short: 'Sample: 4.5k+ chats, 92% CSAT, 100+ hours saved, up to 80% cost reduction (illustrative).'
  },
  {
    id: 'email-capture-philosophy',
    category: 'lead',
    keywords: ['email', 'capture', 'lead', 'form', 'contact'],
    questionPatterns: ['email\\s+capture', 'lead\\s+.*philosophy'],
    answer: `Email Capture Philosophy:
- Opt-in only; no premature aggressive popup.
- Triggered after intent clarity (e.g., pre-sales question) or user expresses follow-up need.
- Short prompt; user retains control (skip accepted).
- Designed to build trust, not inflate vanity metrics.

Would you like guidelines for customizing prompt timing?`,
    short: 'Respectful, intent-gated, opt-in lead capture—not spam.'
  },
  {
    id: 'data-retention',
    category: 'policy',
    keywords: ['data', 'retention', 'store', 'delete'],
    questionPatterns: ['data\\s+retention'],
    answer: `Data Retention:
We store conversation transcripts and (if voluntarily provided) email addresses to improve quality and allow follow-up. Planned controls: configurable retention windows & deletion requests interface. Deletion request process: to be formalized; until then manual support channel processing.`
  },
  {
    id: 'privacy',
    category: 'policy',
    keywords: ['privacy', 'pii', 'personal', 'data'],
    questionPatterns: ['privacy\\s+policy', '^privacy'],
    answer: `Privacy Approach:
Minimal collection (conversation text + optional user-provided email). No selling of conversation data. Only user-supplied PII is stored. Improvements will layer more granular consent and automated deletion support.`
  },
  {
    id: 'security',
    category: 'policy',
    keywords: ['security', 'secure', 'encryption', 'sso', 'rbac', 'audit'],
    questionPatterns: ['security'],
    answer: `Security (Current & Roadmap):
Current baseline: secure hosting environment, transport encryption (HTTPS), controlled internal access.
Roadmap: SSO options (Google / OIDC), role-based access control (RBAC), audit logs for admin actions, formal SLA / uptime reporting.`
  },
  {
    id: 'integrations-roadmap',
    category: 'roadmap',
    keywords: ['integrations', 'slack', 'crm', 'hubspot', 'salesforce', 'webhook', 'zapier'],
    questionPatterns: ['integrations', 'roadmap\\s+integrations'],
    answer: `Integrations Roadmap:
- Slack handoff (agent escalation)
- CRM enrichment (HubSpot / Salesforce)
- Webhooks & Zapier triggers
- Documentation platform ingestion (Notion, knowledge base tools)
- Email escalation fallback

Want to prioritize one of these?`,
    short: 'Slack, CRM (HubSpot/Salesforce), Webhooks/Zapier, docs ingestion, email escalation (roadmap).'
  },
  {
    id: 'support-escalation',
    category: 'support',
    keywords: ['escalation', 'support', 'handoff', 'agent'],
    questionPatterns: ['support\\s+escalation', 'escalate\\s+.*support'],
    answer: `Support Escalation:
Current: in-chat guidance or manual prompt to leave contact.
Roadmap: Slack channel push + optional email escalation triggers + internal agent notification.

Need a preview of how Slack escalation will work?`,
    short: 'Current manual; roadmap adds Slack + email escalation.'
  },
  {
    id: 'target-users',
    category: 'market',
    keywords: ['target', 'audience', 'users', 'who', 'for'],
    questionPatterns: ['who\\s+is\\s+.*for', 'target\\s+users'],
    answer: `Target Users:
- Indian e-commerce merchants & D2C brands seeking scalable support
- Early SaaS / digital platforms with rising repetitive inquiries
- Teams with limited support staff needing deflection + pre-sales guidance

Want to see differentiation next?`,
    short: 'Indian e-commerce, scaling D2C, early SaaS with growing support volume.'
  },
  {
    id: 'differentiation',
    category: 'positioning',
    keywords: ['different', 'differentiation', 'unique', 'compare', 'why', 'not', 'gpt'],
    questionPatterns: ['why\\s+not\\s+generic', 'difference\\s+.*gpt'],
    answer: `Differentiation:
- Deterministic Q→A layer to reduce hallucination vs pure “chat GPT” style widgets.
- Intent gating prevents random early lead spam.
- Localized India-first pricing.
- Roadmap-driven integrations (Slack + CRM) focused on real workflow.
- Structured ingestion of policies & FAQs (not just free-form context stuffing).

Want limitations transparently stated?`,
    short: 'Deterministic answers, intent gating, localized pricing, focused roadmap.'
  },
  {
    id: 'localization',
    category: 'roadmap',
    keywords: ['localization', 'language', 'multi', 'india', 'regional'],
    questionPatterns: ['localization', 'languages'],
    answer: `Localization:
Current: English primary (optimized for Indian English usage).
Planned: multi-language expansion (priority based on demand).
Focus: supporting regional commerce contexts first before broad global expansion.

Interested in roadmap sequence?`,
    short: 'English now; multi-language planned based on demand.'
  },
  {
    id: 'roadmap',
    category: 'roadmap',
    keywords: ['roadmap', 'future', 'planned', 'coming'],
    questionPatterns: ['roadmap', 'coming\\s+soon'],
    answer: `Roadmap (Condensed – subject to iteration):
- Deeper ingestion: Notion, PDFs, structured docs
- Slack + CRM (HubSpot / Salesforce) integration
- Webhooks + Zapier automation
- Analytics dashboard (deflection, satisfaction proxy, conversion funnels)
- Multi-language support
- Security expansions: SSO, RBAC, audit logs
- Advanced customization (theming layers, conditional flows)

Which of these is most critical for you?`,
    short: 'Docs ingestion, Slack/CRM, Webhooks, Analytics, Multi-language, Security, Customization.'
  },
  {
    id: 'limitations',
    category: 'transparency',
    keywords: ['limitations', 'limits', 'not', 'cannot', 'missing', 'ticketing'],
    questionPatterns: ['limitations', 'limit\\s+.*system', 'ticketing\\s+system'],
    answer: `Current Limitations:
- Not a full ticketing system (no full internal agent workspace yet)
- Limited to English (multi-language pending)
- Document ingestion breadth still expanding
- Advanced analytics dashboard not yet launched
- No fully automated retention controls (manual stage)
- Escalation workflow (Slack / email) still in roadmap stage

We surface these transparently to set correct expectations.

Want guidance on workaround strategies?`,
    short: 'No full ticketing; English only; ingestion breadth growing; analytics & escalation in roadmap.'
  }
];

export function listKnowledgeIds(): string[] {
  return KNOWLEDGE_BASE.map(e => e.id);
}
export function getKnowledgeEntry(id: string): KnowledgeEntry | undefined {
  return KNOWLEDGE_BASE.find(e => e.id === id);
}
export function findKnowledgeAnswer(userText: string): MatchResult | null {
  if (!userText) return null;
  const original = userText;
  const text = userText.toLowerCase().trim();

  // Direct pattern pass
  for (const entry of KNOWLEDGE_BASE) {
    if (entry.questionPatterns) {
      for (const pattern of entry.questionPatterns) {
        try {
          const re = new RegExp(pattern, 'i');
          if (re.test(original)) {
            return buildResult(entry, true, DIRECT_HIT_SCORE);
          }
        } catch {
          // ignore
        }
      }
    }
  }

  // Fuzzy keyword pass
  const tokens = uniq(tokenize(text));
  let best: MatchResult | null = null;

  for (const entry of KNOWLEDGE_BASE) {
    const kws = entry.keywords || [];
    if (kws.length === 0) continue;
    const lowered = kws.map(k => k.toLowerCase());
    const overlap = lowered.filter(k => tokens.includes(k));
    if (overlap.length < MIN_KEYWORD_HITS) continue;

    const norm = overlap.length / lowered.length;
    if (norm >= FUZZY_THRESHOLD) {
      const priority = entry.priority ?? BASE_PRIORITY;
      const score = FUZZY_BASE_SCORE * norm * (1 + (priority - 1) * 0.15);
      if (!best || score > best.score) {
        best = buildResult(entry, false, Math.min(score, 0.99));
      }
    }
  }
  return best;
}

function buildResult(entry: KnowledgeEntry, direct: boolean, score: number): MatchResult {
  let truncated = false;
  let answer = entry.answer;
  if (answer.length > MAX_ANSWER_LENGTH) {
    answer = answer.slice(0, MAX_ANSWER_LENGTH) + ' (Truncated) Ask for more detail if needed.';
    truncated = true;
  }
  return {
    id: entry.id,
    answer,
    directPattern: direct,
    score,
    truncated
  };
}