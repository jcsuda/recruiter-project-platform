/**
 * Core types for Boolean Search Builder
 */

export type SourceKey = 'linkedin' | 'github' | 'stackoverflow' | 'dribbble' | 'xing' | 'twitter';

export type SearchEngine = 'google' | 'bing' | 'twitter';

export type EducationLevel = 'bachelors' | 'masters' | 'doctoral';

export interface Source {
  id: string;
  key: SourceKey;
  label: string;
  enabled: boolean;
  site: string;
  icon?: string;
}

export type OpenToWorkStatus = 'opentowork' | 'hiring';

export interface SearchParams {
  role?: string;
  include?: string[];
  exclude?: string[];
  location?: string;
  education?: EducationLevel;
  employer?: string;
  openToWork?: OpenToWorkStatus;
}

export interface BooleanQuery {
  raw: string;
  encoded: string;
  url: string;
}

export interface SavedSearch {
  id: string;
  user_id: string;
  source_key: SourceKey;
  title: string;
  params: SearchParams;
  created_at: string;
  updated_at: string;
}

export interface Synonym {
  id: string;
  source_key: SourceKey;
  token: string;
  expansions: string[];
}

