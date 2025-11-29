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

-- 自动创建用户 profile 的触发器
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', '')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Essays authored by users.
create table if not exists public.essays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'Untitled Essay',
  content text default '',
  word_count integer default 0,
  ai_score numeric(3,1),
  ai_feedback jsonb,
  status text not null default 'draft' check (status in ('draft', 'completed', 'archived')),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

-- 索引优化：按用户和更新时间排序查询
create index if not exists idx_essays_user_updated on public.essays(user_id, updated_at desc);
create index if not exists idx_essays_user_status on public.essays(user_id, status);

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
  -- 自动计算字数
  new.word_count = array_length(regexp_split_to_array(coalesce(new.content, ''), '\s+'), 1);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists update_essay_timestamp on public.essays;
create trigger update_essay_timestamp
  before update on public.essays
  for each row
  execute function public.handle_essay_updated_at();

-- 插入时也自动计算字数
create or replace function public.handle_essay_insert()
returns trigger as $$
begin
  new.word_count = array_length(regexp_split_to_array(coalesce(new.content, ''), '\s+'), 1);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists insert_essay_word_count on public.essays;
create trigger insert_essay_word_count
  before insert on public.essays
  for each row
  execute function public.handle_essay_insert();

-- Vocabulary collection table referenced in the PRD.
create table if not exists public.vocabulary (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  word text not null,
  phonetic text,
  definition text,
  context_sentence text,
  part_of_speech text[],
  synonyms text[],
  created_at timestamptz not null default timezone('utc'::text, now())
);

-- 防止同一用户重复收藏同一单词（使用唯一索引实现，支持大小写不敏感）
create unique index if not exists idx_vocabulary_user_word_unique 
  on public.vocabulary(user_id, lower(word));

-- 索引优化：按用户和创建时间排序查询
create index if not exists idx_vocabulary_user_created 
  on public.vocabulary(user_id, created_at desc);

-- 需要启用 pg_trgm 扩展以支持模糊搜索
create extension if not exists pg_trgm;

-- 支持单词模糊搜索
create index if not exists idx_vocabulary_word 
  on public.vocabulary using gin(word gin_trgm_ops);

alter table public.vocabulary enable row level security;

create policy "Users can manage own vocabulary"
  on public.vocabulary
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

