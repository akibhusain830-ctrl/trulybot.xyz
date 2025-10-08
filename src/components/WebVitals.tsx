'use client';

import { useEffect } from 'react';

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// Core Web Vitals monitoring for SEO performance optimization
export function WebVitals() {
  useEffect(() => {
    // Dynamically import web-vitals to avoid SSR issues
    import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      
      const sendToAnalytics = (metric: WebVitalsMetric) => {
        // Log performance metrics for thunderbolt-speed optimization
        console.log(`⚡ ${metric.name}:`, metric.value, `(${metric.rating})`);
        
        // Send to Google Analytics if available
        if (window.gtag) {
          window.gtag('event', metric.name, {
            custom_parameter_1: metric.value,
            custom_parameter_2: metric.rating,
            event_category: 'Web Vitals',
            event_label: metric.id,
            value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          });
        }
        
        // Performance tracking for lightning-fast optimization
        if (typeof window !== 'undefined') {
          (window as any).trulyBotVitals = (window as any).trulyBotVitals || [];
          (window as any).trulyBotVitals.push({
            metric: metric.name,
            value: metric.value,
            rating: metric.rating,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
          });
        }
      };

      // Monitor all Core Web Vitals for SEO performance
      onCLS(sendToAnalytics);  // Cumulative Layout Shift
      onFCP(sendToAnalytics);  // First Contentful Paint
      onLCP(sendToAnalytics);  // Largest Contentful Paint  
      onTTFB(sendToAnalytics); // Time to First Byte
      onINP(sendToAnalytics);  // Interaction to Next Paint
    }).catch((error) => {
      console.warn('⚡ Web Vitals monitoring failed:', error);
    });
  }, []);

  return null;
}

// Performance monitoring hook for thunderbolt-speed tracking
export function usePerformanceMonitoring() {
  useEffect(() => {
    // Track page load performance for SEO optimization
    if (typeof window !== 'undefined' && 'performance' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            console.log('⚡ Navigation Performance:', {
              'DNS Lookup': navEntry.domainLookupEnd - navEntry.domainLookupStart,
              'TCP Connection': navEntry.connectEnd - navEntry.connectStart,
              'TLS Setup': navEntry.connectEnd - navEntry.secureConnectionStart,
              'Request Time': navEntry.responseStart - navEntry.requestStart,
              'Response Time': navEntry.responseEnd - navEntry.responseStart,
              'DOM Processing': navEntry.domContentLoadedEventEnd - navEntry.responseEnd,
              'Total Load Time': navEntry.loadEventEnd - navEntry.fetchStart
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['navigation'] });
      
      return () => observer.disconnect();
    }
  }, []);
}

export default WebVitals;
