create table if not exists public.delivery_zones (
  id bigint generated always as identity primary key,
  pincode text not null unique,
  city text not null,
  state text not null,
  zone text not null,
  delivery_days integer not null default 3,
  cod_available boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.delivery_zones enable row level security;

create policy "delivery_zones_public_read"
  on public.delivery_zones
  for select
  to anon, authenticated
  using (is_active = true);

create or replace function public.match_pincode(search text)
returns setof public.delivery_zones
language sql
stable
as $$
  select *
  from public.delivery_zones
  where is_active = true
    and (
      pincode = search
      or pincode like search || '%'
      or pincode like '%' || search || '%'
    )
  order by
    case
      when pincode = search then 0
      when pincode like search || '%' then 1
      else 2
    end
  limit 5;
$$;
