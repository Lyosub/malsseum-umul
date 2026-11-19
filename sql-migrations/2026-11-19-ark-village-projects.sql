-- Apply after 2026-11-19-ark-plot-expansion.sql and the village client.
begin;

create table if not exists public.ark_village_projects (
  key text primary key, x0 int not null, z0 int not null, x1 int not null, z1 int not null,
  locked boolean not null default false, snapshot jsonb
);
alter table public.ark_village_projects enable row level security;
revoke all on public.ark_village_projects from anon, authenticated;

insert into public.ark_village_projects(key,x0,z0,x1,z1) values
 ('bridge',996,790,1008,797),('well',1030,765,1036,772),('shelter',1031,790,1041,800),
 ('pen',1030,775,1039,785),('meal',1042,790,1053,800)
on conflict (key) do nothing;

create or replace function public._ark_project_edit_ok(p_x int,p_z int)
returns boolean language sql stable set search_path = public as $$
  select not (
    (p_x between 1503 and 1517 and p_z between 804 and 818) or
    (p_x between 772 and 786 and p_z between 1031 and 1045) or
    (p_x between 1153 and 1167 and p_z between 1203 and 1217) or
    (p_x=1024 and p_z in (1150,1199)) or
    exists (select 1 from public.ark_village_projects q where q.locked
      and p_x between q.x0 and q.x1 and p_z between q.z0 and q.z1)
  );
$$;
revoke all on function public._ark_project_edit_ok(int,int) from public, anon, authenticated;

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
$$;
revoke all on function public._ark_project_cells() from public, anon, authenticated;

create table if not exists public.ark_village_project_roles (
  project_key text not null references public.ark_village_projects(key),
  user_id uuid not null references auth.users(id) on delete cascade,
  role smallint not null check (role between 0 and 2),
  changed_at timestamptz not null default now(),
  primary key(project_key,user_id)
);
alter table public.ark_village_project_roles enable row level security;
revoke all on public.ark_village_project_roles from anon,authenticated;

create or replace function public.set_ark_village_role(p_key text,p_role int)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if not public.can_play_ark() or p_role is null or p_role not between 0 and 2 or
     not exists (select 1 from public.ark_village_projects q where q.key=p_key and not q.locked) then return false; end if;
  insert into public.ark_village_project_roles(project_key,user_id,role)
    values(p_key,auth.uid(),p_role)
    on conflict(project_key,user_id) do update set role=excluded.role,changed_at=now();
  return true;
end;
$$;
revoke all on function public.set_ark_village_role(text,int) from public,anon;
grant execute on function public.set_ark_village_role(text,int) to authenticated;

create or replace function public.ark_village_project_status()
returns table(key text,done int,required int,locked boolean,snapshot boolean,roles int[])
language sql stable security definer set search_path = public,pg_temp as $$
  select q.key, count(*) filter(where e.id = any(c.ids))::int,count(*)::int,q.locked,q.snapshot is not null,
    array(select count(r.user_id)::int from generate_series(0,2) n
      left join public.ark_village_project_roles r on r.project_key=q.key and r.role=n
       and r.changed_at > now()-interval '45 minutes' group by n order by n)
  from public.ark_village_projects q join public._ark_project_cells() c on c.project_key=q.key
  left join public.ark_world_edits e on e.x=c.x and e.y=c.y and e.z=c.z
  group by q.key,q.locked,q.snapshot is not null;
$$;
revoke all on function public.ark_village_project_status() from public;
grant execute on function public.ark_village_project_status() to anon,authenticated;

create or replace function public.ark_village_project_admin(p_key text,p_action text)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare area public.ark_village_projects%rowtype; finished boolean;
begin
  if not public.is_ark_admin() then return false; end if;
  perform pg_advisory_xact_lock(1924,19);
  select * into area from public.ark_village_projects where key=p_key for update;
  if not found then return false; end if;
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

create or replace function public.ark_village_project_blocks(p_key text)
returns table(x int,y int,z int,id int)
language sql stable security definer set search_path=public,pg_temp as $$
  select e.x,e.y,e.z,e.id::int from public.ark_world_edits e
  join public.ark_village_projects q on q.key=p_key and e.x between q.x0 and q.x1 and e.z between q.z0 and q.z1
  where public.can_play_ark();
$$;
revoke all on function public.ark_village_project_blocks(text) from public,anon;
grant execute on function public.ark_village_project_blocks(text) to authenticated;

create table if not exists public.ark_showcase_details (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme smallint not null check (theme between 0 and 4),
  marks jsonb not null default '[]'::jsonb
);
alter table public.ark_showcase_details enable row level security;
revoke all on public.ark_showcase_details from anon,authenticated;

create or replace function public.set_ark_showcase_details(p_theme int,p_marks jsonb)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare cell jsonb;
begin
  if not public.can_play_ark() or p_theme is null or p_theme not between 0 and 4 or p_marks is null then return false; end if;
  if jsonb_typeof(p_marks)<>'array' or jsonb_array_length(p_marks)>2 then return false; end if;
  if not exists (select 1 from public.ark_village_plots where user_id=auth.uid()) then return false; end if;
  for cell in select value from jsonb_array_elements(p_marks) loop
    if jsonb_typeof(cell)<>'array' or jsonb_array_length(cell)<>2 then return false; end if;
    if coalesce(cell->>0,'')!~'^[0-9]{1,2}$' or coalesce(cell->>1,'')!~'^[0-9]{1,2}$' then return false; end if;
    if (cell->>0)::int>=public.ark_plot_width() or (cell->>1)::int>=public.ark_plot_width() then return false; end if;
  end loop;
  insert into public.ark_showcase_details(user_id,theme,marks) values(auth.uid(),p_theme,p_marks)
    on conflict(user_id) do update set theme=excluded.theme,marks=excluded.marks;
  return true;
end;
$$;
revoke all on function public.set_ark_showcase_details(int,jsonb) from public,anon;
grant execute on function public.set_ark_showcase_details(int,jsonb) to authenticated;

create or replace function public.get_ark_showcase_details()
returns table(plot_idx int,theme int,marks jsonb)
language sql stable security definer set search_path=public,pg_temp as $$
  select s.plot_idx,d.theme::int,d.marks from public.get_ark_showcase() s
  join public.ark_village_plots p on p.plot_idx=s.plot_idx
  join public.ark_showcase_details d on d.user_id=p.user_id
  where public.can_play_ark();
$$;
revoke all on function public.get_ark_showcase_details() from public,anon;
grant execute on function public.get_ark_showcase_details() to authenticated;

create or replace function public._ark_block_ok(p_id int)
returns boolean language sql immutable as $$
  select p_id = any (array[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,124,125,126,127,128,130,133,134,135,136,137,138,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,196,197,198,199,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,400,401,402,403,404,405,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,460,461,462,463,464,465,466,467,468,469,470,480,481,482,501,502,503,504,505,506,507,508]);
$$;

create or replace function public.put_ark_edits(p_edits jsonb)
returns int language plpgsql security definer set search_path = public as $$
declare n int; m timestamptz := date_trunc('minute', now()); used int; ok int;
begin
  if not public.can_play_ark() then return -1; end if;
  if jsonb_typeof(p_edits) <> 'array' then return 0; end if;
  n := jsonb_array_length(p_edits);
  if n = 0 then return 0; end if;
  if n > 300 then return -2; end if;
  -- Serialize edits that touch a project with its teacher operations.
  if exists (select 1 from jsonb_array_elements(p_edits) e
             join public.ark_village_projects q
               on (e->>0)::int between q.x0 and q.x1 and (e->>2)::int between q.z0 and q.z1
             where jsonb_typeof(e)='array' and jsonb_array_length(e)=4) then
    perform pg_advisory_xact_lock(1924, 19);
  end if;
  insert into ark_edit_budget(user_id, minute, n) values (auth.uid(), m, n)
    on conflict (user_id, minute) do update set n = ark_edit_budget.n + excluded.n
    returning ark_edit_budget.n into used;
  if used > 1500 then return -3; end if;
  delete from ark_edit_budget where minute < now() - interval '10 minutes';
  with v as (
    select (e->>0)::int x, (e->>1)::int y, (e->>2)::int z, (e->>3)::int id
    from jsonb_array_elements(p_edits) e
    where jsonb_typeof(e) = 'array' and jsonb_array_length(e) = 4
  ), good as (
    select distinct on (x, y, z) x, y, z, id from v
    where x between 0 and 2047 and y between 1 and 79 and z between 0 and 2047 and public._ark_block_ok(id) and public._ark_wild_ok(x, y, z) and public._ark_project_edit_ok(x,z)
      and (id <> 24 or (x between 992 and 1055 and z between 754 and 817))
  )
  insert into ark_world_edits(x, y, z, id, user_id, at)
  select x, y, z, id::smallint, auth.uid(), now() from good
  on conflict (x, y, z) do update set id = excluded.id, user_id = excluded.user_id, at = excluded.at;
  get diagnostics ok = row_count;
  return ok;
end $$;
revoke all on function public.put_ark_edits(jsonb) from public, anon;
grant execute on function public.put_ark_edits(jsonb) to authenticated;

create or replace function public.admin_revert_commons(p_minutes int)
returns int language plpgsql security definer set search_path = public as $$
declare k int;
begin
  if not public.is_ark_admin() then return -1; end if;
  perform pg_advisory_xact_lock(1924, 19);
  delete from ark_world_edits
   where x between 991 and 1056 and z between 753 and 818
     and public._ark_project_edit_ok(x,z)
     and (coalesce(p_minutes, 0) <= 0 or at > now() - make_interval(mins => p_minutes));
  get diagnostics k = row_count;
  return k;
end $$;
revoke all on function public.admin_revert_commons(int) from public, anon;
grant execute on function public.admin_revert_commons(int) to authenticated;

commit;
