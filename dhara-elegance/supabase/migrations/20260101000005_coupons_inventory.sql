-- ============================================================
-- 0005 — Coupons, coupon usage, inventory transactions
-- ============================================================

-- ------------------------------------------------------------
-- coupons
-- ------------------------------------------------------------

create table public.coupons (
  id                     uuid primary key default gen_random_uuid(),
  code                   text not null unique,
  description            text,

  discount_type          public.discount_type not null,
  discount_value         numeric(12,2) not null check (discount_value > 0),

  minimum_order_amount   numeric(12,2) not null default 0 check (minimum_order_amount >= 0),
  maximum_discount_amount numeric(12,2) check (maximum_discount_amount is null or maximum_discount_amount > 0),

  usage_limit            integer check (usage_limit is null or usage_limit > 0),
  per_user_limit         integer check (per_user_limit is null or per_user_limit > 0),
  used_count             integer not null default 0 check (used_count >= 0),

  starts_at              timestamptz,
  expires_at             timestamptz,
  is_active              boolean not null default true,

  created_by             uuid references auth.users(id) on delete set null,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),

  -- A percentage coupon can never exceed 100%.
  constraint coupons_percentage_within_range
    check (discount_type <> 'percentage' or discount_value <= 100),

  constraint coupons_date_range_valid
    check (starts_at is null or expires_at is null or expires_at > starts_at)
);

create index coupons_code_idx   on public.coupons (code);
create index coupons_active_idx on public.coupons (is_active, expires_at);

create trigger trg_coupons_updated_at
  before update on public.coupons
  for each row execute function public.set_updated_at();

-- Codes are always stored uppercase and trimmed, whatever the
-- admin typed.
create or replace function public.normalize_coupon_code()
returns trigger
language plpgsql
as $$
begin
  new.code = upper(trim(new.code));
  return new;
end;
$$;

create trigger trg_coupons_normalize_code
  before insert or update of code on public.coupons
  for each row execute function public.normalize_coupon_code();

-- Link orders.coupon_id now that coupons exists.
alter table public.orders
  add constraint orders_coupon_id_fkey
  foreign key (coupon_id) references public.coupons(id) on delete set null;


-- ------------------------------------------------------------
-- coupon_usages — one row per successful redemption.
--
-- The unique (coupon_id, order_id) pair makes redemption idempotent:
-- a retried webhook cannot double-count usage.
-- ------------------------------------------------------------

create table public.coupon_usages (
  id              uuid primary key default gen_random_uuid(),
  coupon_id       uuid not null references public.coupons(id) on delete cascade,
  order_id        uuid not null references public.orders(id) on delete cascade,
  user_id         uuid references auth.users(id) on delete set null,
  discount_amount numeric(12,2) not null check (discount_amount >= 0),
  created_at      timestamptz not null default now(),

  unique (coupon_id, order_id)
);

create index coupon_usages_coupon_idx on public.coupon_usages (coupon_id);
create index coupon_usages_user_idx   on public.coupon_usages (user_id);


-- ------------------------------------------------------------
-- inventory_transactions — append-only ledger.
--
-- products.stock is the fast read path; this table is the audit
-- trail explaining how it got there.
-- ------------------------------------------------------------

create table public.inventory_transactions (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  variant_id    uuid references public.product_variants(id) on delete cascade,
  order_id      uuid references public.orders(id) on delete set null,

  reason        public.inventory_reason not null,
  quantity_delta integer not null,       -- negative = stock leaving
  stock_after   integer not null check (stock_after >= 0),

  note          text,
  created_by    uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);

create index inventory_transactions_product_idx
  on public.inventory_transactions (product_id, created_at desc);
create index inventory_transactions_order_idx
  on public.inventory_transactions (order_id);
