-- 2026-09-11  기도제목 공개 범위 선택 (privacy)
--
-- notes.visibility 4단계 (기도제목에만 의미가 있음, 하루인사·감사노트는 기존 동작 유지):
--   private   나만 보기        — 작성자 본인만 (마이페이지에서만 보임, 피드에는 안 나옴)
--   staff     교역자·교사에게만 — is_admin / is_department_head / is_teacher + 작성자 본인
--   community 로그인한 지체에게 — 로그인한 사용자 전체 (기본값)
--   public    전체 공개        — 비로그인 방문자·공개 홈 포함 누구나
--
-- 지금까지는 기도제목 본문이 비로그인에게도 전부 보였음(작성자만 익명).
-- 기존 기도제목 113개는 안전하게 'community'로 백필한다. 원하면 개별/일괄로 public 전환 가능:
--   update notes set visibility='public' where type='prayer';   -- (되돌리려면 이렇게)
--
-- 재실행 안전.

alter table notes
  add column if not exists visibility text not null default 'community';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'notes_visibility_chk') then
    alter table notes add constraint notes_visibility_chk
      check (visibility in ('private','staff','community','public'));
  end if;
end $$;

-- 기존 기도제목: 안전한 기본값으로
update notes set visibility = 'community'
where type = 'prayer' and visibility is distinct from 'community';

-- ── get_public_notes: 기도제목만 visibility + 호출자 권한으로 필터 ─────────────
drop function if exists get_public_notes(integer);
drop function if exists get_public_notes(integer, integer, text);

create or replace function get_public_notes(
  p_limit integer default 60,
  p_offset integer default 0,
  p_type text default null
)
returns table(
  id bigint, type text, content text, image_urls text[],
  created_at timestamptz, nickname text, visibility text
)
language sql
security definer
set search_path = public
as $$
  with me as (
    select
      auth.uid() as uid,
      exists (
        select 1 from profiles p
        where p.user_id = auth.uid()
          and (coalesce(p.is_admin, false)
            or coalesce(p.is_department_head, false)
            or coalesce(p.is_teacher, false))
      ) as is_staff
  )
  select
    n.id, n.type, n.content, n.image_urls, n.created_at,
    case
      when n.type = 'prayer' then null
      when me.uid is not null then p.nickname
      else null
    end as nickname,
    n.visibility
  from notes n
  join profiles p on p.user_id = n.user_id
  cross join me
  where n.type in ('greeting', 'gratitude', 'prayer')
    and (p_type is null or n.type = p_type)
    and (
      n.type <> 'prayer'
      or n.visibility = 'public'
      or (n.visibility = 'community' and me.uid is not null)
      or (n.visibility = 'staff' and (me.is_staff or n.user_id = me.uid))
      -- 'private'(나만 보기)는 어떤 피드에도 노출하지 않는다. 작성자는 마이페이지에서만 본다.
    )
  order by n.created_at desc
  limit greatest(p_limit, 0)
  offset greatest(p_offset, 0);
$$;

grant execute on function get_public_notes(integer, integer, text) to anon, authenticated;

select 'get_public_notes + notes.visibility 갱신 완료' as status;
