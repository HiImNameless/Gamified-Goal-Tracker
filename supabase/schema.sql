create extension if not exists "pgcrypto";

create type public.quest_type as enum ('main', 'side', 'boss');
create type public.quest_difficulty as enum ('easy', 'medium', 'hard', 'boss');
create type public.quest_status as enum (
  'draft',
  'active',
  'pending_verification',
  'completed',
  'failed',
  'abandoned',
  'expired'
);
create type public.skill_category as enum (
  'health',
  'fitness',
  'programming',
  'editing',
  'study',
  'money',
  'creativity',
  'discipline'
);
create type public.life_category as enum ('health', 'wealth', 'social');
create type public.visibility as enum ('private', 'friends');
create type public.friendship_status as enum ('pending', 'accepted', 'rejected');
create type public.proof_status as enum ('pending', 'approved', 'rejected');
create type public.quest_criteria_type as enum ('standalone', 'count');
create type public.quest_structured_item_type as enum ('reward', 'stake');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_length check (char_length(username) between 3 and 32),
  constraint profiles_username_format check (username ~ '^[a-zA-Z0-9_]+$')
);

create table public.user_progress (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  rank_tier integer not null default 0 check (rank_tier between 0 and 30),
  lp integer not null default 0 check (lp >= 0 and lp <= 100),
  total_xp integer not null default 0 check (total_xp >= 0),
  completed_quests integer not null default 0 check (completed_quests >= 0),
  failed_quests integer not null default 0 check (failed_quests >= 0),
  current_streak integer not null default 0 check (current_streak >= 0),
  longest_streak integer not null default 0 check (longest_streak >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.life_category_progress (
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

create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  status public.friendship_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint friendships_not_self check (requester_id <> receiver_id),
  constraint friendships_unique_pair unique (requester_id, receiver_id)
);

create table public.quests (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  type public.quest_type not null default 'side',
  difficulty public.quest_difficulty not null default 'easy',
  status public.quest_status not null default 'draft',
  skill_category public.skill_category not null default 'discipline',
  life_category public.life_category not null default 'health',
  deadline timestamptz,
  failure_condition text,
  reward_text text,
  stake_text text,
  proof_required boolean not null default false,
  verifier_id uuid references public.profiles(id) on delete set null,
  visibility public.visibility not null default 'private',
  xp_reward integer not null default 20 check (xp_reward >= 0),
  lp_reward integer not null default 5 check (lp_reward >= 0),
  lp_penalty integer not null default -2 check (lp_penalty <= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  failed_at timestamptz
);

create table public.quest_criteria (
  id uuid primary key default gen_random_uuid(),
  quest_id uuid not null references public.quests(id) on delete cascade,
  title text not null,
  description text,
  type public.quest_criteria_type not null default 'standalone',
  target_count integer not null default 1 check (target_count >= 1),
  current_count integer not null default 0 check (current_count >= 0),
  is_completed boolean not null default false,
  deadline timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quest_structured_items (
  id uuid primary key default gen_random_uuid(),
  quest_id uuid not null references public.quests(id) on delete cascade,
  type public.quest_structured_item_type not null,
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

create table public.proof_submissions (
  id uuid primary key default gen_random_uuid(),
  quest_id uuid not null references public.quests(id) on delete cascade,
  submitted_by uuid not null references public.profiles(id) on delete cascade,
  proof_text text not null default '',
  file_url text,
  status public.proof_status not null default 'pending',
  reviewer_id uuid references public.profiles(id) on delete set null,
  reviewer_comment text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table public.quest_logs (
  id uuid primary key default gen_random_uuid(),
  quest_id uuid not null references public.quests(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  note text,
  created_at timestamptz not null default now()
);

create table public.lp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  quest_id uuid references public.quests(id) on delete set null,
  amount integer not null,
  previous_rank_tier integer not null check (previous_rank_tier between 0 and 7),
  previous_lp integer not null check (previous_lp >= 0 and previous_lp <= 100),
  new_rank_tier integer not null check (new_rank_tier between 0 and 7),
  new_lp integer not null check (new_lp >= 0 and new_lp <= 100),
  reason text not null,
  created_at timestamptz not null default now()
);

create table public.skill_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  skill_category public.skill_category not null,
  xp integer not null default 0 check (xp >= 0),
  level integer not null default 1 check (level >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint skill_progress_unique_user_skill unique (user_id, skill_category)
);

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger set_user_progress_updated_at
before update on public.user_progress
for each row execute function public.set_updated_at();

create trigger set_life_category_progress_updated_at
before update on public.life_category_progress
for each row execute function public.set_updated_at();

create trigger set_friendships_updated_at
before update on public.friendships
for each row execute function public.set_updated_at();

create trigger set_quests_updated_at
before update on public.quests
for each row execute function public.set_updated_at();

create trigger set_quest_criteria_updated_at
before update on public.quest_criteria
for each row execute function public.set_updated_at();

create trigger set_skill_progress_updated_at
before update on public.skill_progress
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;
alter table public.life_category_progress enable row level security;
alter table public.friendships enable row level security;
alter table public.quests enable row level security;
alter table public.quest_criteria enable row level security;
alter table public.quest_structured_items enable row level security;
alter table public.proof_submissions enable row level security;
alter table public.quest_logs enable row level security;
alter table public.lp_events enable row level security;
alter table public.skill_progress enable row level security;

create policy "Profiles are visible to authenticated users"
on public.profiles for select
to authenticated
using (true);

create policy "Users can insert their own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can view their own progress"
on public.user_progress for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own progress"
on public.user_progress for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own progress"
on public.user_progress for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

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

create policy "Users can insert their own life category progress"
on public.life_category_progress for insert
to authenticated
with check (auth.uid() = user_id);

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

create policy "Users can update their own life category progress"
on public.life_category_progress for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

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

create policy "Users can view related friendships"
on public.friendships for select
to authenticated
using (auth.uid() = requester_id or auth.uid() = receiver_id);

create policy "Users can request friendships"
on public.friendships for insert
to authenticated
with check (auth.uid() = requester_id);

create policy "Receivers can respond to friendships"
on public.friendships for update
to authenticated
using (auth.uid() = receiver_id)
with check (auth.uid() = receiver_id);

create policy "Users can view own quests and friend-visible quests"
on public.quests for select
to authenticated
using (
  auth.uid() = owner_id
  or (
    visibility = 'friends'
    and exists (
      select 1
      from public.friendships f
      where f.status = 'accepted'
        and (
          (f.requester_id = auth.uid() and f.receiver_id = owner_id)
          or (f.receiver_id = auth.uid() and f.requester_id = owner_id)
        )
    )
  )
  or auth.uid() = verifier_id
);

create policy "Users can insert their own quests"
on public.quests for insert
to authenticated
with check (auth.uid() = owner_id);

create policy "Quest owners can update quests"
on public.quests for update
to authenticated
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "Users can view criteria for visible quests"
on public.quest_criteria for select
to authenticated
using (
  exists (
    select 1 from public.quests q
    where q.id = quest_id
      and (
        q.owner_id = auth.uid()
        or q.verifier_id = auth.uid()
        or (
          q.visibility = 'friends'
          and exists (
            select 1 from public.friendships f
            where f.status = 'accepted'
              and (
                (f.requester_id = auth.uid() and f.receiver_id = q.owner_id)
                or (f.receiver_id = auth.uid() and f.requester_id = q.owner_id)
              )
          )
        )
      )
  )
);

create policy "Quest owners can insert criteria"
on public.quest_criteria for insert
to authenticated
with check (
  exists (
    select 1 from public.quests q
    where q.id = quest_id and q.owner_id = auth.uid()
  )
);

create policy "Quest owners can update criteria"
on public.quest_criteria for update
to authenticated
using (
  exists (
    select 1 from public.quests q
    where q.id = quest_id and q.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.quests q
    where q.id = quest_id and q.owner_id = auth.uid()
  )
);

create policy "Users can view structured quest items for visible quests"
on public.quest_structured_items for select
to authenticated
using (
  exists (
    select 1 from public.quests q
    where q.id = quest_id
      and (
        q.owner_id = auth.uid()
        or q.verifier_id = auth.uid()
        or (
          q.visibility = 'friends'
          and exists (
            select 1 from public.friendships f
            where f.status = 'accepted'
              and (
                (f.requester_id = auth.uid() and f.receiver_id = q.owner_id)
                or (f.receiver_id = auth.uid() and f.requester_id = q.owner_id)
              )
          )
        )
      )
  )
);

create policy "Quest owners can insert structured quest items"
on public.quest_structured_items for insert
to authenticated
with check (
  exists (
    select 1 from public.quests q
    where q.id = quest_id and q.owner_id = auth.uid()
  )
);

create policy "Quest owners can update structured quest items"
on public.quest_structured_items for update
to authenticated
using (
  exists (
    select 1 from public.quests q
    where q.id = quest_id and q.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.quests q
    where q.id = quest_id and q.owner_id = auth.uid()
  )
);

create policy "Quest owners and reviewers can view proof"
on public.proof_submissions for select
to authenticated
using (
  submitted_by = auth.uid()
  or reviewer_id = auth.uid()
  or exists (
    select 1 from public.quests q
    where q.id = quest_id
      and (q.owner_id = auth.uid() or q.verifier_id = auth.uid())
  )
);

create policy "Quest owners can submit proof"
on public.proof_submissions for insert
to authenticated
with check (submitted_by = auth.uid());

create policy "Reviewers can update proof"
on public.proof_submissions for update
to authenticated
using (
  reviewer_id = auth.uid()
  or exists (
    select 1 from public.quests q
    where q.id = quest_id and q.verifier_id = auth.uid()
  )
);

create policy "Users can view their quest logs"
on public.quest_logs for select
to authenticated
using (user_id = auth.uid());

create policy "Users can insert their quest logs"
on public.quest_logs for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can view their LP events"
on public.lp_events for select
to authenticated
using (user_id = auth.uid());

create policy "Users can insert their LP events"
on public.lp_events for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can view their skill progress"
on public.skill_progress for select
to authenticated
using (user_id = auth.uid());

create policy "Users can insert their skill progress"
on public.skill_progress for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can update their skill progress"
on public.skill_progress for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'quest-proofs',
  'quest-proofs',
  false,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Users can upload their own quest proof files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'quest-proofs'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can view their own quest proof files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'quest-proofs'
  and auth.uid()::text = (storage.foldername(name))[1]
);
