-- 말씀우물 헬스체크·In Odyssey 하루 요약도 GitHub 예약(cron) 대신 Supabase 정시 실행으로 깨운다(2026-09-30).
-- 이유: GitHub 예약 실행이 3~7시간씩 밀린다(헬스체크 10:23→약 15:50/03:40, 요약 07:40→약 10:30 등 실측). 인스타 게시와 같은 문제.
-- 토큰은 인스타용과 같은 vault 비밀 `github_instagram_trigger`(malsseum-umul Actions 권한만). 재실행 안전.
-- GitHub 쪽 예약은 백업으로 그대로 둔다(둘 다 돌아도 결과는 같다 — 두 워크플로 모두 concurrency 그룹이 있다).
create or replace function public.trigger_github_workflow(p_file text)
returns bigint language plpgsql security definer set search_path to 'public' as $$
declare v_tok text; v_id bigint;
begin
  if p_file not in ('instagram-post.yml', 'healthcheck.yml', 'odyssey-summary.yml') then raise exception '허용되지 않은 워크플로: %', p_file; end if;
  select decrypted_secret into v_tok from vault.decrypted_secrets where name = 'github_instagram_trigger';
  if v_tok is null then raise exception 'vault 비밀 github_instagram_trigger 가 없습니다.'; end if;
  select net.http_post(
    url := 'https://api.github.com/repos/Lyosub/malsseum-umul/actions/workflows/' || p_file || '/dispatches',
    headers := jsonb_build_object('Authorization', 'Bearer ' || v_tok, 'Accept', 'application/vnd.github+json',
                                  'X-GitHub-Api-Version', '2022-11-28', 'User-Agent', 'supabase-pg-cron', 'Content-Type', 'application/json'),
    body := jsonb_build_object('ref', 'master')) into v_id;
  return v_id;
end $$;
revoke all on function public.trigger_github_workflow(text) from public, anon, authenticated;

select cron.unschedule(jobname) from cron.job where jobname in ('healthcheck-trigger', 'odyssey-summary-trigger');
-- 헬스체크: 한국 시간 10:23 · 22:23 (UTC 01:23 · 13:23)
select cron.schedule('healthcheck-trigger', '23 1,13 * * *', $$select public.trigger_github_workflow('healthcheck.yml')$$);
-- In Odyssey 요약: 07:40 · 14:40 · 21:40 (UTC 22:40 · 05:40 · 12:40)
select cron.schedule('odyssey-summary-trigger', '40 22,5,12 * * *', $$select public.trigger_github_workflow('odyssey-summary.yml')$$);
