import { PRICING_TIERS } from '@/lib/constants/pricing';

export type Currency = 'INR';
export type CurrencySymbol = '₹';

export interface LocationAwarePricing {
  currency: Currency;
  symbol: CurrencySymbol;
  free: {
    monthly: number;
    yearly: number;
  };
  basic: {
    monthly: number;
    yearly: number;
  };
  pro: {
    monthly: number;
    yearly: number;
  };
  ultra: {
    monthly: number;
    yearly: number;
  };
}

/**
 * Get pricing information - now simplified to INR only
 */
export function getLocationAwarePricing(currency: Currency = 'INR'): LocationAwarePricing {
  return {
    currency: 'INR',
    symbol: '₹',
    free: {
      monthly: PRICING_TIERS[0].monthlyInr,
      yearly: PRICING_TIERS[0].yearlyInr,
    },
    basic: {
      monthly: PRICING_TIERS[1].monthlyInr,
      yearly: PRICING_TIERS[1].yearlyInr,
    },
    pro: {
      monthly: PRICING_TIERS[2].monthlyInr,
      yearly: PRICING_TIERS[2].yearlyInr,
    },
    ultra: {
      monthly: PRICING_TIERS[3].monthlyInr,
      yearly: PRICING_TIERS[3].yearlyInr,
    },
  };
}

/**
 * Generate pricing content for chatbot - simplified to INR only
 */
export function generatePricingContent(currency: Currency = 'INR', includeYearly: boolean = false): string {
  const pricing = getLocationAwarePricing(currency);
  
  let content = `💰 TrulyBot Pricing Plans (Indian Market):

**Free Plan** - ${pricing.symbol}0/month
• Perfect for testing our AI chatbot
• Up to 100 replies/month
• Basic knowledge base (500 words)
• 1 knowledge upload only

**Basic Plan** - ${pricing.symbol}${pricing.basic.monthly}/month`;
  
  if (includeYearly) {
    content += ` (${pricing.symbol}${Math.round(pricing.basic.yearly)}/year - Save 20%)`;
  }
  
  content += `
• Perfect for small businesses
• Up to 1,000 replies/month
• Basic AI responses & email support

**Pro Plan** - ${pricing.symbol}${pricing.pro.monthly}/month ⭐ Most Popular`;
  
  if (includeYearly) {
    content += ` (${pricing.symbol}${Math.round(pricing.pro.yearly)}/year - Save 20%)`;
  }
  
  content += `
• Best for growing businesses  
• Up to 10,000 replies/month
• Advanced AI with custom branding

**Ultra Plan** - ${pricing.symbol}${pricing.ultra.monthly}/month`;
  
  if (includeYearly) {
    content += ` (${pricing.symbol}${Math.round(pricing.ultra.yearly)}/year - Save 20%)`;
  }
  
  content += `
• For enterprise & high-volume
• Unlimited replies
• Premium features + API access

🎁 Start with a 7-day FREE trial - no credit card required!

Want me to help you choose the right plan?`;

  return content;
}

/**
 * Generate short pricing summary - simplified to INR only
 */
export function generateShortPricingSummary(currency: Currency = 'INR'): string {
  const pricing = getLocationAwarePricing(currency);
  return `Plans start at ${pricing.symbol}${pricing.basic.monthly}/month. Basic/Pro/Ultra tiers. 7-day free trial available.`;
}

/**
 * Generate FAQ pricing text for schema - simplified to INR only
 */
export function generateFAQPricingText(currency: Currency = 'INR'): string {
  const pricing = getLocationAwarePricing(currency);
  return `TrulyBot offers flexible pricing starting at ${pricing.symbol}${pricing.basic.monthly}/month for the Basic plan, ${pricing.symbol}${pricing.pro.monthly}/month for Pro, and ${pricing.symbol}${pricing.ultra.monthly}/month for Ultra. All plans include a free 7-day trial with no credit card required.`;
}

/**
 * Always returns INR currency - no geolocation needed
 */
export function detectCurrencyFromContext(request?: Request): Currency {
  return 'INR';
}

/**
 * Always returns INR currency - no browser detection needed
 */
export function detectCurrencyFromBrowser(): Currency {
  return 'INR';
}