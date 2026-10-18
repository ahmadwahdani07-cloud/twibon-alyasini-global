-- Migration fitur Twibbon Khusus Panitia.
-- Jalankan di Supabase SQL Editor setelah menambahkan perubahan aplikasi.
-- Frame panitia disimpan pada bucket PRIVATE dan tidak boleh memakai URL bucket publik.
alter table public.twibbons
  add column if not exists access_type text not null default 'public'
  check (access_type in ('public','committee'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('twibbons-panitia','twibbons-panitia',false,12582912,array['image/png'])
on conflict (id) do update set public=false, file_size_limit=12582912, allowed_mime_types=array['image/png'];

-- Tidak ada policy SELECT publik untuk bucket twibbons-panitia.
-- Hanya admin yang boleh upload/update/delete objek bucket ini.
drop policy if exists "Committee admins upload assets" on storage.objects;
create policy "Committee admins upload assets"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'twibbons-panitia'
  and exists (select 1 from public.admins a where a.user_id = auth.uid())
);

drop policy if exists "Committee admins update assets" on storage.objects;
create policy "Committee admins update assets"
on storage.objects for update to authenticated
using (
  bucket_id = 'twibbons-panitia'
  and exists (select 1 from public.admins a where a.user_id = auth.uid())
)
with check (
  bucket_id = 'twibbons-panitia'
  and exists (select 1 from public.admins a where a.user_id = auth.uid())
);

drop policy if exists "Committee admins delete assets" on storage.objects;
create policy "Committee admins delete assets"
on storage.objects for delete to authenticated
using (
  bucket_id = 'twibbons-panitia'
  and exists (select 1 from public.admins a where a.user_id = auth.uid())
);

-- Rahasia akses disimpan sebagai hash, bukan kode teks biasa.
create table if not exists public.committee_access_settings (
  id boolean primary key default true check (id = true),
  code_hash text not null,
  updated_at timestamptz not null default now()
);
alter table public.committee_access_settings enable row level security;
-- Tidak membuat policy baca/tulis untuk anon atau authenticated.
-- Perubahan kode harus dilakukan melalui endpoint server yang memverifikasi admin.
