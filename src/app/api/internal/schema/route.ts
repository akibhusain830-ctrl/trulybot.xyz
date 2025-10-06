import { NextResponse } from 'next/server';
import { config } from '@/lib/config/secrets';
import { createClient } from '@supabase/supabase-js';


export const dynamic = 'force-dynamic';

// Provides a minimal snapshot of expected vs actual columns for critical tables.
// Helpful during migrations / debugging missing column issues (e.g., word_count).
export async function GET() {
  const admin = createClient(config.supabase.url, config.supabase.serviceRoleKey, { auth: { persistSession: false } });

  // Expected schema definition — keep very small to avoid disclosure of sensitive structure.
  const expected = {
    documents: ['id','user_id','filename','content','word_count','status','created_at'],
    usage_counters: ['id','workspace_id','user_id','month','monthly_uploads','monthly_words','total_stored_words','monthly_conversations','created_at']
  } as const;

  const issues: Record<string,string[]> = {};

  // We'll attempt to select 0 rows requesting each column; capture missing column errors.
  for (const [table, cols] of Object.entries(expected)) {
    const { error } = await admin.from(table).select(cols.join(','), { head: true, count: 'exact' }).limit(0);
    if (error) {
      // Attempt to parse missing column mentions
      const missing: string[] = [];
      for (const c of cols) {
        if (error.message.includes(c)) missing.push(c);
      }
      issues[table] = missing.length ? missing : [error.message];
    }
  }

  return NextResponse.json({
    schema_check: Object.keys(issues).length === 0 ? 'ok' : 'mismatch',
    issues: Object.keys(issues).length ? issues : null,
    inspected: Object.keys(expected)
  }, { status: Object.keys(issues).length === 0 ? 200 : 206 });
}
