-- Team Collaboration Database Schema
-- Multi-user support, candidate assignment, team notes, and approval workflows

-- Teams table
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Team members table
create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'recruiter', 'viewer')),
  permissions jsonb default '{}',
  joined_at timestamptz default now(),
  invited_by uuid references auth.users(id),
  status text not null check (status in ('active', 'pending', 'suspended')) default 'pending'
);

-- Candidate assignments
create table public.candidate_assignments (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  assigned_to uuid not null references auth.users(id) on delete cascade,
  assigned_by uuid not null references auth.users(id) on delete cascade,
  assignment_type text not null check (assignment_type in ('primary', 'secondary', 'reviewer', 'interviewer')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Team notes and comments
create table public.team_notes (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('candidate', 'requisition', 'communication')),
  entity_id uuid not null,
  author_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  note_type text not null check (note_type in ('note', 'comment', 'update', 'reminder')) default 'note',
  is_private boolean default false,
  mentions jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Approval workflows
create table public.approval_workflows (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('offer', 'hire', 'rejection', 'requisition')),
  entity_id uuid not null,
  requester_id uuid not null references auth.users(id) on delete cascade,
  approver_id uuid not null references auth.users(id) on delete cascade,
  status text not null check (status in ('pending', 'approved', 'rejected', 'cancelled')) default 'pending',
  priority text not null check (priority in ('low', 'medium', 'high', 'urgent')) default 'medium',
  comments text,
  requested_at timestamptz default now(),
  responded_at timestamptz,
  due_date timestamptz
);

-- Team notifications
create table public.team_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('assignment', 'mention', 'approval', 'comment', 'update', 'reminder')),
  title text not null,
  message text not null,
  entity_type text,
  entity_id uuid,
  is_read boolean default false,
  created_at timestamptz default now(),
  read_at timestamptz
);

-- Activity feed
create table public.activity_feed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  details jsonb default '{}',
  created_at timestamptz default now()
);

-- RLS Policies for team collaboration
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.candidate_assignments enable row level security;
alter table public.team_notes enable row level security;
alter table public.approval_workflows enable row level security;
alter table public.team_notifications enable row level security;
alter table public.activity_feed enable row level security;

-- Teams policies
create policy "Users can view teams they belong to" on public.teams
  for select using (
    id in (
      select team_id from public.team_members 
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "Team owners can manage their teams" on public.teams
  for all using (
    owner_id = auth.uid() or
    id in (
      select team_id from public.team_members 
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- Team members policies
create policy "Users can view team members of their teams" on public.team_members
  for select using (
    team_id in (
      select team_id from public.team_members 
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "Team admins can manage team members" on public.team_members
  for all using (
    team_id in (
      select team_id from public.team_members 
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- Candidate assignments policies
create policy "Users can view assignments for their candidates" on public.candidate_assignments
  for select using (
    assigned_to = auth.uid() or
    candidate_id in (
      select id from public.candidates where user_id = auth.uid()
    )
  );

create policy "Users can create assignments for their candidates" on public.candidate_assignments
  for insert with check (
    candidate_id in (
      select id from public.candidates where user_id = auth.uid()
    )
  );

-- Team notes policies
create policy "Users can view notes for their entities" on public.team_notes
  for select using (
    (entity_type = 'candidate' and entity_id in (
      select id from public.candidates where user_id = auth.uid()
    )) or
    (entity_type = 'requisition' and entity_id in (
      select id from public.requisitions where user_id = auth.uid()
    )) or
    (entity_type = 'communication' and entity_id in (
      select c.id from public.communications c 
      join public.candidates cand on c.candidate_id = cand.id 
      where cand.user_id = auth.uid()
    ))
  );

create policy "Users can create notes for their entities" on public.team_notes
  for insert with check (
    author_id = auth.uid() and (
      (entity_type = 'candidate' and entity_id in (
        select id from public.candidates where user_id = auth.uid()
      )) or
      (entity_type = 'requisition' and entity_id in (
        select id from public.requisitions where user_id = auth.uid()
      ))
    )
  );

-- Approval workflows policies
create policy "Users can view their approval workflows" on public.approval_workflows
  for select using (
    requester_id = auth.uid() or approver_id = auth.uid()
  );

create policy "Users can create approval workflows" on public.approval_workflows
  for insert with check (requester_id = auth.uid());

create policy "Users can update their approval workflows" on public.approval_workflows
  for update using (
    requester_id = auth.uid() or approver_id = auth.uid()
  );

-- Notifications policies
create policy "Users can view their own notifications" on public.team_notifications
  for select using (user_id = auth.uid());

create policy "Users can update their own notifications" on public.team_notifications
  for update using (user_id = auth.uid());

-- Activity feed policies
create policy "Users can view team activity" on public.activity_feed
  for select using (
    user_id = auth.uid() or
    team_id in (
      select team_id from public.team_members 
      where user_id = auth.uid() and status = 'active'
    )
  );

create policy "Users can create activity entries" on public.activity_feed
  for insert with check (user_id = auth.uid());

-- Function to create default team for new users
create or replace function create_default_team()
returns trigger as $$
begin
  -- Create a default team for the new user
  insert into public.teams (name, description, owner_id)
  values ('My Team', 'Default team for ' || NEW.email, NEW.id);
  
  -- Add the user as the team owner
  insert into public.team_members (team_id, user_id, role, status)
  select id, NEW.id, 'owner', 'active'
  from public.teams
  where owner_id = NEW.id;
  
  return NEW;
end;
$$ language plpgsql;

-- Trigger to create default team for new users
create trigger create_default_team_trigger
  after insert on auth.users
  for each row execute function create_default_team();

-- Function to log activity
create or replace function log_activity(
  p_user_id uuid,
  p_team_id uuid,
  p_action text,
  p_entity_type text,
  p_entity_id uuid,
  p_details jsonb default '{}'
)
returns void as $$
begin
  insert into public.activity_feed (
    user_id, team_id, action, entity_type, entity_id, details
  ) values (
    p_user_id, p_team_id, p_action, p_entity_type, p_entity_id, p_details
  );
end;
$$ language plpgsql;
