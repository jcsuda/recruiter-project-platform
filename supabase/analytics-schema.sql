-- Advanced Analytics Database Schema
-- Comprehensive recruiting analytics and performance tracking

-- Analytics events table for tracking all recruiting activities
create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in (
    'candidate_viewed', 'candidate_contacted', 'email_sent', 'interview_scheduled', 
    'interview_completed', 'offer_made', 'offer_accepted', 'candidate_rejected',
    'candidate_withdrawn', 'requisition_created', 'requisition_closed', 'search_performed'
  )),
  entity_type text not null check (entity_type in ('candidate', 'requisition', 'communication', 'search')),
  entity_id uuid not null,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Source performance tracking
create table public.source_analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_name text not null,
  total_candidates integer default 0,
  contacted_candidates integer default 0,
  interviewed_candidates integer default 0,
  offers_made integer default 0,
  hires_made integer default 0,
  total_cost decimal(10,2) default 0,
  cost_per_hire decimal(10,2) default 0,
  conversion_rate decimal(5,2) default 0,
  time_to_hire_days integer default 0,
  last_updated timestamptz default now()
);

-- Requisition analytics
create table public.requisition_analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  requisition_id uuid not null references public.requisitions(id) on delete cascade,
  days_to_fill integer,
  total_candidates integer default 0,
  interviews_conducted integer default 0,
  offers_made integer default 0,
  cost_per_hire decimal(10,2) default 0,
  source_breakdown jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Performance metrics table
create table public.performance_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  metric_name text not null,
  metric_value decimal(10,2) not null,
  metric_unit text,
  period_start date not null,
  period_end date not null,
  created_at timestamptz default now()
);

-- RLS Policies for analytics
alter table public.analytics_events enable row level security;
alter table public.source_analytics enable row level security;
alter table public.requisition_analytics enable row level security;
alter table public.performance_metrics enable row level security;

-- Analytics events policies
create policy "Users can view their own analytics_events" on public.analytics_events
  for select using (auth.uid() = user_id);

create policy "Users can insert their own analytics_events" on public.analytics_events
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own analytics_events" on public.analytics_events
  for update using (auth.uid() = user_id);

-- Source analytics policies
create policy "Users can view their own source_analytics" on public.source_analytics
  for select using (auth.uid() = user_id);

create policy "Users can insert their own source_analytics" on public.source_analytics
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own source_analytics" on public.source_analytics
  for update using (auth.uid() = user_id);

-- Requisition analytics policies
create policy "Users can view their own requisition_analytics" on public.requisition_analytics
  for select using (auth.uid() = user_id);

create policy "Users can insert their own requisition_analytics" on public.requisition_analytics
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own requisition_analytics" on public.requisition_analytics
  for update using (auth.uid() = user_id);

-- Performance metrics policies
create policy "Users can view their own performance_metrics" on public.performance_metrics
  for select using (auth.uid() = user_id);

create policy "Users can insert their own performance_metrics" on public.performance_metrics
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own performance_metrics" on public.performance_metrics
  for update using (auth.uid() = user_id);

-- Function to automatically update source analytics
create or replace function update_source_analytics()
returns trigger as $$
begin
  -- Update source analytics when candidates are modified
  if TG_OP = 'INSERT' or TG_OP = 'UPDATE' then
    -- Update source analytics for the candidate's source
    insert into public.source_analytics (
      user_id, source_name, total_candidates, contacted_candidates,
      interviewed_candidates, offers_made, hires_made
    )
    select 
      NEW.user_id,
      NEW.source,
      count(*) as total_candidates,
      count(case when status = 'active' then 1 end) as contacted_candidates,
      count(case when current_stage_id in (
        select id from pipeline_stages where name in ('Phone Screens', 'Technical Assessments', 'Onsite Interviews')
      ) then 1 end) as interviewed_candidates,
      count(case when current_stage_id in (
        select id from pipeline_stages where name = 'Offers Extended'
      ) then 1 end) as offers_made,
      count(case when status = 'hired' then 1 end) as hires_made
    from public.candidates 
    where source = NEW.source and user_id = NEW.user_id
    on conflict (user_id, source_name) do update set
      total_candidates = excluded.total_candidates,
      contacted_candidates = excluded.contacted_candidates,
      interviewed_candidates = excluded.interviewed_candidates,
      offers_made = excluded.offers_made,
      hires_made = excluded.hires_made,
      conversion_rate = case 
        when excluded.total_candidates > 0 then (excluded.hires_made::decimal / excluded.total_candidates * 100)
        else 0 
      end,
      last_updated = now();
  end if;
  
  return NEW;
end;
$$ language plpgsql;

-- Trigger to automatically update source analytics
create trigger update_source_analytics_trigger
  after insert or update on public.candidates
  for each row execute function update_source_analytics();
