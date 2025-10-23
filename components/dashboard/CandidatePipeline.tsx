'use client';

import { useState } from 'react';
import { Candidate, PipelineStage } from '@/lib/dashboard-types';
import EditCandidateModal from './EditCandidateModal';
import CommunicationHistory from './CommunicationHistory';
import EmailComposer from './EmailComposer';

interface CandidatePipelineProps {
  candidates: Candidate[];
  stages: PipelineStage[];
  onRefresh: () => void;
}

const styles = {
  container: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  filters: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  select: {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.875rem',
    background: '#fff',
  },
  candidateGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '1rem',
  },
  candidateCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1.5rem',
    background: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    height: '200px',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    borderRadius: '12px',
    padding: '2rem',
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflowY: 'auto' as const,
    position: 'relative' as const,
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #e5e7eb',
  },
  modalTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '0.25rem',
    borderRadius: '4px',
  },
  modalContent: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  candidateHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
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
  stageBadge: {
    padding: '0.25rem 0.5rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '500',
    background: '#dbeafe',
    color: '#1e40af',
  },
  section: {
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    margin: '0 0 0.5rem 0',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.25rem',
    fontSize: '0.875rem',
  },
  label: {
    color: '#6b7280',
    fontWeight: '500',
  },
  value: {
    color: '#111827',
    fontWeight: '500',
  },
  rating: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  star: {
    color: '#fbbf24',
    fontSize: '0.875rem',
  },
  emptyStar: {
    color: '#d1d5db',
    fontSize: '0.875rem',
  },
  notes: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    padding: '0.5rem',
    fontSize: '0.875rem',
    color: '#374151',
    minHeight: '60px',
  },
  editButton: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
    fontWeight: '500',
    borderRadius: '4px',
    cursor: 'pointer',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    marginTop: '0.5rem',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '2rem',
    color: '#6b7280',
    fontSize: '0.875rem',
  },
};

const getStageColor = (status: string) => {
  switch (status) {
    case 'active': return { background: '#dbeafe', color: '#1e40af' };
    case 'rejected': return { background: '#fef2f2', color: '#991b1b' };
    case 'withdrawn': return { background: '#f3f4f6', color: '#374151' };
    case 'hired': return { background: '#d1fae5', color: '#065f46' };
    default: return { background: '#f3f4f6', color: '#374151' };
  }
};

const getReadinessRanking = (stageId: string, stages: PipelineStage[]) => {
  const stage = stages.find(s => s.id === stageId);
  if (!stage) return 'Unknown';
  
  const order = stage.order_index;
  if (order >= 5) return 'Ready to Hire';
  if (order >= 4) return 'Final Review';
  if (order >= 3) return 'Technical Clear';
  if (order >= 2) return 'Initial Screening';
  return 'New Application';
};

const getEngagementStatus = (lastContact?: string, responded?: boolean) => {
  if (!lastContact) return 'No contact yet';
  
  const daysSinceContact = Math.floor((Date.now() - new Date(lastContact).getTime()) / (1000 * 60 * 60 * 24));
  
  if (responded) {
    return `Responded (${daysSinceContact} days ago)`;
  } else {
    return `No response (${daysSinceContact} days ago)`;
  }
};

export default function CandidatePipeline({ candidates, stages, onRefresh }: CandidatePipelineProps) {
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [isEmailComposerOpen, setIsEmailComposerOpen] = useState(false);

  const filteredCandidates = candidates.filter(candidate => {
    if (stageFilter !== 'all' && candidate.current_stage_id !== stageFilter) return false;
    if (statusFilter !== 'all' && candidate.status !== statusFilter) return false;
    return true;
  });

  const handleCardClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCandidate(null);
  };

  const handleEditClick = (candidate: Candidate) => {
    setEditingCandidate(candidate);
    setIsEditModalOpen(true);
    setIsModalOpen(false); // Close the detail modal
  };

  const handleEditSuccess = () => {
    onRefresh(); // Refresh the candidate list
    setIsEditModalOpen(false);
    setEditingCandidate(null);
  };

  const handleEmailClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsEmailComposerOpen(true);
    setIsModalOpen(false); // Close the detail modal
  };

  const handleEmailSuccess = () => {
    onRefresh(); // Refresh the candidate list
    setIsEmailComposerOpen(false);
    setSelectedCandidate(null);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Candidate Pipeline</h2>
      </div>

      <div style={styles.filters}>
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          style={styles.select}
        >
          <option value="all">All Stages</option>
          {stages.map(stage => (
            <option key={stage.id} value={stage.id}>{stage.name}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={styles.select}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="rejected">Rejected</option>
          <option value="withdrawn">Withdrawn</option>
          <option value="hired">Hired</option>
        </select>
      </div>

      {filteredCandidates.length === 0 ? (
        <div style={styles.emptyState}>
          No candidates found matching the current filters.
        </div>
      ) : (
        <div style={styles.candidateGrid}>
          {filteredCandidates.map((candidate) => {
            const currentStage = stages.find(s => s.id === candidate.current_stage_id);
            const readinessRanking = getReadinessRanking(candidate.current_stage_id || '', stages);
            
            // Mock data for demonstration - in real app, this would come from the database
            const mockEngagement = {
              lastContact: candidate.updated_at,
              responded: Math.random() > 0.3, // 70% response rate
            };
            
            const mockTechnical = {
              codingScore: Math.floor(Math.random() * 40) + 60, // 60-100
              interviewRating: Math.floor(Math.random() * 2) + 3, // 3-5 stars
              githubScore: Math.floor(Math.random() * 30) + 70, // 70-100
            };

            const mockCultural = {
              relocationWilling: Math.random() > 0.5,
              teamSize: ['Small (2-5)', 'Medium (6-15)', 'Large (16+)'][Math.floor(Math.random() * 3)],
              workStyle: ['Remote', 'Hybrid', 'On-site'][Math.floor(Math.random() * 3)],
            };

            return (
              <div 
                key={candidate.id} 
                style={styles.candidateCard}
                onClick={() => handleCardClick(candidate)}
                onMouseOver={(e) => (e.currentTarget.style.background = '#f9fafb')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#fff')}
              >
                <h3 style={styles.candidateName}>{candidate.name}</h3>
                <p style={styles.candidateEmail}>{candidate.email}</p>
                <div style={{ marginTop: '1rem' }}>
                  <span style={{
                    ...styles.stageBadge,
                    ...getStageColor(candidate.status || 'active')
                  }}>
                    {currentStage?.name || 'Unknown Stage'}
                  </span>
                </div>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: '#6b7280', 
                  marginTop: '1rem',
                  fontStyle: 'italic'
                }}>
                  Applied for: Software Engineer
                </p>
                <p style={{ 
                  fontSize: '0.75rem', 
                  color: '#9ca3af', 
                  marginTop: '0.5rem'
                }}>
                  Click to view details
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for detailed candidate view */}
      {isModalOpen && selectedCandidate && (
        <div style={styles.modalOverlay} onClick={handleCloseModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{selectedCandidate.name}</h2>
              <button 
                style={styles.closeButton}
                onClick={handleCloseModal}
                onMouseOver={(e) => (e.currentTarget.style.background = '#f3f4f6')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
              >
                ×
              </button>
            </div>

            <div style={styles.modalContent}>
              {/* Basic Info */}
              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>Contact Information</h4>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Email:</span>
                  <span style={styles.value}>{selectedCandidate.email}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Phone:</span>
                  <span style={styles.value}>{selectedCandidate.phone || 'Not provided'}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Source:</span>
                  <span style={styles.value}>{selectedCandidate.source || 'Unknown'}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Status:</span>
                  <span style={{
                    ...styles.stageBadge,
                    ...getStageColor(selectedCandidate.status || 'active')
                  }}>
                    {selectedCandidate.status || 'active'}
                  </span>
                </div>
              </div>

              {/* Position & Pipeline */}
              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>Position & Pipeline</h4>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Applied for:</span>
                  <span style={styles.value}>Software Engineer</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Current Stage:</span>
                  <span style={styles.value}>
                    {stages.find(s => s.id === selectedCandidate.current_stage_id)?.name || 'Unknown Stage'}
                  </span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Readiness:</span>
                  <span style={styles.value}>Ready for interview</span>
                </div>
              </div>

              {/* Engagement Data */}
              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>Engagement</h4>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Last Contact:</span>
                  <span style={styles.value}>2 days ago</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Response Rate:</span>
                  <span style={styles.value}>Responded</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Next Action:</span>
                  <span style={styles.value}>Schedule technical interview</span>
                </div>
              </div>

              {/* Technical Evaluation */}
              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>Technical Assessment</h4>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Coding Score:</span>
                  <span style={styles.value}>85/100</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Interview Rating:</span>
                  <div style={styles.rating}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <span
                        key={star}
                        style={star <= 4 ? styles.star : styles.emptyStar}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.label}>GitHub Score:</span>
                  <span style={styles.value}>92/100</span>
                </div>
              </div>

              {/* Cultural Fit */}
              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>Cultural Fit</h4>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Relocation:</span>
                  <span style={styles.value}>Willing to relocate</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Team Size Preference:</span>
                  <span style={styles.value}>Medium (6-15 people)</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.label}>Work Style:</span>
                  <span style={styles.value}>Hybrid</span>
                </div>
              </div>

              {/* Notes */}
              <div style={{ ...styles.section, gridColumn: '1 / -1' }}>
                <h4 style={styles.sectionTitle}>Notes</h4>
                <div style={styles.notes}>
                  {selectedCandidate.notes || 'No notes available'}
                </div>
              </div>

              {/* Communication History */}
              <div style={{ ...styles.section, gridColumn: '1 / -1' }}>
                <CommunicationHistory 
                  candidateId={selectedCandidate.id}
                  candidateName={selectedCandidate.name}
                  onRefresh={onRefresh}
                />
              </div>
            </div>

            <div style={{ 
              marginTop: '2rem', 
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'flex-end' 
            }}>
              <button
                onClick={handleCloseModal}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  background: '#fff',
                  color: '#374151',
                  cursor: 'pointer',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#f9fafb')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#fff')}
              >
                Close
              </button>
              <button
                onClick={() => handleEmailClick(selectedCandidate)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid #10b981',
                  background: '#10b981',
                  color: '#fff',
                  cursor: 'pointer',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#059669')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#10b981')}
              >
                📧 Email
              </button>
              <button
                onClick={() => handleEditClick(selectedCandidate)}
                style={styles.editButton}
                onMouseOver={(e) => (e.currentTarget.style.background = '#1d4ed8')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#2563eb')}
              >
                Edit Candidate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Candidate Modal */}
      <EditCandidateModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingCandidate(null);
        }}
        candidate={editingCandidate}
        stages={stages}
        onSuccess={handleEditSuccess}
      />

      {/* Email Composer Modal */}
      <EmailComposer
        isOpen={isEmailComposerOpen}
        onClose={() => {
          setIsEmailComposerOpen(false);
          setSelectedCandidate(null);
        }}
        candidateId={selectedCandidate?.id || ''}
        candidateName={selectedCandidate?.name || ''}
        candidateEmail={selectedCandidate?.email || ''}
        onSuccess={handleEmailSuccess}
      />
    </div>
  );
}
