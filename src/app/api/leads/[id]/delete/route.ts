import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getAdminClient } from '@/lib/supabase/admin';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  );

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'You must be logged in to delete leads.' }, { status: 401 });
    }

    const leadId = params.id;
    if (!leadId) {
      return NextResponse.json({ error: 'Lead ID is required.' }, { status: 400 });
    }

    const supabaseAdmin = getAdminClient();

    // --- Security Check ---
    // First, get the user's workspace ID from their profile.
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('workspace_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Could not find user profile or workspace.' }, { status: 404 });
    }

    // Now, verify the lead exists and belongs to the user's workspace.
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads')
      .select('id')
      .eq('id', leadId)
      .eq('workspace_id', profile.workspace_id)
      .single();

    if (leadError || !lead) {
      return NextResponse.json({ error: 'Lead not found or you do not have permission to delete it.' }, { status: 404 });
    }

    // --- Deletion Process ---
    // If all checks pass, proceed with deletion.
    const { error: deleteError } = await supabaseAdmin
      .from('leads')
      .delete()
      .eq('id', leadId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ ok: true });

  } catch (error: any) {
    console.error('[POST /api/leads/:id/delete] error', error);
    const message = error.message || 'An unexpected internal error occurred.';
    return NextResponse.json({ error: `Server error: ${message}` }, { status: 500 });
  }
}