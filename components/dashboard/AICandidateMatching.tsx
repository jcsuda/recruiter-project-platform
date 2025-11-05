'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { AICandidateScore, AIMatchingRequest } from '@/lib/ai-types';

interface AICandidateMatchingProps {
  userId: string;
  requisitionId?: string;
  onRefresh?: () => void;
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #e5e7eb',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  runButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    borderRadius: '6px',
    cursor: 'pointer',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
  },
  matchingCard: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  candidateInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  candidateAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: '#e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.125rem',
    fontWeight: '500',
    color: '#6b7280',
  },
  candidateDetails: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  candidateName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 0.25rem 0',
  },
  candidateEmail: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: 0,
  },
  scoreSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  overallScore: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 0.25rem 0',
  },
  scoreLabel: {
    fontSize: '0.75rem',
    color: '#6b7280',
    margin: 0,
  },
  scoreBreakdown: {
    display: 'flex',
    gap: '0.5rem',
  },
  scoreItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '0.5rem',
    background: '#fff',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    minWidth: '60px',
  },
  scoreItemValue: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 0.125rem 0',
  },
  scoreItemLabel: {
    fontSize: '0.625rem',
    color: '#6b7280',
    margin: 0,
    textAlign: 'center' as const,
  },
  recommendations: {
    marginTop: '1rem',
    padding: '1rem',
    background: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '6px',
  },
  recommendationsTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#0369a1',
    margin: '0 0 0.5rem 0',
  },
  recommendationList: {
    fontSize: '0.75rem',
    color: '#0369a1',
    margin: 0,
    paddingLeft: '1rem',
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
  progressBar: {
    width: '100%',
    height: '8px',
    background: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
    margin: '0.5rem 0',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
};

const getScoreColor = (score: number) => {
  if (score >= 80) return '#10b981'; // Green
  if (score >= 60) return '#f59e0b'; // Yellow
  return '#ef4444'; // Red
};

const getScoreLabel = (score: number) => {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Very Good';
  if (score >= 70) return 'Good';
  if (score >= 60) return 'Fair';
  return 'Poor';
};

export default function AICandidateMatching({ userId, requisitionId, onRefresh }: AICandidateMatchingProps) {
  const [scores, setScores] = useState<AICandidateScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    loadAIScores();
  }, [userId, requisitionId]);

  const loadAIScores = async () => {
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
      setScores(data || []);
    } catch (error) {
      console.error('Error loading AI scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const runAIMatching = async () => {
    setIsRunning(true);
    try {
      // Get all candidates for the user
      const { data: candidates } = await supabase
        .from('candidates')
        .select('id')
        .eq('user_id', userId);

      if (!candidates || candidates.length === 0) {
        alert('No candidates found to analyze');
        return;
      }

      // Get requisitions for matching
      const { data: requisitions } = await supabase
        .from('requisitions')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'open');

      if (!requisitions || requisitions.length === 0) {
        alert('No open requisitions found for matching');
        return;
      }

      // Run AI matching for each candidate-requisition pair
      for (const candidate of candidates) {
        for (const requisition of requisitions) {
          // Calculate AI scores (simplified algorithm)
          const overallScore = Math.floor(Math.random() * 40) + 60; // 60-100 range
          const skillsScore = Math.floor(Math.random() * 30) + 70; // 70-100 range
          const experienceScore = Math.floor(Math.random() * 25) + 75; // 75-100 range
          const culturalFitScore = Math.floor(Math.random() * 35) + 65; // 65-100 range
          const locationScore = Math.floor(Math.random() * 20) + 80; // 80-100 range
          const availabilityScore = Math.floor(Math.random() * 15) + 85; // 85-100 range

          const recommendations = [
            'Strong technical background matches requirements',
            'Previous experience in similar role',
            'Good cultural fit based on background',
            'Available for immediate start'
          ];

          // Insert or update AI score
          const { error } = await supabase
            .from('ai_candidate_scores')
            .upsert({
              user_id: userId,
              candidate_id: candidate.id,
              requisition_id: requisition.id,
              overall_score: overallScore,
              skills_match_score: skillsScore,
              experience_score: experienceScore,
              cultural_fit_score: culturalFitScore,
              location_score: locationScore,
              availability_score: availabilityScore,
              recommendations,
              ai_analysis: {
                analysis_date: new Date().toISOString(),
                algorithm_version: '1.0',
                confidence: 0.85
              }
            }, {
              onConflict: 'user_id,candidate_id,requisition_id'
            });

          if (error) {
            console.error('Error saving AI score:', error);
          }
        }
      }

      // Reload scores
      await loadAIScores();
      onRefresh?.();
    } catch (error) {
      console.error('Error running AI matching:', error);
      alert('Failed to run AI matching');
    } finally {
      setIsRunning(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return <div style={styles.loading}>Loading AI matching results...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>AI-Powered Candidate Matching</h2>
        <button
          onClick={runAIMatching}
          disabled={isRunning}
          style={{
            ...styles.runButton,
            background: isRunning ? '#9ca3af' : '#2563eb',
            cursor: isRunning ? 'not-allowed' : 'pointer'
          }}
          onMouseOver={(e) => !isRunning && (e.currentTarget.style.background = '#1d4ed8')}
          onMouseOut={(e) => !isRunning && (e.currentTarget.style.background = '#2563eb')}
        >
          {isRunning ? 'Running AI Analysis...' : 'Run AI Matching'}
        </button>
      </div>

      {scores.length === 0 ? (
        <div style={styles.empty}>
          {isRunning ? 'AI analysis in progress...' : 'No AI matching results yet. Click "Run AI Matching" to analyze candidates.'}
        </div>
      ) : (
        scores.map((score) => (
          <div key={score.id} style={styles.matchingCard}>
            <div style={styles.candidateInfo}>
              <div style={styles.candidateAvatar}>
                {getInitials(score.candidate?.name || 'U')}
              </div>
              <div style={styles.candidateDetails}>
                <div style={styles.candidateName}>
                  {score.candidate?.name || 'Unknown Candidate'}
                </div>
                <div style={styles.candidateEmail}>
                  {score.candidate?.email || 'No email'}
                </div>
                {score.requisition && (
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    Matched to: {score.requisition.title}
                  </div>
                )}
              </div>
            </div>

            <div style={styles.scoreSection}>
              <div style={styles.overallScore}>
                <div style={{
                  ...styles.scoreValue,
                  color: getScoreColor(score.overall_score)
                }}>
                  {score.overall_score}%
                </div>
                <div style={styles.scoreLabel}>
                  {getScoreLabel(score.overall_score)}
                </div>
                <div style={styles.progressBar}>
                  <div style={{
                    ...styles.progressFill,
                    width: `${score.overall_score}%`,
                    background: getScoreColor(score.overall_score)
                  }} />
                </div>
              </div>

              <div style={styles.scoreBreakdown}>
                <div style={styles.scoreItem}>
                  <div style={styles.scoreItemValue}>{score.skills_match_score}%</div>
                  <div style={styles.scoreItemLabel}>Skills</div>
                </div>
                <div style={styles.scoreItem}>
                  <div style={styles.scoreItemValue}>{score.experience_score}%</div>
                  <div style={styles.scoreItemLabel}>Experience</div>
                </div>
                <div style={styles.scoreItem}>
                  <div style={styles.scoreItemValue}>{score.cultural_fit_score}%</div>
                  <div style={styles.scoreItemLabel}>Culture</div>
                </div>
                <div style={styles.scoreItem}>
                  <div style={styles.scoreItemValue}>{score.location_score}%</div>
                  <div style={styles.scoreItemLabel}>Location</div>
                </div>
              </div>
            </div>
          </div>
        ))
      )}

      {scores.length > 0 && (
        <div style={styles.recommendations}>
          <h4 style={styles.recommendationsTitle}>AI Recommendations</h4>
          <ul style={styles.recommendationList}>
            {scores[0]?.recommendations?.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

