-- 2026-11-20 나그네 마을 땅속을 깊게(바닥 y 0 → -32): 블록 바꿈·수레 세우기·떨어뜨린 물건이 y 0 아래도 받도록 높이 범위만 넓힘

CREATE OR REPLACE FUNCTION public.put_ark_edits(p_edits jsonb)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare n int; m timestamptz := date_trunc('minute', now()); used int; ok int; adm boolean := public.is_ark_admin();
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
    where x between 0 and 2047 and y between -31 and 79 and z between 0 and 2047 and public._ark_block_ok(id)
      and (
        (adm and public._ark_plot_at(x, z) < 0)
        or (public._ark_wild_ok(x, y, z) and public._ark_project_edit_ok(x,z)
            and public._ark_frontier_edit_allowed(x,z)
            and (id <> 24 or (x between 992 and 1055 and z between 754 and 817)))
      )
  )
  insert into ark_world_edits(x, y, z, id, user_id, at)
  select x, y, z, id::smallint, auth.uid(), now() from good
  on conflict (x, y, z) do update set id = excluded.id, user_id = excluded.user_id, at = excluded.at;
  get diagnostics ok = row_count;
  return ok;
end $function$;

CREATE OR REPLACE FUNCTION public.park_ark_cart(p_x integer, p_y integer, p_z integer, p_s integer, p_from integer, p_to integer, p_t real)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare nid bigint;
begin
  if not public.can_play_ark() then return -1; end if;
  if p_x is null or p_x not between 0 and 2047 or p_z is null or p_z not between 0 and 2047 or p_y is null or p_y not between -31 and 79
     or p_s not between 0 and 9 or p_from not between 0 and 3 or p_to not between 0 and 3 or p_t is null or p_t < 0 or p_t > 1 then return -2; end if;
  delete from public.ark_carts where at < now()-interval '30 days';   -- 30일 넘게 세워 둔 수레는 정리
  if (select count(*) from public.ark_carts where by_user=auth.uid()) >= 6 then return -4; end if;
  if (select count(*) from public.ark_carts) >= 400 then return -5; end if;
  insert into public.ark_carts(x,y,z,s,frm,too,t,by_user) values (p_x,p_y,p_z,p_s,p_from,p_to,p_t,auth.uid())
    on conflict (x,y,z) do nothing returning id into nid;
  return coalesce(nid,-3);
end;
$function$;

CREATE OR REPLACE FUNCTION public.drop_ark_item(p_x real, p_y real, p_z real, p_item integer, p_amount integer)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare nid bigint;
begin
  if auth.uid() is null or not public.can_play_ark() then return -1; end if;
  if p_x is null or p_y is null or p_z is null or p_x not between 0 and 2048 or p_z not between 0 and 2048 or p_y not between -32 and 80 then return -2; end if;
  if p_item is null or p_item not between 1 and 999 or p_item = 24 or p_amount is null or p_amount not between 1 and 64 then return -2; end if;
  delete from public.ark_drops where at < now() - interval '15 minutes';
  if (select count(*) from public.ark_drops d where d.by_user = auth.uid()) >= 30 then return -3; end if;
  insert into public.ark_drops(by_user, x, y, z, item, amount) values (auth.uid(), p_x, p_y, p_z, p_item, p_amount) returning id into nid;
  return nid;
end $function$;
