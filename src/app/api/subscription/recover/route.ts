import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';
import { ProfileManager } from '@/lib/profile-manager';

/**
 * Subscription Recovery Service
 * Automatically detects and fixes failed subscription activations
 * Runs periodically to catch any users who paid but didn't get activated
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RecoveryResult {
  usersChecked: number;
  usersRecovered: number;
  failures: string[];
  recoveryActions: Array<{
    userId: string;
    action: string;
    planId: string;
    paymentId: string;
    success: boolean;
  }>;
}

export const dynamic = 'force-dynamic';

/**
 * Find users who have completed payments but inactive subscriptions
 */
async function findUsersNeedingRecovery(): Promise<Array<{
  userId: string;
  email: string;
  orderId: string;
  planId: string;
  paymentId: string;
  orderCreatedAt: string;
  currentStatus: string;
  currentTier: string | null;
}>> {
  try {
    // Find completed orders where user subscription is not active
    const { data: problematicCases, error } = await supabase
      .from('orders')
      .select(`
        id,
        user_id,
        razorpay_payment_id,
        plan_id,
        status,
        created_at,
        profiles!inner(
          email,
          subscription_status,
          subscription_tier,
          payment_id
        )
      `)
      .eq('status', 'completed')
      .neq('profiles.subscription_status', 'active')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to find users needing recovery', { error });
      return [];
    }

    return (problematicCases || []).map(order => ({
      userId: order.user_id,
      email: (order.profiles as any).email,
      orderId: order.id,
      planId: order.plan_id,
      paymentId: order.razorpay_payment_id,
      orderCreatedAt: order.created_at,
      currentStatus: (order.profiles as any).subscription_status,
      currentTier: (order.profiles as any).subscription_tier
    }));

  } catch (error: any) {
    logger.error('Error in findUsersNeedingRecovery', { error: error.message });
    return [];
  }
}

/**
 * Attempt to recover a user's subscription
 */
async function recoverUserSubscription(userId: string, planId: string, paymentId: string): Promise<{
  success: boolean;
  action: string;
  error?: string;
}> {
  try {
    logger.info('Attempting subscription recovery', {
      userId,
      planId,
      paymentId
    });

    // Try to activate subscription using ProfileManager
    const updatedProfile = await ProfileManager.activateSubscription(
      userId,
      planId as any,
      paymentId
    );

    // Verify the activation worked
    const { data: verifyProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('subscription_status, subscription_tier, payment_id')
      .eq('id', userId)
      .single();

    if (verifyError || !verifyProfile) {
      return {
        success: false,
        action: 'activation_attempt',
        error: `Verification failed: ${verifyError?.message || 'Profile not found'}`
      };
    }

    if (verifyProfile.subscription_status === 'active' && 
        verifyProfile.subscription_tier === planId &&
        verifyProfile.payment_id === paymentId) {
      
      logger.info('Subscription recovery successful', {
        userId,
        planId,
        paymentId,
        newStatus: verifyProfile.subscription_status
      });

      return {
        success: true,
        action: 'subscription_activated'
      };
    } else {
      return {
        success: false,
        action: 'activation_failed',
        error: `Activation didn't stick: status=${verifyProfile.subscription_status}, tier=${verifyProfile.subscription_tier}`
      };
    }

  } catch (error: any) {
    logger.error('Subscription recovery failed', {
      userId,
      planId,
      paymentId,
      error: error.message
    });

    return {
      success: false,
      action: 'recovery_error',
      error: error.message
    };
  }
}

/**
 * Run the full recovery process
 */
async function runRecoveryProcess(): Promise<RecoveryResult> {
  const result: RecoveryResult = {
    usersChecked: 0,
    usersRecovered: 0,
    failures: [],
    recoveryActions: []
  };

  try {
    logger.info('Starting subscription recovery process');

    // Find users needing recovery
    const usersNeedingRecovery = await findUsersNeedingRecovery();
    result.usersChecked = usersNeedingRecovery.length;

    logger.info('Found users needing recovery', {
      count: usersNeedingRecovery.length,
      users: usersNeedingRecovery.map(u => ({
        userId: u.userId,
        email: u.email,
        planId: u.planId,
        currentStatus: u.currentStatus
      }))
    });

    // Process each user
    for (const user of usersNeedingRecovery) {
      try {
        const recoveryResult = await recoverUserSubscription(
          user.userId,
          user.planId,
          user.paymentId
        );

        result.recoveryActions.push({
          userId: user.userId,
          action: recoveryResult.action,
          planId: user.planId,
          paymentId: user.paymentId,
          success: recoveryResult.success
        });

        if (recoveryResult.success) {
          result.usersRecovered++;
          logger.info('User subscription recovered', {
            userId: user.userId,
            email: user.email,
            planId: user.planId
          });
        } else {
          result.failures.push(`${user.userId}: ${recoveryResult.error || 'Unknown error'}`);
          logger.warn('Failed to recover user subscription', {
            userId: user.userId,
            email: user.email,
            error: recoveryResult.error
          });
        }

      } catch (error: any) {
        result.failures.push(`${user.userId}: ${error.message}`);
        logger.error('Error processing user recovery', {
          userId: user.userId,
          error: error.message
        });
      }
    }

    logger.info('Recovery process completed', {
      usersChecked: result.usersChecked,
      usersRecovered: result.usersRecovered,
      failures: result.failures.length
    });

    return result;

  } catch (error: any) {
    logger.error('Recovery process failed', { error: error.message });
    result.failures.push(`Process error: ${error.message}`);
    return result;
  }
}

/**
 * HTTP endpoint handler
 */
const handler = async (req: NextRequest): Promise<NextResponse> => {
  if (req.method !== 'POST') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    // Security check - only allow in development or with admin key
    const { admin_key } = await req.json();
    
    if (process.env.NODE_ENV === 'production' && admin_key !== process.env.RECOVERY_ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await runRecoveryProcess();

    return NextResponse.json({
      success: true,
      message: 'Recovery process completed',
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    logger.error('Recovery endpoint error', { error: error.message });
    
    return NextResponse.json({
      error: 'Recovery process failed',
      message: error.message
    }, { status: 500 });
  }
};

export const POST = handler;