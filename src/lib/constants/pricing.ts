export interface PricingTier {
  readonly id: string;
  readonly name: string;
  readonly monthlyInr: number;
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
    monthlyInr: 99,
    messageAllowance: '1,000 messages',
    features: [
      'Core chat widget',
      'Basic knowledge ingestion (FAQs, policies, site URL)',
      'Email capture (soft / optional)',
      'Starter analytics (basic counts)'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyInr: 299,
    messageAllowance: 'Unlimited*',
    fairUse: true,
    features: [
      'Everything in Basic',
      'Priority knowledge refresh',
      'Customization controls (styling, prompts)',
      'Early access to roadmap features'
    ],
    notes: ['Unlimited within fair use (soft caps, scaling dialogue)'],
    highlight: true
  },
  {
    id: 'ultra',
    name: 'Ultra',
    monthlyInr: 499,
    messageAllowance: 'Unlimited* + Branding Options',
    fairUse: true,
    features: [
      'Everything in Pro',
      'Advanced branding / white-label accents',
      'Deeper customization hooks',
      'Priority support response',
      'Roadmap beta invitations'
    ],
    notes: ['Best for scaling teams needing rapid iteration']
  }
];

export function getPricingTier(id: string): PricingTier | undefined {
  return PRICING_TIERS.find(t => t.id === id);
}