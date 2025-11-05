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
  permissions: Record<string, any>;
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

export interface TeamNote {
  id: string;
  entity_type: 'candidate' | 'requisition' | 'communication';
  entity_id: string;
  author_id: string;
  content: string;
  note_type: 'note' | 'comment' | 'update' | 'reminder';
  is_private: boolean;
  mentions: string[];
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export interface ApprovalWorkflow {
  id: string;
  entity_type: 'offer' | 'hire' | 'rejection' | 'requisition';
  entity_id: string;
  requester_id: string;
  approver_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  comments?: string;
  requested_at: string;
  responded_at?: string;
  due_date?: string;
  requester?: {
    id: string;
    email: string;
    full_name?: string;
  };
  approver?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export interface TeamNotification {
  id: string;
  user_id: string;
  type: 'assignment' | 'mention' | 'approval' | 'comment' | 'update' | 'reminder';
  title: string;
  message: string;
  entity_type?: string;
  entity_id?: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

export interface ActivityFeedItem {
  id: string;
  user_id: string;
  team_id?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, any>;
  created_at: string;
  user?: {
    id: string;
    email: string;
    full_name?: string;
  };
}

export interface TeamDashboard {
  team: Team;
  members: TeamMember[];
  recentActivity: ActivityFeedItem[];
  pendingApprovals: ApprovalWorkflow[];
  notifications: TeamNotification[];
  stats: {
    totalMembers: number;
    activeAssignments: number;
    pendingApprovals: number;
    unreadNotifications: number;
  };
}

export interface AssignmentFormData {
  candidate_id: string;
  assigned_to: string;
  assignment_type: CandidateAssignment['assignment_type'];
  notes?: string;
}

export interface TeamNoteFormData {
  entity_type: TeamNote['entity_type'];
  entity_id: string;
  content: string;
  note_type: TeamNote['note_type'];
  is_private: boolean;
  mentions: string[];
}

export interface ApprovalFormData {
  entity_type: ApprovalWorkflow['entity_type'];
  entity_id: string;
  approver_id: string;
  priority: ApprovalWorkflow['priority'];
  comments?: string;
  due_date?: string;
}

export interface TeamInviteFormData {
  email: string;
  role: TeamMember['role'];
  permissions: Record<string, any>;
}

export interface UserPermissions {
  canViewCandidates: boolean;
  canEditCandidates: boolean;
  canDeleteCandidates: boolean;
  canViewRequisitions: boolean;
  canEditRequisitions: boolean;
  canDeleteRequisitions: boolean;
  canViewAnalytics: boolean;
  canManageTeam: boolean;
  canApproveOffers: boolean;
  canAssignCandidates: boolean;
}

