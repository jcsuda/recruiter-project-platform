'use client';

import { useState, useMemo, useEffect } from 'react';
import { SearchParams, SourceKey, SearchEngine, EducationLevel, OpenToWorkStatus } from '@/lib/types';
import { SOURCE_LIST } from '@/lib/sources';
import { generateBooleanQuery, parseArrayInput } from '@/lib/builder';
import { supabase } from '@/lib/supabase';
import QueryPreview from './QueryPreview';
import SavedSearches from './SavedSearches';

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
  },
  tabsContainer: {
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '2rem',
    overflowX: 'auto' as const,
  },
  tabsNav: {
    display: 'flex',
    gap: '0.25rem',
  },
  tab: {
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    whiteSpace: 'nowrap' as const,
    background: 'none',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: '#6b7280',
  },
  activeTab: {
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    whiteSpace: 'nowrap' as const,
    background: 'none',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    borderBottom: '2px solid #2563eb',
    color: '#2563eb',
    cursor: 'pointer',
  },
  formCard: {
    background: '#fff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    padding: '1.5rem',
    marginBottom: '1.5rem',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.25rem',
  },
  input: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.875rem',
    boxSizing: 'border-box' as const,
  },
  select: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.875rem',
    boxSizing: 'border-box' as const,
    background: '#fff',
  },
  helpText: {
    marginTop: '0.25rem',
    fontSize: '0.75rem',
    color: '#6b7280',
  },
};

export default function SearchBuilder() {
  const [activeSource, setActiveSource] = useState<SourceKey>('linkedin');
  const [searchEngine, setSearchEngine] = useState<SearchEngine>('google');
  const [params, setParams] = useState<SearchParams>({
    role: '',
    include: [],
    exclude: [],
    location: '',
    education: undefined,
    employer: '',
    openToWork: undefined,
  });

  const [includeInput, setIncludeInput] = useState('');
  const [excludeInput, setExcludeInput] = useState('');
  const [user, setUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error checking user:', error);
    }
  };

  const handleSaveSearch = async () => {
    if (!user) {
      alert('Please sign in to save searches');
      return;
    }

    const title = prompt('Enter a name for this search:');
    if (!title) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('saved_searches')
        .insert({
          user_id: user.id,
          source_key: activeSource,
          title,
          params: {
            ...params,
            includeInput,
            excludeInput,
          },
        });

      if (error) throw error;
      alert('Search saved successfully!');
    } catch (error: any) {
      console.error('Error saving search:', error);
      alert(error.message || 'Failed to save search');
    } finally {
      setSaving(false);
    }
  };

  const query = useMemo(() => {
    try {
      return generateBooleanQuery(activeSource, params, searchEngine);
    } catch (error) {
      console.error('Error generating query:', error);
      return { raw: '', encoded: '', url: '' };
    }
  }, [activeSource, params, searchEngine]);

  const handleIncludeChange = (value: string) => {
    setIncludeInput(value);
    setParams(prev => ({ ...prev, include: parseArrayInput(value) }));
  };

  const handleExcludeChange = (value: string) => {
    setExcludeInput(value);
    setParams(prev => ({ ...prev, exclude: parseArrayInput(value) }));
  };

  const handleLoadSearch = (sourceKey: SourceKey, searchParams: SearchParams, includeStr: string, excludeStr: string) => {
    setActiveSource(sourceKey);
    setParams(searchParams);
    setIncludeInput(includeStr);
    setExcludeInput(excludeStr);
  };

  const isLinkedIn = activeSource === 'linkedin';
  const isStackOverflow = activeSource === 'stackoverflow';

  return (
    <div style={styles.container}>
      {/* Source Tabs */}
      <div style={styles.tabsContainer}>
        <div style={styles.tabsNav}>
          {SOURCE_LIST.map((source) => (
            <button
              key={source.key}
              onClick={() => setActiveSource(source.key)}
              style={activeSource === source.key ? styles.activeTab : styles.tab}
            >
              {source.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <div style={styles.formCard}>
        {/* Role/Title */}
        <div style={styles.formGroup}>
          <label htmlFor="role" style={styles.label}>
            {isStackOverflow ? 'Search Query' : 'Role/Title'}
          </label>
          <input
            id="role"
            type="text"
            value={params.role || ''}
            onChange={(e) => setParams(prev => ({ ...prev, role: e.target.value }))}
            placeholder={isStackOverflow ? "e.g., javascript async await" : "e.g., Software Engineer, Product Manager"}
            style={styles.input}
          />
          {isStackOverflow && (
            <p style={styles.helpText}>
              Search for questions, tags, or topics on Stack Overflow
            </p>
          )}
        </div>

        {/* Include - Hidden for Stack Overflow */}
        {!isStackOverflow && (
          <div style={styles.formGroup}>
            <label htmlFor="include" style={styles.label}>
              Include (comma-separated)
            </label>
            <input
              id="include"
              type="text"
              value={includeInput}
              onChange={(e) => handleIncludeChange(e.target.value)}
              placeholder="e.g., React, TypeScript, Node.js"
              style={styles.input}
            />
            <p style={styles.helpText}>
              Skills or keywords to include (combined with AND)
            </p>
          </div>
        )}

        {/* Exclude */}
        <div style={styles.formGroup}>
          <label htmlFor="exclude" style={styles.label}>
            Exclude (comma-separated)
          </label>
          <input
            id="exclude"
            type="text"
            value={excludeInput}
            onChange={(e) => handleExcludeChange(e.target.value)}
            placeholder="e.g., recruiter, HR"
            style={styles.input}
          />
          <p style={styles.helpText}>
            Keywords to exclude from results
          </p>
        </div>

        {/* Location - Hidden for Stack Overflow */}
        {!isStackOverflow && (
          <div style={styles.formGroup}>
            <label htmlFor="location" style={styles.label}>
              Location
            </label>
            <input
              id="location"
              type="text"
              value={params.location || ''}
              onChange={(e) => setParams(prev => ({ ...prev, location: e.target.value }))}
              placeholder="e.g., Austin, San Francisco, Remote"
              style={styles.input}
            />
          </div>
        )}

        {/* LinkedIn-specific fields */}
        {isLinkedIn && (
          <>
            <div style={styles.formGroup}>
              <label htmlFor="education" style={styles.label}>
                Education
              </label>
              <select
                id="education"
                value={params.education || ''}
                onChange={(e) => setParams(prev => ({ 
                  ...prev, 
                  education: e.target.value as EducationLevel || undefined 
                }))}
                style={styles.select}
              >
                <option value="">—</option>
                <option value="bachelors">Bachelors</option>
                <option value="masters">Masters</option>
                <option value="doctoral">Doctoral</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="employer" style={styles.label}>
                Current Employer
              </label>
              <input
                id="employer"
                type="text"
                value={params.employer || ''}
                onChange={(e) => setParams(prev => ({ ...prev, employer: e.target.value }))}
                placeholder="e.g., Google, Microsoft"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label htmlFor="openToWork" style={styles.label}>
                LinkedIn Status
              </label>
              <select
                id="openToWork"
                value={params.openToWork || ''}
                onChange={(e) => setParams(prev => ({ 
                  ...prev, 
                  openToWork: e.target.value as OpenToWorkStatus || undefined 
                }))}
                style={styles.select}
              >
                <option value="">—</option>
                <option value="opentowork">#OpenToWork (Seeking opportunities)</option>
                <option value="hiring">#Hiring (Actively hiring)</option>
              </select>
              <p style={styles.helpText}>
                Filter by LinkedIn status hashtags
              </p>
            </div>
          </>
        )}

        {/* Search Engine */}
        <div style={styles.formGroup}>
          <label htmlFor="engine" style={styles.label}>
            Search Engine
          </label>
          <select
            id="engine"
            value={searchEngine}
            onChange={(e) => setSearchEngine(e.target.value as SearchEngine)}
            style={styles.select}
          >
            <option value="google">Google</option>
            <option value="bing">Bing</option>
            {activeSource === 'twitter' && <option value="twitter">Twitter</option>}
          </select>
        </div>

      </div>

      {/* Query Preview */}
      <QueryPreview 
        query={query} 
        searchEngine={searchEngine}
        user={user}
        onSave={handleSaveSearch}
        saving={saving}
      />

      {/* Saved Searches */}
      <SavedSearches onLoad={handleLoadSearch} />
    </div>
  );
}
