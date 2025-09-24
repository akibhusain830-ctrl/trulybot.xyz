import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { workspaceId, status } = body as { workspaceId?: string; status?: string };

    let query = admin
      .from('leads')
      .select('created_at,email,status,origin,workspace_id,name,company,intent_keywords');

    if (workspaceId) {
      if (workspaceId === 'demo') query = query.is('workspace_id', null);
      else query = query.eq('workspace_id', workspaceId);
    }
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) {
      console.error('[POST /api/leads/export] error', error);
      return NextResponse.json({ error: 'Export failed' }, { status: 500 });
    }

    const rows = (data || []).map(r => ({
      created_at: r.created_at,
      email: r.email ?? '',
      status: r.status ?? '',
      origin: r.origin ?? '',
      workspace_id: r.workspace_id ?? '',
      name: r.name ?? '',
      company: r.company ?? '',
      intent_keywords: (r.intent_keywords || []).join('|')
    }));

    const csv = buildCsv(rows);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="leads_export.csv"'
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/**
 * Very small CSV builder (no external deps).
 * Escapes quotes, wraps fields containing comma/quote/newline in quotes.
 */
function buildCsv(rows: Array<Record<string, any>>): string {
  if (!rows.length) {
    return 'created_at,email,status,origin,workspace_id,name,company,intent_keywords\n';
  }
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(',')
  ];
  for (const row of rows) {
    const line = headers
      .map(h => formatCsvField(row[h]))
      .join(',');
    lines.push(line);
  }
  return lines.join('\n');
}

function formatCsvField(val: any): string {
  if (val === null || val === undefined) return '';
  let s = String(val);
  if (/[",\n\r]/.test(s)) {
    s = '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}