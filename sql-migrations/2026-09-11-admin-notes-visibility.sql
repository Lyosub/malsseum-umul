-- 2026-09-11  관리자 노트 조회에 visibility 노출
--   get_all_notes_admin / get_member_notes_admin 는 원래도 visibility 와 무관하게
--   모든 노트를 반환한다(관리자·부장 권한 체크만 함). 여기서는 반환 컬럼에 visibility 를
--   추가해, 교역자가 각 기도제목의 공개 범위(나만/교역자/지체/전체)를 알 수 있게만 한다.
--   로직·권한 체크는 기존과 동일. 재실행 안전.

drop function if exists get_all_notes_admin(integer);
create or replace function get_all_notes_admin(p_limit integer default 200)
returns table(
  id bigint, user_id uuid, nickname text, real_name text,
  type text, content text, image_urls text[], created_at timestamptz, visibility text
)
language sql
security definer
set search_path = public
as $$
  select n.id, n.user_id,
    case when n.type = 'suggestion' then null else p.nickname end,
    case
      when n.type = 'suggestion' then null
      when exists (select 1 from profiles ap where ap.user_id = auth.uid() and ap.is_admin = true) then p.real_name
      else null
    end,
    n.type, n.content, n.image_urls, n.created_at, n.visibility
  from notes n
  join profiles p on p.user_id = n.user_id
  where exists (
    select 1 from profiles admin_p where admin_p.user_id = auth.uid() and (admin_p.is_admin = true or admin_p.is_department_head = true)
  )
  order by n.created_at desc
  limit p_limit;
$$;

drop function if exists get_member_notes_admin(uuid, integer);
create or replace function get_member_notes_admin(p_user_id uuid, p_limit integer default 200)
returns table(id bigint, type text, content text, image_urls text[], created_at timestamptz, visibility text)
language sql
security definer
set search_path = public
as $$
  select n.id, n.type, n.content, n.image_urls, n.created_at, n.visibility
  from notes n
  where n.user_id = p_user_id
    and n.type <> 'suggestion'
    and exists (select 1 from profiles ap where ap.user_id = auth.uid() and (ap.is_admin = true or ap.is_department_head = true))
  order by n.created_at desc
  limit p_limit;
$$;

select 'admin 노트 조회에 visibility 추가 완료' as status;
