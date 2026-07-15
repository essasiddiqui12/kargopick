alter table public.products drop constraint if exists products_category_check;
update public.products set category = 'gym-essentials' where category in ('protein', 'supplements');
alter table public.products add constraint products_category_check check (category in ('gym-essentials', 'imported'));
