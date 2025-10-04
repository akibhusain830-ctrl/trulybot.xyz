-- ================================================================
-- ADD ORDERS TABLE FOR PAYMENT PROCESSING
-- Run this in Supabase SQL Editor after ultra-safe-setup.sql
-- ================================================================

-- Create orders table for payment processing
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    
    -- Razorpay order details
    razorpay_order_id TEXT UNIQUE NOT NULL,
    razorpay_payment_id TEXT,
    
    -- Order details
    plan_id TEXT NOT NULL,
    billing_period TEXT NOT NULL DEFAULT 'monthly',
    amount INTEGER NOT NULL, -- Amount in smallest currency unit (paise for INR, cents for USD)
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'created',
    
    -- Metadata
    notes JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT orders_status_check CHECK (status IN ('created', 'paid', 'failed', 'cancelled')),
    CONSTRAINT orders_currency_check CHECK (currency IN ('INR', 'USD')),
    CONSTRAINT orders_billing_period_check CHECK (billing_period IN ('monthly', 'yearly')),
    CONSTRAINT orders_amount_positive CHECK (amount > 0)
);

-- Orders indexes
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS orders_workspace_id_idx ON public.orders(workspace_id);
CREATE INDEX IF NOT EXISTS orders_razorpay_order_id_idx ON public.orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders(created_at);

-- Orders updated_at trigger
CREATE TRIGGER handle_updated_at_orders
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Enable RLS for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Orders RLS policies
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own orders" ON public.orders
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own orders" ON public.orders
    FOR UPDATE USING (user_id = auth.uid());

-- Grant permissions for orders table
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated, service_role;

-- Verification
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
        RAISE NOTICE '✅ Orders table created successfully!';
        RAISE NOTICE '🚀 Payment system is now ready!';
    ELSE
        RAISE WARNING '⚠️ Failed to create orders table';
    END IF;
END $$;

SELECT 'Orders table setup complete!' as status, NOW() as completed_at;