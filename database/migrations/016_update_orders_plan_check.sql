-- 016_update_orders_plan_check.sql
-- Align orders.plan_id allowed values with pricing tiers

-- Drop existing check constraint if present
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_plan_id_check;

-- Add updated check constraint to include enterprise
ALTER TABLE public.orders
  ADD CONSTRAINT orders_plan_id_check
  CHECK (plan_id IN ('basic','pro','enterprise'));