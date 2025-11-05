'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { CandidateAssignment, AssignmentFormData, TeamMember } from '@/lib/team-types';

interface CandidateAssignmentProps {
  candidateId: string;
  candidateName: string;
  onRefresh?: () => void;
}

const styles = {
  container: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1rem',
    marginTop: '1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  addButton: {
    padding: '0.25rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: '500',
    borderRadius: '4px',
    cursor: 'pointer',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
  },
  assignmentCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '0.75rem',
    marginBottom: '0.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assignmentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  assignmentDetails: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  assigneeName: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#111827',
    margin: '0 0 0.25rem 0',
  },
  assignmentType: {
    fontSize: '0.75rem',
    color: '#6b7280',
    margin: 0,
  },
  typeBadge: {
    padding: '0.125rem 0.5rem',
    fontSize: '0.75rem',
    fontWeight: '500',
    borderRadius: '12px',
    textTransform: 'uppercase' as const,
  },
  form: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '1rem',
    marginTop: '0.5rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
  },
  select: {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.875rem',
    background: '#fff',
  },
  textarea: {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.875rem',
    minHeight: '60px',
    fontFamily: 'inherit',
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'flex-end',
  },
  button: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
  },
  cancelButton: {
    background: '#fff',
    color: '#374151',
    border: '1px solid #d1d5db',
  },
  submitButton: {
    background: '#2563eb',
    color: '#fff',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '1rem',
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  empty: {
    textAlign: 'center' as const,
    padding: '1rem',
    color: '#6b7280',
    fontSize: '0.875rem',
  },
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'primary': return { background: '#dbeafe', color: '#1e40af' };
    case 'secondary': return { background: '#f3e8ff', color: '#7c3aed' };
    case 'reviewer': return { background: '#fef3c7', color: '#92400e' };
    case 'interviewer': return { background: '#dcfce7', color: '#166534' };
    default: return { background: '#f3f4f6', color: '#374151' };
  }
};

export default function CandidateAssignment({ candidateId, candidateName, onRefresh }: CandidateAssignmentProps) {
  const [assignments, setAssignments] = useState<CandidateAssignment[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<AssignmentFormData>({
    candidate_id: candidateId,
    assigned_to: '',
    assignment_type: 'primary',
    notes: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [candidateId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load assignments for this candidate
      const { data: assignmentData } = await supabase
        .from('candidate_assignments')
        .select(`
          *,
          assigned_to_user:assigned_to (
            id,
            email,
            raw_user_meta_data
          ),
          assigned_by_user:assigned_by (
            id,
            email,
            raw_user_meta_data
          )
        `)
        .eq('candidate_id', candidateId);

      setAssignments(assignmentData || []);

      // Load team members for assignment dropdown
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: teamData } = await supabase
          .from('teams')
          .select('id')
          .eq('owner_id', user.id)
          .single();

        if (teamData) {
          const { data: membersData } = await supabase
            .from('team_members')
            .select(`
              *,
              user:user_id (
                id,
                email,
                raw_user_meta_data
              )
            `)
            .eq('team_id', teamData.id)
            .eq('status', 'active');

          setTeamMembers(membersData || []);
        }
      }
    } catch (error) {
      console.error('Error loading assignment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('candidate_assignments')
        .insert({
          ...formData,
          assigned_by: user.id,
        });

      if (error) throw error;

      setShowForm(false);
      setFormData({
        candidate_id: candidateId,
        assigned_to: '',
        assignment_type: 'primary',
        notes: '',
      });
      loadData();
      onRefresh?.();
    } catch (error) {
      console.error('Error creating assignment:', error);
      alert('Failed to create assignment');
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
    return <div style={styles.loading}>Loading assignments...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h4 style={styles.title}>Team Assignments</h4>
        <button
          onClick={() => setShowForm(!showForm)}
          style={styles.addButton}
          onMouseOver={(e) => (e.currentTarget.style.background = '#1d4ed8')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#2563eb')}
        >
          + Assign
        </button>
      </div>

      {/* Current Assignments */}
      {assignments.length === 0 ? (
        <div style={styles.empty}>No assignments yet</div>
      ) : (
        assignments.map((assignment) => (
          <div key={assignment.id} style={styles.assignmentCard}>
            <div style={styles.assignmentInfo}>
              <div style={styles.assignmentDetails}>
                <div style={styles.assigneeName}>
                  {assignment.assigned_to_user?.raw_user_meta_data?.full_name || assignment.assigned_to_user?.email}
                </div>
                <div style={styles.assignmentType}>
                  Assigned by {assignment.assigned_by_user?.raw_user_meta_data?.full_name || assignment.assigned_by_user?.email}
                </div>
                {assignment.notes && (
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    {assignment.notes}
                  </div>
                )}
              </div>
            </div>
            <span style={{
              ...styles.typeBadge,
              ...getTypeColor(assignment.assignment_type)
            }}>
              {assignment.assignment_type}
            </span>
          </div>
        ))
      )}

      {/* Assignment Form */}
      {showForm && (
        <div style={styles.form}>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Assign To</label>
              <select
                style={styles.select}
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                required
              >
                <option value="">Select team member...</option>
                {teamMembers.map((member) => (
                  <option key={member.user_id} value={member.user_id}>
                    {member.user?.raw_user_meta_data?.full_name || member.user?.email}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Assignment Type</label>
              <select
                style={styles.select}
                value={formData.assignment_type}
                onChange={(e) => setFormData({ ...formData, assignment_type: e.target.value as any })}
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="reviewer">Reviewer</option>
                <option value="interviewer">Interviewer</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Notes (Optional)</label>
              <textarea
                style={styles.textarea}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any notes about this assignment..."
              />
            </div>

            <div style={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{ ...styles.button, ...styles.cancelButton }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#f9fafb')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#fff')}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ ...styles.button, ...styles.submitButton }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#1d4ed8')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#2563eb')}
              >
                Assign
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

