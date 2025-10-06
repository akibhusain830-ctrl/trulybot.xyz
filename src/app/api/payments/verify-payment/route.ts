import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { ProfileManager } from '@/lib/profile-manager';
import { logger } from '@/lib/logger';
import { paymentRateLimit } from '@/lib/redisRateLimit';
import { validateRequest, paymentVerificationSchema } from '@/lib/validation';
import { 
  createErrorResponse, 
  createSuccessResponse, 
  createRateLimitResponse,
  createAuthErrorResponse,
  createValidationErrorResponse,
  getRequestId,
  logRequest,
  withErrorHandling
} from '@/lib/apiSecurity';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const handler = async (req: NextRequest): Promise<NextResponse> => {
  const requestId = getRequestId(req);
  logRequest(req, requestId);
  
  try {
    // Apply rate limiting
    const rateLimitResult = await paymentRateLimit(req);
    
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult.resetTime, {
        requestId,
        remaining: rateLimitResult.remaining,
        limit: 10,
      });
    }

    // Validate request body
    const validationResult = await validateRequest(req, paymentVerificationSchema, {
      logValidationErrors: true,
    });
    
    if (!validationResult.success) {
      return createValidationErrorResponse(validationResult.error, {
        requestId,
        details: validationResult.details,
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, user_id, plan_id, billing_period } = validationResult.data;

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
      return createAuthErrorResponse('Authentication required for payment verification', {
        requestId,
        code: 'AUTH_REQUIRED',
      });
    }

    // Security: Verify user can only activate subscription for themselves
    if (user_id !== user.id) {
      logger.error('Cross-user payment verification attempt', { 
        requestId, 
        authenticatedUserId: user.id, 
        requestedUserId: user_id 
      });
      
      return createErrorResponse(
        'Unauthorized: Cannot activate subscription for another user',
        403,
        {
          code: 'CROSS_USER_FORBIDDEN',
          requestId,
        }
      );
    }

    // Verify the payment signature with Razorpay
    const { RAZORPAY_KEY_SECRET } = process.env;
    
    if (!RAZORPAY_KEY_SECRET) {
      return createErrorResponse('Payment verification service unavailable', 500, {
        code: 'SERVICE_UNAVAILABLE',
        requestId,
      });
    }

    const bodyString = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(bodyString)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      logger.warn('Payment signature verification failed', { 
        requestId, 
        userId: user_id,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id
      });
      
      return createErrorResponse('Payment verification failed', 400, {
        code: 'INVALID_SIGNATURE',
        requestId,
      });
    }

    // Activate subscription through ProfileManager
    const profile = await ProfileManager.activateSubscription(
      user_id, 
      plan_id,
      razorpay_payment_id
    );

    logger.info('Payment verified and subscription activated', { 
      requestId, 
      userId: user_id,
      planId: plan_id,
      paymentId: razorpay_payment_id
    });

    return createSuccessResponse(
      {
        profile,
        subscription: {
          tier: plan_id,
          status: 'active',
          payment_id: razorpay_payment_id,
          billing_period,
        }
      },
      {
        message: 'Payment verified and subscription activated successfully!',
        requestId,
      }
    );
    
  } catch (error: any) {
    logger.error('Payment verification error', { 
      requestId, 
      error: error.message,
      stack: error.stack
    });
    
    return createErrorResponse('Payment verification failed', 500, {
      code: 'VERIFICATION_ERROR',
      requestId,
    });
  }
};

export const POST = withErrorHandling(handler);
