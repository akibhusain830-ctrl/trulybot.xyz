import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Setup Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      console.error('Server misconfigured: missing Razorpay keys');
      return NextResponse.json(
        { error: 'Server misconfigured: missing Razorpay keys' },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({ key_id, key_secret });

    const { amount, currency = 'INR', receipt, notes, user_id, plan_id } = await req.json();

    if (!amount || typeof amount !== 'number' || !user_id || !plan_id) {
      return NextResponse.json({ error: 'amount (number), user_id, and plan_id are required' }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt,
      notes,
    });
    
    // This payload now correctly includes the 'amount' and matches your database schema
    const insertPayload = {
      razorpay_order_id: order.id,
      user_id,
      plan_id,
      amount,
      currency,
      notes,
      status: order.status,
      created_at: new Date().toISOString(),
    };

    const { error: supabaseError } = await supabase.from('orders').insert([insertPayload]);

    if (supabaseError) {
      console.error('Supabase orders insert error:', supabaseError);
      return NextResponse.json({ error: 'Failed to save order in database' }, { status: 500 });
    }

    return NextResponse.json({ order });
  } catch (err: any) {
    console.error('Razorpay create order error:', err);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}