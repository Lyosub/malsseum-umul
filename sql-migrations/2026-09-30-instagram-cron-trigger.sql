-- 인스타 예약 게시를 GitHub 예약(cron) 대신 Supabase 정시 실행(pg_cron)으로 깨운다(2026-09-30).
-- 이유: GitHub 예약 실행은 몇 시간씩 밀리거나 빠져서(9/26·9/29 확인) 게시 6건 중 5건이 수동으로 올라갔다.
-- 토큰은 SQL에 쓰지 않는다 — vault 비밀 `github_instagram_trigger`(malsseum-umul 저장소 Actions 권한만 있는 GitHub fine-grained 토큰)에 있다.
-- 토큰을 바꿀 때: select vault.update_secret((select id from vault.secrets where name='github_instagram_trigger'), '<새 토큰>');
-- 게시할 게 없으면 워크플로가 바로 정상 종료하므로 자주 깨워도 부담이 없다. 재실행 안전.
create extension if not exists pg_cron;

create or replace function public.trigger_instagram_post()
returns bigint language plpgsql security definer set search_path to 'public' as $$
declare v_tok text; v_id bigint;
begin
  select decrypted_secret into v_tok from vault.decrypted_secrets where name = 'github_instagram_trigger';
  if v_tok is null then raise exception 'vault 비밀 github_instagram_trigger 가 없습니다.'; end if;
  select net.http_post(
    url := 'https://api.github.com/repos/Lyosub/malsseum-umul/actions/workflows/instagram-post.yml/dispatches',
    headers := jsonb_build_object('Authorization', 'Bearer ' || v_tok, 'Accept', 'application/vnd.github+json',
                                  'X-GitHub-Api-Version', '2022-11-28', 'User-Agent', 'supabase-pg-cron', 'Content-Type', 'application/json'),
    body := jsonb_build_object('ref', 'master')) into v_id;
  return v_id;
end $$;
revoke all on function public.trigger_instagram_post() from public, anon, authenticated;

-- 한국 시간 09:02~23:32, 30분마다(UTC 00:02~14:32)
select cron.unschedule('instagram-post-trigger') where exists (select 1 from cron.job where jobname = 'instagram-post-trigger');
select cron.schedule('instagram-post-trigger', '2,32 0-14 * * *', $$select public.trigger_instagram_post()$$);
