import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { createRequestId } from '../../../../lib/requestContext';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { ProfileManager } from '@/lib/profile-manager';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface VerifyBody {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  user_id: string;
  plan_id: string;
  billing_period?: 'monthly' | 'yearly';
}

// Basic mapping of plan_id -> subscription tier name used in profile
function mapPlanToTier(plan_id: string): 'basic' | 'pro' | 'ultra' {
  if (plan_id === 'pro') return 'pro';
  if (plan_id === 'ultra') return 'ultra';
  return 'basic';
}

export async function POST(req: Request) {
  const reqId = createRequestId();
  try {
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return NextResponse.json({ error: 'Server misconfigured: missing Razorpay secret' }, { status: 500 });
    }

    const body: VerifyBody = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, user_id, plan_id, billing_period = 'monthly' } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !user_id || !plan_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const generatedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
    }

    // Admin Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Update order status & store payment id
    const { error: updateError } = await supabase
      .from('orders')
      .update({ status: 'paid', razorpay_payment_id: razorpay_payment_id })
      .eq('razorpay_order_id', razorpay_order_id);

    if (updateError) {
      logger.error('Order update failed after verification', { reqId, error: updateError });
    }

    // Activate subscription
    const tier = mapPlanToTier(plan_id);
    const profile = await ProfileManager.getOrCreateProfile(user_id, ''); // email not needed here

    // Determine subscription end date: yearly vs monthly
    const subscriptionEndDate = new Date();
    if (billing_period === 'yearly') {
      subscriptionEndDate.setFullYear(subscriptionEndDate.getFullYear() + 1);
    } else {
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
    }

    const { data: updatedProfile, error: profileUpdateError } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        subscription_tier: tier,
        subscription_ends_at: subscriptionEndDate.toISOString(),
        trial_ends_at: null,
        payment_id: razorpay_payment_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id)
      .select()
      .single();

    if (profileUpdateError) {
      logger.error('Profile subscription activation failed', { reqId, error: profileUpdateError });
    }

    return NextResponse.json({ success: true, profile: updatedProfile || profile });
  } catch (err: any) {
    logger.error('Verify payment error', { reqId, error: err });
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
  }
}
