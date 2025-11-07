// AI Features TypeScript Types

export interface AICandidateScore {
  id: string;
  user_id: string;
  candidate_id: string;
  requisition_id?: string;
  overall_score: number;
  skills_match_score: number;
  experience_score: number;
  cultural_fit_score: number;
  location_score: number;
  availability_score: number;
  ai_analysis?: Record<string, any>;
  recommendations: string[];
  created_at: string;
  updated_at: string;
  candidate?: {
    id: string;
    name: string;
    email: string;
  };
  requisition?: {
    id: string;
    title: string;
    department: string;
  };
}

export interface SearchTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  search_criteria: Record<string, any>;
  is_public: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface CustomCandidateField {
  id: string;
  user_id: string;
  field_name: string;
  field_type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect' | 'textarea';
  field_options?: Record<string, any>;
  is_required: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CandidateCustomValue {
  id: string;
  candidate_id: string;
  field_id: string;
  field_value?: string;
  created_at: string;
  updated_at: string;
  field?: CustomCandidateField;
}

export interface AIInsight {
  id: string;
  user_id: string;
  insight_type: 'candidate_match' | 'pipeline_optimization' | 'source_effectiveness' | 'time_to_hire' | 'diversity_metrics';
  title: string;
  description: string;
  confidence_score: number;
  recommendations?: Record<string, any>;
  data_points?: Record<string, any>;
  is_actionable: boolean;
  created_at: string;
  expires_at?: string;
}

export interface IntegrationConfig {
  id: string;
  user_id: string;
  integration_type: 'ats' | 'job_board' | 'calendar' | 'email' | 'social_media';
  integration_name: string;
  config_data: Record<string, any>;
  is_active: boolean;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SearchAnalytics {
  id: string;
  user_id: string;
  search_query: string;
  search_filters?: Record<string, any>;
  results_count: number;
  search_duration_ms?: number;
  search_source?: string;
  created_at: string;
}

export interface AIMatchingRequest {
  candidate_id: string;
  requisition_id: string;
  criteria?: {
    skills_weight?: number;
    experience_weight?: number;
    location_weight?: number;
    cultural_fit_weight?: number;
  };
}

export interface AdvancedSearchFilters {
  skills?: string[];
  experience_years?: {
    min: number;
    max: number;
  };
  location?: {
    city?: string;
    state?: string;
    country?: string;
    remote?: boolean;
  };
  education?: {
    degree?: string;
    field?: string;
  };
  salary?: {
    min: number;
    max: number;
  };
  availability?: string;
  source?: string[];
  date_range?: {
    start: string;
    end: string;
  };
}

export interface CustomFieldFormData {
  field_name: string;
  field_type: CustomCandidateField['field_type'];
  field_options?: Record<string, any>;
  is_required: boolean;
  display_order: number;
}

export interface AIRecommendation {
  type: 'candidate' | 'process' | 'source' | 'timing';
  title: string;
  description: string;
  confidence: number;
  action_items: string[];
  expected_impact: string;
}

export interface MobileOptimization {
  is_mobile: boolean;
  touch_optimized: boolean;
  offline_capable: boolean;
  push_notifications: boolean;
}

export interface IntegrationStatus {
  integration_id: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  last_sync: string;
  sync_frequency: string;
  error_message?: string;
}


