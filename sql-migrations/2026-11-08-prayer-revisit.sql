-- 2026-11-08 기도 다시 보기: 내 기도제목에 「응답됐어요」 표시와 짧은 메모, 「계속 기도해요」로 다시 볼 날을 미룬다.
-- notes는 본인만 조회·수정(RLS)이고, 다른 사람에게 노트 행을 그대로 내보내는 함수가 없어 이 칸들은 본인에게만 보인다.
alter table public.notes add column if not exists answered_at timestamptz;
alter table public.notes add column if not exists answer_note text;
alter table public.notes add column if not exists revisited_at timestamptz;
alter table public.notes drop constraint if exists notes_answer_note_len;
alter table public.notes add constraint notes_answer_note_len check (answer_note is null or char_length(answer_note) <= 200);
