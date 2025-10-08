interface LeadDetection {
  email?: string;
  intentPrompt?: boolean;
}

const INTEREST_KEYWORDS = [
  'pricing','price','plan','buy','purchase','trial','subscribe','integration',
  'support','cost','charge','billing'
];

export function detectLead(userMessage: string): LeadDetection | null {
  const lower = userMessage.toLowerCase();
  let email: string | undefined;

  const emailMatch = userMessage.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if (emailMatch) email = emailMatch[0];

  const interest = INTEREST_KEYWORDS.some(k => lower.includes(k));
  if (!email && !interest) return null;

  return {
    email,
    intentPrompt: interest && !email
  };
}
