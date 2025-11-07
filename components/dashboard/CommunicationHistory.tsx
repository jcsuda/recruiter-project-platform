'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Communication, FollowUp, Interview } from '@/lib/communication-types';

interface CommunicationHistoryProps {
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
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
    borderBottom: '1px solid #e5e7eb',
  },
  tab: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    color: '#6b7280',
    borderBottom: '2px solid transparent',
  },
  activeTab: {
    color: '#2563eb',
    borderBottomColor: '#2563eb',
  },
  content: {
    minHeight: '200px',
    maxHeight: '400px',
    overflowY: 'auto' as const,
  },
  item: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '0.75rem',
    marginBottom: '0.5rem',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  itemTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  itemMeta: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  itemContent: {
    fontSize: '0.875rem',
    color: '#374151',
    lineHeight: '1.4',
  },
  badge: {
    padding: '0.125rem 0.5rem',
    fontSize: '0.75rem',
    fontWeight: '500',
    borderRadius: '12px',
    textTransform: 'uppercase' as const,
  },
  empty: {
    textAlign: 'center' as const,
    padding: '2rem',
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '1rem',
    color: '#6b7280',
    fontSize: '0.875rem',
  },
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'email': return { background: '#dbeafe', color: '#1e40af' };
    case 'phone': return { background: '#dcfce7', color: '#166534' };
    case 'meeting': return { background: '#fef3c7', color: '#92400e' };
    case 'note': return { background: '#f3e8ff', color: '#7c3aed' };
    case 'reminder': return { background: '#fee2e2', color: '#dc2626' };
    default: return { background: '#f3f4f6', color: '#374151' };
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'sent': return { background: '#dbeafe', color: '#1e40af' };
    case 'delivered': return { background: '#dcfce7', color: '#166534' };
    case 'opened': return { background: '#fef3c7', color: '#92400e' };
    case 'replied': return { background: '#dcfce7', color: '#166534' };
    case 'failed': return { background: '#fee2e2', color: '#dc2626' };
    case 'scheduled': return { background: '#f3e8ff', color: '#7c3aed' };
    default: return { background: '#f3f4f6', color: '#374151' };
  }
};

export default function CommunicationHistory({ candidateId, candidateName, onRefresh }: CommunicationHistoryProps) {
  const [activeTab, setActiveTab] = useState<'communications' | 'followups' | 'interviews'>('communications');
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [candidateId, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'communications') {
        const { data } = await supabase
          .from('communications')
          .select('*')
          .eq('candidate_id', candidateId)
          .order('created_at', { ascending: false });
        setCommunications(data || []);
      } else if (activeTab === 'followups') {
        const { data } = await supabase
          .from('follow_ups')
          .select('*')
          .eq('candidate_id', candidateId)
          .order('due_date', { ascending: true });
        setFollowUps(data || []);
      } else if (activeTab === 'interviews') {
        const { data } = await supabase
          .from('interviews')
          .select('*')
          .eq('candidate_id', candidateId)
          .order('scheduled_at', { ascending: false });
        setInterviews(data || []);
      }
    } catch (error) {
      console.error('Error loading communication data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderCommunications = () => {
    if (loading) return <div style={styles.loading}>Loading communications...</div>;
    if (communications.length === 0) {
      return <div style={styles.empty}>No communications yet</div>;
    }

    return communications.map((comm) => (
      <div key={comm.id} style={styles.item}>
        <div style={styles.itemHeader}>
          <div>
            <h4 style={styles.itemTitle}>{comm.subject || `${comm.type} ${comm.direction}`}</h4>
            <div style={styles.itemMeta}>
              {formatDate(comm.created_at)} • {comm.direction}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span style={{ ...styles.badge, ...getTypeColor(comm.type) }}>
              {comm.type}
            </span>
            <span style={{ ...styles.badge, ...getStatusColor(comm.status) }}>
              {comm.status}
            </span>
          </div>
        </div>
        <div style={styles.itemContent}>{comm.content}</div>
      </div>
    ));
  };

  const renderFollowUps = () => {
    if (loading) return <div style={styles.loading}>Loading follow-ups...</div>;
    if (followUps.length === 0) {
      return <div style={styles.empty}>No follow-ups scheduled</div>;
    }

    return followUps.map((followUp) => (
      <div key={followUp.id} style={styles.item}>
        <div style={styles.itemHeader}>
          <div>
            <h4 style={styles.itemTitle}>{followUp.title}</h4>
            <div style={styles.itemMeta}>
              Due: {formatDate(followUp.due_date)} • Priority: {followUp.priority}
            </div>
          </div>
          <span style={{ ...styles.badge, ...getStatusColor(followUp.status) }}>
            {followUp.status}
          </span>
        </div>
        {followUp.description && (
          <div style={styles.itemContent}>{followUp.description}</div>
        )}
      </div>
    ));
  };

  const renderInterviews = () => {
    if (loading) return <div style={styles.loading}>Loading interviews...</div>;
    if (interviews.length === 0) {
      return <div style={styles.empty}>No interviews scheduled</div>;
    }

    return interviews.map((interview) => (
      <div key={interview.id} style={styles.item}>
        <div style={styles.itemHeader}>
          <div>
            <h4 style={styles.itemTitle}>{interview.title}</h4>
            <div style={styles.itemMeta}>
              {formatDate(interview.scheduled_at)} • {interview.duration_minutes} min • {interview.interview_type}
            </div>
          </div>
          <span style={{ ...styles.badge, ...getStatusColor(interview.status) }}>
            {interview.status}
          </span>
        </div>
        {interview.description && (
          <div style={styles.itemContent}>{interview.description}</div>
        )}
        {interview.location && (
          <div style={{ ...styles.itemContent, fontSize: '0.75rem', color: '#6b7280' }}>
            📍 {interview.location}
          </div>
        )}
        {interview.meeting_link && (
          <div style={{ ...styles.itemContent, fontSize: '0.75rem', color: '#2563eb' }}>
            🔗 <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer">
              Join Meeting
            </a>
          </div>
        )}
      </div>
    ));
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Communication History</h3>
        <button
          style={styles.addButton}
          onMouseOver={(e) => (e.currentTarget.style.background = '#1d4ed8')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#2563eb')}
        >
          + Add
        </button>
      </div>

      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'communications' && styles.activeTab),
          }}
          onClick={() => setActiveTab('communications')}
        >
          Communications ({communications.length})
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'followups' && styles.activeTab),
          }}
          onClick={() => setActiveTab('followups')}
        >
          Follow-ups ({followUps.length})
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'interviews' && styles.activeTab),
          }}
          onClick={() => setActiveTab('interviews')}
        >
          Interviews ({interviews.length})
        </button>
      </div>

      <div style={styles.content}>
        {activeTab === 'communications' && renderCommunications()}
        {activeTab === 'followups' && renderFollowUps()}
        {activeTab === 'interviews' && renderInterviews()}
      </div>
    </div>
  );
}


