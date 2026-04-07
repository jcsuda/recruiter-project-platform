// Team Collaboration TypeScript Types

export interface Team {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'recruiter' | 'viewer';
  permissions: Record<string, unknown>;
  joined_at: string;
  invited_by?: string;
  status: 'active' | 'pending' | 'suspended';
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export interface CandidateAssignment {
  id: string;
  candidate_id: string;
  assigned_to: string;
  assigned_by: string;
  assignment_type: 'primary' | 'secondary' | 'reviewer' | 'interviewer';
  notes?: string;
  created_at: string;
  updated_at: string;
  assigned_to_user?: {
    id: string;
    email: string;
    full_name?: string;
  };
  assigned_by_user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export interface AssignmentFormData {
  candidate_id: string;
  assigned_to: string;
  assignment_type: CandidateAssignment['assignment_type'];
  notes?: string;
}

export interface TeamInviteFormData {
  email: string;
  role: TeamMember['role'];
  permissions: Record<string, unknown>;
}




