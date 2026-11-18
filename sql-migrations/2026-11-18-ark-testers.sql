-- 2026-11-18 나그네 마을 시험 공개: 말씀놀이터에 게임 카드를 관리자 + 지정한 학생에게만 보이게.
-- 지정 학생 목록(ark_testers)은 공개 저장소에 이름·아이디를 남기지 않도록 이 파일에 넣지 않고 DB에서 직접 추가한다.
create table if not exists ark_testers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz not null default now()
);
alter table ark_testers enable row level security;
drop policy if exists "본인만 조회" on ark_testers;
create policy "본인만 조회" on ark_testers for select using (auth.uid() = user_id);

create or replace function public.can_see_ark()
 returns boolean
 language sql
 stable
 security definer
 set search_path to 'public'
as $function$
  select auth.uid() is not null and (
    exists (select 1 from profiles p where p.user_id = auth.uid() and coalesce(p.is_admin, false))
    or exists (select 1 from ark_testers t where t.user_id = auth.uid())
  );
$function$;
revoke all on function public.can_see_ark() from public, anon;
grant execute on function public.can_see_ark() to authenticated;
select 'ok — ark testers' as status;
