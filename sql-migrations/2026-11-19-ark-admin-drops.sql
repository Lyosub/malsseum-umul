-- 나그네 마을: ① 관리자는 어디서든 캐고 놓기(방주·마을 마당·개척지·공사장 포함, 다른 사람 땅은 블록 부분만 관리자 함수로)
--             ② 땅에 버린 물건을 다른 사람이 주울 수 있게(먼저 줍는 사람, 15분 뒤 사라짐)
-- 코드 배포 전에 적용해도 되고 뒤에 적용해도 된다(새 함수만 쓰는 쪽은 없으면 조용히 실패).
begin;

-- ── ① 땅 밖 블록 저장: 관리자는 검사 통과(단, 개인 땅 칸은 아래 관리자 함수로) ──
create or replace function public.put_ark_edits(p_edits jsonb)
returns int language plpgsql security definer set search_path = public as $$
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
    where x between 0 and 2047 and y between 1 and 79 and z between 0 and 2047 and public._ark_block_ok(id)
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
end $$;
revoke all on function public.put_ark_edits(jsonb) from public, anon;
grant execute on function public.put_ark_edits(jsonb) to authenticated;

-- 다른 사람 땅: 관리자가 고친 그 땅의 「블록 부분」만 바꾼다(가방·도감 등 | 뒤의 주인 기록은 그대로)
create or replace function public.admin_set_plot_blocks(p_plot int, p_blocks text)
returns boolean language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not public.is_ark_admin() then return false; end if;
  if p_plot is null or p_blocks is null or char_length(p_blocks) > 300000 or p_blocks !~ '^r[0-3]:[A-Za-z0-9+/=]*$' then return false; end if;
  update public.ark_village_plots v
     set data = p_blocks || coalesce(case when position('|' in v.data) > 0 then substring(v.data from position('|' in v.data)) end, ''),
         updated_at = now()
   where v.plot_idx = p_plot;
  return found;
end $$;
revoke all on function public.admin_set_plot_blocks(int, text) from public, anon;
grant execute on function public.admin_set_plot_blocks(int, text) to authenticated;

-- ── ② 땅에 버린 물건 ──
create table if not exists public.ark_drops (
  id bigserial primary key,
  by_user uuid not null references auth.users(id) on delete cascade,
  x real not null, y real not null, z real not null,
  item int not null check (item between 1 and 999 and item <> 24),
  amount int not null check (amount between 1 and 64),
  at timestamptz not null default now()
);
create index if not exists ark_drops_xz_idx on public.ark_drops(x, z);
alter table public.ark_drops enable row level security;
revoke all on public.ark_drops from public, anon, authenticated;

create or replace function public.drop_ark_item(p_x real, p_y real, p_z real, p_item int, p_amount int)
returns bigint language plpgsql security definer set search_path = public, pg_temp as $$
declare nid bigint;
begin
  if auth.uid() is null or not public.can_play_ark() then return -1; end if;
  if p_x is null or p_y is null or p_z is null or p_x not between 0 and 2048 or p_z not between 0 and 2048 or p_y not between 0 and 80 then return -2; end if;
  if p_item is null or p_item not between 1 and 999 or p_item = 24 or p_amount is null or p_amount not between 1 and 64 then return -2; end if;
  delete from public.ark_drops where at < now() - interval '15 minutes';
  if (select count(*) from public.ark_drops d where d.by_user = auth.uid()) >= 30 then return -3; end if;
  insert into public.ark_drops(by_user, x, y, z, item, amount) values (auth.uid(), p_x, p_y, p_z, p_item, p_amount) returning id into nid;
  return nid;
end $$;
revoke all on function public.drop_ark_item(real, real, real, int, int) from public, anon;
grant execute on function public.drop_ark_item(real, real, real, int, int) to authenticated;

create or replace function public.get_ark_drops(p_x real, p_z real)
returns table(id bigint, x real, y real, z real, item int, amount int, mine boolean, age_s int)
language sql stable security definer set search_path = public, pg_temp as $$
  select d.id, d.x, d.y, d.z, d.item, d.amount, d.by_user = auth.uid(), extract(epoch from now() - d.at)::int
  from public.ark_drops d
  where public.can_play_ark() and d.at > now() - interval '15 minutes'
    and abs(d.x - p_x) <= 64 and abs(d.z - p_z) <= 64
  order by d.at desc limit 80;
$$;
revoke all on function public.get_ark_drops(real, real) from public, anon;
grant execute on function public.get_ark_drops(real, real) to authenticated;

create or replace function public.take_ark_drop(p_id bigint)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare r public.ark_drops%rowtype;
begin
  if auth.uid() is null or not public.can_play_ark() then return jsonb_build_object('error','login'); end if;
  delete from public.ark_drops d where d.id = p_id and d.at > now() - interval '15 minutes' returning * into r;
  if not found then return jsonb_build_object('error','gone'); end if;
  return jsonb_build_object('item', r.item, 'amount', r.amount);
end $$;
revoke all on function public.take_ark_drop(bigint) from public, anon;
grant execute on function public.take_ark_drop(bigint) to authenticated;

commit;
