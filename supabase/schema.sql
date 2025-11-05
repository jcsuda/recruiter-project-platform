-- HireLab Database Schema
-- This schema supports saved searches, source management, and synonym expansion

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Sources table (network metadata)
create table public.sources (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  label text not null,
  enabled boolean not null default true,
  created_at timestamptz default now()
);

-- Saved searches
create table public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_key text not null references public.sources(key),
  title text not null,
  params jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Synonyms (future enhancement)
create table public.synonyms (
  id uuid primary key default gen_random_uuid(),
  source_key text not null references public.sources(key),
  token text not null,
  expansions text[] not null,
  unique(source_key, token)
);

-- Create indexes for performance
create index idx_saved_searches_user_id on public.saved_searches(user_id);
create index idx_saved_searches_source_key on public.saved_searches(source_key);
create index idx_synonyms_source_key on public.synonyms(source_key);

-- Enable Row Level Security
alter table public.sources enable row level security;
alter table public.saved_searches enable row level security;
alter table public.synonyms enable row level security;

-- RLS Policies

-- Sources: Public read access
create policy "Sources are viewable by everyone"
  on public.sources for select
  using (true);

-- Saved searches: Users can only see their own searches
create policy "Users can view their own searches"
  on public.saved_searches for select
  using (auth.uid() = user_id);

create policy "Users can insert their own searches"
  on public.saved_searches for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own searches"
  on public.saved_searches for update
  using (auth.uid() = user_id);

create policy "Users can delete their own searches"
  on public.saved_searches for delete
  using (auth.uid() = user_id);

-- Synonyms: Public read access
create policy "Synonyms are viewable by everyone"
  on public.synonyms for select
  using (true);

-- Insert default sources
insert into public.sources (key, label, enabled) values
  ('linkedin', 'LinkedIn', true),
  ('github', 'GitHub', true),
  ('stackoverflow', 'Stack Overflow', true),
  ('dribbble', 'Dribbble', true),
  ('xing', 'Xing', true),
  ('twitter', 'X (Twitter)', true);

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for saved_searches
create trigger set_updated_at
  before update on public.saved_searches
  for each row
  execute function public.handle_updated_at();

