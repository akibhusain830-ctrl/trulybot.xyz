export interface PricingTier {
  readonly id: string;
  readonly name: string;
  readonly monthlyInr: number;
  readonly monthlyUsd: number;
  readonly yearlyInr: number; // new
  readonly yearlyUsd: number; // new
  readonly description: string;
  readonly messageAllowance: string;
  readonly features: readonly string[];
  readonly notes?: readonly string[];
  readonly fairUse?: boolean;
  readonly highlight?: boolean;
}

// Updated version after INR pricing & yearly addition
export const PRICING_VERSION = '2025-09-30-3';

// Yearly pricing = monthly * 12 * 0.8 (20% discount)
export const PRICING_TIERS: readonly PricingTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'For emerging businesses and startups.',
    monthlyUsd: 5,
    monthlyInr: 99,
    yearlyUsd: 5 * 12 * 0.8,   // 48
    yearlyInr: 99 * 12 * 0.8,  // 950.4 -> round in UI
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
    monthlyUsd: 10,
    monthlyInr: 399,
    yearlyUsd: 10 * 12 * 0.8,  // 96
    yearlyInr: 399 * 12 * 0.8, // 3820.8
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
    monthlyUsd: 15,
    monthlyInr: 599,
    yearlyUsd: 15 * 12 * 0.8,  // 144
    yearlyInr: 599 * 12 * 0.8, // 5750.4
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