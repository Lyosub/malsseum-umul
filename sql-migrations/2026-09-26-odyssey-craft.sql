-- In Odyssey 브살렐의 공방 (2026-09-26)
-- 1) 공방에서 만드는 물건 13개를 게임 아이템(shop_items.game_key 'craft-…')으로 등록.
--    값(cost)은 "만드는 값" — 재료는 게임 안(기기)에서 확인하고, 달란트는 buy_odyssey_item 으로 빠짐(기존 구매 흐름 그대로).
--    일반 달란트 상점 목록·교환 신청에는 게임 아이템이 나오지 않음(get_shop_items / request_shop_order 가 game_key 로 이미 막음).
-- 2) 업적 키 목록 끝에 새 배지 2개(우상을 깨뜨린 손 · 지혜로운 손) 추가 — 기존 번호는 그대로.
-- 재실행해도 안전(idempotent).

insert into shop_items (name, description, cost, is_active, sort_order, game_key) values
  ('[게임] 공방 — 조각목 지팡이',   'In Odyssey 브살렐의 공방', 10, true, 980, 'craft-staff-acacia'),
  ('[게임] 공방 — 놋 장식 지팡이',  'In Odyssey 브살렐의 공방', 20, true, 981, 'craft-staff-bronze'),
  ('[게임] 공방 — 은 손잡이 지팡이', 'In Odyssey 브살렐의 공방', 30, true, 982, 'craft-staff-silver'),
  ('[게임] 공방 — 호마노 지팡이',   'In Odyssey 브살렐의 공방', 40, true, 983, 'craft-staff-onyx'),
  ('[게임] 공방 — 가는 베 띠',      'In Odyssey 브살렐의 공방', 10, true, 984, 'craft-sash-linen'),
  ('[게임] 공방 — 청색 술 띠',      'In Odyssey 브살렐의 공방', 20, true, 985, 'craft-sash-blue'),
  ('[게임] 공방 — 양털 겉옷',       'In Odyssey 브살렐의 공방', 25, true, 986, 'craft-robe-wool'),
  ('[게임] 공방 — 자색 망토',       'In Odyssey 브살렐의 공방', 40, true, 987, 'craft-cloak-purple'),
  ('[게임] 공방 — 파피루스 신',     'In Odyssey 브살렐의 공방', 10, true, 988, 'craft-shoes-papyrus'),
  ('[게임] 공방 — 광야 여행자 신',  'In Odyssey 브살렐의 공방', 25, true, 989, 'craft-shoes-travel'),
  ('[게임] 공방 — 베 두건',         'In Odyssey 브살렐의 공방', 10, true, 990, 'craft-head-linen'),
  ('[게임] 공방 — 염소털 머리띠',   'In Odyssey 브살렐의 공방', 15, true, 991, 'craft-head-goat'),
  ('[게임] 공방 — 금 머리띠',       'In Odyssey 브살렐의 공방', 35, true, 992, 'craft-head-gold')
on conflict (game_key) where game_key is not null
do update set name = excluded.name, description = excluded.description, cost = excluded.cost, sort_order = excluded.sort_order;

create or replace function public.claim_odyssey_achieve(p_key text)
returns integer language plpgsql security definer set search_path = public as $$
declare v_idx int; v_pts int; v_n integer;
  keys text[] := array['badge-wise','badge-pray_start','badge-companion','badge-prayer','badge-share','badge-trust',
                       'badge-true_heart','badge-passover_lamb','badge-bold_step','badge-together','badge-timbrel','badge-scroll_all',
                       'scroll-alpha','scroll-midian','scroll-egypt','scroll-redsea','badge-daily_bread',
                       'badge-raised_hands','badge-true_leader','badge-ten_words',
                       'badge-idol_breaker','badge-craftsman'];
begin
  if auth.uid() is null or not public.can_see_odyssey() then return 0; end if;
  v_idx := array_position(keys, p_key);
  if v_idx is null then return 0; end if;
  v_pts := case when p_key like 'scroll-%' then 10 else 3 end;
  insert into points_ledger (user_id, action_type, points, ref_date, note)
  values (auth.uid(), 'odyssey_achieve', v_pts, date '2000-01-01' + v_idx, 'In Odyssey 업적: ' || p_key)
  on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;
  get diagnostics v_n = row_count;
  return case when v_n > 0 then v_pts else 0 end;
end $$;
