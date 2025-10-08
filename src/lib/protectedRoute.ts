import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from './auth/sessionValidator';
import { authRateLimit } from './rateLimit';
import { requireCSRF } from './csrf/protection';

interface AuthResult {
  success: true;
  userId: string;
  userEmail: string;
  user: any;
}

interface AuthError {
  success: false;
  response: NextResponse;
}

/**
 * Authenticate request with full session validation and CSRF protection
 */
export async function authenticateRequest(req: NextRequest): Promise<AuthResult | AuthError> {
  try {
    // Apply rate limiting
    const rateLimitResult = await authRateLimit(req);
    if (!rateLimitResult.allowed) {
      return {
        success: false,
        response: NextResponse.json({
          error: 'Too many authentication attempts',
          resetTime: rateLimitResult.resetTime
        }, { status: 429 })
      };
    }

    // Check CSRF protection for state-changing operations
    const csrfError = requireCSRF(req);
    if (csrfError) {
      return {
        success: false,
        response: csrfError
      };
    }

    // Validate session with full checks
    const sessionResult = await validateSession();
    
    if (!sessionResult.valid) {
      return {
        success: false,
        response: NextResponse.json({
          error: sessionResult.error || 'Authentication required',
          code: 'UNAUTHORIZED'
        }, { status: 401 })
      };
    }

    return {
      success: true,
      userId: sessionResult.user.id,
      userEmail: sessionResult.user.email || '',
      user: sessionResult.user
    };
    
  } catch (error) {
    console.error('[authenticateRequest] Error:', error);
    return {
      success: false,
      response: NextResponse.json({
        error: 'Authentication failed',
        code: 'AUTH_ERROR'
      }, { status: 500 })
    };
  }
}

/**
 * Wrapper for API route handlers that require authentication
 */
export function withAuth<T extends any[]>(
  handler: (req: NextRequest, auth: AuthResult, ...args: T) => Promise<NextResponse>
) {
  return async (req: NextRequest, ...args: T): Promise<NextResponse> => {
    const authResult = await authenticateRequest(req);
    
    if (!authResult.success) {
      return authResult.response;
    }

    return handler(req, authResult, ...args);
  };
}
