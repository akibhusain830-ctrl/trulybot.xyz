-- Ensure orders table exists with correct schema
-- Run this in your Supabase SQL Editor

-- Drop and recreate the orders table if needed
DROP TABLE IF EXISTS public.orders CASCADE;

-- Create orders table with proper schema
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    razorpay_order_id TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL CHECK (plan_id IN ('basic', 'pro', 'ultra')),
    billing_period TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'yearly')),
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'INR' CHECK (currency IN ('INR', 'USD')),
    notes JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'paid', 'failed', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON public.orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger
DROP TRIGGER IF EXISTS handle_updated_at_orders ON public.orders;
CREATE TRIGGER handle_updated_at_orders
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;

-- Create RLS policies
CREATE POLICY "Users can view their own orders"
    ON public.orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
    ON public.orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
    ON public.orders FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

-- Test the table
INSERT INTO public.orders (
    razorpay_order_id,
    user_id,
    plan_id,
    billing_period,
    amount,
    currency,
    notes,
    status
) VALUES (
    'test_order_' || extract(epoch from now()),
    '00000000-0000-0000-0000-000000000000', -- Replace with a real user ID for testing
    'basic',
    'monthly',
    99.00,
    'INR',
    '{"test": true}',
    'created'
) ON CONFLICT (razorpay_order_id) DO NOTHING;

-- Verify table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'orders'
ORDER BY ordinal_position;

-- Check if table exists and has data
SELECT 
    COUNT(*) as total_orders,
    COUNT(DISTINCT user_id) as unique_users,
    COUNT(DISTINCT status) as unique_statuses
FROM public.orders;

SELECT 'Orders table setup complete!' as status;