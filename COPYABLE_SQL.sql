-- ===== TRULYBOT DASHBOARD FIX - COPY & PASTE THIS ENTIRE SQL =====
-- Go to Supabase → SQL Editor → New Query → Paste this entire file

-- 1. Create subscriptions table (fixes "table 'subscriptions' not found")
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
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- 2. Create storage bucket (fixes "Bucket not found" logo upload error)
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
ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS workspace_id uuid;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS chatbot_logo_url text;

-- 4. Create orders table (if needed for payments)
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    amount integer NOT NULL,
    currency text DEFAULT 'INR',
    status text DEFAULT 'pending',
    razorpay_order_id text,
    razorpay_payment_id text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON public.orders
    FOR ALL USING (auth.uid() = user_id);

-- 5. Verify everything was created
SELECT 'subscriptions table' as item, 
       CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subscriptions') 
            THEN '✅ Created' ELSE '❌ Failed' END as status
UNION ALL
SELECT 'orders table' as item,
       CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders') 
            THEN '✅ Created' ELSE '❌ Failed' END as status
UNION ALL
SELECT 'chatbot-assets bucket' as item,
       CASE WHEN EXISTS (SELECT FROM storage.buckets WHERE name = 'chatbot-assets')
            THEN '✅ Created' ELSE '❌ Failed' END as status
UNION ALL
SELECT 'document_chunks.workspace_id column' as item,
       CASE WHEN EXISTS (
           SELECT FROM information_schema.columns 
           WHERE table_name = 'document_chunks' AND column_name = 'workspace_id'
       ) THEN '✅ Created' ELSE '❌ Failed' END as status
UNION ALL
SELECT 'profiles.chatbot_logo_url column' as item,
       CASE WHEN EXISTS (
           SELECT FROM information_schema.columns 
           WHERE table_name = 'profiles' AND column_name = 'chatbot_logo_url'
       ) THEN '✅ Created' ELSE '❌ Failed' END as status;