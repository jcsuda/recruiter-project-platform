/**
 * Supabase client configuration
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type-safe database helpers
export type Database = {
  public: {
    Tables: {
      sources: {
        Row: {
          id: string;
          key: string;
          label: string;
          enabled: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          label: string;
          enabled?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          label?: string;
          enabled?: boolean;
          created_at?: string;
        };
      };
      saved_searches: {
        Row: {
          id: string;
          user_id: string;
          source_key: string;
          title: string;
          params: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          source_key: string;
          title: string;
          params: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          source_key?: string;
          title?: string;
          params?: Record<string, unknown>;
          created_at?: string;
          updated_at?: string;
        };
      };
      synonyms: {
        Row: {
          id: string;
          source_key: string;
          token: string;
          expansions: string[];
        };
        Insert: {
          id?: string;
          source_key: string;
          token: string;
          expansions: string[];
        };
        Update: {
          id?: string;
          source_key?: string;
          token?: string;
          expansions?: string[];
        };
      };
    };
  };
};

