import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';
import { getPricingTier } from '@/lib/constants/pricing';
import { logger } from '@/lib/logger';
import { createRequestId } from '../../../../lib/requestContext';


export const dynamic = 'force-dynamic';

// Setup Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CreateOrderBody {
  plan_id: string;
  currency?: 'INR' | 'USD';
  billing_period?: 'monthly' | 'yearly';
  user_id: string;
  receipt?: string;
  notes?: Record<string, any>;
}

export async function POST(req: Request) {
  const reqId = createRequestId();
  const trace: Record<string, any> = { stage: 'start', reqId };
  try {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      return NextResponse.json({ error: 'Server misconfigured: missing Razorpay keys', code: 'NO_KEYS' }, { status: 500 });
    }

    trace.stage = 'parse-body';
    const body: CreateOrderBody = await req.json();
    const { plan_id, currency = 'INR', billing_period = 'monthly', user_id, receipt, notes = {} } = body;
    trace.plan_id = plan_id; trace.billing_period = billing_period; trace.currency = currency;

    if (!plan_id || !user_id) {
      return NextResponse.json({ error: 'plan_id and user_id are required', code: 'MISSING_FIELDS' }, { status: 400 });
    }

    trace.stage = 'fetch-tier';
    const tier = getPricingTier(plan_id);
    if (!tier) {
      return NextResponse.json({ error: 'Invalid plan_id', code: 'BAD_PLAN' }, { status: 400 });
    }

    trace.stage = 'compute-amount';
    let numericAmount = 0;
    if (billing_period === 'yearly') {
      numericAmount = currency === 'INR' ? tier.yearlyInr : tier.yearlyUsd;
    } else {
      numericAmount = currency === 'INR' ? tier.monthlyInr : tier.monthlyUsd;
    }

    if (currency === 'INR') {
      numericAmount = Math.round(numericAmount);
    } else {
      numericAmount = Number(numericAmount.toFixed(2));
    }
    trace.amount = numericAmount;

    if (!numericAmount || numericAmount <= 0) {
      return NextResponse.json({ error: 'Invalid plan pricing configuration', code: 'BAD_AMOUNT' }, { status: 500 });
    }

    trace.stage = 'razorpay-create';
    const razorpay = new Razorpay({ key_id, key_secret });
    let order;
    try {
      order = await razorpay.orders.create({
        amount: Math.round(numericAmount * 100),
        currency,
        receipt: receipt || `${plan_id}-${billing_period}-${Date.now()}`,
        notes: { ...notes, plan_id, billing_period }
      });
    } catch (rpErr: any) {
      logger.error('Razorpay API error', { reqId, error: rpErr });
      return NextResponse.json({ error: 'Razorpay order failed', code: 'RAZORPAY_ORDER_FAIL' }, { status: 502 });
    }
    trace.order_id = order.id;

    trace.stage = 'db-insert';
    const insertPayload = {
      razorpay_order_id: order.id,
      user_id,
      plan_id,
      billing_period,
      amount: numericAmount,
      currency,
      notes,
      status: order.status,
      created_at: new Date().toISOString(),
    } as any;
    const { error: supabaseError } = await supabase.from('orders').insert([insertPayload]);
    if (supabaseError) {
      logger.error('Supabase orders insert error', { reqId, error: supabaseError });
      return NextResponse.json({ error: 'Failed to save order in database', code: 'DB_INSERT_FAIL', supabase: { message: supabaseError.message, details: supabaseError.details, hint: supabaseError.hint, code: supabaseError.code } }, { status: 500 });
    }

    trace.stage = 'success';
    return NextResponse.json({ order, pricing_version: process.env.PRICING_VERSION, billing_period });
  } catch (err: any) {
    logger.error('Razorpay create order error (unhandled)', { reqId, error: err, trace });
    return NextResponse.json({ error: 'Failed to create order', code: 'UNHANDLED' }, { status: 500 });
  }
}
