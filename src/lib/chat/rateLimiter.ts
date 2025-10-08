import { NextRequest } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

class InMemoryRateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  async checkLimit(
    key: string, 
    config: RateLimitConfig
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const resetTime = now + config.windowMs;
    
    const entry = this.store.get(key);
    
    if (!entry || now >= entry.resetTime) {
      // New window or expired entry
      this.store.set(key, {
        count: 1,
        resetTime
      });
      
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime
      };
    }
    
    if (entry.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }
    
    // Increment count
    entry.count++;
    this.store.set(key, entry);
    
    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

class ChatRateLimiter {
  private limiter = new InMemoryRateLimiter();

  /**
   * Rate limit configurations for different types of requests
   */
  private configs = {
    // Per user global limit
    perUser: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 30 // 30 requests per minute per user
    },
    // Per user per bot limit
    perUserBot: {
      windowMs: 60 * 1000, // 1 minute  
      maxRequests: 20 // 20 requests per minute per user per bot
    },
    // Per IP limit (for demo/unauthenticated)
    perIp: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10 // 10 requests per minute per IP
    },
    // Burst protection (very short window)
    burst: {
      windowMs: 10 * 1000, // 10 seconds
      maxRequests: 5 // 5 requests per 10 seconds
    }
  };

  async checkChatRateLimit(
    req: NextRequest,
    userId?: string,
    botId?: string
  ): Promise<{
    allowed: boolean;
    reason?: string;
    retryAfter?: number;
    headers: Record<string, string>;
  }> {
    const ip = this.getClientIp(req);
    const now = Date.now();
    
    // Collect all rate limit checks
    const checks: Array<{
      key: string;
      config: RateLimitConfig;
      type: string;
    }> = [];

    if (userId) {
      // Authenticated user limits
      checks.push({
        key: `user:${userId}`,
        config: this.configs.perUser,
        type: 'per-user'
      });

      if (botId) {
        checks.push({
          key: `user:${userId}:bot:${botId}`,
          config: this.configs.perUserBot,
          type: 'per-user-bot'
        });
      }

      // Burst protection for authenticated users
      checks.push({
        key: `burst:user:${userId}`,
        config: this.configs.burst,
        type: 'burst-protection'
      });
    } else {
      // Unauthenticated/demo limits (by IP)
      checks.push({
        key: `ip:${ip}`,
        config: this.configs.perIp,
        type: 'per-ip'
      });

      // Burst protection for IPs
      checks.push({
        key: `burst:ip:${ip}`,
        config: this.configs.burst,
        type: 'burst-protection'
      });
    }

    // Check all limits
    const results = await Promise.all(
      checks.map(check => 
        this.limiter.checkLimit(check.key, check.config)
          .then(result => ({ ...result, type: check.type }))
      )
    );

    // Find first failing limit
    const failed = results.find(r => !r.allowed);
    
    if (failed) {
      const retryAfter = Math.ceil((failed.resetTime - now) / 1000);
      return {
        allowed: false,
        reason: `Rate limit exceeded: ${failed.type}`,
        retryAfter,
        headers: {
          'X-RateLimit-Limit': this.getConfigForType(failed.type).maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': failed.resetTime.toString(),
          'Retry-After': retryAfter.toString()
        }
      };
    }

    // All limits passed - return headers from the most restrictive limit
    const mostRestrictive = results.reduce((min, curr) => 
      curr.remaining < min.remaining ? curr : min
    );

    return {
      allowed: true,
      headers: {
        'X-RateLimit-Limit': this.getConfigForType(mostRestrictive.type).maxRequests.toString(),
        'X-RateLimit-Remaining': mostRestrictive.remaining.toString(),
        'X-RateLimit-Reset': mostRestrictive.resetTime.toString()
      }
    };
  }

  private getClientIp(req: NextRequest): string {
    // Try various headers for the real IP
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    return req.headers.get('x-real-ip') ||
           req.headers.get('cf-connecting-ip') ||
           req.ip ||
           'unknown';
  }

  private getConfigForType(type: string): RateLimitConfig {
    switch (type) {
      case 'per-user': return this.configs.perUser;
      case 'per-user-bot': return this.configs.perUserBot;
      case 'per-ip': return this.configs.perIp;
      case 'burst-protection': return this.configs.burst;
      default: return this.configs.perIp;
    }
  }

  /**
   * Log rate limit events for monitoring
   */
  private logRateLimitEvent(
    type: 'blocked' | 'allowed',
    details: {
      userId?: string;
      botId?: string;
      ip: string;
      reason?: string;
    }
  ): void {
    console.log(`[ChatRateLimit:${type}]`, {
      timestamp: new Date().toISOString(),
      ...details
    });
  }

  destroy(): void {
    this.limiter.destroy();
  }
}

// Singleton instance
export const chatRateLimiter = new ChatRateLimiter();

// Cleanup on process exit
if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => chatRateLimiter.destroy());
  process.on('SIGINT', () => chatRateLimiter.destroy());
}