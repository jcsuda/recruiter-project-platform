-- Dashboard Tables for HIRELab
-- Extends the base schema with requisitions, candidates, and pipeline tracking

-- Requisitions table
create table public.requisitions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  position_title text not null,
  hiring_manager text,
  department text,
  location text,
  priority text check (priority in ('low', 'medium', 'high', 'urgent')),
  status text not null check (status in ('open', 'interviewing', 'offer_extended', 'closed')),
  target_start_date date,
  hire_date date,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Pipeline stages
create table public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  order_index int not null,
  created_at timestamptz default now()
);

-- Default pipeline stages
insert into public.pipeline_stages (name, order_index) values
  ('Applications Received', 1),
  ('Phone Screens', 2),
  ('Technical Assessments', 3),
  ('Onsite Interviews', 4),
  ('Offers Extended', 5),
  ('Hires Made', 6);

-- Candidates table
create table public.candidates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  requisition_id uuid references public.requisitions(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  source text, -- where they came from (LinkedIn, referral, etc.)
  current_stage_id uuid references public.pipeline_stages(id),
  status text check (status in ('active', 'rejected', 'withdrawn', 'hired')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Candidate stage history (for tracking movement through pipeline)
create table public.candidate_stage_history (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  stage_id uuid not null references public.pipeline_stages(id),
  entered_at timestamptz default now(),
  exited_at timestamptz,
  notes text
);

-- Create indexes
create index idx_requisitions_user_id on public.requisitions(user_id);
create index idx_requisitions_status on public.requisitions(status);
create index idx_candidates_user_id on public.candidates(user_id);
create index idx_candidates_requisition_id on public.candidates(requisition_id);
create index idx_candidates_stage_id on public.candidates(current_stage_id);
create index idx_candidate_stage_history_candidate_id on public.candidate_stage_history(candidate_id);

-- Enable RLS
alter table public.requisitions enable row level security;
alter table public.candidates enable row level security;
alter table public.candidate_stage_history enable row level security;
alter table public.pipeline_stages enable row level security;

-- RLS Policies for requisitions
create policy "Users can view their own requisitions"
  on public.requisitions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own requisitions"
  on public.requisitions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own requisitions"
  on public.requisitions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own requisitions"
  on public.requisitions for delete
  using (auth.uid() = user_id);

-- RLS Policies for candidates
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

-- RLS Policies for candidate stage history
create policy "Users can view candidate history for their candidates"
  on public.candidate_stage_history for select
  using (exists (
    select 1 from public.candidates
    where candidates.id = candidate_stage_history.candidate_id
    and candidates.user_id = auth.uid()
  ));

create policy "Users can insert stage history for their candidates"
  on public.candidate_stage_history for insert
  with check (exists (
    select 1 from public.candidates
    where candidates.id = candidate_stage_history.candidate_id
    and candidates.user_id = auth.uid()
  ));

-- Pipeline stages: Public read access
create policy "Pipeline stages are viewable by everyone"
  on public.pipeline_stages for select
  using (true);

-- Triggers for updated_at
create trigger set_requisitions_updated_at
  before update on public.requisitions
  for each row
  execute function public.handle_updated_at();

create trigger set_candidates_updated_at
  before update on public.candidates
  for each row
  execute function public.handle_updated_at();

