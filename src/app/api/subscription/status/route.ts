import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ProfileManager } from '@/lib/profile-manager';
import { logger } from '@/lib/logger';
import { 
  createErrorResponse, 
  createSuccessResponse, 
  createAuthErrorResponse,
  getRequestId,
  logRequest,
  withErrorHandling
} from '@/lib/apiSecurity';

export const dynamic = 'force-dynamic';

/**
 * Subscription status check endpoint
 * Verifies if a user's subscription is properly activated
 * Provides detailed status information for debugging
 */
const handler = async (req: NextRequest): Promise<NextResponse> => {
  const requestId = getRequestId(req);
  logRequest(req, requestId);
  
  try {
    // Get authenticated user
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return createAuthErrorResponse('Authentication required', {
        requestId,
        code: 'AUTH_REQUIRED',
      });
    }

    logger.info('Subscription status check requested', {
      requestId,
      userId: user.id
    });

    // Get current profile with all subscription-related fields
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        email,
        subscription_status,
        subscription_tier,
        payment_id,
        trial_ends_at,
        subscription_ends_at,
        created_at,
        updated_at
      `)
      .eq('id', user.id)
      .single();

    if (profileError) {
      logger.error('Profile fetch error', {
        requestId,
        userId: user.id,
        error: profileError
      });

      return createErrorResponse('Profile not found', 404, {
        code: 'PROFILE_NOT_FOUND',
        requestId,
      });
    }

    // Check for any recent payment records
    const { data: recentPayments, error: paymentsError } = await supabase
      .from('orders')
      .select('id, razorpay_payment_id, plan_id, amount, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (paymentsError) {
      logger.warn('Failed to fetch recent payments', {
        requestId,
        userId: user.id,
        error: paymentsError
      });
    }

    // Determine subscription health
    const now = new Date();
    const subscriptionEndDate = profile.subscription_ends_at ? new Date(profile.subscription_ends_at) : null;
    const trialEndDate = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null;
    
    const subscriptionHealth = {
      isActive: profile.subscription_status === 'active',
      hasValidSubscription: profile.subscription_status === 'active' && 
                           (!subscriptionEndDate || subscriptionEndDate > now),
      hasValidTrial: profile.subscription_status === 'trial' && 
                     (!trialEndDate || trialEndDate > now),
      subscriptionExpired: subscriptionEndDate && subscriptionEndDate <= now,
      trialExpired: trialEndDate && trialEndDate <= now,
      hasPaymentId: !!profile.payment_id,
      tier: profile.subscription_tier || 'free'
    };

    // Check for any inconsistencies
    const issues = [];
    
    if (profile.subscription_status === 'active' && !profile.payment_id) {
      issues.push('Active subscription without payment ID');
    }
    
    if (profile.subscription_status === 'active' && subscriptionHealth.subscriptionExpired) {
      issues.push('Subscription marked as active but expired');
    }
    
    if (recentPayments && recentPayments.length > 0) {
      const latestPayment = recentPayments[0];
      if (latestPayment.status === 'completed' && 
          profile.subscription_status !== 'active') {
        issues.push('Recent successful payment but subscription not active');
      }
    }

    const responseData = {
      profile: {
        id: profile.id,
        email: profile.email,
        subscription_status: profile.subscription_status,
        subscription_tier: profile.subscription_tier,
        payment_id: profile.payment_id,
        trial_ends_at: profile.trial_ends_at,
        subscription_ends_at: profile.subscription_ends_at,
        updated_at: profile.updated_at
      },
      health: subscriptionHealth,
      recentPayments: recentPayments || [],
      issues: issues,
      checkTimestamp: now.toISOString()
    };

    logger.info('Subscription status check completed', {
      requestId,
      userId: user.id,
      status: profile.subscription_status,
      tier: profile.subscription_tier,
      health: subscriptionHealth,
      issuesCount: issues.length
    });

    return createSuccessResponse(responseData, {
      message: 'Subscription status retrieved successfully',
      requestId,
    });
    
  } catch (error: any) {
    logger.error('Subscription status check error', { 
      requestId, 
      error: error.message,
      stack: error.stack
    });
    
    return createErrorResponse('Status check failed', 500, {
      code: 'STATUS_CHECK_ERROR',
      requestId,
    });
  }
};

export const GET = withErrorHandling(handler);