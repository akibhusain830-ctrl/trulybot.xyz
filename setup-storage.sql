-- Create Supabase Storage Bucket for Chatbot Assets
-- Run this in your Supabase SQL Editor

-- Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chatbot-assets',
  'chatbot-assets', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
-- Allow authenticated users to upload their own files
CREATE POLICY "Users can upload their own assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'chatbot-assets' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow public read access to all files in the bucket
CREATE POLICY "Public read access for chatbot assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'chatbot-assets');

-- Allow users to update their own files
CREATE POLICY "Users can update their own assets" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'chatbot-assets' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own assets" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'chatbot-assets' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );