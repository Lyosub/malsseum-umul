-- 감사의 광주리: 원정대 팀 코드만으로 쓰기 (2026-11-04, 전도사님 요청).
-- 계정과 팀원을 잇는 방식(harvest_team_links)을 없앤다. 원정대 화면처럼 팀 코드와 이름으로 들어와 쓴다.
-- * 글은 harvest_entries에 저장한다. 로그인한 상태로 쓰면 감사노트에도 저장하고(경험치는 기존 트리거대로) note_id로 묶어 두 번 세지 않는다.
-- * 팀 점수 규칙은 그대로: 하루 1회(공백 뺀 5자 이상), 11/9~11/14, 인정 횟수 ÷ (팀원 수 × 6일) × 20점.

create table if not exists public.harvest_entries (
  id         bigserial primary key,
  member_id  int not null references public.picnic_members(id) on delete cascade,
  note_id    bigint references public.notes(id) on delete set null,
  body       text not null,
  created_at timestamptz not null default now()
);
create index if not exists harvest_entries_member on public.harvest_entries(member_id, created_at);
alter table public.harvest_entries enable row level security;
revoke all on public.harvest_entries from anon, authenticated;

create or replace function public.harvest_member_days(p_member int) returns int
language sql stable
set search_path = public
as $$
  select count(distinct (e.created_at at time zone 'Asia/Seoul')::date)::int
  from public.harvest_entries e
  cross join public.harvest_config c
  where e.member_id = p_member
    and e.created_at >= c.starts_at and e.created_at < c.score_until
    and char_length(regexp_replace(e.body, '\s', '', 'g')) >= 5
$$;

create or replace function public.harvest_team_part(p_team int) returns jsonb
language sql stable
set search_path = public
as $$
  with m as (
    select id, public.harvest_member_days(id) as days from public.picnic_members where team_id = p_team
  ), s as (
    select count(*)::int as members, coalesce(sum(days), 0)::int as n from m
  )
  select jsonb_build_object(
    'pts', case when s.members = 0 then 0
                else least(c.score_max, round(s.n::numeric / (s.members * c.score_days) * c.score_max)::int) end,
    'n', s.n,
    'members', s.members,
    'days', c.score_days,
    'max', c.score_max)
  from s cross join public.harvest_config c
$$;

drop function if exists public.harvest_my_team();
drop function if exists public.harvest_team_link(text, int);
drop table if exists public.harvest_team_links;

-- 열매 수: 감사노트 + 팀 코드로만 쓴 글(감사노트와 묶인 글은 한 번만 센다)
create or replace function public.harvest_status()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'count', (select count(*) from public.notes n
              where n.type = 'gratitude' and n.created_at >= c.starts_at and n.created_at < c.ends_at)
           + (select count(*) from public.harvest_entries e
              where e.note_id is null and e.created_at >= c.starts_at and e.created_at < c.ends_at),
    'starts_at', c.starts_at,
    'ends_at', c.ends_at,
    'open', now() >= c.starts_at and now() < c.ends_at
  )
  from public.harvest_config c where c.id = 1;
$$;

-- 팀 코드와 이름 확인, 내 인정 일수(팀 점수는 내려가지 않는다)
create or replace function public.harvest_team_me(p_code text, p_member int) returns jsonb
language sql stable
security definer
set search_path = public
as $$
  select coalesce((
    select jsonb_build_object('ok', true, 'team', t.name, 'emoji', t.emoji, 'name', m.name,
      'days', public.harvest_member_days(m.id), 'score_days', c.score_days)
    from public.picnic_teams t
    join public.picnic_members m on m.team_id = t.id
    cross join public.harvest_config c
    where t.code = upper(btrim(coalesce(p_code, ''))) and m.id = p_member
  ), jsonb_build_object('ok', false))
$$;

create or replace function public.harvest_write(p_code text, p_member int, p_body text, p_share boolean default false)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.harvest_config;
  v_uid uuid := auth.uid();
  v_body text := btrim(coalesce(p_body, ''));
  v_note bigint;
  v_shared boolean := false;
  v_bad text[] := array['시발','씨발','ㅅㅂ','ㅆㅂ','병신','ㅂㅅ','개새','지랄','ㅈㄹ','좆','존나','졸라','닥쳐','꺼져','미친놈','미친년','fuck','shit'];
  w text;
begin
  select * into c from public.harvest_config where id = 1;
  if now() < c.starts_at or now() >= c.ends_at then
    return jsonb_build_object('ok', false, 'error', '지금은 담을 수 있는 기간이 아니에요.');
  end if;
  if not exists (select 1 from public.picnic_members m join public.picnic_teams t on t.id = m.team_id
                 where m.id = p_member and t.code = upper(btrim(coalesce(p_code, '')))) then
    return jsonb_build_object('ok', false, 'error', '팀 코드와 이름을 다시 확인해 주세요.');
  end if;
  if char_length(v_body) < 1 or char_length(v_body) > 60 then
    return jsonb_build_object('ok', false, 'error', '감사한 일을 60자 안으로 적어 주세요.');
  end if;
  foreach w in array v_bad loop
    if position(w in lower(v_body)) > 0 then
      return jsonb_build_object('ok', false, 'error', '이 글은 담을 수 없어요. 고쳐서 다시 적어 주세요.');
    end if;
  end loop;
  if v_body ~ '[0-9]{2,4}[- .][0-9]{3,4}[- .][0-9]{4}' or v_body ~ '[0-9]{9,}' then
    return jsonb_build_object('ok', false, 'error', '전화번호처럼 보이는 숫자는 쓸 수 없어요.');
  end if;
  if exists (select 1 from public.harvest_entries where member_id = p_member and created_at > now() - interval '10 seconds') then
    return jsonb_build_object('ok', false, 'error', '10초 뒤에 다시 담아 주세요.');
  end if;
  if (select count(*) from public.harvest_entries
      where member_id = p_member
        and (created_at at time zone 'Asia/Seoul')::date = (now() at time zone 'Asia/Seoul')::date) >= 5 then
    return jsonb_build_object('ok', false, 'error', '오늘은 다섯 개까지 담을 수 있어요. 내일 또 담아 주세요.');
  end if;
  if v_uid is not null then
    insert into public.notes(user_id, type, content, image_urls) values (v_uid, 'gratitude', v_body, '{}') returning id into v_note;
  end if;
  insert into public.harvest_entries(member_id, note_id, body) values (p_member, v_note, v_body);
  if coalesce(p_share, false) and not exists (
    select 1 from public.star_messages m
    where m.room = 'harvest' and m.device = 'm' || p_member
      and (m.created_at at time zone 'Asia/Seoul')::date = (now() at time zone 'Asia/Seoul')::date) then
    insert into public.star_messages(room, device, name, dept, body, show_name, status, kind)
    values ('harvest', 'm' || p_member, '한 사람', '감사', v_body, true, 'pending', 'live');
    v_shared := true;
  end if;
  return jsonb_build_object('ok', true, 'shared', v_shared);
end;
$$;

revoke all on function public.harvest_member_days(int), public.harvest_team_part(int) from public, anon, authenticated;
revoke all on function public.harvest_team_me(text, int), public.harvest_write(text, int, text, boolean) from public;
grant execute on function public.harvest_team_me(text, int), public.harvest_write(text, int, text, boolean) to anon, authenticated;
