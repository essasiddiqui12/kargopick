-- Generic Product Attributes & Variants System
-- Supports any product category with dynamic attributes

-- Global attribute definitions (e.g., Size, Color, Flavour, Material)
create table if not exists public.product_attributes (
  id text primary key,
  name text not null,
  display_name text not null,
  type text not null check (type in ('select', 'multiselect', 'text', 'number', 'boolean', 'color', 'date')),
  is_variant boolean not null default true,
  is_required boolean not null default false,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists product_attributes_sort_idx on public.product_attributes(sort_order);

-- Predefined values for select/multiselect/color attributes
create table if not exists public.product_attribute_values (
  id text primary key,
  attribute_id text not null references public.product_attributes(id) on delete cascade,
  value text not null,
  display_value text,
  meta_data jsonb,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists product_attribute_values_attr_idx on public.product_attribute_values(attribute_id);
create index if not exists product_attribute_values_sort_idx on public.product_attribute_values(sort_order);

-- Assign attributes to products
create table if not exists public.product_attribute_assignments (
  id text primary key,
  product_id text not null references public.products(id) on delete cascade,
  attribute_id text not null references public.product_attributes(id) on delete cascade,
  is_required boolean not null default false,
  is_variant boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_product_attribute unique (product_id, attribute_id)
);

create index if not exists product_attribute_assignments_product_idx on public.product_attribute_assignments(product_id);

-- Product variants (generated combinations)
create table if not exists public.product_variants (
  id text primary key,
  product_id text not null references public.products(id) on delete cascade,
  sku text,
  barcode text,
  price numeric(12, 2),
  stock integer not null default 0,
  weight text,
  image text,
  is_active boolean not null default true,
  is_default boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists product_variants_product_idx on public.product_variants(product_id);
create index if not exists product_variants_sort_idx on public.product_variants(sort_order);

-- Junction table: variant to attribute values
create table if not exists public.product_variant_values (
  variant_id text not null references public.product_variants(id) on delete cascade,
  attribute_value_id text not null references public.product_attribute_values(id) on delete cascade,
  primary key (variant_id, attribute_value_id)
);

create index if not exists product_variant_values_variant_idx on public.product_variant_values(variant_id);
create index if not exists product_variant_values_value_idx on public.product_variant_values(attribute_value_id);

-- RLS
alter table public.product_attributes enable row level security;
alter table public.product_attribute_values enable row level security;
alter table public.product_attribute_assignments enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_variant_values enable row level security;

-- Public read for active attributes and variants
drop policy if exists "product_attributes_public_read_active" on public.product_attributes;
create policy "product_attributes_public_read_active"
  on public.product_attributes
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "product_attribute_values_public_read_active" on public.product_attribute_values;
create policy "product_attribute_values_public_read_active"
  on public.product_attribute_values
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "product_attribute_assignments_public_read" on public.product_attribute_assignments;
create policy "product_attribute_assignments_public_read"
  on public.product_attribute_assignments
  for select
  to anon, authenticated
  using (true);

drop policy if exists "product_variants_public_read_active" on public.product_variants;
create policy "product_variants_public_read_active"
  on public.product_variants
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists "product_variant_values_public_read" on public.product_variant_values;
create policy "product_variant_values_public_read"
  on public.product_variant_values
  for select
  to anon, authenticated
  using (true);

-- Triggers for updated_at
drop trigger if exists update_product_attributes_updated_at on public.product_attributes;
create trigger update_product_attributes_updated_at
  before update on public.product_attributes
  for each row execute function update_updated_at_column();

drop trigger if exists update_product_attribute_assignments_updated_at on public.product_attribute_assignments;
create trigger update_product_attribute_assignments_updated_at
  before update on public.product_attribute_assignments
  for each row execute function update_updated_at_column();

drop trigger if exists update_product_variants_updated_at on public.product_variants;
create trigger update_product_variants_updated_at
  before update on public.product_variants
  for each row execute function update_updated_at_column();
