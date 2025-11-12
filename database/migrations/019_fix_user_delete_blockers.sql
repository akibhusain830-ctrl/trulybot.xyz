BEGIN;

ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS assigned_to UUID;
ALTER TABLE public.leads ALTER COLUMN assigned_to DROP NOT NULL;
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_assigned_to_fkey;
ALTER TABLE public.leads ADD CONSTRAINT leads_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL;

COMMIT;
