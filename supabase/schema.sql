-- HIRELab Database Schema
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

-- ============================================================
-- Migration: AI candidate scoring (run after initial schema)
-- ============================================================

-- Add AI score columns to candidates table
-- Run this if the candidates table already exists:
--
-- alter table public.candidates
--   add column if not exists score integer check (score >= 1 and score <= 10),
--   add column if not exists score_reasoning text;
--
-- If creating the candidates table fresh, include these columns in the CREATE TABLE statement.

-- Candidates table (if not already created)
create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  requisition_id uuid,
  name text not null,
  email text,
  phone text,
  source text,
  current_stage_id uuid,
  status text not null default 'active',
  notes text,
  score integer check (score >= 1 and score <= 10),
  score_reasoning text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_candidates_user_id on public.candidates(user_id);
create index if not exists idx_candidates_requisition_id on public.candidates(requisition_id);

alter table public.candidates enable row level security;

create policy "Users can view their own candidates"
  on public.candidates for select
  using (auth.uid() = user_id);

create policy "Users can insert their own candidates"
  on public.candidates for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own candidates"
  on public.candidates for update
  using (auth.uid() = user_id);

create policy "Users can delete their own candidates"
  on public.candidates for delete
  using (auth.uid() = user_id);

create trigger set_candidates_updated_at
  before update on public.candidates
  for each row
  execute function public.handle_updated_at();

