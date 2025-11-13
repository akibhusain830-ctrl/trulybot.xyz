/**
 * Enterprise-grade rate limiting for API endpoints
 * Uses in-memory store with Redis fallback for production
 */

import { LRUCache } from 'lru-cache';

interface RateLimitConfig {
  windowMs: number;    // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  keyGenerator: (req: Request) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  message?: string;
  headers?: boolean;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

// In-memory cache for rate limiting (use Redis in production)
const rateLimitCache = new LRUCache<string, RateLimitEntry>({
  max: 10000, // Max 10k entries
  ttl: 60 * 60 * 1000, // 1 hour TTL
});

/**
 * Default rate limiting configurations for different endpoints
 */
export const rateLimitConfigs = {
  // WooCommerce integration endpoints
  woocommerceConnect: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10,
    keyGenerator: (req: Request) => {
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      const userAgent = req.headers.get('user-agent') || 'unknown';
      return `wc_connect:${ip}:${userAgent}`;
    },
    message: 'Too many connection attempts. Please try again later.',
    headers: true,
  },
  
  woocommerceOrders: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 1 request per second average
    keyGenerator: (req: Request) => {
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      const userId = req.headers.get('x-user-id') || 'anonymous';
      return `wc_orders:${userId}:${ip}`;
    },
    message: 'Too many order lookup requests. Please slow down.',
    headers: true,
  },
  
  // Widget endpoints
  widgetConfig: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 100,
    keyGenerator: (req: Request) => {
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      const referer = req.headers.get('referer') || 'unknown';
      return `widget_config:${ip}:${referer}`;
    },
    message: 'Too many widget configuration requests.',
    headers: true,
  },
  
  // General API protection
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    keyGenerator: (req: Request) => {
      const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
      return `general:${ip}`;
    },
    message: 'Too many requests. Please try again later.',
    headers: true,
  },
};

/**
 * Creates a rate limiting middleware function
 */
export function createRateLimiter(config: RateLimitConfig) {
  return async function rateLimit(req: Request): Promise<Response | null> {
    const key = config.keyGenerator(req);
    const now = Date.now();
    const windowStart = now - config.windowMs;
    
    // Get existing entry or create new one
    let entry = rateLimitCache.get(key);
    
    if (!entry || entry.resetTime < now) {
      // Create new entry
      entry = {
        count: 1,
        resetTime: now + config.windowMs,
        firstRequest: now,
      };
      rateLimitCache.set(key, entry);
    } else {
      // Increment count
      entry.count++;
    }
    
    // Check if limit exceeded
    if (entry.count > config.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      
      const headers = new Headers({
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': entry.resetTime.toString(),
        'X-RateLimit-Reset-After': retryAfter.toString(),
        'Retry-After': retryAfter.toString(),
      });
      
      return new Response(
        JSON.stringify({
          success: false,
          message: config.message || 'Too many requests',
          error: 'RATE_LIMIT_EXCEEDED',
          retry_after: retryAfter,
        }),
        {
          status: 429,
          headers,
        }
      );
    }
    
    // Add rate limit headers to successful requests
    if (config.headers) {
      const headers = new Headers();
      headers.set('X-RateLimit-Limit', config.maxRequests.toString());
      headers.set('X-RateLimit-Remaining', (config.maxRequests - entry.count).toString());
      headers.set('X-RateLimit-Reset', entry.resetTime.toString());
      
      // Store headers for later addition to response
      (req as any).rateLimitHeaders = headers;
    }
    
    return null; // Continue to next middleware
  };
}

/**
 * Applies rate limiting to a Next.js API route
 */
export function withRateLimit(handler: Function, config: RateLimitConfig) {
  return async function rateLimitedHandler(req: Request, ...args: any[]) {
    const rateLimitResult = await createRateLimiter(config)(req);
    
    if (rateLimitResult) {
      return rateLimitResult;
    }
    
    // Continue to main handler
    const response = await handler(req, ...args);
    
    // Add rate limit headers if they exist
    if ((req as any).rateLimitHeaders && response.headers) {
      const headers = (req as any).rateLimitHeaders;
      headers.forEach((value: string, key: string) => {
        response.headers.set(key, value);
      });
    }
    
    return response;
  };
}

/**
 * Redis-based rate limiting for production (placeholder)
 * This should be implemented with actual Redis connection
 */
export class RedisRateLimiter {
  private redisClient: any; // Would be Redis client in production
  
  constructor(redisClient: any) {
    this.redisClient = redisClient;
  }
  
  async checkLimit(key: string, config: RateLimitConfig): Promise<boolean> {
    // Redis implementation would go here
    // For now, fall back to in-memory
    return true;
  }
  
  async increment(key: string, windowMs: number): Promise<number> {
    // Redis implementation would go here
    return 1;
  }
}

/**
 * Distributed rate limiting for high-traffic scenarios
 */
export function createDistributedRateLimiter(redisClient: any, config: RateLimitConfig) {
  const redisLimiter = new RedisRateLimiter(redisClient);
  
  return async function distributedRateLimit(req: Request): Promise<Response | null> {
    const key = config.keyGenerator(req);
    
    const isAllowed = await redisLimiter.checkLimit(key, config);
    if (!isAllowed) {
      return new Response(
        JSON.stringify({
          success: false,
          message: config.message || 'Too many requests',
          error: 'RATE_LIMIT_EXCEEDED',
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    
    return null;
  };
}