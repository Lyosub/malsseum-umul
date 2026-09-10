-- 2026-09-11  "함께 기도했어요" 하루 상한 3 → 5 로 완화
--   난이도 조절은 기도친구 뱃지 횟수 기준(10/30/60/100/150)이 담당하고,
--   하루 상한은 farming 방지용이므로 3은 다소 빡빡해서 5로 올린다.
--   상한을 올리는 것이라 소급 영향 없음(이미 삭제된 초과 기록/회수된 뱃지는 그대로).
-- 재실행 안전: create or replace.

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
