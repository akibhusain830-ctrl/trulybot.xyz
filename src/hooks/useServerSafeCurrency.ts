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

// Function to get initial currency info from cookies (prevents hydration issues)
function getInitialCurrencyInfo(): CurrencyInfo {
  // Get geolocation data from middleware cookies
  const country = getCookie('user-country') || 'IN'; // Default to India
  const currency = getCookie('user-currency') as CurrencyInfo['currency'] || 'INR';
  const symbol = getCookie('currency-symbol') as CurrencyInfo['symbol'] || '₹';
  const isIndia = getCookie('is-india') === 'true' || country === 'IN';
  
  console.log(`🎯 Currency detection - Country: ${country}, Currency: ${currency}, IsIndia: ${isIndia}`);
  
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
  
  // For non-Indian users, use detected currency from geolocation
  return {
    currency,
    symbol,
    isIndia: false,
    country,
    isLoading: false
  };
}

/**
 * Server-side safe currency detection hook that prevents hydration errors
 * Now uses robust geolocation-based currency detection:
 * - Indians ALWAYS see INR (no USD flashing)
 * - International users see their local currency (USD, EUR, etc.)
 */
export function useServerSafeCurrency(): CurrencyInfo {
  const [currencyInfo, setCurrencyInfo] = useState<CurrencyInfo>({
    currency: 'INR',  // Safe default to prevent USD showing to Indians
    symbol: '₹',
    isIndia: true,
    country: 'IN',
    isLoading: true
  });

  useEffect(() => {
    // Get robust currency info based on geolocation
    const info = getInitialCurrencyInfo();
    setCurrencyInfo(info);
    
    console.log(`💰 Currency set via useServerSafeCurrency:`, info);
  }, []);

  return currencyInfo;
}

/**
 * Hook that provides stable currency info without loading states
 * Now uses robust geolocation-based currency detection
 */
export function useStableCurrency(): Omit<CurrencyInfo, 'isLoading'> {
  const [currencyInfo, setCurrencyInfo] = useState<Omit<CurrencyInfo, 'isLoading'>>(() => {
    // Initialize with safe defaults that work on both server and client
    return {
      currency: 'INR',  // Safe default - Indians never see USD
      symbol: '₹',
      isIndia: true,
      country: 'IN'
    };
  });

  useEffect(() => {
    // Use robust geolocation-based detection
    const info = getInitialCurrencyInfo();
    setCurrencyInfo(info);
  }, []);

  return currencyInfo;
}

/**
 * Simple hook for currency display (legacy compatibility)
 */
export function useCurrencyDisplay() {
  const { currency, symbol, isIndia } = useServerSafeCurrency();
  return { currency, symbol, isIndia };
}

/**
 * Get currency symbol only
 */
export function useCurrencySymbol(): string {
  const { symbol } = useServerSafeCurrency();
  return symbol;
}

/**
 * Check if user is from India
 */
export function useIsIndia(): boolean {
  const { isIndia } = useServerSafeCurrency();
  return isIndia;
}