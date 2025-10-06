-- Simpler fix: Just update the vector search function to work with user_id instead
-- This is a temporary fix until we can properly add workspace_id columns

-- Option 1: Keep the function as-is but make the chat API pass user_id instead of workspace_id
-- OR
-- Option 2: Create a hybrid function that tries workspace_id first, then falls back to user_id

-- Let's go with Option 2 - a hybrid approach:

CREATE OR REPLACE FUNCTION match_document_chunks(
    p_workspace_or_user_id UUID,
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
    -- First try to find chunks by workspace_id (if column exists)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'document_chunks' AND column_name = 'workspace_id'
    ) THEN
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
            (dc.workspace_id = p_workspace_or_user_id OR dc.user_id = p_workspace_or_user_id)
            AND (1 - (dc.embedding <=> p_query_embedding)) >= p_match_threshold
        ORDER BY dc.embedding <=> p_query_embedding
        LIMIT p_match_count;
    ELSE
        -- Fallback: use user_id only (current schema)
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
            dc.user_id = p_workspace_or_user_id
            AND (1 - (dc.embedding <=> p_query_embedding)) >= p_match_threshold
        ORDER BY dc.embedding <=> p_query_embedding
        LIMIT p_match_count;
    END IF;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION match_document_chunks TO authenticated;

-- Test the function with user_id to see if it finds chunks
SELECT count(*) as chunk_count 
FROM document_chunks 
WHERE user_id = '6b47cbac-9009-42e3-9a37-b1106bf0cba0';

-- Check if embeddings exist
SELECT count(*) as chunks_with_embeddings
FROM document_chunks 
WHERE user_id = '6b47cbac-9009-42e3-9a37-b1106bf0cba0'
AND embedding IS NOT NULL;