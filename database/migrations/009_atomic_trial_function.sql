-- Atomic trial activation function to prevent race conditions
-- This function ensures only one trial can be started per user using database-level locking

CREATE OR REPLACE FUNCTION public.start_user_trial(
  p_user_id UUID
) RETURNS JSON AS $$
DECLARE
  v_profile RECORD;
  v_now TIMESTAMPTZ := NOW();
  v_trial_end TIMESTAMPTZ := NOW() + INTERVAL '7 days';
  v_result JSON;
BEGIN
  -- Lock the specific profile row to prevent concurrent modifications
  -- This ensures atomic read-check-update operation
  SELECT * INTO v_profile 
  FROM profiles 
  WHERE id = p_user_id 
  FOR UPDATE;
  
  -- Check if profile exists
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'reason', 'profile_not_found',
      'message', 'User profile not found'
    );
  END IF;
  
  -- Check if user has already used their trial (industry standard: one trial per user)
  IF v_profile.has_used_trial = true THEN
    RETURN json_build_object(
      'success', false,
      'reason', 'trial_already_used',
      'message', 'User has already used their free trial',
      'profile', row_to_json(v_profile)
    );
  END IF;
  
  -- Check if user has active subscription
  IF v_profile.subscription_status = 'active' 
     AND v_profile.subscription_ends_at IS NOT NULL 
     AND v_profile.subscription_ends_at > v_now THEN
    RETURN json_build_object(
      'success', false,
      'reason', 'active_subscription',
      'message', 'User already has active subscription',
      'profile', row_to_json(v_profile)
    );
  END IF;
  
  -- Check if user has active trial
  IF v_profile.trial_ends_at IS NOT NULL 
     AND v_profile.trial_ends_at > v_now THEN
    RETURN json_build_object(
      'success', false,
      'reason', 'trial_already_active',
      'message', 'User already has active trial',
      'profile', row_to_json(v_profile)
    );
  END IF;
  
  -- All checks passed, atomically start the trial
  UPDATE profiles 
  SET 
    trial_ends_at = v_trial_end,
    subscription_status = 'trial',
    subscription_tier = 'ultra',
    has_used_trial = true, -- Permanently mark trial as used
    updated_at = v_now
  WHERE id = p_user_id;
  
  -- Fetch and return updated profile
  SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;
  
  RETURN json_build_object(
    'success', true,
    'reason', 'trial_started',
    'message', 'Trial started successfully',
    'profile', row_to_json(v_profile)
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log error and return failure
    RAISE LOG 'Error in start_user_trial for user %: %', p_user_id, SQLERRM;
    RETURN json_build_object(
      'success', false,
      'reason', 'database_error',
      'message', 'Database error occurred',
      'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.start_user_trial(UUID) TO authenticated;

-- Add helpful comment
COMMENT ON FUNCTION public.start_user_trial IS 'Atomically starts a trial for a user, preventing race conditions through row locking';