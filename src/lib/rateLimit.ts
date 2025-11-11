import { NextRequest } from 'next/server';
import { logger } from './logger';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store for development (use Redis in production)
const store: RateLimitStore = {};

// Cleanup old entries every 5 minutes - with proper cleanup management
let cleanupInterval: NodeJS.Timeout | null = null;

function startCleanup() {
  if (cleanupInterval) return; // Prevent multiple intervals
  
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach(key => {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    });
  }, 5 * 60 * 1000);
}

// Initialize cleanup on first use
function ensureCleanupRunning() {
  if (!cleanupInterval) {
    startCleanup();
  }
}

// Export cleanup function for testing/shutdown
export function stopCleanup() {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}

export function createRateLimit(config: RateLimitConfig) {
  // Ensure cleanup is running when rate limiting is used
  ensureCleanupRunning();
  
  return async (req: NextRequest): Promise<{ allowed: boolean; remaining: number; resetTime: number }> => {
    const key = config.keyGenerator 
      ? config.keyGenerator(req)
      : getClientIP(req) || 'anonymous';
    
    const now = Date.now();
    const windowStart = now;
    const windowEnd = windowStart + config.windowMs;

    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: windowEnd
      };
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: windowEnd
      };
    }

    store[key].count++;
    
    const allowed = store[key].count <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - store[key].count);

    if (!allowed) {
      logger.warn('Rate limit exceeded', {
        key,
        count: store[key].count,
        maxRequests: config.maxRequests,
        ip: getClientIP(req) || undefined
      });
    }

    return {
      allowed,
      remaining,
      resetTime: store[key].resetTime
    };
  };
}

function getClientIP(req: NextRequest): string | null {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return req.ip || null;
}

// Common rate limiters
export const authRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per window
  keyGenerator: (req) => `auth:${getClientIP(req) || 'anonymous'}`
});

export const trialRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 trial attempts per hour
  keyGenerator: (req) => `trial:${getClientIP(req) || 'anonymous'}`
});

export const paymentRateLimit = createRateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 10, // 10 payment attempts per window
  keyGenerator: (req) => `payment:${getClientIP(req) || 'anonymous'}`
});

export const apiRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  keyGenerator: (req) => `api:${getClientIP(req) || 'anonymous'}`
});