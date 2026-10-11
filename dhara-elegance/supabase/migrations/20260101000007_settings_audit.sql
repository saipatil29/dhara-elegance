-- ============================================================
-- 0007 — Site settings, audit log, newsletter, webhook events
-- ============================================================

-- ------------------------------------------------------------
-- site_settings — single-row configuration table.
--
-- Business config lives here rather than scattered through the
-- codebase, so it is editable from the admin portal.
-- ------------------------------------------------------------

create table public.site_settings (
  id                   boolean primary key default true,

  brand_name           text not null default 'Dhara Elegance',
  tagline              text not null default 'Shine Every Day.',
  logo_url             text,
  favicon_url          text,

  support_email        text,
  support_phone        text,
  whatsapp_number      text,
  instagram_url        text,
  facebook_url         text,

  -- Commerce rules. COD threshold is EXCLUSIVE: COD is offered only
  -- when the payable total is strictly greater than this value.
  free_shipping_threshold numeric(12,2) not null default 999,
  flat_shipping_rate      numeric(12,2) not null default 49,
  cod_minimum_amount      numeric(12,2) not null default 500,
  cod_enabled             boolean not null default true,

  return_window_days      integer not null default 7 check (return_window_days >= 0),
  exchange_enabled        boolean not null default true,
  returns_enabled         boolean not null default true,
  store_credit_enabled    boolean not null default true,

  announcement_text       text,
  announcement_enabled    boolean not null default false,

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  -- Enforces exactly one row.
  constraint site_settings_singleton check (id = true)
);

create trigger trg_site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

insert into public.site_settings (id) values (true)
  on conflict (id) do nothing;


-- ------------------------------------------------------------
-- audit_logs — who did what, in the admin portal
-- ------------------------------------------------------------

create table public.audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references auth.users(id) on delete set null,
  actor_email text,
  action      text not null,          -- e.g. 'product.deleted'
  target_type text,                   -- e.g. 'product'
  target_id   text,
  metadata    jsonb not null default '{}'::jsonb,
  ip_address  text,
  created_at  timestamptz not null default now()
);

create index audit_logs_actor_idx  on public.audit_logs (actor_id, created_at desc);
create index audit_logs_action_idx on public.audit_logs (action, created_at desc);
create index audit_logs_target_idx on public.audit_logs (target_type, target_id);


-- ------------------------------------------------------------
-- webhook_events — idempotency guard for Razorpay.
--
-- event_id is unique: a replayed webhook hits the conflict and is
-- ignored rather than processed twice.
-- ------------------------------------------------------------

create table public.webhook_events (
  id            uuid primary key default gen_random_uuid(),
  provider      text not null default 'razorpay',
  event_id      text not null,
  event_type    text not null,
  payload       jsonb not null,
  processed     boolean not null default false,
  processed_at  timestamptz,
  error_message text,
  created_at    timestamptz not null default now(),

  unique (provider, event_id)
);

create index webhook_events_unprocessed_idx
  on public.webhook_events (processed, created_at)
  where processed = false;


-- ------------------------------------------------------------
-- newsletter_subscribers
-- ------------------------------------------------------------

create table public.newsletter_subscribers (
  id             uuid primary key default gen_random_uuid(),
  email          citext not null unique,
  is_subscribed  boolean not null default true,
  source         text,
  subscribed_at  timestamptz not null default now(),
  unsubscribed_at timestamptz
);
