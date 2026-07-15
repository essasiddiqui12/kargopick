create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  product_id text not null references public.products(id) on delete cascade,
  customer_name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  review_text text not null,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

drop policy if exists "reviews_public_read_approved" on public.reviews;
drop policy if exists "reviews_public_insert" on public.reviews;

create policy "reviews_public_read_approved"
  on public.reviews
  for select
  to anon, authenticated
  using (is_approved = true);

create policy "reviews_public_insert"
  on public.reviews
  for insert
  to anon, authenticated
  with check (true);

create or replace function public.get_product_reviews(product_id text)
returns setof public.reviews
language sql
stable
as $$
  select *
  from public.reviews
  where product_id = $1
    and is_approved = true
  order by created_at desc;
$$;

create or replace function public.get_product_avg_rating(product_id text)
returns numeric
language sql
stable
as $$
  select coalesce(avg(rating), 0)
  from public.reviews
  where product_id = $1
    and is_approved = true;
$$;
