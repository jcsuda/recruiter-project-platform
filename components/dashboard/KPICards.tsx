'use client';

import { KPIData } from '@/lib/dashboard-types';

interface KPICardsProps {
  data: KPIData;
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  card: {
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '1.5rem',
  },
  label: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '0.5rem',
  },
  value: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#111827',
    margin: 0,
  },
  unit: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginLeft: '0.25rem',
  },
};

export default function KPICards({ data }: KPICardsProps) {
  return (
    <div style={styles.grid}>
      <div style={styles.card}>
        <div style={styles.label}>Time to Fill</div>
        <p style={styles.value}>
          {data.timeToFill}
          <span style={styles.unit}>days</span>
        </p>
      </div>

      <div style={styles.card}>
        <div style={styles.label}>Open Requisitions</div>
        <p style={styles.value}>{data.openRequisitions}</p>
      </div>

      <div style={styles.card}>
        <div style={styles.label}>Offer Acceptance Rate</div>
        <p style={styles.value}>
          {data.offerAcceptanceRate}
          <span style={styles.unit}>%</span>
        </p>
      </div>

      <div style={styles.card}>
        <div style={styles.label}>Total Candidates</div>
        <p style={styles.value}>{data.totalCandidates}</p>
      </div>
    </div>
  );
}

