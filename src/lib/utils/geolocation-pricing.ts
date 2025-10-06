// Geolocation-based pricing utilities
'use client';

import { PRICING_TIERS, type PricingTier } from '@/lib/constants/pricing';

export type Currency = 'USD' | 'INR';
export type CurrencySymbol = '$' | '₹';

export interface GeolocationResult {
  currency: Currency;
  symbol: CurrencySymbol;
  country: string;
  isIndia: boolean;
}

// Cache geolocation result to avoid repeated API calls
let cachedGeolocation: GeolocationResult | null = null;

/**
 * Detect user's currency based on geolocation
 * Returns INR for Indian visitors, USD for everyone else
 */
export async function detectUserCurrency(): Promise<GeolocationResult> {
  // Return cached result if available
  if (cachedGeolocation) {
    return cachedGeolocation;
  }

  // Check for manual override (for testing)
  if (typeof window !== 'undefined') {
    const override = new URLSearchParams(window.location.search).get('currency');
    if (override === 'INR' || override === 'USD') {
      const result: GeolocationResult = {
        currency: override as Currency,
        symbol: override === 'INR' ? '₹' : '$',
        country: override === 'INR' ? 'IN' : 'US',
        isIndia: override === 'INR',
      };
      cachedGeolocation = result;
      return result;
    }
  }

  try {
    // Try all geolocation services with timeout
    const services = [
      fetchFromIpInfo(),
      fetchFromIpApi(),
      fetchFromCloudflare(),
      fetchFromIpApiCom(),
      fetchFromFreeGeoIP()
    ];

    // Race all services but wait for at least one to complete
    const result = await Promise.race(services);
    
    // Validate result
    if (result && result.country) {
      cachedGeolocation = result;
      return result;
    }
    
    throw new Error('No valid geolocation result');

  } catch (error) {
    console.warn('All geolocation services failed, using heuristic detection:', error);
    
    // Try browser timezone as backup
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const isIndianTimezone = timezone === 'Asia/Kolkata' || 
                              timezone === 'Asia/Calcutta' ||
                              timezone.includes('Asia/India');
      
      if (isIndianTimezone) {
        const result: GeolocationResult = {
          currency: 'INR',
          symbol: '₹',
          country: 'IN',
          isIndia: true,
        };
        cachedGeolocation = result;
        return result;
      }
    } catch (timezoneError) {
      console.warn('Timezone detection failed:', timezoneError);
    }
    
    // Ultimate fallback - assume USD for international
    const fallback: GeolocationResult = {
      currency: 'USD',
      symbol: '$',
      country: 'Unknown',
      isIndia: false,
    };
    cachedGeolocation = fallback;
    return fallback;
  }
}

/**
 * Get user currency from localStorage (for persistence)
 */
export function getCachedUserCurrency(): GeolocationResult | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const cached = localStorage.getItem('user_currency');
    if (cached) {
      const parsed = JSON.parse(cached);
      return parsed;
    }
  } catch (error) {
    console.warn('Failed to parse cached currency:', error);
  }
  
  return null;
}

/**
 * Cache user currency in localStorage
 */
export function setCachedUserCurrency(result: GeolocationResult): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('user_currency', JSON.stringify(result));
  } catch (error) {
    console.warn('Failed to cache currency:', error);
  }
}

/**
 * Cloudflare geolocation (most reliable)
 */
async function fetchFromCloudflare(): Promise<GeolocationResult> {
  const response = await fetch('/cdn-cgi/trace', { 
    cache: 'no-store',
    signal: AbortSignal.timeout(3000) 
  });
  
  if (!response.ok) throw new Error('Cloudflare trace failed');
  
  const text = await response.text();
  const lines = text.split('\n');
  const countryLine = lines.find(line => line.startsWith('loc='));
  const country = countryLine ? countryLine.split('=')[1] : 'Unknown';
  
  const isIndia = country === 'IN';
  
  return {
    currency: isIndia ? 'INR' : 'USD',
    symbol: isIndia ? '₹' : '$',
    country,
    isIndia,
  };
}

/**
 * IP-API geolocation (free tier, reliable)
 */
async function fetchFromIpApi(): Promise<GeolocationResult> {
  const response = await fetch('https://ipapi.co/json/', {
    cache: 'no-store',
    signal: AbortSignal.timeout(3000)
  });
  
  if (!response.ok) throw new Error('IP-API failed');
  
  const data = await response.json();
  const country = data.country_code || 'Unknown';
  const isIndia = country === 'IN';
  
  return {
    currency: isIndia ? 'INR' : 'USD',
    symbol: isIndia ? '₹' : '$',
    country,
    isIndia,
  };
}

/**
 * IPInfo geolocation (fallback)
 */
async function fetchFromIpInfo(): Promise<GeolocationResult> {
  const response = await fetch('https://ipinfo.io/json', {
    cache: 'no-store',
    signal: AbortSignal.timeout(3000)
  });
  
  if (!response.ok) throw new Error('IPInfo failed');
  
  const data = await response.json();
  const country = data.country || 'Unknown';
  const isIndia = country === 'IN';
  
  return {
    currency: isIndia ? 'INR' : 'USD',
    symbol: isIndia ? '₹' : '$',
    country,
    isIndia,
  };
}

/**
 * IP-API.com geolocation (additional backup)
 */
async function fetchFromIpApiCom(): Promise<GeolocationResult> {
  const response = await fetch('https://ip-api.com/json/?fields=countryCode', {
    cache: 'no-store',
    signal: AbortSignal.timeout(3000)
  });
  
  if (!response.ok) throw new Error('IP-API.com failed');
  
  const data = await response.json();
  const country = data.countryCode || 'Unknown';
  const isIndia = country === 'IN';
  
  return {
    currency: isIndia ? 'INR' : 'USD',
    symbol: isIndia ? '₹' : '$',
    country,
    isIndia,
  };
}

/**
 * FreeGeoIP (additional backup)
 */
async function fetchFromFreeGeoIP(): Promise<GeolocationResult> {
  const response = await fetch('https://freeipapi.com/api/json', {
    cache: 'no-store',
    signal: AbortSignal.timeout(3000)
  });
  
  if (!response.ok) throw new Error('FreeGeoIP failed');
  
  const data = await response.json();
  const country = data.countryCode || 'Unknown';
  const isIndia = country === 'IN';
  
  return {
    currency: isIndia ? 'INR' : 'USD',
    symbol: isIndia ? '₹' : '$',
    country,
    isIndia,
  };
}

/**
 * Format price with appropriate currency
 */
export function formatPrice(
  amount: number, 
  currency: Currency,
  period: 'monthly' | 'yearly' = 'monthly'
): string {
  const symbol = currency === 'INR' ? '₹' : '$';
  const periodText = period === 'yearly' ? '/year' : '/month';
  
  if (currency === 'INR') {
    return `${symbol}${Math.round(amount)}${periodText}`;
  } else {
    return `${symbol}${amount}${periodText}`;
  }
}

/**
 * Get pricing for a tier in user's currency
 */
export function getTierPricing(
  tier: PricingTier,
  currency: Currency,
  period: 'monthly' | 'yearly' = 'monthly'
): {
  amount: number;
  formatted: string;
  currency: Currency;
  symbol: CurrencySymbol;
} {
  let amount: number;
  
  if (period === 'yearly') {
    amount = currency === 'INR' ? tier.yearlyInr : tier.yearlyUsd;
  } else {
    amount = currency === 'INR' ? tier.monthlyInr : tier.monthlyUsd;
  }
  
  return {
    amount,
    formatted: formatPrice(amount, currency, period),
    currency,
    symbol: currency === 'INR' ? '₹' : '$',
  };
}

/**
 * Get all pricing tiers with user's currency
 */
export function getAllTiersPricing(
  currency: Currency,
  period: 'monthly' | 'yearly' = 'monthly'
) {
  return PRICING_TIERS.map(tier => ({
    ...tier,
    pricing: getTierPricing(tier, currency, period),
  }));
}

/**
 * Force refresh geolocation (for testing)
 */
export function refreshGeolocation(): void {
  cachedGeolocation = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user_currency');
  }
}