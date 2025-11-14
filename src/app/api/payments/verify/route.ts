import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { createRequestId } from '../../../../lib/requestContext';
import crypto from 'crypto';


export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ valid: false, error: 'Use /api/payments/verify-payment' }, { status: 410 });
  }
  const reqId = createRequestId();
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
    return NextResponse.json({ valid });
  } catch (err: any) {
    logger.error('Razorpay verification error', { reqId, error: err });
    return NextResponse.json({ valid: false, error: 'Verification failed' }, { status: 500 });
  }
}
