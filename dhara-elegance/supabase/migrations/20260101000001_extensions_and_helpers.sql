-- ============================================================
-- 0001 — Extensions, shared enums, and helper functions
-- ============================================================

create extension if not exists "pgcrypto";      -- gen_random_uuid()
create extension if not exists "pg_trgm";       -- fuzzy product search
create extension if not exists "citext";        -- case-insensitive text


-- ------------------------------------------------------------
-- Shared enum types
-- ------------------------------------------------------------

create type public.gender_target   as enum ('men', 'women', 'unisex');

create type public.admin_role      as enum ('staff', 'admin', 'super_admin');

create type public.order_status    as enum (
  'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
);

create type public.payment_status  as enum (
  'pending', 'authorized', 'paid', 'failed', 'refunded', 'partially_refunded'
);

create type public.payment_method  as enum ('razorpay', 'cod');

create type public.discount_type   as enum ('percentage', 'fixed');

create type public.return_kind     as enum ('return', 'exchange');

create type public.return_status   as enum (
  'requested', 'approved', 'rejected', 'pickup_scheduled',
  'received', 'exchange_processing', 'completed'
);

create type public.inventory_reason as enum (
  'manual_adjustment', 'order_reserved', 'order_released',
  'order_fulfilled', 'return_restock', 'initial_stock'
);

create type public.review_status   as enum ('pending', 'approved', 'hidden');


-- ------------------------------------------------------------
-- updated_at trigger
-- ------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
