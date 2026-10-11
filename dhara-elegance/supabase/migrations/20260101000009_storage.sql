-- ============================================================
-- 0009 — Supabase Storage buckets and policies
-- ============================================================

-- product-images : public read (catalog imagery is public), admin write
-- review-images  : public read, customer write (own uploads)
-- brand-assets   : public read (logo/favicon), admin write

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 5242880,
   array['image/jpeg','image/png','image/webp','image/avif']),
  ('review-images',  'review-images',  true, 5242880,
   array['image/jpeg','image/png','image/webp']),
  ('brand-assets',   'brand-assets',   true, 2097152,
   array['image/jpeg','image/png','image/webp','image/svg+xml','image/x-icon'])
on conflict (id) do nothing;


-- ------------------------------------------------------------
-- product-images
-- ------------------------------------------------------------

create policy "product_images_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'product-images');

create policy "product_images_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and public.has_admin_role('admin'));

create policy "product_images_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and public.has_admin_role('admin'))
  with check (bucket_id = 'product-images' and public.has_admin_role('admin'));

create policy "product_images_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and public.has_admin_role('admin'));


-- ------------------------------------------------------------
-- review-images
--
-- Uploads are namespaced by user id: <uid>/<filename>. The policy
-- checks the first path segment, so a customer cannot write into
-- another customer's folder.
-- ------------------------------------------------------------

create policy "review_images_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'review-images');

create policy "review_images_owner_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'review-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "review_images_owner_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'review-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- ------------------------------------------------------------
-- brand-assets
-- ------------------------------------------------------------

create policy "brand_assets_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'brand-assets');

create policy "brand_assets_admin_write" on storage.objects
  for all to authenticated
  using (bucket_id = 'brand-assets' and public.has_admin_role('admin'))
  with check (bucket_id = 'brand-assets' and public.has_admin_role('admin'));
