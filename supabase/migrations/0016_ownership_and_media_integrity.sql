-- Kathak Journal — cross-record ownership + media kind integrity
-- Paste into the Supabase SQL Editor and Run. Idempotent; additive only.
--
-- 1. Ownership of linked records. The RLS insert/update policies only check
--    that the NEW row's user_id is the caller. A foreign key accepts any
--    existing id, so a crafted request could link one of your rows to a
--    composition / performance / costume that belongs to someone else.
--    These triggers reject any link whose parent isn't owned by the same user.
--    They run for every write path — server actions and the browser client.
--
-- 2. Media kind vs. file. Bucket limits (0015) allow the union of all types,
--    and per-kind checks lived only in the browser. This trigger looks up the
--    uploaded object itself and requires: it exists, it sits in the uploader's
--    own folder, and its stored MIME type matches the row's kind. The row's
--    mime_type / file_size are then taken from the object, not the client.
--    Existing rows are untouched; checks fire on insert, or when the
--    path / kind / link changes.

-- ---------------------------------------------------------------------------
-- Helper: does `owner` own row `id` in `tbl`? Runs as definer so it sees
-- the parent regardless of the caller's RLS (it only compares user_id).
-- ---------------------------------------------------------------------------
create or replace function public.kj_owns(tbl regclass, id uuid, owner text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  found boolean;
begin
  if id is null then
    return true;
  end if;
  execute format('select exists (select 1 from %s where id = $1 and user_id = $2)', tbl)
    into found
    using id, owner;
  return found;
end;
$$;

revoke all on function public.kj_owns(regclass, uuid, text) from public;

-- ---------------------------------------------------------------------------
-- Ownership triggers
-- ---------------------------------------------------------------------------
create or replace function public.kj_check_links()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_table_name in ('composition_media', 'composition_exam_levels', 'riyaz_recordings', 'performance_compositions') then
    if (tg_op = 'INSERT' or new.composition_id is distinct from old.composition_id)
       and not public.kj_owns('public.compositions', new.composition_id, new.user_id) then
      raise exception 'Composition not found' using errcode = '42501';
    end if;
  end if;

  if tg_table_name in ('performance_media', 'performance_compositions') then
    if (tg_op = 'INSERT' or new.performance_id is distinct from old.performance_id)
       and not public.kj_owns('public.performances', new.performance_id, new.user_id) then
      raise exception 'Performance not found' using errcode = '42501';
    end if;
  end if;

  if tg_table_name = 'performances' then
    if (tg_op = 'INSERT' or new.costume_id is distinct from old.costume_id)
       and not public.kj_owns('public.costumes', new.costume_id, new.user_id) then
      raise exception 'Costume not found' using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists kj_check_links on public.composition_media;
create trigger kj_check_links before insert or update on public.composition_media
  for each row execute function public.kj_check_links();

drop trigger if exists kj_check_links on public.composition_exam_levels;
create trigger kj_check_links before insert or update on public.composition_exam_levels
  for each row execute function public.kj_check_links();

drop trigger if exists kj_check_links on public.riyaz_recordings;
create trigger kj_check_links before insert or update on public.riyaz_recordings
  for each row execute function public.kj_check_links();

drop trigger if exists kj_check_links on public.performance_compositions;
create trigger kj_check_links before insert or update on public.performance_compositions
  for each row execute function public.kj_check_links();

drop trigger if exists kj_check_links on public.performance_media;
create trigger kj_check_links before insert or update on public.performance_media
  for each row execute function public.kj_check_links();

drop trigger if exists kj_check_links on public.performances;
create trigger kj_check_links before insert or update on public.performances
  for each row execute function public.kj_check_links();

-- ---------------------------------------------------------------------------
-- Media object integrity. TG_ARGV[0] = bucket id. Rows without a `kind`
-- column (riyaz_recordings) are always audio.
-- Allowed types mirror lib/media-config.ts.
-- ---------------------------------------------------------------------------
create or replace function public.kj_check_media_object()
returns trigger
language plpgsql
security definer
set search_path = public, storage
as $$
declare
  obj_meta jsonb;
  mime text;
  media_kind text;
  allowed text[];
begin
  if tg_op = 'UPDATE' and new.storage_path is not distinct from old.storage_path
     and (to_jsonb(new) ->> 'kind') is not distinct from (to_jsonb(old) ->> 'kind') then
    return new;
  end if;

  if (storage.foldername(new.storage_path))[1] is distinct from new.user_id then
    raise exception 'File is outside your folder' using errcode = '42501';
  end if;

  select o.metadata into obj_meta
  from storage.objects o
  where o.bucket_id = tg_argv[0] and o.name = new.storage_path;

  if not found then
    raise exception 'Uploaded file not found' using errcode = '23503';
  end if;

  mime := lower(trim(split_part(coalesce(obj_meta ->> 'mimetype', ''), ';', 1)));
  media_kind := coalesce(to_jsonb(new) ->> 'kind', 'audio');

  allowed := case media_kind
    when 'image' then array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
    when 'audio' then array['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/x-m4a']
    when 'video' then array['video/mp4', 'video/webm', 'video/quicktime']
    when 'pdf'   then array['application/pdf']
    else array[]::text[]
  end;

  if not (mime = any (allowed)) then
    raise exception 'File type "%" is not allowed for %', mime, media_kind
      using errcode = '22023';
  end if;

  -- Trust the stored object, not the client's claim.
  new.mime_type := coalesce(nullif(obj_meta ->> 'mimetype', ''), new.mime_type);
  if (obj_meta ->> 'size') ~ '^\d+$' then
    new.file_size := (obj_meta ->> 'size')::bigint;
  end if;

  return new;
end;
$$;

drop trigger if exists kj_check_media_object on public.composition_media;
create trigger kj_check_media_object before insert or update on public.composition_media
  for each row execute function public.kj_check_media_object('composition-media');

drop trigger if exists kj_check_media_object on public.performance_media;
create trigger kj_check_media_object before insert or update on public.performance_media
  for each row execute function public.kj_check_media_object('performance-media');

drop trigger if exists kj_check_media_object on public.riyaz_recordings;
create trigger kj_check_media_object before insert or update on public.riyaz_recordings
  for each row execute function public.kj_check_media_object('composition-media');
