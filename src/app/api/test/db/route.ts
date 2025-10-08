import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Test endpoint to diagnose database issues
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Test 1: Check if we can connect to orders table
    const { data: existingOrders, error: selectError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);

    if (selectError) {
      return NextResponse.json({
        success: false,
        test: 'database_select',
        error: {
          message: selectError.message,
          code: selectError.code,
          details: selectError.details
        }
      }, { status: 500 });
    }

    // Test 2: Try to insert a test order
    const testOrder = {
      razorpay_order_id: `test_${Date.now()}`,
      user_id: '46b08806-5fd6-4fac-a253-6c43920ec396', // Your user ID from logs
      plan_id: 'basic',
      billing_period: 'monthly',
      amount: 99,
      currency: 'INR',
      notes: { test: true },
      status: 'created',
      created_at: new Date().toISOString(),
    };

    const { data: insertData, error: insertError } = await supabase
      .from('orders')
      .insert([testOrder])
      .select();

    if (insertError) {
      return NextResponse.json({
        success: false,
        test: 'database_insert',
        testOrder,
        error: {
          message: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint
        }
      }, { status: 500 });
    }

    // Clean up test order
    await supabase
      .from('orders')
      .delete()
      .eq('razorpay_order_id', testOrder.razorpay_order_id);

    return NextResponse.json({
      success: true,
      message: 'Database tests passed',
      existingOrdersCount: existingOrders?.length || 0,
      insertedOrder: insertData?.[0]
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      test: 'general_error',
      error: {
        message: error.message,
        stack: error.stack
      }
    }, { status: 500 });
  }
}
