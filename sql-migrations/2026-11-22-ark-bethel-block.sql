-- 2026-11-22 나그네 마을: 세워 둔 벧엘 돌 블록(483)을 허용 블록에 추가

CREATE OR REPLACE FUNCTION public._ark_block_ok(p_id integer)
 RETURNS boolean
 LANGUAGE sql
 IMMUTABLE
AS $function$
  select p_id = any (array[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,96,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,124,125,126,127,128,130,133,134,135,136,137,138,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,196,197,198,199,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255,400,401,402,403,404,405,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,460,461,462,463,464,465,466,467,468,469,470,480,481,482,483,501,502,503,504,505,506,507,508,510,511,512,513,520,521,522,523,524,525,526,527,528,529,530,531,532,533,534,535,536,540,541,542,543,900,901,902,903,904,905,906,907,908,909,910,911,912,913,914,915,916,917,918,919,940,941,942,943,944,945,946,947,948,949,960,961,962,963,964,965,966,967,968,969]);
$function$;

select 'ok — ark bethel block 483' as status;

-- 남이 세운 벧엘 돌 칸은 세운 사람(과 관리자)만 바꿀 수 있게: put_ark_edits

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
      and (adm or not exists (select 1 from ark_world_edits w where w.x = v.x and w.y = v.y and w.z = v.z and w.id = 483 and w.user_id <> auth.uid()))
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
