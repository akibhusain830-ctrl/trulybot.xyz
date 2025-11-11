import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { createRequestId } from '../../../../lib/requestContext';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';


export const dynamic = 'force-dynamic';

// Setup Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role key for server-side operations
);

export async function POST(req: Request) {
  const reqId = createRequestId();
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  const signature = req.headers.get('x-razorpay-signature') || '';
  const rawBody = await req.text();

  // 1. Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  if (expectedSignature !== signature) {
    return NextResponse.json({ ok: false, error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  try {
    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity;
        // Extract details from payment object
        const razorpay_payment_id = payment.id;
        const razorpay_order_id = payment.order_id;
        const amount_paid = payment.amount / 100; // Razorpay sends in paise
        const currency = payment.currency;
        const upi = payment.vpa || null; // UPI ID if present
        const payment_status = payment.status;
        const created_at = new Date(payment.created_at * 1000).toISOString();

        // Fetch your order mapping from Supabase using razorpay_order_id
        // Assumption: you have a table `orders` with order_id, user_id, plan_id, etc.
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select('user_id, plan_id')
          .eq('razorpay_order_id', razorpay_order_id)
          .single();

        if (orderError || !order) {
          logger.error('Order not found for razorpay_order_id', { reqId, razorpay_order_id });
          return NextResponse.json({ ok: false, error: 'Order not found' }, { status: 404 });
        }

        // Insert into billing_history
        const { error: bhError } = await supabase.from('billing_history').insert([{
          user_id: order.user_id,
          plan_id: order.plan_id,
          amount_paid,
          upi,
          payment_status,
          razorpay_payment_id,
          razorpay_order_id,
          currency,
          created_at,
        }]);

        if (bhError) {
          logger.error('Failed to insert billing_history', { reqId, error: bhError });
          return NextResponse.json({ ok: false, error: 'Billing history insert failed' }, { status: 500 });
        }

        // Optionally: grant access to plan, send email, etc.

        break;
      }
      case 'order.paid': {
        // You may want to update your order status here
        break;
      }
      case 'payment.failed': {
        // Optionally log or notify about failed payment
        break;
      }
      default:
        break;
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    logger.error('Webhook handling error', { reqId, error: e });
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
