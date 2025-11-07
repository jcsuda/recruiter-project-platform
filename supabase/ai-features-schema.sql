-- AI Features Database Schema
-- AI-powered matching, advanced search, and intelligent insights

-- AI candidate matching scores
create table public.ai_candidate_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  requisition_id uuid references public.requisitions(id) on delete cascade,
  overall_score decimal(5,2) not null check (overall_score >= 0 and overall_score <= 100),
  skills_match_score decimal(5,2) not null check (skills_match_score >= 0 and skills_match_score <= 100),
  experience_score decimal(5,2) not null check (experience_score >= 0 and experience_score <= 100),
  cultural_fit_score decimal(5,2) not null check (cultural_fit_score >= 0 and cultural_fit_score <= 100),
  location_score decimal(5,2) not null check (location_score >= 0 and location_score <= 100),
  availability_score decimal(5,2) not null check (availability_score >= 0 and availability_score <= 100),
  ai_analysis jsonb,
  recommendations text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Advanced search templates
create table public.search_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  search_criteria jsonb not null,
  is_public boolean default false,
  usage_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Custom fields for candidates
create table public.custom_candidate_fields (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  field_name text not null,
  field_type text not null check (field_type in ('text', 'number', 'date', 'boolean', 'select', 'multiselect', 'textarea')),
  field_options jsonb,
  is_required boolean default false,
  display_order integer default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Custom field values for candidates
create table public.candidate_custom_values (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  field_id uuid not null references public.custom_candidate_fields(id) on delete cascade,
  field_value text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(candidate_id, field_id)
);

-- AI insights and recommendations
create table public.ai_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  insight_type text not null check (insight_type in ('candidate_match', 'pipeline_optimization', 'source_effectiveness', 'time_to_hire', 'diversity_metrics')),
  title text not null,
  description text not null,
  confidence_score decimal(5,2) not null check (confidence_score >= 0 and confidence_score <= 100),
  recommendations jsonb,
  data_points jsonb,
  is_actionable boolean default true,
  created_at timestamptz default now(),
  expires_at timestamptz
);

-- Integration configurations
create table public.integration_configs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  integration_type text not null check (integration_type in ('ats', 'job_board', 'calendar', 'email', 'social_media')),
  integration_name text not null,
  config_data jsonb not null,
  is_active boolean default true,
  last_sync_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Search analytics
create table public.search_analytics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  search_query text not null,
  search_filters jsonb,
  results_count integer not null,
  search_duration_ms integer,
  search_source text,
  created_at timestamptz default now()
);

-- RLS Policies for AI features
alter table public.ai_candidate_scores enable row level security;
alter table public.search_templates enable row level security;
alter table public.custom_candidate_fields enable row level security;
alter table public.candidate_custom_values enable row level security;
alter table public.ai_insights enable row level security;
alter table public.integration_configs enable row level security;
alter table public.search_analytics enable row level security;

-- AI candidate scores policies
create policy "Users can view their own ai_candidate_scores" on public.ai_candidate_scores
  for select using (user_id = auth.uid());

create policy "Users can insert their own ai_candidate_scores" on public.ai_candidate_scores
  for insert with check (user_id = auth.uid());

create policy "Users can update their own ai_candidate_scores" on public.ai_candidate_scores
  for update using (user_id = auth.uid());

-- Search templates policies
create policy "Users can view their own search_templates" on public.search_templates
  for select using (user_id = auth.uid() or is_public = true);

create policy "Users can insert their own search_templates" on public.search_templates
  for insert with check (user_id = auth.uid());

create policy "Users can update their own search_templates" on public.search_templates
  for update using (user_id = auth.uid());

-- Custom fields policies
create policy "Users can view their own custom_candidate_fields" on public.custom_candidate_fields
  for select using (user_id = auth.uid());

create policy "Users can insert their own custom_candidate_fields" on public.custom_candidate_fields
  for insert with check (user_id = auth.uid());

create policy "Users can update their own custom_candidate_fields" on public.custom_candidate_fields
  for update using (user_id = auth.uid());

-- Custom field values policies
create policy "Users can view candidate_custom_values for their candidates" on public.candidate_custom_values
  for select using (
    candidate_id in (
      select id from public.candidates where user_id = auth.uid()
    )
  );

create policy "Users can insert candidate_custom_values for their candidates" on public.candidate_custom_values
  for insert with check (
    candidate_id in (
      select id from public.candidates where user_id = auth.uid()
    )
  );

create policy "Users can update candidate_custom_values for their candidates" on public.candidate_custom_values
  for update using (
    candidate_id in (
      select id from public.candidates where user_id = auth.uid()
    )
  );

-- AI insights policies
create policy "Users can view their own ai_insights" on public.ai_insights
  for select using (user_id = auth.uid());

create policy "Users can insert their own ai_insights" on public.ai_insights
  for insert with check (user_id = auth.uid());

-- Integration configs policies
create policy "Users can view their own integration_configs" on public.integration_configs
  for select using (user_id = auth.uid());

create policy "Users can insert their own integration_configs" on public.integration_configs
  for insert with check (user_id = auth.uid());

create policy "Users can update their own integration_configs" on public.integration_configs
  for update using (user_id = auth.uid());

-- Search analytics policies
create policy "Users can view their own search_analytics" on public.search_analytics
  for select using (user_id = auth.uid());

create policy "Users can insert their own search_analytics" on public.search_analytics
  for insert with check (user_id = auth.uid());

-- Function to calculate AI candidate scores
create or replace function calculate_candidate_score(
  p_candidate_id uuid,
  p_requisition_id uuid,
  p_user_id uuid
)
returns decimal(5,2) as $$
declare
  candidate_data record;
  requisition_data record;
  skills_score decimal(5,2) := 0;
  experience_score decimal(5,2) := 0;
  location_score decimal(5,2) := 0;
  overall_score decimal(5,2) := 0;
begin
  -- Get candidate data
  select * into candidate_data
  from public.candidates
  where id = p_candidate_id and user_id = p_user_id;
  
  -- Get requisition data
  select * into requisition_data
  from public.requisitions
  where id = p_requisition_id and user_id = p_user_id;
  
  -- Simple scoring algorithm (can be enhanced with ML)
  -- Skills matching (placeholder logic)
  skills_score := 75.0; -- This would be calculated based on actual skills matching
  
  -- Experience scoring (placeholder logic)
  experience_score := 80.0; -- This would be calculated based on years of experience
  
  -- Location scoring (placeholder logic)
  location_score := 90.0; -- This would be calculated based on location preferences
  
  -- Calculate overall score (weighted average)
  overall_score := (skills_score * 0.4 + experience_score * 0.3 + location_score * 0.3);
  
  return overall_score;
end;
$$ language plpgsql;

-- Function to generate AI insights
create or replace function generate_ai_insights(p_user_id uuid)
returns void as $$
begin
  -- This would contain AI logic to generate insights
  -- For now, we'll create placeholder insights
  
  insert into public.ai_insights (
    user_id,
    insight_type,
    title,
    description,
    confidence_score,
    recommendations,
    data_points
  ) values (
    p_user_id,
    'pipeline_optimization',
    'Pipeline Bottleneck Detected',
    'Your phone screen stage has a 40% drop-off rate. Consider improving screening criteria.',
    85.0,
    '["Review screening questions", "Add technical pre-screening", "Improve candidate communication"]',
    '{"drop_off_rate": 40, "stage": "phone_screen", "candidates_affected": 12}'
  );
end;
$$ language plpgsql;


