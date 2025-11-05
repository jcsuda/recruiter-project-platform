// Advanced Analytics TypeScript Types

export interface AnalyticsEvent {
  id: string;
  user_id: string;
  event_type: 'candidate_viewed' | 'candidate_contacted' | 'email_sent' | 'interview_scheduled' | 
              'interview_completed' | 'offer_made' | 'offer_accepted' | 'candidate_rejected' | 
              'candidate_withdrawn' | 'requisition_created' | 'requisition_closed' | 'search_performed';
  entity_type: 'candidate' | 'requisition' | 'communication' | 'search';
  entity_id: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface SourceAnalytics {
  id: string;
  user_id: string;
  source_name: string;
  total_candidates: number;
  contacted_candidates: number;
  interviewed_candidates: number;
  offers_made: number;
  hires_made: number;
  total_cost: number;
  cost_per_hire: number;
  conversion_rate: number;
  time_to_hire_days: number;
  last_updated: string;
}

export interface RequisitionAnalytics {
  id: string;
  user_id: string;
  requisition_id: string;
  days_to_fill?: number;
  total_candidates: number;
  interviews_conducted: number;
  offers_made: number;
  cost_per_hire: number;
  source_breakdown?: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export interface PerformanceMetric {
  id: string;
  user_id: string;
  metric_name: string;
  metric_value: number;
  metric_unit?: string;
  period_start: string;
  period_end: string;
  created_at: string;
}

export interface AnalyticsDashboard {
  sourcePerformance: SourceAnalytics[];
  conversionFunnel: {
    stage: string;
    count: number;
    conversionRate: number;
    dropOffRate: number;
  }[];
  timeMetrics: {
    averageTimeToFill: number;
    averageTimeToHire: number;
    fastestHire: number;
    slowestHire: number;
  };
  costMetrics: {
    totalCost: number;
    averageCostPerHire: number;
    costBySource: Record<string, number>;
  };
  trends: {
    period: string;
    hires: number;
    applications: number;
    interviews: number;
  }[];
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
    borderWidth?: number;
  }[];
}

export interface FunnelData {
  stage: string;
  count: number;
  conversionRate: number;
  dropOffRate: number;
  color: string;
}

export interface SourcePerformanceData {
  source: string;
  totalCandidates: number;
  hires: number;
  conversionRate: number;
  costPerHire: number;
  timeToHire: number;
  color: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label: string;
}

export interface AnalyticsFilters {
  dateRange: {
    start: string;
    end: string;
  };
  sources?: string[];
  requisitions?: string[];
  stages?: string[];
}

