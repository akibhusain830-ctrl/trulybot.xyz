-- Additional SQL to fix logo upload - run this in Supabase SQL Editor

-- 1. Ensure storage bucket exists and is properly configured
INSERT INTO storage.buckets (id, name, public, created_at, updated_at)
VALUES (gen_random_uuid(), 'chatbot-assets', true, now(), now())
ON CONFLICT (name) DO UPDATE SET 
    public = true, 
    updated_at = now();

-- 2. Create storage policies to allow authenticated users to upload
INSERT INTO storage.policies (name, bucket_id, command, permission, definition)
SELECT 
    'Users can upload their own logos',
    (SELECT id FROM storage.buckets WHERE name = 'chatbot-assets'),
    'INSERT',
    'ALL',
    '{"bucket_id": "chatbot-assets"}'
ON CONFLICT (name, bucket_id) DO NOTHING;

INSERT INTO storage.policies (name, bucket_id, command, permission, definition)
SELECT 
    'Users can view uploaded logos',
    (SELECT id FROM storage.buckets WHERE name = 'chatbot-assets'),
    'SELECT',
    'ALL',
    '{"bucket_id": "chatbot-assets"}'
ON CONFLICT (name, bucket_id) DO NOTHING;

INSERT INTO storage.policies (name, bucket_id, command, permission, definition)
SELECT 
    'Users can update their own logos',
    (SELECT id FROM storage.buckets WHERE name = 'chatbot-assets'),
    'UPDATE',
    'ALL',
    '{"bucket_id": "chatbot-assets"}'
ON CONFLICT (name, bucket_id) DO NOTHING;

INSERT INTO storage.policies (name, bucket_id, command, permission, definition)
SELECT 
    'Users can delete their own logos',
    (SELECT id FROM storage.buckets WHERE name = 'chatbot-assets'),
    'DELETE',
    'ALL',
    '{"bucket_id": "chatbot-assets"}'
ON CONFLICT (name, bucket_id) DO NOTHING;

-- 3. Verify bucket and policies
SELECT 
    'Bucket: ' || name as item,
    CASE WHEN public THEN 'Public ✅' ELSE 'Private ❌' END as status
FROM storage.buckets 
WHERE name = 'chatbot-assets'
UNION ALL
SELECT 
    'Policies: ' || count(*)::text || ' found' as item,
    CASE WHEN count(*) >= 4 THEN 'Complete ✅' ELSE 'Missing ❌' END as status
FROM storage.policies 
WHERE bucket_id = (SELECT id FROM storage.buckets WHERE name = 'chatbot-assets');