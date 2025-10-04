-- Add has_used_trial column to prevent multiple trial starts per user
-- Migration: 007_add_trial_tracking.sql

-- Add has_used_trial column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_used_trial BOOLEAN DEFAULT FALSE;

-- Create index for performance on trial tracking
CREATE INDEX IF NOT EXISTS idx_profiles_has_used_trial ON profiles(has_used_trial);

-- Update existing users who have trial_ends_at set to mark them as having used trial
UPDATE profiles 
SET has_used_trial = TRUE 
WHERE trial_ends_at IS NOT NULL;

COMMENT ON COLUMN profiles.has_used_trial IS 'Tracks whether user has ever started a trial (industry standard: one trial per user)';