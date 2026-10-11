-- ============================================================
-- 0008 — Row Level Security
--
-- Principles:
--   * RLS is ON for every table in public.
--   * There is NO "authenticated can do anything" policy anywhere.
--   * Customers reach only their own rows.
--   * Admin access is granted through is_admin() / has_admin_role().
--   * The public catalog is readable by anon, but only active rows.
--   * Writes that must not be client-driven (orders, payments,
--     inventory, coupon usage) have NO customer INSERT/UPDATE policy
--     at all — they are performed server-side by trusted code.
-- ============================================================

alter table public.profiles               enable row level security;
alter table public.admin_users            enable row level security;
alter table public.addresses              enable row level security;
alter table public.categories             enable row level security;
alter table public.products               enable row level security;
alter table public.product_variants       enable row level security;
alter table public.product_images         enable row level security;
alter table public.cart_items             enable row level security;
alter table public.wishlist_items         enable row level security;
alter table public.orders                 enable row level security;
alter table public.order_items            enable row level security;
alter table public.payments               enable row level security;
alter table public.order_status_history   enable row level security;
alter table public.recently_viewed        enable row level security;
alter table public.coupons                enable row level security;
alter table public.coupon_usages          enable row level security;
alter table public.inventory_transactions enable row level security;
alter table public.return_requests        enable row level security;
alter table public.reviews                enable row level security;
alter table public.site_settings          enable row level security;
alter table public.audit_logs             enable row level security;
alter table public.webhook_events         enable row level security;
alter table public.newsletter_subscribers enable row level security;


-- ------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------

create policy "profiles_select_own" on public.profiles
  for select to authenticated using (id = auth.uid());

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_admin_select" on public.profiles
  for select to authenticated using (public.is_admin());

create policy "profiles_admin_update" on public.profiles
  for update to authenticated
  using (public.has_admin_role('admin'))
  with check (public.has_admin_role('admin'));


-- ------------------------------------------------------------
-- admin_users
--
-- An admin may read their OWN row (used to confirm portal access)
-- and super_admins may read all. Nobody can write via the API:
-- membership is managed out-of-band only.
-- ------------------------------------------------------------

create policy "admin_users_select_self" on public.admin_users
  for select to authenticated using (user_id = auth.uid());

create policy "admin_users_super_select_all" on public.admin_users
  for select to authenticated using (public.is_super_admin());

create policy "admin_users_super_manage" on public.admin_users
  for all to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());


-- ------------------------------------------------------------
-- addresses
-- ------------------------------------------------------------

create policy "addresses_own_all" on public.addresses
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "addresses_admin_select" on public.addresses
  for select to authenticated using (public.is_admin());


-- ------------------------------------------------------------
-- categories / products / variants / images
-- Public may read ACTIVE rows only. Admin manages everything.
-- ------------------------------------------------------------

create policy "categories_public_select" on public.categories
  for select to anon, authenticated using (is_active = true);

create policy "categories_admin_all" on public.categories
  for all to authenticated
  using (public.has_admin_role('admin'))
  with check (public.has_admin_role('admin'));


create policy "products_public_select" on public.products
  for select to anon, authenticated
  using (is_active = true and archived_at is null);

create policy "products_admin_select_all" on public.products
  for select to authenticated using (public.is_admin());

create policy "products_admin_write" on public.products
  for all to authenticated
  using (public.has_admin_role('admin'))
  with check (public.has_admin_role('admin'));


create policy "variants_public_select" on public.product_variants
  for select to anon, authenticated
  using (
    is_active = true
    and exists (
      select 1 from public.products p
      where p.id = product_id and p.is_active = true and p.archived_at is null
    )
  );

create policy "variants_admin_all" on public.product_variants
  for all to authenticated
  using (public.has_admin_role('admin'))
  with check (public.has_admin_role('admin'));


create policy "images_public_select" on public.product_images
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and p.is_active = true and p.archived_at is null
    )
  );

create policy "images_admin_all" on public.product_images
  for all to authenticated
  using (public.has_admin_role('admin'))
  with check (public.has_admin_role('admin'));


-- ------------------------------------------------------------
-- cart / wishlist / recently viewed — strictly own rows
-- ------------------------------------------------------------

create policy "cart_items_own_all" on public.cart_items
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "wishlist_items_own_all" on public.wishlist_items
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "recently_viewed_own_all" on public.recently_viewed
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());


-- ------------------------------------------------------------
-- orders
--
-- Customers READ their own orders. They may NOT insert or update:
-- order creation runs server-side (service role) after the server
-- has recomputed pricing and stock. This is what stops a client
-- from inventing its own totals.
--
-- Guest orders (user_id null) are not readable through the API at
-- all — the order-success page is handed its data by the server
-- action that created the order.
-- ------------------------------------------------------------

create policy "orders_select_own" on public.orders
  for select to authenticated using (user_id = auth.uid());

create policy "orders_admin_select" on public.orders
  for select to authenticated using (public.is_admin());

create policy "orders_admin_update" on public.orders
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());


create policy "order_items_select_own" on public.order_items
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

create policy "order_items_admin_select" on public.order_items
  for select to authenticated using (public.is_admin());


-- ------------------------------------------------------------
-- payments / status history — read-only to the owning customer
-- ------------------------------------------------------------

create policy "payments_select_own" on public.payments
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

create policy "payments_admin_select" on public.payments
  for select to authenticated using (public.is_admin());

create policy "payments_admin_update" on public.payments
  for update to authenticated
  using (public.has_admin_role('admin'))
  with check (public.has_admin_role('admin'));


create policy "order_status_history_select_own" on public.order_status_history
  for select to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );

create policy "order_status_history_admin_all" on public.order_status_history
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());


-- ------------------------------------------------------------
-- coupons
--
-- The public may SELECT only currently-valid coupons. This exists
-- so the checkout UI can echo a code back; the authoritative
-- validation and discount maths still happen server-side.
-- used_count is never client-writable.
-- ------------------------------------------------------------

create policy "coupons_public_select_valid" on public.coupons
  for select to anon, authenticated
  using (
    is_active = true
    and (starts_at is null or starts_at <= now())
    and (expires_at is null or expires_at > now())
  );

create policy "coupons_admin_all" on public.coupons
  for all to authenticated
  using (public.has_admin_role('admin'))
  with check (public.has_admin_role('admin'));


create policy "coupon_usages_select_own" on public.coupon_usages
  for select to authenticated using (user_id = auth.uid());

create policy "coupon_usages_admin_select" on public.coupon_usages
  for select to authenticated using (public.is_admin());


-- ------------------------------------------------------------
-- inventory — admin visibility only; writes are server-side
-- ------------------------------------------------------------

create policy "inventory_transactions_admin_select" on public.inventory_transactions
  for select to authenticated using (public.is_admin());


-- ------------------------------------------------------------
-- returns / exchanges
--
-- A customer may open a request against their OWN delivered order,
-- and read their own requests. Only admins change status.
-- ------------------------------------------------------------

create policy "return_requests_select_own" on public.return_requests
  for select to authenticated using (user_id = auth.uid());

create policy "return_requests_insert_own" on public.return_requests
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.user_id = auth.uid()
        and o.status = 'delivered'
    )
  );

create policy "return_requests_admin_all" on public.return_requests
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());


-- ------------------------------------------------------------
-- reviews
--
-- Public reads APPROVED reviews. A customer may write a review only
-- for a product they actually received on a delivered order, and may
-- edit only their own pending review. Moderation is admin-only.
-- ------------------------------------------------------------

create policy "reviews_public_select_approved" on public.reviews
  for select to anon, authenticated using (status = 'approved');

create policy "reviews_select_own" on public.reviews
  for select to authenticated using (user_id = auth.uid());

create policy "reviews_insert_verified_purchase" on public.reviews
  for insert to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.order_items oi
      join public.orders o on o.id = oi.order_id
      where oi.product_id = reviews.product_id
        and o.user_id = auth.uid()
        and o.status = 'delivered'
    )
  );

create policy "reviews_update_own_pending" on public.reviews
  for update to authenticated
  using (user_id = auth.uid() and status = 'pending')
  with check (user_id = auth.uid() and status = 'pending');

create policy "reviews_delete_own" on public.reviews
  for delete to authenticated using (user_id = auth.uid());

create policy "reviews_admin_all" on public.reviews
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());


-- ------------------------------------------------------------
-- site_settings — world-readable (branding is public), admin-writable
-- ------------------------------------------------------------

create policy "site_settings_public_select" on public.site_settings
  for select to anon, authenticated using (true);

create policy "site_settings_admin_update" on public.site_settings
  for update to authenticated
  using (public.has_admin_role('admin'))
  with check (public.has_admin_role('admin'));


-- ------------------------------------------------------------
-- audit_logs — admins read; only server-side code writes
-- ------------------------------------------------------------

create policy "audit_logs_admin_select" on public.audit_logs
  for select to authenticated using (public.is_admin());


-- ------------------------------------------------------------
-- webhook_events — NO policies.
--
-- RLS is enabled with zero policies, which denies every request
-- from anon and authenticated. Only the service-role client (which
-- bypasses RLS) touches this table. That is intentional.
-- ------------------------------------------------------------


-- ------------------------------------------------------------
-- newsletter_subscribers
--
-- Anyone may subscribe; nobody may read the list except admins.
-- ------------------------------------------------------------

create policy "newsletter_insert_any" on public.newsletter_subscribers
  for insert to anon, authenticated with check (true);

create policy "newsletter_admin_select" on public.newsletter_subscribers
  for select to authenticated using (public.is_admin());

create policy "newsletter_admin_update" on public.newsletter_subscribers
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());
