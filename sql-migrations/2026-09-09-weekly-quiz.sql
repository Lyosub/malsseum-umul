-- 2026-09-09(수) 공개 성경퀴즈 등록 — 설교 "아직 자리가 있습니다"(눅 14:15-24)
--
-- admin.html에서 등록하는 것과 동일한 결과를 SQL Editor에서 직접 넣는다.
-- week_start = 공개될 수요일(2026-09-09)이 속한 주의 월요일 = 2026-09-07.
--   → 학생에게는 week_start+2일(수) 00:00 KST부터 week_start+3일(목)까지 보인다.
-- created_by = 볼트 소유자(이요섭) 계정. 관리자 계정이 이 이메일이 아니면 아래 이메일만 바꾼다.
--
-- Supabase 대시보드 → SQL Editor에 붙여넣고 Run.

insert into quiz_questions (week_start, question, option1, option2, option3, option4, correct_option, created_by)
values (
  date '2026-09-07',
  '오늘 본문(누가복음 14장)에서 잔치에 처음 초청받았던 사람들이 참석을 거절하며 댄 핑계가 아닌 것은?',
  '밭을 샀으니 나가 봐야 한다',
  '소 다섯 겨리를 샀으니 시험하러 가야 한다',
  '장가를 들어서 갈 수 없다',
  '몸이 아파서 자리에서 일어날 수 없다',
  4,
  (select id from auth.users where email = 'dytjq1012@gmail.com')
);

-- 등록 결과 + 공개 예정일 확인
select id, week_start,
       (week_start + 2) as opens_on,   -- 학생에게 보이기 시작하는 날(수요일)
       (week_start + 3) as closes_on,  -- 마지막으로 보이는 날(목요일)
       correct_option, question
from quiz_questions
order by created_at desc
limit 1;


-- ── 대안(2안): 위 insert 대신 이걸 쓰려면 위 insert...values(...) 블록을 지우고 아래를 사용 ──
-- insert into quiz_questions (week_start, question, option1, option2, option3, option4, correct_option, created_by)
-- values (
--   date '2026-09-07',
--   '주인이 종에게 "사람을 강권하여 데려오라"(헬라어 ''아낭카조'')고 한 말의 뜻으로 가장 알맞은 것은?',
--   '억지로 붙잡아 끌고 오라는 뜻이다',
--   '사양하는 사람에게 "당신을 위한 자리예요"라며 진심으로 계속 설득해 데려오라는 뜻이다',
--   '초청을 한 번 거절하면 더는 권하지 말라는 뜻이다',
--   '잔치 비용을 대신 내주고 데려오라는 뜻이다',
--   2,
--   (select id from auth.users where email = 'dytjq1012@gmail.com')
-- );
