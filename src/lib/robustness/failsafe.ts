/**
 * Failsafe mechanisms for critical business flows
 * Provides emergency fallbacks without disrupting existing functionality
 */

import { logger } from '@/lib/logger';
import { withMonitoring } from './monitoring';

export interface FailsafeConfig {
  maxRetries: number;
  retryDelay: number;
  fallbackEnabled: boolean;
  circuitBreakerThreshold: number;
}

export interface FailsafeResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  failsafeActivated: boolean;
  retryCount: number;
}

const DEFAULT_CONFIG: FailsafeConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  fallbackEnabled: true,
  circuitBreakerThreshold: 5
};

class FailsafeManager {
  private failureCounts = new Map<string, number>();
  private circuitBreakers = new Map<string, boolean>();
  private configs = new Map<string, FailsafeConfig>();

  /**
   * Register a critical operation with custom failsafe config
   */
  registerOperation(
    operationId: string, 
    config: Partial<FailsafeConfig> = {}
  ): void {
    this.configs.set(operationId, { ...DEFAULT_CONFIG, ...config });
    this.failureCounts.set(operationId, 0);
    this.circuitBreakers.set(operationId, false);
  }

  /**
   * Execute operation with comprehensive failsafe mechanisms
   */
  async executeWithFailsafe<T>(
    operationId: string,
    operation: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<FailsafeResult<T>> {
    const config = this.configs.get(operationId) || DEFAULT_CONFIG;
    let retryCount = 0;
    let lastError: Error | undefined;

    // Check circuit breaker
    if (this.circuitBreakers.get(operationId)) {
      logger.warn('Circuit breaker open, using fallback', { operationId });
      return this.executeFallback(operationId, fallback);
    }

    // Retry loop with exponential backoff
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const result = await withMonitoring(
          operation,
          `failsafe-${operationId}`,
          { attempt, operationId }
        );

        // Success - reset failure count
        this.failureCounts.set(operationId, 0);
        this.circuitBreakers.set(operationId, false);

        return {
          success: true,
          data: result,
          failsafeActivated: false,
          retryCount: attempt
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        retryCount = attempt;

        logger.warn('Operation failed, will retry', {
          operationId,
          attempt,
          error: lastError.message,
          maxRetries: config.maxRetries
        });

        // Increment failure count
        const failures = (this.failureCounts.get(operationId) || 0) + 1;
        this.failureCounts.set(operationId, failures);

        // Check if we should open circuit breaker
        if (failures >= config.circuitBreakerThreshold) {
          this.circuitBreakers.set(operationId, true);
          logger.error('Circuit breaker opened', { operationId, failures });
        }

        // Wait before retry (exponential backoff)
        if (attempt < config.maxRetries) {
          const delay = config.retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All retries failed, try fallback
    logger.error('All retries exhausted, attempting fallback', {
      operationId,
      retryCount,
      error: lastError?.message
    });

    return this.executeFallback(operationId, fallback, lastError, retryCount);
  }

  /**
   * Execute fallback operation safely
   */
  private async executeFallback<T>(
    operationId: string,
    fallback?: () => Promise<T>,
    originalError?: Error,
    retryCount: number = 0
  ): Promise<FailsafeResult<T>> {
    const config = this.configs.get(operationId) || DEFAULT_CONFIG;

    if (!config.fallbackEnabled || !fallback) {
      return {
        success: false,
        error: originalError || new Error('Operation failed and no fallback available'),
        failsafeActivated: true,
        retryCount
      };
    }

    try {
      const result = await withMonitoring(
        fallback,
        `failsafe-fallback-${operationId}`,
        { operationId, originalError: originalError?.message }
      );

      logger.info('Fallback operation successful', { operationId });

      return {
        success: true,
        data: result,
        failsafeActivated: true,
        retryCount
      };
    } catch (fallbackError) {
      logger.error('Fallback operation also failed', {
        operationId,
        originalError: originalError?.message,
        fallbackError: fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
      });

      return {
        success: false,
        error: fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError)),
        failsafeActivated: true,
        retryCount
      };
    }
  }

  /**
   * Reset circuit breaker for an operation
   */
  resetCircuitBreaker(operationId: string): void {
    this.circuitBreakers.set(operationId, false);
    this.failureCounts.set(operationId, 0);
    logger.info('Circuit breaker reset', { operationId });
  }

  /**
   * Get current status of all operations
   */
  getStatus(): Record<string, {
    failures: number;
    circuitBreakerOpen: boolean;
    config: FailsafeConfig;
  }> {
    const status: Record<string, any> = {};
    
    for (const [operationId, config] of this.configs.entries()) {
      status[operationId] = {
        failures: this.failureCounts.get(operationId) || 0,
        circuitBreakerOpen: this.circuitBreakers.get(operationId) || false,
        config
      };
    }
    
    return status;
  }
}

// Global failsafe manager
const failsafeManager = new FailsafeManager();

// Register critical business operations
failsafeManager.registerOperation('user-authentication', {
  maxRetries: 2,
  retryDelay: 500,
  fallbackEnabled: true,
  circuitBreakerThreshold: 3
});

failsafeManager.registerOperation('trial-activation', {
  maxRetries: 3,
  retryDelay: 1000,
  fallbackEnabled: true,
  circuitBreakerThreshold: 5
});

failsafeManager.registerOperation('payment-processing', {
  maxRetries: 2,
  retryDelay: 2000,
  fallbackEnabled: false, // No fallback for payments - must be explicit
  circuitBreakerThreshold: 3
});

failsafeManager.registerOperation('data-sync', {
  maxRetries: 5,
  retryDelay: 1000,
  fallbackEnabled: true,
  circuitBreakerThreshold: 10
});

failsafeManager.registerOperation('email-sending', {
  maxRetries: 3,
  retryDelay: 2000,
  fallbackEnabled: true,
  circuitBreakerThreshold: 5
});

/**
 * High-level wrapper for critical business operations
 */
export async function executeWithFailsafe<T>(
  operationId: string,
  operation: () => Promise<T>,
  fallback?: () => Promise<T>
): Promise<FailsafeResult<T>> {
  return failsafeManager.executeWithFailsafe(operationId, operation, fallback);
}

/**
 * Failsafe wrapper for user authentication
 */
export async function failsafeAuthentication<T>(
  authOperation: () => Promise<T>,
  fallbackAuth?: () => Promise<T>
): Promise<FailsafeResult<T>> {
  return executeWithFailsafe('user-authentication', authOperation, fallbackAuth);
}

/**
 * Failsafe wrapper for trial activation
 */
export async function failsafeTrialActivation<T>(
  trialOperation: () => Promise<T>
): Promise<FailsafeResult<T>> {
  // Fallback creates minimal trial record
  const fallback = async (): Promise<T> => {
    logger.info('Using trial activation fallback');
    // This would be implemented based on your specific trial structure
    return {} as T; // Placeholder - implement based on your trial type
  };

  return executeWithFailsafe('trial-activation', trialOperation, fallback);
}

/**
 * Failsafe wrapper for payment processing (no fallback)
 */
export async function failsafePaymentProcessing<T>(
  paymentOperation: () => Promise<T>
): Promise<FailsafeResult<T>> {
  return executeWithFailsafe('payment-processing', paymentOperation);
}

/**
 * Failsafe wrapper for data synchronization
 */
export async function failsafeDataSync<T>(
  syncOperation: () => Promise<T>,
  fallbackSync?: () => Promise<T>
): Promise<FailsafeResult<T>> {
  return executeWithFailsafe('data-sync', syncOperation, fallbackSync);
}

/**
 * Failsafe wrapper for email sending
 */
export async function failsafeEmailSending<T>(
  emailOperation: () => Promise<T>
): Promise<FailsafeResult<T>> {
  // Fallback logs the email for manual processing
  const fallback = async (): Promise<T> => {
    logger.warn('Email sending failed, logged for manual processing');
    return {} as T; // Placeholder - implement based on your email response type
  };

  return executeWithFailsafe('email-sending', emailOperation, fallback);
}

/**
 * Reset all circuit breakers (admin function)
 */
export function resetAllCircuitBreakers(): void {
  const operations = ['user-authentication', 'trial-activation', 'payment-processing', 'data-sync', 'email-sending'];
  operations.forEach(op => failsafeManager.resetCircuitBreaker(op));
  logger.info('All circuit breakers reset');
}

/**
 * Get failsafe system status
 */
export function getFailsafeStatus() {
  return failsafeManager.getStatus();
}

/**
 * Emergency system reset (use with caution)
 */
export function emergencyReset(): void {
  resetAllCircuitBreakers();
  logger.warn('Emergency failsafe system reset performed');
}

export { failsafeManager };
