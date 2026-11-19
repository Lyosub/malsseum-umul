-- 2026-11-19 나그네 마을 「이번 주 함께 짓기 목표」
-- 진행도는 서버가 이미 받아 둔 함께 쓰는 세계 기록(ark_world_edits)으로 직접 센다(휴대폰이 보낸 숫자를 믿지 않음).
-- 주는 월요일 0시(한국 시간)에 바뀌고, 목표 세 가지가 차례로 돌아간다. 다시 실행해도 안전.
--   0) 함께 짓는 터에 블록 300개 놓기(느 2:18)  1) 함께 짓는 터에 등불·횃불 20개(마 5:14)  2) 들판 어디서든 블록 1000개(전 4:9)
-- 같은 자리는 마지막 모습 하나로 센다(놓았다 캐면 빠짐). 물은 세지 않는다.

create index if not exists ark_world_edits_at on public.ark_world_edits(at);

create or replace function public.get_ark_village_goal()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  ws timestamptz := date_trunc('week', now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul';
  k int := (floor(extract(epoch from date_trunc('week', now() at time zone 'Asia/Seoul')) / 604800))::int % 3;
  n int; t int; ppl int; mine boolean;
begin
  if not public.can_play_ark() then return null; end if;
  if k = 0 then
    t := 300;
    select count(*), count(distinct user_id), coalesce(bool_or(user_id = auth.uid()), false) into n, ppl, mine
      from ark_world_edits where at >= ws and id <> 0 and id <> 24 and x between 991 and 1056 and z between 753 and 818;
  elsif k = 1 then
    t := 20;
    select count(*), count(distinct user_id), coalesce(bool_or(user_id = auth.uid()), false) into n, ppl, mine
      from ark_world_edits where at >= ws and id in (10, 107, 170, 171, 172, 173, 199) and x between 991 and 1056 and z between 753 and 818;
  else
    t := 1000;
    select count(*), count(distinct user_id), coalesce(bool_or(user_id = auth.uid()), false) into n, ppl, mine
      from ark_world_edits where at >= ws and id <> 0 and id <> 24;
  end if;
  return jsonb_build_object('k', k, 'n', n, 't', t, 'ppl', ppl, 'mine', mine, 'week', to_char(ws at time zone 'Asia/Seoul', 'YYYY-MM-DD'));
end $$;
revoke all on function public.get_ark_village_goal() from public, anon;
grant execute on function public.get_ark_village_goal() to authenticated;

select 'ok — ark village goal' as status, public.get_ark_village_goal() is null as needs_login;
