
-- Required tables and columns for dashboard functionality
-- Run this in Supabase SQL Editor:

-- 1. Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_name text NOT NULL,
    status text NOT NULL,
    current_period_end timestamptz,
    created_at timestamptz DEFAULT now()
);

-- 2. Storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES (gen_random_uuid(), 'chatbot-assets', true)
ON CONFLICT (name) DO UPDATE SET public = true;

-- 3. Missing columns
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS workspace_id uuid;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS chatbot_logo_url text;
