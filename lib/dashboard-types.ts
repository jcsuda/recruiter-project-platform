/**
 * Types for Dashboard/Recruiting features
 */

export type RequisitionPriority = 'low' | 'medium' | 'high' | 'urgent';
export type RequisitionStatus = 'open' | 'interviewing' | 'offer_extended' | 'closed';
export type CandidateStatus = 'active' | 'rejected' | 'withdrawn' | 'hired';

export interface Requisition {
  id: string;
  user_id: string;
  position_title: string;
  hiring_manager?: string;
  department?: string;
  location?: string;
  priority?: RequisitionPriority;
  status: RequisitionStatus;
  target_start_date?: string;
  hire_date?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  order_index: number;
  created_at: string;
}

export interface Candidate {
  id: string;
  user_id: string;
  requisition_id?: string;
  name: string;
  email?: string;
  phone?: string;
  source?: string;
  current_stage_id?: string;
  status?: CandidateStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CandidateStageHistory {
  id: string;
  candidate_id: string;
  stage_id: string;
  entered_at: string;
  exited_at?: string;
  notes?: string;
}

export interface FunnelData {
  stage: string;
  count: number;
  conversionRate?: number;
}

export interface KPIData {
  timeToFill: number;
  openRequisitions: number;
  offerAcceptanceRate: number;
  totalCandidates: number;
}

