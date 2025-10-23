'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AICandidateMatching from '@/components/dashboard/AICandidateMatching';
import AdvancedSearch from '@/components/dashboard/AdvancedSearch';
import Header from '@/components/Header';

const styles = {
  main: {
    minHeight: '100vh',
    background: '#f5f5f5',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
  },
  header: {
    marginBottom: '2rem',
  },
  pageTitle: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0 0 0.5rem 0',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: 0,
  },
  loading: {
    textAlign: 'center' as const,
    padding: '4rem',
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  navigation: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    padding: '1rem',
    background: '#fff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  navButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    borderRadius: '6px',
    cursor: 'pointer',
    background: '#f3f4f6',
    color: '#374151',
    border: 'none',
    textDecoration: 'none',
  },
  activeNavButton: {
    background: '#2563eb',
    color: '#fff',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem',
  },
  featureCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '2rem',
    textAlign: 'center' as const,
  },
  featureIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  featureTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 0.5rem 0',
  },
  featureDescription: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: '0 0 1rem 0',
  },
  featureStatus: {
    fontSize: '0.75rem',
    fontWeight: '500',
    padding: '0.25rem 0.5rem',
    borderRadius: '12px',
    textTransform: 'uppercase' as const,
  },
  statusAvailable: {
    background: '#dcfce7',
    color: '#166534',
  },
  statusComingSoon: {
    background: '#fef3c7',
    color: '#92400e',
  },
  statusInDevelopment: {
    background: '#dbeafe',
    color: '#1e40af',
  },
};

export default function AdvancedPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }
      setUser(user);
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.main}>
        <Header />
        <div style={styles.loading}>Loading advanced features...</div>
      </div>
    );
  }

  return (
    <div style={styles.main}>
      <Header />
      
      <div style={styles.container}>
        {/* Navigation */}
        <div style={styles.navigation}>
          <button
            onClick={() => router.push('/dashboard')}
            style={styles.navButton}
            onMouseOver={(e) => (e.currentTarget.style.background = '#e5e7eb')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#f3f4f6')}
          >
            Dashboard
          </button>
          <button
            onClick={() => router.push('/candidates')}
            style={styles.navButton}
            onMouseOver={(e) => (e.currentTarget.style.background = '#e5e7eb')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#f3f4f6')}
          >
            Candidates
          </button>
          <button
            onClick={() => router.push('/analytics')}
            style={styles.navButton}
            onMouseOver={(e) => (e.currentTarget.style.background = '#e5e7eb')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#f3f4f6')}
          >
            Analytics
          </button>
          <button
            onClick={() => router.push('/team')}
            style={styles.navButton}
            onMouseOver={(e) => (e.currentTarget.style.background = '#e5e7eb')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#f3f4f6')}
          >
            Team
          </button>
          <button
            onClick={() => router.push('/search')}
            style={styles.navButton}
            onMouseOver={(e) => (e.currentTarget.style.background = '#e5e7eb')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#f3f4f6')}
          >
            Search Builder
          </button>
          <button
            onClick={() => router.push('/advanced')}
            style={{ ...styles.navButton, ...styles.activeNavButton }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#1d4ed8')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#2563eb')}
          >
            Advanced
          </button>
        </div>

        {/* Page Header */}
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>Advanced Features</h1>
          <p style={styles.subtitle}>
            AI-powered matching, advanced search capabilities, and cutting-edge recruiting tools
          </p>
        </div>

        {/* Features Overview */}
        <div style={styles.featuresGrid}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🤖</div>
            <h3 style={styles.featureTitle}>AI Candidate Matching</h3>
            <p style={styles.featureDescription}>
              Intelligent candidate scoring and ranking based on skills, experience, and cultural fit
            </p>
            <div style={{ ...styles.featureStatus, ...styles.statusAvailable }}>
              Available
            </div>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🔍</div>
            <h3 style={styles.featureTitle}>Advanced Search</h3>
            <p style={styles.featureDescription}>
              Multi-criteria search with saved templates and intelligent filtering
            </p>
            <div style={{ ...styles.featureStatus, ...styles.statusAvailable }}>
              Available
            </div>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>📝</div>
            <h3 style={styles.featureTitle}>Custom Fields</h3>
            <p style={styles.featureDescription}>
              Create custom candidate fields and dynamic forms for your specific needs
            </p>
            <div style={{ ...styles.featureStatus, ...styles.statusComingSoon }}>
              Coming Soon
            </div>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🔗</div>
            <h3 style={styles.featureTitle}>Integrations</h3>
            <p style={styles.featureDescription}>
              Connect with ATS systems, job boards, and other recruiting tools
            </p>
            <div style={{ ...styles.featureStatus, ...styles.statusInDevelopment }}>
              In Development
            </div>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>📱</div>
            <h3 style={styles.featureTitle}>Mobile Optimization</h3>
            <p style={styles.featureDescription}>
              Fully responsive design with mobile-specific features and touch optimization
            </p>
            <div style={{ ...styles.featureStatus, ...styles.statusAvailable }}>
              Available
            </div>
          </div>

          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>💡</div>
            <h3 style={styles.featureTitle}>AI Insights</h3>
            <p style={styles.featureDescription}>
              Get AI-powered recommendations and insights to optimize your recruiting process
            </p>
            <div style={{ ...styles.featureStatus, ...styles.statusComingSoon }}>
              Coming Soon
            </div>
          </div>
        </div>

        {/* AI Candidate Matching */}
        {user && (
          <AICandidateMatching
            userId={user.id}
            onRefresh={() => {}}
          />
        )}

        {/* Advanced Search */}
        {user && (
          <AdvancedSearch
            userId={user.id}
            onSearchResults={(results) => {
              console.log('Search results:', results);
            }}
          />
        )}
      </div>
    </div>
  );
}
