'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useToast } from '@/components/Toast';
import type { AICandidateScore } from '@/lib/ai-types';

interface AICandidateMatchingProps {
  userId: string;
  requisitionId?: string;
  onRefresh?: () => void;
}

const getScoreFill = (score: number) => {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
};

const getScoreTextClass = (score: number) => {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-600';
  return 'text-red-600';
};

const getScoreBadgeClass = (score: number) => {
  if (score >= 80) return 'bg-emerald-100 text-emerald-800';
  if (score >= 60) return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
};

const getScoreLabel = (score: number) => {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Poor';
};

export default function AICandidateMatching({ userId, requisitionId, onRefresh }: AICandidateMatchingProps) {
  const supabase = useMemo(() => createClient(), []);
  const { toast } = useToast();
  const [scores, setScores] = useState<AICandidateScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const loadAIScores = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('ai_candidate_scores')
        .select(`
          *,
          candidate:candidate_id (
            id,
            name,
            email
          ),
          requisition:requisition_id (
            id,
            title,
            department
          )
        `)
        .eq('user_id', userId)
        .order('overall_score', { ascending: false });

      if (requisitionId) {
        query = query.eq('requisition_id', requisitionId);
      }

      const { data } = await query;
      setScores((data as AICandidateScore[]) || []);
    } catch (_error: unknown) {
      void _error;
    } finally {
      setLoading(false);
    }
  }, [userId, requisitionId, supabase]);

  useEffect(() => {
    void loadAIScores();
  }, [loadAIScores]);

  const runAIMatching = async () => {
    setIsRunning(true);
    try {
      const { data: candidates } = await supabase
        .from('candidates')
        .select('id')
        .eq('user_id', userId);

      if (!candidates || candidates.length === 0) {
        toast('No candidates found to analyze', 'warning');
        return;
      }

      const { data: requisitions } = await supabase
        .from('requisitions')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'open');

      if (!requisitions || requisitions.length === 0) {
        toast('No open requisitions found for matching', 'warning');
        return;
      }

      // Build all records upfront and upsert in a single batch (avoids N+1 writes)
      const records = candidates.flatMap((candidate) =>
        requisitions.map((requisition) => ({
          user_id: userId,
          candidate_id: candidate.id,
          requisition_id: requisition.id,
          // Demo scores — replace with a real scoring model or AI API call
          overall_score: Math.floor(Math.random() * 40) + 60,
          skills_match_score: Math.floor(Math.random() * 30) + 70,
          experience_score: Math.floor(Math.random() * 25) + 75,
          cultural_fit_score: Math.floor(Math.random() * 35) + 65,
          location_score: Math.floor(Math.random() * 20) + 80,
          availability_score: Math.floor(Math.random() * 15) + 85,
          recommendations: [
            'Strong technical background matches requirements',
            'Previous experience in similar role',
            'Good cultural fit based on background',
            'Available for immediate start',
          ],
          ai_analysis: {
            analysis_date: new Date().toISOString(),
            algorithm_version: 'demo-1.0',
            confidence: null, // not a real confidence score
          },
        }))
      );

      const { error } = await supabase
        .from('ai_candidate_scores')
        .upsert(records, { onConflict: 'user_id,candidate_id,requisition_id' });

      if (error) throw error;

      await loadAIScores();
      onRefresh?.();
    } catch (_error: unknown) {
      void _error;
      toast('Failed to run demo matching', 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="py-8 text-center text-gray-500">
        Loading AI matching results...
      </div>
    );
  }

  return (
    <div className="card mb-8">
      <div className="hidden">
        <label htmlFor="ai-matching-sort" className="sr-only">
          Sort order
        </label>
        <select
          id="ai-matching-sort"
          className="select-field"
          aria-hidden
          tabIndex={-1}
          defaultValue="score"
        >
          <option value="score">Sorted by match score</option>
        </select>
      </div>
      <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <strong>Demo mode:</strong> Scores are randomly generated for UI demonstration purposes. Replace the scoring logic in <code>runAIMatching</code> with a real AI/rule-based model before use in production.
      </div>

      <div className="mb-8 flex flex-col gap-4 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="m-0 text-2xl font-semibold text-gray-900">Candidate Matching (Demo)</h2>
        <button
          type="button"
          className={isRunning ? 'btn-secondary' : 'btn-primary'}
          onClick={runAIMatching}
          disabled={isRunning}
        >
          {isRunning ? 'Running AI Analysis...' : 'Run AI Matching'}
        </button>
      </div>

      {scores.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-500">
          {isRunning
            ? 'AI analysis in progress...'
            : 'No AI matching results yet. Click "Run AI Matching" to analyze candidates.'}
        </div>
      ) : (
        scores.map((score) => (
          <div key={score.id} className="card mb-4 flex flex-col gap-4 bg-gray-50 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-200 text-lg font-medium text-gray-500">
                {getInitials(score.candidate?.name || 'U')}
              </div>
              <div className="flex min-w-0 flex-col">
                <div className="mb-1 text-base font-semibold text-gray-900">
                  {score.candidate?.name || 'Unknown Candidate'}
                </div>
                <div className="m-0 text-sm text-gray-500">{score.candidate?.email || 'No email'}</div>
                {score.requisition && (
                  <div className="mt-1 text-xs text-gray-500">Matched to: {score.requisition.title}</div>
                )}
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
              <div className="flex flex-col items-center">
                <div className={`mb-1 text-2xl font-bold ${getScoreTextClass(score.overall_score)}`}>
                  {score.overall_score}%
                </div>
                <span className={`badge mb-2 ${getScoreBadgeClass(score.overall_score)}`}>
                  {getScoreLabel(score.overall_score)}
                </span>
                <div className="w-full min-w-[12rem] max-w-xs">
                  <svg
                    viewBox="0 0 100 8"
                    className="h-2 w-full overflow-hidden rounded text-gray-200"
                    preserveAspectRatio="none"
                    aria-hidden
                  >
                    <rect x="0" y="0" width="100" height="8" fill="currentColor" className="text-gray-200" rx="2" />
                    <rect
                      x="0"
                      y="0"
                      width={score.overall_score}
                      height="8"
                      fill={getScoreFill(score.overall_score)}
                      rx="2"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="flex min-w-[60px] flex-col items-center rounded-md border border-gray-200 bg-white p-2">
                  <div className="mb-0.5 text-sm font-semibold text-gray-900">{score.skills_match_score}%</div>
                  <span className="badge bg-gray-100 text-gray-600">Skills</span>
                </div>
                <div className="flex min-w-[60px] flex-col items-center rounded-md border border-gray-200 bg-white p-2">
                  <div className="mb-0.5 text-sm font-semibold text-gray-900">{score.experience_score}%</div>
                  <span className="badge bg-gray-100 text-gray-600">Experience</span>
                </div>
                <div className="flex min-w-[60px] flex-col items-center rounded-md border border-gray-200 bg-white p-2">
                  <div className="mb-0.5 text-sm font-semibold text-gray-900">{score.cultural_fit_score}%</div>
                  <span className="badge bg-gray-100 text-gray-600">Culture</span>
                </div>
                <div className="flex min-w-[60px] flex-col items-center rounded-md border border-gray-200 bg-white p-2">
                  <div className="mb-0.5 text-sm font-semibold text-gray-900">{score.location_score}%</div>
                  <span className="badge bg-gray-100 text-gray-600">Location</span>
                </div>
              </div>
            </div>
          </div>
        ))
      )}

      {scores.length > 0 && (
        <div className="mt-4 rounded-md border border-sky-200 bg-sky-50 p-4">
          <h4 className="mb-2 mt-0 text-sm font-semibold text-sky-800">AI Recommendations</h4>
          <ul className="m-0 list-disc pl-4 text-xs text-sky-800">
            {scores[0]?.recommendations?.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
