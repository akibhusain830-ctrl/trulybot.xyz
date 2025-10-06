// OAuth Analytics and Monitoring
// This module provides comprehensive tracking and monitoring for OAuth flows

export interface OAuthEvent {
  type: 'initiation' | 'success' | 'error' | 'callback_start' | 'callback_complete';
  provider: string;
  timestamp: string;
  userAgent?: string;
  ip?: string;
  processingTime?: number;
  error?: string;
  userId?: string;
  isNewUser?: boolean;
}

export class OAuthAnalytics {
  private events: OAuthEvent[] = [];
  private readonly maxEvents = 1000; // Keep last 1000 events in memory

  /**
   * Track OAuth event
   */
  track(event: Omit<OAuthEvent, 'timestamp'>): void {
    const fullEvent: OAuthEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };

    this.events.push(fullEvent);

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 OAuth Analytics:', fullEvent);
    }
  }

  /**
   * Get success rate for a time period
   */
  getSuccessRate(periodMs: number = 24 * 60 * 60 * 1000): number {
    const cutoff = Date.now() - periodMs;
    const recentEvents = this.events.filter(
      event => new Date(event.timestamp).getTime() > cutoff
    );

    if (recentEvents.length === 0) return 0;

    const successes = recentEvents.filter(event => event.type === 'success').length;
    const total = recentEvents.filter(
      event => event.type === 'success' || event.type === 'error'
    ).length;

    return total > 0 ? (successes / total) * 100 : 0;
  }

  /**
   * Get average processing time
   */
  getAverageProcessingTime(periodMs: number = 24 * 60 * 60 * 1000): number {
    const cutoff = Date.now() - periodMs;
    const recentEvents = this.events.filter(
      event => 
        new Date(event.timestamp).getTime() > cutoff && 
        event.processingTime !== undefined
    );

    if (recentEvents.length === 0) return 0;

    const totalTime = recentEvents.reduce(
      (sum, event) => sum + (event.processingTime || 0), 
      0
    );

    return totalTime / recentEvents.length;
  }

  /**
   * Get error breakdown
   */
  getErrorBreakdown(periodMs: number = 24 * 60 * 60 * 1000): Record<string, number> {
    const cutoff = Date.now() - periodMs;
    const errorEvents = this.events.filter(
      event => 
        new Date(event.timestamp).getTime() > cutoff && 
        event.type === 'error' && 
        event.error
    );

    const breakdown: Record<string, number> = {};
    
    errorEvents.forEach(event => {
      const errorType = event.error || 'unknown';
      breakdown[errorType] = (breakdown[errorType] || 0) + 1;
    });

    return breakdown;
  }

  /**
   * Get provider statistics
   */
  getProviderStats(periodMs: number = 24 * 60 * 60 * 1000): Record<string, {
    attempts: number;
    successes: number;
    errors: number;
    successRate: number;
  }> {
    const cutoff = Date.now() - periodMs;
    const recentEvents = this.events.filter(
      event => new Date(event.timestamp).getTime() > cutoff
    );

    const stats: Record<string, {
      attempts: number;
      successes: number;
      errors: number;
      successRate: number;
    }> = {};

    recentEvents.forEach(event => {
      if (!stats[event.provider]) {
        stats[event.provider] = {
          attempts: 0,
          successes: 0,
          errors: 0,
          successRate: 0
        };
      }

      if (event.type === 'initiation') {
        stats[event.provider].attempts++;
      } else if (event.type === 'success') {
        stats[event.provider].successes++;
      } else if (event.type === 'error') {
        stats[event.provider].errors++;
      }
    });

    // Calculate success rates
    Object.values(stats).forEach(providerStats => {
      const total = providerStats.successes + providerStats.errors;
      providerStats.successRate = total > 0 ? 
        (providerStats.successes / total) * 100 : 0;
    });

    return stats;
  }

  /**
   * Export analytics data for external systems
   */
  exportData(periodMs: number = 24 * 60 * 60 * 1000): {
    events: OAuthEvent[];
    summary: {
      totalEvents: number;
      successRate: number;
      averageProcessingTime: number;
      errorBreakdown: Record<string, number>;
      providerStats: Record<string, any>;
    };
  } {
    const cutoff = Date.now() - periodMs;
    const events = this.events.filter(
      event => new Date(event.timestamp).getTime() > cutoff
    );

    return {
      events,
      summary: {
        totalEvents: events.length,
        successRate: this.getSuccessRate(periodMs),
        averageProcessingTime: this.getAverageProcessingTime(periodMs),
        errorBreakdown: this.getErrorBreakdown(periodMs),
        providerStats: this.getProviderStats(periodMs)
      }
    };
  }
}

// Global analytics instance
export const oauthAnalytics = new OAuthAnalytics();