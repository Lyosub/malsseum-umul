-- 성경 이어 읽기: 사용자별 "마지막으로 읽은 책·장"을 1행으로 저장한다.
-- read.html 에서 한 장을 실제로 불러올 때마다 갱신하고, word.html("말씀" 탭)에서
-- "이어 읽기" 버튼으로 그 장을 다시 연다. 진도는 개인 것이고 달란트와 무관하다.

create table if not exists public.reading_progress (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  book_id    integer not null,
  book_name  text    not null,
  chapter    integer not null,
  updated_at timestamptz not null default now()
);

alter table public.reading_progress enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='reading_progress' and policyname='reading_progress_select_own') then
    create policy reading_progress_select_own on public.reading_progress
      for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='reading_progress' and policyname='reading_progress_insert_own') then
    create policy reading_progress_insert_own on public.reading_progress
      for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='reading_progress' and policyname='reading_progress_update_own') then
    create policy reading_progress_update_own on public.reading_progress
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

-- 한 장을 읽었을 때 호출: 있으면 갱신, 없으면 생성 (1인 1행)
create or replace function public.set_reading_progress(p_book_id integer, p_book_name text, p_chapter integer)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
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
$$;

-- 내 진도 조회 (없으면 0행)
create or replace function public.get_reading_progress()
returns table (book_id integer, book_name text, chapter integer, updated_at timestamptz)
language sql
security definer
set search_path to 'public'
as $$
  select book_id, book_name, chapter, updated_at
  from public.reading_progress
  where user_id = auth.uid();
$$;

grant execute on function public.set_reading_progress(integer, text, integer) to authenticated;
grant execute on function public.get_reading_progress() to authenticated;
