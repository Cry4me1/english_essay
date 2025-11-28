-- Enable UUID helpers for standalone deployments.
create extension if not exists "pgcrypto";

-- User profiles mirror Supabase Auth users.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owners"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Profiles are insertable by owners"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "Profiles are updatable by owners"
  on public.profiles
  for update
  using (auth.uid() = id);

-- Essays authored by users.
create table if not exists public.essays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  content text,
  ai_score numeric(3,1),
  ai_feedback jsonb,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.essays enable row level security;

create policy "Users can manage own essays"
  on public.essays
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.handle_essay_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists update_essay_timestamp on public.essays;
create trigger update_essay_timestamp
  before update on public.essays
  for each row
  execute function public.handle_essay_updated_at();

-- Vocabulary collection table referenced in the PRD.
create table if not exists public.vocabulary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  word text not null,
  definition text,
  context_sentence text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.vocabulary enable row level security;

create policy "Users can manage own vocabulary"
  on public.vocabulary
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

