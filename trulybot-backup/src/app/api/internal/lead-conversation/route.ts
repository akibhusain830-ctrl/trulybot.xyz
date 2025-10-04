import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const leadId = searchParams.get('id');

    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    // Fetch the lead and its conversation
    const { data: lead, error: leadError } = await admin
      .from('leads')
      .select('id, notes, meta')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Extract conversation from meta or return mock data
    const conversation = lead.meta?.conversation || [
      { role: 'user', text: 'Hello, I need help with your service.' },
      { role: 'assistant', text: "Hi! I'd be happy to help you. What specific information are you looking for?" }
    ];

    return NextResponse.json({
      id: lead.id,
      conversation,
      notes: lead.notes || null
    });

  } catch (e: any) {
    console.error('[GET /api/internal/lead-conversation] error', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
