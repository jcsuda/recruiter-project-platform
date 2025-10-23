'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { RequisitionPriority, RequisitionStatus } from '@/lib/dashboard-types';

interface AddRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const styles = {
  overlay: {
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
    borderRadius: '8px',
    padding: '2rem',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  header: {
    marginBottom: '1.5rem',
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
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    padding: '0.625rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
  },
  select: {
    padding: '0.625rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.875rem',
    background: '#fff',
    fontFamily: 'inherit',
  },
  textarea: {
    padding: '0.625rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    minHeight: '100px',
    resize: 'vertical' as const,
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1.5rem',
    justifyContent: 'flex-end',
  },
  button: {
    padding: '0.625rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  cancelButton: {
    background: '#fff',
    color: '#374151',
    border: '1px solid #d1d5db',
  },
  submitButton: {
    background: '#2563eb',
    color: '#fff',
    border: 'none',
  },
};

export default function AddRequisitionModal({ isOpen, onClose, onSuccess }: AddRequisitionModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    position_title: '',
    hiring_manager: '',
    department: '',
    location: '',
    priority: 'medium' as RequisitionPriority,
    status: 'open' as RequisitionStatus,
    target_start_date: '',
    hire_date: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('requisitions').insert([
        {
          ...formData,
          user_id: user.id,
          target_start_date: formData.target_start_date || null,
          hire_date: formData.hire_date || null,
        },
      ]);

      if (error) throw error;

      // Reset form and close modal
      setFormData({
        position_title: '',
        hiring_manager: '',
        department: '',
        location: '',
        priority: 'medium',
        status: 'open',
        target_start_date: '',
        hire_date: '',
        description: '',
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error.message || 'Failed to create requisition');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Add New Requisition</h2>
          <p style={styles.subtitle}>Fill in the details for the new position</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Position Title *</label>
            <input
              type="text"
              required
              value={formData.position_title}
              onChange={(e) => setFormData({ ...formData, position_title: e.target.value })}
              style={styles.input}
              placeholder="e.g. Senior Software Engineer"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Hiring Manager</label>
            <input
              type="text"
              value={formData.hiring_manager}
              onChange={(e) => setFormData({ ...formData, hiring_manager: e.target.value })}
              style={styles.input}
              placeholder="e.g. Jane Smith"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              style={styles.input}
              placeholder="e.g. Engineering"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              style={styles.input}
              placeholder="e.g. New York, NY"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as RequisitionPriority })}
              style={styles.select}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as RequisitionStatus })}
              style={styles.select}
            >
              <option value="open">Open</option>
              <option value="interviewing">Interviewing</option>
              <option value="offer_extended">Offer Extended</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Target Start Date</label>
            <input
              type="date"
              value={formData.target_start_date}
              onChange={(e) => setFormData({ ...formData, target_start_date: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Hire Date</label>
            <input
              type="date"
              value={formData.hire_date}
              onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={styles.textarea}
              placeholder="Job description, requirements, etc."
            />
          </div>

          <div style={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              style={{ ...styles.button, ...styles.cancelButton }}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ ...styles.button, ...styles.submitButton }}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Requisition'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

