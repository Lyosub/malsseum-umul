-- 2026-09-18  중등부 주간 참여형 콘텐츠 1단계: ① 오늘의 한 줄 · ② 물어봐도 돼
--
-- 기획안: NEW BRAIN 볼트 `05. 운영 관리/중등부 주간 참여형 콘텐츠 기획안 (2026-09-17).md`
--
-- 설계 원칙
--  · 기존 notes 테이블(greeting/gratitude/prayer)에 타입을 추가하지 않고 별도 테이블로 분리한다.
--    notes 에는 award_note_points 트리거·삭제 환수·뱃지 집계·그룹 보너스·기도제목 캡·
--    get_public_notes 필터가 전부 물려 있어 파급이 넓다. 신규 기능은 격리한다.
--  · ② 물어봐도 돼는 **user_id 를 아예 저장하지 않는다.** 익명성이 이 기능의 전부이고,
--    한 번이라도 추적 가능하다는 인상을 주면 기능이 죽는다. 작성자 식별 컬럼을 두지 않음으로써
--    기술적으로 추적이 불가능하게 만든다.
--  · 달란트 적립은 기존 패턴 그대로:
--      insert into points_ledger ... on conflict (user_id, action_type, ref_date)
--      where action_type <> 'admin_award' do nothing
--    이 predicate 는 부분 유니크 인덱스 points_ledger_auto_uniq 와 **정확히 일치해야 한다.**
--    (2026-09-06-oikos-expense.sql 에서 <> 'admin_award' 로 원상복구된 것이 현재 상태)
--  · 재실행 안전: create table if not exists / create or replace / drop constraint if exists.

-- ─────────────────────────────────────────────────────────────
-- 0) points_ledger.action_type 화이트리스트에 sermon_line 추가
--    (② 물어봐도 돼는 익명이라 적립 대상이 아니다 — user_id 가 없으므로 적립 자체가 불가능)
-- ─────────────────────────────────────────────────────────────
alter table public.points_ledger drop constraint if exists points_ledger_action_type_check;
alter table public.points_ledger add constraint points_ledger_action_type_check
  check (action_type = any (array[
    'attendance','streak_bonus','note','quiz','group_attendance_bonus','group_notes_bonus',
    'admin_award','greeting_draw','book_game','book_game_ot','book_game_nt',
    'match_game_books','match_game_figures','oikos_expense','badge_award','devotion',
    'oikos_donation','oikos_distribute',
    'verse_memory','chosung_quiz','qt_reflection','devotion_streak',
    'verse_card_daily','verse_card_weekly','verse_card_monthly',
    'ox_quiz',
    'sermon_line'
  ]));

-- ─────────────────────────────────────────────────────────────
-- 1) ① 오늘의 한 줄 — sermon_lines
-- ─────────────────────────────────────────────────────────────
create table if not exists public.sermon_lines (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references auth.users(id) on delete cascade,
  service_date date not null,                      -- 그 한 줄이 속한 주일(직전 일요일)
  content      text not null,
  is_picked    boolean not null default false,     -- 인스타에 실린 것(교역자가 지정)
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- 한 사람이 한 주일에 한 줄. 다시 쓰면 수정된다(중복 적립 방지도 겸함).
create unique index if not exists sermon_lines_user_service_uniq
  on public.sermon_lines (user_id, service_date);

create index if not exists sermon_lines_service_idx
  on public.sermon_lines (service_date desc, created_at desc);

alter table public.sermon_lines enable row level security;

-- 직접 접근은 본인 것만. 목록 조회는 아래 SECURITY DEFINER 함수로만 한다.
drop policy if exists "본인 한 줄만 조회" on public.sermon_lines;
create policy "본인 한 줄만 조회" on public.sermon_lines
  for select using (auth.uid() = user_id);

drop policy if exists "본인 한 줄만 작성" on public.sermon_lines;
create policy "본인 한 줄만 작성" on public.sermon_lines
  for insert with check (auth.uid() = user_id);

drop policy if exists "본인 한 줄만 수정" on public.sermon_lines;
create policy "본인 한 줄만 수정" on public.sermon_lines
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- KST 기준 "가장 최근 주일"(오늘이 일요일이면 오늘)
create or replace function public.current_service_date()
returns date
language sql
stable
set search_path = public
as $$
  select (d - ((extract(dow from d))::int))::date
  from (select (now() at time zone 'Asia/Seoul')::date as d) t;
$$;

grant execute on function public.current_service_date() to anon, authenticated;

-- 제출(최초 1회 +2달란트, 이후 같은 주일에 다시 쓰면 내용만 수정되고 추가 적립 없음)
create or replace function public.submit_sermon_line(p_content text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_service date := current_service_date();
  v_text    text := btrim(coalesce(p_content, ''));
  v_awarded integer := 0;
begin
  if auth.uid() is null then
    raise exception '로그인이 필요합니다.';
  end if;
  if char_length(v_text) < 10 then
    raise exception '열 글자 이상 써 주세요.';
  end if;
  if char_length(v_text) > 100 then
    raise exception '백 글자까지 쓸 수 있어요.';
  end if;

  insert into sermon_lines (user_id, service_date, content)
  values (auth.uid(), v_service, v_text)
  on conflict (user_id, service_date)
  do update set content = excluded.content, updated_at = now();

  -- 적립은 그 주일에 딱 한 번. 수정해도 중복 적립되지 않는다.
  insert into points_ledger (user_id, action_type, points, ref_date)
  values (auth.uid(), 'sermon_line', 2, v_service)
  on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;

  if found then v_awarded := 2; end if;
  return v_awarded;
end;
$$;

grant execute on function public.submit_sermon_line(text) to authenticated;

-- 내가 이번 주일에 쓴 한 줄(없으면 행 없음)
create or replace function public.get_my_sermon_line()
returns table(content text, service_date date, is_picked boolean)
language sql
security definer
set search_path = public
as $$
  select s.content, s.service_date, s.is_picked
  from sermon_lines s
  where s.user_id = auth.uid()
    and s.service_date = current_service_date();
$$;

grant execute on function public.get_my_sermon_line() to authenticated;

-- 친구들의 한 줄 목록. 로그인한 사람만 볼 수 있고, 닉네임만 나온다(실명 없음).
create or replace function public.get_sermon_lines(
  p_service_date date default null,
  p_limit integer default 100
)
returns table(
  id bigint, content text, nickname text,
  created_at timestamptz, is_picked boolean, is_mine boolean
)
language sql
security definer
set search_path = public
as $$
  select
    s.id, s.content, p.nickname, s.created_at, s.is_picked,
    (s.user_id = auth.uid()) as is_mine
  from sermon_lines s
  join profiles p on p.user_id = s.user_id
  where auth.uid() is not null
    and s.service_date = coalesce(p_service_date, current_service_date())
  order by s.is_picked desc, s.created_at desc
  limit greatest(coalesce(p_limit, 100), 0);
$$;

grant execute on function public.get_sermon_lines(date, integer) to authenticated;

-- 교역자: 인스타에 실은 한 줄 표시/해제
create or replace function public.admin_pick_sermon_line(p_id bigint, p_picked boolean)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from profiles p
    where p.user_id = auth.uid()
      and (coalesce(p.is_admin,false) or coalesce(p.is_department_head,false) or coalesce(p.is_teacher,false))
  ) then
    raise exception '권한이 없습니다.';
  end if;
  update sermon_lines set is_picked = coalesce(p_picked, false) where id = p_id;
  return found;
end;
$$;

grant execute on function public.admin_pick_sermon_line(bigint, boolean) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 2) ② 물어봐도 돼 — anon_questions
--    작성자 식별 정보를 일절 저장하지 않는다. user_id 컬럼 자체가 없다.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.anon_questions (
  id          bigint generated always as identity primary key,
  content     text not null,
  status      text not null default 'new',
  answer      text,
  answered_at timestamptz,
  created_at  timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'anon_questions_status_chk') then
    alter table public.anon_questions add constraint anon_questions_status_chk
      check (status in ('new','picked','answered','hidden'));
  end if;
end $$;

create index if not exists anon_questions_status_idx
  on public.anon_questions (status, created_at desc);

alter table public.anon_questions enable row level security;

-- 직접 select/insert 는 전면 차단한다. 오직 아래 SECURITY DEFINER 함수를 통해서만 접근한다.
-- (정책을 하나도 만들지 않으면 RLS 가 켜진 테이블은 기본 거부다)

-- 질문 넣기. 로그인 여부와 무관하게 누구나 가능하고, 누가 넣었는지는 저장되지 않는다.
create or replace function public.submit_anon_question(p_content text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_text text := btrim(coalesce(p_content, ''));
begin
  if char_length(v_text) < 5 then
    raise exception '질문을 조금만 더 자세히 써 주세요.';
  end if;
  if char_length(v_text) > 500 then
    raise exception '오백 글자까지 쓸 수 있어요.';
  end if;

  -- 같은 내용이 24시간 안에 이미 들어와 있으면 무시한다(도배 방지).
  -- 익명이라 작성자 기준 제한이 불가능하므로 내용 기준으로만 막는다.
  if exists (
    select 1 from anon_questions
    where content = v_text and created_at > now() - interval '24 hours'
  ) then
    return true;   -- 사용자에게는 정상 접수된 것처럼 보이게 한다
  end if;

  insert into anon_questions (content) values (v_text);
  return true;
end;
$$;

grant execute on function public.submit_anon_question(text) to anon, authenticated;

-- 답변이 게시된 질문만 공개. 누구나 볼 수 있다.
create or replace function public.get_answered_questions(p_limit integer default 30)
returns table(id bigint, content text, answer text, answered_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select q.id, q.content, q.answer, q.answered_at
  from anon_questions q
  where q.status = 'answered' and q.answer is not null
  order by q.answered_at desc nulls last
  limit greatest(coalesce(p_limit, 30), 0);
$$;

grant execute on function public.get_answered_questions(integer) to anon, authenticated;

-- 교역자 전용: 들어온 질문 보기
create or replace function public.admin_list_questions(
  p_status text default null,
  p_limit integer default 100
)
returns table(id bigint, content text, status text, answer text, created_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from profiles p
    where p.user_id = auth.uid()
      and (coalesce(p.is_admin,false) or coalesce(p.is_department_head,false) or coalesce(p.is_teacher,false))
  ) then
    raise exception '권한이 없습니다.';
  end if;

  return query
    select q.id, q.content, q.status, q.answer, q.created_at
    from anon_questions q
    where p_status is null or q.status = p_status
    order by q.created_at desc
    limit greatest(coalesce(p_limit, 100), 0);
end;
$$;

grant execute on function public.admin_list_questions(text, integer) to authenticated;

-- 교역자 전용: 답변 저장 / 상태 변경(숨김 포함)
create or replace function public.admin_answer_question(
  p_id bigint,
  p_answer text default null,
  p_status text default 'answered'
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from profiles p
    where p.user_id = auth.uid()
      and (coalesce(p.is_admin,false) or coalesce(p.is_department_head,false) or coalesce(p.is_teacher,false))
  ) then
    raise exception '권한이 없습니다.';
  end if;
  if p_status not in ('new','picked','answered','hidden') then
    raise exception '알 수 없는 상태입니다.';
  end if;
  if p_status = 'answered' and btrim(coalesce(p_answer, '')) = '' then
    raise exception '답변 내용을 입력해 주세요.';
  end if;

  update anon_questions
     set answer      = coalesce(p_answer, answer),
         status      = p_status,
         answered_at = case when p_status = 'answered' then now() else answered_at end
   where id = p_id;
  return found;
end;
$$;

grant execute on function public.admin_answer_question(bigint, text, text) to authenticated;

select '오늘의 한 줄 + 물어봐도 돼 마이그레이션 완료' as status;
