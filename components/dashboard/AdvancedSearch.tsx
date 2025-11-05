'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { SearchTemplate, AdvancedSearchFilters } from '@/lib/ai-types';

interface AdvancedSearchProps {
  userId: string;
  onSearchResults?: (results: any[]) => void;
}

const styles = {
  container: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '2rem',
    marginBottom: '2rem',
  },
  header: {
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #e5e7eb',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 0.5rem 0',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: 0,
  },
  searchForm: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.875rem',
  },
  select: {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.875rem',
    background: '#fff',
  },
  textarea: {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.875rem',
    minHeight: '80px',
    fontFamily: 'inherit',
  },
  checkboxGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  checkboxInput: {
    margin: 0,
  },
  checkboxLabel: {
    fontSize: '0.875rem',
    color: '#374151',
    margin: 0,
  },
  rangeInput: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  rangeInputField: {
    flex: 1,
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.875rem',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '2rem',
  },
  button: {
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
  },
  searchButton: {
    background: '#2563eb',
    color: '#fff',
  },
  saveButton: {
    background: '#10b981',
    color: '#fff',
  },
  clearButton: {
    background: '#fff',
    color: '#374151',
    border: '1px solid #d1d5db',
  },
  templatesSection: {
    marginTop: '2rem',
    paddingTop: '2rem',
    borderTop: '1px solid #e5e7eb',
  },
  templatesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  templateCard: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1rem',
    cursor: 'pointer',
  },
  templateName: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 0.5rem 0',
  },
  templateDescription: {
    fontSize: '0.75rem',
    color: '#6b7280',
    margin: '0 0 0.5rem 0',
  },
  templateUsage: {
    fontSize: '0.625rem',
    color: '#9ca3af',
    margin: 0,
  },
  resultsSection: {
    marginTop: '2rem',
    paddingTop: '2rem',
    borderTop: '1px solid #e5e7eb',
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  resultsCount: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: 0,
  },
  loading: {
    textAlign: 'center' as const,
    padding: '2rem',
    color: '#6b7280',
  },
  empty: {
    textAlign: 'center' as const,
    padding: '2rem',
    color: '#6b7280',
    fontSize: '0.875rem',
  },
};

export default function AdvancedSearch({ userId, onSearchResults }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<AdvancedSearchFilters>({});
  const [templates, setTemplates] = useState<SearchTemplate[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    loadTemplates();
  }, [userId]);

  const loadTemplates = async () => {
    try {
      const { data } = await supabase
        .from('search_templates')
        .select('*')
        .eq('user_id', userId)
        .order('usage_count', { ascending: false });

      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleSearch = async () => {
    setSearching(true);
    try {
      // Build search query based on filters
      let query = supabase
        .from('candidates')
        .select('*')
        .eq('user_id', userId);

      // Apply filters
      if (filters.skills && filters.skills.length > 0) {
        // This would need a more sophisticated search implementation
        // For now, we'll do a simple text search
        query = query.or(filters.skills.map(skill => `notes.ilike.%${skill}%`).join(','));
      }

      if (filters.experience_years) {
        // This would need experience data in the candidates table
        // For now, we'll skip this filter
      }

      if (filters.location?.city) {
        query = query.ilike('notes', `%${filters.location.city}%`);
      }

      if (filters.source && filters.source.length > 0) {
        query = query.in('source', filters.source);
      }

      const { data, error } = await query;

      if (error) throw error;

      setSearchResults(data || []);
      onSearchResults?.(data || []);

      // Log search analytics
      await supabase
        .from('search_analytics')
        .insert({
          user_id: userId,
          search_query: JSON.stringify(filters),
          search_filters: filters,
          results_count: data?.length || 0,
          search_source: 'advanced_search'
        });
    } catch (error) {
      console.error('Error searching:', error);
      alert('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }

    try {
      const { error } = await supabase
        .from('search_templates')
        .insert({
          user_id: userId,
          name: templateName,
          description: 'Advanced search template',
          search_criteria: filters,
          is_public: false
        });

      if (error) throw error;

      setShowSaveTemplate(false);
      setTemplateName('');
      loadTemplates();
      alert('Template saved successfully');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template');
    }
  };

  const handleLoadTemplate = (template: SearchTemplate) => {
    setFilters(template.search_criteria);
    
    // Update usage count
    supabase
      .from('search_templates')
      .update({ usage_count: template.usage_count + 1 })
      .eq('id', template.id);
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchResults([]);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Advanced Search</h2>
        <p style={styles.subtitle}>
          Use advanced filters to find the perfect candidates with AI-powered matching
        </p>
      </div>

      <div style={styles.searchForm}>
        {/* Skills Filter */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Skills</label>
          <textarea
            style={styles.textarea}
            placeholder="Enter skills separated by commas (e.g., React, TypeScript, Node.js)"
            value={filters.skills?.join(', ') || ''}
            onChange={(e) => setFilters({
              ...filters,
              skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)
            })}
          />
        </div>

        {/* Experience Filter */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Years of Experience</label>
          <div style={styles.rangeInput}>
            <input
              type="number"
              style={styles.rangeInputField}
              placeholder="Min"
              value={filters.experience_years?.min || ''}
              onChange={(e) => setFilters({
                ...filters,
                experience_years: {
                  ...filters.experience_years,
                  min: parseInt(e.target.value) || undefined
                }
              })}
            />
            <span>-</span>
            <input
              type="number"
              style={styles.rangeInputField}
              placeholder="Max"
              value={filters.experience_years?.max || ''}
              onChange={(e) => setFilters({
                ...filters,
                experience_years: {
                  ...filters.experience_years,
                  max: parseInt(e.target.value) || undefined
                }
              })}
            />
          </div>
        </div>

        {/* Location Filter */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Location</label>
          <input
            type="text"
            style={styles.input}
            placeholder="City, State, Country"
            value={filters.location?.city || ''}
            onChange={(e) => setFilters({
              ...filters,
              location: {
                ...filters.location,
                city: e.target.value
              }
            })}
          />
          <div style={styles.checkbox}>
            <input
              type="checkbox"
              style={styles.checkboxInput}
              checked={filters.location?.remote || false}
              onChange={(e) => setFilters({
                ...filters,
                location: {
                  ...filters.location,
                  remote: e.target.checked
                }
              })}
            />
            <label style={styles.checkboxLabel}>Remote OK</label>
          </div>
        </div>

        {/* Source Filter */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Source</label>
          <div style={styles.checkboxGroup}>
            {['LinkedIn', 'GitHub', 'Stack Overflow', 'Dribbble', 'Indeed', 'Referral'].map(source => (
              <div key={source} style={styles.checkbox}>
                <input
                  type="checkbox"
                  style={styles.checkboxInput}
                  checked={filters.source?.includes(source) || false}
                  onChange={(e) => {
                    const currentSources = filters.source || [];
                    if (e.target.checked) {
                      setFilters({
                        ...filters,
                        source: [...currentSources, source]
                      });
                    } else {
                      setFilters({
                        ...filters,
                        source: currentSources.filter(s => s !== source)
                      });
                    }
                  }}
                />
                <label style={styles.checkboxLabel}>{source}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Education Filter */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Education</label>
          <select
            style={styles.select}
            value={filters.education?.degree || ''}
            onChange={(e) => setFilters({
              ...filters,
              education: {
                ...filters.education,
                degree: e.target.value
              }
            })}
          >
            <option value="">Any Degree</option>
            <option value="high_school">High School</option>
            <option value="bachelors">Bachelor's</option>
            <option value="masters">Master's</option>
            <option value="phd">PhD</option>
          </select>
        </div>

        {/* Availability Filter */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Availability</label>
          <select
            style={styles.select}
            value={filters.availability || ''}
            onChange={(e) => setFilters({
              ...filters,
              availability: e.target.value
            })}
          >
            <option value="">Any</option>
            <option value="immediate">Immediate</option>
            <option value="2_weeks">2 Weeks</option>
            <option value="1_month">1 Month</option>
            <option value="2_months">2+ Months</option>
          </select>
        </div>
      </div>

      <div style={styles.buttonGroup}>
        <button
          onClick={handleClearFilters}
          style={{ ...styles.button, ...styles.clearButton }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#f9fafb')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#fff')}
        >
          Clear Filters
        </button>
        <button
          onClick={() => setShowSaveTemplate(true)}
          style={{ ...styles.button, ...styles.saveButton }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#059669')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#10b981')}
        >
          Save Template
        </button>
        <button
          onClick={handleSearch}
          disabled={searching}
          style={{
            ...styles.button,
            ...styles.searchButton,
            background: searching ? '#9ca3af' : '#2563eb',
            cursor: searching ? 'not-allowed' : 'pointer'
          }}
          onMouseOver={(e) => !searching && (e.currentTarget.style.background = '#1d4ed8')}
          onMouseOut={(e) => !searching && (e.currentTarget.style.background = '#2563eb')}
        >
          {searching ? 'Searching...' : 'Search Candidates'}
        </button>
      </div>

      {/* Save Template Modal */}
      {showSaveTemplate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            padding: '2rem',
            borderRadius: '8px',
            minWidth: '400px'
          }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Save Search Template</h3>
            <input
              type="text"
              style={styles.input}
              placeholder="Template name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowSaveTemplate(false)}
                style={{ ...styles.button, ...styles.clearButton }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                style={{ ...styles.button, ...styles.saveButton }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Templates */}
      {templates.length > 0 && (
        <div style={styles.templatesSection}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.125rem', fontWeight: '600' }}>
            Saved Search Templates
          </h3>
          <div style={styles.templatesGrid}>
            {templates.map((template) => (
              <div
                key={template.id}
                style={styles.templateCard}
                onClick={() => handleLoadTemplate(template)}
                onMouseOver={(e) => (e.currentTarget.style.background = '#f3f4f6')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#f9fafb')}
              >
                <div style={styles.templateName}>{template.name}</div>
                <div style={styles.templateDescription}>{template.description}</div>
                <div style={styles.templateUsage}>Used {template.usage_count} times</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div style={styles.resultsSection}>
          <div style={styles.resultsHeader}>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>
              Search Results
            </h3>
            <div style={styles.resultsCount}>
              {searchResults.length} candidates found
            </div>
          </div>
          <div style={styles.templatesGrid}>
            {searchResults.map((candidate) => (
              <div key={candidate.id} style={styles.templateCard}>
                <div style={styles.templateName}>{candidate.name}</div>
                <div style={styles.templateDescription}>{candidate.email}</div>
                <div style={styles.templateUsage}>Source: {candidate.source}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

