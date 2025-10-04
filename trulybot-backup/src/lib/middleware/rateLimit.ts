
import { NextRequest } from 'next/server';
import { RateLimitError } from '@/lib/errors';
import { logger } from '@/lib/logger';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (request: NextRequest) => string;
  skipSuccessfulRequests?: boolean;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (use Redis in production)
const store: RateLimitStore = {};

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 5 * 60 * 1000);

export function createRateLimiter(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    keyGenerator = (req) => getClientIP(req),
    skipSuccessfulRequests = false
  } = config;

  return {
    check(request: NextRequest): { allowed: boolean; remaining: number; resetTime: number } {
      const key = keyGenerator(request);
      const now = Date.now();
      const resetTime = now + windowMs;

      if (!store[key] || store[key].resetTime < now) {
        store[key] = {
          count: 1,
          resetTime
        };
        return {
          allowed: true,
          remaining: maxRequests - 1,
          resetTime
        };
      }

      store[key].count++;

      const allowed = store[key].count <= maxRequests;
      const remaining = Math.max(0, maxRequests - store[key].count);

      if (!allowed) {
        logger.warn('Rate limit exceeded', {
          key,
          count: store[key].count,
          maxRequests,
          path: request.nextUrl.pathname
        });
      }

      return {
        allowed,
        remaining,
        resetTime: store[key].resetTime
      };
    },

    consume(request: NextRequest): void {
      const result = this.check(request);
      if (!result.allowed) {
        throw new RateLimitError(`Rate limit exceeded. Try again in ${Math.ceil((result.resetTime - Date.now()) / 1000)} seconds.`);
      }
    }
  };
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return request.ip || 'unknown';
}

// Pre-configured rate limiters
export const apiRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
});

export const chatRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
});

export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5,
  keyGenerator: (req) => {
    const email = req.nextUrl.searchParams.get('email') || getClientIP(req);
    return `auth:${email}`;
  }
});
