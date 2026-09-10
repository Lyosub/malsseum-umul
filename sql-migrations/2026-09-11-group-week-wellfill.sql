-- 2026-09-11  "이번 주 우리 오이코스가 함께 채운 우물"  (UX 리뷰 #6 v1)
--   점수 경쟁이 아니라 "이번 주 우리 오이코스 친구들이 함께 참여했다"는 경험을 보여준다.
--   글 길이·기도 내용은 전혀 평가하지 않고, "하루에 한 번이라도 참여" 여부만 센다.
--     참여 = 그 날 출석 체크했거나, 하루인사·감사노트·기도제목 중 하나라도 썼다.
--   반환:
--     member_count       오이코스 인원
--     participated_count  이번 주(월~일 KST) 한 번이라도 참여한 인원
--     footprints          이번 주 (사람 × 참여한 날) 합계 — 우물 수위를 더 잘게 표현
--     i_participated       나는 이번 주에 참여했는가
--   호출자가 그 오이코스 멤버가 아니면 0행.
-- 재실행 안전.

create or replace function get_group_week_wellfill(p_group_id bigint)
returns table(member_count int, participated_count int, footprints int, i_participated boolean)
language sql
security definer
set search_path = public
as $$
  with wk as (
    select
      (date_trunc('week', (now() at time zone 'Asia/Seoul')))::date as wstart,
      (now() at time zone 'Asia/Seoul')::date as wtoday
  ),
  mem as (
    select gm.user_id from group_members gm where gm.group_id = p_group_id
  ),
  activity as (
    select m.user_id, x.day
    from mem m
    cross join wk
    join lateral (
      select a."date" as day
        from attendance a
       where a.user_id = m.user_id and a."date" >= wk.wstart and a."date" <= wk.wtoday
      union
      select (n.created_at at time zone 'Asia/Seoul')::date as day
        from notes n
       where n.user_id = m.user_id
         and n.type in ('greeting','gratitude','prayer')
         and (n.created_at at time zone 'Asia/Seoul')::date >= wk.wstart
    ) x on true
  )
  select
    (select count(*) from mem)::int as member_count,
    (select count(distinct user_id) from activity)::int as participated_count,
    (select count(*) from (select distinct user_id, day from activity) d)::int as footprints,
    exists (select 1 from activity where user_id = auth.uid()) as i_participated
  where exists (select 1 from mem where user_id = auth.uid());
$$;

grant execute on function get_group_week_wellfill(bigint) to authenticated;

select 'get_group_week_wellfill 생성 완료' as status;
