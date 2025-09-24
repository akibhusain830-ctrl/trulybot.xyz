import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  const signature = req.headers.get('x-razorpay-signature') || '';

  const rawBody = await req.text();

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  if (expectedSignature !== signature) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  try {
    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity;
        // TODO: persist payment, mark order paid, grant access
        break;
      }
      case 'order.paid': {
        const order = event.payload.order.entity;
        // TODO: mark order paid
        break;
      }
      case 'payment.failed': {
        const payment = event.payload.payment.entity;
        // TODO: mark as failed / notify
        break;
      }
      default:
        break;
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Webhook handling error:', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
