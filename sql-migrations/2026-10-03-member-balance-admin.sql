-- Member balances for the admin list. Keep get_member_list() unchanged.
create function public.get_member_balances_admin()
returns table(user_id uuid, spent_points bigint, balance bigint)
language sql
stable
security definer
set search_path = public
as $$
  with earned as (
    select pl.user_id, sum(pl.points)::bigint as total_points
    from public.points_ledger pl
    group by pl.user_id
  ), spent as (
    select so.user_id, sum(so.cost_snapshot)::bigint as spent_points
    from public.shop_orders so
    where so.status in ('pending', 'approved', 'delivered')
    group by so.user_id
  )
  select p.user_id,
         coalesce(s.spent_points, 0)::bigint,
         (coalesce(e.total_points, 0) - coalesce(s.spent_points, 0))::bigint
  from public.profiles p
  left join earned e on e.user_id = p.user_id
  left join spent s on s.user_id = p.user_id
  where auth.uid() is not null
    and exists (
      select 1 from public.profiles staff
      where staff.user_id = auth.uid()
        and (staff.is_admin = true or staff.is_department_head = true)
    );
$$;

revoke all on function public.get_member_balances_admin() from public, anon;
grant execute on function public.get_member_balances_admin() to authenticated;
