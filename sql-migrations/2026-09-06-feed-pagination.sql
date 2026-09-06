-- 2026-09-06 실시간 나눔(feed.html) 이전 기록 "더 보기" 지원
-- get_public_notes 에 p_offset(건너뛸 개수) + p_type(종류 필터) 인자 추가.
-- 인자에 기본값이 있어 기존 호출( {p_limit: N} )은 그대로 동작한다.
--
-- Supabase 대시보드 → SQL Editor에 붙여넣고 Run. 마지막 status 줄이 뜨면 성공.

drop function if exists get_public_notes(integer);
drop function if exists get_public_notes(integer, integer, text);

create or replace function get_public_notes(
  p_limit integer default 60,
  p_offset integer default 0,
  p_type text default null
)
returns table(id bigint, type text, content text, image_urls text[], created_at timestamptz, nickname text)
language sql
security definer
set search_path = public
as $$
  select
    n.id, n.type, n.content, n.image_urls, n.created_at,
    case
      when n.type = 'prayer' then null
      when auth.uid() is not null then p.nickname
      else null
    end as nickname
  from notes n
  join profiles p on p.user_id = n.user_id
  where n.type in ('greeting', 'gratitude', 'prayer')
    and (p_type is null or n.type = p_type)
  order by n.created_at desc
  limit greatest(p_limit, 0)
  offset greatest(p_offset, 0);
$$;

select 'get_public_notes(p_limit, p_offset, p_type) 갱신 완료' as status;
