create table if not exists public.promotional_banners (
  id bigint generated always as identity primary key,
  title text not null,
  subtitle text,
  cta_text text,
  cta_url text not null,
  desktop_image text not null,
  mobile_image text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.promotional_banners enable row level security;

drop policy if exists "banners_public_read_active" on public.promotional_banners;

create policy "banners_public_read_active"
  on public.promotional_banners
  for select
  to anon, authenticated
  using (
    is_active = true
    and (start_date is null or start_date <= now())
    and (end_date is null or end_date >= now())
  );

create or replace function public.get_active_banners()
returns setof public.promotional_banners
language sql
stable
as $$
  select *
  from public.promotional_banners
  where is_active = true
    and (start_date is null or start_date <= now())
    and (end_date is null or end_date >= now())
  order by sort_order asc, created_at desc;
$$;

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_promotional_banners_updated_at on public.promotional_banners;
create trigger update_promotional_banners_updated_at
  before update on public.promotional_banners
  for each row execute function public.update_updated_at();
