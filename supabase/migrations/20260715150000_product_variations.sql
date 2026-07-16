create table if not exists public.product_variations (
  id text primary key,
  product_id text not null references public.products(id) on delete cascade,
  type text not null check (type in ('flavor', 'size', 'color', 'weight', 'other')),
  value text not null,
  price_adjustment numeric(12, 2) not null default 0,
  image text,
  sku text,
  stock integer not null default 0,
  is_default boolean not null default false,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists product_variations_product_id_idx on public.product_variations(product_id);
create index if not exists product_variations_sort_idx on public.product_variations(sort_order);

alter table public.product_variations enable row level security;

drop policy if exists "product_variations_public_read_active" on public.product_variations;
create policy "product_variations_public_read_active"
  on public.product_variations
  for select
  to anon, authenticated
  using (is_active = true);

drop trigger if exists update_product_variations_updated_at on public.product_variations;
create trigger update_product_variations_updated_at
  before update on public.product_variations
  for each row execute function update_updated_at_column();
