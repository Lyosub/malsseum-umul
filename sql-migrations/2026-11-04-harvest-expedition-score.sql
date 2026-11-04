-- 감사의 광주리를 가을 원정대 점수에 넣는다 (2026-11-04).
-- * 계정 하나를 원정대 팀원 한 명과 잇는다(harvest_team_links). 잇기 전에 쓴 감사노트도 기간 안이면 센다.
-- * 인정: 이은 팀원이 11/9~11/14 하루에 공백 뺀 5자 이상 감사노트를 쓰면 하루 1회.
-- * 팀 점수 = 반올림(인정 횟수 ÷ (팀원 수 × 6일) × 20점). 팀 인원이 달라도 공평하도록 참여율로 환산한다.
-- * 재실행해도 안전. picnic_admin은 고치지 않는다(점수·항목이 기존 두 함수를 통해 관리 화면에 나온다).

alter table public.harvest_config add column if not exists score_until timestamptz not null default '2026-11-15 00:00:00+09';
alter table public.harvest_config add column if not exists score_days  int not null default 6;
alter table public.harvest_config add column if not exists score_max   int not null default 20;

create table if not exists public.harvest_team_links (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  member_id  int not null unique references public.picnic_members(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.harvest_team_links enable row level security;
revoke all on public.harvest_team_links from anon, authenticated;

-- 사람별 인정 일수
create or replace function public.harvest_member_days(p_member int) returns int
language sql stable
set search_path = public
as $$
  select count(distinct (n.created_at at time zone 'Asia/Seoul')::date)::int
  from public.harvest_team_links l
  join public.notes n on n.user_id = l.user_id and n.type = 'gratitude'
  cross join public.harvest_config c
  where l.member_id = p_member
    and n.created_at >= c.starts_at and n.created_at < c.score_until
    and char_length(regexp_replace(n.content, '\s', '', 'g')) >= 5
$$;

-- 팀 항목: 점수·인정 횟수·이은 사람 수·팀원 수
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
    'max', c.score_max,
    'linked', (select count(*)::int from public.harvest_team_links l join m on m.id = l.member_id))
  from s cross join public.harvest_config c
$$;

create or replace function public.picnic_team_score(p_team int) returns int
language sql stable
set search_path = public
as $$
  select coalesce((
    select sum(best) from (
      select max(points) as best from public.picnic_subs
      where team_id = p_team and status = 'ok' and kind <> 'hint'
      group by kind, q
    ) s), 0)
  + (select bonus - penalty from public.picnic_teams where id = p_team)
  + (public.harvest_team_part(p_team)->>'pts')::int
$$;

create or replace function public.picnic_team_parts(p_team int) returns jsonb
language sql stable
set search_path = public
as $$
  select coalesce((select jsonb_object_agg(kind, jsonb_build_object('pts', pts, 'n', n)) from (
    select kind, sum(best)::int as pts, count(*)::int as n from (
      select kind, q, max(points) as best from public.picnic_subs
      where team_id = p_team and status = 'ok' and kind <> 'hint'
      group by kind, q
    ) s group by kind
  ) k), '{}'::jsonb) || jsonb_build_object('harvest', public.harvest_team_part(p_team))
$$;

-- 내 연결 상태(팀 점수는 내려가지 않는다)
create or replace function public.harvest_my_team() returns jsonb
language sql stable
security definer
set search_path = public
as $$
  select coalesce((
    select jsonb_build_object('linked', true, 'team', t.name, 'emoji', t.emoji, 'name', m.name,
      'days', public.harvest_member_days(m.id), 'score_days', c.score_days, 'score_until', c.score_until)
    from public.harvest_team_links l
    join public.picnic_members m on m.id = l.member_id
    join public.picnic_teams t on t.id = m.team_id
    cross join public.harvest_config c
    where l.user_id = auth.uid()
  ), (select jsonb_build_object('linked', false, 'score_until', c.score_until) from public.harvest_config c))
$$;

-- 계정과 팀원 잇기: 자기 팀 코드를 알아야 하고, 한 사람은 한 계정만 이을 수 있다
create or replace function public.harvest_team_link(p_code text, p_member int) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_team int;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', '로그인한 뒤 이을 수 있어요.');
  end if;
  if now() >= (select score_until from public.harvest_config where id = 1) then
    return jsonb_build_object('ok', false, 'error', '팀 점수 기간이 끝났어요.');
  end if;
  select id into v_team from public.picnic_teams where code = upper(btrim(coalesce(p_code, '')));
  if v_team is null then
    return jsonb_build_object('ok', false, 'error', '팀 코드를 다시 확인해 주세요.');
  end if;
  if not exists (select 1 from public.picnic_members where id = p_member and team_id = v_team) then
    return jsonb_build_object('ok', false, 'error', '이 팀 명단에서 이름을 찾지 못했어요.');
  end if;
  if exists (select 1 from public.harvest_team_links where user_id = v_uid) then
    return jsonb_build_object('ok', false, 'error', '이 계정은 이미 이어져 있어요.');
  end if;
  if exists (select 1 from public.harvest_team_links where member_id = p_member) then
    return jsonb_build_object('ok', false, 'error', '이 이름은 이미 다른 계정과 이어져 있어요. 전도사님께 말씀해 주세요.');
  end if;
  insert into public.harvest_team_links(user_id, member_id) values (v_uid, p_member);
  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.harvest_member_days(int), public.harvest_team_part(int) from public, anon, authenticated;
revoke all on function public.picnic_team_score(int), public.picnic_team_parts(int) from public, anon, authenticated;
revoke all on function public.harvest_my_team(), public.harvest_team_link(text, int) from public, anon;
grant execute on function public.harvest_my_team(), public.harvest_team_link(text, int) to authenticated;
