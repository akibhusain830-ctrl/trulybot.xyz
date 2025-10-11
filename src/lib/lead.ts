interface LeadDetection {
  email?: string;
  phone?: string;
  intentPrompt?: boolean;
  followUpRequest?: boolean;
}

const INTEREST_KEYWORDS = [
  "pricing",
  "price",
  "plan",
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
  "contact",
  "help",
];

const FOLLOW_UP_INDICATORS = [
  "follow up",
  "call me",
  "contact me",
  "get back",
  "reach out",
  "email me",
  "phone me",
  "call back",
  "more information",
  "detailed information",
  "speak with",
];

export function detectLead(userMessage: string): LeadDetection | null {
  const lower = userMessage.toLowerCase();
  let email: string | undefined;
  let phone: string | undefined;

  // Enhanced email detection
  const emailMatch = userMessage.match(
    /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  );
  if (emailMatch) email = emailMatch[0];

  // Enhanced phone number detection (various formats)
  const phonePatterns = [
    /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g, // US format
    /(?:\+?91[-.\s]?)?[6-9]\d{9}/g, // India format
    /(?:\+?44[-.\s]?)?\d{4}[-.\s]?\d{3}[-.\s]?\d{3}/g, // UK format
    /(?:\+?[1-9]\d{0,3}[-.\s]?)?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g, // General international
  ];

  for (const pattern of phonePatterns) {
    const phoneMatch = userMessage.match(pattern);
    if (phoneMatch) {
      phone = phoneMatch[0];
      break;
    }
  }

  const interest = INTEREST_KEYWORDS.some((k) => lower.includes(k));
  const followUpRequest = FOLLOW_UP_INDICATORS.some((k) => lower.includes(k));

  // Detect if no contact info but user is asking for help/follow-up
  if (!email && !phone && !interest && !followUpRequest) return null;

  return {
    email,
    phone,
    intentPrompt: interest && !email && !phone,
    followUpRequest: Boolean(followUpRequest || (interest && (email || phone))),
  };
}
