'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Requisition, Candidate, PipelineStage, KPIData, FunnelData } from '@/lib/dashboard-types';
import KPICards from '@/components/dashboard/KPICards';
import RequisitionList from '@/components/dashboard/RequisitionList';
import RecruitingFunnel from '@/components/dashboard/RecruitingFunnel';
import AddRequisitionModal from '@/components/dashboard/AddRequisitionModal';
import EditRequisitionModal from '@/components/dashboard/EditRequisitionModal';
import Header from '@/components/Header';

const styles = {
  main: {
    minHeight: '100vh',
    background: '#f5f5f5',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
  },
  header: {
    marginBottom: '2rem',
  },
  pageTitle: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0 0 0.5rem 0',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: 0,
  },
  navigation: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    padding: '1rem',
    background: '#fff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  navButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    borderRadius: '6px',
    cursor: 'pointer',
    background: '#f3f4f6',
    color: '#374151',
    border: 'none',
    textDecoration: 'none',
  },
  activeNavButton: {
    background: '#2563eb',
    color: '#fff',
  },
  loading: {
    textAlign: 'center' as const,
    padding: '4rem',
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '3rem',
    marginBottom: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  addButton: {
    padding: '0.625rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    borderRadius: '6px',
    cursor: 'pointer',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
  },
  divider: {
    height: '1px',
    background: '#e5e7eb',
    margin: '3rem 0',
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRequisition, setEditingRequisition] = useState<Requisition | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }
      setUser(user);
    } catch (error) {
      console.error('Auth error:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Load requisitions
      const { data: reqData } = await supabase
        .from('requisitions')
        .select('*')
        .order('created_at', { ascending: false });

      setRequisitions(reqData || []);

      // Load candidates
      const { data: candData } = await supabase
        .from('candidates')
        .select('*');

      setCandidates(candData || []);

      // Load pipeline stages
      const { data: stageData } = await supabase
        .from('pipeline_stages')
        .select('*')
        .order('order_index');

      setStages(stageData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  // Calculate KPIs
  const calculateKPIs = (): KPIData => {
    // Time to Fill: Average days from requisition creation to closure
    const closedReqs = requisitions.filter(r => r.status === 'closed');
    const timeToFill = closedReqs.length > 0
      ? Math.round(
          closedReqs.reduce((sum, req) => {
            const created = new Date(req.created_at).getTime();
            const updated = new Date(req.updated_at).getTime();
            return sum + (updated - created) / (1000 * 60 * 60 * 24);
          }, 0) / closedReqs.length
        )
      : 0;

    // Offer Acceptance Rate: (Hired candidates) / (Offers extended) × 100
    const hiredCandidates = candidates.filter(c => c.status === 'hired').length;
    const offersExtended = candidates.filter(c => {
      const offerStage = stages.find(s => s.name === 'Offers Extended');
      return c.current_stage_id === offerStage?.id || c.status === 'hired';
    }).length;
    
    const offerAcceptanceRate = offersExtended > 0
      ? Math.round((hiredCandidates / offersExtended) * 100)
      : 0;

    return {
      timeToFill,
      openRequisitions: requisitions.filter(r => r.status === 'open').length,
      offerAcceptanceRate,
      totalCandidates: candidates.length,
    };
  };

  const kpiData = calculateKPIs();

  // Calculate funnel data
  const funnelData: FunnelData[] = stages.map((stage, index) => {
    const count = candidates.filter(c => c.current_stage_id === stage.id).length;
    const prevStageCount = index > 0 
      ? candidates.filter(c => c.current_stage_id === stages[index - 1].id).length 
      : count;
    
    const conversionRate = prevStageCount > 0 ? (count / prevStageCount) * 100 : 0;

    return {
      stage: stage.name,
      count,
      conversionRate: index > 0 ? conversionRate : undefined,
    };
  });

      // Calculate rejected and withdrawn counts
      const rejectedCount = candidates.filter(c => c.status === 'rejected').length;
      const withdrawnCount = candidates.filter(c => c.status === 'withdrawn').length;

      // Handle edit requisition
      const handleEditRequisition = (id: string) => {
        const requisition = requisitions.find(r => r.id === id);
        if (requisition) {
          setEditingRequisition(requisition);
          setIsEditModalOpen(true);
        }
      };

  if (loading) {
    return (
      <div style={styles.main}>
        <Header />
        <div style={styles.loading}>Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div style={styles.main}>
      <Header />
      
      <div style={styles.container}>
        {/* Navigation */}
            <div style={styles.navigation}>
              <button
                onClick={() => router.push('/dashboard')}
                style={{ ...styles.navButton, ...styles.activeNavButton }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#1d4ed8')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#2563eb')}
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push('/candidates')}
                style={styles.navButton}
                onMouseOver={(e) => (e.currentTarget.style.background = '#e5e7eb')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#f3f4f6')}
              >
                Candidates
              </button>
              <button
                onClick={() => router.push('/analytics')}
                style={styles.navButton}
                onMouseOver={(e) => (e.currentTarget.style.background = '#e5e7eb')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#f3f4f6')}
              >
                Analytics
              </button>
              <button
                onClick={() => router.push('/team')}
                style={styles.navButton}
                onMouseOver={(e) => (e.currentTarget.style.background = '#e5e7eb')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#f3f4f6')}
              >
                Team
              </button>
              <button
                onClick={() => router.push('/search')}
                style={styles.navButton}
                onMouseOver={(e) => (e.currentTarget.style.background = '#e5e7eb')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#f3f4f6')}
              >
                Search Builder
              </button>
              <button
                onClick={() => router.push('/advanced')}
                style={styles.navButton}
                onMouseOver={(e) => (e.currentTarget.style.background = '#e5e7eb')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#f3f4f6')}
              >
                Advanced
              </button>
            </div>

        {/* 1. Recruiting Analytics Section */}
        <div style={styles.header}>
          <h2 style={styles.sectionTitle}>Recruiting Analytics</h2>
          <p style={styles.subtitle}>Track your recruiting performance and pipeline metrics</p>
        </div>

        {/* KPIs */}
        <KPICards data={kpiData} />

        {/* Divider */}
        <div style={styles.divider} />

        {/* 2. Requisition Management Section */}
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Requisition Management</h2>
            <p style={styles.subtitle}>Manage your open positions and hiring pipeline</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            style={styles.addButton}
            onMouseOver={(e) => (e.currentTarget.style.background = '#1d4ed8')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#2563eb')}
          >
            + Add Requisition
          </button>
        </div>

            {/* Requisition List */}
            <RequisitionList 
              requisitions={requisitions} 
              onEdit={handleEditRequisition}
            />

            {/* Divider */}
            <div style={styles.divider} />

            {/* 3. Recruiting Funnel */}
            <div style={styles.header}>
              <h2 style={styles.sectionTitle}>Recruiting Funnel</h2>
              <p style={styles.subtitle}>Track candidate progression through your hiring pipeline</p>
            </div>
        <RecruitingFunnel 
          data={funnelData} 
          rejectedCount={rejectedCount}
          withdrawnCount={withdrawnCount}
        />

            {/* Add Requisition Modal */}
            <AddRequisitionModal
              isOpen={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              onSuccess={loadDashboardData}
            />

            {/* Edit Requisition Modal */}
            <EditRequisitionModal
              isOpen={isEditModalOpen}
              onClose={() => {
                setIsEditModalOpen(false);
                setEditingRequisition(null);
              }}
              requisition={editingRequisition}
              onSuccess={loadDashboardData}
            />
      </div>
    </div>
  );
}

