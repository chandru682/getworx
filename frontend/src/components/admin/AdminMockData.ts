// GetWorxs Platform Console — Production Empty Datasets

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

export const mockAdminCompanies: AdminCompany[] = [];
export const mockAdminEmployers: AdminEmployer[] = [
  {
    id: 'emp-1',
    name: 'Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    company: 'Apex Innovations',
    role: 'HR Director',
    email: 's.jenkins@apexinnovations.com',
    status: 'active',
    lastLogin: '2 hours ago',
    country: 'United States'
  },
  {
    id: 'emp-2',
    name: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    company: 'GlobalTech Solutions',
    role: 'Talent Acquisition Manager',
    email: 'm.vance@globaltech.io',
    status: 'active',
    lastLogin: '5 hours ago',
    country: 'United Kingdom'
  },
  {
    id: 'emp-3',
    name: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    company: 'FinPulse Systems',
    role: 'Head of People Operations',
    email: 'elena.r@finpulse.de',
    status: 'active',
    lastLogin: '1 day ago',
    country: 'Germany'
  },
  {
    id: 'emp-4',
    name: 'David Chen',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    company: 'CloudSphere AI',
    role: 'VP of Engineering & Hiring',
    email: 'dchen@cloudsphere.ai',
    status: 'pending',
    lastLogin: 'Invited 3 days ago',
    country: 'Singapore'
  },
  {
    id: 'emp-5',
    name: 'Amara Okafor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    company: 'BioHealth Dynamics',
    role: 'Senior Recruiting Lead',
    email: 'a.okafor@biohealth.org',
    status: 'active',
    lastLogin: '30 mins ago',
    country: 'Canada'
  },
  {
    id: 'emp-6',
    name: 'Robert Sterling',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    company: 'NexGen Mobility',
    role: 'Chief People Officer',
    email: 'r.sterling@nexgen.com',
    status: 'disabled',
    lastLogin: '14 days ago',
    country: 'Australia'
  }
];
export const mockAdminRecruiters: AdminRecruiter[] = [];


export const mockAdminCandidates: AdminCandidate[] = [];
export const mockAdminJobs: AdminJob[] = [];
export const mockAdminApplications: AdminApplication[] = [];
export interface AdminTransaction {
  id: string;
  invoice: string;
  company: string;
  plan: string;
  amount: number;
  method: string;
  date: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
}

export const mockAdminTransactions: AdminTransaction[] = [
  {
    id: 'tx-1',
    invoice: '#INV-2026-001',
    company: 'Congi Hub Private Limited',
    plan: 'Starter Plan',
    amount: 14999,
    method: 'Razorpay / Credit Card',
    date: '2026-08-01',
    status: 'paid'
  },
  {
    id: 'tx-2',
    invoice: '#INV-2026-002',
    company: 'NexGen AI Technologies',
    plan: 'Professional Plan',
    amount: 49999,
    method: 'Razorpay / Net Banking',
    date: '2026-07-28',
    status: 'paid'
  },
  {
    id: 'tx-3',
    invoice: '#INV-2026-003',
    company: 'Quantum Dynamics Corp',
    plan: 'Enterprise Tier',
    amount: 149999,
    method: 'Corporate Wire Transfer',
    date: '2026-07-15',
    status: 'paid'
  },
  {
    id: 'tx-4',
    invoice: '#INV-2026-004',
    company: 'CloudScale Global Systems',
    plan: 'Professional Plan',
    amount: 49999,
    method: 'Razorpay / UPI',
    date: '2026-07-10',
    status: 'paid'
  },
  {
    id: 'tx-5',
    invoice: '#INV-2026-005',
    company: 'CyberShield Systems',
    plan: 'Starter Plan',
    amount: 14999,
    method: 'Razorpay / Credit Card',
    date: '2026-07-01',
    status: 'paid'
  }
];

export const mockAdminTickets: AdminTicket[] = [];

export interface AdminAuditLog {
  id: string;
  who: string;
  action: string;
  module: string;
  ip: string;
  date: string;
  status: 'success' | 'failed' | 'warning';
}

export const mockAdminAuditLogs: AdminAuditLog[] = [
  {
    id: 'log-1',
    who: 'Super Admin (admin@getworxs.com)',
    action: 'Approved company registration for Congi Hub Private Limited',
    module: 'Companies',
    ip: '106.210.42.18',
    date: '2026-08-06 10:45:12',
    status: 'success'
  },
  {
    id: 'log-2',
    who: 'Super Admin (admin@getworxs.com)',
    action: 'Assigned Professional Subscription Plan to NexGen AI Technologies',
    module: 'Subscriptions',
    ip: '106.210.42.18',
    date: '2026-08-06 10:38:00',
    status: 'success'
  },
  {
    id: 'log-3',
    who: 'System Auto Guard',
    action: 'Enforced job posting quota limit check on Employer account',
    module: 'Security',
    ip: '127.0.0.1',
    date: '2026-08-06 10:20:15',
    status: 'warning'
  },
  {
    id: 'log-4',
    who: 'Super Admin (admin@getworxs.com)',
    action: 'Updated SMTP Server Configuration and tested connection',
    module: 'Settings',
    ip: '106.210.42.18',
    date: '2026-08-06 09:55:40',
    status: 'success'
  },
  {
    id: 'log-5',
    who: 'Sarah Jenkins (HR Director)',
    action: 'Invited recruiter seat (recruiter@congihub.com)',
    module: 'Employers',
    ip: '182.72.19.4',
    date: '2026-08-06 09:12:08',
    status: 'success'
  },
  {
    id: 'log-6',
    who: 'Marcus Vance (Talent Manager)',
    action: 'Published Senior Full Stack Engineer opening',
    module: 'Jobs',
    ip: '49.207.210.88',
    date: '2026-08-05 16:30:22',
    status: 'success'
  },
  {
    id: 'log-7',
    who: 'System Security Engine',
    action: 'Failed login attempt from unauthorized IP',
    module: 'Security',
    ip: '198.51.100.42',
    date: '2026-08-05 14:18:00',
    status: 'failed'
  },
  {
    id: 'log-8',
    who: 'Super Admin (admin@getworxs.com)',
    action: 'Updated Razorpay Payment Gateway production credentials',
    module: 'Payments',
    ip: '106.210.42.18',
    date: '2026-08-05 11:05:19',
    status: 'success'
  }
];

export const mockAdminSubscriptions = [
  {
    subscription_id: 1,
    company_id: 1,
    company_name: 'Congi Hub Private Limited',
    employer_name: 'Employer Lead (Congi)',
    employer_email: 'employer@congihub.com',
    plan_code: 'starter',
    plan_name: 'Starter Plan',
    status: 'Active',
    start_date: '2026-07-01T00:00:00Z',
    end_date: '2027-07-01T00:00:00Z',
    remaining_days: 329,
    jobs_used: 3,
    job_limit: 10,
    recruiters_used: 1,
    recruiter_limit: 2,
    ai_credits_used: 120,
    ai_credits_limit: 200,
    payment_status: 'Success',
    last_payment_date: '2026-07-01T00:00:00Z',
    last_payment_amount: 14999.0
  },
  {
    subscription_id: 2,
    company_id: 2,
    company_name: 'NexGen AI Technologies',
    employer_name: 'Employer Lead (NexGen)',
    employer_email: 'employer@nexgenai.io',
    plan_code: 'professional',
    plan_name: 'Professional Plan',
    status: 'Active',
    start_date: '2026-07-01T00:00:00Z',
    end_date: '2027-07-01T00:00:00Z',
    remaining_days: 329,
    jobs_used: 18,
    job_limit: 100,
    recruiters_used: 2,
    recruiter_limit: 10,
    ai_credits_used: 420,
    ai_credits_limit: 1000,
    payment_status: 'Success',
    last_payment_date: '2026-07-01T00:00:00Z',
    last_payment_amount: 39999.0
  },
  {
    subscription_id: 3,
    company_id: 3,
    company_name: 'CloudScale Solutions',
    employer_name: 'Employer Lead (CloudScale)',
    employer_email: 'employer@cloudscale.tech',
    plan_code: 'enterprise',
    plan_name: 'Enterprise Plan',
    status: 'Active',
    start_date: '2026-07-01T00:00:00Z',
    end_date: '2027-07-01T00:00:00Z',
    remaining_days: 329,
    jobs_used: 50,
    job_limit: -1,
    recruiters_used: 5,
    recruiter_limit: -1,
    ai_credits_used: 1500,
    ai_credits_limit: 10000,
    payment_status: 'Success',
    last_payment_date: '2026-07-01T00:00:00Z',
    last_payment_amount: 79999.0
  },
  {
    subscription_id: 4,
    company_id: 4,
    company_name: 'FinPulse Innovations',
    employer_name: 'Employer Lead (FinPulse)',
    employer_email: 'employer@finpulse.co',
    plan_code: 'professional',
    plan_name: 'Professional Plan',
    status: 'Active',
    start_date: '2026-07-01T00:00:00Z',
    end_date: '2027-07-01T00:00:00Z',
    remaining_days: 329,
    jobs_used: 24,
    job_limit: 100,
    recruiters_used: 3,
    recruiter_limit: 10,
    ai_credits_used: 580,
    ai_credits_limit: 1000,
    payment_status: 'Success',
    last_payment_date: '2026-07-01T00:00:00Z',
    last_payment_amount: 39999.0
  },
  {
    subscription_id: 5,
    company_id: 5,
    company_name: 'CyberShield Systems',
    employer_name: 'Employer Lead (CyberShield)',
    employer_email: 'employer@cybershield.security',
    plan_code: 'starter',
    plan_name: 'Starter Plan',
    status: 'Active',
    start_date: '2026-07-01T00:00:00Z',
    end_date: '2027-07-01T00:00:00Z',
    remaining_days: 329,
    jobs_used: 5,
    job_limit: 10,
    recruiters_used: 1,
    recruiter_limit: 2,
    ai_credits_used: 90,
    ai_credits_limit: 200,
    payment_status: 'Success',
    last_payment_date: '2026-07-01T00:00:00Z',
    last_payment_amount: 14999.0
  }
];
export const revenueChartData = [
  { month: 'Feb', revenue: 45000, subscriptions: 2 },
  { month: 'Mar', revenue: 62000, subscriptions: 3 },
  { month: 'Apr', revenue: 85000, subscriptions: 4 },
  { month: 'May', revenue: 98000, subscriptions: 4 },
  { month: 'Jun', revenue: 120000, subscriptions: 5 },
  { month: 'Jul', revenue: 135000, subscriptions: 5 },
  { month: 'Aug', revenue: 149995, subscriptions: 5 },
];

export const registrationsChartData = [
  { month: 'Feb', companies: 1, recruiters: 2, candidates: 10 },
  { month: 'Mar', companies: 2, recruiters: 3, candidates: 18 },
  { month: 'Apr', companies: 3, recruiters: 4, candidates: 25 },
  { month: 'May', companies: 4, recruiters: 5, candidates: 32 },
  { month: 'Jun', companies: 5, recruiters: 5, candidates: 40 },
  { month: 'Jul', companies: 5, recruiters: 5, candidates: 48 },
  { month: 'Aug', companies: 5, recruiters: 5, candidates: 50 },
];

export const aiUsageData = [
  { label: 'Candidate Matching', count: 4280, cost: 2911, icon: '⚡' },
  { label: 'Resume AI Parsing', count: 3820, cost: 2513, icon: '📄' },
  { label: 'Interview Assessment', count: 2150, cost: 1840, icon: '🎯' },
  { label: 'JD Auto Generator', count: 1420, cost: 1100, icon: '📝' },
  { label: 'Skill Gap Scanner', count: 980, cost: 850, icon: '🔍' },
];

export const topCountries = [
  { country: 'India', flag: '🇮🇳', companies: 4, jobs: 200, percentage: 80 },
  { country: 'United States', flag: '🇺🇸', companies: 1, jobs: 50, percentage: 20 },
];

export const topIndustries = [
  { name: 'Software & Technology', jobs: 120, percentage: 48, color: '#6D28D9' },
  { name: 'Financial Services', jobs: 60, percentage: 24, color: '#3B82F6' },
  { name: 'Cybersecurity', jobs: 40, percentage: 16, color: '#10B981' },
  { name: 'Cloud Computing', jobs: 30, percentage: 12, color: '#F59E0B' },
];
