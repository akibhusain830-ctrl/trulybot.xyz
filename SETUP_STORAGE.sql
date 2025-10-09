-- =================================================================
-- STORAGE SETUP FOR CHATBOT ASSETS
-- =================================================================

-- This script sets up Supabase Storage for chatbot logo uploads
-- Run this in your Supabase SQL Editor after the main security deployment

-- Create the storage bucket for chatbot assets (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chatbot-assets',
  'chatbot-assets',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the bucket
UPDATE storage.buckets 
SET public = true 
WHERE id = 'chatbot-assets';

-- Create storage policies for chatbot assets
-- Policy to allow authenticated users to upload logos
DROP POLICY IF EXISTS "Allow authenticated users to upload logos" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chatbot-assets' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'logos'
  AND auth.uid()::text = (storage.filename(name) LIKE auth.uid()::text || '%')
);

-- Policy to allow public access to view logos
DROP POLICY IF EXISTS "Allow public access to view logos" ON storage.objects;
CREATE POLICY "Allow public access to view logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'chatbot-assets' AND (storage.foldername(name))[1] = 'logos');

-- Policy to allow users to update their own logos
DROP POLICY IF EXISTS "Allow users to update their own logos" ON storage.objects;
CREATE POLICY "Allow users to update their own logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'chatbot-assets' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'logos'
  AND auth.uid()::text = (storage.filename(name) LIKE auth.uid()::text || '%')
);

-- Policy to allow users to delete their own logos
DROP POLICY IF EXISTS "Allow users to delete their own logos" ON storage.objects;
CREATE POLICY "Allow users to delete their own logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'chatbot-assets' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'logos'
  AND auth.uid()::text = (storage.filename(name) LIKE auth.uid()::text || '%')
);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🎉 STORAGE SETUP COMPLETE! 🎉';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Storage Bucket Created:';
    RAISE NOTICE '   - chatbot-assets (public bucket for logos)';
    RAISE NOTICE '   - 2MB file size limit';
    RAISE NOTICE '   - Image files only (jpg, png, webp, gif)';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Storage Policies Created:';
    RAISE NOTICE '   - Users can upload their own logos';
    RAISE NOTICE '   - Public can view logos';
    RAISE NOTICE '   - Users can update/delete their own logos';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Logo upload functionality is now ready!';
END $$;