// Performance optimization utilities for Core Web Vitals and SEO

export interface PerformanceConfig {
  enableImageOptimization: boolean;
  enableLazyLoading: boolean;
  enableCacheOptimization: boolean;
  enablePreload: boolean;
}

// Enhanced image loading with performance optimizations
export function optimizeImageLoading() {
  if (typeof window === 'undefined') return;

  // Preload critical images
  const criticalImages = [
    '/logo.svg',
    '/hero-bg.jpg',
    '/og-image.jpg'
  ];

  criticalImages.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });

  // Lazy load non-critical images
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

// Critical resource hints for better loading performance
export function addCriticalResourceHints() {
  if (typeof window === 'undefined') return;

  const resourceHints = [
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: '//ilcydjngyatddefgdjpg.supabase.co' },
    { rel: 'dns-prefetch', href: '//va.vercel-scripts.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
    { rel: 'preconnect', href: 'https://ilcydjngyatddefgdjpg.supabase.co' },
  ];

  resourceHints.forEach(hint => {
    const link = document.createElement('link');
    link.rel = hint.rel;
    link.href = hint.href;
    if (hint.crossorigin) {
      link.crossOrigin = hint.crossorigin;
    }
    document.head.appendChild(link);
  });
}

// Web Vitals optimization
export function optimizeWebVitals() {
  if (typeof window === 'undefined') return;

  // Optimize CLS (Cumulative Layout Shift)
  const optimizeCLS = () => {
    // Set explicit dimensions for images and embeds
    const images = document.querySelectorAll('img:not([width]):not([height])');
    images.forEach(img => {
      const element = img as HTMLImageElement;
      if (element.naturalWidth && element.naturalHeight) {
        element.width = element.naturalWidth;
        element.height = element.naturalHeight;
      }
    });

    // Reserve space for dynamic content
    const dynamicElements = document.querySelectorAll('[data-dynamic-content]');
    dynamicElements.forEach(el => {
      const element = el as HTMLElement;
      if (!element.style.minHeight) {
        element.style.minHeight = '200px';
      }
    });
  };

  // Optimize LCP (Largest Contentful Paint)
  const optimizeLCP = () => {
    // Preload LCP candidate elements
    const lcpCandidates = document.querySelectorAll('img, video, svg');
    lcpCandidates.forEach((element, index) => {
      if (index < 2) { // Preload first 2 candidates
        const el = element as HTMLImageElement;
        if (el.src) {
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = el.tagName.toLowerCase() === 'img' ? 'image' : 'video';
          link.href = el.src;
          document.head.appendChild(link);
        }
      }
    });
  };

  // Optimize FID (First Input Delay)
  const optimizeFID = () => {
    // Break up long tasks
    const longTasks = document.querySelectorAll('[data-heavy-computation]');
    longTasks.forEach(el => {
      const element = el as HTMLElement;
      element.addEventListener('click', (e) => {
        e.preventDefault();
        setTimeout(() => {
          // Process heavy computation in next tick
          element.dispatchEvent(new Event('process'));
        }, 0);
      });
    });
  };

  // Apply optimizations
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      optimizeCLS();
      optimizeLCP();
      optimizeFID();
    });
  } else {
    optimizeCLS();
    optimizeLCP();
    optimizeFID();
  }
}

// Service Worker for advanced caching
export function initializeServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        if (process.env.NODE_ENV === 'development') {
          console.log('SW registered: ', registration);
        }
      })
      .catch(registrationError => {
        if (process.env.NODE_ENV === 'development') {
          console.log('SW registration failed: ', registrationError);
        }
      });
  });
}

// Font loading optimization
export function optimizeFontLoading() {
  if (typeof window === 'undefined') return;

  // Use font-display: swap for custom fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.crossOrigin = 'anonymous';
  fontLink.href = '/fonts/inter-var.woff2';
  document.head.appendChild(fontLink);

  // Font loading API if available
  if ('fonts' in document) {
    const font = new FontFace('Inter', 'url(/fonts/inter-var.woff2)', {
      display: 'swap',
      weight: '100 900',
    });

    font.load().then(() => {
      (document as any).fonts.add(font);
      document.documentElement.classList.add('fonts-loaded');
    });
  }
}

// Critical CSS inlining utility
export function inlineCriticalCSS(criticalCSS: string) {
  if (typeof window === 'undefined') return;

  const style = document.createElement('style');
  style.textContent = criticalCSS;
  style.setAttribute('data-critical', 'true');
  document.head.appendChild(style);
}

// Comprehensive performance initialization
export function initializePerformanceOptimizations(config: PerformanceConfig = {
  enableImageOptimization: true,
  enableLazyLoading: true,
  enableCacheOptimization: true,
  enablePreload: true,
}) {
  if (typeof window === 'undefined') return;

  if (config.enablePreload) {
    addCriticalResourceHints();
  }

  if (config.enableImageOptimization) {
    optimizeImageLoading();
  }

  optimizeWebVitals();
  optimizeFontLoading();

  if (config.enableCacheOptimization) {
    initializeServiceWorker();
  }
}

// Performance monitoring utilities
export function trackWebVitals() {
  if (typeof window === 'undefined') return;

  // Track Core Web Vitals
  import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
    if (process.env.NODE_ENV === 'development') {
      onCLS(console.log);
      onINP(console.log); // INP replaced FID in newer versions
      onFCP(console.log);
      onLCP(console.log);
      onTTFB(console.log);
    }
  }).catch(() => {
    // Fallback if web-vitals package is not available
    if (process.env.NODE_ENV === 'development') {
      console.log('Web Vitals tracking not available');
    }
  });
}

// Analytics enhancement for Core Web Vitals
export function enhanceAnalyticsWithPerformance() {
  if (typeof window === 'undefined') return;

  // Custom performance metrics
  const performanceData = {
    loadTime: performance.now(),
    renderTime: 0,
    interactionTime: 0,
  };

  // Track render completion
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      performanceData.renderTime = performance.now();
    });
  }

  // Track first interaction
  const interactionEvents = ['click', 'keydown', 'scroll'];
  const trackFirstInteraction = () => {
    performanceData.interactionTime = performance.now();
    interactionEvents.forEach(event => {
      document.removeEventListener(event, trackFirstInteraction);
    });
  };

  interactionEvents.forEach(event => {
    document.addEventListener(event, trackFirstInteraction, { once: true });
  });

  // Send performance data to analytics
  window.addEventListener('beforeunload', () => {
    // Send data to your analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Data:', performanceData);
    }
  });
}