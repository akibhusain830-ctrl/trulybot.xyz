import { NextRequest, NextResponse } from 'next/server';
import { logger } from './logger';

export interface SecurityConfig {
  enableCORS?: boolean;
  corsOrigins?: string[];
  enableCSP?: boolean;
  enableHSTS?: boolean;
  enableXFrameOptions?: boolean;
  removeServerHeaders?: boolean;
}

export interface ErrorResponse {
  error: string;
  code?: string;
  message?: string;
  timestamp?: string;
  requestId?: string;
  details?: any;
}

export interface SuccessResponse<T = any> {
  success: true;
  data?: T;
  message?: string;
  timestamp?: string;
  requestId?: string;
  metadata?: any;
}

/**
 * Apply comprehensive security headers to API responses
 */
export function applySecurityHeaders(
  response: NextResponse,
  config: SecurityConfig = {}
): NextResponse {
  const {
    enableCORS = true,
    corsOrigins = ['http://localhost:3000', 'http://localhost:3001', 'https://trulybot.xyz'],
    enableCSP = true,
    enableHSTS = true,
    enableXFrameOptions = true,
    removeServerHeaders = true,
  } = config;

  // Remove server identification headers
  if (removeServerHeaders) {
    response.headers.delete('x-powered-by');
    response.headers.delete('server');
  }

  // CORS headers
  if (enableCORS) {
    const origin = response.headers.get('origin');
    if (origin && corsOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    } else if (corsOrigins.length === 1 && corsOrigins[0] === '*') {
      response.headers.set('Access-Control-Allow-Origin', '*');
    }
    
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  }

  // Content Security Policy
  if (enableCSP) {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
    ].join('; ');
    response.headers.set('Content-Security-Policy', csp);
  }

  // HTTP Strict Transport Security
  if (enableHSTS) {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  // X-Frame-Options
  if (enableXFrameOptions) {
    response.headers.set('X-Frame-Options', 'DENY');
  }

  // Additional security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  error: string | Error,
  status: number = 500,
  options: {
    code?: string;
    details?: any;
    requestId?: string;
    logError?: boolean;
  } = {}
): NextResponse<ErrorResponse> {
  const {
    code,
    details,
    requestId = 'unknown',
    logError = true,
  } = options;

  const errorMessage = error instanceof Error ? error.message : error;
  const timestamp = new Date().toISOString();

  if (logError) {
    logger.error('API Error Response', {
      error: errorMessage,
      status,
      code,
      requestId,
      timestamp,
      details,
    });
  }

  const responseBody: ErrorResponse = {
    error: errorMessage,
    timestamp,
    requestId,
  };

  if (code) responseBody.code = code;
  if (details && process.env.NODE_ENV === 'development') {
    responseBody.details = details;
  }

  const response = NextResponse.json(responseBody, { status });
  return applySecurityHeaders(response) as NextResponse<ErrorResponse>;
}

/**
 * Create standardized success response
 */
export function createSuccessResponse<T>(
  data?: T,
  options: {
    message?: string;
    status?: number;
    requestId?: string;
    metadata?: any;
  } = {}
): NextResponse<SuccessResponse<T>> {
  const {
    message,
    status = 200,
    requestId = 'unknown',
    metadata,
  } = options;

  const responseBody: SuccessResponse<T> = {
    success: true,
    timestamp: new Date().toISOString(),
    requestId,
  };

  if (data !== undefined) responseBody.data = data;
  if (message) responseBody.message = message;
  if (metadata) responseBody.metadata = metadata;

  const response = NextResponse.json(responseBody, { status });
  return applySecurityHeaders(response) as NextResponse<SuccessResponse<T>>;
}

/**
 * Rate limit response with proper headers
 */
export function createRateLimitResponse(
  resetTime: number,
  options: {
    requestId?: string;
    remaining?: number;
    limit?: number;
  } = {}
): NextResponse<ErrorResponse> {
  const { requestId = 'unknown', remaining = 0, limit } = options;
  
  const response = createErrorResponse(
    'Too many requests. Please try again later.',
    429,
    {
      code: 'RATE_LIMIT_EXCEEDED',
      requestId,
      logError: false, // Rate limits are expected, don't log as errors
    }
  );

  // Add standard rate limit headers
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
  response.headers.set('Retry-After', Math.ceil((resetTime - Date.now()) / 1000).toString());
  
  if (limit) {
    response.headers.set('X-RateLimit-Limit', limit.toString());
  }

  return response;
}

/**
 * Authentication error response
 */
export function createAuthErrorResponse(
  message: string = 'Authentication required',
  options: {
    requestId?: string;
    code?: string;
  } = {}
): NextResponse<ErrorResponse> {
  const { requestId = 'unknown', code = 'UNAUTHORIZED' } = options;
  
  return createErrorResponse(message, 401, {
    code,
    requestId,
    logError: true,
  });
}

/**
 * Validation error response
 */
export function createValidationErrorResponse(
  errors: string | string[],
  options: {
    requestId?: string;
    details?: any;
  } = {}
): NextResponse<ErrorResponse> {
  const { requestId = 'unknown', details } = options;
  
  const errorMessage = Array.isArray(errors) ? errors.join(', ') : errors;
  
  return createErrorResponse(errorMessage, 400, {
    code: 'VALIDATION_ERROR',
    requestId,
    details,
    logError: false, // Validation errors are user errors, not system errors
  });
}

/**
 * Server error response
 */
export function createServerErrorResponse(
  error?: Error | string,
  options: {
    requestId?: string;
    code?: string;
  } = {}
): NextResponse<ErrorResponse> {
  const { requestId = 'unknown', code = 'INTERNAL_SERVER_ERROR' } = options;
  
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : (error instanceof Error ? error.message : error || 'Unknown error');
  
  return createErrorResponse(errorMessage, 500, {
    code,
    requestId,
    logError: true,
  });
}

/**
 * Extract request ID from headers or generate one
 */
export function getRequestId(req: NextRequest): string {
  return req.headers.get('x-request-id') || 
         req.headers.get('x-correlation-id') || 
         `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Middleware wrapper for consistent error handling
 */
export function withErrorHandling<T extends any[]>(
  handler: (req: NextRequest, ...args: T) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: T): Promise<NextResponse> => {
    const requestId = getRequestId(req);
    
    try {
      return await handler(req, ...args);
    } catch (error) {
      logger.error('Unhandled API error', {
        requestId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        url: req.url,
        method: req.method,
      });
      
      return createServerErrorResponse(error instanceof Error ? error : 'Unknown error', {
        requestId,
      });
    }
  };
}

/**
 * Log request for monitoring and debugging
 */
export function logRequest(req: NextRequest, requestId: string, additionalData?: any) {
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  
  logger.info('API Request', {
    requestId,
    method: req.method,
    url: req.url,
    userAgent,
    ip,
    timestamp: new Date().toISOString(),
    ...additionalData,
  });
}

// Export types for TypeScript