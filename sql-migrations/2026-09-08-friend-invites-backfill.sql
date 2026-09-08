-- 2026-09-08 : 친구초청잔치(9/13) 새친구 명단 백필
--
-- 특별새벽기도회 "새친구 초청 최종 명단"(초청자 → 새친구)을 friend_invites 에 채워 넣는다.
-- 대상: 명단의 초청자 중 말씀우물 계정(profiles.real_name)이 있는 사람.
-- friend_name 은 자유 텍스트라 친구 본인의 가입 여부는 무관.
-- 이미 학생이 chodae.html 에서 직접 넣은 건(이지수 4 / 김다희 2 / 최하랑 6 / 오윤서 1) 중복 방지(not exists).
-- 임예나는 동명 계정이 2개라 nickname=':)' 계정으로 지정(사용자 확인).
-- 되돌리기: delete from friend_invites where event_key='2026-0913' and created_at::date = '2026-09-08' 로 취소 가능.

-- 1) 초청자 real_name 이 유일한 경우 (임예나 제외)
insert into friend_invites (inviter_user_id, friend_name)
select p.user_id, v.friend_name
from (values
  ('윤하준','김민건'),('윤하준','하준성'),('윤하준','최지혁'),
  ('이은찬','박지훈'),('이은찬','이재민'),('이은찬','조윤호'),
  ('어환','윤건'),('어환','정하율'),('어환','김이안'),
  ('이유나','이서현'),('이유나','조혜진'),
  ('조윤형','이현진'),('조윤형','정수현'),('조윤형','임우혁'),
  ('임다빈','김윤우'),('임다빈','서희원'),
  ('김찬규','정재원'),
  ('김세운','박신우'),
  ('김태원','강시우'),
  ('박윤수','김세진'),
  ('오승아','석지연'),
  ('임현성','한건희'),
  ('김지민','민소율'),('김지민','김예린'),
  ('송강현','김상호'),('송강현','이주환'),('송강현','이주승'),
  ('김동하','신동우'),('김동하','안시후'),
  ('권혁준','정재원'),('권혁준','심단우'),
  ('심민근','박찬웅'),('심민근','김주헌'),
  -- 이미 시작한 4명 중 명단에 있는데 빠진 친구
  ('이지수','강아현'),
  ('김다희','이소윤'),('김다희','이소연'),
  ('오윤서','최미루')
) as v(inviter, friend_name)
join profiles p on p.real_name = v.inviter
where p.real_name <> '임예나'
  and not exists (
    select 1 from friend_invites fi
    where fi.inviter_user_id = p.user_id
      and fi.friend_name = v.friend_name
      and fi.event_key = '2026-0913'
  );

-- 2) 임예나 (nickname = ':)')
insert into friend_invites (inviter_user_id, friend_name)
select p.user_id, x.friend_name
from profiles p
cross join (values ('최서윤'),('김준희'),('이서윤')) as x(friend_name)
where p.real_name = '임예나' and p.nickname = ':)'
  and not exists (
    select 1 from friend_invites fi
    where fi.inviter_user_id = p.user_id
      and fi.friend_name = x.friend_name
      and fi.event_key = '2026-0913'
  );

-- 확인
select coalesce(pr.real_name,'?') as inviter, pr.nickname, fi.friend_name, to_char(fi.created_at,'MM-DD HH24:MI') as at
from friend_invites fi
left join profiles pr on pr.user_id = fi.inviter_user_id
where fi.event_key = '2026-0913'
order by fi.created_at, fi.id;
