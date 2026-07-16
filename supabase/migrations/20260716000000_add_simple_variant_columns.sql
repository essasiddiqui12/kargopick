alter table if exists public.product_variants
  add column if not exists type text not null default 'other' check (type in ('flavor', 'size', 'weight', 'color', 'other'));

alter table if exists public.product_variants
  add column if not exists value text not null default '';

alter table if exists public.product_variants
  add column if not exists price_adjustment numeric(12,2) not null default 0;
