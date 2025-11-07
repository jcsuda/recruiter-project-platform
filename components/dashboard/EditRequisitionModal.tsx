'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Requisition, RequisitionPriority, RequisitionStatus } from '@/lib/dashboard-types';

interface EditRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  requisition: Requisition | null;
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
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto' as const,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  title: {
    fontSize: '1.25rem',
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
    padding: 0,
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
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.875rem',
    background: '#fff',
  },
  select: {
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.875rem',
    background: '#fff',
  },
  textarea: {
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.875rem',
    background: '#fff',
    minHeight: '80px',
    resize: 'vertical' as const,
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
  },
  button: {
    padding: '0.75rem 1.5rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    borderRadius: '6px',
    cursor: 'pointer',
    border: 'none',
    flex: 1,
  },
  cancelButton: {
    background: '#f3f4f6',
    color: '#374151',
  },
  saveButton: {
    background: '#2563eb',
    color: '#fff',
  },
};

export default function EditRequisitionModal({ isOpen, onClose, requisition, onSuccess }: EditRequisitionModalProps) {
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

  useEffect(() => {
    if (requisition) {
      setFormData({
        position_title: requisition.position_title || '',
        hiring_manager: requisition.hiring_manager || '',
        department: requisition.department || '',
        location: requisition.location || '',
        priority: requisition.priority || 'medium',
        status: requisition.status || 'open',
        target_start_date: requisition.target_start_date || '',
        hire_date: requisition.hire_date || '',
        description: requisition.description || '',
      });
    }
  }, [requisition]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requisition) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('requisitions')
        .update({
          position_title: formData.position_title,
          hiring_manager: formData.hiring_manager,
          department: formData.department,
          location: formData.location,
          priority: formData.priority,
          status: formData.status,
          target_start_date: formData.target_start_date || null,
          hire_date: formData.hire_date || null,
          description: formData.description,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requisition.id);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error.message || 'Failed to update requisition');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !requisition) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Edit Requisition</h2>
          <button onClick={onClose} style={styles.closeButton}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Position Title *</label>
            <input
              type="text"
              value={formData.position_title}
              onChange={(e) => setFormData({ ...formData, position_title: e.target.value })}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Hiring Manager</label>
            <input
              type="text"
              value={formData.hiring_manager}
              onChange={(e) => setFormData({ ...formData, hiring_manager: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Department</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              style={styles.input}
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

          <div style={styles.buttonGroup}>
            <button
              type="button"
              onClick={onClose}
              style={{ ...styles.button, ...styles.cancelButton }}
              onMouseOver={(e) => (e.currentTarget.style.background = '#e5e7eb')}
              onMouseOut={(e) => (e.currentTarget.style.background = '#f3f4f6')}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                ...styles.saveButton,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
              onMouseOver={(e) => !loading && (e.currentTarget.style.background = '#1d4ed8')}
              onMouseOut={(e) => !loading && (e.currentTarget.style.background = '#2563eb')}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


