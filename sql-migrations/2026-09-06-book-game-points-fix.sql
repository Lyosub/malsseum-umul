-- 2026-09-06 성경책 순서 맞추기 게임 "기록 저장에 실패했어요" 수정
--
-- 원인: submit_book_game_score()가 points_ledger에 action_type='book_game_ot'/'book_game_nt'로
--       달란트를 적립하는데, points_ledger_action_type_check CHECK 제약에 이 값들이 빠져 있어서
--       insert가 제약 위반으로 터지고 함수 전체가 롤백됨 → 점수도 저장 안 됨.
--       (게임이 추가된 2026-09-02부터 로그인 사용자는 한 번도 저장된 적 없음)
--
-- 아래를 Supabase 대시보드 → SQL Editor → 새 쿼리에 붙여넣고 Run.
-- 결과 창에 "points_ledger action_type check updated (book_game_* 허용)" 한 줄이 뜨면 성공.

alter table points_ledger drop constraint if exists points_ledger_action_type_check;
alter table points_ledger add constraint points_ledger_action_type_check
  check (action_type in (
    'attendance', 'streak_bonus', 'note', 'quiz',
    'group_attendance_bonus', 'group_notes_bonus', 'admin_award', 'greeting_draw',
    'book_game', 'book_game_ot', 'book_game_nt'
  ));

select 'points_ledger action_type check updated (book_game_* 허용)' as status;
