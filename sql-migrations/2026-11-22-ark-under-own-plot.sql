-- 2026-11-22 나그네 마을: 내 땅 아래(y < 13, 땅 기록에 들어가지 않는 깊이)는 그 땅 주인이 캐고 놓을 수 있게.
-- 땅 기록(put_plot_edits)은 그대로 y 13~47만 담고, 그 아래는 땅 밖 수정(ark_world_edits)으로 남긴다. 다른 사람 땅 아래는 여전히 못 고침.

create or replace function public._ark_own_under(x integer, y integer, z integer)
 returns boolean
 language sql
 stable
 security definer
 set search_path to 'public'
as $function$
  select y < 13 and public._ark_plot_at(x, z) >= 0
    and exists (select 1 from ark_village_plots p where p.user_id = auth.uid() and p.plot_idx = public._ark_plot_at(x, z));
$function$;
revoke all on function public._ark_own_under(integer, integer, integer) from public, anon;
grant execute on function public._ark_own_under(integer, integer, integer) to authenticated;

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
    where x between 0 and 4095 and y between -31 and 79 and z between 0 and 4095 and public._ark_block_ok(id)
      and (
        (adm and public._ark_plot_at(x, z) < 0)
        or ((public._ark_wild_ok(x, y, z) or public._ark_own_under(x, y, z)) and public._ark_project_edit_ok(x,z)
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

select 'ok — ark under own plot' as status;
