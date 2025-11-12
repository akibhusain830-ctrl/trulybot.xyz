-- Remove deprecated 'ultra' tier from constraints and update trial function

-- Update profiles.subscription_tier check constraint to supported tiers
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND constraint_name = 'profiles_subscription_tier_check'
  ) THEN
    EXECUTE 'ALTER TABLE public.profiles DROP CONSTRAINT profiles_subscription_tier_check';
  END IF;
END $$;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_subscription_tier_check
  CHECK (subscription_tier IN ('free','basic','pro','enterprise'));

-- Update trial function to assign enterprise tier during trial
CREATE OR REPLACE FUNCTION public.start_user_trial(
  p_user_id UUID
) RETURNS JSON AS $$
DECLARE
  v_profile RECORD;
  v_now TIMESTAMPTZ := NOW();
  v_trial_end TIMESTAMPTZ := NOW() + INTERVAL '7 days';
BEGIN
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'reason', 'profile_not_found', 'message', 'User profile not found');
  END IF;

  IF v_profile.has_used_trial = true THEN
    RETURN json_build_object('success', false, 'reason', 'trial_already_used', 'message', 'User has already used their free trial', 'profile', row_to_json(v_profile));
  END IF;

  IF v_profile.subscription_status = 'active'
     AND v_profile.subscription_ends_at IS NOT NULL
     AND v_profile.subscription_ends_at > v_now THEN
    RETURN json_build_object('success', false, 'reason', 'active_subscription', 'message', 'User already has active subscription', 'profile', row_to_json(v_profile));
  END IF;

  IF v_profile.trial_ends_at IS NOT NULL AND v_profile.trial_ends_at > v_now THEN
    RETURN json_build_object('success', false, 'reason', 'trial_already_active', 'message', 'User already has active trial', 'profile', row_to_json(v_profile));
  END IF;

  UPDATE profiles
  SET trial_ends_at = v_trial_end,
      subscription_status = 'trial',
      subscription_tier = 'enterprise',
      has_used_trial = true,
      updated_at = v_now
  WHERE id = p_user_id;

  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;

  RETURN json_build_object('success', true, 'reason', 'trial_started', 'message', 'Trial started successfully', 'profile', row_to_json(v_profile));
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error in start_user_trial for user %: %', p_user_id, SQLERRM;
  RETURN json_build_object('success', false, 'reason', 'database_error', 'message', 'Database error occurred', 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.start_user_trial(UUID) TO authenticated;