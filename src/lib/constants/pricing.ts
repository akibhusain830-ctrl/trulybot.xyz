export interface PricingTier {
  readonly id: string;
  readonly name: string;
  readonly monthlyInr: number;
  readonly yearlyInr: number;
  readonly description: string;
  readonly messageAllowance: string;
  readonly features: readonly string[];
  readonly notes?: readonly string[];
  readonly fairUse?: boolean;
  readonly highlight?: boolean;
}

// Updated version - INR only pricing
export const PRICING_VERSION = '2025-10-09-INR-ONLY';

// Yearly pricing = monthly * 12 * 0.8 (20% discount), rounded to avoid floating point issues
export const PRICING_TIERS: readonly PricingTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'For emerging businesses and startups.',
    monthlyInr: 99,
    yearlyInr: Math.round(99 * 12 * 0.8),  // 950
    messageAllowance: '1,000 conversations/month',
    highlight: false,
    features: [
      'Core AI Chatbot',
      '1,000 Conversations / Month',
      'Standard Knowledge Base (2,000 words)',
      '4 Knowledge Uploads',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'The most popular choice for growing e-commerce brands.',
    monthlyInr: 399,
    yearlyInr: Math.round(399 * 12 * 0.8), // 3831
    messageAllowance: 'Unlimited conversations',
    highlight: true,
    features: [
      'Core AI Chatbot',
      'Unlimited Conversations',
      'Expanded Knowledge Base (15,000 words)',
      '10 Knowledge Uploads',
      'Chatbot Personalization (Name & Welcome Message)',
      'Automated Lead Capture',
      'Priority Content Sync',
    ],
  },
  {
    id: 'ultra',
    name: 'Ultra',
    description: 'The ultimate toolkit for established businesses ready to maximize their growth.',
    monthlyInr: 599,
    yearlyInr: Math.round(599 * 12 * 0.8), // 5750
    messageAllowance: 'Unlimited conversations',
    highlight: false,
    features: [
      'Core AI Chatbot',
      'Unlimited Conversations',
      'Maximum Knowledge Base (50,000 words)',
      '25 Knowledge Uploads',
      'Full Brand Customization (Color, Theme, Logo, Name & Welcome Message)',
      'Enhanced Lead Capture',
      'Priority Support Queue',
    ],
  },
];

export function getPricingTier(id: string): PricingTier | undefined {
  return PRICING_TIERS.find(t => t.id === id);
}