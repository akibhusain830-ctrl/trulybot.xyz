import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { createRequestId } from '../../../lib/requestContext';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET(req: NextRequest) {
  const reqId = createRequestId();
  // Add authentication check
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user's workspace for security filtering
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('workspace_id')
    .eq('id', user.id)
    .single();

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get('workspaceId');
  const status = searchParams.get('status');
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') || '20', 10));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabaseAdmin
    .from('leads')
    .select('id,workspace_id,source_bot_id,email,first_message,status,origin,created_at,intent_keywords,meta,name,company', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  // SECURITY: Only show leads from user's workspace
  if (profile?.workspace_id) {
    query = query.eq('workspace_id', profile.workspace_id);
  } else {
    // If no workspace, only show demo leads
    query = query.is('workspace_id', null);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;
  if (error) {
    logger.error('[GET /api/leads] error', { reqId, error });
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
  }

  return NextResponse.json({
    data,
    page,
    pageSize,
    total: count || 0
  });
}

export async function POST(req: NextRequest) {
  const reqId = createRequestId();
  try {
    // Get auth token from request headers
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const leadData = await req.json();
    
    const { data, error } = await supabaseAdmin
      .from('leads')
      .insert({
        ...leadData,
        user_id: user.id // Associate lead with current user
      })
      .select()
      .single();

    if (error) {
      logger.error('[POST /api/leads] error', { reqId, error });
      return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
