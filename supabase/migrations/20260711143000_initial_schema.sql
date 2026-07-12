-- Kargopick initial schema

create table if not exists public.products (
  id text primary key,
  name text not null,
  description text not null,
  price numeric(12, 2) not null,
  original_price numeric(12, 2),
  category text not null check (category in ('protein', 'supplements', 'imported')),
  image text not null,
  badge text,
  rating numeric(3, 1) not null default 0,
  reviews integer not null default 0,
  stock integer not null default 0,
  in_stock boolean not null default true,
  weight text,
  origin text,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  customer_name text not null,
  phone text not null,
  address text not null,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(12, 2),
  discount numeric(12, 2),
  coupon_code text,
  total numeric(12, 2) not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.coupons (
  id text primary key,
  code text unique not null,
  type text not null check (type in ('percentage', 'fixed')),
  value numeric(12, 2) not null,
  min_order numeric(12, 2),
  max_uses integer,
  used_count integer not null default 0,
  expires_at timestamptz,
  active boolean not null default true,
  description text
);

create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_phone_idx on public.orders (phone);
create index if not exists coupons_code_idx on public.coupons (upper(code));

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.coupons enable row level security;

-- Public read for storefront
create policy "products_public_read" on public.products
  for select using (true);

create policy "coupons_public_read_active" on public.coupons
  for select using (active = true);

-- Service role bypasses RLS; anon has read-only product/coupon access above.
-- Orders are managed server-side via service role only (no public policies).
