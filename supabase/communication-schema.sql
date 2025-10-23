-- Communication Hub Database Schema
-- Add communication tracking and email integration

-- Communication history table
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

-- Follow-up reminders table
create table public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  title text not null,
  description text,
  due_date timestamptz not null,
  status text not null check (status in ('pending', 'completed', 'cancelled')),
  priority text not null check (priority in ('low', 'medium', 'high', 'urgent')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Interview scheduling table
create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  title text not null,
  description text,
  interview_type text not null check (interview_type in ('phone', 'video', 'in_person', 'technical', 'panel')),
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 60,
  location text,
  meeting_link text,
  status text not null check (status in ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Email templates table
create table public.email_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  subject text not null,
  body text not null,
  template_type text not null check (template_type in ('initial_contact', 'follow_up', 'interview_invite', 'rejection', 'offer')),
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- RLS Policies for communications
alter table public.communications enable row level security;
alter table public.follow_ups enable row level security;
alter table public.interviews enable row level security;
alter table public.email_templates enable row level security;

-- Communications policies
create policy "Users can view their own communications" on public.communications
  for select using (auth.uid() = user_id);

create policy "Users can insert their own communications" on public.communications
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own communications" on public.communications
  for update using (auth.uid() = user_id);

create policy "Users can delete their own communications" on public.communications
  for delete using (auth.uid() = user_id);

-- Follow-ups policies
create policy "Users can view their own follow_ups" on public.follow_ups
  for select using (auth.uid() = user_id);

create policy "Users can insert their own follow_ups" on public.follow_ups
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own follow_ups" on public.follow_ups
  for update using (auth.uid() = user_id);

create policy "Users can delete their own follow_ups" on public.follow_ups
  for delete using (auth.uid() = user_id);

-- Interviews policies
create policy "Users can view their own interviews" on public.interviews
  for select using (auth.uid() = user_id);

create policy "Users can insert their own interviews" on public.interviews
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own interviews" on public.interviews
  for update using (auth.uid() = user_id);

create policy "Users can delete their own interviews" on public.interviews
  for delete using (auth.uid() = user_id);

-- Email templates policies
create policy "Users can view their own email_templates" on public.email_templates
  for select using (auth.uid() = user_id);

create policy "Users can insert their own email_templates" on public.email_templates
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own email_templates" on public.email_templates
  for update using (auth.uid() = user_id);

create policy "Users can delete their own email_templates" on public.email_templates
  for delete using (auth.uid() = user_id);

-- Note: Default email templates will be created for each user when they first access the templates
-- This is handled in the application code, not in the database schema
