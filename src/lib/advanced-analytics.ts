// Advanced Analytics and Performance Tracking for TrulyBot

export interface AnalyticsEvent {
  event_name: string;
  event_category: string;
  event_label?: string;
  value?: number;
  user_properties?: Record<string, any>;
  custom_parameters?: Record<string, any>;
  timestamp: number;
  session_id: string;
  user_id?: string;
  page_url: string;
  referrer?: string;
  user_agent: string;
  country?: string;
  currency?: string;
}

export interface PerformanceMetrics {
  page_load_time: number;
  first_contentful_paint: number;
  largest_contentful_paint: number;
  first_input_delay: number;
  cumulative_layout_shift: number;
  time_to_first_byte: number;
  dom_content_loaded: number;
  page_url: string;
  timestamp: number;
  session_id: string;
  user_agent: string;
  connection_type?: string;
  device_type: string;
}

export interface GeolocationData {
  country: string;
  region: string;
  city: string;
  currency: string;
  timezone: string;
  ip_address?: string;
  accuracy: 'high' | 'medium' | 'low';
  source: 'cloudflare' | 'ip-api' | 'ipinfo' | 'ipgeolocation' | 'fallback';
  timestamp: number;
}

class AdvancedAnalytics {
  private sessionId: string;
  private userId?: string;
  private queue: AnalyticsEvent[] = [];
  private isOnline: boolean = navigator.onLine;
  private geolocationData?: GeolocationData;
  private performanceObserver?: PerformanceObserver;
  private config: {
    enablePerformanceTracking: boolean;
    enableGeolocationTracking: boolean;
    enableErrorTracking: boolean;
    enableUserBehaviorTracking: boolean;
    batchSize: number;
    flushInterval: number;
  };

  constructor(config = {}) {
    this.sessionId = this.getOrCreateSessionId();
    this.config = {
      enablePerformanceTracking: true,
      enableGeolocationTracking: true,
      enableErrorTracking: true,
      enableUserBehaviorTracking: true,
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      ...config,
    };

    this.initialize();
  }

  private initialize() {
    // Set up online/offline event listeners
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Set up periodic queue flushing
    setInterval(() => {
      if (this.isOnline && this.queue.length > 0) {
        this.flushQueue();
      }
    }, this.config.flushInterval);

    // Initialize tracking modules
    if (this.config.enablePerformanceTracking) {
      this.initializePerformanceTracking();
    }

    if (this.config.enableGeolocationTracking) {
      this.initializeGeolocationTracking();
    }

    if (this.config.enableErrorTracking) {
      this.initializeErrorTracking();
    }

    if (this.config.enableUserBehaviorTracking) {
      this.initializeUserBehaviorTracking();
    }

    // Track page view
    this.trackPageView();
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('trulybot_session_id');
    if (!sessionId) {
      sessionId = generateUUID();
      sessionStorage.setItem('trulybot_session_id', sessionId);
    }
    return sessionId;
  }

  public setUserId(userId: string) {
    this.userId = userId;
    localStorage.setItem('trulybot_user_id', userId);
  }

  private createBaseEvent(): Partial<AnalyticsEvent> {
    return {
      timestamp: Date.now(),
      session_id: this.sessionId,
      user_id: this.userId || localStorage.getItem('trulybot_user_id') || undefined,
      page_url: window.location.href,
      referrer: document.referrer || undefined,
      user_agent: navigator.userAgent,
      country: this.geolocationData?.country,
      currency: this.geolocationData?.currency,
    };
  }

  public track(
    eventName: string,
    category: string,
    label?: string,
    value?: number,
    customParams?: Record<string, any>
  ) {
    const event: AnalyticsEvent = {
      ...this.createBaseEvent(),
      event_name: eventName,
      event_category: category,
      event_label: label,
      value,
      custom_parameters: customParams,
    } as AnalyticsEvent;

    this.addToQueue(event);
  }

  public trackPageView() {
    this.track('page_view', 'navigation', window.location.pathname);
  }

  public trackUserAction(action: string, element?: string, value?: number) {
    this.track(action, 'user_interaction', element, value, {
      element_type: element,
      page_section: this.getCurrentPageSection(),
    });
  }

  public trackConversion(type: 'signup' | 'purchase' | 'trial_start' | 'subscription', value?: number, currency?: string) {
    this.track(`conversion_${type}`, 'conversion', type, value, {
      currency: currency || this.geolocationData?.currency,
      conversion_value: value,
    });
  }

  public trackGeolocationEvent(data: GeolocationData) {
    this.geolocationData = data;
    this.track('geolocation_detected', 'system', data.source, undefined, {
      country: data.country,
      region: data.region,
      city: data.city,
      currency: data.currency,
      timezone: data.timezone,
      accuracy: data.accuracy,
      source: data.source,
    });
  }

  private addToQueue(event: AnalyticsEvent) {
    this.queue.push(event);
    
    if (this.queue.length >= this.config.batchSize && this.isOnline) {
      this.flushQueue();
    }
  }

  private async flushQueue() {
    if (this.queue.length === 0) return;

    const eventsToSend = [...this.queue];
    this.queue = [];

    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: eventsToSend,
          metadata: {
            sdk_version: '1.0.0',
            platform: 'web',
            session_id: this.sessionId,
          },
        }),
      });
    } catch (error) {
      console.warn('Failed to send analytics:', error);
      // Re-add events to queue for retry
      this.queue.unshift(...eventsToSend);
    }
  }

  private initializePerformanceTracking() {
    // Track Core Web Vitals
    this.trackCoreWebVitals();
    
    // Track page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.trackPageLoadMetrics();
      }, 0);
    });

    // Track navigation performance
    if ('navigation' in performance) {
      this.trackNavigationTiming();
    }
  }

  private trackCoreWebVitals() {
    // First Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              this.track('performance_metric', 'core_web_vitals', 'fcp', entry.startTime);
            }
          });
        });
        observer.observe({ entryTypes: ['paint'] });
      } catch (e) {
        console.warn('Performance Observer not supported');
      }
    }

    // Largest Contentful Paint
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.track('performance_metric', 'core_web_vitals', 'lcp', lastEntry.startTime);
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP tracking not supported');
    }

    // First Input Delay
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          // Cast to PerformanceEventTiming for first-input entries
          const fidEntry = entry as any; // Using any for compatibility with different browser implementations
          if (fidEntry.processingStart && fidEntry.startTime) {
            this.track('performance_metric', 'core_web_vitals', 'fid', fidEntry.processingStart - fidEntry.startTime);
          }
        });
      });
      observer.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID tracking not supported');
    }

    // Cumulative Layout Shift
    try {
      let clsScore = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          // Cast to layout shift entry type
          const clsEntry = entry as any;
          if (!clsEntry.hadRecentInput && clsEntry.value) {
            clsScore += clsEntry.value;
          }
        });
        this.track('performance_metric', 'core_web_vitals', 'cls', clsScore);
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS tracking not supported');
    }
  }

  private trackPageLoadMetrics() {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (perfData) {
      // Use startTime (which is 0 for navigation entries) instead of navigationStart
      const navigationStart = perfData.startTime;
      const metrics: PerformanceMetrics = {
        page_load_time: perfData.loadEventEnd - navigationStart,
        first_contentful_paint: 0, // Will be set by observer
        largest_contentful_paint: 0, // Will be set by observer
        first_input_delay: 0, // Will be set by observer
        cumulative_layout_shift: 0, // Will be set by observer
        time_to_first_byte: perfData.responseStart - navigationStart,
        dom_content_loaded: perfData.domContentLoadedEventEnd - navigationStart,
        page_url: window.location.href,
        timestamp: Date.now(),
        session_id: this.sessionId,
        user_agent: navigator.userAgent,
        connection_type: (navigator as any).connection?.effectiveType || 'unknown',
        device_type: this.getDeviceType(),
      };

      this.track('performance_data', 'performance', 'page_load', metrics.page_load_time, metrics);
    }
  }

  private trackNavigationTiming() {
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    this.track('performance_metric', 'navigation', 'dns_lookup', perfData.domainLookupEnd - perfData.domainLookupStart);
    this.track('performance_metric', 'navigation', 'tcp_connect', perfData.connectEnd - perfData.connectStart);
    this.track('performance_metric', 'navigation', 'request_response', perfData.responseEnd - perfData.requestStart);
    this.track('performance_metric', 'navigation', 'dom_processing', perfData.domContentLoadedEventEnd - perfData.responseEnd);
  }

  private initializeGeolocationTracking() {
    // This would integrate with the existing geolocation system
    // The geolocation data would be passed to trackGeolocationEvent
  }

  private initializeErrorTracking() {
    window.addEventListener('error', (event) => {
      this.track('javascript_error', 'error', event.error?.name || 'Unknown', undefined, {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.track('promise_rejection', 'error', 'Unhandled Promise', undefined, {
        reason: event.reason?.toString(),
        stack: event.reason?.stack,
      });
    });
  }

  private initializeUserBehaviorTracking() {
    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', () => {
      const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        if (maxScrollDepth % 25 === 0) { // Track at 25%, 50%, 75%, 100%
          this.track('scroll_depth', 'engagement', `${maxScrollDepth}%`, maxScrollDepth);
        }
      }
    });

    // Track time on page
    let startTime = Date.now();
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Date.now() - startTime;
      this.track('time_on_page', 'engagement', window.location.pathname, timeOnPage);
    });

    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const tagName = target.tagName.toLowerCase();
      const className = target.className;
      const id = target.id;
      
      this.trackUserAction('click', `${tagName}${id ? `#${id}` : ''}${className ? `.${className}` : ''}`);
    });
  }

  private getCurrentPageSection(): string {
    const element = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
    return element?.closest('[data-section]')?.getAttribute('data-section') || 'unknown';
  }

  private getDeviceType(): string {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }

  // Public API for manual tracking
  public trackEvent(eventName: string, properties?: Record<string, any>) {
    this.track(eventName, 'custom', undefined, undefined, properties);
  }

  public trackTiming(name: string, duration: number, category = 'timing') {
    this.track('timing', category, name, duration);
  }

  public flush() {
    this.flushQueue();
  }
}

// Export singleton instance
export const analytics = new AdvancedAnalytics();

// Export class for custom instances
export { AdvancedAnalytics };

// Utility function for generating UUIDs
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
