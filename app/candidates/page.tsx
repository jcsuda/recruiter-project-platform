'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Candidate, PipelineStage } from '@/lib/dashboard-types';
import CandidatePipeline from '@/components/dashboard/CandidatePipeline';
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

export default function CandidatesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadCandidatesData();
    }
  }, [user]);

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

  const loadCandidatesData = async () => {
    try {
      // Load candidates
      const { data: candData } = await supabase
        .from('candidates')
        .select('*');

      setCandidates(candData || []);

      // Load pipeline stages
      const { data: stageData } = await supabase
        .from('pipeline_stages')
        .select('*')
        .order('order_index');

      setStages(stageData || []);
    } catch (error) {
      console.error('Error loading candidates data:', error);
    }
  };


  if (loading) {
    return (
      <div style={styles.main}>
        <Header />
        <div style={styles.loading}>Loading candidates...</div>
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
            style={{ ...styles.navButton, ...styles.activeNavButton }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#1d4ed8')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#2563eb')}
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
            style={styles.navButton}
            onMouseOver={(e) => (e.currentTarget.style.background = '#e5e7eb')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#f3f4f6')}
          >
            Advanced
          </button>
        </div>

        {/* Page Header */}
        <div style={styles.header}>
          <h1 style={styles.pageTitle}>Candidate Pipeline</h1>
          <p style={styles.subtitle}>
            Detailed view of all candidates in your hiring pipeline with engagement tracking, 
            technical assessments, and cultural fit insights
          </p>
        </div>

        {/* Candidate Pipeline Component */}
        <CandidatePipeline 
          candidates={candidates} 
          stages={stages}
          onRefresh={loadCandidatesData}
        />
      </div>
    </div>
  );
}
