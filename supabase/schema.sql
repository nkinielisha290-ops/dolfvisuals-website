-- =============================================================
-- DOLF VISUALS — website + business management database
-- All objects are prefixed dv_ so they can live next to other apps in the same project.
-- Run once in Supabase: SQL Editor -> paste -> Run. Then run supabase/seed.sql.
-- Safe to re-run (idempotent).
-- =============================================================

create extension if not exists "pgcrypto";

-- ---------- Admins ----------
create table if not exists public.dv_admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);

create or replace function public.dv_is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.dv_admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ---------- Site settings (single row) ----------
create table if not exists public.dv_settings (
  id int primary key default 1 check (id = 1),
  tagline_en text not null default '', tagline_sw text not null default '',
  hero_title_en text not null default '', hero_title_sw text not null default '',
  hero_subtitle_en text not null default '', hero_subtitle_sw text not null default '',
  phone text not null default '', whatsapp text not null default '', email text not null default '',
  location_en text not null default '', location_sw text not null default '',
  instagram text, facebook text, tiktok text, youtube text, linkedin text,
  founded date,
  hero_video_url text, hero_video_mobile_url text,
  updated_at timestamptz not null default now()
);

-- ---------- Content ----------
create table if not exists public.dv_services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_en text not null, title_sw text not null default '',
  summary_en text not null default '', summary_sw text not null default '',
  description_en text not null default '', description_sw text not null default '',
  cover_url text, portfolio_category text,
  sort int not null default 0, published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.dv_packages (
  id uuid primary key default gen_random_uuid(),
  service_slug text references public.dv_services(slug) on update cascade on delete set null,
  name_en text not null, name_sw text not null default '',
  price numeric, price_note_en text, price_note_sw text,
  features_en text[] not null default '{}', features_sw text[] not null default '{}',
  featured boolean not null default false,
  sort int not null default 0, published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.dv_projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_en text not null, title_sw text not null default '',
  client text,
  summary_en text not null default '', summary_sw text not null default '',
  cover_url text, project_date date,
  sort int not null default 0, published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.dv_portfolio_items (
  id uuid primary key default gen_random_uuid(),
  title_en text not null default '', title_sw text not null default '',
  description_en text, description_sw text,
  category text not null,
  media_type text not null default 'image' check (media_type in ('image','video')),
  image_url text not null, video_url text,
  width int, height int,
  featured boolean not null default false,
  project_slug text references public.dv_projects(slug) on update cascade on delete set null,
  sort int not null default 0, published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.dv_team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role_en text not null default '', role_sw text not null default '',
  responsibilities_en text, responsibilities_sw text,
  bio_en text, bio_sw text,
  photo_url text,
  sort int not null default 0, published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.dv_testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null, organization text,
  quote_en text not null, quote_sw text,
  photo_url text, video_url text,
  rating int check (rating between 1 and 5),
  approved boolean not null default false,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

-- partners, corporate clients, awards, certificates, press (brief §10)
create table if not exists public.dv_highlights (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('partner','client','award','certificate','press')),
  title_en text not null, title_sw text not null default '',
  description_en text, description_sw text,
  logo_url text, link text, year int,
  sort int not null default 0, published boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Business management (CRM) ----------
create table if not exists public.dv_clients (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text, phone_normalized text,
  email text, organization text, address text,
  source text not null default 'website' check (source in ('website','whatsapp','instagram','referral','walk-in','other')),
  notes text
);
create index if not exists dv_clients_phone_idx on public.dv_clients (phone_normalized);

create table if not exists public.dv_bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid references public.dv_clients(id) on delete set null,
  reference text unique,
  request_type text not null default 'booking' check (request_type in ('booking','quote')),
  name text not null, phone text not null, email text,
  service_slug text, event_date date, location text, guests text, budget text, details text,
  status text not null default 'new'
    check (status in ('new','contacted','quoted','confirmed','completed','cancelled')),
  stage text not null default 'not_started'
    check (stage in ('not_started','pre_production','shooting','editing','review','delivered')),
  quoted_amount numeric,
  deliverables_url text,
  admin_notes text
);

create table if not exists public.dv_inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null, phone text, email text, subject text,
  message text not null,
  status text not null default 'new' check (status in ('new','read','replied'))
);

create table if not exists public.dv_payments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  client_id uuid references public.dv_clients(id) on delete cascade,
  booking_id uuid references public.dv_bookings(id) on delete set null,
  invoice_id uuid,
  amount numeric not null check (amount > 0),
  method text not null default 'mpesa' check (method in ('mpesa','tigopesa','airtelmoney','halopesa','bank','cash','card','other')),
  reference text,
  paid_on date not null default current_date,
  notes text
);

create sequence if not exists public.dv_invoice_seq;
create table if not exists public.dv_invoices (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  number text unique not null default ('DV-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.dv_invoice_seq')::text, 4, '0')),
  client_id uuid references public.dv_clients(id) on delete cascade,
  booking_id uuid references public.dv_bookings(id) on delete set null,
  issue_date date not null default current_date,
  due_date date,
  items jsonb not null default '[]'::jsonb,   -- [{description, qty, price}]
  discount numeric not null default 0,
  tax_rate numeric not null default 0,       -- percent, e.g. 18 for VAT
  total numeric not null default 0,
  status text not null default 'draft' check (status in ('draft','sent','partially_paid','paid','cancelled')),
  notes text
);
do $$ begin
  alter table public.dv_payments add constraint dv_payments_invoice_fk foreign key (invoice_id) references public.dv_invoices(id) on delete set null;
exception when duplicate_object then null; end $$;

create table if not exists public.dv_communications (
  id uuid primary key default gen_random_uuid(),
  at timestamptz not null default now(),
  client_id uuid references public.dv_clients(id) on delete cascade,
  booking_id uuid references public.dv_bookings(id) on delete set null,
  channel text not null default 'whatsapp' check (channel in ('whatsapp','call','email','meeting','sms','instagram','other')),
  direction text not null default 'out' check (direction in ('in','out')),
  summary text not null
);

-- columns added after first release (safe on existing databases)
alter table public.dv_bookings add column if not exists reference text unique;
alter table public.dv_bookings add column if not exists request_type text not null default 'booking';

-- ---------- Website booking -> client record (auto) ----------
create or replace function public.dv_normalize_phone(p text)
returns text language sql immutable as $$
  select case
    when p is null then null
    when regexp_replace(p, '\D', '', 'g') like '0%' then '255' || substr(regexp_replace(p, '\D', '', 'g'), 2)
    else regexp_replace(p, '\D', '', 'g')
  end;
$$;

create or replace function public.dv_link_booking_client()
returns trigger language plpgsql security definer set search_path = public as $$
declare cid uuid; np text;
begin
  if new.client_id is not null then
    -- website visitors may only attach a booking to their own client record
    if coalesce(auth.jwt()->>'role', '') in ('anon', 'authenticated') and not public.dv_is_admin()
       and new.client_id is distinct from public.dv_my_client_id() then
      new.client_id := null;
    else
      return new;
    end if;
  end if;
  np := public.dv_normalize_phone(new.phone);
  -- never attach an anonymous booking to a client who has a website account (they book while signed in)
  select id into cid from public.dv_clients where phone_normalized = np and auth_user_id is null order by created_at limit 1;
  if cid is null then
    insert into public.dv_clients (name, phone, phone_normalized, email, source)
    values (new.name, new.phone, np, new.email, 'website') returning id into cid;
  end if;
  new.client_id := cid;
  return new;
end $$;

drop trigger if exists dv_bookings_link_client on public.dv_bookings;
create trigger dv_bookings_link_client before insert on public.dv_bookings
  for each row execute function public.dv_link_booking_client();

create or replace function public.dv_clients_normalize()
returns trigger language plpgsql as $$
begin new.phone_normalized := public.dv_normalize_phone(new.phone); return new; end $$;
drop trigger if exists dv_clients_norm on public.dv_clients;
create trigger dv_clients_norm before insert or update of phone on public.dv_clients
  for each row execute function public.dv_clients_normalize();

-- ---------- Client accounts (website sign-up / Google → client portal) ----------
alter table public.dv_settings add column if not exists x text;
alter table public.dv_clients add column if not exists auth_user_id uuid unique references auth.users(id) on delete set null;

-- Two-step verification: when a user has a verified authenticator app, their client data is only
-- readable from a session that passed the second step (AAL2). Enforced in the database, not just the UI.
create or replace function public.dv_mfa_ok()
returns boolean language sql stable security definer set search_path = public, auth as $$
  select coalesce(auth.jwt()->>'aal', 'aal1') = 'aal2'
      or not exists (select 1 from auth.mfa_factors f where f.user_id = auth.uid() and f.status = 'verified');
$$;

create or replace function public.dv_my_client_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.dv_clients where auth_user_id = auth.uid() and public.dv_mfa_ok() limit 1;
$$;

-- Link a confirmed account to the client record with the same (verified) email, or create one.
-- Phone numbers are never used for linking because they are not verified.
create or replace function public.dv_link_user(p_user uuid)
returns uuid language plpgsql security definer set search_path = public, auth as $$
declare u record; cid uuid; meta jsonb;
begin
  select id, email, email_confirmed_at, raw_user_meta_data into u from auth.users where id = p_user;
  if u.id is null or u.email is null or u.email_confirmed_at is null then return null; end if;
  if exists (select 1 from public.dv_admin_users a where lower(a.email) = lower(u.email)) then return null; end if;  -- staff are not clients
  select id into cid from public.dv_clients where auth_user_id = u.id;
  if cid is not null then return cid; end if;
  meta := coalesce(u.raw_user_meta_data, '{}'::jsonb);
  select id into cid from public.dv_clients
    where auth_user_id is null and lower(email) = lower(u.email) order by created_at limit 1;
  if cid is null then
    insert into public.dv_clients (name, phone, email, source, auth_user_id)
    values (coalesce(nullif(meta->>'name', ''), nullif(meta->>'full_name', ''), split_part(u.email, '@', 1)),
            nullif(meta->>'phone', ''), lower(u.email), 'website', u.id)
    returning id into cid;
  else
    update public.dv_clients set auth_user_id = u.id, phone = coalesce(phone, nullif(meta->>'phone', '')) where id = cid;
  end if;
  return cid;
end $$;

-- e-mail sign-ups from the website are linked as soon as the address is confirmed
create or replace function public.dv_link_auth_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(new.raw_user_meta_data->>'dv_client', '') = 'true' and new.email_confirmed_at is not null then
    perform public.dv_link_user(new.id);
  end if;
  return new;
end $$;

drop trigger if exists dv_auth_user_created on auth.users;
create trigger dv_auth_user_created after insert on auth.users for each row execute function public.dv_link_auth_user();
drop trigger if exists dv_auth_user_confirmed on auth.users;
create trigger dv_auth_user_confirmed after update of email_confirmed_at on auth.users for each row execute function public.dv_link_auth_user();

-- called by the website after any sign-in (e.g. "Continue with Google")
create or replace function public.dv_claim_account()
returns uuid language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not public.dv_mfa_ok() then return null; end if;
  return public.dv_link_user(auth.uid());
end $$;

-- clients may edit only these profile fields
create or replace function public.dv_update_my_profile(p_name text, p_phone text, p_organization text, p_address text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not public.dv_mfa_ok() then raise exception 'not allowed'; end if;
  update public.dv_clients set
    name = coalesce(nullif(trim(p_name), ''), name),
    phone = nullif(trim(p_phone), ''),
    organization = nullif(trim(p_organization), ''),
    address = nullif(trim(p_address), '')
  where auth_user_id = auth.uid();
end $$;

revoke execute on function public.dv_link_user(uuid) from public, anon, authenticated;

-- ---------- API access ----------
grant usage on schema public to anon, authenticated;
grant select on public.dv_settings, public.dv_services, public.dv_packages, public.dv_projects,
  public.dv_portfolio_items, public.dv_team_members, public.dv_testimonials, public.dv_highlights to anon, authenticated;
grant insert on public.dv_bookings, public.dv_inquiries to anon, authenticated;
grant select, insert, update, delete on
  public.dv_admin_users, public.dv_settings, public.dv_services, public.dv_packages, public.dv_projects,
  public.dv_portfolio_items, public.dv_team_members, public.dv_testimonials, public.dv_highlights,
  public.dv_clients, public.dv_bookings, public.dv_inquiries, public.dv_payments, public.dv_invoices, public.dv_communications
  to authenticated;
grant usage on sequence public.dv_invoice_seq to authenticated;
grant execute on function public.dv_is_admin() to anon, authenticated;
grant execute on function public.dv_my_client_id() to authenticated;
grant execute on function public.dv_claim_account() to authenticated;
grant execute on function public.dv_mfa_ok() to authenticated;
grant execute on function public.dv_update_my_profile(text, text, text, text) to authenticated;

-- ---------- Row Level Security ----------
do $$
declare t text;
begin
  foreach t in array array['dv_admin_users','dv_settings','dv_services','dv_packages','dv_projects','dv_portfolio_items',
    'dv_team_members','dv_testimonials','dv_highlights','dv_clients','dv_bookings','dv_inquiries','dv_payments','dv_invoices','dv_communications'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "admin all" on public.%I', t);
    execute format('create policy "admin all" on public.%I for all using (public.dv_is_admin()) with check (public.dv_is_admin())', t);
  end loop;
  -- public content: published rows readable by everyone
  foreach t in array array['dv_services','dv_packages','dv_projects','dv_portfolio_items','dv_team_members','dv_highlights'] loop
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select using (published)', t);
  end loop;
end $$;

drop policy if exists "public read" on public.dv_settings;
create policy "public read" on public.dv_settings for select using (true);
drop policy if exists "public read" on public.dv_testimonials;
create policy "public read" on public.dv_testimonials for select using (approved);

-- visitors may only INSERT bookings / inquiries (never read them)
drop policy if exists "public insert" on public.dv_bookings;
create policy "public insert" on public.dv_bookings for insert
  with check (status = 'new' and stage = 'not_started' and admin_notes is null and quoted_amount is null);

-- signed-in clients see only their own records (drafts and internal notes stay private)
drop policy if exists "client own" on public.dv_clients;
create policy "client own" on public.dv_clients for select using (auth_user_id = auth.uid() and public.dv_mfa_ok());
drop policy if exists "client own" on public.dv_bookings;
create policy "client own" on public.dv_bookings for select using (client_id is not null and client_id = public.dv_my_client_id());
drop policy if exists "client own" on public.dv_invoices;
create policy "client own" on public.dv_invoices for select using (client_id is not null and client_id = public.dv_my_client_id() and status <> 'draft');
drop policy if exists "client own" on public.dv_payments;
create policy "client own" on public.dv_payments for select using (client_id is not null and client_id = public.dv_my_client_id());
drop policy if exists "public insert" on public.dv_inquiries;
create policy "public insert" on public.dv_inquiries for insert with check (status = 'new');

-- ---------- Storage bucket for uploads ----------
insert into storage.buckets (id, name, public) values ('dv-media', 'dv-media', true) on conflict (id) do nothing;
drop policy if exists "dv media read" on storage.objects;
create policy "dv media read" on storage.objects for select using (bucket_id = 'dv-media');
drop policy if exists "dv media insert" on storage.objects;
create policy "dv media insert" on storage.objects for insert with check (bucket_id = 'dv-media' and public.dv_is_admin());
drop policy if exists "dv media update" on storage.objects;
create policy "dv media update" on storage.objects for update using (bucket_id = 'dv-media' and public.dv_is_admin());
drop policy if exists "dv media delete" on storage.objects;
create policy "dv media delete" on storage.objects for delete using (bucket_id = 'dv-media' and public.dv_is_admin());

-- =============================================================
-- FIRST ADMIN: create the user in Authentication -> Users, then:
--   insert into public.dv_admin_users (email) values ('dolfvisuals@gmail.com');
-- =============================================================
