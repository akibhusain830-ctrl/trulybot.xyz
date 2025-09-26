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
      return NextResponse.json(
        { error: 'Server misconfigured: missing Razorpay keys' },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({ key_id, key_secret });

    // You should include user_id and plan_id in the request body
    const { amount, currency = 'INR', receipt, notes, user_id, plan_id } = await req.json();

    if (!amount || typeof amount !== 'number' || !user_id || !plan_id) {
      return NextResponse.json({ error: 'amount (number), user_id, and plan_id are required' }, { status: 400 });
    }

    // Razorpay expects smallest unit (paise for INR)
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt,
      notes,
      payment_capture: 1,
    } as any);

    // Insert into Supabase orders table
    const { error: supabaseError } = await supabase.from('orders').insert([{
      razorpay_order_id: order.id,
      user_id,
      plan_id,
      created_at: new Date().toISOString(),
    }]);

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
