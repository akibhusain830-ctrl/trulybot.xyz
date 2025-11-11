import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

/**
 * Subscription Renewal Job
 * 
 * This job runs daily to:
 * 1. Find subscriptions expiring in 1 day
 * 2. Send renewal reminder emails
 * 3. Attempt auto-renewal if payment method available
 * 
 * Schedule: Daily at 9 AM UTC (via Vercel Cron)
 */

interface RenewalResult {
  checked: number;
  expiringSoon: number;
  remindersSent: number;
  renewalAttempted: number;
  renewalSucceeded: number;
  errors: Array<{ userId: string; error: string }>;
}

export async function POST(req: Request): Promise<Response> {
  const requestId = `renewal-${Date.now()}`;

  try {
    // Verify cron secret (security check)
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Subscription renewal job unauthorized', { requestId });
      return new Response('Unauthorized', { status: 401 });
    }

    logger.info('Starting subscription renewal job', { requestId });

    const result = await runSubscriptionRenewal();

    logger.info('Subscription renewal job completed', {
      requestId,
      result,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    logger.error('Subscription renewal job failed', {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });

    return new Response(
      JSON.stringify({
        error: 'Renewal job failed',
        message: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function runSubscriptionRenewal(): Promise<RenewalResult> {
  const result: RenewalResult = {
    checked: 0,
    expiringSoon: 0,
    remindersSent: 0,
    renewalAttempted: 0,
    renewalSucceeded: 0,
    errors: [],
  };

  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find subscriptions expiring between now and 24 hours from now
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    logger.info('Checking for expiring subscriptions', {
      now: now.toISOString(),
      tomorrow: tomorrow.toISOString(),
    });

    const { data: expiringSubscriptions, error: queryError } = await supabase
      .from('profiles')
      .select('id, email, subscription_tier, subscription_ends_at, razorpay_payment_id')
      .eq('subscription_status', 'active')
      .lte('subscription_ends_at', tomorrow.toISOString())
      .gte('subscription_ends_at', now.toISOString())
      .order('subscription_ends_at', { ascending: true });

    if (queryError) {
      throw new Error(`Failed to query subscriptions: ${queryError.message}`);
    }

    result.checked = expiringSubscriptions?.length || 0;
    logger.info(`Found ${result.checked} subscriptions expiring in next 24 hours`);

    if (!expiringSubscriptions || expiringSubscriptions.length === 0) {
      logger.info('No subscriptions expiring soon');
      return result;
    }

    // Process each expiring subscription
    for (const profile of expiringSubscriptions) {
      result.expiringSoon++;

      try {
        // Send renewal reminder email
        await sendRenewalReminderEmail(profile);
        result.remindersSent++;

        logger.info('Renewal reminder sent', {
          userId: profile.id,
          email: profile.email,
          expiresAt: profile.subscription_ends_at,
        });

        // Note: Auto-renewal would require saved payment method
        // This is a placeholder for future enhancement
        if (profile.razorpay_payment_id) {
          result.renewalAttempted++;
          // TODO: Attempt to create renewal order/subscription
          logger.info('Renewal attempted (placeholder)', { userId: profile.id });
        }
      } catch (error) {
        result.errors.push({
          userId: profile.id,
          error: error instanceof Error ? error.message : String(error),
        });

        logger.error('Error processing subscription renewal', {
          userId: profile.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return result;
  } catch (error) {
    logger.error('Fatal error in subscription renewal', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Send renewal reminder email to user
 */
async function sendRenewalReminderEmail(profile: any): Promise<void> {
  try {
    // TODO: Integrate with email service (SendGrid, Resend, etc.)
    // For now, this is a placeholder that logs the action

    const expiryDate = new Date(profile.subscription_ends_at);
    const hoursUntilExpiry = Math.round(
      (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60)
    );

    logger.info('Sending renewal reminder email', {
      userId: profile.id,
      email: profile.email,
      tier: profile.subscription_tier,
      expiresIn: `${hoursUntilExpiry} hours`,
    });

    // Example email body (when integrated with email service):
    const emailContent = {
      to: profile.email,
      subject: `Your ${profile.subscription_tier} subscription expires in ${hoursUntilExpiry} hours`,
      template: 'subscription_expiring_soon',
      data: {
        userName: profile.email,
        tier: profile.subscription_tier,
        expiryDate: expiryDate.toLocaleDateString(),
        renewalLink: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?renewal=true`,
      },
    };

    logger.debug('Email content prepared', { emailContent });
  } catch (error) {
    logger.error('Failed to send renewal reminder email', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Export handler for both GET (testing) and POST (cron)
 */
export async function GET(req: Request): Promise<Response> {
  // Allow manual trigger for testing (with auth header)
  return POST(req);
}
