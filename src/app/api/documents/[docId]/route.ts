import { createClient } from '@supabase/supabase-js';
import { currentMonthKey } from '@/lib/constants/quotas';
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// ADD THESE MISSING IMPORTS
import { simpleTextSplitter } from '@/lib/textSplitter';
import { embed } from '@/lib/embeddings';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export const dynamic = 'force-dynamic';

export async function PUT(
  req: NextRequest,
  { params }: { params: { docId: string } }
) {
  const supabase = createSupabaseServerClient();

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

    // 1. --- Security Check & fetch existing word count ---
    const { data: document, error: docError } = await supabaseAdmin
      .from('documents')
      .select('id, word_count')
      .eq('id', docId)
      .eq('user_id', user.id)
      .single();

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found or you do not have permission to update it.' }, { status: 404 });
    }

    // Get user's workspace_id for chunk creation
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('workspace_id')
      .eq('id', user.id)
      .single();

    // 2. --- Re-indexing Process ---
    // Mark document as PENDING
    // Recompute new word count
    const newWordCount = typeof content === 'string' ? content.trim().split(/\s+/).filter(Boolean).length : 0;
    const oldWordCount = document.word_count || 0;

    await supabaseAdmin.from('documents').update({ 
      status: 'PENDING', 
      content, 
      word_count: newWordCount,
      updated_at: new Date().toISOString() 
    }).eq('id', docId);

    // Delete old chunks
    await supabaseAdmin.from('document_chunks').delete().eq('document_id', docId);

    // Create and insert new chunks
    const chunks = simpleTextSplitter(content);
    for (const chunk of chunks) {
      const embedding = await embed(chunk);
      
      const chunkInsert: any = {
        document_id: docId, 
        user_id: user.id, 
        content: chunk, 
        embedding 
      };

      // Only add workspace_id if the profile has one (backwards compatibility)
      if (profile?.workspace_id) {
        chunkInsert.workspace_id = profile.workspace_id;
      }

      const { error: chunkError } = await supabaseAdmin
        .from('document_chunks')
        .insert(chunkInsert);

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

    // Adjust usage counters total_stored_words delta (do not change monthly_uploads here)
    try {
      const month = currentMonthKey();
      // Fetch profile to derive workspace_id
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('workspace_id')
        .eq('id', user.id)
        .single();
      if (profile?.workspace_id) {
        const delta = newWordCount - oldWordCount;
        if (delta !== 0) {
          const { data: usageRow } = await supabaseAdmin
            .from('usage_counters')
            .select('id, total_stored_words')
            .eq('workspace_id', profile.workspace_id)
            .eq('month', month)
            .maybeSingle();
          if (usageRow) {
            await supabaseAdmin
              .from('usage_counters')
              .update({ total_stored_words: Math.max(0, (usageRow.total_stored_words || 0) + delta) })
              .eq('id', usageRow.id);
          } else {
            // Create a baseline row if not exists
            await supabaseAdmin
              .from('usage_counters')
              .insert({ workspace_id: profile.workspace_id, user_id: user.id, month, total_stored_words: Math.max(0, delta), monthly_uploads: 0 });
          }
        }
      }
    } catch (uErr) {
      console.error('[PUT Document] usage counter adjust failed', uErr);
    }

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
  const supabase = createSupabaseServerClient();

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'You must be logged in to delete documents.' }, { status: 401 });
    }

    const { docId } = params;
    if (!docId) {
      return NextResponse.json({ error: 'Document ID is required.' }, { status: 400 });
    }

    // --- Security Check & fetch word count ---
    const { data: document, error: docError } = await supabaseAdmin
      .from('documents')
      .select('id, word_count')
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

    // Adjust usage counters (decrement total stored words AND monthly_uploads for real-time updates)
    try {
      const month = currentMonthKey();
      const removedWords = document.word_count || 0;
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('workspace_id')
        .eq('id', user.id)
        .single();
      if (profile?.workspace_id) {
        const { data: usageRow } = await supabaseAdmin
          .from('usage_counters')
          .select('id, total_stored_words, monthly_uploads')
          .eq('workspace_id', profile.workspace_id)
          .eq('month', month)
          .maybeSingle();
        if (usageRow) {
          const updates: any = {};
          // Decrement stored words if there were any
          if (removedWords > 0) {
            updates.total_stored_words = Math.max(0, (usageRow.total_stored_words || 0) - removedWords);
          }
          // Decrement monthly uploads for real-time counter
          updates.monthly_uploads = Math.max(0, (usageRow.monthly_uploads || 0) - 1);
          
          await supabaseAdmin
            .from('usage_counters')
            .update(updates)
            .eq('id', usageRow.id);
        }
      }
    } catch (uErr) {
      console.error('[DELETE Document] usage counter adjust failed', uErr);
    }

    return NextResponse.json({ message: 'Document deleted successfully.' }, { status: 200 });

  } catch (error: any) {
    console.error('[DELETE Document API Error]', error);
    const message = error.message || 'An unexpected internal error occurred.';
    return NextResponse.json({ error: `Server error: ${message}` }, { status: 500 });
  }
}
