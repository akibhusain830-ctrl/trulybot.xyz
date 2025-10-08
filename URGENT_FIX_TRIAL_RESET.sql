-- URGENT FIX: Reset and extend trial for user
-- Run this in Supabase SQL Editor to fix the trial expiration issue

-- 1. First add the missing column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_used_trial BOOLEAN DEFAULT FALSE;

-- 2. Reset your trial status and extend it for 30 days from today
UPDATE public.profiles 
SET 
    subscription_status = 'trialing',
    trial_ends_at = NOW() + INTERVAL '30 days',
    has_used_trial = TRUE,
    updated_at = NOW()
WHERE email = 'akibhusain830@gmail.com';

-- 3. Verify the fix
SELECT 
    id,
    email,
    subscription_status,
    trial_ends_at,
    has_used_trial,
    CASE 
        WHEN trial_ends_at > NOW() THEN 'Active Trial'
        WHEN trial_ends_at <= NOW() THEN 'Expired Trial'
        ELSE 'No Trial'
    END as trial_status,
    EXTRACT(days FROM (trial_ends_at - NOW())) as days_remaining
FROM public.profiles 
WHERE email = 'akibhusain830@gmail.com';

-- 4. Show all trial-related data for verification
SELECT 
    email,
    subscription_status,
    subscription_tier,
    trial_ends_at,
    subscription_ends_at,
    has_used_trial,
    created_at
FROM public.profiles 
WHERE email = 'akibhusain830@gmail.com';