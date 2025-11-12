BEGIN;

ALTER TABLE public.bot_analytics_events ALTER COLUMN bot_id DROP NOT NULL;
ALTER TABLE public.bot_analytics_events DROP CONSTRAINT IF EXISTS bot_analytics_events_bot_id_fkey;
ALTER TABLE public.bot_analytics_events
  ADD CONSTRAINT bot_analytics_events_bot_id_fkey
  FOREIGN KEY (bot_id) REFERENCES auth.users(id) ON DELETE SET NULL;

COMMIT;

