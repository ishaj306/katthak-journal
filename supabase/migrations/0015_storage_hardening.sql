-- Kathak Journal — server-side Storage limits
-- Paste into the Supabase SQL Editor and Run. Idempotent.
--
-- The uploaders enforce file size and MIME type in the browser, but clients
-- write to Storage directly with the anon key, so those checks are bypassable.
-- Setting the limits on the bucket itself makes them enforced by Storage and
-- non-bypassable. The ceiling is the largest kind's limit (50MB audio/video);
-- the allowed MIME list is the union of every kind the app accepts.

update storage.buckets
set
  file_size_limit = 52428800, -- 50 MB
  allowed_mime_types = array[
    'image/png', 'image/jpeg', 'image/webp', 'image/gif',
    'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/webm',
    'audio/x-m4a',
    'video/mp4', 'video/webm', 'video/quicktime',
    'application/pdf'
  ]
where id in ('composition-media', 'performance-media');
