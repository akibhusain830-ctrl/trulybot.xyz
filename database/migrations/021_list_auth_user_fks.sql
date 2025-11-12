BEGIN;

CREATE OR REPLACE FUNCTION public.list_auth_user_fks()
RETURNS TABLE(table_name text, constraint_name text, delete_rule text)
LANGUAGE sql
AS $$
SELECT
  c.relname::text AS table_name,
  con.conname::text AS constraint_name,
  CASE con.confdeltype
    WHEN 'a' THEN 'NO ACTION'
    WHEN 'c' THEN 'CASCADE'
    WHEN 'n' THEN 'SET NULL'
    WHEN 'd' THEN 'SET DEFAULT'
    WHEN 'r' THEN 'RESTRICT'
    ELSE con.confdeltype::text
  END AS delete_rule
FROM pg_constraint con
JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_class cr ON cr.oid = con.confrelid
JOIN pg_namespace np ON np.oid = c.relnamespace
JOIN pg_namespace nr ON nr.oid = cr.relnamespace
WHERE con.contype = 'f'
  AND cr.relname = 'users'
  AND nr.nspname = 'auth';
$$;

COMMIT;

