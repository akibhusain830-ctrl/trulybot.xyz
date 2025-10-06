import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';
import { config } from './config/secrets';

// --- Supabase Admin Client ---
// We use the Service Role Key here for trusted server-to-server communication.
// This is secure because the database function we call (`match_document_chunks`)
// still enforces user-level security.
const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
);

interface QueryVectorStoreParams {
  workspaceId: string; // This will be either workspace_id or user_id depending on the schema
  embedding: number[];
  topK: number;
}

interface VectorResult {
  chunkId: string;
  documentId: string;
  title: string;
  url?: string | null;
  content: string;
  score: number;
}

// Type for rows returned by the match_document_chunks RPC
type ChunkRow = {
  chunkid: string;
  documentid: string;
  content: string;
  score: number;
  url?: string | null;
};

// Type for the minimal fields we read from documents
type DocumentRow = { id: string; filename: string };

/**
 * Queries the vector store to find the most relevant document chunks for a user's query.
 * @param params - The parameters for the vector query.
 * @returns A promise that resolves to an array of the most relevant document chunks.
 */
export async function queryVectorStore(params: QueryVectorStoreParams): Promise<VectorResult[]> {
  const { workspaceId, embedding, topK } = params;

  // 1. Call the secure database function to perform the vector similarity search.
  // This is the core of the retrieval process.
  const { data: rawChunks, error: rpcError } = await supabaseAdmin.rpc(
    'match_document_chunks',
    {
      p_user_id: workspaceId,  // Using user_id parameter as function expects
      p_query_embedding: embedding,
      p_match_threshold: 0.3, // Lower threshold for better matching
      p_match_count: topK,
    }
  );

  if (rpcError) {
    logger.error('Error calling match_document_chunks RPC:', rpcError);
    return []; // Return empty on error
  }

  const chunks = (rawChunks as ChunkRow[] | null) ?? [];

  if (chunks.length === 0) {
    return []; // No relevant chunks found
  }

  // 2. Enrich the results by fetching the original document filenames (titles).
  // This is a great UX feature as it allows us to show the source of the information.
  const documentIds = [...new Set(chunks.map((c: ChunkRow) => c.documentid))];
  const { data: documents, error: docError } = await supabaseAdmin
    .from('documents')
    .select('id, filename')
    .in('id', documentIds);

  if (docError) {
    logger.error('Error fetching document filenames:', docError);
    // We can still proceed without titles if this fails.
  }

  // Create a simple map for efficient lookup of filenames by their document ID.
  const docTitleMap = new Map<string, string>();
  if (documents) {
    for (const doc of documents as DocumentRow[]) {
      docTitleMap.set(doc.id, doc.filename);
    }
  }

  // 3. Combine the chunk data with the document titles into the final result format.
  const results: VectorResult[] = chunks.map((chunk: ChunkRow) => ({
    chunkId: chunk.chunkid,
    documentId: chunk.documentid,
    title: docTitleMap.get(chunk.documentid) || 'Untitled Document',
    url: chunk.url ?? null,
    content: chunk.content,
    score: chunk.score,
  }));

  return results;
}
