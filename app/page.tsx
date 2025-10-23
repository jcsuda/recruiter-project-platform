'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';

const styles = {
  main: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  hero: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem 1.5rem',
  },
  heroContent: {
    maxWidth: '800px',
    textAlign: 'center' as const,
    color: '#fff',
  },
  heroTitle: {
    fontSize: '3rem',
    fontWeight: 'bold',
    margin: '0 0 1rem 0',
    lineHeight: 1.2,
  },
  heroSubtitle: {
    fontSize: '1.25rem',
    margin: '0 0 2rem 0',
    opacity: 0.95,
    lineHeight: 1.6,
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.5rem',
    marginTop: '3rem',
  },
  featureCard: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    padding: '1.5rem',
    textAlign: 'center' as const,
  },
  featureIcon: {
    fontSize: '2.5rem',
    marginBottom: '0.75rem',
  },
  featureTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    margin: '0 0 0.5rem 0',
  },
  featureDesc: {
    fontSize: '0.875rem',
    opacity: 0.9,
    margin: 0,
    lineHeight: 1.5,
  },
  footer: {
    textAlign: 'center' as const,
    padding: '2rem 1.5rem',
    color: '#fff',
    opacity: 0.8,
  },
  footerText: {
    fontSize: '0.75rem',
    margin: 0,
  },
};

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // User is signed in, redirect to dashboard
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error checking user:', error);
    }
  };

  return (
    <div style={styles.main}>
      <Header />
      
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>
            Recruiting Platform
          </h1>
          <p style={styles.heroSubtitle}>
            Build powerful Boolean search queries and manage your entire recruiting pipeline in one place
          </p>

          <div style={styles.featureGrid}>
            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>🔍</div>
              <h3 style={styles.featureTitle}>Boolean Search Builder</h3>
              <p style={styles.featureDesc}>
                Generate precise search queries for LinkedIn, GitHub, Stack Overflow, and more
              </p>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>📊</div>
              <h3 style={styles.featureTitle}>Dashboard & Analytics</h3>
              <p style={styles.featureDesc}>
                Track KPIs, recruiting funnel, and candidate pipeline metrics
              </p>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureIcon}>📋</div>
              <h3 style={styles.featureTitle}>Requisition Management</h3>
              <p style={styles.featureDesc}>
                Manage job openings, hiring managers, and track progress
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          Built for recruiters and talent sourcers • Fully compliant with platform Terms of Service
        </p>
      </div>
    </div>
  );
}
