import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { getPlanQuota, currentMonthKey, countWords } from '@/lib/constants/quotas';
import { config } from '@/lib/config/secrets';
import { withApi } from '@/lib/middleware/apiHandler';
import { limitIp } from '@/lib/middleware/rateLimiter';
import { AuthError } from '@/lib/errors';


export const dynamic = 'force-dynamic';

export const GET = withApi(async function GET(req: NextRequest) {
    const rl = limitIp(req as any as Request, 'global');
    if (rl.limited) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
    }
    const cookieStore = cookies();
    const supabase = createServerClient(
      config.supabase.url,
      config.supabase.anonKey,
      { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
    );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new AuthError('Not authenticated');

    // Admin client for unrestricted reads
    const admin = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey,
      { auth: { persistSession: false } }
    );

    // Fetch profile (workspace + tier)
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('workspace_id, subscription_tier, trial_ends_at, subscription_status')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const tier = profile.subscription_tier || 'basic';
    const quota = getPlanQuota(tier) || getPlanQuota('basic')!;
    const month = currentMonthKey();
    const workspaceId = profile.workspace_id || user.id; // fallback to user id if workspace not assigned

    // Attempt new schema first (workspace_id + month). If not present, fall back to legacy (user_id + period_start)
    const { data: usageRowNew, error: newErr } = await admin
      .from('usage_counters')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('month', month)
      .maybeSingle();

    let usageRow: any = usageRowNew;
    let legacy = false;

    if (!usageRowNew && newErr == null) {
      // Try legacy pattern
      const firstOfMonth = new Date();
      firstOfMonth.setUTCDate(1); firstOfMonth.setUTCHours(0,0,0,0);
      const isoFirst = firstOfMonth.toISOString().split('T')[0];
      const { data: legacyRow } = await admin
        .from('usage_counters')
        .select('*')
        .eq('user_id', user.id)
        .eq('period_start', isoFirst)
        .maybeSingle();
      if (legacyRow) {
        usageRow = legacyRow;
        legacy = true;
      }
    }

    // Map values from either schema
    let totalStored = 0;
    let monthlyUploads = 0;
    let monthlyConversations = 0;
    if (usageRow) {
      totalStored = usageRow.total_stored_words ?? usageRow.stored_words ?? 0;
      monthlyUploads = usageRow.monthly_uploads ?? usageRow.upload_count ?? 0;
      monthlyConversations = usageRow.monthly_conversations ?? usageRow.conversation_count ?? 0;
    }

    // Fallback: if no usage row yet, compute total stored from documents
    if (!usageRow) {
      // Compute from documents table
      const { data: docs } = await admin
        .from('documents')
        .select('word_count, content, created_at')
        .eq('user_id', user.id); // fallback query by user; adjust if workspace_id column exists universally
      if (docs) {
        totalStored = docs.reduce((acc: number, d: any) => acc + (d.word_count ?? (d.content ? countWords(String(d.content)) : 0)), 0);
        // Monthly uploads: count docs created this month
        const monthPrefix = month + '-';
        monthlyUploads = docs.filter((d: any) => d.created_at && d.created_at.startsWith(monthPrefix)).length;
      }
    } else if (totalStored === 0) {
      // Defensive recompute if counter row exists but value suspiciously zero while documents exist
      const { data: docs } = await admin
        .from('documents')
        .select('word_count, content')
        .eq('user_id', user.id)
        .limit(5); // small probe
      if (docs && docs.length > 0) {
        const probeSum = docs.reduce((acc: number, d: any) => acc + (d.word_count ?? (d.content ? countWords(String(d.content)) : 0)), 0);
        if (probeSum > 0) {
          // fallback full recompute
          const { data: allDocs } = await admin
            .from('documents')
            .select('word_count, content, created_at')
            .eq('user_id', user.id);
          if (allDocs) {
            totalStored = allDocs.reduce((a: number, d: any) => a + (d.word_count ?? (d.content ? countWords(String(d.content)) : 0)), 0);
          }
        }
      }
    }

  const uploadsRemaining = Math.max(0, quota.monthlyUploadLimit - monthlyUploads);

  // Conversation usage (only meaningful if cap exists)
  let conversationCap = quota.monthlyConversationCap || null;
  let conversationsRemaining = conversationCap !== null ? Math.max(0, conversationCap - monthlyConversations) : null;

    return NextResponse.json({
      plan: tier,
      month,
      monthly_uploads: monthlyUploads,
      monthly_upload_limit: quota.monthlyUploadLimit,
      uploads_remaining: uploadsRemaining,
      per_upload_word_limit: quota.perUploadWordLimit,
      total_stored_words: totalStored,
      total_word_cap: quota.totalWordCap,
      monthly_conversations: monthlyConversations,
      monthly_conversation_cap: conversationCap,
      conversations_remaining: conversationsRemaining,
      _schema: legacy ? 'legacy' : 'modern'
    }, { headers: { 'x-rate-limit-remaining': String(rl.remaining) } });
});
