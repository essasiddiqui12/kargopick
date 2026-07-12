-- Add multiple images support for products
alter table public.products
  add column if not exists images jsonb not null default '[]'::jsonb;

-- Backfill from existing single image column
update public.products
set images = jsonb_build_array(image)
where image is not null
  and image <> ''
  and (images is null or images = '[]'::jsonb);
