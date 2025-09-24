import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

    const { amount, currency = 'INR', receipt, notes } = await req.json();

    if (!amount || typeof amount !== 'number') {
      return NextResponse.json({ error: 'amount (number) is required' }, { status: 400 });
    }

    // Razorpay expects smallest unit (paise for INR)
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt,
      notes,
      payment_capture: 1,
    } as any);

    return NextResponse.json({ order });
  } catch (err: any) {
    console.error('Razorpay create order error:', err);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
