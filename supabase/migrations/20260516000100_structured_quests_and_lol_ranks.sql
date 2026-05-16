do $$
begin
  create type public.quest_criteria_type as enum ('standalone', 'count');
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.quest_structured_item_type as enum ('reward', 'stake');
exception
  when duplicate_object then null;
end;
$$;

alter table public.user_progress
drop constraint if exists user_progress_rank_tier_check;

alter table public.user_progress
add constraint user_progress_rank_tier_check check (rank_tier between 0 and 30);

alter table public.quest_criteria
add column if not exists type public.quest_criteria_type not null default 'standalone',
add column if not exists target_count integer not null default 1 check (target_count >= 1),
add column if not exists current_count integer not null default 0 check (current_count >= 0);

create table if not exists public.quest_structured_items (
  id uuid primary key default gen_random_uuid(),
  quest_id uuid not null references public.quests(id) on delete cascade,
  type public.quest_structured_item_type not null,
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

alter table public.quest_structured_items enable row level security;

drop policy if exists "Users can view structured quest items for visible quests"
on public.quest_structured_items;

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

drop policy if exists "Quest owners can insert structured quest items"
on public.quest_structured_items;

create policy "Quest owners can insert structured quest items"
on public.quest_structured_items for insert
to authenticated
with check (
  exists (
    select 1 from public.quests q
    where q.id = quest_id and q.owner_id = auth.uid()
  )
);

drop policy if exists "Quest owners can update structured quest items"
on public.quest_structured_items;

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

drop policy if exists "Users can upload their own quest proof files"
on storage.objects;

create policy "Users can upload their own quest proof files"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'quest-proofs'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "Users can view their own quest proof files"
on storage.objects;

create policy "Users can view their own quest proof files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'quest-proofs'
  and auth.uid()::text = (storage.foldername(name))[1]
);
