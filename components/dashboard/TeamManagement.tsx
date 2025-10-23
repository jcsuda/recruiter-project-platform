'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Team, TeamMember, TeamInviteFormData } from '@/lib/team-types';

interface TeamManagementProps {
  userId: string;
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
  addButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    borderRadius: '6px',
    cursor: 'pointer',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
  },
  teamInfo: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  teamName: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 0.5rem 0',
  },
  teamDescription: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: '0 0 1rem 0',
  },
  teamStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
  },
  statCard: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '1rem',
    textAlign: 'center' as const,
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 0.25rem 0',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#6b7280',
    margin: 0,
  },
  membersSection: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 1rem 0',
  },
  memberCard: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '0.75rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  memberAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#6b7280',
  },
  memberDetails: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  memberName: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#111827',
    margin: '0 0 0.25rem 0',
  },
  memberEmail: {
    fontSize: '0.75rem',
    color: '#6b7280',
    margin: 0,
  },
  memberRole: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  roleBadge: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
    fontWeight: '500',
    borderRadius: '12px',
    textTransform: 'uppercase' as const,
  },
  statusBadge: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
    fontWeight: '500',
    borderRadius: '12px',
    textTransform: 'uppercase' as const,
  },
  inviteForm: {
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1.5rem',
    marginTop: '1rem',
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
  input: {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.875rem',
  },
  select: {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.875rem',
    background: '#fff',
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.75rem',
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
    padding: '2rem',
    color: '#6b7280',
  },
  empty: {
    textAlign: 'center' as const,
    padding: '2rem',
    color: '#6b7280',
    fontSize: '0.875rem',
  },
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'owner': return { background: '#fef3c7', color: '#92400e' };
    case 'admin': return { background: '#dbeafe', color: '#1e40af' };
    case 'recruiter': return { background: '#dcfce7', color: '#166534' };
    case 'viewer': return { background: '#f3f4f6', color: '#374151' };
    default: return { background: '#f3f4f6', color: '#374151' };
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return { background: '#dcfce7', color: '#166534' };
    case 'pending': return { background: '#fef3c7', color: '#92400e' };
    case 'suspended': return { background: '#fee2e2', color: '#dc2626' };
    default: return { background: '#f3f4f6', color: '#374151' };
  }
};

export default function TeamManagement({ userId, onRefresh }: TeamManagementProps) {
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteForm, setInviteForm] = useState<TeamInviteFormData>({
    email: '',
    role: 'recruiter',
    permissions: {},
  });

  useEffect(() => {
    loadTeamData();
  }, [userId]);

  const loadTeamData = async () => {
    setLoading(true);
    try {
      console.log('Loading team data for user:', userId);
      
      // Load user's team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('owner_id', userId)
        .single();

      console.log('Team data:', teamData);
      console.log('Team error:', teamError);

      if (teamData) {
        setTeam(teamData);

        // Load team members
        const { data: membersData, error: membersError } = await supabase
          .from('team_members')
          .select(`
            *,
            user:user_id (
              id,
              email,
              raw_user_meta_data
            )
          `)
          .eq('team_id', teamData.id);

        console.log('Members data:', membersData);
        console.log('Members error:', membersError);
        setMembers(membersData || []);
      } else {
        console.log('No team found for user');
        setTeam(null);
        setMembers([]);
      }
    } catch (error) {
      console.error('Error loading team data:', error);
      setTeam(null);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', team?.id)
        .eq('user_id', inviteForm.email);

      if (existingUser && existingUser.length > 0) {
        alert('User is already a member of this team');
        return;
      }

      // For now, we'll create a placeholder invitation
      // In a real implementation, you'd send an email invitation
      alert(`Invitation sent to ${inviteForm.email}`);
      
      setShowInviteForm(false);
      setInviteForm({
        email: '',
        role: 'recruiter',
        permissions: {},
      });
    } catch (error) {
      console.error('Error inviting member:', error);
      alert('Failed to send invitation');
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
    return <div style={styles.loading}>Loading team data...</div>;
  }

  if (!team) {
    return <div style={styles.empty}>No team found</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Team Management</h2>
        <button
          onClick={() => setShowInviteForm(!showInviteForm)}
          style={styles.addButton}
          onMouseOver={(e) => (e.currentTarget.style.background = '#1d4ed8')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#2563eb')}
        >
          + Invite Member
        </button>
      </div>

      {/* Team Information */}
      <div style={styles.teamInfo}>
        <h3 style={styles.teamName}>{team.name}</h3>
        {team.description && (
          <p style={styles.teamDescription}>{team.description}</p>
        )}
        <div style={styles.teamStats}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{members.length}</div>
            <div style={styles.statLabel}>Team Members</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>
              {members.filter(m => m.status === 'active').length}
            </div>
            <div style={styles.statLabel}>Active Members</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>
              {members.filter(m => m.role === 'recruiter').length}
            </div>
            <div style={styles.statLabel}>Recruiters</div>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div style={styles.membersSection}>
        <h3 style={styles.sectionTitle}>Team Members</h3>
        {members.length === 0 ? (
          <div style={styles.empty}>No team members yet</div>
        ) : (
          members.map((member) => (
            <div key={member.id} style={styles.memberCard}>
              <div style={styles.memberInfo}>
                <div style={styles.memberAvatar}>
                  {getInitials(member.user?.raw_user_meta_data?.full_name || member.user?.email || 'U')}
                </div>
                <div style={styles.memberDetails}>
                  <div style={styles.memberName}>
                    {member.user?.raw_user_meta_data?.full_name || member.user?.email}
                  </div>
                  <div style={styles.memberEmail}>{member.user?.email}</div>
                </div>
              </div>
              <div style={styles.memberRole}>
                <span style={{
                  ...styles.roleBadge,
                  ...getRoleColor(member.role)
                }}>
                  {member.role}
                </span>
                <span style={{
                  ...styles.statusBadge,
                  ...getStatusColor(member.status)
                }}>
                  {member.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <div style={styles.inviteForm}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: '600' }}>
            Invite Team Member
          </h4>
          <form onSubmit={handleInviteMember}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                style={styles.input}
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Role</label>
              <select
                style={styles.select}
                value={inviteForm.role}
                onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as any })}
              >
                <option value="recruiter">Recruiter</option>
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div style={styles.buttonGroup}>
              <button
                type="button"
                onClick={() => setShowInviteForm(false)}
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
                Send Invitation
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
