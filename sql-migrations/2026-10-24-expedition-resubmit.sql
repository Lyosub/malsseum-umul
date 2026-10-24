-- 가을 원정대: 학생이 낸 말씀·사진을 고쳐 낼 수 있게 (2026-10-24, 전도사님 요청)
CREATE OR REPLACE FUNCTION public.picnic_submit(p_code text, p_member integer, p_kind text, p_q integer, p_text text, p_photo text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  t public.picnic_teams;
  e public.picnic_events;
  a public.picnic_answers;
  v_in text;
  v_ok boolean := false;
  w text;
  v_status text;
  v_points int := 0;
  v_diff int;
  v_prefix text := 'https://qaxwxbaqduxqzjqoahcb.supabase.co/storage/v1/object/public/picnic-photos/';
begin
  select * into t from public.picnic_teams where code = upper(btrim(coalesce(p_code, '')));
  if not found then return jsonb_build_object('ok', false, 'error', '팀 코드를 다시 확인해 주세요.'); end if;
  if not exists (select 1 from public.picnic_members where id = p_member and team_id = t.id) then
    return jsonb_build_object('ok', false, 'error', '내 이름을 다시 골라 주세요.');
  end if;
  select * into e from public.picnic_events where event = t.event;
  if e.results_open then return jsonb_build_object('ok', false, 'error', '미션이 끝났어요. 결과를 확인해 보세요!'); end if;
  -- 현장 미션은 close_at(11/8 14:00)에 마감, 릴스(히든 3)만 reel_until(11/9)까지 (2026-10-23)
  if p_kind <> 'hidden3' and now() > e.close_at then
    return jsonb_build_object('ok', false, 'error', '현장 미션은 끝났어요. 🎬 릴스만 11월 9일(월)까지 보낼 수 있어요!');
  end if;
  if p_kind = 'hidden3' and now() > e.reel_until then
    return jsonb_build_object('ok', false, 'error', '릴스 제출 기한이 지났어요.');
  end if;
  if exists (select 1 from public.picnic_subs where team_id = t.id and member_id = p_member and created_at > now() - interval '3 seconds') then
    return jsonb_build_object('ok', false, 'error', '잠깐만요! 3초 뒤에 다시 눌러 주세요.');
  end if;

  if p_kind in ('animal', 'verse', 'animal_photo') then
    select * into a from public.picnic_answers where q = p_q;
    if not found then return jsonb_build_object('ok', false, 'error', '없는 문제예요.'); end if;
  elsif p_kind = 'place' then
    if p_q < 1 or p_q > 8 then return jsonb_build_object('ok', false, 'error', '없는 장소예요.'); end if;
  elsif p_kind in ('hidden1', 'hidden2', 'hidden3') then
    if not (e.hidden_force or now() >= e.hidden_open_at) then
      return jsonb_build_object('ok', false, 'error', '히든 미션은 아직 열리지 않았어요.');
    end if;
    p_q := 0;
  else
    return jsonb_build_object('ok', false, 'error', '알 수 없는 미션이에요.');
  end if;

  -- 이미 통과한 항목은 다시 받지 않는다 — 2026-10-24부터 동물 이름·릴스만. 말씀·사진은 고쳐 낼 수 있다
  -- (고친 것이 틀리거나 돌려보내져도 전에 통과한 점수는 그대로: 점수는 항목마다 가장 높은 통과 하나)
  if p_kind in ('animal', 'hidden3') and exists (select 1 from public.picnic_subs where team_id = t.id and kind = p_kind and q = p_q and status = 'ok') then
    return jsonb_build_object('ok', false, 'error', '이미 통과한 미션이에요!');
  end if;

  if p_kind = 'animal' then
    v_in := public.picnic_norm(p_text);
    if char_length(v_in) < 1 or char_length(v_in) > 20 then
      return jsonb_build_object('ok', false, 'error', '동물 이름을 적어 주세요.');
    end if;
    if (select count(*) from public.picnic_subs where team_id = t.id and kind = 'animal' and q = p_q and created_at > now() - interval '1 minute') >= 5 then
      return jsonb_build_object('ok', false, 'error', '1분에 5번까지만 도전할 수 있어요. 구절을 다시 읽어 보세요!');
    end if;
    foreach w in array a.animals loop
      if v_in = w or (position(w in v_in) > 0 and char_length(v_in) <= char_length(w) + 2) then v_ok := true; end if;
    end loop;
    v_status := case when v_ok then 'ok' else 'wrong' end;
    v_points := case when v_ok then 1 else 0 end;
    insert into public.picnic_subs(team_id, member_id, kind, q, text_val, status, points)
    values (t.id, p_member, 'animal', p_q, left(btrim(p_text), 20), v_status, v_points);
    return jsonb_build_object('ok', true, 'correct', v_ok);

  elsif p_kind = 'verse' then
    v_in := public.picnic_norm(p_text);
    if char_length(v_in) < 5 or char_length(p_text) > 300 then
      return jsonb_build_object('ok', false, 'error', '말씀을 끝까지 적어 주세요.');
    end if;
    v_ok := v_in = public.picnic_norm(a.verse);
    -- 2026-10-23 변경: 다르면 선생님 대기로 보내지 않고 「다른 글자 N개」만 알려 준다(어느 글자인지는 알려 주지 않음).
    -- 학생이 「선생님께 확인 요청」을 누를 때만 대기로 간다(picnic_verse_ask).
    if v_ok then
      update public.picnic_subs set status = 'rejected', reviewed_at = now()
      where team_id = t.id and kind = 'verse' and q = p_q and status = 'pending';
      insert into public.picnic_subs(team_id, member_id, kind, q, text_val, status, points)
      values (t.id, p_member, 'verse', p_q, btrim(p_text), 'ok', 2);
      return jsonb_build_object('ok', true, 'correct', true);
    end if;
    -- 고쳐 쓴 말씀이 오면 선생님 확인 대기 중이던 예전 것은 거둔다(2026-10-24)
    update public.picnic_subs set status = 'rejected', reviewed_at = now(), note = '학생이 고쳐 씀'
    where team_id = t.id and kind = 'verse' and q = p_q and status = 'pending';
    v_diff := public.picnic_editdist(v_in, public.picnic_norm(a.verse));
    insert into public.picnic_subs(team_id, member_id, kind, q, text_val, status, points, note)
    values (t.id, p_member, 'verse', p_q, btrim(p_text), 'wrong', 0, v_diff::text);
    return jsonb_build_object('ok', true, 'correct', false, 'diff', v_diff,
      'kept', exists (select 1 from public.picnic_subs where team_id = t.id and kind = 'verse' and q = p_q and status = 'ok'));

  elsif p_kind = 'hidden3' then
    -- 릴스 영상은 앱에 올리지 않고 전도사님께 카톡으로 보낸다(2026-10-23). 앱에는 「보냈어요」만 남긴다.
    if exists (select 1 from public.picnic_subs where team_id = t.id and kind = 'hidden3' and status = 'pending') then
      return jsonb_build_object('ok', false, 'error', '전도사님이 확인하고 있어요. 조금만 기다려 주세요!');
    end if;
    insert into public.picnic_subs(team_id, member_id, kind, q, text_val, status, points)
    values (t.id, p_member, 'hidden3', 0, '전도사님께 카톡으로 보냄', 'pending', 0);
    return jsonb_build_object('ok', true);

  else
    if p_photo is null or left(p_photo, char_length(v_prefix)) <> v_prefix or p_photo ~ '\.\.' or char_length(p_photo) > 300 then
      return jsonb_build_object('ok', false, 'error', '사진을 다시 올려 주세요.');
    end if;
    if (select count(*) from public.picnic_subs where team_id = t.id and kind = p_kind and q = p_q and status = 'pending') >= 3 then
      return jsonb_build_object('ok', false, 'error', '선생님이 사진을 확인하고 있어요. 조금만 기다려 주세요!');
    end if;
    insert into public.picnic_subs(team_id, member_id, kind, q, photo_url, status, points)
    values (t.id, p_member, p_kind, p_q, p_photo, 'pending', 0);
    return jsonb_build_object('ok', true);
  end if;
end;
$function$;

notify pgrst, 'reload schema';
