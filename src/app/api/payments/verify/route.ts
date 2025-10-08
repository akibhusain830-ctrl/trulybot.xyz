import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { createRequestId } from '../../../../lib/requestContext';
import { securePaymentService } from '@/lib/payment/securePaymentService';
import { authenticateRequest } from '@/lib/protectedRoute';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const reqId = createRequestId();
  
  try {
    // Authenticate the request
    const authResult = await authenticateRequest(req);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult;

    // Parse and validate request body
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      logger.warn('Payment verification: Missing required fields', { 
        reqId, 
        userId: user.id,
        hasOrderId: !!razorpay_order_id,
        hasPaymentId: !!razorpay_payment_id,
        hasSignature: !!razorpay_signature
      });
      
      return NextResponse.json({ 
        valid: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Validate order ownership and security
    const orderValidation = await securePaymentService.validateOrderSecurity(
      razorpay_order_id,
      user.id
    );

    if (!orderValidation.isValid) {
      logger.warn('Payment verification: Order validation failed', { 
        reqId, 
        userId: user.id,
        orderId: razorpay_order_id,
        error: orderValidation.error
      });
      
      return NextResponse.json({ 
        valid: false, 
        error: 'Order validation failed' 
      }, { status: 403 });
    }

    // Validate payment signature
    const signatureValidation = await securePaymentService.validatePaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      process.env.RAZORPAY_KEY_SECRET!
    );

    if (!signatureValidation.isValid) {
      logger.warn('Payment verification: Signature validation failed', { 
        reqId, 
        userId: user.id,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id
      });
    } else {
      logger.info('Payment verification: Signature validated successfully', { 
        reqId, 
        userId: user.id,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id
      });
    }

    return NextResponse.json({ 
      valid: signatureValidation.isValid,
      error: signatureValidation.error 
    });

  } catch (error) {
    logger.error('Payment verification error', { 
      reqId, 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({ 
      valid: false, 
      error: 'Verification failed' 
    }, { status: 500 });
  }
}
