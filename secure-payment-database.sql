-- Secure Payment Processing Function
-- This function ensures atomic payment processing and prevents race conditions

CREATE OR REPLACE FUNCTION process_payment_securely(
    p_user_id UUID,
    p_plan_id TEXT,
    p_payment_id TEXT,
    p_order_id TEXT,
    p_amount DECIMAL,
    p_currency TEXT,
    p_status TEXT
) RETURNS VOID AS $$
DECLARE
    v_existing_payment_id UUID;
    v_order_status TEXT;
    v_current_tier TEXT;
BEGIN
    -- Check for existing payment (idempotency)
    SELECT id INTO v_existing_payment_id 
    FROM billing_history 
    WHERE razorpay_payment_id = p_payment_id;
    
    IF v_existing_payment_id IS NOT NULL THEN
        -- Payment already processed, return success
        RETURN;
    END IF;
    
    -- Lock the order row to prevent race conditions
    SELECT status INTO v_order_status 
    FROM orders 
    WHERE razorpay_order_id = p_order_id 
    FOR UPDATE;
    
    -- Verify order hasn't been processed
    IF v_order_status IN ('completed', 'paid') THEN
        RAISE EXCEPTION 'Order already processed: %', p_order_id;
    END IF;
    
    -- Get current subscription tier
    SELECT subscription_tier INTO v_current_tier
    FROM profiles
    WHERE id = p_user_id;
    
    -- Insert payment record
    INSERT INTO billing_history (
        user_id,
        plan_id,
        amount_paid,
        payment_status,
        razorpay_payment_id,
        razorpay_order_id,
        currency,
        created_at,
        updated_at
    ) VALUES (
        p_user_id,
        p_plan_id,
        p_amount,
        p_status,
        p_payment_id,
        p_order_id,
        p_currency,
        NOW(),
        NOW()
    );
    
    -- Update order status
    UPDATE orders 
    SET 
        status = 'completed',
        updated_at = NOW()
    WHERE razorpay_order_id = p_order_id;
    
    -- Update user subscription (only if payment successful)
    IF p_status = 'captured' THEN
        UPDATE profiles 
        SET 
            subscription_tier = p_plan_id,
            subscription_status = 'active',
            subscription_ends_at = NOW() + INTERVAL '1 month',
            updated_at = NOW()
        WHERE id = p_user_id;
        
        -- Log subscription change
        INSERT INTO subscription_changes (
            user_id,
            from_tier,
            to_tier,
            payment_id,
            changed_at
        ) VALUES (
            p_user_id,
            v_current_tier,
            p_plan_id,
            p_payment_id,
            NOW()
        );
    END IF;
    
    -- Reset usage counters for new subscription
    IF p_status = 'captured' THEN
        DELETE FROM usage_counters 
        WHERE user_id = p_user_id;
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log error and re-raise
        INSERT INTO payment_errors (
            user_id,
            payment_id,
            order_id,
            error_message,
            error_details,
            created_at
        ) VALUES (
            p_user_id,
            p_payment_id,
            p_order_id,
            SQLERRM,
            SQLSTATE,
            NOW()
        );
        
        RAISE;
END;
$$ LANGUAGE plpgsql;

-- Create subscription changes audit table
CREATE TABLE IF NOT EXISTS subscription_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    from_tier TEXT,
    to_tier TEXT NOT NULL,
    payment_id TEXT,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Indexes
    CONSTRAINT subscription_changes_tier_check CHECK (
        to_tier IN ('free', 'basic', 'pro', 'ultra')
    )
);

CREATE INDEX IF NOT EXISTS subscription_changes_user_id_idx ON subscription_changes(user_id);
CREATE INDEX IF NOT EXISTS subscription_changes_changed_at_idx ON subscription_changes(changed_at);

-- Create payment errors audit table
CREATE TABLE IF NOT EXISTS payment_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    payment_id TEXT,
    order_id TEXT,
    error_message TEXT NOT NULL,
    error_details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS payment_errors_user_id_idx ON payment_errors(user_id);
CREATE INDEX IF NOT EXISTS payment_errors_created_at_idx ON payment_errors(created_at);
CREATE INDEX IF NOT EXISTS payment_errors_payment_id_idx ON payment_errors(payment_id);

-- Row-level security policies
ALTER TABLE subscription_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription changes" ON subscription_changes
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view their own payment errors" ON payment_errors
    FOR SELECT USING (user_id = auth.uid());

-- Grants for service role
GRANT EXECUTE ON FUNCTION process_payment_securely TO service_role;
GRANT ALL ON subscription_changes TO service_role;
GRANT ALL ON payment_errors TO service_role;