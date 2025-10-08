import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  try {
    // Test basic database connectivity
    const { data: healthCheck, error: healthError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .limit(1);

    if (healthError) {
      return NextResponse.json({
        status: 'unhealthy',
        error: 'Database connectivity failed',
        details: healthError.message
      }, { status: 500 });
    }

    // Check if has_used_trial column exists by trying to query it
    let hasUsedTrialExists = false;
    try {
      const { error: columnError } = await supabaseAdmin
        .from('profiles')
        .select('has_used_trial')
        .limit(1);
      
      hasUsedTrialExists = !columnError;
    } catch (e) {
      hasUsedTrialExists = false;
    }

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      schema: {
        has_used_trial_column: hasUsedTrialExists
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      error: 'Database health check failed',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
