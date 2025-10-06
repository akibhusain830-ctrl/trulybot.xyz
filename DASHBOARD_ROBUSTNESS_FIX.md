# TrulyBot Dashboard Robustness Fix - Complete SQL Script

## Run this SQL in Supabase SQL Editor to fix ALL dashboard issues:

```sql
-- 1. Create missing subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_name text NOT NULL,
    status text NOT NULL,
    current_period_end timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS for subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- 2. Create chatbot-assets storage bucket
INSERT INTO storage.buckets (id, name, public, created_at, updated_at)
VALUES (
    gen_random_uuid(), 
    'chatbot-assets', 
    true, 
    now(), 
    now()
) ON CONFLICT (name) DO UPDATE SET 
    public = true,
    updated_at = now();

-- 3. Add missing columns to existing tables
ALTER TABLE document_chunks 
ADD COLUMN IF NOT EXISTS workspace_id uuid;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS chatbot_logo_url text;

-- 4. Create storage policy for chatbot-assets bucket (if needed)
INSERT INTO storage.policies (name, bucket_id, command, permission, definition)
SELECT 
    'Users can upload their own logos',
    (SELECT id FROM storage.buckets WHERE name = 'chatbot-assets'),
    'INSERT',
    'ALL',
    '{"bucket_id": "chatbot-assets", "owner": {"id": {"_eq": "$user.id"}}}'
ON CONFLICT (name, bucket_id) DO NOTHING;

-- 5. Verify tables exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
        RAISE EXCEPTION 'subscriptions table creation failed';
    END IF;
    
    IF NOT EXISTS (SELECT FROM storage.buckets WHERE name = 'chatbot-assets') THEN
        RAISE EXCEPTION 'chatbot-assets bucket creation failed';
    END IF;
    
    RAISE NOTICE 'All database fixes applied successfully!';
END $$;
```

## Changes Made in Code:

1. **Content Security Policy Fixed** - Added Vercel Analytics and Razorpay domains
2. **Database Schema** - All missing tables and columns created
3. **Storage Bucket** - Properly configured for logo uploads

## Expected Results After Running SQL:

✅ **Subscriptions errors** - FIXED  
✅ **Logo upload errors** - FIXED  
✅ **Knowledge base upload** - FIXED  
✅ **Payment integration** - FIXED (CSP allows Razorpay)  
✅ **Vercel Analytics** - FIXED (CSP allows va.vercel-scripts.com)

## Test After SQL Execution:

1. Upload a logo in Settings - should work
2. Add knowledge base content - should work  
3. View subscription status - should work
4. Payment buttons - should load Razorpay properly
5. No more CSP errors in console

Run the SQL script above and restart your development server for all fixes to take effect.