-- ============================================================
-- 0006 — Returns / exchanges, reviews
-- ============================================================

-- ------------------------------------------------------------
-- return_requests
--
-- Business rule: NO CASH REFUNDS. A request resolves to either an
-- exchange or store credit — never money back. That is enforced
-- here by the absence of any refund_amount column, and by the
-- resolution check constraint below.
-- ------------------------------------------------------------

create table public.return_requests (
  id              uuid primary key default gen_random_uuid(),
  order_id        uuid not null references public.orders(id) on delete cascade,
  order_item_id   uuid not null references public.order_items(id) on delete cascade,
  user_id         uuid references auth.users(id) on delete set null,

  kind            public.return_kind not null,
  status          public.return_status not null default 'requested',

  reason          text not null,
  customer_notes  text,
  image_urls      text[] not null default '{}',

  quantity        integer not null default 1 check (quantity > 0),

  -- For exchanges: what the customer wants instead.
  replacement_product_id uuid references public.products(id) on delete set null,
  replacement_variant_id uuid references public.product_variants(id) on delete set null,

  -- Resolution: exchange or store credit only.
  store_credit_amount numeric(12,2) check (store_credit_amount is null or store_credit_amount >= 0),

  admin_notes     text,
  reviewed_by     uuid references auth.users(id) on delete set null,
  reviewed_at     timestamptz,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- An exchange must name a replacement product once it has been
  -- approved and is being processed.
  constraint return_requests_exchange_has_replacement
    check (
      kind <> 'exchange'
      or status in ('requested', 'rejected', 'approved', 'pickup_scheduled', 'received')
      or replacement_product_id is not null
    )
);

create index return_requests_order_idx  on public.return_requests (order_id);
create index return_requests_user_idx   on public.return_requests (user_id, created_at desc);
create index return_requests_status_idx on public.return_requests (status, created_at desc);

create trigger trg_return_requests_updated_at
  before update on public.return_requests
  for each row execute function public.set_updated_at();


-- ------------------------------------------------------------
-- reviews — only from verified purchasers, moderated by admin
-- ------------------------------------------------------------

create table public.reviews (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  order_item_id uuid references public.order_items(id) on delete set null,

  rating        integer not null check (rating between 1 and 5),
  title         text,
  comment       text,
  image_urls    text[] not null default '{}',

  is_verified_purchase boolean not null default false,
  is_featured   boolean not null default false,
  status        public.review_status not null default 'pending',

  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- One review per product per customer.
  unique (product_id, user_id)
);

create index reviews_product_idx
  on public.reviews (product_id, status, created_at desc);
create index reviews_user_idx on public.reviews (user_id);

create trigger trg_reviews_updated_at
  before update on public.reviews
  for each row execute function public.set_updated_at();
