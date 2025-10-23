'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { SavedSearch, SearchParams, SourceKey } from '@/lib/types';
import { parseArrayInput } from '@/lib/builder';

interface SavedSearchesProps {
  onLoad?: (sourceKey: SourceKey, params: SearchParams, includeInput: string, excludeInput: string) => void;
}

const styles = {
  container: {
    background: '#fff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    padding: '1.5rem',
    marginTop: '1.5rem',
  },
  heading: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '1rem',
  },
  emptyState: {
    textAlign: 'center' as const,
    fontSize: '0.875rem',
    color: '#6b7280',
    padding: '1rem',
  },
  infoBox: {
    background: '#dbeafe',
    border: '1px solid #93c5fd',
    borderRadius: '6px',
    padding: '1rem',
    fontSize: '0.875rem',
    color: '#1e40af',
  },
  searchItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem',
    background: '#f9fafb',
    borderRadius: '6px',
    marginBottom: '0.5rem',
  },
  searchInfo: {
    flex: 1,
    minWidth: 0,
  },
  searchTitle: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#111827',
    margin: 0,
  },
  searchMeta: {
    fontSize: '0.75rem',
    color: '#6b7280',
    margin: '0.25rem 0 0 0',
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.5rem',
    marginLeft: '1rem',
  },
  button: {
    padding: '0.25rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: '500',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    background: 'none',
  },
};

export default function SavedSearches({ onLoad }: SavedSearchesProps) {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadSearches();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadSearches = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSearches(data || []);
    } catch (error) {
      console.error('Error loading searches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this search?')) return;

    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSearches(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting search:', error);
      alert('Failed to delete search');
    }
  };

  const handleLoad = (search: SavedSearch) => {
    if (onLoad) {
      const savedParams = search.params as any;
      const includeInput = savedParams.includeInput || (savedParams.include ? savedParams.include.join(', ') : '');
      const excludeInput = savedParams.excludeInput || (savedParams.exclude ? savedParams.exclude.join(', ') : '');
      
      onLoad(search.source_key, search.params, includeInput, excludeInput);
    }
  };

  if (!user) {
    return (
      <div style={styles.container}>
        <div style={styles.infoBox}>
          Sign in to save and manage your searches
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.emptyState}>Loading saved searches...</p>
      </div>
    );
  }

  if (searches.length === 0) {
    return (
      <div style={styles.container}>
        <h3 style={styles.heading}>Saved Searches</h3>
        <p style={styles.emptyState}>
          No saved searches yet. Fill out the form and click "Save Search" to save your first search.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.heading}>Saved Searches</h3>
      <div>
        {searches.map((search) => (
          <div key={search.id} style={styles.searchItem}>
            <div style={styles.searchInfo}>
              <p style={styles.searchTitle}>{search.title}</p>
              <p style={styles.searchMeta}>
                {search.source_key} • {new Date(search.created_at).toLocaleDateString()}
              </p>
            </div>
            <div style={styles.buttonGroup}>
              <button
                onClick={() => handleLoad(search)}
                style={{ ...styles.button, color: '#2563eb' }}
              >
                Load
              </button>
              <button
                onClick={() => handleDelete(search.id)}
                style={{ ...styles.button, color: '#dc2626' }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
