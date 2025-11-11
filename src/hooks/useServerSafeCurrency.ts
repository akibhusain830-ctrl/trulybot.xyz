'use client';

import { useEffect, useState } from 'react';

export interface CurrencyInfo {
  currency: 'INR';
  symbol: '₹';
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

// Function to get initial currency info - simplified to INR only
function getInitialCurrencyInfo(): CurrencyInfo {
  // Always use INR - no geolocation needed
  const country = getCookie('user-country') || 'IN';
  
  // Development only logging
  if (process.env.NODE_ENV === 'development') {
    console.log(`🎯 Currency simplified - Always INR for country: ${country}`);
  }
  
  // Always return INR
  return {
    currency: 'INR',
    symbol: '₹',
    isIndia: true,
    country,
    isLoading: false
  };
}

/**
 * Simplified currency detection hook - always returns INR
 */
export function useServerSafeCurrency(): CurrencyInfo {
  const [currencyInfo, setCurrencyInfo] = useState<CurrencyInfo>({
    currency: 'INR',
    symbol: '₹',
    isIndia: true,
    country: 'IN',
    isLoading: true
  });

  useEffect(() => {
    // Always get INR currency info
    const info = getInitialCurrencyInfo();
    setCurrencyInfo(info);
    
    // Development only logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`💰 Currency set to INR only:`, info);
    }
  }, []);

  return currencyInfo;
}

/**
 * Hook that provides stable currency info - always INR
 */
export function useStableCurrency(): Omit<CurrencyInfo, 'isLoading'> {
  const [currencyInfo, setCurrencyInfo] = useState<Omit<CurrencyInfo, 'isLoading'>>(() => {
    // Always use INR
    return {
      currency: 'INR',
      symbol: '₹',
      isIndia: true,
      country: 'IN'
    };
  });

  useEffect(() => {
    // Always use INR
    const info = getInitialCurrencyInfo();
    setCurrencyInfo(info);
  }, []);

  return currencyInfo;
}

/**
 * Simple hook for currency display - always INR
 */
export function useCurrencyDisplay() {
  return { currency: 'INR', symbol: '₹', isIndia: true };
}

/**
 * Get currency symbol - always INR symbol
 */
export function useCurrencySymbol(): string {
  return '₹';
}

/**
 * Check if user is from India - always true now
 */
export function useIsIndia(): boolean {
  return true;
}