export interface PricingTier {
  readonly id: string;
  readonly name: string;
  readonly monthlyInr: number;
  readonly monthlyUsd: number;
  readonly description: string;
  readonly messageAllowance: string;
  readonly features: readonly string[];
  readonly notes?: readonly string[];
  readonly fairUse?: boolean;
  readonly highlight?: boolean;
}

export const PRICING_VERSION = '2025-09-21-1';

export const PRICING_TIERS: readonly PricingTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'For emerging businesses and startups.',
    monthlyUsd: 5,
    monthlyInr: 399,
    messageAllowance: '1,000 conversations/month',
    highlight: false,
    features: [
      'Core AI Chatbot',
      '1,000 Conversations / Month',
      'Standard Knowledge Base',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'The most popular choice for growing e-commerce brands.',
    monthlyUsd: 15,
    monthlyInr: 1199,
    messageAllowance: 'Unlimited conversations',
    highlight: true,
    features: [
      'Core AI Chatbot',
      'Unlimited Conversations',
      'Expanded Knowledge Base',
      'Chatbot Personalization (Name & Welcome Message)',
      'Automated Lead Capture',
      'Priority Content Sync',
    ],
  },
  {
    id: 'ultra',
    name: 'Ultra',
    description: 'The ultimate toolkit for established businesses ready to maximize their growth.',
    monthlyUsd: 30,
    monthlyInr: 2399,
    messageAllowance: 'Unlimited conversations',
    highlight: false,
    features: [
      'Core AI Chatbot',
      'Unlimited Conversations',
      'Maximum Knowledge Base',
      'Full Brand Customization (Color, Theme, Logo, Name & Welcome Message)',
      'Enhanced Lead Capture',
      'Priority Support Queue',
    ],
  },
];

export function getPricingTier(id: string): PricingTier | undefined {
  return PRICING_TIERS.find(t => t.id === id);
}