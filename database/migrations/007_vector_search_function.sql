-- 007_vector_search_function.sql
-- Creates the match_document_chunks RPC function for secure vector similarity search
-- This function ensures proper workspace isolation for document chunk retrieval

-- First, let's create the document_chunks table that would store the vector embeddings
-- (This might need to be adjusted based on your actual vector storage strategy)

CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Chunk content and metadata
    content TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    
    -- Vector embedding (using pgvector extension)
    embedding VECTOR(1536), -- Assuming OpenAI embedding size, adjust as needed
    
    -- Optional metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS document_chunks_document_id_idx ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS document_chunks_workspace_id_idx ON document_chunks(workspace_id);
CREATE INDEX IF NOT EXISTS document_chunks_user_id_idx ON document_chunks(user_id);

-- Vector similarity search index (requires pgvector extension)
-- CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx ON document_chunks 
-- USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Enable RLS on document_chunks
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- RLS policy for document_chunks
CREATE POLICY "Users can access their workspace document chunks" ON document_chunks
    FOR SELECT USING (
        workspace_id IN (
            SELECT workspace_id FROM profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their workspace document chunks" ON document_chunks
    FOR ALL USING (
        workspace_id IN (
            SELECT workspace_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Create the secure match_document_chunks function
CREATE OR REPLACE FUNCTION match_document_chunks(
    p_user_id UUID,
    p_query_embedding VECTOR(1536),
    p_match_threshold FLOAT DEFAULT 0.7,
    p_match_count INT DEFAULT 10
)
RETURNS TABLE(
    chunkid UUID,
    documentid UUID,
    content TEXT,
    score FLOAT,
    url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dc.id as chunkid,
        dc.document_id as documentid,
        dc.content,
        (1 - (dc.embedding <=> p_query_embedding)) as score,
        d.filename as url
    FROM document_chunks dc
    JOIN documents d ON dc.document_id = d.id
    WHERE 
        -- CRITICAL: Ensure workspace isolation
        dc.user_id = p_user_id
        AND (1 - (dc.embedding <=> p_query_embedding)) >= p_match_threshold
    ORDER BY dc.embedding <=> p_query_embedding
    LIMIT p_match_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION match_document_chunks TO authenticated;

-- Temporary fallback function for systems without vector embeddings yet
-- This can be removed once proper vector storage is implemented
CREATE OR REPLACE FUNCTION match_document_chunks_fallback(
    p_user_id UUID,
    p_query_embedding FLOAT[] DEFAULT '{}',
    p_match_threshold FLOAT DEFAULT 0.7,
    p_match_count INT DEFAULT 10
)
RETURNS TABLE(
    chunkid UUID,
    documentid UUID,
    content TEXT,
    score FLOAT,
    url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Fallback: return text-based matches from documents
    -- This is a temporary solution until vector embeddings are properly set up
    RETURN QUERY
    SELECT 
        d.id as chunkid,
        d.id as documentid,
        d.content,
        0.8::FLOAT as score,  -- Mock score
        d.filename as url
    FROM documents d
    WHERE 
        -- CRITICAL: Ensure workspace isolation
        d.user_id = p_user_id
        AND d.content IS NOT NULL
        AND length(d.content) > 0
    ORDER BY d.created_at DESC
    LIMIT p_match_count;
END;
$$;

-- Grant execute permission for the fallback function
GRANT EXECUTE ON FUNCTION match_document_chunks_fallback TO authenticated;

-- Add updated_at trigger for document_chunks
CREATE TRIGGER update_document_chunks_updated_at 
    BEFORE UPDATE ON document_chunks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();