-- In Odyssey 「내 장막」 꾸미기 (2026-09-26)
-- 꾸밈 물건은 게임 아이템(shop_items.game_key = 'home-...')으로 한 번 사면 계속 가짐(작은 물건 여러 개·큰 물건 몇 개까지 놓기).
-- 무료 3종(항아리·짐 상자·장작)과 배지 보상 2종(두루마리 선반·소고)은 등록하지 않음(게임이 처리).
-- 말씀우물 일반 상점에는 game_key가 있는 물건이 나오지 않음(기존 규칙). 재실행해도 안전.
insert into shop_items (name, description, cost, is_active, sort_order, game_key) values
  ('[게임] 집 — 강돌',          'In Odyssey 내 장막 꾸미기', 5,  true, 950, 'home-env-river-stones'),
  ('[게임] 집 — 갈대',          'In Odyssey 내 장막 꾸미기', 5,  true, 951, 'home-env-reeds'),
  ('[게임] 집 — 우슬초 대야',   'In Odyssey 내 장막 꾸미기', 8,  true, 952, 'home-hyssop-basin'),
  ('[게임] 집 — 여행 보따리',   'In Odyssey 내 장막 꾸미기', 8,  true, 953, 'home-pilgrim-bundle'),
  ('[게임] 집 — 떨기나무',      'In Odyssey 내 장막 꾸미기', 10, true, 954, 'home-dry-bush'),
  ('[게임] 집 — 울타리',        'In Odyssey 내 장막 꾸미기', 10, true, 955, 'home-fence'),
  ('[게임] 집 — 물구유',        'In Odyssey 내 장막 꾸미기', 12, true, 956, 'home-water-trough'),
  ('[게임] 집 — 모닥불',        'In Odyssey 내 장막 꾸미기', 12, true, 957, 'home-campfire'),
  ('[게임] 집 — 지파 깃발',     'In Odyssey 내 장막 꾸미기', 15, true, 958, 'home-tribe-banner'),
  ('[게임] 집 — 화로',          'In Odyssey 내 장막 꾸미기', 15, true, 959, 'home-palace-brazier'),
  ('[게임] 집 — 어린 양',       'In Odyssey 내 장막 꾸미기', 20, true, 960, 'home-lamb'),
  ('[게임] 집 — 유월절 식탁',   'In Odyssey 내 장막 꾸미기', 25, true, 961, 'home-passover-table'),
  ('[게임] 집 — 아카시아 나무', 'In Odyssey 내 장막 꾸미기', 25, true, 962, 'home-env-acacia'),
  ('[게임] 집 — 그늘막',        'In Odyssey 내 장막 꾸미기', 30, true, 963, 'home-weaving-shade'),
  ('[게임] 집 — 야자수',        'In Odyssey 내 장막 꾸미기', 30, true, 964, 'home-palm'),
  ('[게임] 집 — 작은 장막',     'In Odyssey 내 장막 꾸미기', 30, true, 965, 'home-tent-small'),
  ('[게임] 집 — 우물',          'In Odyssey 내 장막 꾸미기', 35, true, 966, 'home-well'),
  ('[게임] 집 — 낙타',          'In Odyssey 내 장막 꾸미기', 40, true, 967, 'home-camel'),
  ('[게임] 집 — 장막',          'In Odyssey 내 장막 꾸미기', 40, true, 968, 'home-tent-mid')
on conflict (game_key) where game_key is not null do nothing;

-- 배치 저장: 사람마다 한 줄(물건 목록 JSON). 나중에 "친구 장막 놀러 가기"에서 읽음
create table if not exists odyssey_home (
  user_id uuid primary key references auth.users(id) on delete cascade,
  layout jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
alter table odyssey_home enable row level security;   -- 직접 접근 없음(함수로만)

create or replace function public.save_odyssey_home(p_layout jsonb)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not public.can_see_odyssey() then return false; end if;
  if jsonb_typeof(p_layout) <> 'array' or jsonb_array_length(p_layout) > 80 or length(p_layout::text) > 12000 then return false; end if;
  insert into odyssey_home (user_id, layout) values (auth.uid(), p_layout)
  on conflict (user_id) do update set layout = excluded.layout, updated_at = now();
  return true;
end $$;

-- p_user 가 없으면 내 장막. 다른 사람 장막은 시험 참여자·관리자끼리만
create or replace function public.get_odyssey_home(p_user uuid default null)
returns jsonb language sql stable security definer set search_path = public as $$
  select case when public.can_see_odyssey() then
    (select layout from odyssey_home where user_id = coalesce(p_user, auth.uid())) end;
$$;

revoke all on function public.save_odyssey_home(jsonb) from public, anon;
revoke all on function public.get_odyssey_home(uuid) from public, anon;
grant execute on function public.save_odyssey_home(jsonb) to authenticated;
grant execute on function public.get_odyssey_home(uuid) to authenticated;
