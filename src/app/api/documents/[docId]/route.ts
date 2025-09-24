import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Use the Service Role Key for backend operations to bypass RLS
// This is secure because we verify user ownership before deleting.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { docId: string } }
) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  );

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'You must be logged in to delete documents.' }, { status: 401 });
    }

    const { docId } = params;
    if (!docId) {
      return NextResponse.json({ error: 'Document ID is required.' }, { status: 400 });
    }

    // --- Security Check ---
    // First, verify that the document exists and belongs to the current user.
    const { data: document, error: docError } = await supabaseAdmin
      .from('documents')
      .select('id')
      .eq('id', docId)
      .eq('user_id', user.id)
      .single();

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found or you do not have permission to delete it.' }, { status: 404 });
    }

    // --- Deletion Process ---
    // If the check passes, proceed with deletion using the admin client.
    // The `ON DELETE CASCADE` constraint we set up in the database will automatically
    // delete all associated rows in the `document_chunks` table.
    const { error: deleteError } = await supabaseAdmin
      .from('documents')
      .delete()
      .eq('id', docId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ message: 'Document deleted successfully.' }, { status: 200 });

  } catch (error: any) {
    console.error('[DELETE Document API Error]', error);
    const message = error.message || 'An unexpected internal error occurred.';
    return NextResponse.json({ error: `Server error: ${message}` }, { status: 500 });
  }
}
