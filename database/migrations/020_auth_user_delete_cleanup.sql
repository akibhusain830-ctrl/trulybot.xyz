BEGIN;

CREATE OR REPLACE FUNCTION public.cleanup_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.leads SET assigned_to = NULL WHERE assigned_to = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_user_deleted()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM public.cleanup_user(OLD.id);
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
AFTER DELETE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_user_deleted();

COMMIT;

