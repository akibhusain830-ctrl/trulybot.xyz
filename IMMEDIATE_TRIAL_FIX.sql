-- IMMEDIATE TRIAL FIX - Copy and paste this into Supabase SQL Editor
-- This will reset your trial to 30 days from today

-- 1. Add the missing column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_used_trial BOOLEAN DEFAULT FALSE;

-- 2. Reset your trial status (30 days from today)
UPDATE public.profiles 
SET 
    subscription_status = 'trial',
    trial_ends_at = NOW() + INTERVAL '30 days',
    has_used_trial = TRUE,
    updated_at = NOW()
WHERE email = 'akibhusain830@gmail.com';

-- 3. Verify the fix worked
SELECT 
    email,
    subscription_status,
    trial_ends_at,
    EXTRACT(days FROM (trial_ends_at - NOW())) as days_remaining,
    has_used_trial,
    'Trial Fixed!' as status
FROM public.profiles 
WHERE email = 'akibhusain830@gmail.com';