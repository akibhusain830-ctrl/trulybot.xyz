// Advanced Technical SEO Optimizations
// Latest Core Web Vitals, security headers, and modern web standards for maximum SEO performance

// Type declarations for external dependencies
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

interface WebVitalsMetric {
  value: number;
  name: string;
  rating?: 'good' | 'needs-improvement' | 'poor';
}

export interface TechnicalSEOConfig {
  enableAdvancedCaching?: boolean;
  enableSecurityHeaders?: boolean;
  enablePerformanceOptimizations?: boolean;
  enableWebVitalsTracking?: boolean;
  enableModernImageFormats?: boolean;
}

// Advanced security headers for better SEO ranking
export const ADVANCED_SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://checkout.razorpay.com https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; media-src 'self' https:; connect-src 'self' https: wss:; frame-src 'self' https://checkout.razorpay.com https://www.youtube.com;",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), payment=(self)',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-XSS-Protection': '1; mode=block',
  'Cross-Origin-Embedder-Policy': 'unsafe-none',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'cross-origin'
};

// Core Web Vitals optimization thresholds (2024 standards)
export const CORE_WEB_VITALS_TARGETS = {
  LCP: {
    good: 2500,    // Largest Contentful Paint (ms)
    needsImprovement: 4000,
    poor: Infinity
  },
  FID: {
    good: 100,     // First Input Delay (ms)
    needsImprovement: 300,
    poor: Infinity
  },
  CLS: {
    good: 0.1,     // Cumulative Layout Shift
    needsImprovement: 0.25,
    poor: Infinity
  },
  INP: {
    good: 200,     // Interaction to Next Paint (ms)
    needsImprovement: 500,
    poor: Infinity
  },
  FCP: {
    good: 1800,    // First Contentful Paint (ms)
    needsImprovement: 3000,
    poor: Infinity
  },
  TTFB: {
    good: 600,     // Time to First Byte (ms)
    needsImprovement: 1800,
    poor: Infinity
  }
};

// Advanced preload strategies for critical resources
export function generateCriticalResourceHints(): string[] {
  return [
    // Critical fonts
    '<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>',
    
    // Critical CSS
    '<link rel="preload" href="/styles/critical.css" as="style">',
    
    // Hero images with modern formats
    '<link rel="preload" href="/images/hero-banner.avif" as="image" type="image/avif">',
    '<link rel="preload" href="/images/hero-banner.webp" as="image" type="image/webp">',
    
    // Critical JavaScript
    '<link rel="preload" href="/js/critical.js" as="script">',
    
    // API prefetch for common routes
    '<link rel="prefetch" href="/api/geolocation">',
    '<link rel="prefetch" href="/api/pricing">',
    
    // DNS prefetch for external services
    '<link rel="dns-prefetch" href="//fonts.googleapis.com">',
    '<link rel="dns-prefetch" href="//checkout.razorpay.com">',
    '<link rel="dns-prefetch" href="//www.google-analytics.com">',
    
    // Preconnect for critical third-party origins
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    '<link rel="preconnect" href="https://checkout.razorpay.com">',
  ];
}

// Service Worker configuration for advanced caching
export const SERVICE_WORKER_CONFIG = {
  version: '1.3.0',
  cacheName: 'trulybot-cache-v1.3.0',
  staticAssets: [
    '/',
    '/manifest.json',
    '/favicon.svg',
    '/logo-trulybot.svg',
    '/styles/globals.css',
    '/js/critical.js'
  ],
  cacheStrategies: {
    pages: 'NetworkFirst',
    api: 'NetworkFirst',
    images: 'CacheFirst',
    fonts: 'CacheFirst',
    scripts: 'StaleWhileRevalidate',
    styles: 'StaleWhileRevalidate'
  },
  offlinePages: ['/offline']
};

// Advanced image optimization configurations
export const IMAGE_OPTIMIZATION = {
  formats: ['avif', 'webp', 'jpeg'],
  quality: {
    avif: 50,
    webp: 75,
    jpeg: 85
  },
  sizes: {
    hero: [1920, 1440, 1024, 768, 640, 480, 320],
    thumbnail: [400, 300, 200, 150],
    icon: [256, 128, 64, 32, 16]
  },
  lazyLoadingStrategy: 'intersection-observer',
  placeholderType: 'blur'
};

// Performance budget thresholds
export const PERFORMANCE_BUDGET = {
  javascript: 300 * 1024,    // 300KB max JS bundle
  css: 100 * 1024,          // 100KB max CSS
  images: 2 * 1024 * 1024,  // 2MB max images per page
  fonts: 150 * 1024,        // 150KB max fonts
  totalPageWeight: 3 * 1024 * 1024  // 3MB max total page weight
};

// Critical rendering path optimization
export function optimizeCriticalRenderingPath(): {
  inlineCSS: string;
  deferredCSS: string[];
  criticalJS: string;
  deferredJS: string[];
} {
  return {
    inlineCSS: `
      /* Critical above-the-fold styles */
      body { font-family: 'Inter', system-ui, sans-serif; margin: 0; }
      .hero { min-height: 50vh; display: flex; align-items: center; }
      .nav { position: fixed; top: 0; width: 100%; z-index: 1000; }
    `,
    deferredCSS: [
      '/styles/components.css',
      '/styles/animations.css',
      '/styles/responsive.css'
    ],
    criticalJS: `
      // Critical JavaScript for immediate functionality
      (function() {
        // Mobile menu toggle
        window.toggleMobileMenu = function() {
          document.querySelector('.mobile-menu').classList.toggle('open');
        };
        
        // Critical performance tracking
        if ('performance' in window) {
          window.addEventListener('load', function() {
            setTimeout(function() {
              const navigation = performance.getEntriesByType('navigation')[0];
              console.log('Page Load Time:', navigation.loadEventEnd - navigation.fetchStart);
            }, 0);
          });
        }
      })();
    `,
    deferredJS: [
      '/js/animations.js',
      '/js/analytics.js',
      '/js/chat-widget.js'
    ]
  };
}

// Advanced schema.org markup for technical SEO
export function generateTechnicalSEOSchemas(): any[] {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      url: 'https://trulybot.xyz',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://trulybot.xyz/search?q={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
      },
      sameAs: [
        'https://linkedin.com/company/trulybot',
        'https://twitter.com/trulybot'
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': 'https://trulybot.xyz/#organization',
      name: 'TrulyBot',
      url: 'https://trulybot.xyz',
      logo: {
        '@type': 'ImageObject',
        url: 'https://trulybot.xyz/logo-trulybot.svg',
        width: 512,
        height: 512
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+91-8638574534',
        contactType: 'customer service',
        availableLanguage: ['English', 'Hindi']
      }
    }
  ];
}

// Robots.txt optimization for better crawling
export const ADVANCED_ROBOTS_TXT = `# TrulyBot - Advanced SEO Robots.txt Configuration
User-agent: *
Allow: /

# Allow specific search engine bots
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Slurp
Allow: /
Crawl-delay: 2

User-agent: DuckDuckBot
Allow: /
Crawl-delay: 1

User-agent: Baiduspider
Allow: /
Crawl-delay: 2

User-agent: YandexBot
Allow: /
Crawl-delay: 2

# Disallow sensitive areas
Disallow: /dashboard/
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /widget/iframe
Disallow: /embed/private

# Allow important API endpoints for SEO
Allow: /api/og/
Allow: /api/sitemap
Allow: /widget/loader.js

# Disallow URL parameters that create duplicate content
Disallow: /*?*
Disallow: /*#*
Disallow: /*&*

# Allow social media and sharing parameters
Allow: /*?utm_*
Allow: /*?ref=*
Allow: /*?source=*

# Sitemap locations
Sitemap: https://trulybot.xyz/sitemap.xml
Sitemap: https://trulybot.xyz/sitemap-images.xml
Sitemap: https://trulybot.xyz/sitemap-pages.xml
Sitemap: https://trulybot.xyz/sitemap-blog.xml

# Host directive for preferred domain
Host: https://trulybot.xyz`;

// JSON-LD for enhanced technical SEO
export function generateTechnicalJSONLD(): string {
  const schemas = generateTechnicalSEOSchemas();
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': schemas
  });
}

// Performance monitoring configuration
export interface PerformanceMetrics {
  LCP: number;
  FID: number;
  CLS: number;
  INP: number;
  FCP: number;
  TTFB: number;
  timestamp: number;
  url: string;
  userAgent: string;
  connection?: string;
}

export function trackAdvancedWebVitals(): void {
  if (typeof window === 'undefined') return;
  
  const metrics: Partial<PerformanceMetrics> = {
    timestamp: Date.now(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    connection: (navigator as any).connection?.effectiveType
  };
  
  // Track TTFB and basic navigation metrics
  if ('performance' in window && 'getEntriesByType' in performance) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as any;
        if (navigation) {
          metrics.TTFB = navigation.responseStart - navigation.fetchStart;
          metrics.FCP = navigation.domContentLoadedEventEnd - navigation.fetchStart;
          sendMetricsToAnalytics(metrics);
        }
      }, 0);
    });
  }
  
  // Track LCP using PerformanceObserver
  if ('PerformanceObserver' in window) {
    try {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          metrics.LCP = lastEntry.startTime;
          sendMetricsToAnalytics(metrics);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      
      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          metrics.FID = entry.processingStart - entry.startTime;
          sendMetricsToAnalytics(metrics);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      
      // Cumulative Layout Shift
      let clsScore = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        });
        metrics.CLS = clsScore;
        sendMetricsToAnalytics(metrics);
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      
    } catch (error) {
      console.warn('Performance Observer not fully supported');
    }
  }
}

function sendMetricsToAnalytics(metrics: Partial<PerformanceMetrics>): void {
  // Send to analytics service
  if (window.gtag) {
    window.gtag('event', 'web_vitals', {
      custom_parameter: JSON.stringify(metrics),
      event_category: 'Performance',
      non_interaction: true
    });
  }
  
  // Send to custom analytics endpoint
  fetch('/api/analytics/web-vitals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metrics)
  }).catch(() => {}); // Silently fail to not impact performance
}

// Initialize all technical SEO optimizations
export function initializeAdvancedTechnicalSEO(config: TechnicalSEOConfig = {}): void {
  const {
    enableAdvancedCaching = true,
    enableSecurityHeaders = true,
    enablePerformanceOptimizations = true,
    enableWebVitalsTracking = true,
    enableModernImageFormats = true
  } = config;
  
  if (typeof window === 'undefined') return; // Server-side only setup
  
  if (enableWebVitalsTracking) {
    trackAdvancedWebVitals();
  }
  
  if (enablePerformanceOptimizations) {
    // Initialize critical rendering path optimizations
    const criticalPath = optimizeCriticalRenderingPath();
    
    // Inject critical CSS
    const style = document.createElement('style');
    style.textContent = criticalPath.inlineCSS;
    document.head.appendChild(style);
    
    // Defer non-critical CSS
    criticalPath.deferredCSS.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.media = 'print';
      link.onload = () => { link.media = 'all'; };
      document.head.appendChild(link);
    });
    
    // Execute critical JavaScript
    const script = document.createElement('script');
    script.textContent = criticalPath.criticalJS;
    document.head.appendChild(script);
  }
  
  if (enableAdvancedCaching && 'serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(console.warn);
  }
  
  // Add technical SEO meta tags
  const head = document.head;
  
  // Add JSON-LD structured data
  const jsonLdScript = document.createElement('script');
  jsonLdScript.type = 'application/ld+json';
  jsonLdScript.textContent = generateTechnicalJSONLD();
  head.appendChild(jsonLdScript);
  
  console.log('🚀 TrulyBot Advanced Technical SEO initialized');
}
