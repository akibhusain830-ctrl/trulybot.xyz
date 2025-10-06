/**
 * CRITICAL SECURITY FIX: Secure API Route Wrapper
 * Comprehensive security middleware for all API routes
 * 
 * Features:
 * - Automatic authentication
 * - Tenant isolation enforcement
 * - Rate limiting
 * - Input validation
 * - Error handling
 * - Request logging
 * - CORS handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { createRequestId } from '@/lib/requestContext';
import { rateLimit, addRateLimitHeaders } from '@/lib/security/rateLimit';
import { validateTenantContext, TenantContext } from '@/lib/security/tenantIsolation';
import { SecurityValidator, createSecureValidator } from '@/lib/security/inputValidation';

export interface SecureApiOptions {
  requireAuth?: boolean;
  requireTenant?: boolean;
  rateLimitType?: 'api' | 'auth' | 'chat' | 'upload' | 'payment' | 'widget';
  validation?: z.ZodSchema<any>;
  allowedMethods?: string[];
  corsOrigins?: string[];
  maxContentLength?: number;
}

export interface SecureApiContext {
  reqId: string;
  tenant?: TenantContext;
  validatedData?: any;
}

type SecureApiHandler = (
  req: NextRequest,
  context: SecureApiContext,
  params?: any
) => Promise<NextResponse>;

/**
 * Creates a secure API route handler with comprehensive security features
 */
export function createSecureApiRoute(
  handler: SecureApiHandler,
  options: SecureApiOptions = {}
) {
  const {
    requireAuth = true,
    requireTenant = true,
    rateLimitType = 'api',
    validation,
    allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'],
    corsOrigins = [],
    maxContentLength = 10 * 1024 * 1024 // 10MB default
  } = options;

  return async (req: NextRequest, params?: any): Promise<NextResponse> => {
    const reqId = createRequestId();
    const startTime = Date.now();

    try {
      // Add request ID to headers for tracing
      req.headers.set('x-request-id', reqId);

      logger.info('API request started', {
        reqId,
        method: req.method,
        url: req.url,
        userAgent: req.headers.get('user-agent')?.substring(0, 100),
        ip: getClientIP(req)
      });

      // 1. Method validation
      if (!allowedMethods.includes(req.method)) {
        return createErrorResponse({
          error: 'Method not allowed',
          code: 'METHOD_NOT_ALLOWED',
          reqId
        }, 405);
      }

      // 2. Content length validation
      const contentLength = req.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > maxContentLength) {
        return createErrorResponse({
          error: 'Request too large',
          code: 'PAYLOAD_TOO_LARGE',
          reqId
        }, 413);
      }

      // 3. Header security validation
      const headerValidation = SecurityValidator.validateRequestHeaders(req);
      if (!headerValidation.isValid) {
        logger.warn('Request header validation failed', {
          reqId,
          warnings: headerValidation.warnings
        });
        return createErrorResponse({
          error: 'Invalid request headers',
          code: 'INVALID_HEADERS',
          reqId
        }, 400);
      }

      // 4. Rate limiting
      const rateLimiter = getRateLimiter(rateLimitType);
      const rateLimitResult = await rateLimiter.check(req);
      
      if (!rateLimitResult.allowed) {
        logger.warn('Rate limit exceeded', {
          reqId,
          rateLimitType,
          ip: getClientIP(req)
        });
        
        const response = createErrorResponse({
          error: 'Rate limit exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          reqId,
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        }, 429);
        
        addRateLimitHeaders(response, rateLimitResult);
        return response;
      }

      // 5. CORS handling
      const corsResponse = handleCORS(req, corsOrigins);
      if (corsResponse) {
        return corsResponse;
      }

      // 6. Authentication and tenant validation
      let context: SecureApiContext = { reqId };
      
      if (requireAuth || requireTenant) {
        const tenantValidation = await validateTenantContext(req);
        
        if (!tenantValidation.success) {
          return tenantValidation.response;
        }
        
        context.tenant = tenantValidation.context;
        
        logger.info('Request authenticated', {
          reqId,
          userId: context.tenant.userId,
          workspaceId: context.tenant.workspaceId
        });
      }

      // 7. Input validation
      if (validation && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const validator = createSecureValidator(validation);
        const validationResult = await validator(req);
        
        if (!validationResult.success) {
          logger.warn('Input validation failed', {
            reqId,
            error: validationResult.error
          });
          
          return createErrorResponse({
            error: 'Invalid input data',
            code: 'VALIDATION_FAILED',
            details: validationResult.error,
            reqId
          }, 400);
        }
        
        context.validatedData = validationResult.data;
      }

      // 8. Execute main handler
      const response = await handler(req, context, params);
      
      // 9. Add security headers to response
      addSecurityHeaders(response, corsOrigins);
      
      // 10. Add rate limit headers
      addRateLimitHeaders(response, rateLimitResult);
      
      const processingTime = Date.now() - startTime;
      
      logger.info('API request completed', {
        reqId,
        status: response.status,
        processingTime
      });
      
      // Add performance headers
      response.headers.set('x-response-time', `${processingTime}ms`);
      response.headers.set('x-request-id', reqId);
      
      return response;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      logger.error('API request error', {
        reqId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        processingTime
      });
      
      return createErrorResponse({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        reqId
      }, 500);
    }
  };
}

/**
 * Helper function to get appropriate rate limiter
 */
function getRateLimiter(type: string) {
  switch (type) {
    case 'auth':
      return rateLimit.auth;
    case 'chat':
      return rateLimit.chat;
    case 'upload':
      return rateLimit.upload;
    case 'payment':
      return rateLimit.payment;
    case 'widget':
      return rateLimit.widget;
    case 'admin':
      return rateLimit.admin;
    default:
      return rateLimit.api;
  }
}

/**
 * Extract client IP from request
 */
function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cloudflareIP = req.headers.get('cf-connecting-ip');
  
  return cloudflareIP || realIP || forwarded?.split(',')[0] || 'unknown';
}

/**
 * Handle CORS requests
 */
function handleCORS(req: NextRequest, allowedOrigins: string[]): NextResponse | null {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.get('origin');
    
    const headers: Record<string, string> = {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID',
      'Access-Control-Max-Age': '86400',
    };

    if (origin && allowedOrigins.includes(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers['Access-Control-Allow-Credentials'] = 'true';
    }

    return new NextResponse(null, { status: 200, headers });
  }
  
  return null;
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse, corsOrigins: string[]): void {
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'"
  );
  
  // CORS headers for allowed origins
  const origin = response.headers.get('origin');
  if (origin && corsOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
}

/**
 * Create standardized error response
 */
function createErrorResponse(
  error: {
    error: string;
    code: string;
    details?: string;
    reqId: string;
    retryAfter?: number;
  },
  status: number
): NextResponse {
  const response = NextResponse.json({
    success: false,
    error: error.error,
    code: error.code,
    details: error.details,
    timestamp: new Date().toISOString(),
    requestId: error.reqId
  }, { status });

  if (error.retryAfter) {
    response.headers.set('Retry-After', error.retryAfter.toString());
  }

  addSecurityHeaders(response, []);
  
  return response;
}

/**
 * Create standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  options: {
    status?: number;
    message?: string;
    metadata?: Record<string, any>;
  } = {}
): NextResponse {
  const { status = 200, message, metadata = {} } = options;
  
  return NextResponse.json({
    success: true,
    data,
    message,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString()
    }
  }, { status });
}

/**
 * Specific wrapper for tenant-isolated endpoints
 */
export function createTenantApiRoute(
  handler: (req: NextRequest, context: SecureApiContext & { tenant: TenantContext }, params?: any) => Promise<NextResponse>,
  options: Omit<SecureApiOptions, 'requireAuth' | 'requireTenant'> = {}
) {
  return createSecureApiRoute(
    async (req, context, params) => {
      if (!context.tenant) {
        throw new Error('Tenant context required but not available');
      }
      return handler(req, { ...context, tenant: context.tenant }, params);
    },
    { ...options, requireAuth: true, requireTenant: true }
  );
}

/**
 * Wrapper for public endpoints (no auth required)
 */
export function createPublicApiRoute(
  handler: SecureApiHandler,
  options: Omit<SecureApiOptions, 'requireAuth' | 'requireTenant'> = {}
) {
  return createSecureApiRoute(handler, {
    ...options,
    requireAuth: false,
    requireTenant: false
  });
}