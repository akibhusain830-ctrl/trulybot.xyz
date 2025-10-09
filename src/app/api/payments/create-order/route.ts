import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';
import { getPricingTier } from '@/lib/constants/pricing';
import { logger } from '@/lib/logger';
import { orderRateLimit } from '@/lib/redisRateLimit';
import { validateRequest, createOrderSchema } from '@/lib/validation';
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

export const dynamic = 'force-dynamic';

// Setup Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const handler = async (req: NextRequest): Promise<NextResponse> => {
  const requestId = getRequestId(req);
  logRequest(req, requestId);
  
  try {
    // Apply rate limiting
    const rateLimitResult = await orderRateLimit(req);
    
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult.resetTime, {
        requestId,
        remaining: rateLimitResult.remaining,
        limit: 5,
      });
    }

    // Check authentication
    const cookieStore = cookies();
    const supabaseAuth = createServerClient(
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

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    
    if (authError || !user) {
      return createAuthErrorResponse('Authentication required for order creation', {
        requestId,
        code: 'AUTH_REQUIRED',
      });
    }

    // Validate request body
    const validationResult = await validateRequest(req, createOrderSchema, {
      logValidationErrors: true,
    });
    
    if (!validationResult.success) {
      return createValidationErrorResponse(validationResult.error, {
        requestId,
        details: validationResult.details,
      });
    }

    const { plan_id, currency, billing_period, user_id, receipt, notes } = validationResult.data;

    // Security: Verify user can only create orders for themselves
    if (user_id !== user.id) {
      logger.error('Cross-user order creation attempt', { 
        requestId, 
        authenticatedUserId: user.id, 
        requestedUserId: user_id 
      });
      
      return createErrorResponse(
        'Unauthorized: Cannot create order for another user',
        403,
        {
          code: 'CROSS_USER_FORBIDDEN',
          requestId,
        }
      );
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      return createErrorResponse('Payment service unavailable', 500, {
        code: 'SERVICE_UNAVAILABLE',
        requestId,
      });
    }

    // Get pricing tier
    const tier = getPricingTier(plan_id);
    if (!tier) {
      return createValidationErrorResponse('Invalid plan ID', {
        requestId,
        details: { validPlans: ['basic', 'pro', 'ultra'] }
      });
    }

    // Calculate amount based on billing period and currency
    let numericAmount = 0;
    if (billing_period === 'yearly') {
      numericAmount = tier.yearlyInr;
    } else {
      numericAmount = tier.monthlyInr;
    }

    if (currency === 'INR') {
      numericAmount = Math.round(numericAmount);
    } else {
      numericAmount = Number(numericAmount.toFixed(2));
    }

    if (!numericAmount || numericAmount <= 0) {
      return createErrorResponse('Invalid plan pricing configuration', 500, {
        code: 'PRICING_ERROR',
        requestId,
      });
    }

    // Create Razorpay order
    const razorpay = new Razorpay({ key_id, key_secret });
    let order: any;
    try {
      order = await razorpay.orders.create({
        amount: Math.round(numericAmount * 100), // Razorpay expects amount in smallest currency unit
        currency: currency || 'INR',
        receipt: receipt || `${plan_id}-${billing_period || 'monthly'}-${Date.now()}`,
        notes: { 
          ...notes, 
          plan_id, 
          billing_period: billing_period || 'monthly',
          user_id,
          created_via: 'trulybot_api'
        }
      });
    } catch (rpErr: any) {
      logger.error('Razorpay API error', { 
        requestId, 
        error: rpErr.message,
        plan_id,
        amount: numericAmount 
      });
      return createErrorResponse('Payment service error', 502, {
        code: 'RAZORPAY_ERROR',
        requestId,
      });
    }

    // Save order to database
    const insertPayload = {
      razorpay_order_id: order.id,
      user_id,
      plan_id,
      billing_period: billing_period || 'monthly',
      amount: numericAmount,
      currency: currency || 'INR',
      notes: notes || {},
      status: order.status,
      created_at: new Date().toISOString(),
    };

    const { error: supabaseError } = await supabase
      .from('orders')
      .insert([insertPayload]);

    if (supabaseError) {
      logger.error('Database order insert error', { 
        requestId, 
        error: supabaseError.message,
        errorCode: supabaseError.code,
        errorDetails: supabaseError.details,
        errorHint: supabaseError.hint,
        orderId: order.id,
        insertPayload,
        // Add more debug info
        tableName: 'orders',
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      });
      
      // Try to cancel the Razorpay order if database insert fails
      try {
        // Note: Razorpay orders cannot be cancelled, but we log for monitoring
        logger.warn('Order created in Razorpay but failed to save in database', { 
          requestId, 
          orderId: order.id 
        });
      } catch (cancelErr) {
        logger.warn('Failed to handle Razorpay order after DB error', { 
          requestId, 
          orderId: order.id 
        });
      }
      
      return createErrorResponse(`Database error: ${supabaseError.message}`, 500, {
        code: 'ORDER_CREATION_FAILED',
        requestId,
        details: supabaseError.code
      });
    }

    logger.info('Order created successfully', {
      requestId,
      orderId: order.id,
      userId: user_id,
      planId: plan_id,
      amount: numericAmount,
      currency
    });

    return createSuccessResponse(
      {
        order: {
          id: order.id,
          amount: numericAmount,
          currency,
          plan_id,
          billing_period,
          status: order.status,
        },
        razorpay: {
          order_id: order.id,
          amount: order.amount,
          currency: order.currency,
          key_id,
        }
      },
      {
        message: 'Order created successfully',
        requestId,
      }
    );
    
  } catch (error: any) {
    logger.error('Order creation error', { 
      requestId, 
      error: error.message,
      stack: error.stack
    });
    
    return createErrorResponse('Order creation failed', 500, {
      code: 'ORDER_ERROR',
      requestId,
    });
  }
};

export const POST = withErrorHandling(handler);