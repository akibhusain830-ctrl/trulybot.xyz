import { NextResponse } from 'next/server';
import { config } from '@/lib/config/secrets';
import { createClient } from '@supabase/supabase-js';


export const dynamic = 'force-dynamic';

// Basic health check: reports service status & upstream connectivity (Supabase)
export async function GET() {
  const started = Date.now();
  let supabaseOk = false;
  try {
    const admin = createClient(config.supabase.url, config.supabase.serviceRoleKey, { auth: { persistSession: false } });
    // Lightweight metadata fetch (select 1) using rpc not necessary; use auth schema version test.
    const { error } = await admin.from('profiles').select('id').limit(1);
    supabaseOk = !error;
  } catch {
    supabaseOk = false;
  }
  const durationMs = Date.now() - started;
  const healthy = supabaseOk; // Expand with additional checks later
  return NextResponse.json({
    status: healthy ? 'ok' : 'degraded',
    uptime_s: process.uptime(),
    env: config.env,
    checks: {
      supabase: supabaseOk ? 'ok' : 'fail'
    },
    latency_ms: durationMs
  }, { status: healthy ? 200 : 503 });
}
