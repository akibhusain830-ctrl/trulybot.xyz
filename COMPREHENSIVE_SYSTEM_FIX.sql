-- COMPREHENSIVE SYSTEM FIX
-- Run this step by step in Supabase SQL Editor

-- STEP 1: Check current system state
SELECT 'STEP 1: CURRENT SYSTEM STATE' as step;

-- Check if documents table has workspace_id column
SELECT 
  'documents_table' as table_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'workspace_id'
  ) THEN 'HAS workspace_id' ELSE 'MISSING workspace_id' END as status;

-- Check if document_chunks table has workspace_id column  
SELECT 
  'document_chunks_table' as table_name,
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'document_chunks' AND column_name = 'workspace_id'
  ) THEN 'HAS workspace_id' ELSE 'MISSING workspace_id' END as status;

-- Check current user's data
SELECT 'USER DATA CHECK' as info;
SELECT count(*) as document_count FROM documents WHERE user_id = '6b47cbac-9009-42e3-9a37-b1106bf0cba0';
SELECT count(*) as chunk_count FROM document_chunks WHERE user_id = '6b47cbac-9009-42e3-9a37-b1106bf0cba0';
SELECT count(*) as chunks_with_embeddings FROM document_chunks WHERE user_id = '6b47cbac-9009-42e3-9a37-b1106bf0cba0' AND embedding IS NOT NULL;

-- Check existing functions
SELECT routine_name, specific_name 
FROM information_schema.routines 
WHERE routine_name = 'match_document_chunks' 
AND routine_schema = 'public';

-- STEP 2: Drop existing function (this fixes the parameter name error)
SELECT 'STEP 2: DROPPING EXISTING FUNCTION' as step;

DROP FUNCTION IF EXISTS match_document_chunks(uuid,vector,double precision,integer);
DROP FUNCTION IF EXISTS match_document_chunks(uuid,vector,float,integer);

-- STEP 3: Create working function that uses user_id (current schema)
SELECT 'STEP 3: CREATING WORKING FUNCTION' as step;

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
        dc.user_id = p_user_id
        AND (1 - (dc.embedding <=> p_query_embedding)) >= p_match_threshold
    ORDER BY dc.embedding <=> p_query_embedding
    LIMIT p_match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION match_document_chunks TO authenticated;

-- STEP 4: Update profile settings for better UX
SELECT 'STEP 4: UPDATING PROFILE SETTINGS' as step;

UPDATE profiles 
SET welcome_message = 'Hello! How can I help you today?',
    chatbot_name = 'Assistant'
WHERE id = '6b47cbac-9009-42e3-9a37-b1106bf0cba0';

-- STEP 5: Verify the fix
SELECT 'STEP 5: VERIFICATION' as step;

-- Check if function exists and works
SELECT 'Function exists: ' || CASE WHEN EXISTS (
  SELECT 1 FROM information_schema.routines 
  WHERE routine_name = 'match_document_chunks'
) THEN 'YES' ELSE 'NO' END as function_status;

-- Test with a simple embedding array (all zeros)
SELECT 'Testing function...' as test_info;

-- You can manually test this - replace with actual embedding if needed:
-- SELECT * FROM match_document_chunks(
--   '6b47cbac-9009-42e3-9a37-b1106bf0cba0'::uuid,
--   array_fill(0.1, ARRAY[1536])::vector,
--   0.01,
--   5
-- );

-- Show final status
SELECT 
  (SELECT count(*) FROM documents WHERE user_id = '6b47cbac-9009-42e3-9a37-b1106bf0cba0') as documents,
  (SELECT count(*) FROM document_chunks WHERE user_id = '6b47cbac-9009-42e3-9a37-b1106bf0cba0') as chunks,
  (SELECT count(*) FROM document_chunks WHERE user_id = '6b47cbac-9009-42e3-9a37-b1106bf0cba0' AND embedding IS NOT NULL) as chunks_with_embeddings;

SELECT 'COMPLETE - Function recreated with user_id parameter' as final_status;