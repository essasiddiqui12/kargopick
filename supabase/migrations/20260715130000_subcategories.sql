create table if not exists public.subcategories (
  id text primary key,
  name text not null,
  description text not null default '',
  parent_category text not null references public.categories(id) on delete cascade,
  icon text not null default '📦',
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subcategories_parent_idx on public.subcategories(parent_category);
create index if not exists subcategories_sort_idx on public.subcategories(sort_order);

alter table public.subcategories enable row level security;

drop policy if exists "subcategories_public_read_active" on public.subcategories;
create policy "subcategories_public_read_active"
  on public.subcategories
  for select
  to anon, authenticated
  using (is_active = true);

alter table public.products add column if not exists subcategory text;

drop trigger if exists update_subcategories_updated_at on public.subcategories;
create trigger update_subcategories_updated_at
  before update on public.subcategories
  for each row execute function update_updated_at_column();
