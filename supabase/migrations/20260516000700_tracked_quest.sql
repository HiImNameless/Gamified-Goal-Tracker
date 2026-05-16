alter table public.user_progress
add column if not exists tracked_quest_id uuid;
