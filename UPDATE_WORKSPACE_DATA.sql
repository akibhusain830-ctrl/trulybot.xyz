-- Update the existing document to have proper workspace_id
-- Run this in Supabase SQL Editor

-- 1. Update documents table to include workspace_id
UPDATE documents 
SET workspace_id = 'abee6737-7bb9-4da4-969f-899a2792641e'
WHERE user_id = '6b47cbac-9009-42e3-9a37-b1106bf0cba0' 
AND workspace_id IS NULL;

-- 2. Update document_chunks table to include workspace_id  
UPDATE document_chunks 
SET workspace_id = 'abee6737-7bb9-4da4-969f-899a2792641e'
WHERE user_id = '6b47cbac-9009-42e3-9a37-b1106bf0cba0' 
AND workspace_id IS NULL;

-- 3. Update the chatbot welcome message to be business-specific
UPDATE profiles 
SET welcome_message = 'Hello! I can help you with our calculator tools and services. What would you like to calculate today?'
WHERE id = '6b47cbac-9009-42e3-9a37-b1106bf0cba0';

-- 4. Update the chatbot name to be business-specific
UPDATE profiles 
SET chatbot_name = 'Calculator Assistant'
WHERE id = '6b47cbac-9009-42e3-9a37-b1106bf0cba0';

-- Check results
SELECT id, filename, workspace_id, user_id, status, embedding_status 
FROM documents 
WHERE user_id = '6b47cbac-9009-42e3-9a37-b1106bf0cba0';

SELECT count(*) as chunk_count, workspace_id 
FROM document_chunks 
WHERE user_id = '6b47cbac-9009-42e3-9a37-b1106bf0cba0'
GROUP BY workspace_id;