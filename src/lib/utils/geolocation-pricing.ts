// Simplified pricing utilities - INR only
'use client';

import { PRICING_TIERS, type PricingTier } from '@/lib/constants/pricing';

export type Currency = 'INR';
export type CurrencySymbol = '₹';

export interface GeolocationResult {
  currency: Currency;
  symbol: CurrencySymbol;
  country: string;
  isIndia: boolean;
  region: string;
  isVpn: boolean;
  confidence: number;
}


/**
 * Always return INR pricing - no geolocation needed
 */
export async function detectUserCurrency(): Promise<GeolocationResult> {
  return {
    currency: 'INR',
    symbol: '₹',
    country: 'IN',
    isIndia: true,
    region: 'India',
    isVpn: false,
    confidence: 1.0,
  };
}

/**
 * Get cached currency (always INR)
 */
export function getCachedUserCurrency(): GeolocationResult | null {
  return {
    currency: 'INR',
    symbol: '₹',
    country: 'IN',
    isIndia: true,
    region: 'India',
    isVpn: false,
    confidence: 1.0,
  };
}

/**
 * No-op cache function
 */
export function setCachedUserCurrency(result: GeolocationResult): void {
  // No longer needed - always INR
}
/**
 * Format price in INR
 */
export function formatPrice(
  amount: number, 
  currency: Currency,
  period: 'monthly' | 'yearly' = 'monthly'
): string {
  const periodText = period === 'yearly' ? '/year' : '/month';
  const roundedAmount = Math.round(amount);
  return `₹${roundedAmount}${periodText}`;
}

/**
 * Get pricing for a tier in INR
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
    amount = Math.round(tier.yearlyInr);
  } else {
    amount = tier.monthlyInr;
  }
  
  return {
    amount,
    formatted: formatPrice(amount, currency, period),
    currency: 'INR',
    symbol: '₹',
  };
}

/**
 * Get all pricing tiers in INR
 */
export function getAllTiersPricing(
  currency: Currency,
  period: 'monthly' | 'yearly' = 'monthly'
) {
  return PRICING_TIERS.map(tier => ({
    ...tier,
    pricing: getTierPricing(tier, 'INR', period),
  }));
}

/**
 * No-op refresh function
 */
export function refreshGeolocation(): void {
  // No longer needed - always INR
}