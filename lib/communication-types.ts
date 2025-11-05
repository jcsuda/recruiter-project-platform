// Communication Hub TypeScript Types

export interface Communication {
  id: string;
  user_id: string;
  candidate_id: string;
  type: 'email' | 'phone' | 'meeting' | 'note' | 'reminder';
  subject?: string;
  content: string;
  direction: 'outbound' | 'inbound';
  status: 'sent' | 'delivered' | 'opened' | 'replied' | 'failed' | 'scheduled';
  scheduled_at?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
}

export interface FollowUp {
  id: string;
  user_id: string;
  candidate_id: string;
  title: string;
  description?: string;
  due_date: string;
  status: 'pending' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

export interface Interview {
  id: string;
  user_id: string;
  candidate_id: string;
  title: string;
  description?: string;
  interview_type: 'phone' | 'video' | 'in_person' | 'technical' | 'panel';
  scheduled_at: string;
  duration_minutes: number;
  location?: string;
  meeting_link?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  body: string;
  template_type: 'initial_contact' | 'follow_up' | 'interview_invite' | 'rejection' | 'offer';
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommunicationFormData {
  type: Communication['type'];
  subject?: string;
  content: string;
  direction: Communication['direction'];
  scheduled_at?: string;
}

export interface FollowUpFormData {
  title: string;
  description?: string;
  due_date: string;
  priority: FollowUp['priority'];
}

export interface InterviewFormData {
  title: string;
  description?: string;
  interview_type: Interview['interview_type'];
  scheduled_at: string;
  duration_minutes: number;
  location?: string;
  meeting_link?: string;
  notes?: string;
}

export interface EmailTemplateFormData {
  name: string;
  subject: string;
  body: string;
  template_type: EmailTemplate['template_type'];
}

