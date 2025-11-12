BEGIN;

ALTER FUNCTION public.cleanup_user(uuid)
  OWNER TO postgres;
ALTER FUNCTION public.cleanup_user(uuid)
  SECURITY DEFINER;
ALTER FUNCTION public.cleanup_user(uuid)
  SET search_path = public;

ALTER FUNCTION public.handle_user_deleted()
  OWNER TO postgres;
ALTER FUNCTION public.handle_user_deleted()
  SECURITY DEFINER;
ALTER FUNCTION public.handle_user_deleted()
  SET search_path = public;

COMMIT;

