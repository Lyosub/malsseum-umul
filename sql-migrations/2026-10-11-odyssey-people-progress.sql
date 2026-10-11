-- In Odyssey 친구 목록에 「몇 편 몇 장」 진행 표시 (2026-10-11)
-- * 친구(rel = 'friend')인 사람에게만 prog 를 내려보낸다. 친구 찾기·받은 요청의 낯선 사람은 null.
-- * 저장 데이터에서 읽는 것은 진행(ch·cleared·sp)뿐이다.
drop function if exists public.get_odyssey_people();
create function public.get_odyssey_people()
returns table(user_id uuid, nickname text, title text, rel text, likes integer, prog text)
language sql stable security definer set search_path = public as $$
  select x.user_id, x.nickname, x.title, x.rel, x.likes,
         case when x.rel = 'friend' then (
           select case
             when s.j is null then null
             when s.j->'sp'->'wild3' is not null then
               '3편 ' || case when (s.j->'sp'->'wild3'->>'cleared')::boolean is true and (s.j->'sp'->'wild3'->>'ch')::int >= 15 then '완료' else ((s.j->'sp'->'wild3'->>'ch')::int + 1) || '장' end
             when s.j->'sp'->'sinai2' is not null then
               '2편 ' || case when (s.j->'sp'->'sinai2'->>'cleared')::boolean is true and (s.j->'sp'->'sinai2'->>'ch')::int >= 9 then '완료' else ((s.j->'sp'->'sinai2'->>'ch')::int + 1) || '장' end
             else
               '1편 ' || case when (s.j->>'cleared')::boolean is true and (s.j->>'ch')::int >= 9 then '완료' else ((s.j->>'ch')::int + 1) || '장' end
           end
           from (select case when o.data::jsonb->'keys' ? 'inodyssey.proto.story'
                             then (o.data::jsonb->'keys'->>'inodyssey.proto.story')::jsonb end as j
                 from public.odyssey_save o where o.user_id = x.user_id) s
         ) end as prog
  from (
    select p.user_id, p.nickname, pr.title,
           case when f.status = 'accepted' then 'friend' when f.status = 'pending' and f.requested_by = auth.uid() then 'sent'
                when f.status = 'pending' then 'received' else 'none' end as rel,
           (select count(*)::int from odyssey_home_likes l where l.owner = p.user_id) as likes
    from profiles p
    left join odyssey_progress pr on pr.user_id = p.user_id
    left join odyssey_friends f on f.a = least(auth.uid(), p.user_id) and f.b = greatest(auth.uid(), p.user_id)
    where public.can_see_odyssey() and p.user_id <> auth.uid() and p.user_id in (select public.odyssey_people_ids())
  ) x
  order by (x.rel = 'friend') desc, (x.rel = 'received') desc, x.nickname;
$$;
revoke all on function public.get_odyssey_people() from public, anon;
grant execute on function public.get_odyssey_people() to authenticated;
