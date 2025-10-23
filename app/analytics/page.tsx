'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard';
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
};

export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);

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
        <div style={styles.loading}>Loading analytics...</div>
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
            style={{ ...styles.navButton, ...styles.activeNavButton }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#1d4ed8')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#2563eb')}
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
            style={styles.navButton}
            onMouseOver={(e) => (e.currentTarget.style.background = '#e5e7eb')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#f3f4f6')}
          >
            Advanced
          </button>
        </div>

        {/* Page Header */}
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>Advanced Analytics</h1>
          <p style={styles.subtitle}>
            Comprehensive insights into your recruiting performance, source effectiveness, 
            conversion rates, and cost optimization
          </p>
        </div>

        {/* Analytics Dashboard */}
        {user && <AnalyticsDashboard userId={user.id} />}
      </div>
    </div>
  );
}
