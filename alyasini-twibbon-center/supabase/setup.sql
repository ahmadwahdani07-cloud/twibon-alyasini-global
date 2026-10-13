-- Jalankan seluruh file ini di Supabase Dashboard > SQL Editor > New query > Run.
create extension if not exists pgcrypto;
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);
create table if not exists public.twibbons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text default '',
  category_id uuid references public.categories(id) on delete set null,
  image_url text not null,
  thumbnail_url text,
  event_date date,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  download_count bigint not null default 0,
  export_width integer not null default 1080,
  export_height integer not null default 1080,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
alter table public.categories enable row level security;
alter table public.twibbons enable row level security;
-- Admin identity is explicitly allowlisted in public.admins; do not rely on login alone.
drop policy if exists "Admins can read admin allowlist" on public.admins;
create policy "Admins can read admin allowlist" on public.admins for select to authenticated using (user_id = auth.uid());
drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories" on public.categories for select using (true);
drop policy if exists "Authenticated admins manage categories" on public.categories;
create policy "Authenticated admins manage categories" on public.categories for all to authenticated using (exists (select 1 from public.admins a where a.user_id = auth.uid())) with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));
drop policy if exists "Public can read published twibbons" on public.twibbons;
create policy "Public can read published twibbons" on public.twibbons for select using (status = 'published');
drop policy if exists "Authenticated admins read all twibbons" on public.twibbons;
create policy "Authenticated admins read all twibbons" on public.twibbons for select to authenticated using (exists (select 1 from public.admins a where a.user_id = auth.uid()));
drop policy if exists "Authenticated admins insert twibbons" on public.twibbons;
create policy "Authenticated admins insert twibbons" on public.twibbons for insert to authenticated with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));
drop policy if exists "Authenticated admins update twibbons" on public.twibbons;
create policy "Authenticated admins update twibbons" on public.twibbons for update to authenticated using (exists (select 1 from public.admins a where a.user_id = auth.uid())) with check (exists (select 1 from public.admins a where a.user_id = auth.uid()));
drop policy if exists "Authenticated admins delete twibbons" on public.twibbons;
create policy "Authenticated admins delete twibbons" on public.twibbons for delete to authenticated using (exists (select 1 from public.admins a where a.user_id = auth.uid()));
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('twibbons','twibbons',true,12582912,array['image/png'])
on conflict (id) do update set public=true, file_size_limit=12582912, allowed_mime_types=array['image/png'];
drop policy if exists "Public read twibbon assets" on storage.objects;
create policy "Public read twibbon assets" on storage.objects for select using (bucket_id = 'twibbons');
drop policy if exists "Authenticated admins upload twibbon assets" on storage.objects;
create policy "Authenticated admins upload twibbon assets" on storage.objects for insert to authenticated with check (bucket_id = 'twibbons' and exists (select 1 from public.admins a where a.user_id = auth.uid()));
drop policy if exists "Authenticated admins update twibbon assets" on storage.objects;
create policy "Authenticated admins update twibbon assets" on storage.objects for update to authenticated using (bucket_id = 'twibbons' and exists (select 1 from public.admins a where a.user_id = auth.uid())) with check (bucket_id = 'twibbons' and exists (select 1 from public.admins a where a.user_id = auth.uid()));
drop policy if exists "Authenticated admins delete twibbon assets" on storage.objects;
create policy "Authenticated admins delete twibbon assets" on storage.objects for delete to authenticated using (bucket_id = 'twibbons' and exists (select 1 from public.admins a where a.user_id = auth.uid()));
insert into public.categories (name,slug,description) values ('Kegiatan Pondok','kegiatan-pondok','Kegiatan Pondok Pesantren Terpadu Al-Yasini'),('Hari Besar','hari-besar','Peringatan hari besar'),('Akademik','akademik','Kegiatan pendidikan dan akademik') on conflict (slug) do nothing;
-- PENTING: setelah membuat user admin di Authentication > Users, salin UUID user tersebut dan jalankan:
-- insert into public.admins (user_id) values ('PASTE-UUID-ADMIN-DI-SINI');
-- Hanya user yang terdaftar di public.admins dapat mengelola twibbon/kategori/Storage.
