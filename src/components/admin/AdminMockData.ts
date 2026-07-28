// GetWorxs Platform Console — Mock Data

export interface AdminCompany {
  id: string;
  name: string;
  logo: string;
  industry: string;
  country: string;
  plan: 'starter' | 'growth' | 'enterprise' | 'trial';
  recruiters: number;
  jobs: number;
  applications: number;
  status: 'active' | 'suspended' | 'pending' | 'flagged';
  verified: boolean;
  revenue: number;
  created: string;
  email: string;
  website: string;
}

export interface AdminEmployer {
  id: string;
  name: string;
  avatar: string;
  company: string;
  role: string;
  email: string;
  status: 'active' | 'disabled' | 'pending';
  lastLogin: string;
  country: string;
}

export interface AdminRecruiter {
  id: string;
  name: string;
  avatar: string;
  company: string;
  jobsCreated: number;
  hired: number;
  interviewRate: number;
  offerRate: number;
  aiUsage: number;
  status: 'active' | 'inactive' | 'suspended';
  performance: 'excellent' | 'good' | 'average' | 'poor';
}

export interface AdminCandidate {
  id: string;
  name: string;
  avatar: string;
  location: string;
  experience: string;
  skills: string[];
  verified: boolean;
  status: 'active' | 'inactive' | 'banned';
  applications: number;
  resume: boolean;
}

export interface AdminJob {
  id: string;
  title: string;
  company: string;
  recruiter: string;
  applications: number;
  status: 'active' | 'draft' | 'pending' | 'closed' | 'expired' | 'flagged';
  approval: 'approved' | 'pending' | 'rejected';
  views: number;
  posted: string;
  location: string;
}

export interface AdminApplication {
  id: string;
  candidate: string;
  candidateAvatar: string;
  job: string;
  company: string;
  recruiter: string;
  stage: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  interviewStatus: 'pending' | 'scheduled' | 'done' | 'none';
  offerStatus: 'none' | 'sent' | 'accepted' | 'declined';
  joined: boolean;
  date: string;
}

export interface AdminTransaction {
  id: string;
  company: string;
  amount: number;
  plan: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  method: string;
  date: string;
  invoice: string;
}

export interface AdminTicket {
  id: string;
  subject: string;
  user: string;
  type: 'support' | 'bug' | 'feature' | 'complaint';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created: string;
  agent: string;
}

export interface AdminAuditLog {
  id: string;
  who: string;
  action: string;
  module: string;
  date: string;
  ip: string;
  status: 'success' | 'failed' | 'warning';
}

export const mockAdminCompanies: AdminCompany[] = [
  { id: 'c1', name: 'TechNova Solutions', logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=80&auto=format&fit=crop', industry: 'Software & Technology', country: 'United States', plan: 'enterprise', recruiters: 28, jobs: 142, applications: 3840, status: 'active', verified: true, revenue: 8400, created: '2023-03-15', email: 'hr@technova.com', website: 'technova.com' },
  { id: 'c2', name: 'GlobalFinance Corp', logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=80&auto=format&fit=crop', industry: 'Finance & Banking', country: 'United Kingdom', plan: 'enterprise', recruiters: 45, jobs: 89, applications: 5210, status: 'active', verified: true, revenue: 12600, created: '2022-11-02', email: 'talent@globalfinance.co.uk', website: 'globalfinance.co.uk' },
  { id: 'c3', name: 'MediCare Health Systems', logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=80&auto=format&fit=crop', industry: 'Healthcare', country: 'Canada', plan: 'growth', recruiters: 12, jobs: 67, applications: 1920, status: 'active', verified: true, revenue: 2800, created: '2023-07-22', email: 'careers@medicare.ca', website: 'medicare.ca' },
  { id: 'c4', name: 'EduSpark Technologies', logo: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=80&auto=format&fit=crop', industry: 'EdTech', country: 'India', plan: 'growth', recruiters: 8, jobs: 34, applications: 890, status: 'active', verified: true, revenue: 1400, created: '2024-01-10', email: 'hr@eduspark.in', website: 'eduspark.in' },
  { id: 'c5', name: 'Stellar Logistics', logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=80&auto=format&fit=crop', industry: 'Logistics', country: 'Germany', plan: 'starter', recruiters: 4, jobs: 18, applications: 340, status: 'active', verified: false, revenue: 490, created: '2024-04-05', email: 'jobs@stellar-logistics.de', website: 'stellar-logistics.de' },
  { id: 'c6', name: 'SkyBuild Construction', logo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=80&auto=format&fit=crop', industry: 'Construction', country: 'UAE', plan: 'growth', recruiters: 9, jobs: 28, applications: 560, status: 'suspended', verified: true, revenue: 1960, created: '2023-09-18', email: 'recruitment@skybuild.ae', website: 'skybuild.ae' },
  { id: 'c7', name: 'PixelForge Studios', logo: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=80&auto=format&fit=crop', industry: 'Media & Gaming', country: 'Australia', plan: 'starter', recruiters: 3, jobs: 12, applications: 220, status: 'pending', verified: false, revenue: 0, created: '2024-06-30', email: 'hello@pixelforge.com.au', website: 'pixelforge.com.au' },
  { id: 'c8', name: 'RetailPrime Group', logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=80&auto=format&fit=crop', industry: 'Retail', country: 'Singapore', plan: 'enterprise', recruiters: 31, jobs: 98, applications: 2870, status: 'active', verified: true, revenue: 9800, created: '2022-06-14', email: 'hr@retailprime.sg', website: 'retailprime.sg' },
  { id: 'c9', name: 'AutoDrive Technologies', logo: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=80&auto=format&fit=crop', industry: 'Automotive', country: 'Japan', plan: 'growth', recruiters: 14, jobs: 44, applications: 1100, status: 'active', verified: true, revenue: 3360, created: '2023-05-11', email: 'careers@autodrive.jp', website: 'autodrive.jp' },
  { id: 'c10', name: 'CleanEnergy Systems', logo: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=80&auto=format&fit=crop', industry: 'Energy & Utilities', country: 'Netherlands', plan: 'trial', recruiters: 2, jobs: 6, applications: 88, status: 'active', verified: false, revenue: 0, created: '2024-07-01', email: 'jobs@cleanenergy.nl', website: 'cleanenergy.nl' },
  { id: 'c11', name: 'PharmaCure Labs', logo: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=80&auto=format&fit=crop', industry: 'Pharmaceuticals', country: 'Switzerland', plan: 'enterprise', recruiters: 22, jobs: 77, applications: 2100, status: 'active', verified: true, revenue: 11200, created: '2021-08-22', email: 'talent@pharmacure.ch', website: 'pharmacure.ch' },
  { id: 'c12', name: 'DataMatrix Analytics', logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=80&auto=format&fit=crop', industry: 'Data & AI', country: 'France', plan: 'growth', recruiters: 7, jobs: 29, applications: 740, status: 'flagged', verified: true, revenue: 1680, created: '2023-12-03', email: 'hr@datamatrix.fr', website: 'datamatrix.fr' },
];

export const mockAdminRecruiters: AdminRecruiter[] = [
  { id: 'r1', name: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop', company: 'TechNova Solutions', jobsCreated: 48, hired: 32, interviewRate: 78, offerRate: 62, aiUsage: 1240, status: 'active', performance: 'excellent' },
  { id: 'r2', name: 'Marcus Williams', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop', company: 'GlobalFinance Corp', jobsCreated: 62, hired: 41, interviewRate: 84, offerRate: 71, aiUsage: 2180, status: 'active', performance: 'excellent' },
  { id: 'r3', name: 'Priya Patel', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&auto=format&fit=crop', company: 'MediCare Health', jobsCreated: 29, hired: 18, interviewRate: 65, offerRate: 48, aiUsage: 890, status: 'active', performance: 'good' },
  { id: 'r4', name: 'James O\'Brien', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&auto=format&fit=crop', company: 'RetailPrime Group', jobsCreated: 55, hired: 27, interviewRate: 72, offerRate: 53, aiUsage: 1640, status: 'active', performance: 'good' },
  { id: 'r5', name: 'Yuki Tanaka', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop', company: 'AutoDrive Technologies', jobsCreated: 21, hired: 8, interviewRate: 44, offerRate: 30, aiUsage: 420, status: 'inactive', performance: 'average' },
  { id: 'r6', name: 'Elena Rossi', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&auto=format&fit=crop', company: 'PharmaCure Labs', jobsCreated: 38, hired: 24, interviewRate: 71, offerRate: 58, aiUsage: 1120, status: 'active', performance: 'good' },
  { id: 'r7', name: 'Raj Kumar', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&fit=crop', company: 'EduSpark Technologies', jobsCreated: 15, hired: 4, interviewRate: 38, offerRate: 22, aiUsage: 210, status: 'suspended', performance: 'poor' },
];

export const mockAdminCandidates: AdminCandidate[] = [
  { id: 'ca1', name: 'Alex Morgan', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&auto=format&fit=crop', location: 'San Francisco, US', experience: '6 years', skills: ['React', 'TypeScript', 'Node.js'], verified: true, status: 'active', applications: 8, resume: true },
  { id: 'ca2', name: 'Fatima Al-Rashid', avatar: 'https://images.unsplash.com/photo-1546961342-ea5f62d5a27b?w=80&auto=format&fit=crop', location: 'Dubai, UAE', experience: '4 years', skills: ['Python', 'ML', 'TensorFlow'], verified: true, status: 'active', applications: 12, resume: true },
  { id: 'ca3', name: 'Lucas Fernandez', avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=80&auto=format&fit=crop', location: 'São Paulo, BR', experience: '2 years', skills: ['Java', 'Spring Boot'], verified: false, status: 'active', applications: 5, resume: true },
  { id: 'ca4', name: 'Sophie Müller', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop', location: 'Berlin, DE', experience: '8 years', skills: ['Product', 'Agile', 'UX'], verified: true, status: 'active', applications: 3, resume: true },
  { id: 'ca5', name: 'Kevin Zhang', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop', location: 'Shanghai, CN', experience: '5 years', skills: ['Go', 'Kubernetes', 'AWS'], verified: true, status: 'inactive', applications: 0, resume: false },
  { id: 'ca6', name: 'Nia Johnson', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&auto=format&fit=crop', location: 'Lagos, NG', experience: '3 years', skills: ['Vue', 'Laravel', 'MySQL'], verified: false, status: 'active', applications: 7, resume: true },
  { id: 'ca7', name: 'Omar Khalid', avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=80&auto=format&fit=crop', location: 'Cairo, EG', experience: '1 year', skills: ['React Native', 'Firebase'], verified: false, status: 'banned', applications: 2, resume: true },
];

export const mockAdminJobs: AdminJob[] = [
  { id: 'j1', title: 'Senior Full Stack Engineer', company: 'TechNova Solutions', recruiter: 'Sarah Chen', applications: 284, status: 'active', approval: 'approved', views: 8420, posted: '2024-07-10', location: 'Remote (US)' },
  { id: 'j2', title: 'VP of Engineering', company: 'GlobalFinance Corp', recruiter: 'Marcus Williams', applications: 92, status: 'active', approval: 'approved', views: 4210, posted: '2024-07-12', location: 'London, UK' },
  { id: 'j3', title: 'Clinical Data Analyst', company: 'MediCare Health', recruiter: 'Priya Patel', applications: 118, status: 'active', approval: 'approved', views: 3100, posted: '2024-07-08', location: 'Toronto, CA' },
  { id: 'j4', title: 'ML Research Scientist', company: 'DataMatrix Analytics', recruiter: 'Pierre Dubois', applications: 47, status: 'flagged', approval: 'pending', views: 1890, posted: '2024-07-14', location: 'Paris, FR' },
  { id: 'j5', title: 'Store Operations Manager', company: 'RetailPrime Group', recruiter: 'James O\'Brien', applications: 231, status: 'active', approval: 'approved', views: 5600, posted: '2024-07-05', location: 'Singapore' },
  { id: 'j6', title: 'Android Developer', company: 'EduSpark Technologies', recruiter: 'Raj Kumar', applications: 62, status: 'draft', approval: 'pending', views: 0, posted: '2024-07-15', location: 'Bangalore, IN' },
  { id: 'j7', title: 'Head of Pharmaceutical Research', company: 'PharmaCure Labs', recruiter: 'Elena Rossi', applications: 38, status: 'active', approval: 'approved', views: 2840, posted: '2024-07-01', location: 'Zurich, CH' },
  { id: 'j8', title: 'Supply Chain Lead', company: 'Stellar Logistics', recruiter: 'Hans Weber', applications: 74, status: 'expired', approval: 'approved', views: 1920, posted: '2024-05-20', location: 'Frankfurt, DE' },
  { id: 'j9', title: 'Site Engineer', company: 'SkyBuild Construction', recruiter: 'Ahmed Hassan', applications: 120, status: 'closed', approval: 'approved', views: 3300, posted: '2024-06-10', location: 'Dubai, UAE' },
  { id: 'j10', title: 'EV Systems Architect', company: 'AutoDrive Technologies', recruiter: 'Yuki Tanaka', applications: 55, status: 'pending', approval: 'pending', views: 1100, posted: '2024-07-13', location: 'Tokyo, JP' },
];

export const mockAdminApplications: AdminApplication[] = [
  { id: 'ap1', candidate: 'Alex Morgan', candidateAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&auto=format&fit=crop', job: 'Senior Full Stack Engineer', company: 'TechNova Solutions', recruiter: 'Sarah Chen', stage: 'offer', interviewStatus: 'done', offerStatus: 'accepted', joined: false, date: '2024-07-14' },
  { id: 'ap2', candidate: 'Sophie Müller', candidateAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&auto=format&fit=crop', job: 'VP of Engineering', company: 'GlobalFinance Corp', recruiter: 'Marcus Williams', stage: 'interview', interviewStatus: 'scheduled', offerStatus: 'none', joined: false, date: '2024-07-12' },
  { id: 'ap3', candidate: 'Fatima Al-Rashid', candidateAvatar: 'https://images.unsplash.com/photo-1546961342-ea5f62d5a27b?w=80&auto=format&fit=crop', job: 'ML Research Scientist', company: 'DataMatrix Analytics', recruiter: 'Pierre Dubois', stage: 'screening', interviewStatus: 'pending', offerStatus: 'none', joined: false, date: '2024-07-15' },
  { id: 'ap4', candidate: 'Lucas Fernandez', candidateAvatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=80&auto=format&fit=crop', job: 'Android Developer', company: 'EduSpark Technologies', recruiter: 'Raj Kumar', stage: 'applied', interviewStatus: 'none', offerStatus: 'none', joined: false, date: '2024-07-15' },
  { id: 'ap5', candidate: 'Kevin Zhang', candidateAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&auto=format&fit=crop', job: 'EV Systems Architect', company: 'AutoDrive Technologies', recruiter: 'Yuki Tanaka', stage: 'hired', interviewStatus: 'done', offerStatus: 'accepted', joined: true, date: '2024-07-01' },
  { id: 'ap6', candidate: 'Nia Johnson', candidateAvatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&auto=format&fit=crop', job: 'Store Operations Manager', company: 'RetailPrime Group', recruiter: 'James O\'Brien', stage: 'rejected', interviewStatus: 'done', offerStatus: 'none', joined: false, date: '2024-07-09' },
];

export const mockAdminTransactions: AdminTransaction[] = [
  { id: 'tx1', company: 'TechNova Solutions', amount: 8400, plan: 'Enterprise', status: 'paid', method: 'Stripe', date: '2024-07-01', invoice: 'INV-2024-0711' },
  { id: 'tx2', company: 'GlobalFinance Corp', amount: 12600, plan: 'Enterprise', status: 'paid', method: 'Wire Transfer', date: '2024-07-01', invoice: 'INV-2024-0712' },
  { id: 'tx3', company: 'RetailPrime Group', amount: 9800, plan: 'Enterprise', status: 'paid', method: 'Stripe', date: '2024-07-01', invoice: 'INV-2024-0713' },
  { id: 'tx4', company: 'PharmaCure Labs', amount: 11200, plan: 'Enterprise', status: 'paid', method: 'Stripe', date: '2024-07-01', invoice: 'INV-2024-0714' },
  { id: 'tx5', company: 'MediCare Health', amount: 2800, plan: 'Growth', status: 'paid', method: 'PayPal', date: '2024-07-03', invoice: 'INV-2024-0715' },
  { id: 'tx6', company: 'EduSpark Technologies', amount: 1400, plan: 'Growth', status: 'pending', method: 'Stripe', date: '2024-07-10', invoice: 'INV-2024-0716' },
  { id: 'tx7', company: 'AutoDrive Technologies', amount: 3360, plan: 'Growth', status: 'paid', method: 'Stripe', date: '2024-07-05', invoice: 'INV-2024-0717' },
  { id: 'tx8', company: 'DataMatrix Analytics', amount: 1680, plan: 'Growth', status: 'failed', method: 'Stripe', date: '2024-07-08', invoice: 'INV-2024-0718' },
  { id: 'tx9', company: 'Stellar Logistics', amount: 490, plan: 'Starter', status: 'paid', method: 'PayPal', date: '2024-07-02', invoice: 'INV-2024-0719' },
  { id: 'tx10', company: 'SkyBuild Construction', amount: 1960, plan: 'Growth', status: 'refunded', method: 'Stripe', date: '2024-06-15', invoice: 'INV-2024-0720' },
];

export const mockAdminTickets: AdminTicket[] = [
  { id: 'tk1', subject: 'Unable to verify company documents', user: 'TechNova Solutions', type: 'support', priority: 'high', status: 'in_progress', created: '2024-07-14', agent: 'Emma Wilson' },
  { id: 'tk2', subject: 'AI Job Description Generator not working', user: 'Marcus Williams', type: 'bug', priority: 'critical', status: 'open', created: '2024-07-15', agent: 'Unassigned' },
  { id: 'tk3', subject: 'Request: Bulk candidate import via CSV', user: 'RetailPrime Group', type: 'feature', priority: 'medium', status: 'open', created: '2024-07-13', agent: 'Unassigned' },
  { id: 'tk4', subject: 'Payment deducted but subscription not activated', user: 'EduSpark Technologies', type: 'complaint', priority: 'critical', status: 'in_progress', created: '2024-07-15', agent: 'James Park' },
  { id: 'tk5', subject: 'Candidate profile showing incorrect experience', user: 'Priya Patel', type: 'bug', priority: 'medium', status: 'resolved', created: '2024-07-10', agent: 'Emma Wilson' },
  { id: 'tk6', subject: 'Need dedicated account manager', user: 'PharmaCure Labs', type: 'support', priority: 'low', status: 'closed', created: '2024-07-08', agent: 'James Park' },
  { id: 'tk7', subject: 'Interview scheduling email not sending', user: 'GlobalFinance Corp', type: 'bug', priority: 'high', status: 'open', created: '2024-07-15', agent: 'Unassigned' },
];

export const mockAdminAuditLogs: AdminAuditLog[] = [
  { id: 'al1', who: 'admin@getworxs.com', action: 'Suspended company account', module: 'Companies', date: '2024-07-15 14:32:10', ip: '192.168.1.102', status: 'success' },
  { id: 'al2', who: 'ops@getworxs.com', action: 'Approved job listing', module: 'Jobs', date: '2024-07-15 14:28:45', ip: '192.168.1.105', status: 'success' },
  { id: 'al3', who: 'admin@getworxs.com', action: 'Reset employer password', module: 'Employers', date: '2024-07-15 14:15:22', ip: '192.168.1.102', status: 'success' },
  { id: 'al4', who: 'support@getworxs.com', action: 'Attempted bulk delete candidates', module: 'Candidates', date: '2024-07-15 13:58:11', ip: '10.0.0.44', status: 'failed' },
  { id: 'al5', who: 'admin@getworxs.com', action: 'Updated subscription plan pricing', module: 'Subscriptions', date: '2024-07-15 13:40:00', ip: '192.168.1.102', status: 'success' },
  { id: 'al6', who: 'ops@getworxs.com', action: 'Flagged job for review', module: 'Moderation', date: '2024-07-15 13:21:34', ip: '192.168.1.105', status: 'warning' },
  { id: 'al7', who: 'admin@getworxs.com', action: 'Exported revenue report', module: 'Reports', date: '2024-07-15 12:55:18', ip: '192.168.1.102', status: 'success' },
  { id: 'al8', who: 'unknown', action: 'Failed login attempt (3x)', module: 'Auth', date: '2024-07-15 12:30:00', ip: '45.33.32.156', status: 'failed' },
];

export const revenueChartData = [
  { month: 'Jan', revenue: 42000, subscriptions: 180 },
  { month: 'Feb', revenue: 48500, subscriptions: 198 },
  { month: 'Mar', revenue: 51200, subscriptions: 214 },
  { month: 'Apr', revenue: 58700, subscriptions: 231 },
  { month: 'May', revenue: 63400, subscriptions: 248 },
  { month: 'Jun', revenue: 71800, subscriptions: 267 },
  { month: 'Jul', revenue: 79200, subscriptions: 284 },
];

export const registrationsChartData = [
  { month: 'Jan', companies: 28, recruiters: 142, candidates: 1840 },
  { month: 'Feb', companies: 34, recruiters: 168, candidates: 2210 },
  { month: 'Mar', companies: 41, recruiters: 195, candidates: 2680 },
  { month: 'Apr', companies: 38, recruiters: 221, candidates: 3140 },
  { month: 'May', companies: 52, recruiters: 258, candidates: 3820 },
  { month: 'Jun', companies: 61, recruiters: 289, candidates: 4410 },
  { month: 'Jul', companies: 47, recruiters: 312, candidates: 5180 },
];

export const aiUsageData = [
  { label: 'Resume Reviews', count: 48210, cost: 1928, icon: '📄' },
  { label: 'Resume Parsing', count: 62840, cost: 2513, icon: '🔍' },
  { label: 'JD Generation', count: 18430, cost: 1474, icon: '✍️' },
  { label: 'Candidate Matching', count: 29110, cost: 2911, icon: '🎯' },
  { label: 'Interview Questions', count: 12680, cost: 507, icon: '💬' },
  { label: 'Email Generation', count: 31540, cost: 631, icon: '📧' },
];

export const topCountries = [
  { country: 'United States', flag: '🇺🇸', companies: 142, jobs: 3840, percentage: 32 },
  { country: 'United Kingdom', flag: '🇬🇧', companies: 89, jobs: 2210, percentage: 19 },
  { country: 'India', flag: '🇮🇳', companies: 74, jobs: 1920, percentage: 16 },
  { country: 'Germany', flag: '🇩🇪', companies: 51, jobs: 1340, percentage: 11 },
  { country: 'Singapore', flag: '🇸🇬', companies: 38, jobs: 980, percentage: 8 },
  { country: 'UAE', flag: '🇦🇪', companies: 31, jobs: 810, percentage: 7 },
  { country: 'Canada', flag: '🇨🇦', companies: 28, jobs: 720, percentage: 6 },
  { country: 'Australia', flag: '🇦🇺', companies: 19, jobs: 490, percentage: 4 },
];

export const topIndustries = [
  { name: 'Software & Technology', jobs: 14820, percentage: 28, color: '#6D28D9' },
  { name: 'Finance & Banking', jobs: 9410, percentage: 18, color: '#7C3AED' },
  { name: 'Healthcare', jobs: 7280, percentage: 14, color: '#8B5CF6' },
  { name: 'Retail & E-Commerce', jobs: 5640, percentage: 11, color: '#A78BFA' },
  { name: 'Manufacturing', jobs: 4210, percentage: 8, color: '#C4B5FD' },
  { name: 'Education', jobs: 3180, percentage: 6, color: '#DDD6FE' },
];
