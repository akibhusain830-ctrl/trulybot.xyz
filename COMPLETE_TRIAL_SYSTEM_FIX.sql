-- COMPLETE TRIAL SYSTEM FIX
-- This fixes the trial system for ALL users and ensures consistent behavior

-- Step 1: Add trial columns if they don't exist (for safety)
DO $$ 
BEGIN
    -- Add trial_ends_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'trial_ends_at') THEN
        ALTER TABLE profiles ADD COLUMN trial_ends_at TIMESTAMPTZ;
    END IF;
    
    -- Add has_used_trial column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'has_used_trial') THEN
        ALTER TABLE profiles ADD COLUMN has_used_trial BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Step 2: Fix data inconsistencies
-- Reset trial status for users who should have active trials
UPDATE profiles 
SET 
    subscription_status = 'trial',
    trial_ends_at = NOW() + INTERVAL '7 days',
    has_used_trial = FALSE,
    updated_at = NOW()
WHERE 
    -- Users who have never had a trial or subscription
    (subscription_status IS NULL OR subscription_status = '')
    AND (has_used_trial IS NULL OR has_used_trial = FALSE)
    AND (trial_ends_at IS NULL OR trial_ends_at < NOW())
    AND (stripe_customer_id IS NULL OR stripe_customer_id = '');

-- Step 3: Fix expired trials that should still be active
UPDATE profiles 
SET 
    trial_ends_at = NOW() + INTERVAL '7 days',
    subscription_status = 'trial',
    updated_at = NOW()
WHERE 
    subscription_status = 'trial'
    AND has_used_trial = FALSE
    AND (trial_ends_at IS NULL OR trial_ends_at < NOW())
    AND (stripe_customer_id IS NULL OR stripe_customer_id = '');

-- Step 4: Fix users with paid subscriptions but incorrect trial flags
UPDATE profiles 
SET 
    has_used_trial = TRUE,
    updated_at = NOW()
WHERE 
    subscription_status IN ('active', 'premium', 'pro')
    AND stripe_customer_id IS NOT NULL
    AND stripe_customer_id != ''
    AND (has_used_trial IS NULL OR has_used_trial = FALSE);

-- Step 5: Mark truly expired trials as used
UPDATE profiles 
SET 
    has_used_trial = TRUE,
    subscription_status = 'expired',
    updated_at = NOW()
WHERE 
    subscription_status = 'trial'
    AND trial_ends_at IS NOT NULL 
    AND trial_ends_at < NOW() - INTERVAL '1 day'  -- Grace period
    AND (stripe_customer_id IS NULL OR stripe_customer_id = '');

-- Step 6: Create or replace function to calculate trial status
CREATE OR REPLACE FUNCTION get_user_subscription_status(user_profile profiles)
RETURNS TABLE (
    status TEXT,
    has_access BOOLEAN,
    days_left INTEGER,
    tier TEXT
) AS $$
BEGIN
    -- If user has active paid subscription
    IF user_profile.stripe_customer_id IS NOT NULL 
       AND user_profile.stripe_customer_id != '' 
       AND user_profile.subscription_status IN ('active', 'premium', 'pro') THEN
        RETURN QUERY SELECT 
            user_profile.subscription_status::TEXT,
            TRUE,
            NULL::INTEGER,
            CASE 
                WHEN user_profile.subscription_status = 'premium' THEN 'premium'
                WHEN user_profile.subscription_status = 'pro' THEN 'pro'
                ELSE 'basic'
            END;
        RETURN;
    END IF;
    
    -- Check trial status
    IF user_profile.subscription_status = 'trial' 
       AND user_profile.trial_ends_at IS NOT NULL 
       AND user_profile.trial_ends_at > NOW() THEN
        -- Active trial
        RETURN QUERY SELECT 
            'trial'::TEXT,
            TRUE,
            EXTRACT(DAY FROM (user_profile.trial_ends_at - NOW()))::INTEGER,
            'ultra'::TEXT;
        RETURN;
    END IF;
    
    -- Check if user can start a new trial
    IF (user_profile.has_used_trial IS NULL OR user_profile.has_used_trial = FALSE)
       AND (user_profile.stripe_customer_id IS NULL OR user_profile.stripe_customer_id = '') THEN
        -- Eligible for trial
        RETURN QUERY SELECT 
            'eligible'::TEXT,
            FALSE,
            7::INTEGER,
            'free'::TEXT;
        RETURN;
    END IF;
    
    -- No access
    RETURN QUERY SELECT 
        'expired'::TEXT,
        FALSE,
        0::INTEGER,
        'free'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_trial 
ON profiles (subscription_status, trial_ends_at, has_used_trial);

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer 
ON profiles (stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Step 8: Create view for easy subscription checking
CREATE OR REPLACE VIEW user_subscription_view AS
SELECT 
    p.id,
    p.email,
    p.subscription_status,
    p.trial_ends_at,
    p.has_used_trial,
    p.stripe_customer_id,
    s.status,
    s.has_access,
    s.days_left,
    s.tier
FROM profiles p
CROSS JOIN LATERAL get_user_subscription_status(p) s;

-- Step 9: Show summary of fixes applied
DO $$
DECLARE
    trial_users INTEGER;
    paid_users INTEGER;
    eligible_users INTEGER;
    expired_users INTEGER;
BEGIN
    SELECT COUNT(*) INTO trial_users FROM profiles WHERE subscription_status = 'trial' AND trial_ends_at > NOW();
    SELECT COUNT(*) INTO paid_users FROM profiles WHERE subscription_status IN ('active', 'premium', 'pro');
    SELECT COUNT(*) INTO eligible_users FROM profiles WHERE (has_used_trial IS NULL OR has_used_trial = FALSE) AND (stripe_customer_id IS NULL OR stripe_customer_id = '');
    SELECT COUNT(*) INTO expired_users FROM profiles WHERE subscription_status = 'expired' OR (has_used_trial = TRUE AND stripe_customer_id IS NULL);
    
    RAISE NOTICE 'TRIAL SYSTEM FIX COMPLETE:';
    RAISE NOTICE '- Active trial users: %', trial_users;
    RAISE NOTICE '- Paid subscribers: %', paid_users;
    RAISE NOTICE '- Trial eligible users: %', eligible_users;
    RAISE NOTICE '- Expired/No access users: %', expired_users;
END $$;

-- Step 10: Grant necessary permissions
GRANT SELECT ON user_subscription_view TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_subscription_status(profiles) TO anon, authenticated;

-- Success message
SELECT 'TRIAL SYSTEM COMPLETELY FIXED - ALL USERS SHOULD NOW HAVE CORRECT ACCESS' as result;