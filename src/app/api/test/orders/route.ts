import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Test if orders table exists
    const { data, error } = await supabase
      .from('orders')
      .select('id')
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        error: `Orders table error: ${error.message}`,
        code: error.code,
        details: error.details,
        hint: error.hint
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Orders table exists and is accessible',
      hasData: data && data.length > 0
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: `Test failed: ${error.message}`
    }, { status: 500 });
  }
}