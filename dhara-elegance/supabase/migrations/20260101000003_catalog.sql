-- ============================================================
-- 0003 — Catalog: categories, products, variants, images
-- ============================================================

-- ------------------------------------------------------------
-- categories — gender-scoped, self-nesting
-- ------------------------------------------------------------

create table public.categories (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null,
  gender       public.gender_target not null,
  parent_id    uuid references public.categories(id) on delete set null,
  description  text,
  image_url    text,
  display_order integer not null default 0,
  is_active    boolean not null default true,
  seo_title       text,
  seo_description text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),

  -- A slug is unique within its gender, so /men/rings and
  -- /women/rings can both exist.
  unique (gender, slug)
);

create index categories_gender_active_idx
  on public.categories (gender, is_active, display_order);

create trigger trg_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();


-- ------------------------------------------------------------
-- products
--
-- Money is numeric(12,2) — never float. Prices here are the
-- authoritative source; the client is never trusted.
-- ------------------------------------------------------------

create table public.products (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  slug              text not null unique,
  description       text,
  short_description text,

  gender            public.gender_target not null,
  category_id       uuid references public.categories(id) on delete restrict,
  subcategory       text,

  price             numeric(12,2) not null check (price >= 0),
  compare_at_price  numeric(12,2) check (compare_at_price is null or compare_at_price >= 0),
  currency          text not null default 'INR',
  sku               text unique,

  stock             integer not null default 0 check (stock >= 0),
  reserved_stock    integer not null default 0 check (reserved_stock >= 0),
  low_stock_threshold integer not null default 3 check (low_stock_threshold >= 0),

  brand             text default 'Dhara Elegance',
  material          text,
  metal             text,
  color             text,
  size              text,
  weight_grams      numeric(10,2),
  dimensions        text,

  care_instructions     text,
  shipping_information  text,
  return_information    text,

  rating            numeric(3,2) not null default 0 check (rating >= 0 and rating <= 5),
  review_count      integer not null default 0 check (review_count >= 0),

  is_featured       boolean not null default false,
  is_new            boolean not null default false,
  is_bestseller     boolean not null default false,
  is_active         boolean not null default true,
  archived_at       timestamptz,

  tags              text[] not null default '{}',
  video_url         text,
  model_3d_url      text,

  seo_title         text,
  seo_description   text,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  -- A sale price must actually be a discount.
  constraint products_compare_at_price_valid
    check (compare_at_price is null or compare_at_price > price),

  -- Never reserve more than exists.
  constraint products_reserved_lte_stock
    check (reserved_stock <= stock)
);

create index products_active_idx      on public.products (is_active, created_at desc);
create index products_gender_idx      on public.products (gender, is_active);
create index products_category_idx    on public.products (category_id, is_active);
create index products_price_idx       on public.products (price);
create index products_featured_idx    on public.products (is_featured) where is_active = true;
create index products_bestseller_idx  on public.products (is_bestseller) where is_active = true;
create index products_new_idx         on public.products (is_new) where is_active = true;
create index products_tags_idx        on public.products using gin (tags);

-- Trigram indexes power fuzzy search across name/description/sku.
create index products_name_trgm_idx
  on public.products using gin (name gin_trgm_ops);
create index products_description_trgm_idx
  on public.products using gin (description gin_trgm_ops);

create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();


-- ------------------------------------------------------------
-- product_variants — sizes / finishes
--
-- price_override is null when the variant costs the same as the
-- parent product. Resolve with coalesce(v.price_override, p.price).
-- ------------------------------------------------------------

create table public.product_variants (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references public.products(id) on delete cascade,
  name            text not null,
  value           text not null,
  sku             text unique,
  price_override  numeric(12,2) check (price_override is null or price_override >= 0),
  stock           integer not null default 0 check (stock >= 0),
  reserved_stock  integer not null default 0 check (reserved_stock >= 0),
  display_order   integer not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  unique (product_id, name, value),
  constraint variants_reserved_lte_stock check (reserved_stock <= stock)
);

create index product_variants_product_idx
  on public.product_variants (product_id, is_active, display_order);

create trigger trg_product_variants_updated_at
  before update on public.product_variants
  for each row execute function public.set_updated_at();


-- ------------------------------------------------------------
-- product_images — ordered gallery, one primary per product
-- ------------------------------------------------------------

create table public.product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products(id) on delete cascade,
  url           text not null,
  storage_path  text,
  alt_text      text,
  display_order integer not null default 0,
  is_primary    boolean not null default false,
  created_at    timestamptz not null default now()
);

create index product_images_product_idx
  on public.product_images (product_id, display_order);

create unique index product_images_one_primary_per_product
  on public.product_images (product_id)
  where is_primary = true;
