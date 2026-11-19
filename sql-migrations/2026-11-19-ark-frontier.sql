begin;

create table if not exists public.ark_frontier_plots (
  slot integer primary key check (slot between 0 and 8),
  owner_id uuid not null unique references auth.users(id) on delete cascade
);
create table if not exists public.ark_frontier_grants (
  slot integer not null references public.ark_frontier_plots(slot) on delete cascade,
  friend_id uuid not null references auth.users(id) on delete cascade,
  role text not null check(role in ('build','stock')),
  primary key(slot,friend_id)
);
create table if not exists public.ark_frontier_stock_items (
  slot integer not null references public.ark_frontier_plots(slot) on delete cascade,
  item integer not null,
  amount integer not null check(amount between 1 and 231),
  primary key(slot,item)
);
create table if not exists public.ark_frontier_stock_ops (
  actor uuid not null references auth.users(id) on delete cascade,
  op uuid not null,
  slot integer not null,
  item integer not null,
  delta integer not null,
  at timestamptz not null default now(),
  primary key(actor,op)
);
alter table public.ark_frontier_plots enable row level security;
alter table public.ark_frontier_grants enable row level security;
alter table public.ark_frontier_stock_items enable row level security;
alter table public.ark_frontier_stock_ops enable row level security;
revoke all on public.ark_frontier_plots,public.ark_frontier_grants,public.ark_frontier_stock_items,
  public.ark_frontier_stock_ops from public,anon,authenticated;

create or replace function public._ark_frontier_slot(x int,z int)
returns int language sql immutable as $$
  select case when x between 916 and 1131 and z between 1252 and 1467
    and (x-916)%72<48 and (z-1252)%72<48
    then ((z-1252)/72)*3+(x-916)/72 else -1 end;
$$;
create or replace function public._ark_frontier_permission(p_slot integer,p_stock boolean)
returns boolean language sql stable security definer set search_path=public as $$
  select exists(
    select 1 from public.ark_frontier_plots p
    where p.slot=p_slot and (
      p.owner_id=auth.uid() or exists(
        select 1 from public.ark_frontier_grants g join public.ark_friends f
        on f.accepted and ((f.sender=p.owner_id and f.recipient=g.friend_id)
          or (f.recipient=p.owner_id and f.sender=g.friend_id))
        where g.slot=p.slot and g.friend_id=auth.uid() and (p_stock or g.role='build')
      )
    )
  );
$$;
create or replace function public._ark_frontier_edit_allowed(x int,z int)
returns boolean language sql stable security definer set search_path=public as $$
  select public._ark_frontier_slot(x,z)<0 or public._ark_frontier_permission(public._ark_frontier_slot(x,z),false);
$$;
revoke all on function public._ark_frontier_permission(integer,boolean),
  public._ark_frontier_edit_allowed(integer,integer) from public,anon,authenticated;

create or replace function public.get_ark_frontier()
returns table(slot integer,claimed boolean,own boolean,"canEdit" boolean,"canStock" boolean)
language sql stable security definer set search_path=public as $$
  select s.i, p.slot is not null, coalesce(p.owner_id=auth.uid(),false),
    public._ark_frontier_permission(s.i,false),public._ark_frontier_permission(s.i,true)
  from generate_series(0,8)s(i) left join public.ark_frontier_plots p on p.slot=s.i order by s.i;
$$;
revoke all on function public.get_ark_frontier() from public;
grant execute on function public.get_ark_frontier() to anon,authenticated;

create or replace function public.change_ark_frontier(p_slot integer,p_action text,p_friend uuid,p_role text)
returns boolean language plpgsql security definer set search_path=public as $$
declare actor uuid:=auth.uid();
begin
  if actor is null or not public.can_play_ark() or p_slot not between 0 and 8 then return false; end if;
  perform pg_advisory_xact_lock(1924,20);
  if p_action='claim' then
    insert into public.ark_frontier_plots(slot,owner_id) values(p_slot,actor) on conflict do nothing;
    return found;
  end if;
  if not exists(select 1 from public.ark_frontier_plots p where p.slot=p_slot and p.owner_id=actor) then return false; end if;
  if p_action='revoke' then
    delete from public.ark_frontier_grants g where g.slot=p_slot and g.friend_id=p_friend;
    return true;
  end if;
  if p_action='grant' and p_role in ('build','stock') and exists(
    select 1 from public.ark_friends f where f.accepted and
      ((f.sender=actor and f.recipient=p_friend) or (f.recipient=actor and f.sender=p_friend))
  ) then
    insert into public.ark_frontier_grants(slot,friend_id,role) values(p_slot,p_friend,p_role)
      on conflict(slot,friend_id) do update set role=excluded.role;
    return true;
  end if;
  return false;
end $$;
revoke all on function public.change_ark_frontier(integer,text,uuid,text) from public,anon;
grant execute on function public.change_ark_frontier(integer,text,uuid,text) to authenticated;

create or replace function public._ark_frontier_revoke_unfriended()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if not old.accepted then return null; end if;
  if tg_op='UPDATE' and new.accepted then return null; end if;
  perform pg_advisory_xact_lock(1924,20);
  delete from public.ark_frontier_grants g using public.ark_frontier_plots p
  where p.slot=g.slot and ((p.owner_id=old.sender and g.friend_id=old.recipient)
    or (p.owner_id=old.recipient and g.friend_id=old.sender));
  return null;
end $$;
revoke all on function public._ark_frontier_revoke_unfriended() from public,anon,authenticated;
drop trigger if exists ark_frontier_revoke_unfriended on public.ark_friends;
create trigger ark_frontier_revoke_unfriended after delete or update of accepted on public.ark_friends
for each row execute function public._ark_frontier_revoke_unfriended();

create or replace function public.ark_frontier_stock(p_slot integer,p_item integer,p_delta integer,p_op uuid default null)
returns jsonb language plpgsql security definer set search_path=public as $$
declare stock_actor uuid:=auth.uid(); current_amount integer; old_op public.ark_frontier_stock_ops%rowtype; contents jsonb;
begin
  if stock_actor is null or not public.can_play_ark() then return jsonb_build_object('error','denied'); end if;
  perform pg_advisory_xact_lock(1924,20);
  if p_delta<>0 and p_op is not null then
    select * into old_op from public.ark_frontier_stock_ops o where o.actor=stock_actor and o.op=p_op;
    if found then
      if old_op.slot=p_slot and old_op.item=p_item and old_op.delta=p_delta then return jsonb_build_object('ok',true); end if;
      return jsonb_build_object('error','duplicate');
    end if;
  end if;
  if not public._ark_frontier_permission(p_slot,true) then return jsonb_build_object('error','denied'); end if;
  if p_delta=0 then
    select coalesce(jsonb_object_agg(i.item,i.amount),'{}'::jsonb) into contents from public.ark_frontier_stock_items i where i.slot=p_slot;
    return jsonb_build_object('items',contents);
  end if;
  if p_op is null or p_delta not in (-1,1) or p_item in (0,24) or not public._ark_block_ok(p_item) then
    return jsonb_build_object('error','item');
  end if;
  select coalesce((select i.amount from public.ark_frontier_stock_items i where i.slot=p_slot and i.item=p_item),0) into current_amount;
  if current_amount+p_delta not between 0 and 231 or (p_delta=1 and current_amount=0 and
    (select count(*) from public.ark_frontier_stock_items i where i.slot=p_slot)>=27) then
    return jsonb_build_object('error','limit');
  end if;
  if current_amount+p_delta=0 then
    delete from public.ark_frontier_stock_items i where i.slot=p_slot and i.item=p_item;
  else
    insert into public.ark_frontier_stock_items(slot,item,amount) values(p_slot,p_item,current_amount+p_delta)
    on conflict(slot,item) do update set amount=excluded.amount;
  end if;
  insert into public.ark_frontier_stock_ops(actor,op,slot,item,delta) values(stock_actor,p_op,p_slot,p_item,p_delta);
  return jsonb_build_object('ok',true);
end $$;
revoke all on function public.ark_frontier_stock(integer,integer,integer,uuid) from public,anon;
grant execute on function public.ark_frontier_stock(integer,integer,integer,uuid) to authenticated;

create or replace function public._ark_block_ok(p_id int)
returns boolean language sql immutable as $$
  select p_id = any (array[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,124,125,126,127,128,130,133,134,135,136,137,138,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,196,197,198,199,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,400,401,402,403,404,405,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,460,461,462,463,464,465,466,467,468,469,470,480,481,482,501,502,503,504,505,506,507,508,510,511,512,513,520,521,522,523,524,525,526,527,528,529,530,531,532,533,534,535,536]);
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
  if exists (select 1 from jsonb_array_elements(p_edits) e
    where jsonb_typeof(e)='array' and jsonb_array_length(e)=4
      and public._ark_frontier_slot((e->>0)::int,(e->>2)::int)>=0) then
    perform pg_advisory_xact_lock(1924,20);
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
      and public._ark_frontier_edit_allowed(x,z)
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


create or replace function public.get_ark_frontier_cells(p_cells jsonb)
returns jsonb language sql stable security definer set search_path=public as $$
  with keys as (
    select distinct (a->>0)::int x,(a->>1)::int y,(a->>2)::int z
    from jsonb_array_elements(case when jsonb_typeof(p_cells)='array' then case when jsonb_array_length(p_cells)<=300 then p_cells else '[]'::jsonb end else '[]'::jsonb end) a
    where jsonb_typeof(a)='array' and jsonb_array_length(a)=4
  )
  select coalesce(jsonb_agg(jsonb_build_array(k.x,k.y,k.z,e.id)),'[]'::jsonb)
  from keys k left join public.ark_world_edits e on e.x=k.x and e.y=k.y and e.z=k.z
  where auth.uid() is not null and public.can_play_ark() and public._ark_frontier_slot(k.x,k.z)>=0;
$$;
revoke all on function public.get_ark_frontier_cells(jsonb) from public,anon;
grant execute on function public.get_ark_frontier_cells(jsonb) to authenticated;

commit;
