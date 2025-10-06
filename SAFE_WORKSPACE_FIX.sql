-- Safe SQL to add missing workspace_id columns and update data
-- Run this in Supabase SQL Editor

-- Step 1: Add workspace_id column to documents table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'documents' AND column_name = 'workspace_id'
    ) THEN
        ALTER TABLE documents ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added workspace_id column to documents table';
    ELSE
        RAISE NOTICE 'workspace_id column already exists in documents table';
    END IF;
END $$;

-- Step 2: Add workspace_id column to document_chunks table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'document_chunks' AND column_name = 'workspace_id'
    ) THEN
        ALTER TABLE document_chunks ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added workspace_id column to document_chunks table';
    ELSE
        RAISE NOTICE 'workspace_id column already exists in document_chunks table';
    END IF;
END $$;

-- Step 3: Get the workspace_id for the user from profiles table
-- First, let's see what workspace_id this user should have
SELECT p.id as user_id, p.workspace_id, w.name as workspace_name
FROM profiles p
LEFT JOIN workspaces w ON p.workspace_id = w.id
WHERE p.id = '6b47cbac-9009-42e3-9a37-b1106bf0cba0';

-- Step 4: Update documents with the correct workspace_id
-- (Replace 'USER_WORKSPACE_ID' with the actual workspace_id from Step 3)
-- UPDATE documents 
-- SET workspace_id = 'USER_WORKSPACE_ID_FROM_STEP_3'
-- WHERE user_id = '6b47cbac-9009-42e3-9a37-b1106bf0cba0' 
-- AND workspace_id IS NULL;

-- Step 5: Update document_chunks with the correct workspace_id  
-- UPDATE document_chunks 
-- SET workspace_id = 'USER_WORKSPACE_ID_FROM_STEP_3'
-- WHERE user_id = '6b47cbac-9009-42e3-9a37-b1106bf0cba0' 
-- AND workspace_id IS NULL;

-- Step 6: Update profile settings for better UX
UPDATE profiles 
SET welcome_message = 'Hello! I can help you with our calculator tools and services. What would you like to calculate today?',
    chatbot_name = 'Calculator Assistant'
WHERE id = '6b47cbac-9009-42e3-9a37-b1106bf0cba0';

-- Step 7: Check the results
SELECT 'Documents' as table_name, count(*) as total_count, 
       count(workspace_id) as with_workspace_id
FROM documents 
WHERE user_id = '6b47cbac-9009-42e3-9a37-b1106bf0cba0'
UNION ALL
SELECT 'Document Chunks' as table_name, count(*) as total_count,
       count(workspace_id) as with_workspace_id  
FROM document_chunks 
WHERE user_id = '6b47cbac-9009-42e3-9a37-b1106bf0cba0';