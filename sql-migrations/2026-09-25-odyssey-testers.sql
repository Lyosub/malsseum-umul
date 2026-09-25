-- 2026-09-25 In Odyssey 시험 공개: 관리자 + 지정한 학생에게만 놀이터 카드가 보이게.
-- 지정 학생 목록(odyssey_testers)은 공개 저장소에 이름·아이디를 남기지 않도록 이 파일에 넣지 않고 DB에서 직접 추가한다.
create table if not exists odyssey_testers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz not null default now()
);
alter table odyssey_testers enable row level security;
drop policy if exists "본인만 조회" on odyssey_testers;
create policy "본인만 조회" on odyssey_testers for select using (auth.uid() = user_id);

create or replace function public.can_see_odyssey()
 returns boolean
 language sql
 security definer
 set search_path to 'public'
as $function$
  select auth.uid() is not null and (
    exists (select 1 from profiles p where p.user_id = auth.uid() and coalesce(p.is_admin, false))
    or exists (select 1 from odyssey_testers t where t.user_id = auth.uid())
  );
$function$;
grant execute on function public.can_see_odyssey() to authenticated;
select 'ok — odyssey testers' as status;
