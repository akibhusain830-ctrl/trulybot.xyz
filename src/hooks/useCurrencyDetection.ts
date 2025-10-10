'use client';

import { useEffect, useState } from 'react';
import { 
  detectUserCurrency, 
  getCachedUserCurrency, 
  setCachedUserCurrency,
  type GeolocationResult 
} from '@/lib/utils/geolocation-pricing';

export interface UseCurrencyDetectionResult {
  currency: 'INR';
  symbol: '₹';
  isIndia: boolean;
  isLoading: boolean;
  country: string;
  region: string;
  confidence: number;
  isVpn: boolean;
}

/**
 * React hook for automatic currency detection - always returns INR
 */
export function useCurrencyDetection(): UseCurrencyDetectionResult {
  const [result, setResult] = useState<GeolocationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initializeCurrency() {
      try {
        setIsLoading(true);

        // Check localStorage first for instant loading
        const cached = getCachedUserCurrency();
        if (cached) {
          setResult(cached);
          setIsLoading(false);
          return;
        }

        // Detect currency via geolocation
        const detected = await detectUserCurrency();
        setResult(detected);
        
        // Cache the result
        setCachedUserCurrency(detected);
        
      } catch (error) {
        console.error('Currency detection failed:', error);
        // Fallback to INR
        const fallback: GeolocationResult = {
          currency: 'INR',
          symbol: '₹',
          country: 'Unknown',
          isIndia: false,
          region: 'Unknown',
          isVpn: false,
          confidence: 0.3,
        };
        setResult(fallback);
        setCachedUserCurrency(fallback);
      } finally {
        setIsLoading(false);
      }
    }

    initializeCurrency();
  }, []);

  // Default loading state
  if (isLoading || !result) {
    return {
      currency: 'INR',
      symbol: '₹',
      isIndia: false,
      isLoading: true,
      country: 'Unknown',
      region: 'Unknown',
      confidence: 0,
      isVpn: false,
    };
  }

  return {
    currency: result.currency,
    symbol: result.symbol,
    isIndia: result.isIndia,
    isLoading: false,
    country: result.country,
    region: result.region,
    confidence: result.confidence,
    isVpn: result.isVpn,
  };
}

/**
 * Hook for getting pricing with automatic currency detection
 */
export function usePricingWithCurrency() {
  const currencyInfo = useCurrencyDetection();
  
  return {
    ...currencyInfo,
    formatPrice: (amount: number, period: 'monthly' | 'yearly' = 'monthly') => {
      const periodText = period === 'yearly' ? '/year' : '/month';
      if (currencyInfo.currency === 'INR') {
        return `${currencyInfo.symbol}${Math.round(amount)}${periodText}`;
      } else {
        return `${currencyInfo.symbol}${amount}${periodText}`;
      }
    },
  };
}