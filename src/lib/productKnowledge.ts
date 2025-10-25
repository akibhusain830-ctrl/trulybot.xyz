import { PRICING_TIERS } from "./constants/pricing";
import {
  generatePricingContent,
  generateShortPricingSummary,
  detectCurrencyFromBrowser,
} from "./location-aware-pricing";

export const KNOWLEDGE_VERSION = "2025-10-10-latest";

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
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}
function uniq<T>(arr: readonly T[]): T[] {
  return Array.from(new Set(arr));
}

const KNOWLEDGE_BASE: readonly KnowledgeEntry[] = [
  // Demo-specific entries for conversion
  {
    id: "demo-bot-experience",
    category: "demo",
    tags: ["demo", "experience", "customer"],
    questionPatterns: [
      "this\\s+is\\s+demo",
      "demo\\s+bot",
      "experience",
      "what\\s+will\\s+customers\\s+get",
    ],
    keywords: [
      "demo",
      "experience",
      "customers",
      "same",
      "professional",
      "this",
      "what",
      "will",
      "get",
    ],
    answer: `🎯 You're experiencing exactly what YOUR customers will get on your website!

This same professional, instant AI support will:
✅ Answer questions 24/7 without delays
✅ Capture leads automatically (like this conversation!)
✅ Reduce your support tickets by 70%
✅ Increase conversions by 5X
✅ Handle multiple customers simultaneously

**Real Impact:** Our customers save 20+ hours/week and see 3X more qualified leads!

Ready to give your customers this experience? → [Start Free Trial] [View Pricing] [See Live Demo]`,
    short:
      "This demo shows exactly what your customers will experience - professional 24/7 AI support.",
    priority: 5,
  },
  {
    id: "why-choose-trulybot",
    category: "value",
    tags: ["value", "benefits", "why", "choose"],
    questionPatterns: [
      "why\\s+choose",
      "why\\s+trulybot",
      "what\\s+makes.*different",
      "benefits",
      "advantages",
      "why\\s+should\\s+i",
      "what\\s+sets.*apart",
    ],
    keywords: [
      "why",
      "choose",
      "benefits",
      "advantages",
      "better",
      "different",
      "value",
      "best",
    ],
    answer: `🏆 Why Choose TrulyBot? Real Results, Not Just Promises!

**💰 Immediate ROI:**
• Save ₹50,000+ annually on support costs
• 5X more qualified leads from your website
• 70% reduction in repetitive support tickets
• 24/7 coverage without hiring night shifts

**⚡ Lightning-Fast Setup:**
• Live in 5 minutes (not weeks like competitors)
• No technical expertise required
• Works with ANY website platform
• Instant customization to match your brand

**🎯 India-First Advantage:**
• Localized pricing in INR (not expensive USD)
• Built for Indian e-commerce workflows
• Customer support in your timezone
• Understanding of local business needs

**🔒 Enterprise-Grade Security:**
• Your data stays secure and private
• SOC 2 compliant infrastructure
• No data selling or sharing
• Complete control over your information

Ready to transform your customer experience? → [Start Free Trial] [View Pricing] [See Features]`,
    short:
      "Save ₹50k+ annually, 5X more leads, 5-minute setup, India-first pricing, enterprise security.",
    priority: 5,
  },
  {
    id: "pricing-plans-demo",
    category: "pricing",
    tags: ["pricing", "plans", "cost"],
    questionPatterns: [
      "pricing\\s+plans?",
      "how\\s+much",
      "cost",
      "price",
      "plans",
    ],
    keywords: [
      "pricing",
      "plans",
      "cost",
      "price",
      "how much",
      "rupees",
      "free",
    ],
    answer: `💰 TrulyBot Pricing Plans (INR Only):

**Free Plan** - ₹0/month 🆓
• Perfect for testing our AI chatbot
• 100 replies/month
• Basic Knowledge Base (500 words)
• 1 Knowledge Upload & Website Embedding

**Basic Plan** - ₹99/month (₹950/year)
• For emerging businesses & startups
• 1,000 replies/month
• Standard Knowledge Base (2,000 words)
• 4 Knowledge Uploads

**Pro Plan** - ₹399/month (₹3,831/year) ⭐ Most Popular
• Best for growing e-commerce brands
• Unlimited replies
• Expanded Knowledge Base (15,000 words)
• 10 Knowledge Uploads + Lead Capture

**Ultra Plan** - ₹599/month (₹5,750/year)
• Ultimate toolkit for established businesses
• Unlimited replies
• Maximum Knowledge Base (50,000 words)
• 25 Knowledge Uploads + Full Brand Customization

🎁 Start FREE today - no credit card required!

Ready to get started? → [Start Free Trial] [View Pricing] [Contact Sales]`,
    short:
      "Plans: Free ₹0, Basic ₹99, Pro ₹399, Ultra ₹599. Start with free plan forever!",
    priority: 5,
  },
  {
    id: "free-trial-demo",
    category: "trial",
    tags: ["trial", "free", "signup"],
    questionPatterns: [
      "free\\s+trial",
      "trial",
      "try\\s+free",
      "start\\s+trial",
      "can\\s+i\\s+try",
      "is\\s+there\\s+.*free",
      "free\\s+version",
      "trial\\s+available",
      "test\\s+for\\s+free",
      "try\\s+.*free",
    ],
    keywords: [
      "free",
      "trial",
      "signup",
      "start",
      "test",
      "try",
      "available",
      "version",
    ],
    answer: `🚀 Start with TrulyBot Forever FREE!

✅ No credit card required
✅ Permanent free plan available
✅ Upgrade anytime for more features
✅ Setup takes just 5 minutes

With our FREE plan, you get:
• 100 replies/month
• Basic Knowledge Base (500 words)
• 1 Knowledge Upload
• Website Embedding
• Complete dashboard access

Want more features? Choose from Basic (₹99), Pro (₹399), or Ultra (₹599) plans.

Ready to start FREE? → [Start Free Plan] [View All Plans]`,
    short:
      "Forever FREE plan available! 100 replies/month, basic features, no credit card required.",
    priority: 5,
  },
  {
    id: "lead-capture-demo",
    category: "features",
    tags: ["leads", "capture", "conversion"],
    questionPatterns: [
      "lead\\s+capture",
      "capture\\s+leads",
      "convert\\s+visitors",
      "get\\s+customers",
    ],
    keywords: [
      "leads",
      "capture",
      "conversion",
      "visitors",
      "customers",
      "contact",
    ],
    answer: `🎯 Lead Capture in Action!

**What just happened:** I detected your interest and could capture your email for follow-up. This is exactly how TrulyBot turns website visitors into customers!

**Real Results:**
• 5X more leads than contact forms
• 70% higher conversion rates  
• Automatic lead scoring & tagging
• Instant notifications to your team

**Example:** When a visitor asks about pricing, TrulyBot can say: "I'd love to send you a detailed comparison. What's your email?" 

This conversation would be tagged as "Hot Lead - Pricing Interest" in your dashboard.

Want to see how this works for your business?`,
    short:
      "AI automatically captures leads from conversations, 5X better than forms.",
    priority: 4,
  },
  {
    id: "features-overview-demo",
    category: "features",
    tags: ["features", "capabilities"],
    questionPatterns: [
      "features",
      "what\\s+can\\s+you\\s+do",
      "capabilities",
      "functionality",
    ],
    keywords: ["features", "capabilities", "what", "can", "do", "functions"],
    answer: `⚡ TrulyBot Features You're Experiencing:

**🤖 Intelligent Conversations**
• Natural language understanding
• Context-aware responses
• Multi-language support

**📊 Business Intelligence** 
• Lead capture & scoring
• Conversation analytics  
• Customer insights

**🎨 Full Customization**
• Your brand colors & logo
• Custom welcome messages
• Multiple themes

**🔧 Easy Integration**
• 5-minute setup
• Works on any website
• Mobile-optimized

**📈 Growth Tools**
• 24/7 customer support
• Automated lead generation
• Support ticket reduction

Ready to explore more? → [Start Free Trial] [View Pricing] [Features]`,
    short:
      "Intelligent chat, lead capture, customization, easy setup, and growth tools.",
    priority: 4,
  },
  {
    id: "quick-setup-demo",
    category: "setup",
    tags: ["setup", "easy", "quick"],
    questionPatterns: [
      "how\\s+quickly",
      "setup\\s+time",
      "get\\s+started",
      "installation",
    ],
    keywords: ["quickly", "setup", "time", "easy", "fast", "minutes", "start"],
    answer: `⏱️ Get TrulyBot Running in Just 5 Minutes!

**Step 1:** Sign up for free trial (30 seconds)
**Step 2:** Customize your bot's appearance (2 minutes)  
**Step 3:** Copy & paste one line of code (1 minute)
**Step 4:** Your AI assistant is live! (Instant)

That's it! No complex integrations, no technical expertise needed.

**What you get immediately:**
✅ 24/7 AI customer support
✅ Lead capture system  
✅ Professional chat widget
✅ Analytics dashboard

Ready to get started? → [Start Free Trial] [Dashboard]`,
    short:
      "5-minute setup: Sign up, customize, copy code, go live. No technical skills needed.",
    priority: 4,
  },
  {
    id: "integration-compatibility",
    category: "integration",
    tags: ["integration", "compatible", "platform", "ecommerce"],
    questionPatterns: [
      "does.*work.*with",
      "compatible.*with",
      "integrate.*with",
      "work.*on.*my",
      "support.*platform",
    ],
    keywords: [
      "work",
      "compatible",
      "integrate",
      "platform",
      "website",
      "ecommerce",
      "shopify",
      "wordpress",
    ],
    answer: `🔗 TrulyBot Works With ALL Major Platforms!

**✅ E-Commerce Platforms:**
• WooCommerce (Official Plugin Available!)
• Shopify (Native App Integration)
• Magento (Universal Script)
• BigCommerce (Easy Embed)

**✅ Website Builders:**
• WordPress (Plugin + Manual)
• Wix (Script Integration)
• Squarespace (Code Injection)
• Webflow (Embed Code)

**✅ Custom Websites:**
• React/Next.js (Component Available)
• PHP/HTML (Universal Script)
• Any website with HTML access

**Setup Time:** Just 5 minutes with our platform-specific guides!

**Need specific help?** → [WooCommerce Setup] [Shopify Setup] [General Instructions]`,
    short:
      "Compatible with ALL major platforms: WooCommerce, Shopify, WordPress, custom sites. 5-minute setup!",
    priority: 5,
  },
  {
    id: "dashboard-access",
    category: "dashboard",
    tags: ["dashboard", "analytics", "access"],
    questionPatterns: [
      "dashboard",
      "analytics",
      "control\\s+panel",
      "admin",
      "account",
      "manage",
      "settings",
    ],
    keywords: [
      "dashboard",
      "analytics",
      "admin",
      "control",
      "manage",
      "account",
      "settings",
    ],
    answer: `📊 Your TrulyBot Dashboard - Complete Control Center!

**Real-time Analytics:**
• Live conversation tracking
• Lead capture statistics  
• Performance metrics
• Customer satisfaction scores

**Management Tools:**
• Customize bot appearance
• Update knowledge base
• Manage team access
• Export conversation data

**Business Insights:**
• Most asked questions
• Peak usage times
• Conversion analytics
• Revenue attribution

Ready to see your dashboard? → [Dashboard] [Start Free Trial]`,
    short:
      "Full dashboard with analytics, customization, and business insights.",
    priority: 4,
  },
  {
    id: "what-is-trulybot",
    category: "overview",
    tags: ["overview", "about"],
    questionPatterns: [
      "^(what\\s+is\\s+trulybot\\??)",
      "^(tell\\s+me\\s+about\\s+trulybot)",
      "^(trulybot\\s*\\?)",
    ],
    keywords: [
      "what",
      "trulybot",
      "platform",
      "ai",
      "support",
      "ecommerce",
      "india",
    ],
    answer: `Trulybot is a focused AI customer support & pre-sales assistant for Indian e-commerce and scaling digital brands. It helps answer FAQs, reduce repetitive agent load, capture soft leads (without spamming), and deliver accurate, context-grounded responses from your own knowledge.

Key pillars:
- Rapid setup (minutes, not weeks)
- Deterministic knowledge answers before AI creativity
- Localized pricing for India
- Soft, trust-first email capture
- Roadmap: deeper integrations (Slack, CRM, docs ingestion)

Goal: push high CSAT and reduced handling cost while staying privacy-conscious. Want details on setup or pricing next?`,
    short:
      "AI support & pre-sales assistant for Indian e-commerce; fast setup & deterministic answers.",
    priority: 4,
  },
  {
    id: "core-values",
    category: "values",
    keywords: ["values", "principles", "philosophy", "mission"],
    questionPatterns: ["values", "core\\s+values"],
    answer: `Core Values:
1. Speed to Deploy – usable in minutes, not long onboarding.
2. Accuracy & Relevance – deterministic knowledge grounding first.
3. Cost Efficiency – reduce repetitive agent interactions.
4. Customer Empathy – respectful, non-pushy experience.
5. Privacy by Design – minimal data, user consent boundaries.
6. Continuous Improvement – iteration with real usage signals.
7. India-First Focus – localized pricing & market context.

Want to dive into any one of these?`,
    short:
      "Speed, Accuracy, Cost Efficiency, Empathy, Privacy, Iteration, India-First.",
  },
  {
    id: "setup-speed",
    category: "onboarding",
    keywords: ["setup", "deploy", "time", "install", "start"],
    questionPatterns: [
      "how\\s+long\\s+.*setup",
      "setup\\s+time",
      "deployment\\s+time",
    ],
    answer: `Setup Flow (Minutes):
1. Provide your site / FAQ or policy links.
2. (Optional) Paste structured FAQ entries.
3. Generate + copy the lightweight embed script.
4. Paste before </head> in your storefront or Next.js layout.
5. Chat widget appears; start internal QA then go live.

No deep engineering dependency for a basic launch. Want the embed snippet overview?`,
    short:
      "Provide content, copy script, paste before </head>, test. Launch in minutes.",
  },
  {
    id: "ingest-content",
    category: "knowledge",
    keywords: ["ingest", "content", "faqs", "policies", "sources", "import"],
    questionPatterns: ["(ingest|import)\\s+(content|data)"],
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
    short:
      "Supports FAQs, policy pages, site URL. Roadmap: docs, Notion, PDFs, automation.",
  },
  {
    id: "training-process",
    category: "knowledge",
    keywords: ["training", "refresh", "update", "sync", "convert"],
    questionPatterns: ["how\\s+.*(train|refresh)", "model\\s+update"],
    answer: `Training / Refresh Approach:
1. Normalize input content (strip boilerplate, unify formatting).
2. Canonical segmentation (stable answer units).
3. Safety filtering (remove obvious placeholders / broken text).
4. Deterministic matching layer for direct Q→A.
5. AI fallback only if no direct match.

You can re-trigger refresh after editing source content. Goal: minimize hallucination by preferring explicit content blocks. Want embedding details next?`,
    short:
      "Content segmented + normalized; deterministic Q→A first, AI fallback second.",
  },
  {
    id: "embedding",
    category: "integration",
    keywords: ["embed", "widget", "script", "install", "snippet", "placement"],
    questionPatterns: [
      "how\\s+do\\s+i\\s+embed",
      "embed\\s+code",
      "chat\\s+widget\\s+snippet",
    ],
    answer: `🚀 Super Easy Embedding - 3 Methods:

**Method 1: WooCommerce Plugin (Recommended)**
• Download our official TrulyBot plugin
• One-click installation & automatic setup
• No coding required - fully seamless!

**Method 2: Universal Script (Any Website)**
• Copy the script from your dashboard
• Paste before </head> tag
• Instantly live on your website

**Method 3: Platform Integrations**
• Shopify: Use our Shopify app
• Next.js: Add script to layout.tsx
• WordPress: Plugin or manual script

Example Script:
<script async src="https://cdn.trulybot.xyz/widget.js"
  data-project="YOUR_PROJECT_ID"
  data-color="#2C4AF7">
</script>

Setup takes just 5 minutes with our seamless integration methods!

Need platform-specific help? → [WooCommerce Setup] [Shopify Setup] [General Instructions]`,
    short:
      "Multiple easy methods: WooCommerce plugin, universal script, or platform integrations. Setup in 5 minutes!",
    priority: 4,
  },
  {
    id: "woocommerce-plugin",
    category: "integration",
    keywords: [
      "woocommerce",
      "plugin",
      "seamless",
      "easy",
      "one-click",
      "work",
      "compatible",
      "integration",
      "ecommerce",
    ],
    questionPatterns: [
      "woocommerce\\s+plugin",
      "woo\\s+commerce",
      "seamless\\s+integration",
      "work.*woocommerce",
      "compatible.*woo",
      "woocommerce.*work",
      "does.*work.*woo",
    ],
    answer: `🎯 WooCommerce Plugin - Seamless Integration!

**Why Choose Our WooCommerce Plugin?**
✅ One-click installation (no coding required)
✅ Automatic chatbot setup & configuration
✅ Access to all customer & order data
✅ Instant product recommendations
✅ Seamless theme integration

**Setup Process (Less than 5 minutes):**
1. Download TrulyBot WooCommerce plugin
2. Upload & activate in WordPress admin
3. Connect your TrulyBot account
4. Customize appearance (optional)
5. Go live instantly!

**Features Included:**
• Real-time order tracking
• Product search & recommendations
• Customer support automation
• Lead capture integration
• Analytics & insights

Perfect for WooCommerce stores wanting professional AI support without technical complexity!

Ready to install? → [Download Plugin] [Setup Guide] [View Demo]`,
    short:
      "Official WooCommerce plugin: one-click install, automatic setup, seamless integration in under 5 minutes!",
    priority: 5,
  },
  {
    id: "pricing-overview",
    category: "pricing",
    keywords: ["pricing", "cost", "plans", "price", "tiers", "inr"],
    questionPatterns: ["pricing", "price\\s+list", "plans"],
    answer: `Current INR Tiers:
${PRICING_TIERS.map((t) => `- ${t.name} (₹${t.monthlyInr}/mo): ${t.messageAllowance} – ${t.features.slice(0, 2).join(", ")}${t.fairUse ? " (Unlimited under fair use)" : ""}`).join("\n")}

Fair Use: “Unlimited” implies soft caps with a scaling dialogue if usage is atypically high for plan level.

Enterprise / custom? Reach out for a tailored conversation (volume, compliance, advanced support). Want fair use details or feature breakdown next?`,
    short:
      "Basic ₹99 (1k msgs), Pro ₹299 (Unlimited*), Ultra ₹499 (Unlimited* + branding).",
  },
  {
    id: "fair-use",
    category: "pricing",
    keywords: ["fair", "use", "unlimited", "limit", "caps"],
    questionPatterns: ["unlimited\\s+plan", "fair\\s+use"],
    answer: `Fair Use Policy:
“Unlimited” means typical operational use patterns. We monitor:
- Sustained message spikes far above normal plan averages
- Automated abuse or purely synthetic traffic
- Extremely high concurrency anomalies

If thresholds are approached, we start a scaling conversation (upgrade or tailored arrangement). This protects reliability for all users. Want pricing specifics again?`,
    short:
      "Unlimited = normal human-scale usage; extreme spikes prompt a scaling conversation.",
  },
  {
    id: "features",
    category: "features",
    keywords: ["features", "capabilities", "what", "functions", "abilities"],
    questionPatterns: ["features", "capabilities"],
    answer: `Core Feature Pillars:
1. Deterministic Knowledge Answers – direct mapping before LLM fallback.
2. Intent Detection – classify user ask types (support vs pre-sales).
3. Soft Lead Capture – timing & context gating (no spam).
4. Knowledge Ingestion – FAQs + policy pages + site parse.
5. Customizable Widget – style + greeting + positioning.
6. Privacy Guardrails – minimal data capture design.
7. Analytics (Roadmap) – insights on deflection & CSAT proxies.

Want more detail on any single feature?`,
    short:
      "Deterministic answers, intent, soft leads, ingestion, customization, privacy, analytics (roadmap).",
  },
  {
    id: "impact-metrics",
    category: "metrics",
    keywords: [
      "metrics",
      "impact",
      "stats",
      "csat",
      "hours",
      "cost",
      "reduction",
    ],
    questionPatterns: ["metrics", "impact"],
    answer: `Illustrative Sample Metrics (labelled):
- 4.5k+ chats handled
- 92% CSAT (sample internal measurement)
- 100+ agent hours saved
- Up to 80% cost reduction (scenario-based illustrative upper bound)

These are directional; actual performance depends on volume & content quality. Want to explore how we calculate deflection?`,
    short:
      "Sample: 4.5k+ chats, 92% CSAT, 100+ hours saved, up to 80% cost reduction (illustrative).",
  },
  {
    id: "email-capture-philosophy",
    category: "lead",
    keywords: ["email", "capture", "lead", "form", "contact"],
    questionPatterns: ["email\\s+capture", "lead\\s+.*philosophy"],
    answer: `Email Capture Philosophy:
- Opt-in only; no premature aggressive popup.
- Triggered after intent clarity (e.g., pre-sales question) or user expresses follow-up need.
- Short prompt; user retains control (skip accepted).
- Designed to build trust, not inflate vanity metrics.

Would you like guidelines for customizing prompt timing?`,
    short: "Respectful, intent-gated, opt-in lead capture—not spam.",
  },
  {
    id: "data-retention",
    category: "policy",
    keywords: ["data", "retention", "store", "delete"],
    questionPatterns: ["data\\s+retention"],
    answer: `Data Retention:
We store conversation transcripts and (if voluntarily provided) email addresses to improve quality and allow follow-up. Planned controls: configurable retention windows & deletion requests interface. Deletion request process: to be formalized; until then manual support channel processing.`,
  },
  {
    id: "security",
    category: "policy",
    keywords: ["security", "secure", "encryption", "sso", "rbac", "audit"],
    questionPatterns: ["security"],
    answer: `Security (Current & Roadmap):
Current baseline: secure hosting environment, transport encryption (HTTPS), controlled internal access.
Roadmap: SSO options (Google / OIDC), role-based access control (RBAC), audit logs for admin actions, formal SLA / uptime reporting.`,
  },
  {
    id: "refund-policy",
    category: "legal",
    tags: ["refund", "policy", "cancellation", "money-back"],
    questionPatterns: [
      "refund\\s+policy",
      "money\\s+back",
      "cancellation\\s+policy",
      "cancel\\s+subscription",
      "get\\s+refund",
    ],
    keywords: [
      "refund",
      "cancel",
      "cancellation",
      "money",
      "back",
      "policy",
      "subscription",
    ],
    answer: `💰 TrulyBot Refund & Cancellation Policy:

**📋 Cancellation:**
✅ Cancel anytime from your dashboard
✅ No cancellation fees
✅ Service continues until end of billing period
✅ Account downgrades after billing period ends

**💸 Refund Policy:**
• **Strict no-refund policy** for digital services
• No refunds for partially used periods
• No credits for unused months
• No refunds after payment processing

**🔧 Exceptions:**
• Technical errors resulting in overcharges
• Billing mistakes confirmed on our end
• Case-by-case review for exceptional circumstances

**💡 Recommendation:** 
Try our **FREE plan** first to evaluate features before upgrading!

Need help with cancellation? → [Contact Support] [Dashboard]`,
    short:
      "Strict no-refund policy for digital services. Cancel anytime, no fees. Try free plan first.",
    priority: 4,
  },
  {
    id: "privacy-policy",
    category: "legal",
    tags: ["privacy", "data", "security", "gdpr"],
    questionPatterns: [
      "privacy\\s+policy",
      "data\\s+protection",
      "personal\\s+data",
      "gdpr",
      "data\\s+security",
    ],
    keywords: [
      "privacy",
      "data",
      "personal",
      "protection",
      "security",
      "gdpr",
      "information",
    ],
    answer: `🔒 TrulyBot Privacy & Data Protection:

**🛡️ Data We Collect:**
• Email address & name (for account)
• Payment info (securely via Razorpay)
• Your chatbot content (knowledge base)
• Usage analytics (for improvements)

**🎯 How We Use Data:**
✅ Provide & maintain service
✅ Process payments & subscriptions
✅ Customer support
✅ Security & fraud prevention

**🔐 Your Content Protection:**
• **Your content = Your ownership**
• We NEVER use your content to train other AI models
• Data used ONLY to power your chatbot
• No sharing or selling of your data

**🌍 Compliance:**
• GDPR compliant data handling
• Secure hosting & encryption
• Right to data deletion
• Transparent data practices

Your privacy is our priority! → [Full Privacy Policy] [Contact Support]`,
    short:
      "GDPR compliant, your content stays yours, never used for training other models. Secure & transparent.",
    priority: 4,
  },
  {
    id: "terms-of-service",
    category: "legal",
    tags: ["terms", "service", "agreement", "legal"],
    questionPatterns: [
      "terms\\s+of\\s+service",
      "terms\\s+conditions",
      "user\\s+agreement",
      "legal\\s+terms",
    ],
    keywords: ["terms", "service", "agreement", "conditions", "legal", "user"],
    answer: `📋 TrulyBot Terms of Service Summary:

**✅ Service Usage:**
• Must be 18+ or have guardian consent
• Use service for legitimate business purposes
• No abusive, illegal, or harmful content
• Respect usage limits for your plan

**🎯 Your Rights:**
• Own your chatbot content & data
• Cancel subscription anytime
• Access to features per your plan
• Customer support assistance

**⚠️ Our Rights:**
• Modify service with notice
• Suspend accounts for violations
• Update terms (with notification)
• Protect service integrity

**💼 Liability:**
• Service provided "as is"
• Limited liability for damages
• You're responsible for your content
• Reasonable uptime expectations

**🔗 Important:**
By using TrulyBot, you agree to our full terms.

Need clarification? → [Full Terms] [Contact Support] [Legal Questions]`,
    short:
      "Standard SaaS terms: 18+, legitimate use, you own your data, reasonable liability limits.",
    priority: 3,
  },
  {
    id: "api-access",
    category: "features",
    tags: ["api", "access", "integration", "developers"],
    questionPatterns: [
      "api\\s+access",
      "api\\s+integration",
      "developer\\s+api",
      "programmatic\\s+access",
    ],
    keywords: [
      "api",
      "access",
      "integration",
      "developer",
      "programmatic",
      "webhook",
    ],
    answer: `🔌 TrulyBot API Access & Integration:

**💎 Ultra Plan API Features:**
✅ Full REST API access
✅ Webhook notifications
✅ Programmatic chat management
✅ Custom integrations
✅ Developer documentation

**🛠️ API Capabilities:**
• Send/receive messages programmatically
• Manage chatbot configurations
• Access conversation analytics
• Trigger custom workflows
• Real-time webhook notifications

**🔗 Integration Options:**
• Direct API calls
• Webhook endpoints
• Zapier automation (roadmap)
• Custom platform integrations

**📊 Use Cases:**
• CRM integration
• Custom dashboards
• Automated workflows
• Third-party app connections

**Available in:** Ultra Plan (₹599/month)
Ready to integrate? → [Upgrade to Ultra] [API Documentation] [Contact Sales]`,
    short:
      "Full REST API access available in Ultra plan. Webhooks, programmatic chat, custom integrations.",
    priority: 4,
  },
  {
    id: "mobile-optimization",
    category: "features",
    tags: ["mobile", "responsive", "app", "optimization"],
    questionPatterns: [
      "mobile\\s+support",
      "mobile\\s+app",
      "responsive",
      "mobile\\s+optimization",
    ],
    keywords: [
      "mobile",
      "responsive",
      "app",
      "phone",
      "tablet",
      "optimization",
    ],
    answer: `📱 TrulyBot Mobile Optimization:

**🎯 Fully Mobile-Responsive:**
✅ Perfect on all screen sizes
✅ Touch-optimized interface
✅ Fast mobile loading
✅ Native mobile feel

**📲 Mobile Features:**
• Responsive chat widget
• Touch-friendly buttons
• Mobile-optimized typing
• Swipe gestures support
• Portrait/landscape adaptation

**⚡ Performance:**
• <2 second load time on mobile
• Minimal data usage
• Battery-efficient design
• Offline message queuing

**🌐 Cross-Platform:**
• iOS Safari & Chrome
• Android browsers
• Tablet optimization
• PWA capabilities (roadmap)

**💡 Customer Experience:**
Your customers get the same professional experience on mobile as desktop!

Want to test mobile experience? → [View Mobile Demo] [Try Widget]`,
    short:
      "Fully responsive mobile widget, touch-optimized, fast loading, works perfectly on all devices.",
    priority: 4,
  },
  {
    id: "company-story",
    category: "about",
    tags: ["about", "story", "mission", "company"],
    questionPatterns: [
      "about\\s+trulybot",
      "company\\s+story",
      "mission",
      "founded",
      "who\\s+are\\s+you",
    ],
    keywords: [
      "about",
      "story",
      "mission",
      "company",
      "founded",
      "who",
      "history",
    ],
    answer: `⚡ About TrulyBot: Lightning-Fast AI Innovation

**🚀 Our Mission:**
Revolutionize customer support for businesses worldwide with intelligent, lightning-fast, easy-to-use AI chatbot solutions.

**📖 Our Story:**
Founded on the idea that every business deserves access to world-class AI technology. We saw online stores struggling with repetitive customer inquiries, losing time and sales. Traditional solutions were too complex or expensive.

**🎯 What We Built:**
More than just a chatbot - a dedicated AI partner trained on YOUR specific business knowledge. Every answer is grounded in your documents, FAQs, and policies for maximum accuracy.

**⚡ Core Philosophy:**
• **Lightning Speed**: Set up in minutes, not weeks
• **Accuracy & Trust**: No AI hallucinations, only facts
• **Empowering Growth**: Free your team to focus on business growth

**🏆 Proven Results:**
Join businesses reducing support tickets by 70% and increasing leads by 5X with our thunderbolt-speed AI responses.

Ready to experience the future? → [Start Free Trial] [See Demo] [Learn More]`,
    short:
      "Lightning-fast AI chatbot platform founded to give every business world-class AI technology in minutes.",
    priority: 4,
  },
  {
    id: "integrations-roadmap",
    category: "roadmap",
    keywords: [
      "integrations",
      "slack",
      "crm",
      "hubspot",
      "salesforce",
      "webhook",
      "zapier",
    ],
    questionPatterns: ["integrations", "roadmap\\s+integrations"],
    answer: `Integrations Roadmap:
- Slack handoff (agent escalation)
- CRM enrichment (HubSpot / Salesforce)
- Webhooks & Zapier triggers
- Documentation platform ingestion (Notion, knowledge base tools)
- Email escalation fallback

Want to prioritize one of these?`,
    short:
      "Slack, CRM (HubSpot/Salesforce), Webhooks/Zapier, docs ingestion, email escalation (roadmap).",
  },
  {
    id: "support-escalation",
    category: "support",
    keywords: ["escalation", "support", "handoff", "agent"],
    questionPatterns: ["support\\s+escalation", "escalate\\s+.*support"],
    answer: `Support Escalation:
Current: in-chat guidance or manual prompt to leave contact.
Roadmap: Slack channel push + optional email escalation triggers + internal agent notification.

Need a preview of how Slack escalation will work?`,
    short: "Current manual; roadmap adds Slack + email escalation.",
  },
  {
    id: "target-users",
    category: "market",
    keywords: ["target", "audience", "users", "who", "for"],
    questionPatterns: ["who\\s+is\\s+.*for", "target\\s+users"],
    answer: `Target Users:
- Indian e-commerce merchants & D2C brands seeking scalable support
- Early SaaS / digital platforms with rising repetitive inquiries
- Teams with limited support staff needing deflection + pre-sales guidance

Want to see differentiation next?`,
    short:
      "Indian e-commerce, scaling D2C, early SaaS with growing support volume.",
  },
  {
    id: "differentiation",
    category: "positioning",
    keywords: [
      "different",
      "differentiation",
      "unique",
      "compare",
      "why",
      "not",
      "gpt",
    ],
    questionPatterns: ["why\\s+not\\s+generic", "difference\\s+.*gpt"],
    answer: `Differentiation:
- Deterministic Q→A layer to reduce hallucination vs pure “chat GPT” style widgets.
- Intent gating prevents random early lead spam.
- Localized India-first pricing.
- Roadmap-driven integrations (Slack + CRM) focused on real workflow.
- Structured ingestion of policies & FAQs (not just free-form context stuffing).

Want limitations transparently stated?`,
    short:
      "Deterministic answers, intent gating, localized pricing, focused roadmap.",
  },
  {
    id: "localization",
    category: "features",
    keywords: [
      "localization",
      "language",
      "multi",
      "india",
      "regional",
      "hindi",
      "multilingual",
    ],
    questionPatterns: [
      "localization",
      "languages",
      "multi.*language",
      "hindi.*support",
      "regional.*support",
    ],
    answer: `🌍 TrulyBot Multi-Language & Localization:

**🎯 Current Language Support:**
✅ **English Primary** (optimized for Indian English)
✅ **Hindi Support** (Beta - India-focused)
✅ **Multi-language Detection** (automatic)
✅ **Regional Context** (India-first design)

**🚀 Advanced Language Features:**
• Auto-detect customer language preference
• Respond in customer's preferred language
• Support for regional business terminology
• India-specific cultural context

**📈 Expansion Roadmap:**
• Tamil, Telugu, Bengali support (Q1 2025)
• European languages (based on demand)
• Arabic & Southeast Asian languages
• Custom language training for enterprise

**💡 How It Works:**
• Upload content in multiple languages
• Bot automatically matches customer language
• Seamless switching between languages
• Maintain brand voice across languages

**🇮🇳 India-First Advantage:**
Built specifically for Indian market needs with local language nuances.

Ready for global customers? → [Start Free Trial] [Language Demo] [Custom Training]`,
    short:
      "English + Hindi support, multi-language roadmap, India-first design with regional context.",
    priority: 4,
  },
  {
    id: "roadmap",
    category: "roadmap",
    keywords: ["roadmap", "future", "planned", "coming"],
    questionPatterns: ["roadmap", "coming\\s+soon"],
    answer: `Roadmap (Condensed – subject to iteration):
- Deeper ingestion: Notion, PDFs, structured docs
- Slack + CRM (HubSpot / Salesforce) integration
- Webhooks + Zapier automation
- Analytics dashboard (deflection, satisfaction proxy, conversion funnels)
- Multi-language support
- Security expansions: SSO, RBAC, audit logs
- Advanced customization (theming layers, conditional flows)

Which of these is most critical for you?`,
    short:
      "Docs ingestion, Slack/CRM, Webhooks, Analytics, Multi-language, Security, Customization.",
  },
  {
    id: "limitations",
    category: "transparency",
    keywords: [
      "limitations",
      "limits",
      "not",
      "cannot",
      "missing",
      "ticketing",
    ],
    questionPatterns: [
      "limitations",
      "limit\\s+.*system",
      "ticketing\\s+system",
    ],
    answer: `Current Limitations:
- Not a full ticketing system (no full internal agent workspace yet)
- Limited to English (multi-language pending)
- Document ingestion breadth still expanding
- Advanced analytics dashboard not yet launched
- No fully automated retention controls (manual stage)
- Escalation workflow (Slack / email) still in roadmap stage

We surface these transparently to set correct expectations.

Want guidance on workaround strategies?`,
    short:
      "No full ticketing; English only; ingestion breadth growing; analytics & escalation in roadmap.",
  },
];

export function listKnowledgeIds(): string[] {
  return KNOWLEDGE_BASE.map((e) => e.id);
}
export function getKnowledgeEntry(id: string): KnowledgeEntry | undefined {
  return KNOWLEDGE_BASE.find((e) => e.id === id);
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
          const re = new RegExp(pattern, "i");
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
    const lowered = kws.map((k) => k.toLowerCase());
    const overlap = lowered.filter((k) => tokens.includes(k));
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

function buildResult(
  entry: KnowledgeEntry,
  direct: boolean,
  score: number,
): MatchResult {
  let truncated = false;
  let answer = entry.answer;
  if (answer.length > MAX_ANSWER_LENGTH) {
    answer =
      answer.slice(0, MAX_ANSWER_LENGTH) +
      " (Truncated) Ask for more detail if needed.";
    truncated = true;
  }
  return {
    id: entry.id,
    answer,
    directPattern: direct,
    score,
    truncated,
  };
}
