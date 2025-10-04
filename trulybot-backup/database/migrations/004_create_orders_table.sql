-- 004_create_orders_table.sql
-- Creates orders table for Razorpay transactions
-- Run this in Supabase SQL editor.

create table if not exists public.orders (
  id                uuid primary key default gen_random_uuid(),
  razorpay_order_id text unique not null,
  razorpay_payment_id text,
  user_id           uuid not null references public.profiles(id) on delete cascade,
  plan_id           text not null check (plan_id in ('basic','pro','ultra')),
  billing_period    text not null default 'monthly' check (billing_period in ('monthly','yearly')),
  amount            numeric(10,2) not null,
  currency          text not null check (currency in ('INR','USD')),
  status            text not null default 'created',
  notes             jsonb default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists orders_created_at_idx on public.orders(created_at);

-- RLS (optional initial; tighten later)
alter table public.orders enable row level security;

-- Allow owners to view their orders
create policy if not exists "orders_select_own" on public.orders
  for select using (auth.uid() = user_id);

-- Allow inserting via service role only (no anon insert policy)
-- (Service role bypasses RLS, so no insert policy created.)

-- Allow users to view only their own orders when updating (should normally be service role)
create policy if not exists "orders_update_own" on public.orders
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Trigger to update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;$$;

create trigger orders_set_updated_at
  before update on public.orders
  for each row execute procedure public.set_updated_at();
