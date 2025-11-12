CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
AS $$
DECLARE
  default_workspace_id UUID;
BEGIN
  BEGIN
    INSERT INTO public.workspaces (name, slug, created_at, updated_at)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Personal Workspace'),
      LOWER(REPLACE(COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), ' ', '-')) || '-' || substr(NEW.id::text, 1, 8),
      NOW(),
      NOW()
    )
    RETURNING id INTO default_workspace_id;

    INSERT INTO public.profiles (
      id, workspace_id, email, full_name, avatar_url, role,
      chatbot_name, welcome_message, accent_color, trial_ends_at,
      subscription_status, created_at, updated_at
    )
    VALUES (
      NEW.id, default_workspace_id, NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
      NEW.raw_user_meta_data->>'avatar_url', 'owner',
      'Assistant', 'Hello! How can I help you today?', '#2563EB',
      NOW() + INTERVAL '7 days', 'trial', NOW(), NOW()
    );

    BEGIN
      INSERT INTO public.usage_counters (
        user_id, workspace_id, month,
        monthly_uploads, monthly_conversations, monthly_words,
        total_stored_words, created_at, updated_at
      )
      VALUES (
        NEW.id, default_workspace_id, TO_CHAR(NOW(), 'YYYY-MM'),
        0, 0, 0, 0, NOW(), NOW()
      );
    EXCEPTION WHEN undefined_table OR undefined_column THEN
      INSERT INTO public.usage_counters (
        user_id, month, monthly_uploads, monthly_conversations, created_at, updated_at
      )
      VALUES (
        NEW.id, TO_CHAR(NOW(), 'YYYY-MM'), 0, 0, NOW(), NOW()
      );
    END;
  EXCEPTION WHEN OTHERS THEN
    PERFORM 1;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

