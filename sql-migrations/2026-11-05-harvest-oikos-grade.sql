-- 감사의 광주리: 오이코스를 학년별로 나눈다 (2026-11-05 전도사님 결정).
-- * 1학년 1반이 둘이던 것을 정리한다: 멤버가 다른 곳에도 있고 기록이 없는 「중등부 1-1 반」(id 8)은 숨기고,
--   실제로 쓰는 「1-1」(id 18)은 「중등부 1학년 1반」으로 이름을 바꾼다.
-- * 어느 오이코스가 몇 학년인지는 harvest_groups에 적는다. 적지 않은 오이코스는 「기타」로 보인다.

update public.groups set is_hidden = true where id = 8;
update public.groups set name = '중등부 1학년 1반' where id = 18;

create table if not exists public.harvest_groups (
  group_id bigint primary key references public.groups(id) on delete cascade,
  grade    int not null check (grade between 1 and 3)
);
alter table public.harvest_groups enable row level security;
revoke all on public.harvest_groups from anon, authenticated;

insert into public.harvest_groups(group_id, grade) values
  (18, 1), (3, 1), (12, 2), (15, 2), (4, 3), (1, 3)
on conflict (group_id) do update set grade = excluded.grade;

create or replace function public.harvest_status() returns jsonb
language sql stable security definer
set search_path = public
as $$
  with c as (select * from public.harvest_config where id = 1),
  items as (
    -- 감사노트: 광주리에서 고른 오이코스가 있으면 그것, 없으면 그 사람이 속한 오이코스
    select coalesce(e.group_id, (
             select min(gm.group_id) from public.group_members gm
             join public.groups g on g.id = gm.group_id and not g.is_hidden
             where gm.user_id = n.user_id)) as gid
    from public.notes n cross join c
    left join public.harvest_entries e on e.note_id = n.id
    where n.type = 'gratitude' and n.created_at >= c.starts_at and n.created_at < c.ends_at
    union all
    -- 로그인 없이 쓴 글: 담당자가 숨기면 빠진다
    select e.group_id
    from public.harvest_entries e cross join c
    left join public.star_messages m on m.id = e.message_id
    where e.note_id is null and e.created_at >= c.starts_at and e.created_at < c.ends_at
      and coalesce(m.status, '') not in ('hidden', 'blocked')
  )
  select jsonb_build_object(
    'count', (select count(*) from items),
    'other', (select count(*) from items where gid is null),
    'groups', coalesce((
      select jsonb_agg(jsonb_build_object('id', g.id, 'name', g.name, 'grade', hg.grade,
               'n', (select count(*) from items i where i.gid = g.id)) order by coalesce(hg.grade, 9), g.name)
      from public.groups g
      left join public.harvest_groups hg on hg.group_id = g.id
      where not g.is_hidden), '[]'::jsonb),
    'my_group', (
      select min(gm.group_id) from public.group_members gm
      join public.groups g on g.id = gm.group_id and not g.is_hidden
      where gm.user_id = auth.uid()),
    'starts_at', c.starts_at,
    'ends_at', c.ends_at,
    'open', now() >= c.starts_at and now() < c.ends_at
  )
  from c;
$$;
grant execute on function public.harvest_status() to anon, authenticated;
