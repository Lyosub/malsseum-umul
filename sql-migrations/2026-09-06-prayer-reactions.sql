-- 2026-09-06 기도제목 "🙏 함께 기도했어요" 반응
-- 실시간 나눔(feed.html)의 기도제목마다 다른 사람이 "함께 기도했어요"를 누를 수 있다.
-- 누가 눌렀는지는 공개 안 하고 숫자만 보여준다. 하루 1회가 아니라 토글(다시 누르면 취소).
--
-- Supabase 대시보드 → SQL Editor에 붙여넣고 Run. 마지막 status 줄이 뜨면 성공.

create table if not exists prayer_reactions (
  note_id bigint not null references notes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (note_id, user_id)
);
alter table prayer_reactions enable row level security;

-- 직접 select는 정책을 안 만들어 막아둔다(누가 눌렀는지 노출 방지). 카운트는 아래 함수로만.
drop policy if exists "본인 기도반응 추가" on prayer_reactions;
create policy "본인 기도반응 추가" on prayer_reactions
  for insert with check (auth.uid() = user_id);

drop policy if exists "본인 기도반응 삭제" on prayer_reactions;
create policy "본인 기도반응 삭제" on prayer_reactions
  for delete using (auth.uid() = user_id);

create or replace function toggle_prayer_reaction(p_note_id bigint)
returns table(pray_count integer, i_prayed boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_exists boolean;
begin
  if auth.uid() is null then
    raise exception '로그인이 필요합니다.';
  end if;
  if not exists (select 1 from notes where id = p_note_id and type = 'prayer') then
    raise exception '기도제목을 찾을 수 없습니다.';
  end if;

  select exists(select 1 from prayer_reactions where note_id = p_note_id and user_id = auth.uid()) into v_exists;

  if v_exists then
    delete from prayer_reactions where note_id = p_note_id and user_id = auth.uid();
  else
    insert into prayer_reactions (note_id, user_id) values (p_note_id, auth.uid()) on conflict do nothing;
  end if;

  return query
    select coalesce(count(*), 0)::integer, (not v_exists)
    from prayer_reactions where note_id = p_note_id;
end;
$$;

-- get_public_notes 에 기도 카운트 / 내가 눌렀는지 추가 (기존 인자 유지)
drop function if exists get_public_notes(integer);
drop function if exists get_public_notes(integer, integer, text);
create or replace function get_public_notes(
  p_limit integer default 60,
  p_offset integer default 0,
  p_type text default null
)
returns table(
  id bigint, type text, content text, image_urls text[],
  created_at timestamptz, nickname text,
  pray_count integer, i_prayed boolean
)
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
    end as nickname,
    case when n.type = 'prayer'
      then (select count(*)::integer from prayer_reactions pr where pr.note_id = n.id)
      else 0 end as pray_count,
    case when n.type = 'prayer' and auth.uid() is not null
      then exists(select 1 from prayer_reactions pr where pr.note_id = n.id and pr.user_id = auth.uid())
      else false end as i_prayed
  from notes n
  join profiles p on p.user_id = n.user_id
  where n.type in ('greeting', 'gratitude', 'prayer')
    and (p_type is null or n.type = p_type)
  order by n.created_at desc
  limit greatest(p_limit, 0)
  offset greatest(p_offset, 0);
$$;

select 'prayer_reactions 테이블/함수 + get_public_notes(pray_count,i_prayed) 갱신 완료' as status;
