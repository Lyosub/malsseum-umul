-- 감사의 광주리 (2026-11-04): 추수감사주일 행사. 11/9~11/15에 쓴 감사노트가 공동 광주리의 열매가 된다.
-- * 세는 것은 기존 notes(type='gratitude')를 그대로 쓴다. 경험치·달란트는 기존 트리거대로이고 새로 주지 않는다.
-- * 예배 화면 글은 별 밝히기의 star_messages(room='harvest')에 복사해 star_sky·star_admin을 그대로 쓴다.
--   작성자가 고른 글만, 이름 없이 복사하고(name='한 사람'), 담당자가 승인한 것만 화면에 뜬다.
-- * 방의 open=false라서 star.html(star_send)로는 이 방에 글을 넣을 수 없다.
-- * 관리 코드는 이 파일에 적지 않는다(공개 저장소). 방 만들기:
--   insert into public.star_rooms(room, admin_code, open) values ('harvest', '<관리 코드>', false);
-- * 새 표 1개, 새 함수 2개만 추가한다. 재실행해도 안전.

create table if not exists public.harvest_config (
  id         int primary key default 1 check (id = 1),
  starts_at  timestamptz not null,
  ends_at    timestamptz not null        -- 이 시각은 포함하지 않는다
);
alter table public.harvest_config enable row level security;
revoke all on public.harvest_config from anon, authenticated;
insert into public.harvest_config(id, starts_at, ends_at)
values (1, '2026-11-09 00:00:00+09', '2026-11-16 00:00:00+09')
on conflict (id) do nothing;

-- 숫자와 기간만 돌려준다(글·사람은 내려가지 않는다).
create or replace function public.harvest_status()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'count', (select count(*) from public.notes n
              where n.type = 'gratitude' and n.created_at >= c.starts_at and n.created_at < c.ends_at),
    'starts_at', c.starts_at,
    'ends_at', c.ends_at,
    'open', now() >= c.starts_at and now() < c.ends_at
  )
  from public.harvest_config c where c.id = 1;
$$;

-- 내 감사노트 하나를 예배 화면 승인 대기로 보낸다.
create or replace function public.harvest_share(p_note_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c public.harvest_config;
  v_uid uuid := auth.uid();
  v_body text;
  v_status text := 'pending';
  v_bad text[] := array['시발','씨발','ㅅㅂ','ㅆㅂ','병신','ㅂㅅ','개새','지랄','ㅈㄹ','좆','존나','졸라','닥쳐','꺼져','미친놈','미친년','fuck','shit'];
  w text;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', '로그인한 뒤 보낼 수 있어요.');
  end if;
  select * into c from public.harvest_config where id = 1;
  if now() < c.starts_at or now() >= c.ends_at then
    return jsonb_build_object('ok', false, 'error', '지금은 보낼 수 있는 기간이 아니에요.');
  end if;
  select btrim(n.content) into v_body from public.notes n
   where n.id = p_note_id and n.user_id = v_uid and n.type = 'gratitude'
     and n.created_at >= c.starts_at and n.created_at < c.ends_at;
  if v_body is null then
    return jsonb_build_object('ok', false, 'error', '보낼 감사 글을 찾지 못했어요.');
  end if;
  if char_length(v_body) < 1 or char_length(v_body) > 60 then
    return jsonb_build_object('ok', false, 'error', '화면에는 60자까지 나눌 수 있어요.');
  end if;
  if exists (select 1 from public.star_messages m
             where m.room = 'harvest' and m.device = v_uid::text
               and (m.created_at at time zone 'Asia/Seoul')::date = (now() at time zone 'Asia/Seoul')::date) then
    return jsonb_build_object('ok', false, 'error', '화면 나눔은 하루에 한 번이에요. 감사 글은 저장됐어요.');
  end if;
  foreach w in array v_bad loop
    if position(w in lower(v_body)) > 0 then
      v_status := 'blocked';
    end if;
  end loop;
  if v_body ~ '[0-9]{2,4}[- .][0-9]{3,4}[- .][0-9]{4}' or v_body ~ '[0-9]{9,}' then
    v_status := 'blocked';
  end if;
  insert into public.star_messages(room, device, name, dept, body, show_name, status, kind)
  values ('harvest', v_uid::text, '한 사람', '감사', v_body, true, v_status, 'live');
  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.harvest_status() from public;
revoke all on function public.harvest_share(bigint) from public, anon;
grant execute on function public.harvest_status() to anon, authenticated;
grant execute on function public.harvest_share(bigint) to authenticated;
