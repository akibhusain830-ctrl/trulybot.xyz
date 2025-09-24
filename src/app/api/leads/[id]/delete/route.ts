import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await admin.from('leads').delete().eq('id', params.id);
  if (error) {
    console.error('[POST /api/leads/:id/delete] error', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}