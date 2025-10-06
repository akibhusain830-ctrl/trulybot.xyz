import { NextRequest, NextResponse } from 'next/server';
import { apiRateLimit, authRateLimit, chatRateLimit, paymentRateLimit } from './rateLimiting';
import { defaultSecurityHeaders, embedSecurityHeaders, defaultCors, validateUserAgent, validateReferer } from './headers';
import { detectSuspiciousPatterns, CSRFProtection } from './validation';
import { getClientIP, isBlockedIP } from '@/lib/utils/ip';
import { logger } from '@/lib/logger';

// Blocked IPs list (in production, use a database or external service)
const BLOCKED_IPS: string[] = [
  // Add known malicious IPs here
];

// Blocked user agents
const BLOCKED_USER_AGENTS = [
  'sqlmap',
  'nmap',
  'nikto',
  'burpsuite',
  'zaproxy',
];

// Allowed domains for referer validation
const ALLOWED_REFERER_DOMAINS = [
  'trulybot.xyz',
  'www.trulybot.xyz',
  'localhost',
  '127.0.0.1',
];

export interface SecurityMiddlewareOptions {
  enableRateLimit?: boolean;
  enableSecurityHeaders?: boolean;
  enableCors?: boolean;
  enableCSRF?: boolean;
  enableSuspiciousPatternDetection?: boolean;
  blockSuspiciousRequests?: boolean;
}

export class SecurityMiddleware {
  private options: SecurityMiddlewareOptions;

  constructor(options: SecurityMiddlewareOptions = {}) {
    this.options = {
      enableRateLimit: true,
      enableSecurityHeaders: true,
      enableCors: true,
      enableCSRF: true,
      enableSuspiciousPatternDetection: true,
      blockSuspiciousRequests: true,
      ...options,
    };
  }

  async process(req: NextRequest): Promise<NextResponse | null> {
    const startTime = Date.now();
    const clientIP = getClientIP(req);
    const userAgent = req.headers.get('user-agent') || '';
    const referer = req.headers.get('referer') || '';
    const path = req.nextUrl.pathname;

    // Log request
    logger.info('Security middleware processing request', {
      method: req.method,
      path,
      ip: clientIP,
      userAgent: userAgent.substring(0, 100), // Truncate for logging
    });

    try {
      // 1. IP-based blocking
      if (isBlockedIP(clientIP, BLOCKED_IPS)) {
        logger.warn('Blocked request from blocked IP', { ip: clientIP, path });
        return new NextResponse('Forbidden', { status: 403 });
      }

      // 2. User agent validation
      if (!validateUserAgent(userAgent) || 
          BLOCKED_USER_AGENTS.some(blocked => userAgent.toLowerCase().includes(blocked))) {
        logger.warn('Blocked request with suspicious user agent', { 
          ip: clientIP, 
          userAgent: userAgent.substring(0, 100),
          path 
        });
        return new NextResponse('Forbidden', { status: 403 });
      }

      // 3. Referer validation for sensitive endpoints
      const sensitiveEndpoints = ['/api/payments', '/api/auth'];
      if (sensitiveEndpoints.some(endpoint => path.startsWith(endpoint))) {
        if (referer && !validateReferer(referer, ALLOWED_REFERER_DOMAINS)) {
          logger.warn('Blocked request with invalid referer', { 
            ip: clientIP, 
            referer,
            path 
          });
          return new NextResponse('Forbidden', { status: 403 });
        }
      }

      // 4. Suspicious pattern detection
      if (this.options.enableSuspiciousPatternDetection) {
        const suspiciousPatterns = detectSuspiciousPatterns(req);
        if (suspiciousPatterns.length > 0) {
          if (this.options.blockSuspiciousRequests) {
            logger.warn('Blocked request with suspicious patterns', {
              ip: clientIP,
              patterns: suspiciousPatterns,
              path,
            });
            return new NextResponse('Bad Request', { status: 400 });
          }
        }
      }

      // 5. Rate limiting based on endpoint
      if (this.options.enableRateLimit) {
        const rateLimitResponse = await this.applyRateLimit(req, path);
        if (rateLimitResponse) {
          return rateLimitResponse;
        }
      }

      // 6. CORS handling
      if (this.options.enableCors) {
        const corsResponse = defaultCors.handlePreflight(req);
        if (corsResponse) {
          return corsResponse;
        }
      }

      // Continue to next middleware/handler
      const response = NextResponse.next();

      // Apply security headers
      if (this.options.enableSecurityHeaders) {
        // Use embed-specific headers for embeddable routes
        if (path.startsWith('/embed') || path.startsWith('/widget')) {
          embedSecurityHeaders.apply(response);
        } else {
          defaultSecurityHeaders.apply(response);
        }
      }

      // Apply CORS headers
      if (this.options.enableCors) {
        defaultCors.apply(req, response);
      }

      // Log successful processing
      const processingTime = Date.now() - startTime;
      logger.info('Security middleware completed', {
        method: req.method,
        path,
        ip: clientIP,
        processingTime,
      });

      return response;

    } catch (error) {
      logger.error('Security middleware error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        method: req.method,
        path,
        ip: clientIP,
      });

      return new NextResponse('Internal Server Error', { status: 500 });
    }
  }

  private async applyRateLimit(req: NextRequest, path: string): Promise<NextResponse | null> {
    // Authentication endpoints
    if (path.startsWith('/api/auth')) {
      const result = await authRateLimit.isAllowed(req);
      if (!result.allowed) {
        return this.createRateLimitResponse(result);
      }
    }
    
    // Chat endpoints
    else if (path.startsWith('/api/chat')) {
      const result = await chatRateLimit.isAllowed(req);
      if (!result.allowed) {
        return this.createRateLimitResponse(result);
      }
    }
    
    // Payment endpoints
    else if (path.startsWith('/api/payments')) {
      const result = await paymentRateLimit.isAllowed(req);
      if (!result.allowed) {
        return this.createRateLimitResponse(result);
      }
    }
    
    // General API endpoints
    else if (path.startsWith('/api/')) {
      const result = await apiRateLimit.isAllowed(req);
      if (!result.allowed) {
        return this.createRateLimitResponse(result);
      }
    }

    return null;
  }

  private createRateLimitResponse(result: { resetTime?: number }): NextResponse {
    const response = NextResponse.json(
      { error: 'Too Many Requests', message: 'Rate limit exceeded' },
      { status: 429 }
    );

    if (result.resetTime) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      response.headers.set('Retry-After', retryAfter.toString());
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
    }

    return response;
  }
}

// Pre-configured middleware instances
export const defaultSecurityMiddleware = new SecurityMiddleware();

export const apiSecurityMiddleware = new SecurityMiddleware({
  enableRateLimit: true,
  enableSecurityHeaders: true,
  enableCors: true,
  enableCSRF: false, // APIs typically use tokens instead
  enableSuspiciousPatternDetection: true,
  blockSuspiciousRequests: true,
});

export const webSecurityMiddleware = new SecurityMiddleware({
  enableRateLimit: true,
  enableSecurityHeaders: true,
  enableCors: false, // Not needed for same-origin requests
  enableCSRF: true,
  enableSuspiciousPatternDetection: true,
  blockSuspiciousRequests: false, // More lenient for web pages
});

// Helper function to create security middleware for specific routes
export const createSecurityMiddleware = (options: SecurityMiddlewareOptions) => {
  const middleware = new SecurityMiddleware(options);
  return (req: NextRequest) => middleware.process(req);
};