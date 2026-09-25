-- In Odyssey ⛪ 예배 암호: 그 주일 설교 제목을 맞히면 10달란트 + 설교 본문 구절 카드 (2026-09-26)
-- 정답(설교 제목)은 서버에만 둠 — 게임·공개 저장소에 없음. 주일 12:00(한국 시간)부터 그 주 토요일까지 열림.
-- 매주 설교가 확정되면 아래 insert 한 줄을 추가한다(Claude가 주간 설교 작업 때 등록). 재실행 안전.

create table if not exists odyssey_worship (
  service_date date primary key,
  title text not null,
  answers text[] not null,          -- 띄어쓰기·문장부호 뺀 정답들(제목 + 허용 변형)
  verse_ref text not null,
  verse_text text not null,
  opens_at timestamptz not null
);
alter table odyssey_worship enable row level security;

create table if not exists odyssey_worship_try (
  user_id uuid not null references auth.users(id) on delete cascade,
  d date not null,
  n integer not null default 0,
  primary key (user_id, d)
);
alter table odyssey_worship_try enable row level security;

alter table points_ledger drop constraint if exists points_ledger_action_type_check;
alter table points_ledger add constraint points_ledger_action_type_check
  check (action_type = any (array[
    'attendance','streak_bonus','note','quiz','group_attendance_bonus','group_notes_bonus',
    'admin_award','greeting_draw','book_game','book_game_ot','book_game_nt',
    'match_game_books','match_game_figures','oikos_expense','badge_award','devotion',
    'oikos_donation','oikos_distribute',
    'verse_memory','chosung_quiz','qt_reflection','devotion_streak',
    'verse_card_daily','verse_card_weekly','verse_card_monthly',
    'ox_quiz',
    'sermon_line',
    'odyssey_chapter',
    'odyssey_daily',
    'odyssey_weekly',
    'odyssey_achieve',
    'odyssey_worship'
  ]));

-- 지금 열려 있는 예배 암호(가장 최근, 열린 뒤 7일 안). 정답은 주지 않고 글자 수 힌트만, 맞힌 뒤에만 구절
create or replace function public.get_odyssey_worship()
returns jsonb language sql stable security definer set search_path = public as $$
  select case when public.can_see_odyssey() then (
    select jsonb_build_object(
      'service_date', w.service_date,
      'len', char_length(w.answers[1]),
      'claimed', exists (select 1 from points_ledger l where l.user_id = auth.uid() and l.action_type = 'odyssey_worship' and l.ref_date = w.service_date),
      'verse_ref', case when exists (select 1 from points_ledger l where l.user_id = auth.uid() and l.action_type = 'odyssey_worship' and l.ref_date = w.service_date) then w.verse_ref end,
      'verse_text', case when exists (select 1 from points_ledger l where l.user_id = auth.uid() and l.action_type = 'odyssey_worship' and l.ref_date = w.service_date) then w.verse_text end,
      'title', case when exists (select 1 from points_ledger l where l.user_id = auth.uid() and l.action_type = 'odyssey_worship' and l.ref_date = w.service_date) then w.title end)
    from odyssey_worship w
    where w.opens_at <= now() and w.opens_at > now() - interval '7 days'
    order by w.service_date desc limit 1) end;
$$;

create or replace function public.submit_odyssey_worship(p_answer text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare w odyssey_worship; a text; v_n int; tries int; today date := (now() at time zone 'Asia/Seoul')::date;
begin
  if auth.uid() is null or not public.can_see_odyssey() then return jsonb_build_object('ok', false, 'msg', '로그인이 필요해요'); end if;
  select * into w from odyssey_worship where opens_at <= now() and opens_at > now() - interval '7 days' order by service_date desc limit 1;
  if w.service_date is null then return jsonb_build_object('ok', false, 'msg', '지금은 열린 예배 암호가 없어요'); end if;
  insert into odyssey_worship_try (user_id, d, n) values (auth.uid(), today, 1)
  on conflict (user_id, d) do update set n = odyssey_worship_try.n + 1 returning n into tries;
  if tries > 10 then return jsonb_build_object('ok', false, 'msg', '오늘은 더 입력할 수 없어요. 내일 다시 해 봐요'); end if;
  a := regexp_replace(lower(coalesce(p_answer, '')), '[^가-힣a-z0-9]', '', 'g');
  if not (a = any (w.answers)) then return jsonb_build_object('ok', false, 'msg', '아쉬워요, 설교 제목이 아니에요. 주보나 설교 PPT 첫 장을 떠올려 보세요!'); end if;
  insert into points_ledger (user_id, action_type, points, ref_date, note)
  values (auth.uid(), 'odyssey_worship', 10, w.service_date, 'In Odyssey 예배 암호 ' || w.service_date)
  on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;
  get diagnostics v_n = row_count;
  return jsonb_build_object('ok', true, 'new', v_n > 0, 'talents', case when v_n > 0 then 10 else 0 end,
    'service_date', w.service_date, 'title', w.title, 'verse_ref', w.verse_ref, 'verse_text', w.verse_text);
end $$;

revoke all on function public.get_odyssey_worship() from public, anon;
revoke all on function public.submit_odyssey_worship(text) from public, anon;
grant execute on function public.get_odyssey_worship() to authenticated;
grant execute on function public.submit_odyssey_worship(text) to authenticated;
