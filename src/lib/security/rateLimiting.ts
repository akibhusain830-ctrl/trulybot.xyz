import { NextRequest, NextResponse } from 'next/server';
import { getClientIP } from '@/lib/utils/ip';
import { logger } from '@/lib/logger';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: NextRequest) => string;
}

export class RateLimiter {
  private options: Required<RateLimitOptions>;

  constructor(options: RateLimitOptions = {}) {
    this.options = {
      windowMs: options.windowMs || 15 * 60 * 1000,
      max: options.max || 100,
      message: options.message || 'Too many requests from this IP',
      skipSuccessfulRequests: options.skipSuccessfulRequests || false,
      skipFailedRequests: options.skipFailedRequests || false,
      keyGenerator: options.keyGenerator || ((req) => getClientIP(req)),
    };
  }

  async isAllowed(req: NextRequest): Promise<{ allowed: boolean; resetTime?: number; remaining?: number }> {
    const key = this.options.keyGenerator!(req);
    const now = Date.now();
    const windowStart = now - this.options.windowMs;

    // Clean up old entries
    this.cleanupExpiredEntries(windowStart);

    const record = rateLimitStore.get(key);

    if (!record || record.resetTime <= now) {
      // First request or window expired
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + this.options.windowMs,
      });

      return {
        allowed: true,
        resetTime: now + this.options.windowMs,
        remaining: this.options.max - 1,
      };
    }

    if (record.count >= this.options.max) {
      logger.warn('Rate limit exceeded', {
        ip: key,
        count: record.count,
        max: this.options.max,
        resetTime: record.resetTime,
      });

      return {
        allowed: false,
        resetTime: record.resetTime,
        remaining: 0,
      };
    }

    // Increment counter
    record.count++;
    rateLimitStore.set(key, record);

    return {
      allowed: true,
      resetTime: record.resetTime,
      remaining: this.options.max - record.count,
    };
  }

  private cleanupExpiredEntries(windowStart: number) {
    for (const [key, record] of rateLimitStore.entries()) {
      if (record.resetTime <= windowStart) {
        rateLimitStore.delete(key);
      }
    }
  }

  createMiddleware() {
    return async (req: NextRequest) => {
      const result = await this.isAllowed(req);

      if (!result.allowed) {
        const response = NextResponse.json(
          { error: this.options.message },
          { status: 429 }
        );

        response.headers.set('X-RateLimit-Limit', this.options.max.toString());
        response.headers.set('X-RateLimit-Remaining', '0');
        response.headers.set('X-RateLimit-Reset', result.resetTime!.toString());
        response.headers.set('Retry-After', Math.ceil((result.resetTime! - Date.now()) / 1000).toString());

        return response;
      }

      // Add rate limit headers to successful responses
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', this.options.max.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining!.toString());
      response.headers.set('X-RateLimit-Reset', result.resetTime!.toString());

      return response;
    };
  }
}

// Pre-configured rate limiters
export const apiRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many API requests, please try again later',
});

export const authRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 auth attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later',
});

export const chatRateLimit = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 chat messages per minute
  message: 'Too many chat messages, please slow down',
});

export const paymentRateLimit = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 payment attempts per hour
  message: 'Too many payment attempts, please try again later',
});

// Slowdown middleware for gradual response delays
export class SlowDown {
  private delayStore = new Map<string, { count: number; resetTime: number }>();
  private options: {
    windowMs: number;
    delayAfter: number;
    delayMs: number;
    maxDelayMs: number;
    keyGenerator: (req: NextRequest) => string;
  };

  constructor(options: {
    windowMs?: number;
    delayAfter?: number;
    delayMs?: number;
    maxDelayMs?: number;
    keyGenerator?: (req: NextRequest) => string;
  } = {}) {
    this.options = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      delayAfter: 5, // Start delaying after 5 requests
      delayMs: 500, // Delay by 500ms
      maxDelayMs: 10000, // Maximum 10 second delay
      keyGenerator: (req) => getClientIP(req),
      ...options,
    };
  }

  async getDelay(req: NextRequest): Promise<number> {
    const key = this.options.keyGenerator(req);
    const now = Date.now();

    const record = this.delayStore.get(key);

    if (!record || record.resetTime <= now) {
      this.delayStore.set(key, {
        count: 1,
        resetTime: now + this.options.windowMs,
      });
      return 0;
    }

    record.count++;
    this.delayStore.set(key, record);

    if (record.count <= this.options.delayAfter) {
      return 0;
    }

    const extraRequests = record.count - this.options.delayAfter;
    const delay = Math.min(
      extraRequests * this.options.delayMs,
      this.options.maxDelayMs
    );

    return delay;
  }

  createMiddleware() {
    return async (req: NextRequest) => {
      const delay = await this.getDelay(req);

      if (delay > 0) {
        logger.info('Applying slowdown', { 
          ip: getClientIP(req), 
          delay,
          path: req.nextUrl.pathname 
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      return NextResponse.next();
    };
  }
}

export const apiSlowDown = new SlowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 10,
  delayMs: 500,
  maxDelayMs: 5000,
});
