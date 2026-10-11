-- ============================================================
-- 0002 — Identity: profiles, admin_users, addresses
-- ============================================================

-- ------------------------------------------------------------
-- profiles — one row per auth.users row
-- ------------------------------------------------------------

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       citext not null,
  full_name   text,
  phone       text,
  avatar_url  text,
  marketing_opt_in boolean not null default false,
  is_blocked  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index profiles_email_idx on public.profiles (email);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile whenever a user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ------------------------------------------------------------
-- admin_users — explicit allowlist granting portal access
--
-- Rows are created out-of-band (dashboard / service-role script),
-- never through customer-facing app code. There is deliberately
-- no self-serve path to becoming an admin.
-- ------------------------------------------------------------

create table public.admin_users (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references auth.users(id) on delete cascade,
  email       citext not null,
  full_name   text,
  role        public.admin_role not null default 'admin',
  is_active   boolean not null default true,
  last_login_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index admin_users_user_id_idx on public.admin_users (user_id)
  where is_active = true;

create trigger trg_admin_users_updated_at
  before update on public.admin_users
  for each row execute function public.set_updated_at();


-- ------------------------------------------------------------
-- addresses — customer shipping book
-- ------------------------------------------------------------

create table public.addresses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  label        text,
  full_name    text not null,
  phone        text not null,
  line1        text not null,
  line2        text,
  city         text not null,
  state        text not null,
  pincode      text not null,
  country      text not null default 'India',
  is_default   boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index addresses_user_id_idx on public.addresses (user_id);

-- At most one default address per user.
create unique index addresses_one_default_per_user
  on public.addresses (user_id)
  where is_default = true;

create trigger trg_addresses_updated_at
  before update on public.addresses
  for each row execute function public.set_updated_at();


-- ------------------------------------------------------------
-- Authorization helpers
--
-- SECURITY DEFINER with a pinned search_path. These are called
-- from RLS policies on other tables; defining them this way avoids
-- recursive RLS evaluation against admin_users.
--
-- They are STABLE (not VOLATILE) so the planner can cache them
-- within a statement.
-- ------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
      and au.is_active = true
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
      and au.is_active = true
      and au.role = 'super_admin'
  );
$$;

create or replace function public.has_admin_role(required public.admin_role)
returns boolean
language sql
security definer
set search_path = public, pg_temp
stable
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.user_id = auth.uid()
      and au.is_active = true
      and case required
            when 'staff'       then au.role in ('staff', 'admin', 'super_admin')
            when 'admin'       then au.role in ('admin', 'super_admin')
            when 'super_admin' then au.role = 'super_admin'
          end
  );
$$;

revoke execute on function public.is_admin()                        from public;
revoke execute on function public.is_super_admin()                  from public;
revoke execute on function public.has_admin_role(public.admin_role) from public;

grant execute on function public.is_admin()                        to authenticated;
grant execute on function public.is_super_admin()                  to authenticated;
grant execute on function public.has_admin_role(public.admin_role) to authenticated;
