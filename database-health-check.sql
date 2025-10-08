-- Comprehensive database health check
-- This will help identify what's causing the authentication errors

-- 1. Check if profiles table exists and has correct structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Check if has_used_trial column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND column_name = 'has_used_trial';

-- 3. Check sample profile data to see what might be missing
SELECT 
    id,
    email,
    subscription_status,
    trial_ends_at,
    has_used_trial,
    created_at
FROM profiles 
LIMIT 3;

-- 4. Check for any profiles with null values that might cause issues
SELECT 
    COUNT(*) as total_profiles,
    COUNT(subscription_status) as with_subscription_status,
    COUNT(trial_ends_at) as with_trial_ends,
    COUNT(has_used_trial) as with_has_used_trial
FROM profiles;

-- 5. Check if any authentication-related constraints might be failing
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints
WHERE table_name = 'profiles';