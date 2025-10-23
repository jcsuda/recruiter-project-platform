'use client';

import { useState } from 'react';
import { Requisition, RequisitionStatus, RequisitionPriority } from '@/lib/dashboard-types';

interface RequisitionListProps {
  requisitions: Requisition[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
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
    marginBottom: '1rem',
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
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  th: {
    textAlign: 'left' as const,
    padding: '0.75rem',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
  },
  td: {
    padding: '0.75rem',
    borderBottom: '1px solid #f3f4f6',
    fontSize: '0.875rem',
    color: '#111827',
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '500',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '2rem',
    color: '#6b7280',
    fontSize: '0.875rem',
  },
};

const getPriorityColor = (priority?: RequisitionPriority) => {
  switch (priority) {
    case 'urgent': return { background: '#fef2f2', color: '#991b1b' };
    case 'high': return { background: '#fef3c7', color: '#92400e' };
    case 'medium': return { background: '#dbeafe', color: '#1e40af' };
    case 'low': return { background: '#f3f4f6', color: '#374151' };
    default: return { background: '#f3f4f6', color: '#374151' };
  }
};

const getStatusColor = (status: RequisitionStatus) => {
  switch (status) {
    case 'open': return { background: '#dbeafe', color: '#1e40af' };
    case 'interviewing': return { background: '#fef3c7', color: '#92400e' };
    case 'offer_extended': return { background: '#d1fae5', color: '#065f46' };
    case 'closed': return { background: '#f3f4f6', color: '#374151' };
  }
};

export default function RequisitionList({ requisitions, onEdit, onDelete }: RequisitionListProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredRequisitions = requisitions.filter(req => {
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && req.priority !== priorityFilter) return false;
    return true;
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Requisitions</h2>
      </div>

      <div style={styles.filters}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={styles.select}
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="interviewing">Interviewing</option>
          <option value="offer_extended">Offer Extended</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          style={styles.select}
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {filteredRequisitions.length === 0 ? (
        <div style={styles.emptyState}>
          No requisitions found. Click "Add Requisition" to create one.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Position</th>
                <th style={styles.th}>Hiring Manager</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Priority</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Created</th>
                <th style={styles.th}>Target Start</th>
                <th style={styles.th}>Hire Date</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequisitions.map((req) => (
                <tr key={req.id}>
                  <td style={styles.td}><strong>{req.position_title}</strong></td>
                  <td style={styles.td}>{req.hiring_manager || '—'}</td>
                  <td style={styles.td}>{req.department || '—'}</td>
                  <td style={styles.td}>{req.location || '—'}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, ...getPriorityColor(req.priority) }}>
                      {req.priority || 'none'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.badge, ...getStatusColor(req.status) }}>
                      {req.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {req.created_at ? new Date(req.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td style={styles.td}>
                    {req.target_start_date ? new Date(req.target_start_date).toLocaleDateString() : '—'}
                  </td>
                  <td style={styles.td}>
                    {req.hire_date ? new Date(req.hire_date).toLocaleDateString() : '—'}
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => onEdit?.(req.id)}
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        background: '#2563eb',
                        color: '#fff',
                        border: 'none',
                        marginRight: '0.5rem',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = '#1d4ed8')}
                      onMouseOut={(e) => (e.currentTarget.style.background = '#2563eb')}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

