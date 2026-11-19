-- Run after the matching client has been published. Existing plots keep their coordinates.
begin;

create or replace function public._ark_plot_at(x int, z int)
returns int language sql immutable as $$
  select case when x - 914 >= 0 and z - 912 >= 0
    and (x - 914) / 28 < 8 and (z - 912) / 28 < 8
    and (x - 914) % 28 < 26 and (z - 912) % 28 < 26
    then ((z - 912) / 28) * 8 + (x - 914) / 28 else -1 end;
$$;

create or replace function public.ark_plot_width()
returns int language sql stable set search_path = public as $$ select 26 $$;
revoke all on function public.ark_plot_width() from public;
grant execute on function public.ark_plot_width() to anon, authenticated;

-- Do not let an old tab replace a plot written in the expanded format.
create or replace function public._ark_keep_expanded_plot()
returns trigger language plpgsql set search_path = public as $$
begin
  if left(old.data,3) = 'r3:' and coalesce(left(new.data,3),'') <> 'r3:' then
    raise exception 'Refresh the game before saving an expanded plot' using errcode = '22023';
  end if;
  return new;
end;
$$;

drop trigger if exists ark_keep_expanded_plot on public.ark_village_plots;
create trigger ark_keep_expanded_plot before update of data on public.ark_village_plots
  for each row execute function public._ark_keep_expanded_plot();

commit;
