-- 2026-11-20 In Odyssey 상점에서 쓸 수 없는 옷 3종 삭제 (전도사님 11/20 「지우자」)
-- 순례자 옷·목자 옷·축제 외투는 게임 상점 정의(SHOP)에 없고 겉옷은 공방에서 만든다.
-- 승인 대기(is_active=false)인 것만 지운다. 교환 기록의 item_id는 on delete set null.

-- 1) 지우기 전 확인: 대상과 교환 기록 수
select i.id, i.name, i.is_active, i.game_key,
       (select count(*) from shop_orders o where o.item_id = i.id) as orders
from shop_items i
where i.game_key in ('outfit-pilgrim', 'outfit-shepherd', 'outfit-festival');

-- 2) 삭제 (구매 기록이 없는 것만)
--    11/20 확인: 세 개 모두 is_active=true(판매 중)로 바뀌어 있었고 구매 0건.
--    게임 SHOP에는 여전히 없어 사도 쓸 수 없으므로 판매 중이어도 지운다.
delete from shop_items i
where i.game_key in ('outfit-pilgrim', 'outfit-shepherd', 'outfit-festival')
  and not exists (select 1 from shop_orders o where o.item_id = i.id)
returning id, name;
