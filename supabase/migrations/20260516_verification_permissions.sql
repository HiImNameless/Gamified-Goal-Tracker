drop policy if exists "Quest verifiers can update assigned quests"
on public.quests;

create policy "Quest verifiers can update assigned quests"
on public.quests for update
to authenticated
using (auth.uid() = verifier_id)
with check (auth.uid() = verifier_id);

drop policy if exists "Quest verifiers can view owner progress for assigned reviews"
on public.user_progress;

create policy "Quest verifiers can view owner progress for assigned reviews"
on public.user_progress for select
to authenticated
using (
  exists (
    select 1
    from public.quests q
    where q.owner_id = user_id
      and q.verifier_id = auth.uid()
      and q.status in ('pending_verification', 'completed')
  )
);

drop policy if exists "Quest verifiers can update owner progress for approvals"
on public.user_progress;

create policy "Quest verifiers can update owner progress for approvals"
on public.user_progress for update
to authenticated
using (
  exists (
    select 1
    from public.quests q
    where q.owner_id = user_id
      and q.verifier_id = auth.uid()
      and q.status in ('pending_verification', 'completed')
  )
)
with check (
  exists (
    select 1
    from public.quests q
    where q.owner_id = user_id
      and q.verifier_id = auth.uid()
      and q.status in ('pending_verification', 'completed')
  )
);

drop policy if exists "Quest verifiers can insert owner LP events"
on public.lp_events;

create policy "Quest verifiers can insert owner LP events"
on public.lp_events for insert
to authenticated
with check (
  exists (
    select 1
    from public.quests q
    where q.id = quest_id
      and q.owner_id = user_id
      and q.verifier_id = auth.uid()
  )
);

drop policy if exists "Quest verifiers can view owner skill progress for approvals"
on public.skill_progress;

create policy "Quest verifiers can view owner skill progress for approvals"
on public.skill_progress for select
to authenticated
using (
  exists (
    select 1
    from public.quests q
    where q.owner_id = user_id
      and q.verifier_id = auth.uid()
      and q.status in ('pending_verification', 'completed')
  )
);

drop policy if exists "Quest verifiers can update owner skill progress for approvals"
on public.skill_progress;

create policy "Quest verifiers can update owner skill progress for approvals"
on public.skill_progress for update
to authenticated
using (
  exists (
    select 1
    from public.quests q
    where q.owner_id = user_id
      and q.verifier_id = auth.uid()
      and q.status in ('pending_verification', 'completed')
  )
)
with check (
  exists (
    select 1
    from public.quests q
    where q.owner_id = user_id
      and q.verifier_id = auth.uid()
      and q.status in ('pending_verification', 'completed')
  )
);

drop policy if exists "Quest verifiers can insert owner quest logs"
on public.quest_logs;

create policy "Quest verifiers can insert owner quest logs"
on public.quest_logs for insert
to authenticated
with check (
  exists (
    select 1
    from public.quests q
    where q.id = quest_id
      and q.owner_id = user_id
      and q.verifier_id = auth.uid()
  )
);
