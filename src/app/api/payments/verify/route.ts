import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ valid: false, error: 'Missing fields' }, { status: 400 });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    const valid = expectedSignature === razorpay_signature;

    // TODO: if valid, update your DB (mark order as paid / grant access)
    return NextResponse.json({ valid });
  } catch (err: any) {
    console.error('Razorpay verification error:', err);
    return NextResponse.json({ valid: false, error: 'Verification failed' }, { status: 500 });
  }
}
