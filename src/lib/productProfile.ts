import { BRAND } from './branding';

export const PRODUCT_PROFILE = {
  name: BRAND.name,
  tagline: "India's smartest AI chatbot for e-commerce",
  positioning: [
    "Deploy in minutes; no heavy engineering.",
    "Answer customer FAQs 24/7 using your own business content.",
    "Improve CSAT and reduce support load/cost."
  ],
  coreFeatures: [
    "Document ingestion: paste or upload FAQs, policies, product data",
    "Retrieval-first answers for subscriber bots",
    "Fallback general product knowledge",
    "Lead capture (email, name) in chat",
    "Simple script embed / widget customization",
    "Indian market focus with INR pricing tiers"
  ],
  pricingSummary: [
    "Basic: entry tier (example message limits)",
    "Pro: unlimited messages",
    "Ultra: advanced customization + branding"
  ],
  benefits: [
    "Reduce repetitive support tickets",
    "Increase conversion via instant answers",
    "Collect qualified leads directly in chat",
    "Fast setup; no-code embedding"
  ],
  disallowedClaims: [
    "Project management (tasks, sprints, Kanban)",
    "Full CRM pipeline automation",
    "Source code deployment features",
    "Accounting / HR management",
    "Real-time order logistics tracking (unless you implement it later)"
  ],
  styleGuidelines: {
    maxWords: 130,
    tone: "Concise, clear, confident, honest",
    avoid: ["hype", "unverifiable claims", "exaggerations"]
  }
};