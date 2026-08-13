import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  count: number;
  trend: number; // percentage
  positive: boolean;
  icon: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, count, trend, positive, icon }) => {
  const trendColor = positive ? '#27AE60' : '#E74C3C';
  const TrendIcon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <div className="metric-card" style={{
      flex: 1,
      background: '#fff',
      borderRadius: '16px',
      padding: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    }}>
      <div style={{ fontSize: '24px', color: '#6C5CE7' }}>{icon}</div>
      <div>
        <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{count}</div>
        <div style={{ color: '#666', fontSize: '0.85rem' }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
          <TrendIcon size={12} color={trendColor} />
          <span style={{ color: trendColor, marginLeft: '4px', fontSize: '0.85rem' }}>{trend}%</span>
        </div>
      </div>
    </div>
  );
};
