-- =============================================================
-- DOLF VISUALS — database schema
-- Run once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run
-- Then run supabase/seed.sql to load the starting content.
-- =============================================================

create extension if not exists "pgcrypto";

-- ---------- Admins ----------
create table if not exists public.admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ---------- Site settings (single row) ----------
create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  tagline_en text not null default '',
  tagline_sw text not null default '',
  hero_title_en text not null default '',
  hero_title_sw text not null default '',
  hero_subtitle_en text not null default '',
  hero_subtitle_sw text not null default '',
  phone text not null default '',
  whatsapp text not null default '',
  email text not null default '',
  location_en text not null default '',
  location_sw text not null default '',
  instagram text, facebook text, tiktok text, youtube text, linkedin text,
  founded date,
  updated_at timestamptz not null default now()
);

-- ---------- Services ----------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_en text not null, title_sw text not null default '',
  summary_en text not null default '', summary_sw text not null default '',
  description_en text not null default '', description_sw text not null default '',
  cover_url text,
  portfolio_category text,
  sort int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Packages / pricing ----------
create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  service_slug text references public.services(slug) on update cascade on delete set null,
  name_en text not null, name_sw text not null default '',
  price numeric,
  price_note_en text, price_note_sw text,
  features_en text[] not null default '{}',
  features_sw text[] not null default '{}',
  featured boolean not null default false,
  sort int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Projects / case studies ----------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_en text not null, title_sw text not null default '',
  client text,
  summary_en text not null default '', summary_sw text not null default '',
  cover_url text,
  project_date date,
  sort int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Portfolio ----------
create table if not exists public.portfolio_items (
  id uuid primary key default gen_random_uuid(),
  title_en text not null default '', title_sw text not null default '',
  description_en text, description_sw text,
  category text not null,
  media_type text not null default 'image' check (media_type in ('image','video')),
  image_url text not null,
  video_url text,
  width int, height int,
  featured boolean not null default false,
  project_slug text references public.projects(slug) on update cascade on delete set null,
  sort int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Team ----------
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role_en text not null default '', role_sw text not null default '',
  bio_en text, bio_sw text,
  photo_url text,
  sort int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Testimonials (only approved ones are public) ----------
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organization text,
  quote_en text not null, quote_sw text,
  photo_url text, video_url text,
  rating int check (rating between 1 and 5),
  approved boolean not null default false,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- Bookings & inquiries (CRM) ----------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  email text,
  service_slug text,
  event_date date,
  location text,
  guests text,
  budget text,
  details text,
  status text not null default 'new'
    check (status in ('new','contacted','quoted','confirmed','completed','cancelled')),
  admin_notes text
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text,
  email text,
  subject text,
  message text not null,
  status text not null default 'new' check (status in ('new','read','replied'))
);

-- ---------- API access (row level security below decides what each user may actually do) ----------
grant usage on schema public to anon, authenticated;
grant select on public.settings, public.services, public.packages, public.projects,
  public.portfolio_items, public.team_members, public.testimonials to anon, authenticated;
grant insert on public.bookings, public.inquiries to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- Row Level Security ----------
alter table public.admin_users     enable row level security;
alter table public.settings        enable row level security;
alter table public.services        enable row level security;
alter table public.packages        enable row level security;
alter table public.projects        enable row level security;
alter table public.portfolio_items enable row level security;
alter table public.team_members    enable row level security;
alter table public.testimonials    enable row level security;
alter table public.bookings        enable row level security;
alter table public.inquiries       enable row level security;

do $$
declare t text;
begin
  -- content tables: public can read published rows, admins can do everything
  foreach t in array array['services','packages','projects','portfolio_items','team_members'] loop
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select using (published or public.is_admin())', t);
    execute format('drop policy if exists "admin all" on public.%I', t);
    execute format('create policy "admin all" on public.%I for all using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

drop policy if exists "public read" on public.settings;
create policy "public read" on public.settings for select using (true);
drop policy if exists "admin all" on public.settings;
create policy "admin all" on public.settings for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public read" on public.testimonials;
create policy "public read" on public.testimonials for select using (approved or public.is_admin());
drop policy if exists "admin all" on public.testimonials;
create policy "admin all" on public.testimonials for all using (public.is_admin()) with check (public.is_admin());

-- visitors may only INSERT bookings / inquiries; only admins read & manage them
drop policy if exists "public insert" on public.bookings;
create policy "public insert" on public.bookings for insert with check (status = 'new' and admin_notes is null);
drop policy if exists "admin all" on public.bookings;
create policy "admin all" on public.bookings for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public insert" on public.inquiries;
create policy "public insert" on public.inquiries for insert with check (status = 'new');
drop policy if exists "admin all" on public.inquiries;
create policy "admin all" on public.inquiries for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin read self" on public.admin_users;
create policy "admin read self" on public.admin_users for select using (public.is_admin());

-- ---------- Storage bucket for uploaded photos / videos ----------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects for select using (bucket_id = 'media');
drop policy if exists "media admin write" on storage.objects;
create policy "media admin write" on storage.objects for insert with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects for update using (bucket_id = 'media' and public.is_admin());
drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects for delete using (bucket_id = 'media' and public.is_admin());

-- =============================================================
-- FIRST ADMIN: create a user in Authentication -> Users (email + password),
-- then register that email here:
--   insert into public.admin_users (email) values ('dolfvisuals@gmail.com');
-- =============================================================
