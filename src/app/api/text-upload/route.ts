import { embed } from '@/lib/embedding';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { simpleTextSplitter } from '@/lib/textSplitter';
import { NextRequest, NextResponse } from 'next/server';

// Add this admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// --- Environment Variable Check --- 
// A fast check to ensure all required server-side variables are present.
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('🔴 Missing Supabase environment variables');
  // We don't throw an error here to allow the build process to complete,
  // but the endpoint will fail if these are not set at runtime.
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  );

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'You must be logged in to upload.' }, { status: 401 });
    }

    const { text, filename } = await req.json();
    if (!text || !filename || !filename.trim()) {
      return NextResponse.json({ error: 'File name and text content are required.' }, { status: 400 });
    }

    // Convert user.id to string to match your database schema
    const userId = user.id; // Remove .toString() since database expects UUID

    // 1. Create the main document record to get an ID and set status to PENDING
    const { data: docData, error: docError } = await supabaseAdmin
      .from('documents')
      .insert({
        user_id: userId, // Now this is UUID to UUID
        filename,
        content: text,
        status: 'PENDING',
      })
      .select('id')
      .single();

    if (docError) {
      console.error('Document insert error:', docError);
      throw docError;
    }
    
    const documentId = docData.id;

    // 2. Split the text into chunks
    const chunks = simpleTextSplitter(text);

    // 3. Embed and store each chunk
    for (const chunk of chunks) {
      const embedding = await embed(chunk);

      const { error: chunkError } = await supabaseAdmin
        .from('document_chunks')
        .insert({
          document_id: documentId,
          user_id: userId, // Now this is UUID to UUID
          content: chunk,
          embedding,
        });

      if (chunkError) {
        console.error('Chunk insert error:', chunkError);
        // If any chunk fails, mark the document as FAILED and stop
        await supabaseAdmin
          .from('documents')
          .update({ status: 'FAILED' })
          .eq('id', documentId);
        throw chunkError;
      }
    }

    // 4. If all chunks are successful, mark the document as INDEXED
    await supabaseAdmin
      .from('documents')
      .update({ status: 'INDEXED' })
      .eq('id', documentId);

    // Fetch the final document to return to the UI
    const { data: finalDocument } = await supabaseAdmin
      .from('documents')
      .select('id, content, filename, created_at, status')
      .eq('id', documentId)
      .single();

    return NextResponse.json({
      message: 'Text uploaded and indexed successfully!',
      document: finalDocument,
    });

  } catch (error: any) {
    // --- Improved Error Logging --- 
    // Log the full error for server-side debugging
    console.error('[text-upload API Error]', {
        message: error.message,
        details: error.details, // Supabase errors often have this
        code: error.code,       // and this
        stack: error.stack,
    });
    
    // Return a more informative error message to the client
    const message = error.message || 'An unexpected internal error occurred.';
    return NextResponse.json({ error: `Server error: ${message}` }, { status: 500 });
  }
}
