/**
 * Non-intrusive monitoring layer that provides insights without affecting
 * existing functionality or performance
 */

import { logger } from '@/lib/logger';

export interface HealthMetrics {
  timestamp: string;
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  errorRate?: number;
  details?: Record<string, unknown>;
}

export interface PerformanceMetrics {
  operation: string;
  duration: number;
  success: boolean;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

class MonitoringService {
  private metrics: PerformanceMetrics[] = [];
  private healthChecks: Map<string, HealthMetrics> = new Map();
  private maxMetricsHistory = 1000; // Keep last 1000 metrics in memory

  /**
   * Track operation performance - non-blocking
   */
  trackPerformance(
    operation: string,
    duration: number,
    success: boolean,
    metadata?: Record<string, unknown>
  ): void {
    // Use setImmediate to avoid blocking the main thread
    setImmediate(() => {
      try {
        const metric: PerformanceMetrics = {
          operation,
          duration,
          success,
          timestamp: new Date().toISOString(),
          metadata
        };

        this.metrics.push(metric);

        // Keep memory usage reasonable
        if (this.metrics.length > this.maxMetricsHistory) {
          this.metrics = this.metrics.slice(-this.maxMetricsHistory);
        }

        // Log slow operations (non-blocking)
        if (duration > 5000) { // 5 seconds
          logger.warn('Slow operation detected', {
            operation,
            duration,
            success,
            metadata
          });
        }
      } catch (error) {
        // Never let monitoring break the application
        // Silently continue if monitoring fails
      }
    });
  }

  /**
   * Update health status - non-blocking
   */
  updateHealth(
    service: string,
    status: 'healthy' | 'degraded' | 'unhealthy',
    details?: Record<string, unknown>,
    responseTime?: number
  ): void {
    setImmediate(() => {
      try {
        const health: HealthMetrics = {
          timestamp: new Date().toISOString(),
          service,
          status,
          responseTime,
          details
        };

        this.healthChecks.set(service, health);

        // Log unhealthy services
        if (status === 'unhealthy') {
          logger.error('Service unhealthy', { service, details });
        } else if (status === 'degraded') {
          logger.warn('Service degraded', { service, details });
        }
      } catch (error) {
        // Never let monitoring break the application
      }
    });
  }

  /**
   * Get current health summary (safe, never throws)
   */
  getHealthSummary(): Record<string, HealthMetrics> {
    try {
      const summary: Record<string, HealthMetrics> = {};
      this.healthChecks.forEach((health, service) => {
        summary[service] = { ...health };
      });
      return summary;
    } catch {
      return {};
    }
  }

  /**
   * Get performance summary (safe, never throws)
   */
  getPerformanceSummary(): {
    totalOperations: number;
    successRate: number;
    averageResponseTime: number;
    slowOperations: number;
  } {
    try {
      if (this.metrics.length === 0) {
        return {
          totalOperations: 0,
          successRate: 0,
          averageResponseTime: 0,
          slowOperations: 0
        };
      }

      const successful = this.metrics.filter(m => m.success).length;
      const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);
      const slowOperations = this.metrics.filter(m => m.duration > 5000).length;

      return {
        totalOperations: this.metrics.length,
        successRate: (successful / this.metrics.length) * 100,
        averageResponseTime: totalDuration / this.metrics.length,
        slowOperations
      };
    } catch {
      return {
        totalOperations: 0,
        successRate: 0,
        averageResponseTime: 0,
        slowOperations: 0
      };
    }
  }

  /**
   * Clear old metrics to prevent memory leaks
   */
  cleanup(): void {
    try {
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      this.metrics = this.metrics.filter(
        m => new Date(m.timestamp).getTime() > oneHourAgo
      );
    } catch {
      // If cleanup fails, clear everything to prevent memory issues
      this.metrics = [];
    }
  }
}

// Global monitoring instance
const monitoring = new MonitoringService();

// Cleanup old metrics every hour
if (typeof window === 'undefined') { // Server-side only
  setInterval(() => {
    monitoring.cleanup();
  }, 60 * 60 * 1000); // 1 hour
}

/**
 * Wrapper function to monitor any async operation without affecting its behavior
 */
export async function withMonitoring<T>(
  operation: () => Promise<T>,
  operationName: string,
  metadata?: Record<string, unknown>
): Promise<T> {
  const startTime = Date.now();
  let success = false;
  
  try {
    const result = await operation();
    success = true;
    return result;
  } catch (error) {
    // Re-throw the error to maintain existing behavior
    throw error;
  } finally {
    // Always track performance, even if operation failed
    const duration = Date.now() - startTime;
    monitoring.trackPerformance(operationName, duration, success, metadata);
  }
}

/**
 * Non-intrusive database health check
 */
export async function checkDatabaseHealth(): Promise<void> {
  try {
    const startTime = Date.now();
    
    // Simple query that won't affect data
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    await supabase.from('profiles').select('id').limit(1);
    
    const responseTime = Date.now() - startTime;
    const status = responseTime > 5000 ? 'degraded' : 'healthy';
    
    monitoring.updateHealth('database', status, { 
      queryType: 'simple_select' 
    }, responseTime);
    
  } catch (error) {
    monitoring.updateHealth('database', 'unhealthy', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Check external service health (OpenAI, etc.)
 */
export async function checkExternalServiceHealth(
  serviceName: string,
  healthCheckFn: () => Promise<boolean>
): Promise<void> {
  try {
    const startTime = Date.now();
    const isHealthy = await healthCheckFn();
    const responseTime = Date.now() - startTime;
    
    monitoring.updateHealth(
      serviceName, 
      isHealthy ? 'healthy' : 'unhealthy',
      { checkType: 'function_call' },
      responseTime
    );
  } catch (error) {
    monitoring.updateHealth(serviceName, 'unhealthy', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

/**
 * Get monitoring dashboard data (safe for API endpoints)
 */
export function getMonitoringDashboard() {
  return {
    health: monitoring.getHealthSummary(),
    performance: monitoring.getPerformanceSummary(),
    timestamp: new Date().toISOString()
  };
}

/**
 * Log application startup metrics
 */
export function trackApplicationStart(): void {
  monitoring.updateHealth('application', 'healthy', {
    startTime: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform
  });
}

export { monitoring };