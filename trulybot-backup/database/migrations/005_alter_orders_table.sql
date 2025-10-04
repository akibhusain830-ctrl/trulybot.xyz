-- 005_alter_orders_table.sql
-- Align existing public.orders schema with application expectations
-- Apply only AFTER confirming original orders table exists.

-- Add missing columns if they do not exist
alter table public.orders add column if not exists billing_period text not null default 'monthly' check (billing_period in ('monthly','yearly'));
alter table public.orders add column if not exists razorpay_payment_id text;
alter table public.orders add column if not exists updated_at timestamptz not null default now();

-- Ensure amount has two decimal precision (will not modify existing numeric if already compatible)
-- (Skip altering type if already numeric)

-- Add constraints to normalize plan_id & currency if feasible (soft checks)
-- Optional: you can uncomment to enforce
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'orders_currency_check'
  ) then
    alter table public.orders add constraint orders_currency_check check (currency in ('INR','USD'));
  end if;
  if not exists (
    select 1 from pg_constraint where conname = 'orders_plan_id_check'
  ) then
    alter table public.orders add constraint orders_plan_id_check check (plan_id in ('basic','pro','ultra'));
  end if;
end $$;

-- Indexes for performance
create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_at_idx on public.orders(created_at);

-- RLS enable (if not already)
alter table public.orders enable row level security;

-- Policy for reading own orders (if not already present)
create policy if not exists orders_select_own on public.orders for select using (auth.uid() = user_id);

-- Trigger to update updated_at on modifications
create or replace function public.set_orders_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;$$;

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute procedure public.set_orders_updated_at();
