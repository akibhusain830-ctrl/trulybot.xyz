import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function GET(req: NextRequest) {
  try {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return NextResponse.json({
        success: false,
        error: 'Razorpay keys not configured',
        debug: {
          keyId: key_id ? 'Set' : 'Missing',
          keySecret: key_secret ? 'Set' : 'Missing'
        }
      }, { status: 500 });
    }

    // Test Razorpay order creation
    const razorpay = new Razorpay({ key_id, key_secret });
    
    const testOrder = await razorpay.orders.create({
      amount: 9900, // ₹99 in paise
      currency: 'INR',
      receipt: `test-${Date.now()}`,
      notes: { 
        test: 'true',
        created_via: 'trulybot_test_api'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Razorpay integration working',
      orderId: (testOrder as any).id,
      amount: (testOrder as any).amount,
      currency: (testOrder as any).currency,
      status: (testOrder as any).status
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: {
        message: error.message,
        stack: error.stack
      }
    }, { status: 500 });
  }
}