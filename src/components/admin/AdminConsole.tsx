import { useState } from 'react';
import {
  LayoutDashboard, Building2, Users, Briefcase, FileText,
  CreditCard, Zap, HeadphonesIcon, Megaphone, BarChart3,
  Globe, Factory, BookOpen, Settings, Shield, ScrollText,
  AlertTriangle, Search, Bell, Bot, ChevronUp, ChevronDown,
  CheckCircle2, XCircle,
  Eye, Edit2, Ban, RotateCcw, Download, Plus,
  UserCheck, UserX, RefreshCw, Send, X,
  Star, Activity, Server, Database, Mail, Cpu, HardDrive,
  Wifi, Package, Filter,
  UserPlus, Building, DollarSign, FileBarChart, ShieldCheck,
  Hash, MapPin, Layers, Target
} from 'lucide-react';
import './AdminConsole.css';
import {
  mockAdminCompanies, mockAdminRecruiters, mockAdminCandidates,
  mockAdminJobs, mockAdminApplications, mockAdminTransactions,
  mockAdminTickets, mockAdminAuditLogs, revenueChartData,
  registrationsChartData, aiUsageData, topCountries, topIndustries
} from './AdminMockData';

/* ═══════════════════════════════════════════════════
   Helper: SVG Line Chart
═══════════════════════════════════════════════════ */
function LineChart({ data, color = '#6D28D9', height = 100 }: {
  data: number[]; color?: string; height?: number;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 400; const h = height;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / range) * (h - 10) - 5,
  }));
  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaD = `${pathD} L${pts[pts.length - 1].x},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="ac-line-chart" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#grad-${color.replace('#','')})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color} stroke="white" strokeWidth="1.5" />
      ))}
    </svg>
  );
}

/* ═══════════════════════════════════════════════════
   Helper: Bar Chart
═══════════════════════════════════════════════════ */
function BarChartViz({ data, colorStart = '#6D28D9', colorEnd = '#8B5CF6' }: {
  data: { label: string; value: number }[];
  colorStart?: string; colorEnd?: string;
}) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="ac-bar-chart">
      {data.map((d, i) => (
        <div key={i} className="ac-bar-col">
          <div
            className="ac-bar"
            style={{
              height: `${(d.value / max) * 100}%`,
              background: `linear-gradient(180deg, ${colorStart}, ${colorEnd})`,
              borderRadius: '6px 6px 0 0',
            }}
            data-value={d.value.toLocaleString()}
          />
          <span className="ac-bar-label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Badge Helper
═══════════════════════════════════════════════════ */
function Badge({ status, label }: { status: string; label?: string }) {
  return <span className={`ac-badge ${status}`}>{label || status.charAt(0).toUpperCase() + status.slice(1)}</span>;
}

/* ═══════════════════════════════════════════════════
   AI Assistant Drawer
═══════════════════════════════════════════════════ */
const AI_PROMPTS = [
  'Show expired subscriptions this month',
  'Top recruiters by hiring rate',
  'Companies with highest revenue',
  'Pending support tickets summary',
  'AI usage cost breakdown',
  'Generate executive report',
];

function AIAssistant({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! I\'m your GetWorxs AI Copilot. Ask me anything about platform metrics, users, revenue, or generate executive reports instantly.' }
  ]);
  const [input, setInput] = useState('');

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', text };
    const aiResponses: Record<string, string> = {
      'expired': '📊 **Expired Subscriptions**: 14 companies have subscriptions expiring in the next 7 days. Total at-risk ARR: **₹48,300**. Recommend sending renewal reminders via email.',
      'top recruiter': '🏆 **Top Recruiters this Month**:\n1. Marcus Williams — 41 hires (84% interview rate)\n2. Sarah Chen — 32 hires (78% rate)\n3. Elena Rossi — 24 hires (71% rate)',
      'revenue': '💰 **Revenue Snapshot**: July MRR: **₹79,200** (+12.4% vs June). Enterprise plan contributes 68%. 4 pending payments totaling ₹8,930.',
      'support': '🎫 **Open Tickets**: 7 total — 2 Critical, 2 High, 3 Medium. Average resolution time: 4.2 hours. 2 tickets unassigned.',
      'ai usage': '🤖 **AI Cost Breakdown**: Total July spend: **₹9,964**. Highest: Candidate Matching (₹2,911). Resume Parsing (₹2,513). Total requests: 202,810.',
      'executive': '📋 **Executive Report Generated**:\n• Platform MRR: ₹79,200 ↑12.4%\n• Total Companies: 842 (+47 this month)\n• Active Jobs: 2,340 | Applications: 18,420\n• AI Requests: 202,810 | Uptime: 99.98%',
    };
    const key = Object.keys(aiResponses).find(k => text.toLowerCase().includes(k));
    const reply = aiResponses[key || ''] || `Analyzing "${text}"... Here's what I found: Platform is performing well with 99.98% uptime. Would you like me to drill deeper into any specific metric?`;
    setMessages(m => [...m, userMsg, { role: 'ai', text: reply }]);
    setInput('');
  };

  return (
    <div className="ac-ai-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ac-ai-drawer">
        <div className="ac-ai-header">
          <div className="ac-ai-avatar"><Bot size={18} /></div>
          <div><div className="ac-ai-title">AI Copilot</div><div className="ac-ai-tagline">GetWorxs Platform Intelligence</div></div>
          <button className="ac-ai-close" onClick={onClose}><X size={14} /></button>
        </div>
        {messages.length === 1 && (
          <div className="ac-ai-prompts">
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ac-text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Suggested</div>
            {AI_PROMPTS.map((p, i) => (
              <button key={i} className="ac-ai-prompt-chip" onClick={() => send(p)}>
                <Zap size={12} />{p}
              </button>
            ))}
          </div>
        )}
        <div className="ac-ai-messages">
          {messages.map((m, i) => (
            <div key={i} className={`ac-ai-bubble ${m.role}`}>
              <div className="ac-ai-bubble-avatar">{m.role === 'ai' ? '✦' : 'A'}</div>
              <div className="ac-ai-bubble-text" style={{ whiteSpace: 'pre-line' }}>{m.text}</div>
            </div>
          ))}
        </div>
        <div className="ac-ai-input-bar">
          <input className="ac-ai-input" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="Ask anything about the platform..." />
          <button className="ac-ai-send" onClick={() => send(input)}><Send size={14} /></button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   DASHBOARD TAB
═══════════════════════════════════════════════════ */
function DashboardTab() {
  const stats = [
    { label: 'Total Companies', value: '842', change: '+47', up: true, icon: <Building2 size={18} />, color: '#6D28D9', bg: '#EDE9FE' },
    { label: 'Active Employers', value: '3,218', change: '+128', up: true, icon: <UserCheck size={18} />, color: '#3B82F6', bg: '#DBEAFE' },
    { label: 'Recruiters', value: '1,841', change: '+64', up: true, icon: <Users size={18} />, color: '#10B981', bg: '#D1FAE5' },
    { label: 'Candidates', value: '94,210', change: '+5,180', up: true, icon: <UserPlus size={18} />, color: '#F59E0B', bg: '#FEF3C7' },
    { label: 'Jobs Today', value: '284', change: '+18', up: true, icon: <Briefcase size={18} />, color: '#8B5CF6', bg: '#EDE9FE' },
    { label: 'Applications Today', value: '1,842', change: '+312', up: true, icon: <FileText size={18} />, color: '#EC4899', bg: '#FCE7F3' },
    { label: 'Monthly Revenue', value: '₹79.2K', change: '+12.4%', up: true, icon: <DollarSign size={18} />, color: '#059669', bg: '#D1FAE5' },
    { label: 'Active Subs', value: '284', change: '+17', up: true, icon: <Star size={18} />, color: '#0EA5E9', bg: '#E0F2FE' },
    { label: 'AI Requests Today', value: '8,421', change: '-3.1%', up: false, icon: <Zap size={18} />, color: '#6D28D9', bg: '#EDE9FE' },
    { label: 'Platform Uptime', value: '99.98%', change: '+0.01%', up: true, icon: <Activity size={18} />, color: '#10B981', bg: '#D1FAE5' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
        {stats.map((s, i) => (
          <div key={i} className={`ac-stat-card ac-fade-up-${Math.min(i + 1, 5)}`}>
            <div className="ac-stat-header">
              <div className="ac-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <span className={`ac-stat-change ${s.up ? 'positive' : 'negative'}`}>
                {s.up ? <ChevronUp size={10} /> : <ChevronDown size={10} />}{s.change}
              </span>
            </div>
            <div className="ac-stat-value">{s.value}</div>
            <div className="ac-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Revenue Chart + Top Countries */}
      <div className="ac-charts-grid">
        <div className="ac-chart-card ac-fade-up-3">
          <div className="ac-chart-title">Monthly Revenue Growth</div>
          <div className="ac-chart-subtitle">Platform MRR trend — last 7 months</div>
          <LineChart data={revenueChartData.map(d => d.revenue)} height={140} color="#6D28D9" />
          <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
            {revenueChartData.map(d => (
              <div key={d.month} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--ac-text-muted)', fontWeight: 600 }}>{d.month}</div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--ac-text-secondary)' }}>₹{(d.revenue / 1000).toFixed(0)}K</div>
              </div>
            ))}
          </div>
        </div>
        <div className="ac-chart-card ac-fade-up-4">
          <div className="ac-chart-title">Top Hiring Countries</div>
          <div className="ac-chart-subtitle">Companies & jobs distribution</div>
          {topCountries.slice(0, 6).map((c, i) => (
            <div key={i} className="ac-list-item">
              <span className="ac-list-flag">{c.flag}</span>
              <div className="ac-list-meta">
                <div className="ac-list-name">{c.country}</div>
                <div className="ac-list-sub">{c.companies} companies · {c.jobs.toLocaleString()} jobs</div>
              </div>
              <div className="ac-list-right">
                <span className="ac-list-pct">{c.percentage}%</span>
                <div className="ac-mini-bar-track"><div className="ac-mini-bar-fill" style={{ width: `${c.percentage * 3}%` }} /></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Registration Bars + Industries */}
      <div className="ac-charts-grid">
        <div className="ac-chart-card ac-fade-up-3">
          <div className="ac-chart-title">Monthly Platform Registrations</div>
          <div className="ac-chart-subtitle">Companies, recruiters and candidates</div>
          <BarChartViz data={registrationsChartData.map(d => ({ label: d.month, value: d.candidates }))} />
          <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
            {[{ label: 'Candidates', color: '#6D28D9' }, { label: 'Recruiters', color: '#8B5CF6' }, { label: 'Companies', color: '#C4B5FD' }].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
                <span style={{ fontSize: 12, color: 'var(--ac-text-muted)', fontWeight: 500 }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="ac-chart-card ac-fade-up-4">
          <div className="ac-chart-title">Top Industries</div>
          <div className="ac-chart-subtitle">Jobs posted by sector</div>
          {topIndustries.map((ind, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ac-text-secondary)' }}>{ind.name}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ac-text-primary)' }}>{ind.percentage}%</span>
              </div>
              <div className="ac-mini-bar-track" style={{ height: 6 }}>
                <div className="ac-mini-bar-fill" style={{ width: `${ind.percentage * 3.2}%`, background: ind.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="ac-section-label">Quick Actions</div>
        <div className="ac-quick-actions">
          {[
            { icon: <CheckCircle2 size={18} />, label: 'Approve Company', color: '#10B981', bg: '#D1FAE5' },
            { icon: <UserCheck size={18} />, label: 'Verify Employer', color: '#3B82F6', bg: '#DBEAFE' },
            { icon: <Ban size={18} />, label: 'Suspend Account', color: '#EF4444', bg: '#FEE2E2' },
            { icon: <CreditCard size={18} />, label: 'View Payments', color: '#8B5CF6', bg: '#EDE9FE' },
            { icon: <Settings size={18} />, label: 'Platform Settings', color: '#64748B', bg: '#F1F5F9' },
          ].map((a, i) => (
            <button key={i} className="ac-quick-action-btn">
              <div className="qab-icon" style={{ background: a.bg, color: a.color }}>{a.icon}</div>
              <span className="qab-label">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Platform Health */}
      <div>
        <div className="ac-section-label">Platform Health</div>
        <div className="ac-health-grid">
          {[
            { name: 'API Gateway', value: 'Operational', uptime: '99.98%', status: 'operational', icon: <Wifi size={16} /> },
            { name: 'Database Cluster', value: '12ms latency', uptime: '99.99%', status: 'operational', icon: <Database size={16} /> },
            { name: 'Email Service', value: 'Operational', uptime: '99.95%', status: 'operational', icon: <Mail size={16} /> },
            { name: 'AI Service', value: 'High Load', uptime: '99.84%', status: 'degraded', icon: <Bot size={16} /> },
            { name: 'Payment Gateway', value: 'Operational', uptime: '99.99%', status: 'operational', icon: <CreditCard size={16} /> },
            { name: 'File Storage', value: '71% used', uptime: '100%', status: 'operational', icon: <HardDrive size={16} /> },
            { name: 'CPU Usage', value: '34%', uptime: 'Normal', status: 'operational', icon: <Cpu size={16} /> },
            { name: 'Memory', value: '68%', uptime: 'Normal', status: 'operational', icon: <Server size={16} /> },
          ].map((s, i) => (
            <div key={i} className="ac-health-card">
              <div className={`ac-health-indicator ${s.status}`} />
              <div style={{ color: 'var(--ac-text-muted)', flexShrink: 0 }}>{s.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="ac-health-name">{s.name}</div>
                <div className="ac-health-value">{s.value}</div>
              </div>
              <div className="ac-health-uptime">{s.uptime}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Usage Summary */}
      <div className="ac-charts-grid">
        <div className="ac-chart-card">
          <div className="ac-chart-title">AI Usage This Month</div>
          <div className="ac-chart-subtitle">Breakdown by feature · Total cost: ₹9,964</div>
          <div className="ac-ai-usage-grid" style={{ marginTop: 8 }}>
            {aiUsageData.map((a, i) => {
              const maxCount = Math.max(...aiUsageData.map(x => x.count));
              return (
                <div key={i} className="ac-ai-usage-row">
                  <span className="ac-ai-usage-icon">{a.icon}</span>
                  <div className="ac-ai-usage-info">
                    <div className="ac-ai-usage-label">{a.label}</div>
                    <div className="ac-ai-usage-count">{a.count.toLocaleString()} requests</div>
                    <div className="ac-ai-usage-track">
                      <div className="ac-ai-usage-fill" style={{ width: `${(a.count / maxCount) * 100}%` }} />
                    </div>
                  </div>
                  <div className="ac-ai-usage-cost">₹{a.cost.toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="ac-chart-card">
          <div className="ac-chart-title">Applications Trend</div>
          <div className="ac-chart-subtitle">Daily application submissions — July 2024</div>
          <LineChart data={[840, 920, 780, 1100, 1340, 980, 1520, 1680, 1420, 1840, 2100, 1920, 2340, 1842]} color="#FF1744" height={130} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
            {['Avg/Day', 'Peak Day', 'Total Month', 'vs Last Month'].map((l, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--ac-text-primary)' }}>
                  {['1,482', '2,340', '44,460', '+18.3%'][i]}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ac-text-muted)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   COMPANIES TAB
═══════════════════════════════════════════════════ */
function CompaniesTab() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const filtered = mockAdminCompanies.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) &&
    (filter === 'all' || c.status === filter || c.plan === filter)
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="ac-page-header">
        <div>
          <h1 className="ac-page-title">Companies</h1>
          <p className="ac-page-subtitle">Manage all registered companies and their subscriptions</p>
        </div>
        <div className="ac-page-actions">
          <button className="ac-btn ac-btn-secondary"><Download size={14} />Export</button>
          <button className="ac-btn ac-btn-primary"><Plus size={14} />Add Company</button>
        </div>
      </div>
      {/* Summary Cards */}
      <div className="ac-four-col">
        {[
          { label: 'Total', value: mockAdminCompanies.length, color: '#6D28D9', bg: '#EDE9FE' },
          { label: 'Active', value: mockAdminCompanies.filter(c => c.status === 'active').length, color: '#10B981', bg: '#D1FAE5' },
          { label: 'Suspended', value: mockAdminCompanies.filter(c => c.status === 'suspended').length, color: '#EF4444', bg: '#FEE2E2' },
          { label: 'Enterprise Plans', value: mockAdminCompanies.filter(c => c.plan === 'enterprise').length, color: '#8B5CF6', bg: '#EDE9FE' },
        ].map((s, i) => (
          <div key={i} className="ac-stat-card" style={{ padding: 18 }}>
            <div className="ac-stat-value" style={{ fontSize: 28, color: s.color }}>{s.value}</div>
            <div className="ac-stat-label">{s.label} Companies</div>
          </div>
        ))}
      </div>
      <div className="ac-table-wrapper">
        <div className="ac-table-header">
          <div>
            <span className="ac-table-title">All Companies</span>
            <span className="ac-table-count">{filtered.length}</span>
          </div>
          <div className="ac-table-controls">
            <div className="ac-search-box">
              <Search size={13} style={{ color: 'var(--ac-text-muted)' }} />
              <input placeholder="Search companies..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="ac-filter-select" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
              <option value="flagged">Flagged</option>
              <option value="enterprise">Enterprise</option>
              <option value="growth">Growth</option>
            </select>
            <button className="ac-btn ac-btn-secondary ac-btn-sm"><Filter size={13} />Filter</button>
          </div>
        </div>
        <table className="ac-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Industry</th>
              <th>Country</th>
              <th>Plan</th>
              <th>Recruiters</th>
              <th>Jobs</th>
              <th>Applications</th>
              <th>Revenue</th>
              <th>Status</th>
              <th>Verified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id}>
                <td>
                  <div className="ac-user-cell">
                    <img src={c.logo} alt={c.name} className="ac-table-logo" />
                    <div>
                      <div className="ac-user-name">{c.name}</div>
                      <div className="ac-user-sub">{c.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: 12.5 }}>{c.industry}</td>
                <td style={{ fontSize: 12.5 }}>{c.country}</td>
                <td><Badge status={c.plan} /></td>
                <td style={{ fontWeight: 700, color: 'var(--ac-text-primary)' }}>{c.recruiters}</td>
                <td style={{ fontWeight: 700 }}>{c.jobs}</td>
                <td style={{ fontWeight: 700 }}>{c.applications.toLocaleString()}</td>
                <td style={{ fontWeight: 700, color: 'var(--ac-success)' }}>
                  {c.revenue > 0 ? `₹${c.revenue.toLocaleString()}` : '—'}
                </td>
                <td><Badge status={c.status} /></td>
                <td>
                  {c.verified
                    ? <span style={{ color: 'var(--ac-info)', display: 'flex', alignItems: 'center', gap: 4 }}><ShieldCheck size={14} />Verified</span>
                    : <span style={{ color: 'var(--ac-text-muted)', fontSize: 12 }}>Unverified</span>}
                </td>
                <td>
                  <div className="ac-row-actions">
                    <button className="ac-action-btn" data-tooltip="View"><Eye size={13} /></button>
                    <button className="ac-action-btn" data-tooltip="Edit"><Edit2 size={13} /></button>
                    <button className="ac-action-btn danger" data-tooltip="Suspend"><Ban size={13} /></button>
                    <button className="ac-action-btn success" data-tooltip="Analytics"><BarChart3 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   RECRUITERS TAB
═══════════════════════════════════════════════════ */
function RecruitersTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="ac-page-header">
        <div>
          <h1 className="ac-page-title">Recruiters</h1>
          <p className="ac-page-subtitle">Monitor recruiter performance and platform activity</p>
        </div>
        <div className="ac-page-actions">
          <button className="ac-btn ac-btn-secondary"><Download size={14} />Export</button>
          <button className="ac-btn ac-btn-primary"><Filter size={14} />Advanced Filter</button>
        </div>
      </div>
      <div className="ac-table-wrapper">
        <div className="ac-table-header">
          <span className="ac-table-title">All Recruiters</span>
          <span className="ac-table-count">{mockAdminRecruiters.length}</span>
          <div className="ac-table-controls">
            <div className="ac-search-box"><Search size={13} style={{ color: 'var(--ac-text-muted)' }} /><input placeholder="Search recruiters..." /></div>
          </div>
        </div>
        <table className="ac-table">
          <thead><tr><th>Recruiter</th><th>Company</th><th>Jobs Created</th><th>Hired</th><th>Interview Rate</th><th>Offer Rate</th><th>AI Usage</th><th>Performance</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {mockAdminRecruiters.map(r => (
              <tr key={r.id}>
                <td>
                  <div className="ac-user-cell">
                    <img src={r.avatar} alt={r.name} className="ac-table-avatar" />
                    <div className="ac-user-name">{r.name}</div>
                  </div>
                </td>
                <td style={{ fontSize: 12.5 }}>{r.company}</td>
                <td style={{ fontWeight: 700, color: 'var(--ac-text-primary)' }}>{r.jobsCreated}</td>
                <td style={{ fontWeight: 800, color: 'var(--ac-success)' }}>{r.hired}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="ac-mini-bar-track" style={{ width: 60 }}><div className="ac-mini-bar-fill" style={{ width: `${r.interviewRate}%` }} /></div>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{r.interviewRate}%</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="ac-mini-bar-track" style={{ width: 60 }}><div className="ac-mini-bar-fill" style={{ width: `${r.offerRate}%`, background: '#8B5CF6' }} /></div>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{r.offerRate}%</span>
                  </div>
                </td>
                <td style={{ fontSize: 12.5, color: 'var(--ac-primary)', fontWeight: 700 }}>{r.aiUsage.toLocaleString()}</td>
                <td><span className={`ac-perf-ring ${r.performance}`}>{r.performance.slice(0, 2).toUpperCase()}</span></td>
                <td><Badge status={r.status} /></td>
                <td>
                  <div className="ac-row-actions">
                    <button className="ac-action-btn"><Eye size={13} /></button>
                    <button className="ac-action-btn danger"><Ban size={13} /></button>
                    <button className="ac-action-btn"><RotateCcw size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   CANDIDATES TAB
═══════════════════════════════════════════════════ */
function CandidatesTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="ac-page-header">
        <div><h1 className="ac-page-title">Candidates</h1><p className="ac-page-subtitle">94,210 registered candidates across the platform</p></div>
        <div className="ac-page-actions">
          <button className="ac-btn ac-btn-secondary"><Download size={14} />Export</button>
        </div>
      </div>
      <div className="ac-table-wrapper">
        <div className="ac-table-header">
          <span className="ac-table-title">All Candidates</span>
          <span className="ac-table-count">{mockAdminCandidates.length}</span>
          <div className="ac-table-controls">
            <div className="ac-search-box"><Search size={13} style={{ color: 'var(--ac-text-muted)' }} /><input placeholder="Search candidates..." /></div>
          </div>
        </div>
        <table className="ac-table">
          <thead><tr><th>Candidate</th><th>Location</th><th>Experience</th><th>Skills</th><th>Resume</th><th>Verified</th><th>Applications</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {mockAdminCandidates.map(c => (
              <tr key={c.id}>
                <td><div className="ac-user-cell"><img src={c.avatar} alt={c.name} className="ac-table-avatar" /><div className="ac-user-name">{c.name}</div></div></td>
                <td style={{ fontSize: 12 }}><div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} style={{ color: 'var(--ac-text-muted)' }} />{c.location}</div></td>
                <td style={{ fontSize: 12.5 }}>{c.experience}</td>
                <td><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{c.skills.slice(0, 2).map(s => <span key={s} style={{ fontSize: 10.5, background: 'var(--ac-primary-light)', color: 'var(--ac-primary)', padding: '2px 7px', borderRadius: 99, fontWeight: 600 }}>{s}</span>)}</div></td>
                <td>{c.resume ? <span style={{ color: 'var(--ac-success)', fontSize: 12 }}>✓ Available</span> : <span style={{ color: 'var(--ac-text-muted)', fontSize: 12 }}>None</span>}</td>
                <td>{c.verified ? <ShieldCheck size={15} style={{ color: 'var(--ac-info)' }} /> : <span style={{ color: 'var(--ac-text-muted)', fontSize: 12 }}>—</span>}</td>
                <td style={{ fontWeight: 700 }}>{c.applications}</td>
                <td><Badge status={c.status} /></td>
                <td><div className="ac-row-actions"><button className="ac-action-btn"><Eye size={13} /></button><button className="ac-action-btn danger"><Ban size={13} /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   JOBS TAB
═══════════════════════════════════════════════════ */
function JobsAdminTab() {
  const [filter, setFilter] = useState('all');
  const filtered = mockAdminJobs.filter(j => filter === 'all' || j.status === filter);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="ac-page-header">
        <div><h1 className="ac-page-title">Jobs</h1><p className="ac-page-subtitle">All job listings across the platform</p></div>
        <div className="ac-page-actions">
          <button className="ac-btn ac-btn-secondary"><Download size={14} />Export</button>
          <button className="ac-btn ac-btn-danger"><AlertTriangle size={14} />Review Flagged (3)</button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['all', 'active', 'draft', 'pending', 'closed', 'expired', 'flagged'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className="ac-btn"
            style={{ background: filter === s ? 'var(--ac-primary)' : 'var(--ac-card)', color: filter === s ? 'white' : 'var(--ac-text-secondary)', border: '1px solid var(--ac-border)', fontSize: 12 }}>
            {s.charAt(0).toUpperCase() + s.slice(1)} ({s === 'all' ? mockAdminJobs.length : mockAdminJobs.filter(j => j.status === s).length})
          </button>
        ))}
      </div>
      <div className="ac-table-wrapper">
        <table className="ac-table">
          <thead><tr><th>Job Title</th><th>Company</th><th>Recruiter</th><th>Applications</th><th>Views</th><th>Status</th><th>Approval</th><th>Posted</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(j => (
              <tr key={j.id}>
                <td><div><div style={{ fontWeight: 600, color: 'var(--ac-text-primary)', fontSize: 13 }}>{j.title}</div><div style={{ fontSize: 11, color: 'var(--ac-text-muted)', marginTop: 2 }}><MapPin size={10} style={{ display: 'inline', marginRight: 3 }} />{j.location}</div></div></td>
                <td style={{ fontSize: 12.5 }}>{j.company}</td>
                <td style={{ fontSize: 12.5 }}>{j.recruiter}</td>
                <td style={{ fontWeight: 700, color: 'var(--ac-primary)' }}>{j.applications}</td>
                <td style={{ fontSize: 12.5, color: 'var(--ac-text-muted)' }}>{j.views.toLocaleString()}</td>
                <td><Badge status={j.status} /></td>
                <td><Badge status={j.approval} label={j.approval.charAt(0).toUpperCase() + j.approval.slice(1)} /></td>
                <td style={{ fontSize: 12, color: 'var(--ac-text-muted)' }}>{j.posted}</td>
                <td><div className="ac-row-actions"><button className="ac-action-btn"><Eye size={13} /></button><button className="ac-action-btn success"><CheckCircle2 size={13} /></button><button className="ac-action-btn danger"><XCircle size={13} /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SUBSCRIPTIONS TAB
═══════════════════════════════════════════════════ */
function SubscriptionsTab() {
  const plans = [
    { name: 'Starter', price: '₹4,000', count: 84, pct: 30, color: '#64748B', total: '₹3,36,000/mo' },
    { name: 'Growth', price: '₹15,999', count: 138, pct: 49, color: '#3B82F6', total: '₹22,07,862/mo', featured: true },
    { name: 'Enterprise', price: '₹54,999', count: 54, pct: 19, color: '#6D28D9', total: '₹29,69,946/mo' },
    { name: 'Trial', price: 'Free', count: 8, pct: 3, color: '#F59E0B', total: '—' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="ac-page-header">
        <div><h1 className="ac-page-title">Subscriptions</h1><p className="ac-page-subtitle">Plan management, trials, and renewals</p></div>
        <div className="ac-page-actions">
          <button className="ac-btn ac-btn-secondary"><Plus size={14} />Add Coupon</button>
          <button className="ac-btn ac-btn-primary"><Settings size={14} />Manage Plans</button>
        </div>
      </div>
      <div className="ac-plan-grid">
        {plans.map((p, i) => (
          <div key={i} className={`ac-plan-card ${p.featured ? 'featured' : ''}`}>
            <div className="ac-plan-name" style={{ color: p.color }}>{p.name}</div>
            <div className="ac-plan-price">{p.price}<span style={{ fontSize: 13, fontWeight: 400, color: 'var(--ac-text-muted)' }}>/mo</span></div>
            <div className="ac-plan-sub" style={{ color: p.color }}>{p.total}</div>
            <div className="ac-plan-count" style={{ color: p.color }}>{p.count}</div>
            <div className="ac-plan-label">Active Subscriptions</div>
            <div className="ac-plan-bar"><div className="ac-plan-bar-fill" style={{ width: `${p.pct}%`, background: p.color }} /></div>
            <div style={{ marginTop: 6, fontSize: 11.5, color: 'var(--ac-text-muted)', textAlign: 'right' }}>{p.pct}% of total</div>
          </div>
        ))}
      </div>
      <div className="ac-two-col">
        <div className="ac-chart-card">
          <div className="ac-chart-title">Subscription Growth</div>
          <div className="ac-chart-subtitle">Total subscriptions over 7 months</div>
          <LineChart data={revenueChartData.map(d => d.subscriptions)} color="#6D28D9" height={120} />
        </div>
        <div className="ac-chart-card">
          <div className="ac-chart-title">Expiring Soon</div>
          <div className="ac-chart-subtitle">Subscriptions expiring in next 30 days</div>
          {[
            { name: 'TechNova Solutions', plan: 'Enterprise', days: 4, revenue: '₹8,400' },
            { name: 'MediCare Health', plan: 'Growth', days: 8, revenue: '₹2,800' },
            { name: 'Stellar Logistics', plan: 'Starter', days: 12, revenue: '₹490' },
            { name: 'AutoDrive Tech', plan: 'Growth', days: 18, revenue: '₹3,360' },
            { name: 'PixelForge Studios', plan: 'Trial', days: 21, revenue: '—' },
          ].map((e, i) => (
            <div key={i} className="ac-list-item">
              <div style={{ width: 36, height: 36, borderRadius: 8, background: e.days <= 7 ? '#FFF0F2' : e.days <= 14 ? '#FEF3C7' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: e.days <= 7 ? '#FF1744' : e.days <= 14 ? '#D97706' : '#64748B' }}>
                {e.days}d
              </div>
              <div className="ac-list-meta">
                <div className="ac-list-name">{e.name}</div>
                <div className="ac-list-sub">{e.plan} · {e.revenue}</div>
              </div>
              <button className="ac-btn ac-btn-xs ac-btn-primary">Remind</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PAYMENTS TAB
═══════════════════════════════════════════════════ */
function PaymentsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="ac-page-header">
        <div><h1 className="ac-page-title">Payments & Revenue</h1><p className="ac-page-subtitle">Transactions, invoices and financial reporting</p></div>
        <div className="ac-page-actions">
          <button className="ac-btn ac-btn-secondary"><Download size={14} />Export CSV</button>
          <button className="ac-btn ac-btn-primary"><FileBarChart size={14} />Revenue Report</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Monthly Revenue', value: '₹79,200', sub: '+12.4% vs last month', color: '#10B981' },
          { label: 'Annual Revenue', value: '₹631,800', sub: 'YTD 2024', color: '#6D28D9' },
          { label: 'Pending Payments', value: '₹12,430', sub: '6 transactions', color: '#F59E0B' },
          { label: 'Refunds (July)', value: '₹1,960', sub: '1 refund processed', color: '#EF4444' },
        ].map((s, i) => (
          <div key={i} className="ac-stat-card">
            <div className="ac-stat-value" style={{ fontSize: 24, color: s.color }}>{s.value}</div>
            <div className="ac-stat-label">{s.label}</div>
            <div className="ac-stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>
      <div className="ac-chart-card">
        <div className="ac-chart-title">Revenue Trend — 2024</div>
        <div className="ac-chart-subtitle">Monthly recurring revenue in INR (₹)</div>
        <BarChartViz data={revenueChartData.map(d => ({ label: d.month, value: d.revenue }))} colorStart="#6D28D9" colorEnd="#8B5CF6" />
      </div>
      <div className="ac-table-wrapper">
        <div className="ac-table-header">
          <span className="ac-table-title">Recent Transactions</span>
          <span className="ac-table-count">{mockAdminTransactions.length}</span>
          <div className="ac-table-controls">
            <div className="ac-search-box"><Search size={13} style={{ color: 'var(--ac-text-muted)' }} /><input placeholder="Search transactions..." /></div>
          </div>
        </div>
        <table className="ac-table">
          <thead><tr><th>Invoice</th><th>Company</th><th>Plan</th><th>Amount</th><th>Method</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {mockAdminTransactions.map(t => (
              <tr key={t.id}>
                <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--ac-primary)' }}>{t.invoice}</td>
                <td style={{ fontWeight: 600, fontSize: 13 }}>{t.company}</td>
                <td><Badge status={t.plan.toLowerCase()} label={t.plan} /></td>
                <td style={{ fontWeight: 800, fontSize: 14, color: t.amount > 0 ? 'var(--ac-text-primary)' : 'var(--ac-accent)' }}>₹{t.amount.toLocaleString()}</td>
                <td style={{ fontSize: 12.5, color: 'var(--ac-text-muted)' }}>{t.method}</td>
                <td style={{ fontSize: 12, color: 'var(--ac-text-muted)' }}>{t.date}</td>
                <td><Badge status={t.status} /></td>
                <td><div className="ac-row-actions"><button className="ac-action-btn"><Eye size={13} /></button><button className="ac-action-btn"><Download size={13} /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   AI USAGE TAB
═══════════════════════════════════════════════════ */
function AIUsageTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="ac-page-header">
        <div><h1 className="ac-page-title">AI Usage Dashboard</h1><p className="ac-page-subtitle">Token consumption, costs and response analytics</p></div>
        <div className="ac-page-actions">
          <button className="ac-btn ac-btn-secondary"><Download size={14} />Export Report</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Total Requests', value: '202,810', icon: '🤖', color: '#6D28D9', bg: '#EDE9FE' },
          { label: 'Tokens Used', value: '1.4B', icon: '⚡', color: '#F59E0B', bg: '#FEF3C7' },
          { label: 'Total Cost', value: '₹9,964', icon: '💵', color: '#10B981', bg: '#D1FAE5' },
          { label: 'Avg Response', value: '1.2s', icon: '⏱', color: '#3B82F6', bg: '#DBEAFE' },
        ].map((s, i) => (
          <div key={i} className="ac-stat-card">
            <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
            <div className="ac-stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="ac-stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="ac-two-col">
        <div className="ac-chart-card">
          <div className="ac-chart-title">AI Usage by Feature</div>
          <div className="ac-chart-subtitle">Monthly request volume and cost breakdown</div>
          <div className="ac-ai-usage-grid" style={{ marginTop: 12 }}>
            {aiUsageData.map((a, i) => {
              const maxCount = Math.max(...aiUsageData.map(x => x.count));
              return (
                <div key={i} className="ac-ai-usage-row">
                  <span className="ac-ai-usage-icon">{a.icon}</span>
                  <div className="ac-ai-usage-info">
                    <div className="ac-ai-usage-label">{a.label}</div>
                    <div className="ac-ai-usage-count">{a.count.toLocaleString()} requests</div>
                    <div className="ac-ai-usage-track"><div className="ac-ai-usage-fill" style={{ width: `${(a.count / maxCount) * 100}%` }} /></div>
                  </div>
                  <div className="ac-ai-usage-cost">₹{a.cost.toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="ac-chart-card">
          <div className="ac-chart-title">Daily AI Usage Trend</div>
          <div className="ac-chart-subtitle">Requests per day — July 2024</div>
          <LineChart data={[5820, 6410, 7200, 6840, 8100, 7620, 9200, 8840, 10100, 9600, 11200, 10400, 8900, 8421]} color="#8B5CF6" height={120} />
          <div style={{ marginTop: 20 }}>
            <div className="ac-section-label">Top AI Users</div>
            {mockAdminRecruiters.slice(0, 5).map((r, i) => (
              <div key={i} className="ac-list-item">
                <img src={r.avatar} alt={r.name} className="ac-table-avatar" style={{ width: 28, height: 28 }} />
                <div className="ac-list-meta">
                  <div className="ac-list-name">{r.name}</div>
                  <div className="ac-list-sub">{r.company}</div>
                </div>
                <div style={{ fontWeight: 800, color: 'var(--ac-primary)', fontSize: 13 }}>{r.aiUsage.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SUPPORT CENTER TAB
═══════════════════════════════════════════════════ */
function SupportTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="ac-page-header">
        <div><h1 className="ac-page-title">Support Center</h1><p className="ac-page-subtitle">Tickets, complaints, bugs and feature requests</p></div>
        <div className="ac-page-actions">
          <button className="ac-btn ac-btn-primary"><Plus size={14} />New Ticket</button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Open Tickets', value: mockAdminTickets.filter(t => t.status === 'open').length, color: '#EF4444', bg: '#FEE2E2' },
          { label: 'In Progress', value: mockAdminTickets.filter(t => t.status === 'in_progress').length, color: '#F59E0B', bg: '#FEF3C7' },
          { label: 'Resolved', value: mockAdminTickets.filter(t => t.status === 'resolved').length, color: '#10B981', bg: '#D1FAE5' },
          { label: 'Avg Resolution', value: '4.2h', color: '#3B82F6', bg: '#DBEAFE' },
        ].map((s, i) => (
          <div key={i} className="ac-stat-card" style={{ padding: 18 }}>
            <div className="ac-stat-value" style={{ fontSize: 28, color: s.color }}>{s.value}</div>
            <div className="ac-stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="ac-table-wrapper">
        <div className="ac-table-header">
          <span className="ac-table-title">All Tickets</span>
          <span className="ac-table-count">{mockAdminTickets.length}</span>
          <div className="ac-table-controls">
            <div className="ac-search-box"><Search size={13} style={{ color: 'var(--ac-text-muted)' }} /><input placeholder="Search tickets..." /></div>
          </div>
        </div>
        <div>
          {mockAdminTickets.map(t => (
            <div key={t.id} className="ac-ticket-row">
              <div className="ac-ticket-type-icon" style={{
                background: t.type === 'bug' ? '#FEE2E2' : t.type === 'feature' ? '#DBEAFE' : t.type === 'complaint' ? '#FEF3C7' : '#EDE9FE',
                color: t.type === 'bug' ? '#EF4444' : t.type === 'feature' ? '#3B82F6' : t.type === 'complaint' ? '#D97706' : '#6D28D9'
              }}>
                {t.type === 'bug' ? <AlertTriangle size={14} /> : t.type === 'feature' ? <Star size={14} /> : t.type === 'complaint' ? <HeadphonesIcon size={14} /> : <HeadphonesIcon size={14} />}
              </div>
              <div className="ac-ticket-info">
                <div className="ac-ticket-subject">{t.subject}</div>
                <div className="ac-ticket-meta">{t.user} · {t.created} · Agent: {t.agent}</div>
              </div>
              <div className="ac-ticket-right">
                <span className={`ac-badge ${t.priority === 'critical' ? 'flagged' : t.priority === 'high' ? 'pending' : 'inactive'}`}>{t.priority}</span>
                <Badge status={t.status} label={t.status.replace('_', ' ')} />
                <div className="ac-row-actions" style={{ opacity: 1 }}>
                  <button className="ac-action-btn"><Eye size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   AUDIT LOGS TAB
═══════════════════════════════════════════════════ */
function AuditLogsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="ac-page-header">
        <div><h1 className="ac-page-title">Audit Logs</h1><p className="ac-page-subtitle">Complete platform action history and security monitoring</p></div>
        <div className="ac-page-actions">
          <button className="ac-btn ac-btn-secondary"><Download size={14} />Export Logs</button>
          <button className="ac-btn ac-btn-secondary"><Filter size={14} />Filter</button>
        </div>
      </div>
      <div className="ac-table-wrapper">
        <div className="ac-table-header">
          <span className="ac-table-title">Recent Activity</span>
          <span className="ac-table-count">{mockAdminAuditLogs.length}</span>
          <div className="ac-table-controls">
            <div className="ac-search-box"><Search size={13} style={{ color: 'var(--ac-text-muted)' }} /><input placeholder="Search logs..." /></div>
          </div>
        </div>
        <div className="ac-audit-grid">
          {mockAdminAuditLogs.map(log => (
            <div key={log.id} className="ac-audit-row">
              <div className={`ac-audit-status-dot ${log.status}`} />
              <div className="ac-audit-who">{log.who}</div>
              <div className="ac-audit-action">{log.action}</div>
              <span className="ac-audit-module">{log.module}</span>
              <div className="ac-audit-ip">{log.ip}</div>
              <div className="ac-audit-date">{log.date}</div>
              <Badge status={log.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MODERATION TAB
═══════════════════════════════════════════════════ */
function ModerationTab() {
  const items = [
    { label: 'Flagged Jobs', count: 3, sub: '2 pending review', color: '#EF4444', bg: '#FEE2E2', icon: <AlertTriangle size={18} /> },
    { label: 'Fake Companies', count: 1, sub: 'Fraud detected', color: '#FF1744', bg: '#FFF0F2', icon: <Building size={18} /> },
    { label: 'Spam Recruiters', count: 2, sub: '1 suspended', color: '#F59E0B', bg: '#FEF3C7', icon: <Users size={18} /> },
    { label: 'Duplicate Accounts', count: 8, sub: 'Pending merge', color: '#D97706', bg: '#FEF3C7', icon: <Hash size={18} /> },
    { label: 'Reported Candidates', count: 5, sub: '2 under review', color: '#7C3AED', bg: '#EDE9FE', icon: <UserX size={18} /> },
    { label: 'AI Fraud Detections', count: 12, sub: 'New this week', color: '#0EA5E9', bg: '#E0F2FE', icon: <Shield size={18} /> },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="ac-page-header">
        <div><h1 className="ac-page-title">Moderation</h1><p className="ac-page-subtitle">Platform safety, fraud detection and content review</p></div>
        <div className="ac-page-actions">
          <button className="ac-btn ac-btn-danger"><AlertTriangle size={14} />Review All Flags</button>
        </div>
      </div>
      <div className="ac-mod-grid">
        {items.map((m, i) => (
          <div key={i} className="ac-mod-card">
            <div className="ac-mod-header">
              <div className="ac-mod-icon-wrap" style={{ background: m.bg, color: m.color }}>{m.icon}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="ac-btn ac-btn-xs ac-btn-success"><CheckCircle2 size={10} />Approve</button>
                <button className="ac-btn ac-btn-xs ac-btn-danger"><Ban size={10} />Remove</button>
              </div>
            </div>
            <div className="ac-mod-count" style={{ color: m.color }}>{m.count}</div>
            <div className="ac-mod-label">{m.label}</div>
            <div className="ac-mod-sub">{m.sub}</div>
          </div>
        ))}
      </div>
      <div className="ac-chart-card">
        <div className="ac-chart-title">Flagged Jobs — Pending Review</div>
        <div className="ac-chart-subtitle">Jobs requiring moderation action</div>
        {mockAdminJobs.filter(j => j.status === 'flagged' || j.approval === 'pending').map(j => (
          <div key={j.id} className="ac-list-item">
            <div style={{ width: 36, height: 36, background: '#FFF0F2', color: '#FF1744', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertTriangle size={16} /></div>
            <div className="ac-list-meta">
              <div className="ac-list-name">{j.title}</div>
              <div className="ac-list-sub">{j.company} · Posted: {j.posted}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="ac-btn ac-btn-xs ac-btn-success"><CheckCircle2 size={10} />Approve</button>
              <button className="ac-btn ac-btn-xs ac-btn-danger"><XCircle size={10} />Reject</button>
              <button className="ac-btn ac-btn-xs ac-btn-secondary"><Eye size={10} />View</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   REPORTS TAB
═══════════════════════════════════════════════════ */
function ReportsTab() {
  const reports = [
    { title: 'Revenue Report — July 2024', desc: 'MRR breakdown, plan distribution, refunds and growth metrics', type: 'PDF', size: '2.4MB', date: 'Jul 15, 2024' },
    { title: 'Recruitment Activity Report', desc: 'Jobs posted, applications received, hires and conversion rates', type: 'PDF', size: '3.8MB', date: 'Jul 15, 2024' },
    { title: 'Platform Growth Report Q2 2024', desc: 'User registrations, company onboarding and engagement trends', type: 'Excel', size: '1.2MB', date: 'Jul 01, 2024' },
    { title: 'AI Usage & Cost Analysis', desc: 'Token consumption, feature usage and monthly cost breakdown', type: 'PDF', size: '1.8MB', date: 'Jul 15, 2024' },
    { title: 'Country-wise Hiring Report', desc: 'Geographic distribution of jobs, companies and candidates', type: 'Excel', size: '4.1MB', date: 'Jul 10, 2024' },
    { title: 'Top Recruiters Performance', desc: 'Rankings, hire rates, AI usage and response time analysis', type: 'PDF', size: '0.9MB', date: 'Jul 12, 2024' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="ac-page-header">
        <div><h1 className="ac-page-title">Reports & Analytics</h1><p className="ac-page-subtitle">Generate and export comprehensive platform reports</p></div>
        <div className="ac-page-actions">
          <button className="ac-btn ac-btn-primary"><Plus size={14} />Generate Report</button>
        </div>
      </div>
      <div className="ac-two-col">
        <div className="ac-chart-card">
          <div className="ac-chart-title">Platform Growth Overview</div>
          <div className="ac-chart-subtitle">Key metrics at a glance</div>
          {[
            { label: 'Companies Added This Month', value: 47, max: 80 },
            { label: 'Recruiter Activation Rate', value: 84, max: 100 },
            { label: 'Candidate Verification Rate', value: 62, max: 100 },
            { label: 'Job Fill Rate', value: 71, max: 100 },
            { label: 'Subscription Renewal Rate', value: 89, max: 100 },
          ].map((m, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12.5, color: 'var(--ac-text-secondary)', fontWeight: 500 }}>{m.label}</span>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--ac-text-primary)' }}>{m.value}{m.max === 100 ? '%' : ''}</span>
              </div>
              <div className="ac-mini-bar-track" style={{ height: 6 }}>
                <div className="ac-mini-bar-fill" style={{ width: `${(m.value / m.max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="ac-chart-card">
          <div className="ac-chart-title">Applications Trend</div>
          <div className="ac-chart-subtitle">Daily applications — last 14 days</div>
          <LineChart data={[840, 920, 1100, 980, 1340, 1520, 1680, 1420, 1840, 2100, 1920, 2240, 1842, 2020]} color="#FF1744" height={120} />
        </div>
      </div>
      <div className="ac-table-wrapper">
        <div className="ac-table-header">
          <span className="ac-table-title">Available Reports</span>
          <span className="ac-table-count">{reports.length}</span>
        </div>
        <div style={{ padding: '0 24px' }}>
          {reports.map((r, i) => (
            <div key={i} className="ac-export-row">
              <div style={{ width: 40, height: 40, background: r.type === 'PDF' ? '#FEE2E2' : '#DBEAFE', color: r.type === 'PDF' ? '#EF4444' : '#3B82F6', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 11 }}>{r.type}</div>
              <div className="ac-export-info">
                <div className="ac-export-title">{r.title}</div>
                <div className="ac-export-desc">{r.desc} · {r.size} · {r.date}</div>
              </div>
              <button className="ac-btn ac-btn-secondary ac-btn-sm"><Download size={12} />Download</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PLATFORM SETTINGS TAB
═══════════════════════════════════════════════════ */
function SettingsTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="ac-page-header">
        <div><h1 className="ac-page-title">Platform Settings</h1><p className="ac-page-subtitle">Global configuration, integrations and system preferences</p></div>
        <div className="ac-page-actions">
          <button className="ac-btn ac-btn-primary">Save Changes</button>
        </div>
      </div>
      <div className="ac-two-col">
        {[
          { title: 'General Settings', items: ['Platform Name', 'Support Email', 'Admin Timezone', 'Maintenance Mode', 'Registration Open'] },
          { title: 'Email & Notifications', items: ['SMTP Configuration', 'Email Templates', 'Notification Rules', 'Digest Frequency', 'Alert Thresholds'] },
          { title: 'Payment Gateway', items: ['Stripe API Keys', 'Razorpay Setup', 'PayPal Integration', 'Tax Configuration', 'Currency Settings'] },
          { title: 'AI Configuration', items: ['AI Provider (OpenAI)', 'API Key', 'Rate Limits', 'Cost Alerts', 'Feature Toggles'] },
          { title: 'Security', items: ['2FA Enforcement', 'Session Timeout', 'IP Allowlist', 'Failed Login Limits', 'Audit Log Retention'] },
          { title: 'Storage & Files', items: ['S3 Bucket Config', 'Max File Size', 'Allowed Types', 'CDN Settings', 'Storage Quota'] },
        ].map((section, i) => (
          <div key={i} className="ac-card ac-card-padded">
            <div className="ac-chart-title" style={{ marginBottom: 16 }}>{section.title}</div>
            {section.items.map((item, j) => (
              <div key={j} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: j < section.items.length - 1 ? '1px solid var(--ac-border)' : 'none' }}>
                <span style={{ fontSize: 13, color: 'var(--ac-text-secondary)', fontWeight: 500 }}>{item}</span>
                <button className="ac-btn ac-btn-secondary ac-btn-xs">Configure</button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ROLES & PERMISSIONS TAB
═══════════════════════════════════════════════════ */
function RolesTab() {
  const roles = [
    { name: 'Super Admin', users: 2, permissions: 'Full platform access', color: '#6D28D9' },
    { name: 'Operations Admin', users: 5, permissions: 'Companies, Jobs, Users, Reports', color: '#3B82F6' },
    { name: 'Finance Admin', users: 3, permissions: 'Payments, Subscriptions, Invoices', color: '#10B981' },
    { name: 'Support Agent', users: 8, permissions: 'Support Center, Tickets, Read-only', color: '#F59E0B' },
    { name: 'Content Moderator', users: 4, permissions: 'Moderation, Jobs Review, Flagging', color: '#EF4444' },
  ];
  const modules = ['Companies', 'Employers', 'Recruiters', 'Candidates', 'Jobs', 'Payments', 'AI Usage', 'Support', 'Settings', 'Audit'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="ac-page-header">
        <div><h1 className="ac-page-title">Roles & Permissions</h1><p className="ac-page-subtitle">Admin access control and feature permissions matrix</p></div>
        <div className="ac-page-actions">
          <button className="ac-btn ac-btn-primary"><Plus size={14} />Create Role</button>
        </div>
      </div>
      <div className="ac-table-wrapper">
        <div className="ac-table-header"><span className="ac-table-title">Admin Roles</span></div>
        <table className="ac-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Users</th>
              <th>Permissions</th>
              {modules.slice(0, 5).map(m => <th key={m}>{m}</th>)}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((r, i) => (
              <tr key={i}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                    <span style={{ fontWeight: 700, color: 'var(--ac-text-primary)', fontSize: 13 }}>{r.name}</span>
                  </div>
                </td>
                <td style={{ fontWeight: 700 }}>{r.users}</td>
                <td style={{ fontSize: 12, color: 'var(--ac-text-muted)' }}>{r.permissions}</td>
                {modules.slice(0, 5).map(m => (
                  <td key={m}>
                    {(r.name === 'Super Admin' || (r.name === 'Operations Admin' && ['Companies','Jobs','Employers','Recruiters'].includes(m))) ?
                      <CheckCircle2 size={14} style={{ color: 'var(--ac-success)' }} /> :
                      (r.name === 'Finance Admin' && m === 'Payments') ?
                      <CheckCircle2 size={14} style={{ color: 'var(--ac-success)' }} /> :
                      <XCircle size={14} style={{ color: 'var(--ac-text-xmuted)' }} />}
                  </td>
                ))}
                <td><div className="ac-row-actions" style={{ opacity: 1 }}><button className="ac-action-btn"><Edit2 size={13} /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   NAV CONFIG
═══════════════════════════════════════════════════ */
const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ]
  },
  {
    label: 'Platform Users',
    items: [
      { id: 'companies', label: 'Companies', icon: Building2, badge: '842' },
      { id: 'employers', label: 'Employers', icon: Briefcase, badge: '3.2K' },
      { id: 'recruiters', label: 'Recruiters', icon: Users },
      { id: 'candidates', label: 'Candidates', icon: UserPlus },
    ]
  },
  {
    label: 'Recruitment',
    items: [
      { id: 'jobs', label: 'Jobs', icon: FileText, badge: '3', badgeType: 'danger' },
      { id: 'applications', label: 'Applications', icon: Target },
    ]
  },
  {
    label: 'Revenue',
    items: [
      { id: 'subscriptions', label: 'Subscriptions', icon: Package },
      { id: 'payments', label: 'Payments', icon: CreditCard },
    ]
  },
  {
    label: 'Intelligence',
    items: [
      { id: 'ai-usage', label: 'AI Usage', icon: Zap },
      { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    ]
  },
  {
    label: 'Operations',
    items: [
      { id: 'support', label: 'Support Center', icon: HeadphonesIcon, badge: '4', badgeType: 'danger' },
      { id: 'announcements', label: 'Announcements', icon: Megaphone },
      { id: 'moderation', label: 'Moderation', icon: AlertTriangle, badge: '3', badgeType: 'danger' },
    ]
  },
  {
    label: 'Libraries',
    items: [
      { id: 'countries', label: 'Countries', icon: Globe },
      { id: 'industries', label: 'Industries', icon: Factory },
      { id: 'skills', label: 'Skills Library', icon: BookOpen },
    ]
  },
  {
    label: 'Administration',
    items: [
      { id: 'settings', label: 'Platform Settings', icon: Settings },
      { id: 'roles', label: 'Roles & Permissions', icon: Shield },
      { id: 'audit', label: 'Audit Logs', icon: ScrollText },
    ]
  },
];

/* ═══════════════════════════════════════════════════
   MAIN ADMIN CONSOLE
═══════════════════════════════════════════════════ */
export default function AdminConsole() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAI, setShowAI] = useState(false);

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard':     return <DashboardTab />;
      case 'companies':     return <CompaniesTab />;
      case 'recruiters':    return <RecruitersTab />;
      case 'candidates':    return <CandidatesTab />;
      case 'jobs':          return <JobsAdminTab />;
      case 'subscriptions': return <SubscriptionsTab />;
      case 'payments':      return <PaymentsTab />;
      case 'ai-usage':      return <AIUsageTab />;
      case 'support':       return <SupportTab />;
      case 'audit':         return <AuditLogsTab />;
      case 'moderation':    return <ModerationTab />;
      case 'reports':       return <ReportsTab />;
      case 'settings':      return <SettingsTab />;
      case 'roles':         return <RolesTab />;
      case 'applications':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="ac-page-header">
              <div><h1 className="ac-page-title">Applications</h1><p className="ac-page-subtitle">All applications across the platform</p></div>
            </div>
            <div className="ac-table-wrapper">
              <table className="ac-table">
                <thead><tr><th>Candidate</th><th>Job</th><th>Company</th><th>Recruiter</th><th>Stage</th><th>Interview</th><th>Offer</th><th>Joined</th><th>Date</th></tr></thead>
                <tbody>
                  {mockAdminApplications.map(a => (
                    <tr key={a.id}>
                      <td><div className="ac-user-cell"><img src={a.candidateAvatar} alt={a.candidate} className="ac-table-avatar" /><div className="ac-user-name">{a.candidate}</div></div></td>
                      <td style={{ fontSize: 12.5, fontWeight: 500 }}>{a.job}</td>
                      <td style={{ fontSize: 12.5 }}>{a.company}</td>
                      <td style={{ fontSize: 12.5, color: 'var(--ac-text-muted)' }}>{a.recruiter}</td>
                      <td><Badge status={a.stage} /></td>
                      <td><Badge status={a.interviewStatus} label={a.interviewStatus.replace('_', ' ')} /></td>
                      <td><Badge status={a.offerStatus === 'none' ? 'inactive' : a.offerStatus} label={a.offerStatus === 'none' ? 'N/A' : a.offerStatus} /></td>
                      <td>{a.joined ? <CheckCircle2 size={14} style={{ color: 'var(--ac-success)' }} /> : <span style={{ color: 'var(--ac-text-muted)', fontSize: 12 }}>No</span>}</td>
                      <td style={{ fontSize: 12, color: 'var(--ac-text-muted)' }}>{a.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h1 className="ac-page-title" style={{ textTransform: 'capitalize' }}>{activeTab.replace('-', ' ')}</h1>
            <div className="ac-card ac-card-padded ac-empty-state">
              <Layers size={40} style={{ color: 'var(--ac-text-xmuted)' }} />
              <h4>Section under construction</h4>
              <p>This section is being built. Check back soon.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="admin-console">
      {/* ── Sidebar ── */}
      <aside className="ac-sidebar">
        <div className="ac-sidebar-brand">
          <div className="ac-brand-icon">
            <span style={{ fontSize: 14, fontWeight: 900, color: 'white' }}>G</span>
          </div>
          <div className="ac-brand-text">
            <span className="ac-brand-name">GetWorxs</span>
            <span className="ac-brand-sub">Platform Console</span>
          </div>
        </div>

        <nav className="ac-sidebar-nav">
          {NAV_SECTIONS.map(section => (
            <div key={section.label}>
              <div className="ac-nav-section-label">{section.label}</div>
              {section.items.map(item => (
                <div
                  key={item.id}
                  className={`ac-nav-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <div className="icon-wrap"><item.icon size={15} /></div>
                  <span className="ac-nav-label">{item.label}</span>
                  {item.badge && (
                    <span className={`ac-nav-badge ${(item as any).badgeType === 'danger' ? '' : 'orange'}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </nav>

        <div className="ac-sidebar-footer">
          <div className="ac-admin-pill">
            <div className="ac-admin-avatar">SA</div>
            <div className="ac-admin-info">
              <div className="ac-admin-name">Super Admin</div>
              <div className="ac-admin-role">admin@getworxs.com</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Top Bar ── */}
      <header className="ac-topbar">
        <div className="ac-topbar-search">
          <Search size={14} className="search-icon" />
          <input placeholder="Search companies, users, jobs, invoices..." />
        </div>

        <div className="ac-topbar-right">
          <div className="ac-health-pill" onClick={() => setActiveTab('dashboard')}>
            <div className="ac-health-dot" />
            All Systems Operational
          </div>

          <button className="ac-topbar-btn" data-tooltip="Notifications">
            <Bell size={16} />
            <div className="ac-notif-dot" />
          </button>

          <button className="ac-topbar-btn" data-tooltip="Quick Actions">
            <Zap size={16} />
          </button>

          <button className="ac-topbar-btn" data-tooltip="Refresh">
            <RefreshCw size={15} />
          </button>

          <button className="ac-topbar-ai-btn" onClick={() => setShowAI(true)}>
            <Bot size={14} />
            AI Copilot
          </button>

          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #6D28D9, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white', cursor: 'pointer' }}>
            SA
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="ac-content">
        {renderTab()}
      </main>

      {/* ── AI Assistant ── */}
      {showAI && <AIAssistant onClose={() => setShowAI(false)} />}
    </div>
  );
}
