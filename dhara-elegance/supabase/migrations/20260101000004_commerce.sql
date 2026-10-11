-- ============================================================
-- 0004 — Commerce: cart, wishlist, orders, order_items, payments
-- ============================================================

-- ------------------------------------------------------------
-- cart_items — server-side cart for signed-in users.
-- Guests keep a local cart in the browser; on login it is merged
-- into these rows.
-- ------------------------------------------------------------

create table public.cart_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  variant_id  uuid references public.product_variants(id) on delete cascade,
  quantity    integer not null default 1 check (quantity > 0 and quantity <= 99),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- One row per (user, product, variant). NULL variant_id needs a
-- second partial index because NULLs are never equal in SQL.
create unique index cart_items_unique_with_variant
  on public.cart_items (user_id, product_id, variant_id)
  where variant_id is not null;

create unique index cart_items_unique_without_variant
  on public.cart_items (user_id, product_id)
  where variant_id is null;

create index cart_items_user_idx on public.cart_items (user_id);

create trigger trg_cart_items_updated_at
  before update on public.cart_items
  for each row execute function public.set_updated_at();


-- ------------------------------------------------------------
-- wishlist_items
-- ------------------------------------------------------------

create table public.wishlist_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_id, product_id)
);

create index wishlist_items_user_idx on public.wishlist_items (user_id);


-- ------------------------------------------------------------
-- orders
--
-- order_number is a short human-readable reference (DE-2026-000001)
-- shown to customers; id remains the UUID primary key.
--
-- Shipping address is COPIED in at order time, not referenced, so
-- that editing/deleting an address never rewrites order history.
-- ------------------------------------------------------------

create sequence if not exists public.order_number_seq start 1;

create table public.orders (
  id             uuid primary key default gen_random_uuid(),
  order_number   text not null unique
                   default 'DE-' || to_char(now(), 'YYYY') || '-' ||
                           lpad(nextval('public.order_number_seq')::text, 6, '0'),

  user_id        uuid references auth.users(id) on delete set null,

  -- Contact snapshot
  customer_name  text not null,
  customer_email citext not null,
  customer_phone text not null,

  -- Shipping snapshot
  address_line1  text not null,
  address_line2  text,
  city           text not null,
  state          text not null,
  pincode        text not null,
  country        text not null default 'India',

  -- Money — all server-computed, never client-supplied
  subtotal       numeric(12,2) not null check (subtotal >= 0),
  discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0),
  shipping_amount numeric(12,2) not null default 0 check (shipping_amount >= 0),
  total          numeric(12,2) not null check (total >= 0),
  currency       text not null default 'INR',

  coupon_id      uuid,
  coupon_code    text,

  payment_method public.payment_method not null,
  payment_status public.payment_status not null default 'pending',
  status         public.order_status   not null default 'pending',

  -- Fulfilment
  courier_name   text,
  tracking_number text,
  tracking_url   text,
  shipping_notes text,

  customer_notes text,
  admin_notes    text,

  placed_at      timestamptz not null default now(),
  confirmed_at   timestamptz,
  shipped_at     timestamptz,
  delivered_at   timestamptz,
  cancelled_at   timestamptz,

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint orders_total_is_consistent
    check (total = subtotal - discount_amount + shipping_amount)
);

create index orders_user_idx        on public.orders (user_id, created_at desc);
create index orders_status_idx      on public.orders (status, created_at desc);
create index orders_payment_idx     on public.orders (payment_status, created_at desc);
create index orders_created_idx     on public.orders (created_at desc);
create index orders_email_idx       on public.orders (customer_email);
create index orders_number_idx      on public.orders (order_number);

create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();


-- ------------------------------------------------------------
-- order_items
--
-- Product name/image/price are SNAPSHOTTED. product_id is ON DELETE
-- SET NULL so deleting a product never destroys order history — the
-- order still renders correctly from the snapshot columns.
-- ------------------------------------------------------------

create table public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,

  product_id    uuid references public.products(id) on delete set null,
  variant_id    uuid references public.product_variants(id) on delete set null,

  -- Immutable snapshot of what was actually bought
  product_name  text not null,
  product_slug  text,
  product_image text,
  variant_label text,
  sku           text,

  unit_price    numeric(12,2) not null check (unit_price >= 0),
  quantity      integer not null check (quantity > 0),
  line_total    numeric(12,2) not null check (line_total >= 0),

  created_at    timestamptz not null default now(),

  constraint order_items_line_total_is_consistent
    check (line_total = unit_price * quantity)
);

create index order_items_order_idx   on public.order_items (order_id);
create index order_items_product_idx on public.order_items (product_id);


-- ------------------------------------------------------------
-- payments — one row per payment attempt against an order
-- ------------------------------------------------------------

create table public.payments (
  id                   uuid primary key default gen_random_uuid(),
  order_id             uuid not null references public.orders(id) on delete cascade,

  method               public.payment_method not null,
  status               public.payment_status not null default 'pending',
  amount               numeric(12,2) not null check (amount >= 0),
  currency             text not null default 'INR',

  razorpay_order_id    text,
  razorpay_payment_id  text unique,
  razorpay_signature   text,

  error_code           text,
  error_description    text,

  authorized_at        timestamptz,
  paid_at              timestamptz,
  failed_at            timestamptz,
  refunded_amount      numeric(12,2) not null default 0 check (refunded_amount >= 0),

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index payments_order_idx    on public.payments (order_id);
create index payments_rzp_order_idx on public.payments (razorpay_order_id);

create trigger trg_payments_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();


-- ------------------------------------------------------------
-- order_status_history — append-only audit of state changes
-- ------------------------------------------------------------

create table public.order_status_history (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  from_status public.order_status,
  to_status   public.order_status not null,
  changed_by  uuid references auth.users(id) on delete set null,
  note        text,
  created_at  timestamptz not null default now()
);

create index order_status_history_order_idx
  on public.order_status_history (order_id, created_at desc);


-- ------------------------------------------------------------
-- recently_viewed
-- ------------------------------------------------------------

create table public.recently_viewed (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  viewed_at   timestamptz not null default now(),
  unique (user_id, product_id)
);

create index recently_viewed_user_idx
  on public.recently_viewed (user_id, viewed_at desc);
