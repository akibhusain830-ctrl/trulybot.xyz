-- Fix for missing has_used_trial column in profiles table
-- Run this in your Supabase SQL Editor

-- Add the missing has_used_trial column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_used_trial BOOLEAN DEFAULT FALSE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_has_used_trial ON public.profiles(has_used_trial);

-- Update existing users who have trial_ends_at set to mark them as having used trial
UPDATE public.profiles 
SET has_used_trial = TRUE 
WHERE trial_ends_at IS NOT NULL;

-- Set has_used_trial to FALSE for users without trials (so they can start one)
UPDATE public.profiles 
SET has_used_trial = FALSE 
WHERE trial_ends_at IS NULL AND has_used_trial IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.has_used_trial IS 'Tracks whether user has ever started a trial (one trial per user policy)';

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'has_used_trial';

-- Show current profiles with trial status
SELECT id, email, subscription_status, trial_ends_at, has_used_trial
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;