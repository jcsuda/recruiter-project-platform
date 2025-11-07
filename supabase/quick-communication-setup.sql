-- Quick Communication Setup - Minimal schema for testing
-- Run this in Supabase SQL Editor if you want to test immediately

-- Create communications table
create table public.communications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  type text not null check (type in ('email', 'phone', 'meeting', 'note', 'reminder')),
  subject text,
  content text not null,
  direction text not null check (direction in ('outbound', 'inbound')),
  status text not null check (status in ('sent', 'delivered', 'opened', 'replied', 'failed', 'scheduled')),
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.communications enable row level security;

-- Create policies
create policy "Users can view their own communications" on public.communications
  for select using (auth.uid() = user_id);

create policy "Users can insert their own communications" on public.communications
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own communications" on public.communications
  for update using (auth.uid() = user_id);

create policy "Users can delete their own communications" on public.communications
  for delete using (auth.uid() = user_id);


