-- 2026-09-25 In Odyssey 머리 모양 6종(40달란트). 기본 2종(곱슬 짧은 머리·긴 생머리)은 무료라 등록하지 않음.
-- 3D 모델이 준비될 때까지 is_active = false(판매 꺼 둠). 준비되면 해당 game_key만 true로 바꾼다.
-- 재실행해도 안전(game_key 유니크 → do nothing).
insert into shop_items (name, description, cost, is_active, sort_order, game_key) values
  ('[게임] 스포츠머리', 'In Odyssey — 짧고 단정한 스포츠머리', 40, false, 931, 'hair-boy-sports'),
  ('[게임] 옆가르마',   'In Odyssey — 이마를 살짝 덮는 옆가르마', 40, false, 932, 'hair-boy-side'),
  ('[게임] 덮머리',     'In Odyssey — 앞머리가 눈썹까지 내려오는 머리', 40, false, 933, 'hair-boy-bangs'),
  ('[게임] 포니테일',   'In Odyssey — 뒤로 높게 묶은 머리', 40, false, 934, 'hair-girl-ponytail'),
  ('[게임] 단발',       'In Odyssey — 턱선 길이 단발', 40, false, 935, 'hair-girl-bob'),
  ('[게임] 땋은 머리',  'In Odyssey — 한쪽으로 넘긴 땋은 머리', 40, false, 936, 'hair-girl-braid')
on conflict (game_key) where game_key is not null do nothing;
select 'ok — odyssey hair' as status;
