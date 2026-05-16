drop policy if exists "Quest verifiers can update criteria for assigned reviews"
on public.quest_criteria;

create policy "Quest verifiers can update criteria for assigned reviews"
on public.quest_criteria for update
to authenticated
using (
  exists (
    select 1
    from public.quests q
    where q.id = quest_id
      and q.verifier_id = auth.uid()
      and q.status = 'pending_verification'
  )
)
with check (
  exists (
    select 1
    from public.quests q
    where q.id = quest_id
      and q.verifier_id = auth.uid()
      and q.status = 'pending_verification'
  )
);
