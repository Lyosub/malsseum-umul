-- 2026-11-20 나그네 마을: ① 함께 놓는 철길(함께 짓는 터 둘레 240칸) ② 세워 둔 수레를 모두 함께(ark_carts) ③ 휴대폰 버벅임 기록(ark_perf)
begin;

-- ① 함께 놓는 철길: 둘레 칸마다 레일(보통·빠른, 모양 상관없이)
insert into public.ark_village_projects(key,x0,z0,x1,z1) values ('railway',993,756,1054,815) on conflict (key) do nothing;
create or replace function public._ark_project_cells()
returns table (project_key text,x int,y int,z int,ids int[])
language sql immutable set search_path = public as $$
  select 'bridge',a,16,b,array[197] from generate_series(998,1006)a cross join generate_series(793,795)b
  union all select 'bridge',a,17,b,array[98] from generate_series(998,1006)a cross join unnest(array[793,795])b
  union all select 'well',1033,16,768,array[460]
  union all select 'well',a,16,b,array[197] from generate_series(1032,1034)a cross join generate_series(767,769)b where a<>1033 or b<>768
  union all select 'shelter',a,20,b,array[99] from generate_series(1033,1039)a cross join generate_series(792,798)b
  union all select 'shelter',a,c,b,array[96] from unnest(array[1033,1039])a cross join unnest(array[792,798])b cross join generate_series(16,19)c
  union all select 'pen',a,16,b,case when a=1034 and b=782 then array[59,68,69,133] else array[56] end
    from generate_series(1032,1037)a cross join generate_series(777,782)b where a in (1032,1037) or b in (777,782)
  union all select 'meal',a,16,795,array[505] from unnest(array[1045,1047,1049])a
  union all select 'meal',a,17,795,array[v] from (values (1045,506),(1047,507),(1049,508)) f(a,v)
  union all select 'railway',p.a,16,p.b,array[940,941,942,943,944,945,946,947,948,949,960,961,962,963,964,965,966,967,968,969] from (
    select a,756 b from generate_series(993,1054) a union all select a,815 from generate_series(993,1054) a
    union all select 993,b from generate_series(757,814) b union all select 1054,b from generate_series(757,814) b) p
$$;
revoke all on function public._ark_project_cells() from public, anon, authenticated;

create or replace function public.ark_village_project_admin(p_key text,p_action text)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare area public.ark_village_projects%rowtype; finished boolean;
begin
  if not public.is_ark_admin() then return false; end if;
  perform pg_advisory_xact_lock(1924,19);
  select * into area from public.ark_village_projects where key=p_key for update;
  if not found then return false; end if;
  if p_key='railway' and p_action='lock' then return false; end if;   -- 철길은 함께 짓는 터 전체를 둘러서 잠그지 않음
  if p_action='lock' then
    if area.locked then return true; end if;
    select s.done=s.required into finished from public.ark_village_project_status() s where s.key=p_key;
    if not coalesce(finished,false) then return false; end if;
    update public.ark_village_projects q set locked=true,snapshot=(
      select coalesce(jsonb_agg(jsonb_build_object('x',e.x,'y',e.y,'z',e.z,'id',e.id,'user_id',e.user_id)),'[]'::jsonb)
      from public.ark_world_edits e where e.x between area.x0 and area.x1 and e.z between area.z0 and area.z1
    ) where q.key=p_key;
  elsif p_action='unlock' then
    update public.ark_village_projects set locked=false where key=p_key;
  elsif p_action='restore' and area.snapshot is not null then
    -- Remove only unsaved coordinates in this project, then restore its saved blocks.
    delete from public.ark_world_edits e where e.x between area.x0 and area.x1 and e.z between area.z0 and area.z1
      and not exists (select 1 from jsonb_to_recordset(area.snapshot) s(x int,y int,z int) where (s.x,s.y,s.z)=(e.x,e.y,e.z));
    insert into public.ark_world_edits(x,y,z,id,user_id,at)
      select s.x,s.y,s.z,s.id,auth.uid(),now()
      from jsonb_to_recordset(area.snapshot) s(x int,y int,z int,id smallint)
      where s.x between area.x0 and area.x1 and s.z between area.z0 and area.z1
      on conflict(x,y,z) do update set id=excluded.id,user_id=excluded.user_id,at=excluded.at;
    update public.ark_village_projects set locked=true where key=p_key;
  else return false;
  end if;
  return true;
end;
$$;
revoke all on function public.ark_village_project_admin(text,text) from public,anon;
grant execute on function public.ark_village_project_admin(text,text) to authenticated;

-- ② 세워 둔 수레: 누구나 보고 탈 수 있음(먼저 탄 사람이 가져감). 한 사람 6대, 전체 400대
create table if not exists public.ark_carts (
  id bigserial primary key,
  x int not null, y int not null, z int not null,
  s smallint not null check (s between 0 and 9),
  frm smallint not null check (frm between 0 and 3),
  too smallint not null check (too between 0 and 3),
  t real not null check (t between 0 and 1),
  by_user uuid not null references auth.users(id) on delete cascade,
  at timestamptz not null default now(),
  unique (x,y,z)
);
create index if not exists ark_carts_xz on public.ark_carts(x,z);
alter table public.ark_carts enable row level security;
revoke all on public.ark_carts from anon, authenticated;

create or replace function public.park_ark_cart(p_x int,p_y int,p_z int,p_s int,p_from int,p_to int,p_t real)
returns bigint language plpgsql security definer set search_path=public,pg_temp as $$
declare nid bigint;
begin
  if not public.can_play_ark() then return -1; end if;
  if p_x is null or p_x not between 0 and 2047 or p_z is null or p_z not between 0 and 2047 or p_y is null or p_y not between 1 and 79
     or p_s not between 0 and 9 or p_from not between 0 and 3 or p_to not between 0 and 3 or p_t is null or p_t < 0 or p_t > 1 then return -2; end if;
  delete from public.ark_carts where at < now()-interval '30 days';   -- 30일 넘게 세워 둔 수레는 정리
  if (select count(*) from public.ark_carts where by_user=auth.uid()) >= 6 then return -4; end if;
  if (select count(*) from public.ark_carts) >= 400 then return -5; end if;
  insert into public.ark_carts(x,y,z,s,frm,too,t,by_user) values (p_x,p_y,p_z,p_s,p_from,p_to,p_t,auth.uid())
    on conflict (x,y,z) do nothing returning id into nid;
  return coalesce(nid,-3);
end;
$$;
revoke all on function public.park_ark_cart(int,int,int,int,int,int,real) from public, anon;
grant execute on function public.park_ark_cart(int,int,int,int,int,int,real) to authenticated;

create or replace function public.take_ark_cart(p_id bigint)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare r public.ark_carts%rowtype;
begin
  if not public.can_play_ark() then return null; end if;
  delete from public.ark_carts where id=p_id returning * into r;
  if not found then return null; end if;
  return jsonb_build_object('id',r.id,'x',r.x,'y',r.y,'z',r.z,'s',r.s,'from',r.frm,'to',r.too,'t',r.t);
end;
$$;
revoke all on function public.take_ark_cart(bigint) from public, anon;
grant execute on function public.take_ark_cart(bigint) to authenticated;

create or replace function public.list_ark_carts(p_x int,p_z int)
returns table(id bigint,x int,y int,z int,s int,frm int,too int,t real)
language sql stable security definer set search_path=public,pg_temp as $$
  select c.id,c.x,c.y,c.z,c.s::int,c.frm::int,c.too::int,c.t from public.ark_carts c
  where public.can_play_ark() and abs(c.x-p_x)<=128 and abs(c.z-p_z)<=128 order by c.at desc limit 200;
$$;
revoke all on function public.list_ark_carts(int,int) from public, anon;
grant execute on function public.list_ark_carts(int,int) to authenticated;

-- ③ 휴대폰 버벅임 기록: 1분 평균·가장 낮은 값, 한 사람 10분에 한 번, 60일 지나면 지움(숫자와 기기 문자열만)
create table if not exists public.ark_perf (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  at timestamptz not null default now(),
  fps_avg real, fps_low real, light boolean, w smallint, h smallint, dpr real, ua text
);
create index if not exists ark_perf_at on public.ark_perf(at);
alter table public.ark_perf enable row level security;
revoke all on public.ark_perf from anon, authenticated;

create or replace function public.log_ark_perf(p_avg real,p_low real,p_light boolean,p_w int,p_h int,p_dpr real,p_ua text)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if not public.can_play_ark() then return false; end if;
  if exists (select 1 from public.ark_perf where user_id=auth.uid() and at > now()-interval '10 minutes') then return false; end if;
  insert into public.ark_perf(user_id,fps_avg,fps_low,light,w,h,dpr,ua)
    values (auth.uid(), least(greatest(coalesce(p_avg,0),0),240), least(greatest(coalesce(p_low,0),0),240), coalesce(p_light,false),
            least(greatest(coalesce(p_w,0),0),9999), least(greatest(coalesce(p_h,0),0),9999), least(greatest(coalesce(p_dpr,1),0),8), left(coalesce(p_ua,''),300));
  delete from public.ark_perf where at < now()-interval '60 days';
  return true;
end;
$$;
revoke all on function public.log_ark_perf(real,real,boolean,int,int,real,text) from public, anon;
grant execute on function public.log_ark_perf(real,real,boolean,int,int,real,text) to authenticated;

commit;
