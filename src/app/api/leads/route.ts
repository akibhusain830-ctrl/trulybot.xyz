import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { createRequestId } from '../../../lib/requestContext';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { authenticateRequest } from '@/lib/protectedRoute';

export async function GET(req: NextRequest) {
  const reqId = createRequestId();
  
  // Authentication check using unified system
  const authResult = await authenticateRequest(req);
  if (!authResult.success) {
    return authResult.response;
  }

  // Get user's workspace for security filtering
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('workspace_id')
    .eq('id', authResult.userId)
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
    // Authentication check using unified system
    const authResult = await authenticateRequest(req);
    if (!authResult.success) {
      return authResult.response;
    }

    const leadData = await req.json();
    
    const { data, error } = await supabaseAdmin
      .from('leads')
      .insert({
        ...leadData,
        user_id: authResult.userId // Associate lead with current user
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
