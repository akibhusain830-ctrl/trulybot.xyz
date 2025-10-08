import { PRICING_TIERS } from '@/lib/constants/pricing';

export type Currency = 'USD' | 'INR';

export interface LocationAwarePricing {
  currency: Currency;
  symbol: string;
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
 * Get pricing information based on user's location/currency
 */
export function getLocationAwarePricing(currency: Currency = 'USD'): LocationAwarePricing {
  const isINR = currency === 'INR';
  
  return {
    currency,
    symbol: isINR ? '₹' : '$',
    basic: {
      monthly: isINR ? PRICING_TIERS[0].monthlyInr : PRICING_TIERS[0].monthlyUsd,
      yearly: isINR ? PRICING_TIERS[0].yearlyInr : PRICING_TIERS[0].yearlyUsd,
    },
    pro: {
      monthly: isINR ? PRICING_TIERS[1].monthlyInr : PRICING_TIERS[1].monthlyUsd,
      yearly: isINR ? PRICING_TIERS[1].yearlyInr : PRICING_TIERS[1].yearlyUsd,
    },
    ultra: {
      monthly: isINR ? PRICING_TIERS[2].monthlyInr : PRICING_TIERS[2].monthlyUsd,
      yearly: isINR ? PRICING_TIERS[2].yearlyInr : PRICING_TIERS[2].yearlyUsd,
    },
  };
}

/**
 * Generate pricing content for chatbot based on user's currency
 */
export function generatePricingContent(currency: Currency = 'USD', includeYearly: boolean = false): string {
  const pricing = getLocationAwarePricing(currency);
  const isINR = currency === 'INR';
  const regionText = isINR ? 'Indian market' : 'international market';
  
  let content = `💰 TrulyBot Pricing Plans (${regionText}):

**Basic Plan** - ${pricing.symbol}${pricing.basic.monthly}/month`;
  
  if (includeYearly) {
    content += ` (${pricing.symbol}${Math.round(pricing.basic.yearly)}/year - Save 20%)`;
  }
  
  content += `
• Perfect for small businesses
• Up to 1,000 conversations/month
• Basic AI responses & email support

**Pro Plan** - ${pricing.symbol}${pricing.pro.monthly}/month ⭐ Most Popular`;
  
  if (includeYearly) {
    content += ` (${pricing.symbol}${Math.round(pricing.pro.yearly)}/year - Save 20%)`;
  }
  
  content += `
• Best for growing businesses  
• Up to 10,000 conversations/month
• Advanced AI with custom branding

**Ultra Plan** - ${pricing.symbol}${pricing.ultra.monthly}/month`;
  
  if (includeYearly) {
    content += ` (${pricing.symbol}${Math.round(pricing.ultra.yearly)}/year - Save 20%)`;
  }
  
  content += `
• For enterprise & high-volume
• Unlimited conversations
• Premium features + API access

🎁 Start with a 7-day FREE trial - no credit card required!

Want me to help you choose the right plan?`;

  return content;
}

/**
 * Generate short pricing summary for quick responses
 */
export function generateShortPricingSummary(currency: Currency = 'USD'): string {
  const pricing = getLocationAwarePricing(currency);
  return `Plans start at ${pricing.symbol}${pricing.basic.monthly}/month. Basic/Pro/Ultra tiers. 7-day free trial available.`;
}

/**
 * Generate FAQ pricing text for schema
 */
export function generateFAQPricingText(currency: Currency = 'USD'): string {
  const pricing = getLocationAwarePricing(currency);
  return `TrulyBot offers flexible pricing starting at ${pricing.symbol}${pricing.basic.monthly}/month for the Basic plan, ${pricing.symbol}${pricing.pro.monthly}/month for Pro, and ${pricing.symbol}${pricing.ultra.monthly}/month for Ultra. All plans include a free 7-day trial with no credit card required.`;
}

/**
 * Detect currency from request headers or context
 */
export function detectCurrencyFromContext(request?: Request): Currency {
  if (!request) return 'USD';
  
  // Try to get country from various headers
  const country = 
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry') ||
    request.headers.get('x-forwarded-geo') ||
    request.headers.get('x-country-code');
  
  return country === 'IN' ? 'INR' : 'USD';
}

/**
 * Detect currency from browser/client-side context
 */
export function detectCurrencyFromBrowser(): Currency {
  if (typeof window === 'undefined') return 'USD';
  
  // Check for testing parameter first
  const urlParams = new URLSearchParams(window.location.search);
  const testCurrency = urlParams.get('currency');
  if (testCurrency === 'INR' || testCurrency === 'USD') {
    return testCurrency;
  }
  
  // Check localStorage first
  try {
    const cached = localStorage.getItem('user_currency');
    if (cached) {
      const parsed = JSON.parse(cached);
      return parsed.currency || 'USD';
    }
  } catch (error) {
    // Ignore parsing errors
  }
  
  // Fallback to timezone/language detection
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;
  
  if (timezone.includes('Asia/Kolkata') || 
      timezone.includes('Asia/Calcutta') || 
      language.startsWith('hi') || 
      language.includes('IN')) {
    return 'INR';
  }
  
  return 'USD';
}
