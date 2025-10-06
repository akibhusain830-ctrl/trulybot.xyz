-- ===== STORAGE POLICIES FOR CHATBOT-ASSETS BUCKET =====
-- Copy and paste this entire SQL into Supabase SQL Editor

-- First, ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public, created_at, updated_at)
VALUES (
    'chatbot-assets'::text, 
    'chatbot-assets'::text, 
    true, 
    now(), 
    now()
) ON CONFLICT (id) DO UPDATE SET 
    public = true,
    updated_at = now();

-- Create storage policies using Supabase's storage policy system
-- These will appear under the chatbot-assets bucket in the dashboard

-- Policy 1: Allow authenticated users to upload (INSERT)
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chatbot-assets' AND auth.uid() IS NOT NULL);

-- Policy 2: Allow public reads (SELECT) 
CREATE POLICY "Allow public reads"  
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'chatbot-assets');

-- Policy 3: Allow authenticated users to update (UPDATE)
CREATE POLICY "Allow authenticated updates"
ON storage.objects  
FOR UPDATE
TO authenticated
USING (bucket_id = 'chatbot-assets' AND auth.uid() IS NOT NULL)
WITH CHECK (bucket_id = 'chatbot-assets' AND auth.uid() IS NOT NULL);

-- Policy 4: Allow authenticated users to delete (DELETE)
CREATE POLICY "Allow authenticated deletes"
ON storage.objects
FOR DELETE  
TO authenticated
USING (bucket_id = 'chatbot-assets' AND auth.uid() IS NOT NULL);

-- Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%chatbot%'
ORDER BY policyname;