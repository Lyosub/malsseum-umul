-- 2026-11-18 나그네 마을: 다른 기기에서 이어 하기
-- 단축 칸·가방 칸·녹이는 것·안장 얹은 말·기른 동물·밭·체력·기운·침대 자리·업적·처음 안내를 계정에 저장한다.
-- (가방 안의 물건·옷·도감·열린 제작법·표지판은 원래대로 내 땅 기록 ark_village_plots.data에 저장)
-- 다시 실행해도 안전.
create table if not exists ark_player_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table ark_player_state enable row level security;   -- 정책 없음: 아래 함수로만 읽고 씀

create or replace function public.save_ark_state(p_data jsonb)
returns text language plpgsql security definer set search_path = public as $$
declare t timestamptz := clock_timestamp();
begin
  if not public.can_play_ark() then return null; end if;
  if jsonb_typeof(p_data) <> 'object' or length(p_data::text) > 60000 then return null; end if;
  insert into ark_player_state(user_id, data, updated_at) values (auth.uid(), p_data, t)
    on conflict (user_id) do update set data = excluded.data, updated_at = excluded.updated_at;
  return to_char(t at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"');
end $$;
revoke all on function public.save_ark_state(jsonb) from public, anon;
grant execute on function public.save_ark_state(jsonb) to authenticated;

create or replace function public.get_ark_state()
returns jsonb language sql stable security definer set search_path = public as $$
  select case when public.can_play_ark() then
    (select jsonb_build_object('data', s.data, 'at', to_char(s.updated_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"'))
       from ark_player_state s where s.user_id = auth.uid()) end;
$$;
revoke all on function public.get_ark_state() from public, anon;
grant execute on function public.get_ark_state() to authenticated;

select 'ok — ark player state' as status;
