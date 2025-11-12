export interface PricingTier {
  readonly id: string;
  readonly name: string;
  readonly monthlyInr: number;
  readonly yearlyInr: number;
  readonly description: string;
  readonly repliesAllowance: string;
  readonly features: readonly string[];
  readonly notes?: readonly string[];
  readonly fairUse?: boolean;
  readonly highlight?: boolean;
}

// Updated version - Final 4 pricing plans
export const PRICING_VERSION = '2025-11-11-FINAL-PRICING';

// Yearly pricing = monthly * 12 * 0.8 (20% discount), rounded to avoid floating point issues
export const PRICING_TIERS: readonly PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started with customer support.',
    monthlyInr: 0,
    yearlyInr: 0,
    repliesAllowance: '300 replies/month',
    highlight: false,
    features: [
      'Core AI Chatbot',
      'Lead Capture',
      '300 Replies/month',
      'Shopify & WordPress Integration',
      'Basic Support',
    ],
  },
  {
    id: 'basic',
    name: 'Basic',
    description: 'For growing stores needing more conversations.',
    monthlyInr: 499,
    yearlyInr: 499,
    repliesAllowance: '1,000 replies/month',
    highlight: false,
    features: [
      'Core AI Chatbot',
      'Lead Capture',
      '1,000 Replies/month',
      'Shopify & WordPress Integration',
      'Basic Support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Most popular for established e-commerce stores.',
    monthlyInr: 1499,
    yearlyInr: 1499,
    repliesAllowance: '3,000 replies/month',
    highlight: true,
    features: [
      'Core AI Chatbot',
      'Advanced Lead Capture',
      '3,000 Replies/month',
      'Shopify & WordPress Integration',
      'Priority Support',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For high-volume stores and teams that need more power.',
    monthlyInr: 2999,
    yearlyInr: 2999,
    repliesAllowance: '15,000 replies/month',
    highlight: false,
    features: [
      'Core AI Chatbot',
      'Advanced Lead Capture',
      '15,000 Replies/month',
      'Shopify & WordPress Integration',
      'Priority Support',
    ],
  },
];

export function getPricingTier(id: string): PricingTier | undefined {
  return PRICING_TIERS.find(t => t.id === id);
}