drop policy if exists "Quest owners can view all proof history"
on public.proof_submissions;

create policy "Quest owners can view all proof history"
on public.proof_submissions for select
to authenticated
using (
  exists (
    select 1
    from public.quests q
    where q.id = quest_id
      and q.owner_id = auth.uid()
  )
);
