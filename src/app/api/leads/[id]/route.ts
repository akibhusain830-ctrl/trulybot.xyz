import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await req.json().catch(() => ({}));
    const { status, notes } = body as { status?: string; notes?: string };

    const allowed = ['new','incomplete','qualified','contacted','discarded'];
    if (status && !allowed.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const update: Record<string, any> = { updated_at: new Date().toISOString() };
    if (status) update.status = status;
    if (notes !== undefined) update.notes = notes;

    const { error } = await admin
      .from('leads')
      .update(update)
      .eq('id', id);

    if (error) {
      console.error('[PATCH /api/leads/:id] error', error);
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}