import React from 'react';
import { BarChart3 } from 'lucide-react';

export const ReportsTab: React.FC = () => {
  return (
    <div className="reports-workspace font-sans" style={{ padding: '60px 20px', textAlign: 'center' }}>
      <div className="empty-state-box" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--tag-purple-bg)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <BarChart3 size={32} />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
          Talent Analytics & Reports
        </h2>
        <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Reports will appear once data is available.
        </p>
      </div>
    </div>
  );
};
