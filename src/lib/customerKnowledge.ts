// Customer-specific knowledge management system
export interface CustomerKnowledgeEntry {
  readonly id: string;
  readonly userId: string;
  readonly category: string;
  readonly question: string;
  readonly answer: string;
  readonly priority: number;
  readonly tags: readonly string[];
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface BusinessInfo {
  readonly businessName?: string;
  readonly businessType?: string;
  readonly industry?: string;
  readonly website?: string;
  readonly email?: string;
  readonly phone?: string;
  readonly address?: string;
  readonly businessHours?: string;
  readonly supportEmail?: string;
  readonly returnPolicy?: string;
  readonly shippingPolicy?: string;
  readonly languages?: readonly string[];
}

// Default business information template
export const DEFAULT_BUSINESS_INFO: Partial<BusinessInfo> = {
  businessType: "E-commerce Store",
  businessHours: "9 AM - 6 PM (Monday to Saturday)",
  languages: ["English"],
};

// Common e-commerce FAQ templates
export const ECOMMERCE_FAQ_TEMPLATES: CustomerKnowledgeEntry[] = [
  {
    id: "business-hours",
    userId: "template",
    category: "general",
    question: "What are your business hours?",
    answer:
      "Our business hours are {{BUSINESS_HOURS}}. Feel free to contact us during these times for immediate assistance!",
    priority: 5,
    tags: ["hours", "contact", "support"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "contact-info",
    userId: "template",
    category: "contact",
    question: "How can I contact customer support?",
    answer:
      "You can reach our customer support team at {{SUPPORT_EMAIL}} or call us at {{PHONE}}. We're here to help during our business hours: {{BUSINESS_HOURS}}.",
    priority: 5,
    tags: ["contact", "support", "email", "phone"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "return-policy",
    userId: "template",
    category: "policy",
    question: "What is your return policy?",
    answer:
      "{{RETURN_POLICY}} For specific questions about returns, please contact our support team at {{SUPPORT_EMAIL}}.",
    priority: 4,
    tags: ["returns", "policy", "refund"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "shipping-policy",
    userId: "template",
    category: "shipping",
    question: "What is your shipping policy?",
    answer:
      "{{SHIPPING_POLICY}} For specific shipping questions, please contact us at {{SUPPORT_EMAIL}}.",
    priority: 4,
    tags: ["shipping", "delivery", "policy"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "website-link",
    userId: "template",
    category: "general",
    question: "What is your website?",
    answer:
      "You can visit our website at {{WEBSITE}} for more information about our products and services.",
    priority: 3,
    tags: ["website", "link", "information"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export function interpolateBusinessInfo(
  text: string,
  businessInfo: BusinessInfo,
): string {
  let result = text;

  // Replace placeholders with actual business information
  result = result.replace(
    /\{\{BUSINESS_NAME\}\}/g,
    businessInfo.businessName || "our business",
  );
  result = result.replace(
    /\{\{BUSINESS_HOURS\}\}/g,
    businessInfo.businessHours ||
      DEFAULT_BUSINESS_INFO.businessHours ||
      "regular business hours",
  );
  result = result.replace(
    /\{\{WEBSITE\}\}/g,
    businessInfo.website || "our website",
  );
  result = result.replace(
    /\{\{EMAIL\}\}/g,
    businessInfo.email || "our contact email",
  );
  result = result.replace(
    /\{\{PHONE\}\}/g,
    businessInfo.phone || "our phone number",
  );
  result = result.replace(
    /\{\{SUPPORT_EMAIL\}\}/g,
    businessInfo.supportEmail || businessInfo.email || "our support team",
  );
  result = result.replace(
    /\{\{RETURN_POLICY\}\}/g,
    businessInfo.returnPolicy ||
      "Please check our website for our complete return policy.",
  );
  result = result.replace(
    /\{\{SHIPPING_POLICY\}\}/g,
    businessInfo.shippingPolicy ||
      "Please check our website for our shipping information.",
  );
  result = result.replace(
    /\{\{ADDRESS\}\}/g,
    businessInfo.address || "our location",
  );

  return result;
}

export function findCustomerKnowledgeAnswer(
  userMessage: string,
  knowledgeBase: CustomerKnowledgeEntry[],
  businessInfo: BusinessInfo,
): { entry: CustomerKnowledgeEntry; answer: string; score: number } | null {
  const userLower = userMessage.toLowerCase();
  const tokens = userLower.split(/\s+/).filter(Boolean);

  let bestMatch: { entry: CustomerKnowledgeEntry; score: number } | null = null;

  for (const entry of knowledgeBase) {
    if (!entry.isActive) continue;

    let score = 0;

    // Check question similarity
    const questionLower = entry.question.toLowerCase();
    if (questionLower.includes(userLower)) {
      score += 10;
    }

    // Check tag matches
    for (const tag of entry.tags) {
      if (userLower.includes(tag.toLowerCase())) {
        score += 3;
      }
    }

    // Check token overlap
    const questionTokens = questionLower.split(/\s+/).filter(Boolean);
    const commonTokens = tokens.filter((token) =>
      questionTokens.includes(token),
    );
    score += commonTokens.length;

    // Priority boost
    score += entry.priority;

    if (score > 5 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { entry, score };
    }
  }

  if (bestMatch) {
    const interpolatedAnswer = interpolateBusinessInfo(
      bestMatch.entry.answer,
      businessInfo,
    );
    return {
      entry: bestMatch.entry,
      answer: interpolatedAnswer,
      score: bestMatch.score,
    };
  }

  return null;
}

// Helper function to create customer-friendly fallback responses
export function createCustomerFallback(businessInfo: BusinessInfo): string {
  const responses = [
    `I'd be happy to help! For specific information about ${businessInfo.businessName || "our products and services"}, please visit ${businessInfo.website || "our website"} or contact our team directly.`,

    `Thanks for your question! While I don't have that specific information, you can reach our support team at ${businessInfo.supportEmail || businessInfo.email || "our contact page"} for detailed assistance.`,

    `I want to make sure you get accurate information. Please check ${businessInfo.website || "our website"} or contact us during our business hours: ${businessInfo.businessHours || "regular business hours"}.`,

    `For the most up-to-date information about that topic, I recommend visiting ${businessInfo.website || "our website"} or contacting our team directly. Is there anything else I can help with?`,
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}
