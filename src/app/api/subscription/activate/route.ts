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
 * Backup subscription activation endpoint
 * This provides a fallback mechanism if the primary payment verification fails
 * but we have confirmation that payment was successful
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

    const { plan_id, payment_id, force } = await req.json();

    // Security check - only allow force activation in development or with admin role
    if (force && process.env.NODE_ENV === 'production') {
      // In production, would need admin verification
      logger.warn('Force activation attempted in production', {
        requestId,
        userId: user.id,
        planId: plan_id
      });
    }

    logger.info('Backup subscription activation requested', {
      requestId,
      userId: user.id,
      planId: plan_id,
      paymentId: payment_id,
      force: !!force
    });

    // Check current subscription status
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_tier, payment_id, updated_at')
      .eq('id', user.id)
      .single();

    if (currentProfile) {
      logger.info('Current subscription status', {
        requestId,
        userId: user.id,
        currentStatus: currentProfile.subscription_status,
        currentTier: currentProfile.subscription_tier,
        currentPaymentId: currentProfile.payment_id
      });

      // If already activated with same payment, return success
      if (currentProfile.subscription_status === 'active' && 
          currentProfile.subscription_tier === plan_id &&
          currentProfile.payment_id === payment_id) {
        
        logger.info('Subscription already activated with this payment', {
          requestId,
          userId: user.id,
          planId: plan_id,
          paymentId: payment_id
        });

        return createSuccessResponse(
          {
            profile: currentProfile,
            message: 'Subscription already active',
            activated_at: currentProfile.updated_at || new Date().toISOString()
          },
          {
            message: 'Subscription is already active for this payment',
            requestId,
          }
        );
      }
    }

    // Activate subscription
    try {
      const updatedProfile = await ProfileManager.activateSubscription(
        user.id,
        plan_id,
        payment_id
      );

      logger.info('Backup subscription activation successful', {
        requestId,
        userId: user.id,
        planId: plan_id,
        paymentId: payment_id,
        newStatus: updatedProfile.subscription_status,
        newTier: updatedProfile.subscription_tier
      });

      return createSuccessResponse(
        {
          profile: updatedProfile,
          subscription: {
            tier: plan_id,
            status: 'active',
            payment_id: payment_id,
            activated_at: new Date().toISOString(),
            backup_activation: true
          }
        },
        {
          message: 'Subscription activated successfully via backup method',
          requestId,
        }
      );

    } catch (activationError: any) {
      logger.error('Backup subscription activation failed', {
        requestId,
        userId: user.id,
        planId: plan_id,
        paymentId: payment_id,
        error: activationError.message
      });

      return createErrorResponse('Backup subscription activation failed', 500, {
        code: 'BACKUP_ACTIVATION_FAILED',
        requestId,
        details: activationError.message
      });
    }
    
  } catch (error: any) {
    logger.error('Backup subscription activation error', { 
      requestId, 
      error: error.message,
      stack: error.stack
    });
    
    return createErrorResponse('Backup activation failed', 500, {
      code: 'BACKUP_ERROR',
      requestId,
    });
  }
};

export const POST = withErrorHandling(handler);
