'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase-browser';
import type { AnalyticsDashboard, SourceAnalytics } from '@/lib/analytics-types';

interface AnalyticsDashboardProps {
  userId: string;
}

interface FunnelCandidateRow {
  current_stage_id: string | null;
}

interface FunnelStageRow {
  id: string;
  name: string;
}

interface RequisitionTimeRow {
  created_at: string;
  hire_date: string | null;
  status: string;
}

const SOURCE_BADGE_CLASS: Record<string, string> = {
  LinkedIn: 'badge bg-[#0077b5] text-white',
  GitHub: 'badge bg-[#333333] text-white',
  'Stack Overflow': 'badge bg-[#f48024] text-white',
  Dribbble: 'badge bg-[#ea4c89] text-white',
  Indeed: 'badge bg-[#003a70] text-white',
  Referral: 'badge bg-emerald-500 text-white',
  'Career Site': 'badge bg-violet-500 text-white',
  Other: 'badge bg-gray-500 text-white',
};

const FUNNEL_FILLS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'] as const;

function getSourceBadgeClass(source: string): string {
  return SOURCE_BADGE_CLASS[source] ?? SOURCE_BADGE_CLASS.Other;
}

function calculateFunnelData(
  candidates: FunnelCandidateRow[],
  stages: FunnelStageRow[]
): AnalyticsDashboard['conversionFunnel'] {
  const stageCounts = stages.map((stage) => {
    const count = candidates.filter((c) => c.current_stage_id === stage.id).length;
    return {
      stage: stage.name,
      count,
      conversionRate: 0,
      dropOffRate: 0,
    };
  });

  for (let i = 0; i < stageCounts.length; i++) {
    if (i === 0) {
      stageCounts[i].conversionRate = 100;
    } else {
      const prevCount = stageCounts[i - 1].count;
      const currentCount = stageCounts[i].count;
      stageCounts[i].conversionRate =
        prevCount > 0 ? (currentCount / prevCount) * 100 : 0;
      stageCounts[i].dropOffRate =
        prevCount > 0 ? ((prevCount - currentCount) / prevCount) * 100 : 0;
    }
  }

  return stageCounts;
}

function calculateTimeMetrics(requisitions: RequisitionTimeRow[]): AnalyticsDashboard['timeMetrics'] {
  const closedRequisitions = requisitions.filter((r) => r.status === 'closed' && r.hire_date);
  const timesToFill = closedRequisitions.map((r) => {
    const created = new Date(r.created_at);
    const hired = new Date(r.hire_date as string);
    return Math.ceil((hired.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  });

  return {
    averageTimeToFill:
      timesToFill.length > 0 ? timesToFill.reduce((a, b) => a + b, 0) / timesToFill.length : 0,
    averageTimeToHire: 0,
    fastestHire: timesToFill.length > 0 ? Math.min(...timesToFill) : 0,
    slowestHire: timesToFill.length > 0 ? Math.max(...timesToFill) : 0,
  };
}

function calculateCostMetrics(sources: SourceAnalytics[]): AnalyticsDashboard['costMetrics'] {
  const totalCost = sources.reduce((sum, source) => sum + source.total_cost, 0);
  const totalHires = sources.reduce((sum, source) => sum + source.hires_made, 0);
  const costBySource = sources.reduce(
    (acc, source) => {
      acc[source.source_name] = source.total_cost;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    totalCost,
    averageCostPerHire: totalHires > 0 ? totalCost / totalHires : 0,
    costBySource,
  };
}

export default function AnalyticsDashboard({ userId }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      const supabase = createClient();
      try {
        const { data: sourceData } = await supabase
          .from('source_analytics')
          .select('*')
          .eq('user_id', userId)
          .order('conversion_rate', { ascending: false });

        const { data: candidates } = await supabase
          .from('candidates')
          .select('current_stage_id, status, created_at')
          .eq('user_id', userId);

        const { data: stages } = await supabase
          .from('pipeline_stages')
          .select('*')
          .order('order_index');

        const funnelData = calculateFunnelData(
          (candidates ?? []) as FunnelCandidateRow[],
          (stages ?? []) as FunnelStageRow[]
        );

        const { data: requisitions } = await supabase
          .from('requisitions')
          .select('created_at, hire_date, status')
          .eq('user_id', userId);

        const timeMetrics = calculateTimeMetrics((requisitions ?? []) as RequisitionTimeRow[]);
        const costMetrics = calculateCostMetrics((sourceData ?? []) as SourceAnalytics[]);

        setAnalytics({
          sourcePerformance: (sourceData ?? []) as SourceAnalytics[],
          conversionFunnel: funnelData,
          timeMetrics,
          costMetrics,
          trends: [],
        });
      } catch (error: unknown) {
        void error;
      } finally {
        setLoading(false);
      }
    }

    void loadAnalytics();
  }, [userId]);

  if (loading) {
    return (
      <div className="py-8 text-center text-sm text-gray-500">Loading analytics...</div>
    );
  }

  if (!analytics) {
    return (
      <div className="py-8 text-center text-sm text-gray-500">
        No analytics data available
      </div>
    );
  }

  const maxFunnelCount = Math.max(...analytics.conversionFunnel.map((s) => s.count), 0);

  return (
    <div className="mb-8 rounded-xl border border-gray-200 bg-white p-8">
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h2 className="mb-2 text-2xl font-semibold text-gray-900">Advanced Analytics</h2>
        <p className="m-0 text-sm text-gray-500">
          Comprehensive insights into your recruiting performance
        </p>
      </div>

      <div className="mb-8 grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
        <div className="card bg-gray-50">
          <h3 className="mb-4 mt-0 text-base font-semibold text-gray-900">Time Metrics</h3>
          <div className="divide-y divide-gray-200">
            <div className="flex items-center justify-between py-2 first:pt-0">
              <span className="text-sm text-gray-500">Avg Time to Fill</span>
              <span className="text-base font-semibold text-gray-900">
                {Math.round(analytics.timeMetrics.averageTimeToFill)} days
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500">Fastest Hire</span>
              <span className="text-base font-semibold text-gray-900">
                {analytics.timeMetrics.fastestHire} days
              </span>
            </div>
            <div className="flex items-center justify-between py-2 last:pb-0">
              <span className="text-sm text-gray-500">Slowest Hire</span>
              <span className="text-base font-semibold text-gray-900">
                {analytics.timeMetrics.slowestHire} days
              </span>
            </div>
          </div>
        </div>

        <div className="card bg-gray-50">
          <h3 className="mb-4 mt-0 text-base font-semibold text-gray-900">Cost Metrics</h3>
          <div className="flex items-center justify-between border-b border-gray-200 py-2">
            <span className="text-sm text-gray-500">Total Cost</span>
            <span className="text-base font-semibold text-gray-900">
              ${analytics.costMetrics.totalCost.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-500">Avg Cost per Hire</span>
            <span className="text-base font-semibold text-gray-900">
              ${analytics.costMetrics.averageCostPerHire.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="card bg-gray-50">
          <h3 className="mb-4 mt-0 text-base font-semibold text-gray-900">Overall Performance</h3>
          <div className="flex items-center justify-between border-b border-gray-200 py-2">
            <span className="text-sm text-gray-500">Total Candidates</span>
            <span className="text-base font-semibold text-gray-900">
              {analytics.sourcePerformance.reduce((sum, source) => sum + source.total_candidates, 0)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-500">Total Hires</span>
            <span className="text-base font-semibold text-gray-900">
              {analytics.sourcePerformance.reduce((sum, source) => sum + source.hires_made, 0)}
            </span>
          </div>
        </div>
      </div>

      <div className="card mb-8 bg-gray-50">
        <h3 className="mb-4 mt-0 text-base font-semibold text-gray-900">Source Performance</h3>
        {analytics.sourcePerformance.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">No source data available</div>
        ) : (
          analytics.sourcePerformance.map((source) => (
            <div
              key={source.id}
              className="card mb-4 bg-white p-4 last:mb-0"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-base font-semibold text-gray-900">{source.source_name}</span>
                <span className={getSourceBadgeClass(source.source_name)}>
                  {source.conversion_rate.toFixed(1)}% conversion
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Candidates</span>
                  <span className="font-medium text-gray-900">{source.total_candidates}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Hires</span>
                  <span className="font-medium text-gray-900">{source.hires_made}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cost per Hire</span>
                  <span className="font-medium text-gray-900">${source.cost_per_hire.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time to Hire</span>
                  <span className="font-medium text-gray-900">{source.time_to_hire_days} days</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card bg-gray-50">
        <h3 className="mb-4 mt-0 text-base font-semibold text-gray-900">Conversion Funnel</h3>
        <div className="flex flex-col gap-2">
          {analytics.conversionFunnel.map((stage, index) => {
            const widthPercent =
              maxFunnelCount > 0 ? (stage.count / maxFunnelCount) * 100 : 0;
            const barWidth = Math.max(widthPercent, 5);
            const fill = FUNNEL_FILLS[index % FUNNEL_FILLS.length];

            return (
              <div
                key={stage.stage}
                className="mb-2 flex items-center gap-4 rounded-md py-3 last:mb-0"
              >
                <div className="relative h-5 w-32 shrink-0 sm:w-48">
                  <svg
                    className="h-full w-full"
                    viewBox="0 0 100 20"
                    preserveAspectRatio="none"
                    aria-hidden
                  >
                    <rect
                      x="0"
                      y="0"
                      width={barWidth}
                      height="20"
                      rx="4"
                      fill={fill}
                    />
                  </svg>
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs font-medium text-white drop-shadow-sm">
                    {stage.count}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 text-sm font-medium text-gray-900">{stage.stage}</div>
                  <div className="text-xs text-gray-500">
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
