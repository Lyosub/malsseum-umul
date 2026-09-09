-- 2026-09-09  관리자 "학생 기록 관리"의 📮 건의사항 컬럼이 사라지는 문제 수정
--
-- 증상: admin.html "학생 기록 관리" 카드에서 건의사항 컬럼이 안 보임.
-- 원인: 클라이언트(admin.js loadAllNotes)가 get_all_notes_admin(p_limit:200)
--       한 번으로 모든 유형을 받아 유형별로 쪼갠다. 하루인사·감사노트·기도제목이
--       많이 쌓이면(친구초청잔치 기간 등) 건의사항이 최신 200개 창 밖으로 밀리고,
--       renderColumn 이 목록이 비면 컬럼 자체를 숨겨서 "사라진" 것처럼 보인다.
-- 해결: 건의사항만 넉넉히 따로 가져오는 전용 RPC. 작성자는 익명 처리(기존과 동일).
--       admin.js 는 이 결과로 건의사항 컬럼을 채우고, 비어 있어도 컬럼을 항상 노출한다.
--
-- 재실행 안전(idempotent): drop function if exists 후 create or replace.

drop function if exists get_suggestions_admin(integer);
create or replace function get_suggestions_admin(p_limit integer default 300)
returns table(
  id bigint, user_id uuid, nickname text, real_name text,
  type text, content text, image_urls text[], created_at timestamptz
)
language sql
security definer
set search_path = public
as $func$
  select n.id, n.user_id,
    null::text as nickname,
    null::text as real_name,
    n.type, n.content, n.image_urls, n.created_at
  from notes n
  where n.type = 'suggestion'
    and exists (
      select 1 from profiles admin_p
      where admin_p.user_id = auth.uid()
        and (admin_p.is_admin = true or admin_p.is_department_head = true)
    )
  order by n.created_at desc
  limit p_limit;
$func$;
