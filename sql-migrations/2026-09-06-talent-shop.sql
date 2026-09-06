-- 2026-09-06 달란트 상점(교환소)
-- 학생이 모은 달란트로 상품을 교환 신청 → 교역자·부장이 승인/거절 → 승인 시 전달.
-- 달란트 차감은 신청 즉시(잔액 = 적립합계 - pending/approved/delivered 주문 비용 합계).
-- 거절하면 그 주문은 잔액에서 빠지므로 달란트가 자동으로 돌아온다.
--
-- Supabase 대시보드 → SQL Editor에 붙여넣고 Run. 마지막 status 줄이 뜨면 성공.

create table if not exists shop_items (
  id bigint generated always as identity primary key,
  name text not null,
  description text,
  cost integer not null check (cost > 0),
  stock integer,                          -- null = 무제한
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
alter table shop_items enable row level security;

drop policy if exists "상품 조회" on shop_items;
create policy "상품 조회" on shop_items
  for select using (auth.uid() is not null);

drop policy if exists "관리자·부장 상품 작성" on shop_items;
create policy "관리자·부장 상품 작성" on shop_items
  for insert with check (exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin or p.is_department_head)));

drop policy if exists "관리자·부장 상품 수정" on shop_items;
create policy "관리자·부장 상품 수정" on shop_items
  for update using (exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin or p.is_department_head)))
  with check (exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin or p.is_department_head)));

drop policy if exists "관리자·부장 상품 삭제" on shop_items;
create policy "관리자·부장 상품 삭제" on shop_items
  for delete using (exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin or p.is_department_head)));

create table if not exists shop_orders (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id bigint references shop_items(id) on delete set null,
  item_name text not null,
  cost_snapshot integer not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'delivered')),
  student_note text,
  admin_note text,
  decided_by uuid references auth.users(id),
  decided_at timestamptz,
  created_at timestamptz not null default now()
);
alter table shop_orders enable row level security;

drop policy if exists "본인·관리자 주문 조회" on shop_orders;
create policy "본인·관리자 주문 조회" on shop_orders
  for select using (
    auth.uid() = user_id
    or exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin or p.is_department_head))
  );
-- insert/update는 아래 함수(SECURITY DEFINER)로만.

-- 쓸 수 있는 달란트 잔액
create or replace function get_talent_balance()
returns integer
language sql
security definer
set search_path = public
as $$
  select coalesce((select sum(points) from points_ledger where user_id = auth.uid()), 0)
       - coalesce((select sum(cost_snapshot) from shop_orders
                   where user_id = auth.uid() and status in ('pending', 'approved', 'delivered')), 0);
$$;

-- 상품 목록 (학생: 활성만 / 관리자·부장: p_all=true로 전부)
create or replace function get_shop_items(p_all boolean default false)
returns table(id bigint, name text, description text, cost integer, stock integer, is_active boolean, sort_order integer)
language sql
security definer
set search_path = public
as $$
  select i.id, i.name, i.description, i.cost, i.stock, i.is_active, i.sort_order
  from shop_items i
  where auth.uid() is not null
    and (
      (not p_all and i.is_active)
      or (p_all and exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin or p.is_department_head)))
    )
  order by i.sort_order, i.id;
$$;

-- 교환 신청
create or replace function request_shop_order(p_item_id bigint, p_note text default null)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item shop_items;
  v_balance integer;
  v_order_id bigint;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  select * into v_item from shop_items where id = p_item_id;
  if v_item.id is null or not v_item.is_active then raise exception '지금은 교환할 수 없는 상품이에요.'; end if;
  if v_item.stock is not null and v_item.stock <= 0 then raise exception '재고가 없어요.'; end if;
  select get_talent_balance() into v_balance;
  if v_balance < v_item.cost then raise exception '달란트가 부족해요.'; end if;

  insert into shop_orders (user_id, item_id, item_name, cost_snapshot, student_note)
  values (auth.uid(), v_item.id, v_item.name, v_item.cost, nullif(trim(p_note), ''))
  returning id into v_order_id;

  if v_item.stock is not null then
    update shop_items set stock = stock - 1 where id = v_item.id;
  end if;
  return v_order_id;
end;
$$;

-- 내 교환 내역
create or replace function get_my_shop_orders()
returns table(id bigint, item_name text, cost_snapshot integer, status text, student_note text, admin_note text, created_at timestamptz, decided_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select o.id, o.item_name, o.cost_snapshot, o.status, o.student_note, o.admin_note, o.created_at, o.decided_at
  from shop_orders o
  where o.user_id = auth.uid()
  order by o.created_at desc;
$$;

-- 관리자·부장: 교환 요청 목록 (pending 먼저)
create or replace function get_shop_orders_admin(p_status text default null)
returns table(id bigint, user_id uuid, nickname text, real_name text, item_name text, cost_snapshot integer, status text, student_note text, admin_note text, created_at timestamptz, decided_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select o.id, o.user_id, pr.nickname,
    case when exists (select 1 from profiles ap where ap.user_id = auth.uid() and ap.is_admin) then pr.real_name else null end,
    o.item_name, o.cost_snapshot, o.status, o.student_note, o.admin_note, o.created_at, o.decided_at
  from shop_orders o
  join profiles pr on pr.user_id = o.user_id
  where exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin or p.is_department_head))
    and (p_status is null or o.status = p_status)
  order by (o.status = 'pending') desc, o.created_at desc
  limit 200;
$$;

-- 관리자·부장: 승인 / 거절 / 전달완료
create or replace function decide_shop_order(p_order_id bigint, p_action text, p_note text default null)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order shop_orders;
begin
  if not exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin or p.is_department_head)) then
    raise exception '권한이 없어요.';
  end if;
  select * into v_order from shop_orders where id = p_order_id;
  if v_order.id is null then raise exception '주문을 찾을 수 없어요.'; end if;

  if p_action = 'approve' then
    if v_order.status <> 'pending' then raise exception '이미 처리된 주문이에요.'; end if;
    update shop_orders set status = 'approved', admin_note = nullif(trim(p_note), ''), decided_by = auth.uid(), decided_at = now() where id = p_order_id;
  elsif p_action = 'reject' then
    if v_order.status not in ('pending', 'approved') then raise exception '이미 처리된 주문이에요.'; end if;
    update shop_orders set status = 'rejected', admin_note = nullif(trim(p_note), ''), decided_by = auth.uid(), decided_at = now() where id = p_order_id;
    if v_order.item_id is not null then
      update shop_items set stock = stock + 1 where id = v_order.item_id and stock is not null;
    end if;
  elsif p_action = 'deliver' then
    if v_order.status <> 'approved' then raise exception '승인된 주문만 전달완료로 바꿀 수 있어요.'; end if;
    update shop_orders set status = 'delivered', decided_by = auth.uid(), decided_at = now() where id = p_order_id;
  else
    raise exception '잘못된 동작이에요.';
  end if;
  return true;
end;
$$;

-- 시작용 상품 몇 개 (기준: 1달란트 ≈ 50원). 상품이 하나도 없을 때만 넣는다.
insert into shop_items (name, description, cost, stock, sort_order)
select v.name, v.description, v.cost, v.stock, v.sort_order
from (values
  ('문화상품권 5,000원', '5천원권 문화상품권 (다음 주일에 전달)', 100, null::integer, 10),
  ('문화상품권 10,000원', '1만원권 문화상품권 (다음 주일에 전달)', 200, null::integer, 20),
  ('간식 교환권', '중등부 간식 하나 골라 먹기', 15, null::integer, 30),
  ('음료 교환권', '편의점 음료 1개', 30, null::integer, 40),
  ('예배 앞자리 지정권', '다음 주일 예배 때 앉고 싶은 앞자리 지정', 20, null::integer, 50)
) as v(name, description, cost, stock, sort_order)
where not exists (select 1 from shop_items);

select 'shop_items / shop_orders + 함수 6개 + 시작 상품 생성 완료' as status;
