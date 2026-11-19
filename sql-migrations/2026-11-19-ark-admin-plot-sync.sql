-- 나그네 마을: 관리자가 다른 사람 땅을 고칠 때, 그 땅 주인이 접속해 있어도 덮어쓰지 않도록
-- 관리자의 땅 블록 변경도 ark_plot_edits(실시간 전달)에 넣고, 화면은 관리자 계정이 보낸 변경을 주인 기기에도 반영한다.
begin;

create or replace function public.put_plot_edits(p_edits jsonb)
returns integer language plpgsql security definer set search_path to 'public' as $$
declare n int; m timestamptz := date_trunc('minute', now()); used int; mine int; ok int; adm boolean := public.is_ark_admin();
begin
  if not public.can_play_ark() then return -1; end if;
  if jsonb_typeof(p_edits) <> 'array' then return 0; end if;
  n := jsonb_array_length(p_edits);
  if n = 0 then return 0; end if;
  if n > 300 then return -2; end if;
  select plot_idx into mine from ark_village_plots where user_id = auth.uid() limit 1;
  if mine is null and not adm then return -4; end if;
  insert into ark_edit_budget(user_id, minute, n) values (auth.uid(), m, n)
    on conflict (user_id, minute) do update set n = ark_edit_budget.n + excluded.n
    returning ark_edit_budget.n into used;
  if used > 1500 then return -3; end if;
  insert into ark_plot_edits(user_id, x, y, z, b)
  select auth.uid(), (e->>0)::int, (e->>1)::int, (e->>2)::int, (e->>3)::smallint
  from jsonb_array_elements(p_edits) e
  where jsonb_typeof(e) = 'array' and jsonb_array_length(e) = 4
    and (public._ark_plot_at((e->>0)::int, (e->>2)::int) = mine
         or (adm and public._ark_plot_at((e->>0)::int, (e->>2)::int) >= 0))
    and (e->>1)::int between 13 and 47 and public._ark_block_ok((e->>3)::int);
  get diagnostics ok = row_count;
  delete from ark_plot_edits where at < now() - interval '2 minutes';
  return ok;
end $$;
revoke all on function public.put_plot_edits(jsonb) from public, anon;
grant execute on function public.put_plot_edits(jsonb) to authenticated;

-- 관리자 계정 목록(아이디만): 화면이 「관리자가 보낸 땅 변경」을 알아보는 데만 쓴다
create or replace function public.get_ark_admin_ids()
returns uuid[] language sql stable security definer set search_path = public as $$
  select case when public.can_play_ark() then coalesce(array_agg(p.user_id), '{}') else '{}' end from public.profiles p where coalesce(p.is_admin, false);
$$;
revoke all on function public.get_ark_admin_ids() from public, anon;
grant execute on function public.get_ark_admin_ids() to authenticated;

commit;
