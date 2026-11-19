-- 2026-11-19 나그네 마을 채팅: 욕설은 보내기 전에 서버가 막는다(보낸 학생에게만 엡 4:29 안내)
-- 띄어쓰기·숫자·기호를 끼워 넣은 변형(시 발, 시1발, ㅅ.ㅂ)도 잡는다. 「시발점」 같은 말은 먼저 빼고 본다.
-- 막힌 글은 ark_chat_blocked에 30일 보관하고 선생님(관리자)만 본다. 다시 실행해도 안전.

create table if not exists public.ark_chat_blocked (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  at timestamptz not null default now()
);
alter table public.ark_chat_blocked enable row level security;
drop policy if exists ark_chat_blocked_admin on public.ark_chat_blocked;
create policy ark_chat_blocked_admin on public.ark_chat_blocked for select to authenticated using (public.is_ark_admin());

create or replace function public._ark_bad_text(p text)
returns boolean language sql immutable as $$
  with n as (
    select regexp_replace(
             regexp_replace(lower(coalesce(p, '')), '시발점|시발역|시발택시|시발자동차', '', 'g'),
             '[^가-힣ㄱ-ㅎㅏ-ㅣa-z]', '', 'g') t
  )
  select t ~ ('(씨발|시발|씌발|쒸발|쉬발|쓰발|씨빨|시빨|씨팔|시팔|씨바|ㅅㅂ|ㅆㅂ|ㅅㅃ|ㅆㅃ|ㅅㅍ|ㅆㅍ|'
           || '병신|븅신|빙신|병싄|ㅂㅅ|ㅄ|'
           || '개새끼|개색기|개색끼|개세끼|개쌔끼|개새기|개섀끼|씹새|씹쌔|니새끼|느그새끼|ㄱㅅㄲ|ㅅㄲ|'
           || '좆|좃같|존나|졸라|ㅈㄴ|ㅈ같|'
           || '지랄|ㅈㄹ|염병|닥쳐|닥치라|'
           || '미친놈|미친년|미친새|ㅁㅊ놈|ㅁㅊ년|또라이|'
           || '니애미|느금마|느금|느그애미|니미럴|니기미|엠창|애미없|애비없|'
           || '씹년|씹창|쌍년|쌍놈|썅|'
           || '뒤져|뒈져|디져라|자살|'
           || '섹스|야동|'
           || 'fuck|fck|fxck|shit|bitch|sibal|ssibal|byungsin)')
  from n;
$$;

create or replace function public.send_ark_chat(p_body text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare b text; nk text; mu timestamptz; new_id bigint;
begin
  if not public.can_play_ark() then return jsonb_build_object('error', 'login'); end if;
  b := btrim(regexp_replace(coalesce(p_body, ''), '[[:cntrl:]]', ' ', 'g'));
  b := regexp_replace(b, '\s{2,}', ' ', 'g');
  if b = '' then return jsonb_build_object('error', 'empty'); end if;
  if char_length(b) > 60 then return jsonb_build_object('error', 'long'); end if;
  select until into mu from ark_chat_mutes where user_id = auth.uid();
  if mu is not null and mu > now() then
    return jsonb_build_object('error', 'muted', 'until', mu);
  end if;
  if exists (select 1 from ark_chat where user_id = auth.uid() and created_at > now() - interval '2 seconds') then
    return jsonb_build_object('error', 'slow');
  end if;
  if (select count(*) from ark_chat where user_id = auth.uid() and created_at > now() - interval '30 seconds') >= 6 then
    return jsonb_build_object('error', 'slow');
  end if;
  if (select count(*) from ark_chat where user_id = auth.uid() and body = b and created_at > now() - interval '1 minute') >= 2 then
    return jsonb_build_object('error', 'same');
  end if;
  if public._ark_bad_text(b) then
    insert into ark_chat_blocked(user_id, body) values (auth.uid(), b);
    delete from ark_chat_blocked where at < now() - interval '30 days';
    return jsonb_build_object('error', 'bad');
  end if;
  select nickname into nk from profiles where user_id = auth.uid();
  insert into ark_chat(user_id, nick, body) values (auth.uid(), coalesce(nk, '친구'), b) returning id into new_id;
  delete from ark_chat where created_at < now() - interval '30 days';
  return jsonb_build_object('id', new_id);
end $$;
revoke all on function public.send_ark_chat(text) from public, anon;
grant execute on function public.send_ark_chat(text) to authenticated;

-- 선생님용: 막힌 글(닉네임과 함께)
create or replace function public.get_ark_chat_blocked()
returns table(nick text, body text, at timestamptz)
language sql stable security definer set search_path = public as $$
  select p.nickname, b.body, b.at from ark_chat_blocked b left join profiles p on p.user_id = b.user_id
  where public.is_ark_admin() order by b.at desc limit 100;
$$;
revoke all on function public.get_ark_chat_blocked() from public, anon;
grant execute on function public.get_ark_chat_blocked() to authenticated;

select 'ok — ark chat filter' as status;
