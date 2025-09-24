import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const { data, error } = await admin
      .from('leads')
      .select('conversation_json, notes')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('[GET /api/internal/lead-conversation] error', error);
      return NextResponse.json({ error: 'Fetch failed' }, { status: 500 });
    }

    return NextResponse.json({
      conversation: data?.conversation_json || null,
      notes: data?.notes || null
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}