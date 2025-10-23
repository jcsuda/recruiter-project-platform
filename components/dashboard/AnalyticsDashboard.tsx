'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { AnalyticsDashboard, SourceAnalytics, FunnelData, ChartData } from '@/lib/analytics-types';

interface AnalyticsDashboardProps {
  userId: string;
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  card: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1.5rem',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 1rem 0',
  },
  metric: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem 0',
    borderBottom: '1px solid #e5e7eb',
  },
  metricLabel: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  metricValue: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#111827',
  },
  chart: {
    height: '300px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    margin: '1rem 0',
  },
  funnel: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  funnelStage: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem',
    borderRadius: '6px',
    marginBottom: '0.5rem',
  },
  funnelBar: {
    height: '20px',
    borderRadius: '4px',
    marginRight: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  funnelInfo: {
    flex: 1,
  },
  funnelLabel: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#111827',
    margin: '0 0 0.25rem 0',
  },
  funnelStats: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  sourceCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
  },
  sourceHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  sourceName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#111827',
  },
  sourceStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.5rem',
    fontSize: '0.75rem',
  },
  statItem: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  statLabel: {
    color: '#6b7280',
  },
  statValue: {
    fontWeight: '500',
    color: '#111827',
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

const getSourceColor = (source: string) => {
  const colors = {
    'LinkedIn': '#0077b5',
    'GitHub': '#333',
    'Stack Overflow': '#f48024',
    'Dribbble': '#ea4c89',
    'Indeed': '#003a70',
    'Referral': '#10b981',
    'Career Site': '#8b5cf6',
    'Other': '#6b7280',
  };
  return colors[source as keyof typeof colors] || '#6b7280';
};

export default function AnalyticsDashboard({ userId }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [userId]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Load source performance
      const { data: sourceData } = await supabase
        .from('source_analytics')
        .select('*')
        .eq('user_id', userId)
        .order('conversion_rate', { ascending: false });

      // Load conversion funnel data
      const { data: candidates } = await supabase
        .from('candidates')
        .select('current_stage_id, status, created_at')
        .eq('user_id', userId);

      const { data: stages } = await supabase
        .from('pipeline_stages')
        .select('*')
        .order('order_index');

      // Calculate funnel data
      const funnelData = calculateFunnelData(candidates || [], stages || []);

      // Load time metrics
      const { data: requisitions } = await supabase
        .from('requisitions')
        .select('created_at, hire_date, status')
        .eq('user_id', userId);

      const timeMetrics = calculateTimeMetrics(requisitions || []);

      // Load cost metrics
      const costMetrics = calculateCostMetrics(sourceData || []);

      setAnalytics({
        sourcePerformance: sourceData || [],
        conversionFunnel: funnelData,
        timeMetrics,
        costMetrics,
        trends: [], // TODO: Implement trends
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateFunnelData = (candidates: any[], stages: any[]) => {
    const stageCounts = stages.map(stage => {
      const count = candidates.filter(c => c.current_stage_id === stage.id).length;
      return {
        stage: stage.name,
        count,
        conversionRate: 0,
        dropOffRate: 0,
      };
    });

    // Calculate conversion rates
    for (let i = 0; i < stageCounts.length; i++) {
      if (i === 0) {
        stageCounts[i].conversionRate = 100;
      } else {
        const prevCount = stageCounts[i - 1].count;
        const currentCount = stageCounts[i].count;
        stageCounts[i].conversionRate = prevCount > 0 ? (currentCount / prevCount) * 100 : 0;
        stageCounts[i].dropOffRate = prevCount > 0 ? ((prevCount - currentCount) / prevCount) * 100 : 0;
      }
    }

    return stageCounts;
  };

  const calculateTimeMetrics = (requisitions: any[]) => {
    const closedRequisitions = requisitions.filter(r => r.status === 'closed' && r.hire_date);
    const timesToFill = closedRequisitions.map(r => {
      const created = new Date(r.created_at);
      const hired = new Date(r.hire_date);
      return Math.ceil((hired.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    });

    return {
      averageTimeToFill: timesToFill.length > 0 ? timesToFill.reduce((a, b) => a + b, 0) / timesToFill.length : 0,
      averageTimeToHire: 0, // TODO: Calculate from candidate data
      fastestHire: timesToFill.length > 0 ? Math.min(...timesToFill) : 0,
      slowestHire: timesToFill.length > 0 ? Math.max(...timesToFill) : 0,
    };
  };

  const calculateCostMetrics = (sources: SourceAnalytics[]) => {
    const totalCost = sources.reduce((sum, source) => sum + source.total_cost, 0);
    const totalHires = sources.reduce((sum, source) => sum + source.hires_made, 0);
    const costBySource = sources.reduce((acc, source) => {
      acc[source.source_name] = source.total_cost;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCost,
      averageCostPerHire: totalHires > 0 ? totalCost / totalHires : 0,
      costBySource,
    };
  };

  if (loading) {
    return <div style={styles.loading}>Loading analytics...</div>;
  }

  if (!analytics) {
    return <div style={styles.empty}>No analytics data available</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Advanced Analytics</h2>
        <p style={styles.subtitle}>Comprehensive insights into your recruiting performance</p>
      </div>

      {/* Key Metrics Grid */}
      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Time Metrics</h3>
          <div style={styles.metric}>
            <span style={styles.metricLabel}>Avg Time to Fill</span>
            <span style={styles.metricValue}>{Math.round(analytics.timeMetrics.averageTimeToFill)} days</span>
          </div>
          <div style={styles.metric}>
            <span style={styles.metricLabel}>Fastest Hire</span>
            <span style={styles.metricValue}>{analytics.timeMetrics.fastestHire} days</span>
          </div>
          <div style={styles.metric}>
            <span style={styles.metricLabel}>Slowest Hire</span>
            <span style={styles.metricValue}>{analytics.timeMetrics.slowestHire} days</span>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Cost Metrics</h3>
          <div style={styles.metric}>
            <span style={styles.metricLabel}>Total Cost</span>
            <span style={styles.metricValue}>${analytics.costMetrics.totalCost.toFixed(2)}</span>
          </div>
          <div style={styles.metric}>
            <span style={styles.metricLabel}>Avg Cost per Hire</span>
            <span style={styles.metricValue}>${analytics.costMetrics.averageCostPerHire.toFixed(2)}</span>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Overall Performance</h3>
          <div style={styles.metric}>
            <span style={styles.metricLabel}>Total Candidates</span>
            <span style={styles.metricValue}>
              {analytics.sourcePerformance.reduce((sum, source) => sum + source.total_candidates, 0)}
            </span>
          </div>
          <div style={styles.metric}>
            <span style={styles.metricLabel}>Total Hires</span>
            <span style={styles.metricValue}>
              {analytics.sourcePerformance.reduce((sum, source) => sum + source.hires_made, 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Source Performance */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Source Performance</h3>
        {analytics.sourcePerformance.length === 0 ? (
          <div style={styles.empty}>No source data available</div>
        ) : (
          analytics.sourcePerformance.map((source) => (
            <div key={source.id} style={styles.sourceCard}>
              <div style={styles.sourceHeader}>
                <span style={styles.sourceName}>{source.source_name}</span>
                <span style={{
                  ...styles.metricValue,
                  color: getSourceColor(source.source_name)
                }}>
                  {source.conversion_rate.toFixed(1)}% conversion
                </span>
              </div>
              <div style={styles.sourceStats}>
                <div style={styles.statItem}>
                  <span style={styles.statLabel}>Candidates</span>
                  <span style={styles.statValue}>{source.total_candidates}</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statLabel}>Hires</span>
                  <span style={styles.statValue}>{source.hires_made}</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statLabel}>Cost per Hire</span>
                  <span style={styles.statValue}>${source.cost_per_hire.toFixed(2)}</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statLabel}>Time to Hire</span>
                  <span style={styles.statValue}>{source.time_to_hire_days} days</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Conversion Funnel */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Conversion Funnel</h3>
        <div style={styles.funnel}>
          {analytics.conversionFunnel.map((stage, index) => {
            const maxCount = Math.max(...analytics.conversionFunnel.map(s => s.count));
            const widthPercent = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
            const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];
            
            return (
              <div key={stage.stage} style={styles.funnelStage}>
                <div
                  style={{
                    ...styles.funnelBar,
                    width: `${widthPercent}%`,
                    backgroundColor: colors[index % colors.length],
                    minWidth: '60px',
                  }}
                >
                  {stage.count}
                </div>
                <div style={styles.funnelInfo}>
                  <div style={styles.funnelLabel}>{stage.stage}</div>
                  <div style={styles.funnelStats}>
                    {stage.conversionRate.toFixed(1)}% conversion
                    {stage.dropOffRate > 0 && ` • ${stage.dropOffRate.toFixed(1)}% drop-off`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
