-- 시상을 오이코스별로: 원정대(120) + 감사의 광주리(60) = 180점 (2026-11-05 전도사님 결정).
-- * 원정대 점수 = 그 오이코스를 고른 참가자들의 팀 점수 평균. 안 간 학생이 많아도 깎이지 않는다.
-- * 광주리 점수 = 인정 횟수 / (재적 인원 x 6일) x 60, 최대 60.
--   인정: 담당자가 승인한 글, 공백 빼고 5자 이상, 기기(또는 계정)당 하루 한 번, 11/14까지.
-- * 재적 인원(harvest_groups.roster)이 비어 있으면 광주리 점수와 합계를 내지 않는다.

update public.groups set name = '중등부 3학년 1반' where id = 4;
update public.groups set name = '중등부 3학년 2반' where id = 1;

alter table public.harvest_groups add column if not exists roster int check (roster > 0);
alter table public.harvest_config add column if not exists score_until timestamptz not null default '2026-11-15 00:00:00+09';
alter table public.harvest_config add column if not exists score_days int not null default 6;
alter table public.harvest_config add column if not exists score_max int not null default 60;

-- 원정대 참가자가 고른 오이코스. oikos_set이 false면 아직 묻지 않은 사람이고, true인데 비어 있으면 「오이코스 없음」이다.
alter table public.picnic_members add column if not exists oikos_group bigint references public.groups(id) on delete set null;
alter table public.picnic_members add column if not exists oikos_set boolean not null default false;

create or replace function public.picnic_join(p_code text) returns jsonb
language sql stable security definer
set search_path = public
as $$
  select coalesce((
    select jsonb_build_object('ok', true,
      'team', jsonb_build_object('id', t.id, 'name', t.name, 'emoji', t.emoji, 'event', t.event),
      'members', coalesce((select jsonb_agg(jsonb_build_object('id', m.id, 'name', m.name, 'oikos_set', m.oikos_set) order by m.sort, m.name)
                           from public.picnic_members m where m.team_id = t.id), '[]'::jsonb))
    from public.picnic_teams t where t.code = upper(btrim(coalesce(p_code, '')))
  ), jsonb_build_object('ok', false, 'error', '팀 코드를 다시 확인해 주세요.'))
$$;

create or replace function public.picnic_set_oikos(p_code text, p_member integer, p_group bigint) returns jsonb
language plpgsql security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.picnic_members m join public.picnic_teams t on t.id = m.team_id
                 where m.id = p_member and t.code = upper(btrim(coalesce(p_code, '')))) then
    return jsonb_build_object('ok', false, 'error', '팀 코드와 이름을 다시 확인해 주세요.');
  end if;
  if p_group is not null and not exists (select 1 from public.groups where id = p_group and not is_hidden) then
    return jsonb_build_object('ok', false, 'error', '오이코스를 다시 골라 주세요.');
  end if;
  update public.picnic_members set oikos_group = p_group, oikos_set = true where id = p_member;
  return jsonb_build_object('ok', true);
end;
$$;
revoke all on function public.picnic_set_oikos(text, integer, bigint) from public;
grant execute on function public.picnic_set_oikos(text, integer, bigint) to anon, authenticated;

-- 오이코스별 시상 점수. 원정대 관리 코드 또는 관리자 계정으로만 본다.
create or replace function public.harvest_oikos_scores(p_event text, p_code text) returns jsonb
language plpgsql stable security definer
set search_path = public
as $$
declare
  e public.picnic_events;
  c public.harvest_config;
begin
  select * into e from public.picnic_events where event = p_event;
  if not found or (e.admin_code <> coalesce(p_code, '')
      and not exists (select 1 from public.profiles p where p.user_id = auth.uid() and coalesce(p.is_admin, false))) then
    return jsonb_build_object('ok', false, 'error', '관리 코드를 다시 확인해 주세요.');
  end if;
  select * into c from public.harvest_config where id = 1;
  return jsonb_build_object('ok', true, 'max', c.score_max, 'days', c.score_days, 'rows', coalesce((
    select jsonb_agg(row_to_json(x)::jsonb order by x.grade, x.name)
    from (
      select g.id, g.name, hg.grade, hg.roster,
        ex.people, ex.pts as exp_pts, hv.n as harvest_n,
        case when hg.roster is null then null
             else least(c.score_max, round(hv.n::numeric / (hg.roster * c.score_days) * c.score_max)::int) end as harvest_pts,
        case when hg.roster is null then null
             else ex.pts + least(c.score_max, round(hv.n::numeric / (hg.roster * c.score_days) * c.score_max)::int) end as total
      from public.groups g
      join public.harvest_groups hg on hg.group_id = g.id
      cross join lateral (
        select count(*)::int as people,
               coalesce(round(avg(public.picnic_team_score(m.team_id)))::int, 0) as pts
        from public.picnic_members m join public.picnic_teams t on t.id = m.team_id
        where m.oikos_group = g.id and t.event = p_event
      ) ex
      cross join lateral (
        select count(*)::int as n from (
          select distinct m.device, (m.created_at at time zone 'Asia/Seoul')::date
          from public.harvest_entries he join public.star_messages m on m.id = he.message_id
          where he.group_id = g.id and m.status = 'approved'
            and he.created_at >= c.starts_at and he.created_at < c.score_until
            and char_length(regexp_replace(he.body, '\s', '', 'g')) >= 5
        ) d
      ) hv
      where not g.is_hidden
    ) x
  ), '[]'::jsonb));
end;
$$;
revoke all on function public.harvest_oikos_scores(text, text) from public;
grant execute on function public.harvest_oikos_scores(text, text) to anon, authenticated;
