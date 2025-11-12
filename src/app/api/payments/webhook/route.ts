import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { createRequestId } from '../../../../lib/requestContext';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { getPricingTier } from '@/lib/constants/pricing';


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
        const method = payment.method || null;
        const payment_status = payment.status;
        const created_at = new Date(payment.created_at * 1000).toISOString();

        // Fetch your order mapping from Supabase using razorpay_order_id
        // Assumption: you have a table `orders` with order_id, user_id, plan_id, etc.
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select('user_id, plan_id, billing_period, amount, currency, status, created_at')
          .eq('razorpay_order_id', razorpay_order_id)
          .single();

        if (orderError || !order) {
          logger.error('Order not found for razorpay_order_id', { reqId, razorpay_order_id });
          return NextResponse.json({ ok: false, error: 'Order not found' }, { status: 404 });
        }

        // Lookup workspace_id from profiles
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('workspace_id')
          .eq('id', order.user_id)
          .single();

        if (profileError || !profile?.workspace_id) {
          logger.error('Workspace not found for user', { reqId, user_id: order.user_id });
          return NextResponse.json({ ok: false, error: 'Workspace not found' }, { status: 404 });
        }

        // Map plan info
        const tier = getPricingTier(order.plan_id);
        const plan_name = tier?.name || order.plan_id;
        const plan_type = order.plan_id === 'pro' ? 'premium' : (order.plan_id as 'free' | 'basic' | 'premium' | 'enterprise');

        // Compute billing period
        const periodStart = new Date();
        const periodEnd = new Date(periodStart);
        if (order.billing_period === 'yearly') {
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        } else {
          periodEnd.setMonth(periodEnd.getMonth() + 1);
        }

        // Normalize payment status to billing_history domain
        const normalizedStatus = payment_status === 'captured' ? 'paid' : (payment_status === 'failed' ? 'failed' : 'processing');

        // Payment method mapping
        const paymentMethod: string | null = (method === 'card') ? 'credit_card' : (method === 'bank_transfer') ? 'bank_transfer' : (method === 'upi') ? 'other' : null;

        // Build billing_history record per schema
        const billingRecord = {
          workspace_id: profile.workspace_id,
          user_id: order.user_id,
          billing_cycle: order.billing_period === 'yearly' ? 'annual' : 'monthly',
          invoice_id: razorpay_order_id,
          invoice_number: `INV-${razorpay_order_id}`,
          billing_period_start: periodStart.toISOString(),
          billing_period_end: periodEnd.toISOString(),
          invoice_date: created_at,
          due_date: created_at,
          subtotal_amount: order.amount,
          tax_amount: 0,
          discount_amount: 0,
          total_amount: order.amount,
          currency: order.currency || currency,
          payment_status: normalizedStatus,
          payment_method: paymentMethod,
          payment_provider: 'razorpay',
          payment_reference: razorpay_payment_id,
          paid_at: normalizedStatus === 'paid' ? created_at : null,
          plan_id: order.plan_id,
          plan_name,
          plan_type,
          quantity: 1,
          unit_price: order.amount,
          metadata: { raw_payment: payment },
        };

        // Insert into billing_history
        const { error: bhError } = await supabase
          .from('billing_history')
          .insert([billingRecord]);

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
