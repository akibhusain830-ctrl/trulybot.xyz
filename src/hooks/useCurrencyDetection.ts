'use client';

import { useEffect, useState } from 'react';
import { 
  detectUserCurrency, 
  getCachedUserCurrency, 
  setCachedUserCurrency,
  type GeolocationResult 
} from '@/lib/utils/geolocation-pricing';

export interface UseCurrencyDetectionResult {
  currency: 'USD' | 'INR';
  symbol: '$' | '₹';
  isIndia: boolean;
  isLoading: boolean;
  country: string;
}

/**
 * React hook for automatic currency detection based on user's location
 * Returns INR for Indian visitors, USD for international visitors
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
        // Fallback to USD
        const fallback: GeolocationResult = {
          currency: 'USD',
          symbol: '$',
          country: 'Unknown',
          isIndia: false,
        };
        setResult(fallback);
        setCachedUserCurrency(fallback);
      } finally {
        setIsLoading(false);
      }
    }

    initializeCurrency();
  }, []);

  // Return loading state until currency is detected
  if (isLoading || !result) {
    return {
      currency: 'USD', // Default to USD while loading
      symbol: '$',
      isIndia: false,
      isLoading: true,
      country: 'Unknown',
    };
  }

  return {
    currency: result.currency,
    symbol: result.symbol,
    isIndia: result.isIndia,
    isLoading: false,
    country: result.country,
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