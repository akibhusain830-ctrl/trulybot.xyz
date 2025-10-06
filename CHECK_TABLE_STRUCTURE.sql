-- Check the actual structure of the documents and document_chunks tables
-- Run this in Supabase SQL Editor first to see the real schema

-- Check documents table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'documents' 
ORDER BY ordinal_position;

-- Check document_chunks table structure  
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'document_chunks' 
ORDER BY ordinal_position;

-- Check current documents for your user
SELECT id, filename, status, embedding_status, user_id, created_at
FROM documents 
WHERE user_id = '6b47cbac-9009-42e3-9a37-b1106bf0cba0';

-- Check current document chunks for your user
SELECT id, document_id, user_id, 
       CASE WHEN embedding IS NOT NULL THEN 'HAS_EMBEDDING' ELSE 'NO_EMBEDDING' END as embedding_status,
       LENGTH(content) as content_length
FROM document_chunks 
WHERE user_id = '6b47cbac-9009-42e3-9a37-b1106bf0cba0'
LIMIT 5;