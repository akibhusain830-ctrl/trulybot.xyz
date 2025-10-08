import { logger } from '@/lib/logger';

/**
 * Enhanced error handling utilities that provide robust fallbacks
 * without breaking existing functionality
 */

export interface SafeOperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  fallbackUsed?: boolean;
}

/**
 * Wrapper for database operations with automatic retry and fallback
 */
export async function withDatabaseFallback<T>(
  primaryOperation: () => Promise<T>,
  fallbackOperation?: () => Promise<T>,
  retries = 2
): Promise<SafeOperationResult<T>> {
  let lastError: Error | null = null;

  // Try primary operation with retries
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const data = await primaryOperation();
      return { success: true, data };
    } catch (error: any) {
      lastError = error;
      logger.warn(`Database operation attempt ${attempt + 1} failed`, { 
        error: error.message,
        attempt: attempt + 1,
        maxRetries: retries + 1
      });
      
      // Wait before retry (exponential backoff)
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100));
      }
    }
  }

  // Try fallback if available
  if (fallbackOperation) {
    try {
      logger.info('Attempting fallback operation');
      const data = await fallbackOperation();
      return { success: true, data, fallbackUsed: true };
    } catch (fallbackError: any) {
      logger.error('Fallback operation also failed', { 
        originalError: lastError?.message,
        fallbackError: fallbackError.message 
      });
    }
  }

  return {
    success: false,
    error: lastError?.message || 'Operation failed',
    fallbackUsed: !!fallbackOperation
  };
}

/**
 * Safe API call wrapper with circuit breaker pattern
 */
class CircuitBreaker {
  private failures = 0;
  private lastFailTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private threshold = 5,
    private timeout = 60000 // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<SafeOperationResult<T>> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailTime < this.timeout) {
        return { success: false, error: 'Circuit breaker is OPEN' };
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const data = await operation();
      this.onSuccess();
      return { success: true, data };
    } catch (error: any) {
      this.onFailure();
      return { success: false, error: error.message };
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'OPEN';
      logger.warn('Circuit breaker opened', { 
        failures: this.failures,
        threshold: this.threshold 
      });
    }
  }
}

export const apiCircuitBreaker = new CircuitBreaker();

/**
 * Safe async operation wrapper that never throws
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallbackValue?: T
): Promise<{ data: T | undefined; error: string | null }> {
  try {
    const data = await operation();
    return { data, error: null };
  } catch (error: any) {
    logger.error('Safe async operation failed', { error: error.message });
    return { 
      data: fallbackValue, 
      error: error.message || 'Unknown error occurred' 
    };
  }
}

/**
 * Enhanced try-catch with logging and fallback
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => R,
  fallback?: (...args: T) => R,
  context?: string
) {
  return (...args: T): R | undefined => {
    try {
      return fn(...args);
    } catch (error: any) {
      logger.error('Function execution failed', { 
        context: context || fn.name,
        error: error.message,
        stack: error.stack
      });
      
      if (fallback) {
        try {
          logger.info('Executing fallback function', { context });
          return fallback(...args);
        } catch (fallbackError: any) {
          logger.error('Fallback function also failed', { 
            context,
            fallbackError: fallbackError.message 
          });
        }
      }
      
      return undefined;
    }
  };
}

/**
 * Safe JSON parsing with fallback
 */
export function safeJsonParse<T>(
  jsonString: string, 
  fallback: T
): T {
  try {
    return JSON.parse(jsonString);
  } catch {
    logger.warn('JSON parse failed, using fallback', { 
      jsonString: jsonString.substring(0, 100) + '...' 
    });
    return fallback;
  }
}

/**
 * Safe object property access
 */
export function safeGet<T>(
  obj: any,
  path: string,
  fallback?: T
): T | undefined {
  try {
    return path.split('.').reduce((current, key) => current?.[key], obj) ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * Enhanced error logging with context
 */
export function logError(
  error: unknown,
  context: string,
  metadata?: Record<string, any>
) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  logger.error('Enhanced error log', {
    context,
    error: errorMessage,
    stack: errorStack,
    timestamp: new Date().toISOString(),
    ...metadata
  });
}

/**
 * Graceful degradation wrapper
 */
export async function withGracefulDegradation<T>(
  primaryFunction: () => Promise<T>,
  degradedFunction: () => Promise<T>,
  healthCheck?: () => Promise<boolean>
): Promise<T> {
  // Check if we should use degraded mode
  if (healthCheck) {
    try {
      const isHealthy = await healthCheck();
      if (!isHealthy) {
        logger.info('Health check failed, using degraded mode');
        return await degradedFunction();
      }
    } catch {
      logger.warn('Health check threw error, using degraded mode');
      return await degradedFunction();
    }
  }

  // Try primary function with fallback to degraded
  try {
    return await primaryFunction();
  } catch (error: any) {
    logger.warn('Primary function failed, falling back to degraded mode', {
      error: error.message
    });
    return await degradedFunction();
  }
}
