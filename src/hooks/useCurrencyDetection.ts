'use client';

import { useEffect, useState } from 'react';
import { 
  detectUserCurrency, 
  getCachedUserCurrency, 
  setCachedUserCurrency,
  type GeolocationResult 
} from '@/lib/utils/geolocation-pricing';

export interface UseCurrencyDetectionResult {
<<<<<<< HEAD
  currency: 'USD' | 'INR' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
  symbol: '$' | '₹' | '€' | '£' | 'C$' | 'A$';
  isIndia: boolean;
  isLoading: boolean;
  country: string;
  region: string;
  confidence: number;
  isVpn: boolean;
=======
  currency: 'USD' | 'INR';
  symbol: '$' | '₹';
  isIndia: boolean;
  isLoading: boolean;
  country: string;
>>>>>>> afe65066d37e0367748c163325382d953fb420b4
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
<<<<<<< HEAD
=======
          
          // Still detect in background to update cache if needed
          detectUserCurrency().then(detected => {
            if (detected.country !== cached.country) {
              setResult(detected);
              setCachedUserCurrency(detected);
            }
          }).catch(() => {
            // Keep cached result if background detection fails
          });
          
>>>>>>> afe65066d37e0367748c163325382d953fb420b4
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
<<<<<<< HEAD
          region: 'Unknown',
          isVpn: false,
          confidence: 0.3,
=======
>>>>>>> afe65066d37e0367748c163325382d953fb420b4
        };
        setResult(fallback);
        setCachedUserCurrency(fallback);
      } finally {
        setIsLoading(false);
      }
    }

    initializeCurrency();
  }, []);

<<<<<<< HEAD
  // Default loading state
  if (isLoading || !result) {
    return {
      currency: 'USD',
      symbol: '$',
      isIndia: false,
      isLoading: true,
      country: 'Unknown',
      region: 'Unknown',
      confidence: 0,
      isVpn: false,
=======
  // Return loading state until currency is detected
  if (isLoading || !result) {
    return {
      currency: 'INR', // Default to INR while loading (assuming Indian user)
      symbol: '₹',
      isIndia: true,
      isLoading: true,
      country: 'IN',
>>>>>>> afe65066d37e0367748c163325382d953fb420b4
    };
  }

  return {
    currency: result.currency,
    symbol: result.symbol,
    isIndia: result.isIndia,
    isLoading: false,
    country: result.country,
<<<<<<< HEAD
    region: result.region,
    confidence: result.confidence,
    isVpn: result.isVpn,
=======
>>>>>>> afe65066d37e0367748c163325382d953fb420b4
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