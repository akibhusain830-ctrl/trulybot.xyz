-- 006_usage_counters.sql
-- Creates usage_counters table for tracking per-month upload & conversation quotas
-- Run this in Supabase SQL editor.

create table if not exists public.usage_counters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  month text not null, -- format YYYY-MM
  monthly_uploads int not null default 0,
  monthly_conversations int not null default 0,
  monthly_words int not null default 0,
  total_stored_words int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint usage_counters_workspace_month_unique unique (workspace_id, month)
);

create index if not exists usage_counters_workspace_month_idx on public.usage_counters(workspace_id, month);

-- Trigger to keep updated_at fresh
create or replace function public.set_usage_counters_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;$$;

create trigger trg_usage_counters_updated
  before update on public.usage_counters
  for each row execute procedure public.set_usage_counters_updated_at();

-- Add word_count to documents for future accurate totals
alter table public.documents add column if not exists word_count int;
