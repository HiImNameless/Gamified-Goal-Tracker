do $$
begin
  create type public.life_category as enum ('health', 'wealth', 'social');
exception
  when duplicate_object then null;
end $$;

alter table public.quests
add column if not exists life_category public.life_category not null default 'health';

create table if not exists public.life_category_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category public.life_category not null,
  points integer not null default 0 check (points >= 0 and points <= 100),
  last_completed_at timestamptz,
  last_decay_applied_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint life_category_progress_unique_user_category unique (user_id, category)
);

drop trigger if exists set_life_category_progress_updated_at
on public.life_category_progress;

create trigger set_life_category_progress_updated_at
before update on public.life_category_progress
for each row execute function public.set_updated_at();

alter table public.life_category_progress enable row level security;

drop policy if exists "Users can view own and friend life category progress"
on public.life_category_progress;

create policy "Users can view own and friend life category progress"
on public.life_category_progress for select
to authenticated
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.friendships f
    where f.status = 'accepted'
      and (
        (f.requester_id = auth.uid() and f.receiver_id = user_id)
        or (f.receiver_id = auth.uid() and f.requester_id = user_id)
      )
  )
);

drop policy if exists "Users can insert their own life category progress"
on public.life_category_progress;

create policy "Users can insert their own life category progress"
on public.life_category_progress for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Quest verifiers can insert owner life category progress"
on public.life_category_progress;

create policy "Quest verifiers can insert owner life category progress"
on public.life_category_progress for insert
to authenticated
with check (
  exists (
    select 1
    from public.quests q
    where q.owner_id = user_id
      and q.verifier_id = auth.uid()
      and q.status in ('pending_verification', 'completed')
  )
);

drop policy if exists "Users can update their own life category progress"
on public.life_category_progress;

create policy "Users can update their own life category progress"
on public.life_category_progress for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Quest verifiers can update owner life category progress"
on public.life_category_progress;

create policy "Quest verifiers can update owner life category progress"
on public.life_category_progress for update
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

insert into public.life_category_progress (user_id, category)
select p.id, category.value::public.life_category
from public.profiles p
cross join (
  values ('health'), ('wealth'), ('social')
) as category(value)
on conflict (user_id, category) do nothing;
