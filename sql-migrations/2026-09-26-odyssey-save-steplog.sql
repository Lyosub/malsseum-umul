-- In Odyssey 계정별 저장·복구 + 막힘 기록 (2026-09-26)
-- 1) odyssey_save: 계정마다 게임 진행 전체(JSON)를 저장. 덜 진행한 기록으로는 덮어쓰지 않고(p_force 제외),
--    덮어쓸 때마다 직전 기록을 prev_data 에 한 벌 더 남겨 복구 실패가 삭제로 이어지지 않게 한다.
-- 2) odyssey_steplog: 각 이야기 단계를 처음 마쳤을 때 걸린 시간(초)만 계정당 한 번 기록 — 학생 대화·개인정보는 남기지 않음.
--    관리자만 단계별 통계(get_odyssey_stuck)를 본다.
-- 새 표·함수만 추가하며 기존 표·인덱스는 건드리지 않는다. 재실행해도 안전(idempotent).

create table if not exists public.odyssey_save (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  score integer not null default 0,
  prev_data jsonb,
  prev_score integer,
  updated_at timestamptz not null default now()
);
alter table public.odyssey_save enable row level security;   -- 정책 없음: 아래 함수로만 읽고 씀

create or replace function public.save_odyssey_state(p_data jsonb, p_score integer, p_force boolean default false)
returns integer language plpgsql security definer set search_path = public as $$
declare v_old public.odyssey_save;
begin
  if auth.uid() is null or not public.can_see_odyssey() then return 0; end if;
  if p_data is null or octet_length(p_data::text) > 300000 then return 0; end if;
  select * into v_old from public.odyssey_save where user_id = auth.uid();
  if v_old.user_id is null then
    insert into public.odyssey_save (user_id, data, score) values (auth.uid(), p_data, coalesce(p_score, 0));
    return 1;
  end if;
  if coalesce(p_score, 0) < v_old.score and not coalesce(p_force, false) then return 0; end if;   -- 덜 진행한 기록으로 덮어쓰지 않음
  update public.odyssey_save
     set prev_data = case when v_old.score > coalesce(p_score, 0) or v_old.updated_at < now() - interval '1 hour' then v_old.data else coalesce(prev_data, v_old.data) end,
         prev_score = case when v_old.score > coalesce(p_score, 0) or v_old.updated_at < now() - interval '1 hour' then v_old.score else coalesce(prev_score, v_old.score) end,
         data = p_data, score = coalesce(p_score, 0), updated_at = now()
   where user_id = auth.uid();
  return 1;
end $$;

create or replace function public.get_odyssey_state()
returns table(data jsonb, score integer, updated_at timestamptz, prev_score integer)
language sql security definer set search_path = public as $$
  select s.data, s.score, s.updated_at, s.prev_score from public.odyssey_save s
  where s.user_id = auth.uid() and public.can_see_odyssey();
$$;

create or replace function public.get_odyssey_prev_state()
returns jsonb language sql security definer set search_path = public as $$
  select s.prev_data from public.odyssey_save s where s.user_id = auth.uid() and public.can_see_odyssey();
$$;

create table if not exists public.odyssey_steplog (
  user_id uuid not null references auth.users(id) on delete cascade,
  ch integer not null,
  step text not null,
  secs integer not null,
  dev text,
  created_at timestamptz not null default now(),
  primary key (user_id, ch, step)
);
alter table public.odyssey_steplog enable row level security;

create or replace function public.log_odyssey_step(p_ch integer, p_step text, p_secs integer, p_dev text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not public.can_see_odyssey() then return; end if;
  insert into public.odyssey_steplog (user_id, ch, step, secs, dev)
  values (auth.uid(), greatest(0, least(p_ch, 99)), left(p_step, 20), greatest(0, least(coalesce(p_secs, 0), 86400)), left(p_dev, 20))
  on conflict (user_id, ch, step) do nothing;
end $$;

create or replace function public.get_odyssey_stuck()
returns table(ch integer, step text, players bigint, avg_secs integer, median_secs integer, max_secs integer)
language sql security definer set search_path = public as $$
  select l.ch, l.step, count(*), round(avg(l.secs))::int, (percentile_cont(0.5) within group (order by l.secs))::int, max(l.secs)
  from public.odyssey_steplog l
  where exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.is_admin)
  group by l.ch, l.step order by l.ch, l.step;
$$;
