-- 2026-09-12  함수 4개의 한글 문자열이 깨진 것(모지바케) 복구
--
-- 원인: 이전에 Supabase Management API(database/query)로 함수를 적용할 때
--   PowerShell이 요청 본문을 UTF-8이 아니라 시스템 기본 인코딩(CP949)으로 보내
--   raise exception 안의 한글이 이중 오인코딩됨. 예) '로그인이 필요합니다.' -> '濡쒓렇?몄씠 ?꾩슂?⑸땲??'
--   학생이 "함께 기도했어요" 하루 5회 상한에 걸렸을 때 깨진 팝업이 떠서 발견됨(2026-09-12 김다희 제보).
--
-- 조치: 정상 UTF-8 소스로 4개 함수를 create or replace. 로직/시그니처는 그대로, 문구만 정상화.
--   (toggle_prayer_reaction = sql-migrations/2026-09-11-prayer-cap-5.sql,
--    check_in_today / admin_set_teacher = schema.sql,
--    set_reading_progress = sql-migrations/2026-09-12-reading-progress.sql 와 동일 내용)

-- 1) 함께 기도했어요 토글 (학생 직접 노출 — 최우선)
create or replace function toggle_prayer_reaction(p_note_id bigint)
returns table(pray_count integer, i_prayed boolean)
language plpgsql
security definer
set search_path = public
as $func$
declare
  v_exists boolean;
  v_today_count integer;
begin
  if auth.uid() is null then
    raise exception '로그인이 필요합니다.';
  end if;
  if not exists (select 1 from notes where id = p_note_id and type = 'prayer') then
    raise exception '기도제목을 찾을 수 없습니다.';
  end if;

  select exists(select 1 from prayer_reactions where note_id = p_note_id and user_id = auth.uid()) into v_exists;

  if v_exists then
    delete from prayer_reactions where note_id = p_note_id and user_id = auth.uid();
  else
    select count(*) into v_today_count
    from prayer_reactions pr
    where pr.user_id = auth.uid()
      and (pr.created_at at time zone 'Asia/Seoul')::date = (now() at time zone 'Asia/Seoul')::date;
    if v_today_count >= 5 then
      raise exception '오늘은 "함께 기도했어요"를 5번까지 눌렀어요. 내일 다시 눌러주세요.';
    end if;
    insert into prayer_reactions (note_id, user_id) values (p_note_id, auth.uid()) on conflict do nothing;
  end if;

  return query
    select coalesce(count(*), 0)::integer, (not v_exists)
    from prayer_reactions where note_id = p_note_id;
end;
$func$;

-- 2) 출석 체크
create or replace function check_in_today()
returns boolean
language plpgsql
security definer
set search_path = public
as $func$
declare
  v_today date := (now() at time zone 'Asia/Seoul')::date;
begin
  if auth.uid() is null then
    raise exception '로그인이 필요합니다.';
  end if;

  insert into attendance (user_id, date)
  values (auth.uid(), v_today)
  on conflict (user_id, date) do nothing;

  return found;
end;
$func$;

-- 3) 교사 지정 (관리자 전용)
create or replace function admin_set_teacher(p_user_id uuid, p_is_teacher boolean)
returns boolean
language plpgsql
security definer
set search_path = public
as $func$
begin
  if not exists (
    select 1 from profiles where user_id = auth.uid() and is_admin = true
  ) then
    raise exception '관리자만 지정할 수 있습니다.';
  end if;

  perform set_config('app.allow_privilege_change', 'true', true);
  update profiles set is_teacher = p_is_teacher where user_id = p_user_id;
  return true;
end;
$func$;

-- 4) 성경 이어 읽기 진도 저장 (2026-09-12 신규분도 같은 경로로 깨져 있었음)
create or replace function set_reading_progress(p_book_id integer, p_book_name text, p_chapter integer)
returns void
language plpgsql
security definer
set search_path to 'public'
as $func$
begin
  if auth.uid() is null then
    raise exception '로그인이 필요합니다.';
  end if;
  if p_chapter is null or p_chapter < 1 then
    raise exception '잘못된 장 번호입니다.';
  end if;
  insert into public.reading_progress (user_id, book_id, book_name, chapter, updated_at)
  values (auth.uid(), coalesce(p_book_id, 0), coalesce(nullif(btrim(p_book_name), ''), '?'), p_chapter, now())
  on conflict (user_id) do update
    set book_id    = excluded.book_id,
        book_name  = excluded.book_name,
        chapter    = excluded.chapter,
        updated_at = now();
end;
$func$;
