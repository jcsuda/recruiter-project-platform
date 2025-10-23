'use client';

import { BooleanQuery, SearchEngine } from '@/lib/types';

interface QueryPreviewProps {
  query: BooleanQuery;
  searchEngine: SearchEngine;
  user?: any;
  onSave?: () => void;
  saving?: boolean;
}

const styles = {
  container: {
    background: '#fff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    padding: '1.5rem',
    textAlign: 'center' as const,
  },
  emptyState: {
    background: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    padding: '1.5rem',
    textAlign: 'center' as const,
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    alignItems: 'center',
  },
  primaryButton: {
    padding: '0.75rem 2rem',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  saveButton: {
    padding: '0.5rem 1.5rem',
    background: '#10b981',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
};

export default function QueryPreview({ query, searchEngine, user, onSave, saving }: QueryPreviewProps) {
  const handleOpenInSearch = () => {
    if (query.url) {
      window.open(query.url, '_blank', 'noopener,noreferrer');
    }
  };

  const getSearchEngineName = () => {
    switch (searchEngine) {
      case 'google':
        return 'Google';
      case 'bing':
        return 'Bing';
      case 'twitter':
        return 'Twitter';
      default:
        return 'Search';
    }
  };

  if (!query.raw) {
    return (
      <div style={styles.emptyState}>
        Fill in the form above to search
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.buttonContainer}>
        <button
          onClick={handleOpenInSearch}
          style={styles.primaryButton}
          onMouseOver={(e) => (e.currentTarget.style.background = '#1d4ed8')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#2563eb')}
        >
          Open in {getSearchEngineName()}
        </button>

        {user && onSave && (
          <button
            onClick={onSave}
            disabled={saving}
            style={{
              ...styles.saveButton,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
            }}
            onMouseOver={(e) => !saving && (e.currentTarget.style.background = '#059669')}
            onMouseOut={(e) => !saving && (e.currentTarget.style.background = '#10b981')}
          >
            {saving ? 'Saving...' : 'Save Search'}
          </button>
        )}
      </div>
    </div>
  );
}
