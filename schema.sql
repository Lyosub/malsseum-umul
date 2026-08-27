-- 말씀우물 Supabase 스키마
-- Supabase 대시보드 > SQL Editor에서 실행

-- 출석 기록
create table if not exists attendance (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table attendance enable row level security;

create policy "본인 출석만 조회" on attendance
  for select using (auth.uid() = user_id);

create policy "본인 출석만 등록" on attendance
  for insert with check (auth.uid() = user_id);

-- 감사노트 / 기도제목 / 하루 인사
create table if not exists notes (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('greeting', 'gratitude', 'prayer')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table notes enable row level security;

create policy "본인 노트만 조회" on notes
  for select using (auth.uid() = user_id);

create policy "본인 노트만 작성" on notes
  for insert with check (auth.uid() = user_id);

create policy "본인 노트만 삭제" on notes
  for delete using (auth.uid() = user_id);
