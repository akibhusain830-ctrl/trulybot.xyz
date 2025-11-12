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
  enterprise: {
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
    enterprise: {
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
• Up to 300 replies/month
• Basic knowledge base
• Lead capture included

**Basic Plan** - ${pricing.symbol}${pricing.basic.monthly}/month`;
  
  if (includeYearly) {
    content += ` (${pricing.symbol}${Math.round(pricing.basic.yearly)}/year - Save 20%)`;
  }
  
  content += `
• Perfect for small businesses
• Up to 1,000 replies/month
• Shopify & WordPress Integration
• Basic Support

**Pro Plan** - ${pricing.symbol}${pricing.pro.monthly}/month ⭐ Most Popular`;
  
  if (includeYearly) {
    content += ` (${pricing.symbol}${Math.round(pricing.pro.yearly)}/year - Save 20%)`;
  }
  
  content += `
• Best for established stores
• Up to 3,000 replies/month
• Advanced Lead Capture
• Priority Support

**Enterprise Plan** - ${pricing.symbol}${pricing.enterprise.monthly}/month`;
  
  if (includeYearly) {
    content += ` (${pricing.symbol}${Math.round(pricing.enterprise.yearly)}/year - Save 20%)`;
  }
  
  content += `
• For high-volume stores
• Up to 15,000 replies/month
• Advanced Lead Capture
• Priority Support

🎁 Start with a 7-day FREE trial - no credit card required!

Want me to help you choose the right plan?`;

  return content;
}

/**
 * Generate short pricing summary - simplified to INR only
 */
export function generateShortPricingSummary(currency: Currency = 'INR'): string {
  const pricing = getLocationAwarePricing(currency);
  return `Plans start at ${pricing.symbol}${pricing.free.monthly}/month (Free), ${pricing.symbol}${pricing.basic.monthly}/month (Basic), ${pricing.symbol}${pricing.pro.monthly}/month (Pro), ${pricing.symbol}${pricing.enterprise.monthly}/month (Enterprise). 7-day free trial available.`;
}

/**
 * Generate FAQ pricing text for schema - simplified to INR only
 */
export function generateFAQPricingText(currency: Currency = 'INR'): string {
  const pricing = getLocationAwarePricing(currency);
  return `TrulyBot offers flexible pricing starting with a Free plan (${pricing.symbol}${pricing.free.monthly}/month), Basic (${pricing.symbol}${pricing.basic.monthly}/month), Pro (${pricing.symbol}${pricing.pro.monthly}/month), and Enterprise (${pricing.symbol}${pricing.enterprise.monthly}/month). All paid plans include a free 7-day trial with no credit card required.`;
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