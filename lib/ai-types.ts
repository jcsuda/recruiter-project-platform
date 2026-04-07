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
  ai_analysis?: Record<string, unknown>;
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
  search_criteria: Record<string, unknown>;
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
  field_options?: Record<string, unknown>;
  is_required: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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




