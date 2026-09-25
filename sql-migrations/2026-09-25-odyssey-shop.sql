-- 2026-09-25 In Odyssey(성경 모험 게임) 상점 · 장 완료 달란트
-- 1) 게임 아이템(옷·지팡이·펫)을 기존 달란트 상점 상품(shop_items)으로 등록하고, 게임에서 사면
--    "즉시 전달 완료(delivered)" 교환 기록(shop_orders)으로 남긴다.
--    → 잔액을 계산하는 모든 곳(get_talent_balance·마이페이지·랭킹·오이코스 등 6군데)이
--      shop_orders를 이미 빼고 있으므로 따로 고칠 곳이 없고, points_ledger는 건드리지 않는다.
-- 2) 장(章)을 처음 완료하면 계정당 한 번 20달란트: points_ledger 에 action_type 'odyssey_chapter'.
--    ※ 부분 유니크 인덱스 points_ledger_auto_uniq(where action_type <> 'admin_award')는 그대로 둔다.
--      아래 insert 의 on conflict predicate 는 그 인덱스와 정확히 같아야 한다.
-- 재실행해도 안전(idempotent).

-- ── 1. 상품 표: 게임 아이템 표시 ─────────────────────────────
alter table shop_items add column if not exists game_key text;
create unique index if not exists shop_items_game_key_uniq on shop_items (game_key) where game_key is not null;

-- ── 2. 일반 상점 목록에서는 게임 아이템을 뺀다(관리자 전체 보기에는 보임) ──
create or replace function public.get_shop_items(p_all boolean default false)
 returns table(id bigint, name text, description text, cost integer, stock integer, is_active boolean, sort_order integer, is_oikos boolean, price_won integer)
 language sql
 security definer
 set search_path to 'public'
as $function$
  select i.id, i.name, i.description, i.cost, i.stock, i.is_active, i.sort_order,
         coalesce(i.is_oikos, false), i.price_won
  from shop_items i
  where auth.uid() is not null
    and (
      (not p_all and i.is_active and not coalesce(i.is_oikos, false) and i.game_key is null)
      or (p_all and exists (select 1 from profiles p where p.user_id = auth.uid() and (p.is_admin or p.is_department_head)))
    )
  order by i.sort_order, i.id;
$function$;

-- ── 3. 일반 교환 신청으로는 게임 아이템을 살 수 없게(달란트만 빠지고 아이템은 안 생기는 일 방지) ──
create or replace function public.request_shop_order(p_item_id bigint, p_note text default null::text)
 returns bigint
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_item shop_items;
  v_balance integer;
  v_order_id bigint;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  select * into v_item from shop_items where id = p_item_id;
  if v_item.id is null or not v_item.is_active then raise exception '지금은 교환할 수 없는 상품이에요.'; end if;
  if v_item.game_key is not null then raise exception '이 아이템은 In Odyssey 게임 안에서 살 수 있어요.'; end if;
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
$function$;

-- ── 4. 게임 상점: 목록(가진 것 표시) · 사기 ─────────────────────
create or replace function public.get_odyssey_shop()
 returns table(game_key text, name text, description text, cost integer, owned boolean, balance integer)
 language sql
 security definer
 set search_path to 'public'
as $function$
  select i.game_key, i.name, i.description, i.cost,
         exists (select 1 from shop_orders o where o.user_id = auth.uid() and o.item_id = i.id and o.status = 'delivered'),
         get_talent_balance()
  from shop_items i
  where auth.uid() is not null and i.game_key is not null and i.is_active
  order by i.sort_order, i.id;
$function$;

create or replace function public.buy_odyssey_item(p_key text)
 returns integer
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_item shop_items;
  v_balance integer;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  perform pg_advisory_xact_lock(hashtext('odyssey-buy:' || auth.uid()::text));   -- 두 번 눌러도 한 번만
  select * into v_item from shop_items where game_key = p_key;
  if v_item.id is null or not v_item.is_active then raise exception '지금은 살 수 없는 아이템이에요.'; end if;
  if exists (select 1 from shop_orders where user_id = auth.uid() and item_id = v_item.id and status = 'delivered') then
    raise exception '이미 가지고 있는 아이템이에요.';
  end if;
  select get_talent_balance() into v_balance;
  if v_balance < v_item.cost then raise exception '달란트가 부족해요.'; end if;
  insert into shop_orders (user_id, item_id, item_name, cost_snapshot, status, admin_note, decided_at)
  values (auth.uid(), v_item.id, v_item.name, v_item.cost, 'delivered', 'In Odyssey 게임 안에서 구매(자동 전달)', now());
  return v_balance - v_item.cost;
end;
$function$;

-- ── 5. 장 완료 달란트(계정당 장마다 한 번) ───────────────────────
alter table points_ledger drop constraint if exists points_ledger_action_type_check;
alter table points_ledger add constraint points_ledger_action_type_check
  check (action_type = any (array[
    'attendance','streak_bonus','note','quiz','group_attendance_bonus','group_notes_bonus',
    'admin_award','greeting_draw','book_game','book_game_ot','book_game_nt',
    'match_game_books','match_game_figures','oikos_expense','badge_award','devotion',
    'oikos_donation','oikos_distribute',
    'verse_memory','chosung_quiz','qt_reflection','devotion_streak',
    'verse_card_daily','verse_card_weekly','verse_card_monthly',
    'ox_quiz',
    'sermon_line',
    'odyssey_chapter'
  ]));

create or replace function public.claim_odyssey_chapter(p_ch integer)
 returns integer
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_n integer;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  if p_ch < 1 or p_ch > 2 then raise exception '아직 없는 장이에요.'; end if;   -- 새 장을 열 때 최댓값을 올린다
  -- ref_date 로 장을 구분(2000-01-01 + 장 번호) → 같은 장은 한 번만 적립
  insert into points_ledger (user_id, action_type, points, ref_date, note)
  values (auth.uid(), 'odyssey_chapter', 20, date '2000-01-01' + p_ch, 'In Odyssey ' || p_ch || '장 완료')
  on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;
  get diagnostics v_n = row_count;
  return case when v_n > 0 then 20 else 0 end;
end;
$function$;

grant execute on function public.get_odyssey_shop() to authenticated;
grant execute on function public.buy_odyssey_item(text) to authenticated;
grant execute on function public.claim_odyssey_chapter(integer) to authenticated;

-- ── 6. 게임 아이템 등록(가격: 지팡이 30 · 펫 50 · 옷 80) ─────────────
insert into shop_items (name, description, cost, is_active, sort_order, game_key) values
  ('[게임] 순례자 옷',        'In Odyssey — 초록 두건 순례자 옷',            80, true, 901, 'outfit-pilgrim'),
  ('[게임] 목자 옷',          'In Odyssey — 양을 치는 목자의 옷',             80, true, 902, 'outfit-shepherd'),
  ('[게임] 축제 외투',        'In Odyssey — 빨강·금색 축제 외투',             80, true, 903, 'outfit-festival'),
  ('[게임] 목자 지팡이',      'In Odyssey — 끝이 굽은 목자 지팡이',           30, true, 911, 'staff-shepherd'),
  ('[게임] 싹 난 지팡이',     'In Odyssey — 아론의 싹 난 지팡이(민수기 17장)', 30, true, 912, 'staff-budding'),
  ('[게임] 갈래 지팡이',      'In Odyssey — 끝이 두 갈래인 지팡이',           30, true, 913, 'staff-forked'),
  ('[게임] 자작나무 지팡이',  'In Odyssey — 하얀 자작나무 지팡이',            30, true, 914, 'staff-birch'),
  ('[게임] 나귀',             'In Odyssey — 함께 다니는 나귀',                50, true, 921, 'pet-donkey'),
  ('[게임] 비둘기',           'In Odyssey — 함께 다니는 비둘기',              50, true, 922, 'pet-dove'),
  ('[게임] 강아지',           'In Odyssey — 함께 다니는 강아지',              50, true, 923, 'pet-puppy')
on conflict (game_key) where game_key is not null do nothing;

select 'ok — odyssey shop' as status;
