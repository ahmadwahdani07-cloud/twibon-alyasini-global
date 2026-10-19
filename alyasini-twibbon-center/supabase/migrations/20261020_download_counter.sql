-- Jalankan di Supabase Dashboard > SQL Editor > New query > Run.
-- Counter bertambah secara atomik hanya untuk twibbon yang sudah dipublikasikan.
create or replace function public.increment_twibbon_download(twibbon_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.twibbons
  set download_count = coalesce(download_count, 0) + 1
  where id = twibbon_id and status = 'published';
$$;

revoke all on function public.increment_twibbon_download(uuid) from public;
grant execute on function public.increment_twibbon_download(uuid) to anon, authenticated;
