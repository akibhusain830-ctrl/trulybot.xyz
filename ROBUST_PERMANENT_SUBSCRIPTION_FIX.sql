-- ROBUST PERMANENT FIX FOR ALL USERS - SUBSCRIPTION SYSTEM
-- This fixes the trial system permanently for everyone

-- 1. Ensure all users have the has_used_trial column properly set
UPDATE public.profiles 
SET has_used_trial = FALSE 
WHERE has_used_trial IS NULL;

-- 2. Fix users who have trial dates but incorrect status
UPDATE public.profiles 
SET subscription_status = 'trial'
WHERE trial_ends_at IS NOT NULL 
  AND trial_ends_at > NOW() 
  AND subscription_status != 'active'
  AND subscription_status != 'trial';

-- 3. Fix users whose trials have expired but status is still 'trial'
UPDATE public.profiles 
SET subscription_status = 'none'
WHERE trial_ends_at IS NOT NULL 
  AND trial_ends_at <= NOW() 
  AND subscription_status = 'trial';

-- 4. Mark users as having used trial if they have trial_ends_at
UPDATE public.profiles 
SET has_used_trial = TRUE 
WHERE trial_ends_at IS NOT NULL 
  AND has_used_trial = FALSE;

-- 5. Give new users who haven't used trial a fresh 7-day trial
UPDATE public.profiles 
SET 
    subscription_status = 'trial',
    trial_ends_at = NOW() + INTERVAL '7 days',
    has_used_trial = TRUE,
    updated_at = NOW()
WHERE has_used_trial = FALSE 
  AND trial_ends_at IS NULL 
  AND subscription_status = 'none'
  AND created_at >= NOW() - INTERVAL '30 days'; -- Only recent users

-- 6. Create index for performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_trial_ends_at ON public.profiles(trial_ends_at);

-- 7. Verification query - show all users with their corrected status
SELECT 
    email,
    subscription_status,
    trial_ends_at,
    has_used_trial,
    CASE 
        WHEN subscription_status = 'active' THEN 'Active Subscription'
        WHEN subscription_status = 'trial' AND trial_ends_at > NOW() THEN 'Active Trial'
        WHEN subscription_status = 'trial' AND trial_ends_at <= NOW() THEN 'Expired Trial'
        WHEN subscription_status = 'none' THEN 'No Access'
        ELSE 'Unknown Status'
    END as display_status,
    CASE 
        WHEN trial_ends_at IS NOT NULL AND trial_ends_at > NOW() 
        THEN EXTRACT(days FROM (trial_ends_at - NOW()))::INTEGER
        ELSE 0
    END as days_remaining,
    created_at
FROM public.profiles 
ORDER BY created_at DESC
LIMIT 20;