-- ============================================================
-- Grant admin portal access to an existing Supabase Auth user.
--
-- HOW TO USE
--   1. Create the user first — Supabase Dashboard >
--      Authentication > Users > "Add user" (set a strong password
--      and mark the email confirmed).
--   2. Replace the email below with that user's email.
--   3. Run this in Dashboard > SQL Editor.
--
-- There is deliberately no in-app way to become an admin.
-- ============================================================

insert into public.admin_users (user_id, email, full_name, role, is_active)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data ->> 'full_name', 'Administrator'),
  'super_admin',          -- 'staff' | 'admin' | 'super_admin'
  true
from auth.users u
where u.email = 'REPLACE_WITH_YOUR_ADMIN_EMAIL@example.com'
on conflict (user_id) do update
  set role = excluded.role,
      is_active = true,
      updated_at = now();

-- Verify:
select au.email, au.role, au.is_active
from public.admin_users au;
