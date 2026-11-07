-- 11/8 행사 날 대비(원정대·광주리 동시 접속): 자주 찾는 칸에 색인. 표가 작아 지금도 빠르지만 몰릴 때를 대비한다.
create index if not exists harvest_entries_group on public.harvest_entries (group_id);
create index if not exists harvest_entries_note on public.harvest_entries (note_id);
create index if not exists picnic_members_team on public.picnic_members (team_id);
