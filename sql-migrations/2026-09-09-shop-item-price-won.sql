-- 2026-09-09  달란트 상점 상품에 "실물 금액(원)" 선택 필드 추가
-- 지금은 "1만원권" 같은 정보를 설명란에 자유 텍스트로만 넣을 수 있었다.
-- price_won(원 단위, 선택)을 두어 목록에 "· 1만원 상당" 식으로 표시한다.
-- 재실행 안전: add column if not exists / create or replace.

alter table shop_items add column if not exists price_won integer check (price_won is null or price_won >= 0);

-- get_shop_items : price_won 반환 추가
drop function if exists get_shop_items(boolean);
create or replace function get_shop_items(p_all boolean default false)
returns table(id bigint, name text, description text, cost integer, stock integer, is_active boolean, sort_order integer, is_oikos boolean, price_won integer)
language sql
security definer
set search_path = public
as $func$
  select i.id, i.name, i.description, i.cost, i.stock, i.is_active, i.sort_order,
         coalesce(i.is_oikos, false), i.price_won
  from shop_items i
  where auth.uid() is not null
    and (
      (not p_all and i.is_active and not coalesce(i.is_oikos, false))
      or (p_all and exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin or p.is_department_head)))
    )
  order by i.sort_order, i.id;
$func$;

-- get_oikos_shop_items : price_won 반환 추가
drop function if exists get_oikos_shop_items();
create or replace function get_oikos_shop_items()
returns table(id bigint, name text, description text, cost integer, sort_order integer, price_won integer)
language sql
security definer
set search_path = public
as $func$
  select i.id, i.name, i.description, i.cost, i.sort_order, i.price_won
  from shop_items i
  where auth.uid() is not null and i.is_active and coalesce(i.is_oikos, false)
  order by i.sort_order, i.id;
$func$;
