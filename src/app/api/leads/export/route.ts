import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { buildCsv } from '@/lib/utils/csvBuilder';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await admin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workspaceId, status } = await req.json();

    let query = admin
      .from('leads')
      .select('created_at,email,status,origin,workspace_id,name,company,intent_keywords')
      .order('created_at', { ascending: false });

    if (workspaceId) {
      if (workspaceId === 'demo') {
        query = query.is('workspace_id', null);
      } else {
        query = query.eq('workspace_id', workspaceId);
      }
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) {
      console.error('[POST /api/leads/export] error', error);
      return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }

    const csv = buildCsv(data || []);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="leads_export.csv"'
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
