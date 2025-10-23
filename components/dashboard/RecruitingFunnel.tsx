'use client';

import { FunnelData } from '@/lib/dashboard-types';

interface RecruitingFunnelProps {
  data: FunnelData[];
  rejectedCount?: number;
  withdrawnCount?: number;
}

const styles = {
  container: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '1.5rem',
  },
  funnelContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  stage: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  stageLabel: {
    minWidth: '180px',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
  },
  barContainer: {
    flex: 1,
    background: '#f3f4f6',
    borderRadius: '4px',
    height: '40px',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    background: 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '0.75rem',
    color: '#fff',
    fontSize: '0.875rem',
    fontWeight: '600',
    transition: 'width 0.3s ease',
  },
  stats: {
    minWidth: '100px',
    textAlign: 'right' as const,
    fontSize: '0.875rem',
  },
  count: {
    fontWeight: '600',
    color: '#111827',
  },
  conversion: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },
};

export default function RecruitingFunnel({ data, rejectedCount, withdrawnCount }: RecruitingFunnelProps) {
  // Soft, eye-friendly color palette that progresses through the funnel
  const stageColors = [
    'linear-gradient(90deg, #93c5fd 0%, #60a5fa 100%)', // Light Blue - Applications
    'linear-gradient(90deg, #a78bfa 0%, #8b5cf6 100%)', // Soft Purple - Phone Screens
    'linear-gradient(90deg, #f9a8d4 0%, #ec4899 100%)', // Soft Pink - Technical
    'linear-gradient(90deg, #fdba74 0%, #fb923c 100%)', // Soft Orange - Onsite
    'linear-gradient(90deg, #fcd34d 0%, #fbbf24 100%)', // Soft Yellow - Offers
    'linear-gradient(90deg, #86efac 0%, #4ade80 100%)', // Soft Green - Hires
  ];

  // Colors for rejected/withdrawn
  const rejectedColor = 'linear-gradient(90deg, #fca5a5 0%, #ef4444 100%)'; // Soft Red
  const withdrawnColor = 'linear-gradient(90deg, #d1d5db 0%, #9ca3af 100%)'; // Soft Gray

  if (data.length === 0 && !rejectedCount && !withdrawnCount) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Recruiting Funnel</h3>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280', fontSize: '0.875rem' }}>
          No candidate data available yet.
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count), rejectedCount || 0, withdrawnCount || 0);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Recruiting Funnel</h3>
      <div style={styles.funnelContainer}>
        {/* Active Pipeline Stages */}
        {data.map((stage, index) => {
          const widthPercent = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
          const barColor = stageColors[index % stageColors.length];
          
          return (
            <div key={stage.stage} style={styles.stage}>
              <div style={styles.stageLabel}>{stage.stage}</div>
              <div style={styles.barContainer}>
                <div style={{ 
                  ...styles.bar, 
                  width: `${widthPercent}%`,
                  background: barColor,
                }}>
                  {stage.count > 0 && stage.count}
                </div>
              </div>
              <div style={styles.stats}>
                <div style={styles.count}>{stage.count}</div>
                {stage.conversionRate !== undefined && (
                  <div style={styles.conversion}>
                    {stage.conversionRate.toFixed(1)}% conversion
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Divider for Exit States */}
        {data.length > 0 && (
          <div style={{ margin: '0.75rem 0', borderTop: '2px dashed #e5e7eb', paddingTop: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem', textAlign: 'center' }}>
              Exit States
            </div>
          </div>
        )}

        {/* Rejected Candidates - Always show */}
        <div style={styles.stage}>
          <div style={styles.stageLabel}>Rejected</div>
          <div style={styles.barContainer}>
            <div style={{ 
              ...styles.bar, 
              width: `${maxCount > 0 ? ((rejectedCount || 0) / maxCount) * 100 : 0}%`,
              background: rejectedColor,
            }}>
              {(rejectedCount || 0) > 0 && (rejectedCount || 0)}
            </div>
          </div>
          <div style={styles.stats}>
            <div style={styles.count}>{rejectedCount || 0}</div>
            <div style={styles.conversion}>Did not meet criteria</div>
          </div>
        </div>

        {/* Withdrawn Candidates - Always show */}
        <div style={styles.stage}>
          <div style={styles.stageLabel}>Withdrawn</div>
          <div style={styles.barContainer}>
            <div style={{ 
              ...styles.bar, 
              width: `${maxCount > 0 ? ((withdrawnCount || 0) / maxCount) * 100 : 0}%`,
              background: withdrawnColor,
            }}>
              {(withdrawnCount || 0) > 0 && (withdrawnCount || 0)}
            </div>
          </div>
          <div style={styles.stats}>
            <div style={styles.count}>{withdrawnCount || 0}</div>
            <div style={styles.conversion}>Withdrew from process</div>
          </div>
        </div>
      </div>
    </div>
  );
}

