/**
 * Protected route utilities for API endpoints
 * Provides standardized authentication and subscription validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { requireValidSubscription, validateUserSubscription } from './subscriptionValidation.server';
import { SubscriptionTier } from './subscription';
import { authRateLimit } from './rateLimit';

interface AuthResult {
  success: true;
  userId: string;
  userEmail: string;
}

interface AuthError {
  success: false;
  response: NextResponse;
}

/**
 * Authenticate request and return user info or error response
 */
export async function authenticateRequest(req: NextRequest): Promise<AuthResult | AuthError> {
  try {
    // Apply auth rate limiting
    const rateLimitResult = await authRateLimit(req);
    if (!rateLimitResult.allowed) {
      return {
        success: false,
        response: NextResponse.json({
          error: 'Too many authentication attempts. Please try again later.',
          resetTime: rateLimitResult.resetTime
        }, { status: 429 })
      };
    }

    // Validate environment
    const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = process.env;
    if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return {
        success: false,
        response: NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
      };
    }

    // Create Supabase client
    const cookieStore = cookies();
    const supabase = createServerClient(
      NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
          set: (name: string, value: string, options: any) => {
            try {
              cookieStore.set({ name, value, ...options });
            } catch {
              // Handle cases where cookies cannot be set
            }
          },
          remove: (name: string, options: any) => {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch {
              // Handle cases where cookies cannot be removed
            }
          },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        response: NextResponse.json({
          error: 'Authentication required',
          code: 'UNAUTHORIZED'
        }, { status: 401 })
      };
    }

    return {
      success: true,
      userId: user.id,
      userEmail: user.email || ''
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
 * Authenticate request and validate subscription access
 */
export async function authenticateAndValidateSubscription(
  req: NextRequest,
  minTier: SubscriptionTier = 'basic'
): Promise<(AuthResult & { validation: any }) | AuthError> {
  
  // First authenticate the user
  const authResult = await authenticateRequest(req);
  if (!authResult.success) {
    return authResult;
  }

  // Validate subscription
  const subscriptionResult = await requireValidSubscription(authResult.userId, minTier);
  if (!subscriptionResult.success) {
    return {
      success: false,
      response: NextResponse.json({
        error: subscriptionResult.error,
        details: subscriptionResult.details,
        code: 'SUBSCRIPTION_REQUIRED'
      }, { status: subscriptionResult.status })
    };
  }

  return {
    success: true,
    userId: authResult.userId,
    userEmail: authResult.userEmail,
    validation: subscriptionResult.validation
  };
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

/**
 * Wrapper for API route handlers that require subscription
 */
export function withSubscription<T extends any[]>(
  handler: (req: NextRequest, auth: AuthResult & { validation: any }, ...args: T) => Promise<NextResponse>,
  minTier: SubscriptionTier = 'basic'
) {
  return async (req: NextRequest, ...args: T): Promise<NextResponse> => {
    const authResult = await authenticateAndValidateSubscription(req, minTier);
    
    if (!authResult.success) {
      return authResult.response;
    }

    return handler(req, authResult, ...args);
  };
}