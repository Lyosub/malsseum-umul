-- 2026-10-25 관리자 「🗺 오디세이」 탭에 4편(joshua)·5편(judges) 진행과 5편 「사사 열두 명」 조각을 더한다. 읽기 전용 함수 덮어쓰기만.
create or replace function public.get_odyssey_admin_overview()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with staff as (
    select p.is_admin from public.profiles p
    where p.user_id = auth.uid() and (p.is_admin or p.is_department_head)
  ),
  st as (
    select s.user_id, s.updated_at,
           case when s.data::jsonb->'keys' ? 'inodyssey.proto.story'
                then (s.data::jsonb->'keys'->>'inodyssey.proto.story')::jsonb end as story
    from public.odyssey_save s
  ),
  earned as (
    select t.user_id,
           jsonb_agg(jsonb_build_object('type', t.action_type, 'n', t.n, 'pts', t.pts) order by t.pts desc) as by_type,
           sum(t.pts)::int as total
    from (
      select user_id, action_type, count(*)::int as n, sum(points)::int as pts
      from public.points_ledger
      where action_type like 'odyssey\_%'
      group by user_id, action_type
    ) t
    group by t.user_id
  ),
  bought as (
    select o.user_id,
           sum(case when o.status in ('pending', 'approved', 'delivered') then o.cost_snapshot else 0 end)::int as spent,
           count(*) filter (where o.status in ('pending', 'approved', 'delivered'))::int as n,
           (select jsonb_agg(jsonb_build_object('name', x.item_name, 'cost', x.cost_snapshot, 'at', x.created_at, 'status', x.status) order by x.created_at desc)
              from (select * from public.shop_orders z where z.user_id = o.user_id and z.item_name like '[게임]%' order by z.created_at desc limit 60) x) as list
    from public.shop_orders o
    where o.item_name like '[게임]%'
    group by o.user_id
  ),
  people as (
    select user_id from st
    union select user_id from earned
    union select user_id from bought
  )
  select case when not exists (select 1 from staff) then '[]'::jsonb else
    coalesce(jsonb_agg(jsonb_build_object(
      'user_id', pe.user_id,
      'nickname', pr.nickname,
      'real_name', case when exists (select 1 from staff where is_admin) then pr.real_name else null end,
      'saved_at', st.updated_at,
      'moses', case when st.story is null then null else jsonb_build_object('ch', st.story->'ch', 'step', st.story->'step', 'cleared', st.story->'cleared') end,
      'sinai2', st.story->'sp'->'sinai2',
      'wild3', st.story->'sp'->'wild3',
      'joshua', st.story->'sp'->'joshua',
      'judges', st.story->'sp'->'judges',
      'judges12', coalesce(st.story->'judges12', '[]'::jsonb),
      'mat', coalesce(st.story->'mat', '{}'::jsonb),
      'badges', coalesce(st.story->'badges', '[]'::jsonb),
      'verses_n', coalesce(jsonb_array_length(case when jsonb_typeof(st.story->'verses') = 'array' then st.story->'verses' end), 0),
      'stars', coalesce(st.story->'stars', '0'::jsonb),
      'pets', coalesce(st.story->'petAff', '{}'::jsonb),
      'pet_v', st.story->'petAffV',
      'title', st.story->>'title',
      'manna', coalesce(st.story->'manna', '0'::jsonb),
      'last_seen', st.story->'lastSeen',
      'worship_n', coalesce(jsonb_array_length(case when jsonb_typeof(st.story->'worshipCards') = 'array' then st.story->'worshipCards' end), 0),
      'earned', coalesce(ea.by_type, '[]'::jsonb),
      'earned_total', coalesce(ea.total, 0),
      'spent_total', coalesce(bo.spent, 0),
      'buy_n', coalesce(bo.n, 0),
      'orders', coalesce(bo.list, '[]'::jsonb)
    ) order by coalesce(st.updated_at, 'epoch'::timestamptz) desc), '[]'::jsonb)
  end
  from people pe
  join public.profiles pr on pr.user_id = pe.user_id
  left join st on st.user_id = pe.user_id
  left join earned ea on ea.user_id = pe.user_id
  left join bought bo on bo.user_id = pe.user_id
  where exists (select 1 from staff);
$$;
notify pgrst, 'reload schema';
