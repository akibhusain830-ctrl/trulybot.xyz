// Geolocation-based pricing utilities
'use client';

import { PRICING_TIERS, type PricingTier } from '@/lib/constants/pricing';

<<<<<<< HEAD
export type Currency = 'USD' | 'INR' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
export type CurrencySymbol = '$' | '₹' | '€' | '£' | 'C$' | 'A$';
=======
export type Currency = 'USD' | 'INR';
export type CurrencySymbol = '$' | '₹';
>>>>>>> afe65066d37e0367748c163325382d953fb420b4

export interface GeolocationResult {
  currency: Currency;
  symbol: CurrencySymbol;
  country: string;
  isIndia: boolean;
<<<<<<< HEAD
  region: string;
  isVpn: boolean;
  confidence: number;
=======
>>>>>>> afe65066d37e0367748c163325382d953fb420b4
}

// Cache geolocation result to avoid repeated API calls
let cachedGeolocation: GeolocationResult | null = null;

/**
<<<<<<< HEAD
 * Enhanced currency mapping for better global support
 */
const CURRENCY_MAP: Record<string, { currency: Currency; symbol: CurrencySymbol; region: string }> = {
  // India
  'IN': { currency: 'INR', symbol: '₹', region: 'South Asia' },
  
  // Europe
  'DE': { currency: 'EUR', symbol: '€', region: 'Europe' },
  'FR': { currency: 'EUR', symbol: '€', region: 'Europe' },
  'ES': { currency: 'EUR', symbol: '€', region: 'Europe' },
  'IT': { currency: 'EUR', symbol: '€', region: 'Europe' },
  'NL': { currency: 'EUR', symbol: '€', region: 'Europe' },
  
  // UK
  'GB': { currency: 'GBP', symbol: '£', region: 'Europe' },
  
  // Canada
  'CA': { currency: 'CAD', symbol: 'C$', region: 'North America' },
  
  // Australia/Oceania
  'AU': { currency: 'AUD', symbol: 'A$', region: 'Oceania' },
  'NZ': { currency: 'AUD', symbol: 'A$', region: 'Oceania' },
};

/**
 * Detect user's currency based on geolocation with enhanced reliability
 * Returns appropriate currency for user's location with VPN detection
=======
 * Detect user's currency based on geolocation
 * Returns INR for Indian visitors, USD for everyone else
>>>>>>> afe65066d37e0367748c163325382d953fb420b4
 */
export async function detectUserCurrency(): Promise<GeolocationResult> {
  // Return cached result if available
  if (cachedGeolocation) {
    return cachedGeolocation;
  }

<<<<<<< HEAD
  try {
    // Try multiple geolocation services with timeout and VPN detection
    const results = await Promise.allSettled([
      fetchFromCloudflare(),
      fetchFromIpApiSecure(),
      fetchFromIpInfo(),
      fetchFromIpGeolocation(),
    ]);

    // Find the first successful result
    const successfulResult = results.find(
      (result): result is PromiseFulfilledResult<GeolocationResult> => 
        result.status === 'fulfilled'
    );

    if (successfulResult) {
      cachedGeolocation = successfulResult.value;
      
      // Log analytics for geolocation success
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('trulybot:geolocation', {
            detail: { 
              success: true, 
              country: cachedGeolocation?.country,
              method: 'multiple-services',
              confidence: cachedGeolocation?.confidence 
            }
          }));
        }, 100);
      }
      
      return cachedGeolocation;
    }

    throw new Error('All geolocation services failed');
  } catch (error) {
    console.warn('Geolocation detection failed, using intelligent fallback:', error);
    
    // Intelligent fallback based on browser language and timezone
    const fallback = getIntelligentFallback();
    cachedGeolocation = fallback;
    
    // Log analytics for fallback
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('trulybot:geolocation', {
          detail: { 
            success: false, 
            fallback: true,
            method: 'browser-heuristics',
            confidence: fallback.confidence 
          }
        }));
      }, 100);
    }
    
=======
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
>>>>>>> afe65066d37e0367748c163325382d953fb420b4
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
<<<<<<< HEAD
 * Enhanced Cloudflare geolocation (most reliable)
=======
 * Cloudflare geolocation (most reliable)
>>>>>>> afe65066d37e0367748c163325382d953fb420b4
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
  
<<<<<<< HEAD
  const currencyInfo = CURRENCY_MAP[country] || { currency: 'USD' as Currency, symbol: '$' as CurrencySymbol, region: 'Unknown' };
  const isIndia = country === 'IN';
  
  return {
    currency: currencyInfo.currency,
    symbol: currencyInfo.symbol,
    country,
    isIndia,
    region: currencyInfo.region,
    isVpn: false, // Cloudflare usually accurate
    confidence: 0.95,
=======
  const isIndia = country === 'IN';
  
  return {
    currency: isIndia ? 'INR' : 'USD',
    symbol: isIndia ? '₹' : '$',
    country,
    isIndia,
>>>>>>> afe65066d37e0367748c163325382d953fb420b4
  };
}

/**
<<<<<<< HEAD
 * Secure IP-API geolocation (HTTPS)
 */
async function fetchFromIpApiSecure(): Promise<GeolocationResult> {
  const response = await fetch('https://ipapi.co/json/', {
    cache: 'no-store',
    signal: AbortSignal.timeout(4000)
  });
  
  if (!response.ok) throw new Error('IPApi.co failed');
  
  const data = await response.json();
  const country = data.country_code || 'Unknown';
  const currencyInfo = CURRENCY_MAP[country] || { currency: 'USD' as Currency, symbol: '$' as CurrencySymbol, region: 'Unknown' };
  const isIndia = country === 'IN';
  
  // Simple VPN detection based on data consistency
  const isVpn = !!(data.org && (
    data.org.toLowerCase().includes('vpn') ||
    data.org.toLowerCase().includes('proxy') ||
    data.org.toLowerCase().includes('hosting')
  ));
  
  return {
    currency: currencyInfo.currency,
    symbol: currencyInfo.symbol,
    country,
    isIndia,
    region: currencyInfo.region,
    isVpn,
    confidence: isVpn ? 0.6 : 0.85,
=======
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
>>>>>>> afe65066d37e0367748c163325382d953fb420b4
  };
}

/**
 * IPInfo geolocation (fallback)
 */
async function fetchFromIpInfo(): Promise<GeolocationResult> {
  const response = await fetch('https://ipinfo.io/json', {
    cache: 'no-store',
<<<<<<< HEAD
    signal: AbortSignal.timeout(4000)
=======
    signal: AbortSignal.timeout(3000)
>>>>>>> afe65066d37e0367748c163325382d953fb420b4
  });
  
  if (!response.ok) throw new Error('IPInfo failed');
  
  const data = await response.json();
  const country = data.country || 'Unknown';
<<<<<<< HEAD
  const currencyInfo = CURRENCY_MAP[country] || { currency: 'USD' as Currency, symbol: '$' as CurrencySymbol, region: 'Unknown' };
  const isIndia = country === 'IN';
  
  // Basic VPN detection
  const isVpn = !!(data.org && (
    data.org.toLowerCase().includes('vpn') ||
    data.org.toLowerCase().includes('hosting') ||
    data.org.toLowerCase().includes('cloud')
  ));
  
  return {
    currency: currencyInfo.currency,
    symbol: currencyInfo.symbol,
    country,
    isIndia,
    region: currencyInfo.region,
    isVpn,
    confidence: isVpn ? 0.5 : 0.8,
=======
  const isIndia = country === 'IN';
  
  return {
    currency: isIndia ? 'INR' : 'USD',
    symbol: isIndia ? '₹' : '$',
    country,
    isIndia,
>>>>>>> afe65066d37e0367748c163325382d953fb420b4
  };
}

/**
<<<<<<< HEAD
 * Additional geolocation service for redundancy
 */
async function fetchFromIpGeolocation(): Promise<GeolocationResult> {
  const response = await fetch('https://api.ipgeolocation.io/ipgeo?apiKey=free&fields=country_code2,isp', {
    cache: 'no-store',
    signal: AbortSignal.timeout(5000)
  });
  
  if (!response.ok) throw new Error('IPGeolocation failed');
  
  const data = await response.json();
  const country = data.country_code2 || 'Unknown';
  const currencyInfo = CURRENCY_MAP[country] || { currency: 'USD' as Currency, symbol: '$' as CurrencySymbol, region: 'Unknown' };
  const isIndia = country === 'IN';
  
  const isVpn = !!(data.isp && (
    data.isp.toLowerCase().includes('vpn') ||
    data.isp.toLowerCase().includes('proxy')
  ));
  
  return {
    currency: currencyInfo.currency,
    symbol: currencyInfo.symbol,
    country,
    isIndia,
    region: currencyInfo.region,
    isVpn,
    confidence: isVpn ? 0.4 : 0.75,
=======
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
>>>>>>> afe65066d37e0367748c163325382d953fb420b4
  };
}

/**
<<<<<<< HEAD
 * Intelligent fallback using browser heuristics
 */
function getIntelligentFallback(): GeolocationResult {
  if (typeof window === 'undefined') {
    return {
      currency: 'USD',
      symbol: '$',
      country: 'Unknown',
      isIndia: false,
      region: 'Unknown',
      isVpn: false,
      confidence: 0.3,
    };
  }

  // Use browser language and timezone for intelligent guessing
  const language = navigator.language || 'en-US';
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  let guessedCountry = 'US';
  let confidence = 0.4;
  
  // Language-based detection
  if (language.includes('hi') || language.includes('ta') || language.includes('te')) {
    guessedCountry = 'IN';
    confidence = 0.7;
  } else if (timezone.includes('Kolkata') || timezone.includes('Chennai')) {
    guessedCountry = 'IN';
    confidence = 0.8;
  } else if (language.startsWith('en-GB')) {
    guessedCountry = 'GB';
    confidence = 0.6;
  } else if (language.startsWith('en-CA')) {
    guessedCountry = 'CA';
    confidence = 0.6;
  } else if (language.startsWith('en-AU')) {
    guessedCountry = 'AU';
    confidence = 0.6;
  } else if (language.startsWith('de')) {
    guessedCountry = 'DE';
    confidence = 0.6;
  } else if (language.startsWith('fr')) {
    guessedCountry = 'FR';
    confidence = 0.6;
  }
  
  const currencyInfo = CURRENCY_MAP[guessedCountry] || { currency: 'USD' as Currency, symbol: '$' as CurrencySymbol, region: 'Unknown' };
  
  return {
    currency: currencyInfo.currency,
    symbol: currencyInfo.symbol,
    country: guessedCountry,
    isIndia: guessedCountry === 'IN',
    region: currencyInfo.region,
    isVpn: false,
    confidence,
=======
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
>>>>>>> afe65066d37e0367748c163325382d953fb420b4
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