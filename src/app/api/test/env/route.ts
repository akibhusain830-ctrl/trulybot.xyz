import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    return NextResponse.json({
      success: true,
      environment: {
        supabaseUrl: supabaseUrl ? 'Set' : 'Missing',
        supabaseServiceKey: supabaseServiceKey ? 'Set' : 'Missing',
        razorpayKeyId: razorpayKeyId ? 'Set' : 'Missing',
        razorpayKeySecret: razorpayKeySecret ? 'Set' : 'Missing',
      },
      values: {
        supabaseUrl: supabaseUrl || 'Not set',
        supabaseServiceKeyLength: supabaseServiceKey?.length || 0,
        razorpayKeyId: razorpayKeyId || 'Not set',
        razorpayKeySecretLength: razorpayKeySecret?.length || 0,
      }
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
