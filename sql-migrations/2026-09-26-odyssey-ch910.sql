-- In Odyssey 9장 「금송아지」 · 10장 「성막」 (2026-09-26): 장 완료 달란트 10장까지, 진행 기록 10장까지, 새 배지 3개(여호와의 편 · 자원하는 마음 · 명령하신 대로) 업적
-- 재실행해도 안전(idempotent). on conflict predicate 는 points_ledger_auto_uniq 인덱스와 정확히 같아야 한다.
create or replace function public.claim_odyssey_chapter(p_ch integer)
returns integer language plpgsql security definer set search_path to 'public' as $function$
declare v_n integer;
begin
  if auth.uid() is null then raise exception '로그인이 필요합니다.'; end if;
  if p_ch < 1 or p_ch > 10 then raise exception '없는 장이에요.'; end if;
  insert into points_ledger (user_id, action_type, points, ref_date, note)
  values (auth.uid(), 'odyssey_chapter', 20, date '2000-01-01' + p_ch, 'In Odyssey ' || p_ch || '장 완료')
  on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;
  get diagnostics v_n = row_count;
  return case when v_n > 0 then 20 else 0 end;
end;
$function$;

create or replace function submit_odyssey_progress(p_chapters integer, p_verses integer, p_scrolls integer, p_title text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or not can_see_odyssey() then return; end if;
  insert into odyssey_progress (user_id, chapters, verses, scrolls, title)
  values (auth.uid(), greatest(0, least(coalesce(p_chapters, 0), 10)), greatest(0, least(coalesce(p_verses, 0), 200)),
          greatest(0, least(coalesce(p_scrolls, 0), 20)), left(p_title, 30))
  on conflict (user_id) do update
    set chapters = greatest(odyssey_progress.chapters, excluded.chapters),
        verses = greatest(odyssey_progress.verses, excluded.verses),
        scrolls = greatest(odyssey_progress.scrolls, excluded.scrolls),
        title = coalesce(excluded.title, odyssey_progress.title), updated_at = now();
end $$;

create or replace function public.claim_odyssey_achieve(p_key text)
returns integer language plpgsql security definer set search_path = public as $$
declare v_idx int; v_pts int; v_n integer;
  keys text[] := array['badge-wise','badge-pray_start','badge-companion','badge-prayer','badge-share','badge-trust',
                       'badge-true_heart','badge-passover_lamb','badge-bold_step','badge-together','badge-timbrel','badge-scroll_all',
                       'scroll-alpha','scroll-midian','scroll-egypt','scroll-redsea','badge-daily_bread',
                       'badge-raised_hands','badge-true_leader','badge-ten_words',
                       'badge-idol_breaker','badge-craftsman',
                       'badge-hidden_all',
                       'badge-lords_side','badge-willing','badge-as_commanded'];
begin
  if auth.uid() is null or not public.can_see_odyssey() then return 0; end if;
  v_idx := array_position(keys, p_key);
  if v_idx is null then return 0; end if;
  v_pts := case when p_key like 'scroll-%' then 10 when p_key = 'badge-hidden_all' then 10 else 3 end;
  insert into points_ledger (user_id, action_type, points, ref_date, note)
  values (auth.uid(), 'odyssey_achieve', v_pts, date '2000-01-01' + v_idx, 'In Odyssey 업적: ' || p_key)
  on conflict (user_id, action_type, ref_date) where action_type <> 'admin_award' do nothing;
  get diagnostics v_n = row_count;
  return case when v_n > 0 then v_pts else 0 end;
end $$;
