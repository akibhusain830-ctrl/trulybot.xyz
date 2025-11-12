-- Update orders.plan_id check constraint to remove 'ultra' and add 'enterprise'
-- Safe to run multiple times due to IF EXISTS guards

begin;

-- Drop existing constraint if present
alter table public.orders drop constraint if exists orders_plan_id_check;

-- Add updated check constraint allowing only supported plans
alter table public.orders add constraint orders_plan_id_check
  check (plan_id in ('basic','pro','enterprise'));

commit;