import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle
} from 'lucide-react';

export const ReportsTab: React.FC = () => {
  return (
    <div className="reports-workspace font-sans">
      
      {/* Header section with Stats */}
      <div className="reports-header">
        <div>
          <h1>Talent Analytics & Reports</h1>
          <p>Real-time analytics tracking applications trend, conversion funnel bottlenecks, and recruiter KPI dashboards.</p>
        </div>
      </div>

      {/* Primary Metrics Row */}
      <div className="reports-metrics-row">
        <div className="metric-box">
          <div className="m-left">
            <span className="lbl">Average Time to Hire</span>
            <span className="val">18.4 Days</span>
            <span className="trend green"><TrendingUp size={12} /> -2.4 days vs last month</span>
          </div>
          <Clock size={28} className="icon-purple" />
        </div>

        <div className="metric-box">
          <div className="m-left">
            <span className="lbl">Offer Acceptance Rate</span>
            <span className="val">91.8%</span>
            <span className="trend green"><TrendingUp size={12} /> +1.2% MoM improvement</span>
          </div>
          <CheckCircle size={28} className="icon-green" />
        </div>

        <div className="metric-box">
          <div className="m-left">
            <span className="lbl">Average Cost per Hire</span>
            <span className="val">$2,450</span>
            <span className="trend red"><TrendingUp size={12} style={{ transform: 'rotate(180deg)' }} /> +$110 vs benchmark</span>
          </div>
          <DollarSign size={28} className="icon-coral" />
        </div>
      </div>

      {/* Charts Grid Layout */}
      <div className="reports-charts-grid">
        
        {/* Widget 1: Applications Trend Line Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Applications Trend (Last 7 Days)</h3>
            <span className="val">1,248 Total</span>
          </div>
          <div className="chart-body flex-center">
            {/* Custom SVG line chart */}
            <svg viewBox="0 0 500 180" className="svg-chart-line">
              <defs>
                <linearGradient id="gradientLine" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6d28d9" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#6d28d9" stopOpacity="0.0"/>
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="50" y1="20" x2="450" y2="20" stroke="#f1f5f9" />
              <line x1="50" y1="60" x2="450" y2="60" stroke="#f1f5f9" />
              <line x1="50" y1="100" x2="450" y2="100" stroke="#f1f5f9" />
              <line x1="50" y1="140" x2="450" y2="140" stroke="#f1f5f9" />

              {/* Chart Line Gradient Fill */}
              <path 
                d="M 50,140 Q 116,110 183,125 T 316,50 T 450,30 L 450,140 L 50,140 Z" 
                fill="url(#gradientLine)" 
              />
              {/* Core Path line */}
              <path 
                d="M 50,140 Q 116,110 183,125 T 316,50 T 450,30" 
                fill="none" 
                stroke="#6d28d9" 
                strokeWidth="3.5" 
                strokeLinecap="round"
              />

              {/* Data points */}
              <circle cx="50" cy="140" r="4.5" fill="#6d28d9" stroke="#ffffff" strokeWidth="2" />
              <circle cx="116" cy="115" r="4.5" fill="#6d28d9" stroke="#ffffff" strokeWidth="2" />
              <circle cx="183" cy="125" r="4.5" fill="#6d28d9" stroke="#ffffff" strokeWidth="2" />
              <circle cx="250" cy="90" r="4.5" fill="#6d28d9" stroke="#ffffff" strokeWidth="2" />
              <circle cx="316" cy="50" r="4.5" fill="#6d28d9" stroke="#ffffff" strokeWidth="2" />
              <circle cx="383" cy="40" r="4.5" fill="#6d28d9" stroke="#ffffff" strokeWidth="2" />
              <circle cx="450" cy="30" r="4.5" fill="#6d28d9" stroke="#ffffff" strokeWidth="2" />

              {/* Labels */}
              <text x="50" y="162" textAnchor="middle" fill="#64748b" className="font-10">Mon</text>
              <text x="116" y="162" textAnchor="middle" fill="#64748b" className="font-10">Tue</text>
              <text x="183" y="162" textAnchor="middle" fill="#64748b" className="font-10">Wed</text>
              <text x="250" y="162" textAnchor="middle" fill="#64748b" className="font-10">Thu</text>
              <text x="316" y="162" textAnchor="middle" fill="#64748b" className="font-10">Fri</text>
              <text x="383" y="162" textAnchor="middle" fill="#64748b" className="font-10">Sat</text>
              <text x="450" y="162" textAnchor="middle" fill="#64748b" className="font-10">Sun</text>
            </svg>
          </div>
        </div>

        {/* Widget 2: Recruitment Pipeline Conversion Funnel */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Hiring Funnel Conversion Rates</h3>
          </div>
          <div className="chart-body flex-column-start scroll-y max-h-200">
            <div className="funnel-container">
              {[
                { label: 'Applied', count: 480, pct: 100 },
                { label: 'Screened', count: 180, pct: 37.5 },
                { label: 'Interviewed', count: 42, pct: 8.75 },
                { label: 'Offers Sent', count: 18, pct: 3.75 },
                { label: 'Joined Candidates', count: 12, pct: 2.5 }
              ].map((stage, idx) => (
                <div key={idx} className="funnel-stage-row">
                  <span className="stage-lbl">{stage.label}</span>
                  <div className="funnel-bar-wrapper">
                    <div className="funnel-bar-fill" style={{ width: `${stage.pct}%` }}></div>
                    <span className="funnel-num">{stage.count} ({stage.pct}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Widget 3: Sourcing Channels Performance */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Sourcing Performance</h3>
          </div>
          <div className="chart-body flex-column-start scroll-y max-h-200">
            <div className="sources-breakdown">
              {[
                { name: 'LinkedIn Recruiter Pro', hires: 32, score: 90, color: '#6d28d9' },
                { name: 'Internal Employee Referrals', hires: 14, score: 75, color: '#0ea5e9' },
                { name: 'GetWorxs AI Matching Sourcing', hires: 48, score: 98, color: '#ff1744' },
                { name: 'Direct Careers Portal Site', hires: 8, score: 40, color: '#64748b' }
              ].map((src, i) => (
                <div key={i} className="source-item">
                  <div className="source-meta">
                    <strong>{src.name}</strong>
                    <span>{src.hires} Hires</span>
                  </div>
                  <div className="progress-bar-sources">
                    <div className="bar-fill" style={{ width: `${src.score}%`, backgroundColor: src.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Widget 4: Department Hiring Allocations */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Department Hiring Allocations</h3>
          </div>
          <div className="chart-body flex-center">
            {/* Pie donut visual */}
            <div className="pie-donut-wrapper">
              <svg viewBox="0 0 120 120" width="100%" height="100%">
                <circle cx="60" cy="60" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="15" />
                {/* Engineering (50%) */}
                <circle cx="60" cy="60" r="40" fill="transparent" stroke="#6d28d9" strokeWidth="15" 
                        strokeDasharray="125.6 251.2" strokeDashoffset="0" />
                {/* Product/Design (25%) */}
                <circle cx="60" cy="60" r="40" fill="transparent" stroke="#0ea5e9" strokeWidth="15" 
                        strokeDasharray="62.8 251.2" strokeDashoffset="-125.6" />
                {/* Operations/HR (15%) */}
                <circle cx="60" cy="60" r="40" fill="transparent" stroke="#ff1744" strokeWidth="15" 
                        strokeDasharray="37.6 251.2" strokeDashoffset="-188.4" />
                {/* Marketing/Sales (10%) */}
                <circle cx="60" cy="60" r="40" fill="transparent" stroke="#64748b" strokeWidth="15" 
                        strokeDasharray="25.2 251.2" strokeDashoffset="-226" />
              </svg>
              <div className="donut-center-labels">
                <strong>102</strong>
                <span>Openings</span>
              </div>
            </div>
            <div className="pie-legend">
              <div className="l-item"><span className="dot purple"></span><span>Engineering (50%)</span></div>
              <div className="l-item"><span className="dot blue"></span><span>Product & Design (25%)</span></div>
              <div className="l-item"><span className="dot red"></span><span>HR & Operations (15%)</span></div>
              <div className="l-item"><span className="dot gray"></span><span>Sales & Marketing (10%)</span></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
