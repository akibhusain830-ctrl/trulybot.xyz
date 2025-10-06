-- Quick Knowledge Base Fix
-- Run this in Supabase SQL Editor to fix the vector search

-- Update the function to use workspace_id instead of user_id
CREATE OR REPLACE FUNCTION match_document_chunks(
    p_workspace_id UUID,
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
        -- FIXED: Filter by workspace_id instead of user_id
        dc.workspace_id = p_workspace_id
        AND (1 - (dc.embedding <=> p_query_embedding)) >= p_match_threshold
    ORDER BY dc.embedding <=> p_query_embedding
    LIMIT p_match_count;
END;
$$;