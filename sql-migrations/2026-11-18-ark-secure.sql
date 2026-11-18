-- 2026-11-18 나그네 마을 보안·기능 보강(GPT 검토 반영). 다시 실행해도 안전.
--  1) 함께 쓰는 세계: 서버가 바꿀 수 있는 자리(남의 땅·방주·마을 마당 금지)와 블록 종류(허용 목록)를 검사
--     → 다른 학생에게는 서버가 받은 것만 DB 변경 알림으로 전달(휴대폰이 보낸 것을 그대로 믿지 않음)
--  2) 내 땅 실시간 바꿈도 서버가 땅 주인인지 확인한 뒤 전달(ark_plot_edits, 2분 지나면 지움)
--  3) 이름표: 서버의 닉네임으로(get_ark_names)
--  4) 이어 하기 저장 충돌: 다른 기기가 더 새로 저장했으면 덮지 않고 알려 줌(save_ark_state2)
--  5) 선생님: 함께 짓는 터 되돌리기(admin_revert_commons)
--  6) 친구 집 구경: 내 땅 공개와 한 줄 소개(set_ark_showcase / get_ark_showcase)

-- 게임 좌표(ark-game.js와 같게): 방주 x 873~1174 z 845~896 y 15~46, 마을 마당 [866,838]-[1181,903]·[906,895]-[1145,1141] y 12 이상,
-- 땅 64필지 x 914 + 28칸마다 24칸, z 912 + 28칸마다 24칸, 땅 높이 y 13~47, 함께 짓는 터 x 991~1056 z 753~818
create or replace function public._ark_block_ok(p_id int)
returns boolean language sql immutable as $$
  select p_id = any (array[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,44,45,46,47,48,49,50,51,52,53,54,55,56,60,61,62,63,64,65,66,67,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,124,125,126,127,128,130,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,196,197,198,199]);
$$;
create or replace function public._ark_plot_at(x int, z int)
returns int language sql immutable as $$
  select case when x - 914 >= 0 and z - 912 >= 0 and (x - 914) / 28 < 8 and (z - 912) / 28 < 8 and (x - 914) % 28 < 24 and (z - 912) % 28 < 24
    then ((z - 912) / 28) * 8 + (x - 914) / 28 else -1 end;
$$;
create or replace function public._ark_wild_ok(x int, y int, z int)
returns boolean language sql immutable as $$
  select public._ark_plot_at(x, z) < 0
    and not (x between 873 and 1174 and z between 845 and 896 and y between 15 and 46)
    and not (y >= 12 and ((x between 866 and 1181 and z between 838 and 903) or (x between 906 and 1145 and z between 895 and 1141)));
$$;

-- 1) 함께 쓰는 세계: 검사해서 받은 것만 저장(받은 개수를 돌려줌)
create or replace function public.put_ark_edits(p_edits jsonb)
returns int language plpgsql security definer set search_path = public as $$
declare n int; m timestamptz := date_trunc('minute', now()); used int; ok int;
begin
  if not public.can_play_ark() then return -1; end if;
  if jsonb_typeof(p_edits) <> 'array' then return 0; end if;
  n := jsonb_array_length(p_edits);
  if n = 0 then return 0; end if;
  if n > 300 then return -2; end if;
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
    where x between 0 and 2047 and y between 1 and 79 and z between 0 and 2047 and public._ark_block_ok(id) and public._ark_wild_ok(x, y, z)
  )
  insert into ark_world_edits(x, y, z, id, user_id, at)
  select x, y, z, id::smallint, auth.uid(), now() from good
  on conflict (x, y, z) do update set id = excluded.id, user_id = excluded.user_id, at = excluded.at;
  get diagnostics ok = row_count;
  return ok;
end $$;
revoke all on function public.put_ark_edits(jsonb) from public, anon;
grant execute on function public.put_ark_edits(jsonb) to authenticated;

-- 다른 학생에게 DB 변경 알림으로 전달하려면 읽기 정책 + 알림 목록
drop policy if exists ark_world_edits_read on ark_world_edits;
create policy ark_world_edits_read on ark_world_edits for select to authenticated using (public.can_play_ark());

-- 2) 내 땅 실시간 바꿈(땅 주인만, 2분만 보관 — 저장은 원래대로 내 땅 기록에)
create table if not exists ark_plot_edits (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  x int not null, y int not null, z int not null, b smallint not null,
  at timestamptz not null default now()
);
alter table ark_plot_edits enable row level security;
drop policy if exists ark_plot_edits_read on ark_plot_edits;
create policy ark_plot_edits_read on ark_plot_edits for select to authenticated using (public.can_play_ark());

create or replace function public.put_plot_edits(p_edits jsonb)
returns int language plpgsql security definer set search_path = public as $$
declare n int; m timestamptz := date_trunc('minute', now()); used int; mine int; ok int;
begin
  if not public.can_play_ark() then return -1; end if;
  if jsonb_typeof(p_edits) <> 'array' then return 0; end if;
  n := jsonb_array_length(p_edits);
  if n = 0 then return 0; end if;
  if n > 300 then return -2; end if;
  select plot_idx into mine from ark_village_plots where user_id = auth.uid() limit 1;
  if mine is null then return -4; end if;
  insert into ark_edit_budget(user_id, minute, n) values (auth.uid(), m, n)
    on conflict (user_id, minute) do update set n = ark_edit_budget.n + excluded.n
    returning ark_edit_budget.n into used;
  if used > 1500 then return -3; end if;
  insert into ark_plot_edits(user_id, x, y, z, b)
  select auth.uid(), (e->>0)::int, (e->>1)::int, (e->>2)::int, (e->>3)::smallint
  from jsonb_array_elements(p_edits) e
  where jsonb_typeof(e) = 'array' and jsonb_array_length(e) = 4
    and public._ark_plot_at((e->>0)::int, (e->>2)::int) = mine
    and (e->>1)::int between 13 and 47 and public._ark_block_ok((e->>3)::int);
  get diagnostics ok = row_count;
  delete from ark_plot_edits where at < now() - interval '2 minutes';
  return ok;
end $$;
revoke all on function public.put_plot_edits(jsonb) from public, anon;
grant execute on function public.put_plot_edits(jsonb) to authenticated;

do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'ark_world_edits') then
    alter publication supabase_realtime add table public.ark_world_edits;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'ark_plot_edits') then
    alter publication supabase_realtime add table public.ark_plot_edits;
  end if;
end $$;

-- 3) 이름표는 서버의 닉네임으로
create or replace function public.get_ark_names(p_ids uuid[])
returns table(user_id uuid, nick text) language sql stable security definer set search_path = public as $$
  select p.user_id, p.nickname from profiles p
  where public.can_play_ark() and p.user_id = any (p_ids[1:50]);
$$;
revoke all on function public.get_ark_names(uuid[]) from public, anon;
grant execute on function public.get_ark_names(uuid[]) to authenticated;

-- 4) 이어 하기 저장: 내가 마지막으로 본 저장(p_base)보다 서버가 더 새로우면 덮지 않고 서버 것을 돌려줌
create or replace function public.save_ark_state2(p_data jsonb, p_base text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare t timestamptz := clock_timestamp(); cur timestamptz; cur_data jsonb;
begin
  if not public.can_play_ark() then return null; end if;
  if jsonb_typeof(p_data) <> 'object' or length(p_data::text) > 60000 then return null; end if;
  select updated_at, data into cur, cur_data from ark_player_state where user_id = auth.uid() for update;
  if cur is not null and p_base is not null and cur > (p_base::timestamptz) + interval '1 millisecond' then
    return jsonb_build_object('conflict', true, 'data', cur_data, 'at', to_char(cur at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'));
  end if;
  insert into ark_player_state(user_id, data, updated_at) values (auth.uid(), p_data, t)
    on conflict (user_id) do update set data = excluded.data, updated_at = excluded.updated_at;
  return jsonb_build_object('at', to_char(t at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'));
end $$;
revoke all on function public.save_ark_state2(jsonb, text) from public, anon;
grant execute on function public.save_ark_state2(jsonb, text) to authenticated;

-- 5) 선생님: 함께 짓는 터를 최근 n분(0이면 전부) 되돌리기 → 지워진 자리는 처음 풀밭으로
create or replace function public.admin_revert_commons(p_minutes int)
returns int language plpgsql security definer set search_path = public as $$
declare k int;
begin
  if not public.is_ark_admin() then return -1; end if;
  delete from ark_world_edits
   where x between 991 and 1056 and z between 753 and 818
     and (coalesce(p_minutes, 0) <= 0 or at > now() - make_interval(mins => p_minutes));
  get diagnostics k = row_count;
  return k;
end $$;
revoke all on function public.admin_revert_commons(int) from public, anon;
grant execute on function public.admin_revert_commons(int) to authenticated;

-- 6) 친구 집 구경: 내 땅 공개 여부와 한 줄 소개(정해진 글 번호)
alter table ark_village_plots add column if not exists show boolean not null default false;
alter table ark_village_plots add column if not exists intro smallint not null default 0;
create or replace function public.set_ark_showcase(p_show boolean, p_intro int)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not public.can_play_ark() then return false; end if;
  update ark_village_plots set show = coalesce(p_show, false), intro = greatest(0, least(20, coalesce(p_intro, 0))) where user_id = auth.uid();
  return found;
end $$;
revoke all on function public.set_ark_showcase(boolean, int) from public, anon;
grant execute on function public.set_ark_showcase(boolean, int) to authenticated;
create or replace function public.get_ark_showcase()
returns table(plot_idx int, nick text, intro int, mine boolean, updated_at timestamptz)
language sql stable security definer set search_path = public as $$
  select v.plot_idx, p.nickname, v.intro, v.user_id = auth.uid(), v.updated_at
  from ark_village_plots v join profiles p on p.user_id = v.user_id
  where public.can_play_ark() and (v.show or v.user_id = auth.uid())
  order by v.updated_at desc limit 64;
$$;
revoke all on function public.get_ark_showcase() from public, anon;
grant execute on function public.get_ark_showcase() to authenticated;

select 'ok — ark secure' as status;
