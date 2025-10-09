'use client';

import { useEffect, useState } from 'react';

export interface CurrencyInfo {
  currency: 'USD' | 'INR' | 'EUR' | 'GBP' | 'CAD' | 'AUD';
  symbol: '$' | '₹' | '€' | '£' | 'C$' | 'A$';
  isIndia: boolean;
  country: string;
  isLoading: boolean;
}

// Function to get cookie value safely
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

// Robust currency detection with geolocation respect
function getGeoBasedCurrencyInfo(): CurrencyInfo {
  // Get geolocation data from middleware cookies
  const country = getCookie('user-country') || 'IN'; // Default to India
  const currency = getCookie('user-currency') as CurrencyInfo['currency'] || 'INR';
  const symbol = getCookie('currency-symbol') as CurrencyInfo['symbol'] || '₹';
  const isIndia = getCookie('is-india') === 'true' || country === 'IN';
  
  // Development only logging
  if (process.env.NODE_ENV === 'development') {
    console.log(`🎯 Currency detection - Country: ${country}, Currency: ${currency}, IsIndia: ${isIndia}`);
  }
  
  // ROBUST RULE: If India, always INR - if not India, respect geolocation
  if (country === 'IN' || isIndia) {
    return {
      currency: 'INR',
      symbol: '₹',
      isIndia: true,
      country: 'IN',
      isLoading: false
    };
  }
  
  // For non-Indian users, use detected currency
  return {
    currency,
    symbol,
    isIndia: false,
    country,
    isLoading: false
  };
}

/**
 * Robust geolocation-based currency detection hook
 * - Indians ALWAYS see INR (no USD flashing)
 * - International users see their local currency (USD, EUR, etc.)
 * - Uses server-side geolocation via middleware
 */
export function useRobustCurrency(): CurrencyInfo {
  const [currencyInfo, setCurrencyInfo] = useState<CurrencyInfo>({
    currency: 'INR',  // Safe default to prevent USD showing to Indians
    symbol: '₹',
    isIndia: true,
    country: 'IN',
    isLoading: true
  });

  useEffect(() => {
    // Get robust currency info based on geolocation
    const info = getGeoBasedCurrencyInfo();
    setCurrencyInfo(info);
    
    // Development only logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`💰 Final currency set:`, info);
    }
  }, []);

  return currencyInfo;
}

/**
 * Get currency symbol only
 */
export function useCurrencySymbol(): string {
  const { symbol } = useRobustCurrency();
  return symbol;
}

/**
 * Check if user is from India
 */
export function useIsIndia(): boolean {
  const { isIndia } = useRobustCurrency();
  return isIndia;
}