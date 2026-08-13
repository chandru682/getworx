import React from 'react';
import { PlusCircle } from 'lucide-react';

interface HeaderProps {
  employerName: string;
  companyName: string;
}

export const DashboardHeader: React.FC<HeaderProps> = ({ employerName, companyName }) => {
  return (
    <section className="dashboard-header" style={{ padding: '24px', background: 'var(--bg-light)', borderRadius: '16px' }}>
      <h1 style={{ margin: 0, fontSize: '1.75rem' }}>Good morning, {employerName} 👋</h1>
      <p style={{ margin: '4px 0 12px', color: '#666' }}>Company: {companyName}</p>
      <p style={{ margin: 0, fontSize: '1rem', color: '#333' }}>"Here's what's happening with your hiring today."</p>
      <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
        <button className="primary-cta" style={{ padding: '8px 16px', background: '#6C5CE7', color: '#fff', borderRadius: '8px', border: 'none' }}>
          <PlusCircle size={16} style={{ marginRight: '4px' }} /> + Post a Job
        </button>
        <button className="secondary-cta" style={{ padding: '8px 12px', background: '#F0F0F5', color: '#333', borderRadius: '8px', border: 'none' }}>
          Find Talent
        </button>
        <button className="secondary-cta" style={{ padding: '8px 12px', background: '#F0F0F5', color: '#333', borderRadius: '8px', border: 'none' }}>
          Invite Recruiter
        </button>
      </div>
    </section>
  );
};
