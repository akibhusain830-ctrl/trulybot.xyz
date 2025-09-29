import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// ADD THESE MISSING IMPORTS
import { simpleTextSplitter } from '@/lib/textSplitter';
import { embed } from '@/lib/embeddings';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PUT(
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
      return NextResponse.json({ error: 'You must be logged in to update documents.' }, { status: 401 });
    }

    const { docId } = params;
    const { content } = await req.json();

    if (!docId || !content) {
      return NextResponse.json({ error: 'Document ID and content are required.' }, { status: 400 });
    }

    // 1. --- Security Check ---
    const { data: document, error: docError } = await supabaseAdmin
      .from('documents')
      .select('id')
      .eq('id', docId)
      .eq('user_id', user.id)
      .single();

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found or you do not have permission to update it.' }, { status: 404 });
    }

    // 2. --- Re-indexing Process ---
    // Mark document as PENDING
    await supabaseAdmin.from('documents').update({ 
      status: 'PENDING', 
      content, 
      updated_at: new Date().toISOString() 
    }).eq('id', docId);

    // Delete old chunks
    await supabaseAdmin.from('document_chunks').delete().eq('document_id', docId);

    // Create and insert new chunks
    const chunks = simpleTextSplitter(content);
    for (const chunk of chunks) {
      const embedding = await embed(chunk);
      const { error: chunkError } = await supabaseAdmin
        .from('document_chunks')
        .insert({ 
          document_id: docId, 
          user_id: user.id, 
          content: chunk, 
          embedding 
        });

      if (chunkError) {
        await supabaseAdmin.from('documents').update({ status: 'FAILED' }).eq('id', docId);
        throw chunkError;
      }
    }

    // 3. --- Finalize ---
    // Mark document as INDEXED
    await supabaseAdmin.from('documents').update({ status: 'INDEXED' }).eq('id', docId);

    // Fetch the fully updated document to return
    const { data: updatedDocument, error: finalDocError } = await supabase
      .from('documents')
      .select('id, content, filename, created_at, status')
      .eq('id', docId)
      .single();

    if (finalDocError) throw finalDocError;

    return NextResponse.json(updatedDocument, { status: 200 });

  } catch (error: any) {
    console.error('[PUT Document API Error]', error);
    const message = error.message || 'An unexpected internal error occurred.';
    return NextResponse.json({ error: `Server error: ${message}` }, { status: 500 });
  }
}


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
