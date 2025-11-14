import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ProfileManager } from '@/lib/profile-manager';
import { logger } from '@/lib/logger';
import {
  createErrorResponse,
  createSuccessResponse,
  getRequestId,
} from '@/lib/apiSecurity';

export const dynamic = 'force-dynamic';

/**
 * Razorpay Webhook Handler
 * 
 * Handles payment callbacks from Razorpay
 * Verifies signatures and updates subscription status
 */
const handler = async (req: NextRequest): Promise<NextResponse> => {
  const requestId = getRequestId(req);
  
  try {
    // Verify webhook secret is configured
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      logger.error('Razorpay webhook secret not configured', { requestId });
      return createErrorResponse('Webhook secret not configured', 500, {
        code: 'CONFIG_ERROR',
        requestId,
      });
    }

    // Get signature from header
    const signature = req.headers.get('x-razorpay-signature');
    if (!signature) {
      logger.warn('Razorpay webhook missing signature', { requestId });
      return createErrorResponse('Missing signature', 400, {
        code: 'MISSING_SIGNATURE',
        requestId,
      });
    }

    // Get body as text for signature verification
    const bodyText = await req.text();

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(bodyText)
      .digest('hex');

    if (expectedSignature !== signature) {
      logger.warn('Razorpay webhook invalid signature', {
        requestId,
        expectedSignature: expectedSignature.substring(0, 10),
        receivedSignature: signature.substring(0, 10),
      });
      return createErrorResponse('Invalid signature', 403, {
        code: 'INVALID_SIGNATURE',
        requestId,
      });
    }

    // Parse payload
    let payload;
    try {
      payload = JSON.parse(bodyText);
    } catch (e) {
      logger.error('Razorpay webhook invalid JSON', { requestId, error: String(e) });
      return createErrorResponse('Invalid JSON payload', 400, {
        code: 'INVALID_JSON',
        requestId,
      });
    }

    logger.info('Razorpay webhook received', {
      requestId,
      event: payload.event,
      paymentId: payload.payload?.payment?.entity?.id,
    });

    // Handle different webhook events
    switch (payload.event) {
      case 'payment.authorized':
        return createSuccessResponse(
          { acknowledged: true },
          { message: 'Payment authorized event processed', requestId }
        );

      case 'payment.failed':
        return await handlePaymentFailed(payload, requestId);

      case 'payment.captured':
        return await handlePaymentCaptured(payload, requestId);

      case 'subscription.activated':
        return await handleSubscriptionActivated(payload, requestId);

      case 'subscription.paused':
        return await handleSubscriptionPaused(payload, requestId);

      case 'subscription.cancelled':
        return await handleSubscriptionCancelled(payload, requestId);

      default:
        logger.info('Razorpay webhook event not handled', {
          requestId,
          event: payload.event,
        });
        // Return success for unknown events (Razorpay expects 200)
        return createSuccessResponse(
          { acknowledged: true },
          { message: 'Webhook acknowledged', requestId }
        );
    }
  } catch (error) {
    logger.error('Razorpay webhook handler error', {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });
    return createErrorResponse('Webhook processing failed', 500, {
      code: 'WEBHOOK_ERROR',
      requestId,
    });
  }
};

/**
 * Handle payment.authorized event
 * Auto-activate subscription after successful payment authorization
 */
async function handlePaymentAuthorized(payload: any, requestId: string): Promise<NextResponse> {
  try {
    const payment = payload.payload?.payment?.entity;
    if (!payment) {
      logger.error('Payment authorized webhook missing payment entity', { requestId });
      return createErrorResponse('Missing payment entity', 400, {
        code: 'MISSING_PAYMENT',
        requestId,
      });
    }

    const notes = payment.notes || {};
    const userId = notes.user_id;
    const planId = notes.plan_id;
    const billingPeriod = notes.billing_period || 'monthly';

    if (!userId) {
      logger.error('Payment webhook missing user_id in notes', {
        requestId,
        paymentId: payment.id,
      });
      return createErrorResponse('Missing user_id in payment notes', 400, {
        code: 'MISSING_USER_ID',
        requestId,
      });
    }

    logger.info('Processing payment.authorized event', {
      requestId,
      userId,
      paymentId: payment.id,
      amount: payment.amount,
      planId,
      billingPeriod,
    });

    // Activate subscription for user
    const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = process.env;
    if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      logger.error('Supabase configuration missing', { requestId });
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
              // Ignore errors during webhook processing
            }
          },
          remove: (name: string, options: any) => {
            try {
              cookieStore.set({ name, value: '', ...options });
            } catch {
              // Ignore errors during webhook processing
            }
          },
        },
      }
    );

    // Activate subscription
    const subscriptionData = {
      subscription_status: 'active',
      subscription_tier: planId || 'pro',
      subscription_billing_period: billingPeriod,
      subscription_starts_at: new Date().toISOString(),
      subscription_ends_at: new Date(
        Date.now() + (billingPeriod === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000
      ).toISOString(),
      razorpay_payment_id: payment.id,
      razorpay_order_id: payment.order_id,
      last_payment_date: new Date().toISOString(),
    };

    // Update profile with subscription
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(subscriptionData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      logger.error('Failed to activate subscription', {
        requestId,
        userId,
        error: error.message,
      });
      return createErrorResponse('Failed to activate subscription', 500, {
        code: 'ACTIVATION_FAILED',
        requestId,
        details: { message: error.message },
      });
    }

    logger.info('Subscription activated via webhook', {
      requestId,
      userId,
      paymentId: payment.id,
      tier: planId,
      expiresAt: subscriptionData.subscription_ends_at,
    });

    return createSuccessResponse(
      {
        activated: true,
        userId,
        paymentId: payment.id,
        subscription: subscriptionData,
      },
      {
        message: 'Subscription activated',
        requestId,
      }
    );
  } catch (error) {
    logger.error('Error handling payment.authorized webhook', {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });
    return createErrorResponse('Failed to process webhook', 500, {
      code: 'PROCESSING_ERROR',
      requestId,
    });
  }
}

/**
 * Handle payment.failed event
 */
async function handlePaymentFailed(payload: any, requestId: string): Promise<NextResponse> {
  try {
    const payment = payload.payload?.payment?.entity;
    const notes = payment?.notes || {};
    const userId = notes.user_id;

    logger.warn('Payment failed via webhook', {
      requestId,
      userId,
      paymentId: payment?.id,
      reason: payment?.error_description,
    });

    // Could send email notification here
    return createSuccessResponse(
      { acknowledged: true },
      { message: 'Payment failed event processed', requestId }
    );
  } catch (error) {
    logger.error('Error handling payment.failed webhook', {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });
    return createSuccessResponse(
      { acknowledged: true },
      { message: 'Event acknowledged despite error', requestId }
    );
  }
}

/**
 * Handle payment.captured event
 */
async function handlePaymentCaptured(payload: any, requestId: string): Promise<NextResponse> {
  try {
    const payment = payload.payload?.payment?.entity;
    logger.info('Payment captured via webhook', {
      requestId,
      paymentId: payment?.id,
      amount: payment?.amount,
    });

    return createSuccessResponse(
      { acknowledged: true },
      { message: 'Payment captured event processed', requestId }
    );
  } catch (error) {
    logger.error('Error handling payment.captured webhook', {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });
    return createSuccessResponse(
      { acknowledged: true },
      { message: 'Event acknowledged despite error', requestId }
    );
  }
}

/**
 * Handle subscription.activated event
 */
async function handleSubscriptionActivated(payload: any, requestId: string): Promise<NextResponse> {
  try {
    const subscription = payload.payload?.subscription?.entity;
    logger.info('Subscription activated via webhook', {
      requestId,
      subscriptionId: subscription?.id,
    });

    return createSuccessResponse(
      { acknowledged: true },
      { message: 'Subscription activated event processed', requestId }
    );
  } catch (error) {
    logger.error('Error handling subscription.activated webhook', {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });
    return createSuccessResponse(
      { acknowledged: true },
      { message: 'Event acknowledged despite error', requestId }
    );
  }
}

/**
 * Handle subscription.paused event
 */
async function handleSubscriptionPaused(payload: any, requestId: string): Promise<NextResponse> {
  try {
    const subscription = payload.payload?.subscription?.entity;
    logger.warn('Subscription paused via webhook', {
      requestId,
      subscriptionId: subscription?.id,
    });

    return createSuccessResponse(
      { acknowledged: true },
      { message: 'Subscription paused event processed', requestId }
    );
  } catch (error) {
    logger.error('Error handling subscription.paused webhook', {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });
    return createSuccessResponse(
      { acknowledged: true },
      { message: 'Event acknowledged despite error', requestId }
    );
  }
}

/**
 * Handle subscription.cancelled event
 */
async function handleSubscriptionCancelled(payload: any, requestId: string): Promise<NextResponse> {
  try {
    const subscription = payload.payload?.subscription?.entity;
    logger.warn('Subscription cancelled via webhook', {
      requestId,
      subscriptionId: subscription?.id,
    });

    return createSuccessResponse(
      { acknowledged: true },
      { message: 'Subscription cancelled event processed', requestId }
    );
  } catch (error) {
    logger.error('Error handling subscription.cancelled webhook', {
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });
    return createSuccessResponse(
      { acknowledged: true },
      { message: 'Event acknowledged despite error', requestId }
    );
  }
}

export const POST = handler;
