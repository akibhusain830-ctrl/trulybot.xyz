import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { createRequestId } from '../../../../lib/requestContext';
import { securePaymentService } from '@/lib/payment/securePaymentService';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const reqId = createRequestId();
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  const signature = req.headers.get('x-razorpay-signature') || '';
  const rawBody = await req.text();

  // 1. Validate webhook signature with secure service
  const webhookValidation = await securePaymentService.validateWebhookSignature(
    rawBody,
    signature,
    webhookSecret
  );

  if (!webhookValidation.isValid) {
    logger.error('Webhook signature validation failed', { 
      reqId, 
      error: webhookValidation.error,
      signatureLength: signature.length
    });
    
    return NextResponse.json({ 
      ok: false, 
      error: 'Invalid webhook signature' 
    }, { status: 401 });
  }

  const event = webhookValidation.event!;

  try {
    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity;
        
        // Extract payment details
        const paymentDetails = {
          type: 'payment.captured' as const,
          paymentId: payment.id,
          orderId: payment.order_id,
          amount: payment.amount / 100, // Razorpay sends in paise
          currency: payment.currency,
          status: payment.status,
          userId: '', // Will be set after order validation
          planId: '', // Will be set after order validation
          timestamp: new Date(payment.created_at * 1000)
        };

        // Validate order security
        const orderValidation = await securePaymentService.validateOrderSecurity(
          paymentDetails.orderId
        );

        if (!orderValidation.isValid) {
          logger.error('Order validation failed', { 
            reqId, 
            orderId: paymentDetails.orderId,
            error: orderValidation.error 
          });
          
          return NextResponse.json({ 
            ok: false, 
            error: 'Order validation failed' 
          }, { status: 404 });
        }

        // Set user and plan details from validated order
        paymentDetails.userId = orderValidation.userId!;
        paymentDetails.planId = orderValidation.planId!;

        // Process payment securely
        const processingResult = await securePaymentService.processPaymentEvent(paymentDetails);

        if (!processingResult.success) {
          logger.error('Payment processing failed', { 
            reqId, 
            paymentId: paymentDetails.paymentId,
            error: processingResult.error 
          });
          
          return NextResponse.json({ 
            ok: false, 
            error: 'Payment processing failed' 
          }, { status: 500 });
        }

        logger.info('Payment processed successfully', { 
          reqId, 
          paymentId: paymentDetails.paymentId,
          userId: paymentDetails.userId,
          planId: paymentDetails.planId,
          amount: paymentDetails.amount
        });

        break;
      }
      
      case 'payment.failed': {
        const payment = event.payload.payment.entity;
        
        logger.warn('Payment failed', { 
          reqId, 
          paymentId: payment.id,
          orderId: payment.order_id,
          errorCode: payment.error_code,
          errorDescription: payment.error_description
        });
        
        // Log failed payment for monitoring
        // Could trigger notification to user about failed payment
        break;
      }
      
      case 'order.paid': {
        // Additional validation for order.paid events
        const order = event.payload.order.entity;
        
        logger.info('Order paid event received', { 
          reqId, 
          orderId: order.id,
          amount: order.amount / 100
        });
        
        break;
      }
      
      default:
        logger.info('Unhandled webhook event', { 
          reqId, 
          eventType: event.event 
        });
        break;
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('Webhook processing error', { 
      reqId, 
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({ 
      ok: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
