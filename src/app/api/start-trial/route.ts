import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { calculateSubscriptionAccess } from '@/lib/subscription';
import { ProfileManager } from '@/lib/profile-manager';
import { trialRateLimit } from '@/lib/redisRateLimit';
import { logger } from '@/lib/logger';
import { 
  createErrorResponse, 
  createSuccessResponse, 
  createRateLimitResponse,
  createAuthErrorResponse,
  getRequestId,
  logRequest,
  withErrorHandling
} from '@/lib/apiSecurity';

const handler = async (req: NextRequest): Promise<NextResponse> => {
  const requestId = getRequestId(req);
  logRequest(req, requestId);
  const startedAt = Date.now();
  
  try {
    // Apply rate limiting for trial activation
    const rateLimitResult = await trialRateLimit(req);
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult.resetTime, {
        requestId,
        remaining: rateLimitResult.remaining,
        limit: 3,
      });
    }

    // Minimal env validation
    const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = process.env;
    if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return createErrorResponse('Server configuration error', 500, {
        code: 'CONFIG_ERROR',
        requestId,
      });
    }

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
              // Handle cases where cookies cannot be set (e.g., in middleware)
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

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      logger.warn('Trial activation failed - authentication required', { requestId, authError: authError?.message });
      return createAuthErrorResponse('Authentication required for trial activation', {
        requestId,
        code: 'AUTH_REQUIRED',
      });
    }

    logger.info('Starting trial activation process', { requestId, userId: user.id, email: user.email });

    // Ensure profile exists
    const profile = await ProfileManager.getOrCreateProfile(user.id, user.email || '');
    logger.info('Profile verified/created', { requestId, userId: user.id, profileExists: !!profile });

    // Attempt to start trial with robust fallback
    const { profile: updatedProfile, started, reason } = await ProfileManager.startTrial(user.id);
    const access = calculateSubscriptionAccess(updatedProfile);

    logger.info('Trial activation attempt completed', { 
      requestId, 
      userId: user.id, 
      started, 
      reason, 
      hasAccess: access.has_access 
    });

    if (!started) {
      // Provide contextual error responses
      if (reason === 'active-subscription') {
        logger.info('Trial blocked - user has active subscription', { requestId, userId: user.id });
        return createErrorResponse('You already have an active subscription', 400, {
          code: 'ACTIVE_SUBSCRIPTION',
          requestId,
          details: { subscription: access, redirect: '/dashboard' }
        });
      }
      if (reason === 'trial-already-active') {
        logger.info('Trial blocked - trial already active', { requestId, userId: user.id });
        return createErrorResponse('Trial already active', 400, {
          code: 'TRIAL_ACTIVE',
          requestId,
          details: { subscription: access, redirect: '/dashboard' }
        });
      }
      if (reason === 'trial-already-used') {
        logger.info('Trial blocked - trial already used', { requestId, userId: user.id });
        return createErrorResponse('You have already used your free trial. Please choose a paid plan to continue.', 400, {
          code: 'TRIAL_USED',
          requestId,
          details: { subscription: access, redirect: '/pricing' }
        });
      }
      
      logger.error('Trial activation failed with unknown reason', { requestId, userId: user.id, reason });
      return createErrorResponse('Unable to start trial', 400, {
        code: 'TRIAL_FAILED',
        requestId,
        details: { subscription: access, reason }
      });
    }

    return createSuccessResponse(
      {
        subscription: access,
        profile: updatedProfile,
        redirect: '/dashboard',
        processingTime: Date.now() - startedAt
      },
      {
        message: 'Trial started successfully! Welcome to TrulyBot Ultra.',
        requestId,
      }
    );
  } catch (error: any) {
    logger.error('Trial activation failed with error', { requestId, error: error.message });
    return createErrorResponse('Trial activation failed', 500, {
      code: 'TRIAL_ERROR',
      requestId,
    });
  }
};

export const POST = withErrorHandling(handler);
