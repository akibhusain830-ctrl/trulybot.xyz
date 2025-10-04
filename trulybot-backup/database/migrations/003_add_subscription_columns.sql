-- Migration: Add subscription columns expected by application logic
-- This brings DB schema in sync with profile-manager.ts and subscription.ts

BEGIN;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255);

-- Optional: ensure existing rows have a tier value
UPDATE profiles SET subscription_tier = 'free' WHERE subscription_tier IS NULL;

-- Indexes to accelerate common queries
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_trial_ends_at ON profiles(trial_ends_at);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_ends_at ON profiles(subscription_ends_at);

COMMIT;
