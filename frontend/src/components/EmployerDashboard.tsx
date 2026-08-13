import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  PlusCircle, 
  Users, 
  Sparkles, 
  Calendar, 
  MessageSquare, 
  BarChart2, 
  Building2, 
  CreditCard, 
  Settings as SettingsIcon, 
  Search, 
  Download, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  Check, 
  X, 
  Paperclip, 
  Send, 
  Plus, 
  Key, 
  Clock, 
  FileDown,
  Info,
  CheckCircle2,
  Copy,
  ShieldCheck,
  RefreshCcw,
  AlertTriangle,
  Crown,
  Bell,
  UserPlus,
} from 'lucide-react';
import './EmployerDashboard.css';
import { CompanyVerificationStatus, type CompanyVerificationData } from './CompanyVerificationStatus';
import { SubscriptionPlansModal } from './SubscriptionPlansModal';
import { TalentSearchTab } from './employer/TalentSearchTab';
import { SubscriptionCheckoutModal } from './SubscriptionCheckoutModal';
import { type CurrencyCode } from '../utils/currency';
import RawJobCreationWizard from './JobCreationWizard';
import { useNotifications } from '../utils/useNotifications';
import { ApplicationAPI } from '../utils/api';
import RawCountUp from 'react-countup';
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, Line } from 'recharts';

const CountUpComponent: any = typeof RawCountUp === 'function'
  ? RawCountUp
  : (RawCountUp as any)?.CountUp || (RawCountUp as any)?.default;

const CountUp = (props: any) => {
  if (typeof CountUpComponent === 'function') {
    try {
      return <CountUpComponent {...props} />;
    } catch {
      return <span>{props.prefix || ''}{props.end}{props.suffix || ''}</span>;
    }
  }
  return <span>{props.prefix || ''}{props.end}{props.suffix || ''}</span>;
};

const JobCreationWizardComponent: any = typeof RawJobCreationWizard === 'function'
  ? RawJobCreationWizard
  : (RawJobCreationWizard as any)?.default || RawJobCreationWizard;

const JobCreationWizard = (props: any) => {
  return <JobCreationWizardComponent {...props} />;
};


// ==========================================
// Mock Database Definitions
// ==========================================

interface RecruiterJob {
  id: string;
  title: string;
  location: string;
  employmentType: string;
  applicationsCount: number;
  status: 'active' | 'draft' | 'paused' | 'closed';
  postedDate: string;
  industry: string;
  experience: string;
  department: string;
}

interface CandidateTimeline {
  id: string;
  event: string;
  date: string;
  description: string;
  type: 'success' | 'accent' | 'info';
}

interface Candidate {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  location: string;
  aiMatchScore: number;
  experienceYears: number;
  skills: string[];
  currentRole: string;
  currentCompany: string;
  education: string;
  portfolioUrl: string;
  resumeUrl: string;
  status: 'new' | 'viewed' | 'shortlisted' | 'interview' | 'selected' | 'rejected';
  appliedJobId: string;
  appliedJobTitle: string;
  interviewNotes: string[];
  timeline: CandidateTimeline[];
}

interface MessageThread {
  id: string;
  candidateName: string;
  avatar: string;
  unread: boolean;
  excerpt: string;
  messages: {
    id: string;
    sender: 'recruiter' | 'candidate';
    text: string;
    time: string;
  }[];
}

interface RecruiterTeam {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Recruiter' | 'Interviewer';
  status: 'Active' | 'Pending' | 'Invited' | 'Email Failed';
  email_sent?: boolean;
  warning?: string | null;
}



interface EmployerDashboardProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onJobPublished?: () => void;
}

export const EmployerDashboard: React.FC<EmployerDashboardProps> = ({
  activeTab: externalActiveTab,
  setActiveTab: externalSetActiveTab,
  onJobPublished
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState('overview');
  const activeTab = externalActiveTab || internalActiveTab;
  const setActiveTab = externalSetActiveTab || setInternalActiveTab;

  // Database State
  // Dashboard data fetched from backend
  const [dashboard, setDashboard] = useState<any>(null);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  // Fetch dashboard on mount
  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/dashboard`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch dashboard');
      const data = await res.json();
      setDashboard(data?.data || data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    }
  };

  function getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  }

  useEffect(() => {
    fetchDashboard();
  }, []);


  // Search and Filter States for Jobs
  const [jobSearch, setJobSearch] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState('all');
  const [jobDeptFilter, setJobDeptFilter] = useState('all');

  // Search and Filter States for Candidates
  const [candSearch, setCandSearch] = useState('');
  const [candStatusFilter, setCandStatusFilter] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [candProfileTab, setCandProfileTab] = useState<'resume' | 'timeline' | 'notes'>('resume');

  // Data State
  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [team, setTeam] = useState<RecruiterTeam[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [newNoteText, setNewNoteText] = useState('');

  // Messages Input state
  const [chatMessage, setChatMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');


  // Scheduling Interview form inside candidate drawer
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    date: '',
    time: '',
    interviewer: 'Sarah Connor',
    type: 'Video Meeting'
  });

  // Settings State
  const [settings, setSettings] = useState({
    companyName: 'GetWorxs Enterprise',
    companySize: '50-200',
    allowApiAccess: true,
    notificationEmails: true,
    requireMfa: false
  });

  // Company Verification Approval State Guard
  const [companyState, setCompanyState] = useState<CompanyVerificationData>({
    id: 0,
    name: '',
    legal_name: '',
    company_code: '',
    industry: '',
    company_size: '',
    email: '',
    phone: '',
    country: '',
    state: '',
    city: '',
    address: '',
    postal_code: '',
    approval_status: 'pending_verification',
    submitted_at: new Date().toISOString(),
    is_verified: false,
    documents: []
  });
  const [companyLoading, setCompanyLoading] = useState(true);

  const [profileAbout, setProfileAbout] = useState('');
  const [profileCulture, setProfileCulture] = useState("To organize the world's information and make it universally accessible and useful.");
  const [profileWebsite, setProfileWebsite] = useState('');
  const [profileOfficeHubs, setProfileOfficeHubs] = useState('');
  const [profileCompanySize, setProfileCompanySize] = useState('');
  const [profileIndustry, setProfileIndustry] = useState('');

  useEffect(() => {
    if (companyState) {
      setProfileAbout(companyState.description || '');
      setProfileWebsite(companyState.website || '');
      setProfileCompanySize(companyState.company_size || '50-200');
      setProfileIndustry(companyState.industry || '');
      setProfileOfficeHubs(companyState.address || '');
    }
  }, [companyState]);

  const handleSaveBranding = async () => {
    const token = localStorage.getItem('getworxs_access_token');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    if (!token) {
      alert('You must be logged in to update company profile details.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/v1/companies/${companyState.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          description: profileAbout,
          website: profileWebsite,
          company_size: profileCompanySize,
          address: profileOfficeHubs,
          industry: profileIndustry || companyState.industry || 'Technology'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          const updated = data.data;
          setCompanyState(prev => ({
            ...prev,
            description: updated.description,
            website: updated.website,
            company_size: updated.company_size,
            address: updated.address,
            logo_url: updated.logo_url,
            name: updated.name,
            industry: updated.industry
          }));
          alert('Company profile changes saved successfully!');
        } else {
          alert('Failed to save changes: ' + (data.message || 'Unknown error'));
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert('Failed to save changes: ' + (errorData?.detail || errorData?.message || 'Server error'));
      }
    } catch (err: any) {
      alert('Error updating company profile: ' + (err.message || 'Network error'));
    }
  };


  const fetchJobs = async () => {
    const rawUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    const API_URL = rawUrl.replace(/\/+$/, '').replace(/\/api\/v1$/, '');
    const token = localStorage.getItem('getworxs_access_token') || localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/jobs?limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data && Array.isArray(data.data.items)) {
          const mapped = data.data.items.map((j: any) => ({
            id: String(j.id),
            title: j.title,
            location: j.city ? `${j.city}, ${j.state}` : j.country,
            employmentType: j.employment_type,
            applicationsCount: typeof j.applications_count === 'number' ? j.applications_count : 0,
            status: j.status.toLowerCase() as any,
            postedDate: j.created_at ? new Date(j.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            industry: j.industry_exp || 'Technology',
            experience: `${j.experience_min} to ${j.experience_max} years`,
            department: j.department
          }));
          setJobs(mapped);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch jobs from API:', err);
    }
  };

  const handleEditJob = async (jobId: string) => {
    setIsEditingLoading(true);
    const rawUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    const API_URL = rawUrl.replace(/\/+$/, '').replace(/\/api\/v1$/, '');
    const token = localStorage.getItem('getworxs_access_token') || localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/v1/jobs/${jobId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setEditingJob(json.data);
          setActiveTab('create-job');
        } else {
          alert('Failed to load job details.');
        }
      } else {
        alert('Failed to fetch job details from server.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while loading job.');
    } finally {
      setIsEditingLoading(false);
    }
  };

  const fetchCandidates = async () => {
    try {
      const data = await ApplicationAPI.listCompany(1, 100);
      if (data && Array.isArray(data.items)) {
        const jobAppCounts: Record<string, number> = {};
        const mapped = data.items.map((app: any) => {
            const nameStr = app.candidate?.name || 'Candidate';
            const initials = nameStr.split(' ').map((n: any) => n[0]).slice(0,2).join('').toUpperCase();
            
            const jobIdStr = String(app.job_id);
            jobAppCounts[jobIdStr] = (jobAppCounts[jobIdStr] || 0) + 1;

            const statusMap: Record<string, string> = {
              'Applied': 'new',
              'Viewed': 'viewed',
              'Shortlisted': 'shortlisted',
              'Interview Scheduled': 'interview',
              'Interview Completed': 'interview',
              'Selected': 'selected',
              'Offer Sent': 'selected',
              'Hired': 'selected',
              'Rejected': 'rejected',
              'Withdrawn': 'rejected'
            };
            const currentStatus = statusMap[app.status] || 'new';
            
            const timeline = (app.status_history_json || []).map((hist: any, idx: number) => ({
              id: `t-${idx}-${app.id}`,
              event: hist.status,
              date: hist.changed_at ? hist.changed_at.split('T')[0] : new Date().toISOString().split('T')[0],
              description: hist.note || `Status changed to ${hist.status}`,
              type: ['Shortlisted', 'Selected', 'Hired', 'Offer Sent'].includes(hist.status) ? 'success' : ['Rejected', 'Withdrawn'].includes(hist.status) ? 'accent' : 'info'
            }));

            const skillsArr = app.candidate?.candidate_profile?.skills_json 
              ? (typeof app.candidate.candidate_profile.skills_json === 'string' 
                  ? JSON.parse(app.candidate.candidate_profile.skills_json) 
                  : app.candidate.candidate_profile.skills_json) 
              : (app.candidate?.candidate_profile?.skills || ['Software Development']);

            return {
              id: String(app.id),
              name: nameStr,
              avatar: initials,
              email: app.candidate?.email || '',
              phone: app.candidate?.phone || app.candidate?.candidate_profile?.phone || '',
              location: app.candidate?.candidate_profile?.city 
                ? `${app.candidate.candidate_profile.city}, ${app.candidate.candidate_profile.country}` 
                : (app.candidate?.candidate_profile?.country || 'Remote'),
              aiMatchScore: app.candidate?.candidate_profile?.profile_completion_percentage || 85,
              experienceYears: parseInt(app.candidate?.candidate_profile?.total_experience) || 2,
              skills: Array.isArray(skillsArr) ? skillsArr : ['Software Development'],
              currentRole: app.candidate?.candidate_profile?.current_role || 'Jobseeker',
              currentCompany: app.candidate?.candidate_profile?.university || 'Graduate',
              education: app.candidate?.candidate_profile?.highest_qualification || 'Degree',
              portfolioUrl: app.candidate?.candidate_profile?.portfolio_url || '',
              resumeUrl: app.resume_url || app.candidate?.candidate_profile?.resume_url || '',
              status: currentStatus as any,
              appliedJobId: jobIdStr,
              appliedJobTitle: app.job_title || 'Global Role',
              interviewNotes: app.notes_json || [],
              timeline: timeline
            };
          });
          setCandidates(mapped);

          // Update applicationsCount on jobs state based on candidates count
          setJobs(prevJobs => prevJobs.map(j => ({
            ...j,
            applicationsCount: Math.max(j.applicationsCount, jobAppCounts[j.id] || 0)
          })));
      }
    } catch (err) {
      console.warn('Failed to fetch company applications:', err);
    }
  };

  useEffect(() => {
    if (companyState.approval_status === 'approved') {
      fetchJobs();
      fetchCandidates();
    }
  }, [companyState.approval_status]);


  const [apiKeys, setApiKeys] = useState<{key: string; label: string; created: string}[]>([
    { key: 'gw_live_a8f9c1...2c', label: 'Production API Key', created: '2026-03-12' }
  ]);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showOutboxModal, setShowOutboxModal] = useState(false);
  const [previewEmailItem, setPreviewEmailItem] = useState<any>(null);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Recruiter' | 'Interviewer'>('Recruiter');
  const [isInviting, setIsInviting] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  // Resend invitation state
  const [isResending, setIsResending] = useState<string | null>(null); // stores the email being resent

  const [inviteSuccessInfo, setInviteSuccessInfo] = useState<{
    name: string;
    email: string;
    role: string;
    companyName: string;
    tempPassword: string;
    message: string;
    emailSent?: boolean;
    warning?: string | null;
  } | null>(null);

  // Subscription Onboarding & Access Control State
  const [accessStatus, setAccessStatus] = useState<{
    is_dashboard_unlocked: boolean;
    subscription_status: string;
    company_status: string;
    must_change_password: boolean;
    message: string;
    allowed_features: string[];
    active_subscription: any;
  }>({
    is_dashboard_unlocked: true,
    subscription_status: 'ACTIVE',
    company_status: 'approved',
    must_change_password: false,
    message: '',
    allowed_features: ['create_job', 'publish_job', 'recruiter_management', 'resume_search', 'candidate_unlock', 'ai_hiring_features'],
    active_subscription: null
  });
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<any>(null);
  const [checkoutCurrency, setCheckoutCurrency] = useState<CurrencyCode>('USD');
  const [subscriptionCurrency, setSubscriptionCurrency] = useState<'USD' | 'INR'>('USD');
  const [showRecruiterLimitModal, setShowRecruiterLimitModal] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);
  const [isEditingLoading, setIsEditingLoading] = useState(false);


  // Load recruiter team from API on mount and when companyState.name or settings.companyName changes

  useEffect(() => {
    const loadRecruiters = async () => {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const compName = companyState.name || settings.companyName || localStorage.getItem('getworxs_company_name') || '';
      try {
        const url = compName
          ? `${API_URL}/api/v1/companies/recruiters?company_name=${encodeURIComponent(compName)}`
          : `${API_URL}/api/v1/companies/recruiters`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            const teamMap = new Map<string, RecruiterTeam>();
            data.data.forEach((r: any) => {
              const emailKey = (r.recruiter_email || '').toLowerCase();
              if (emailKey && !teamMap.has(emailKey)) {
                teamMap.set(emailKey, {
                  id: String(r.id),
                  name: r.recruiter_name,
                  email: r.recruiter_email,
                  role: (r.role as 'Admin' | 'Recruiter' | 'Interviewer') || 'Recruiter',
                  status: (r.status as 'Active' | 'Pending' | 'Invited' | 'Email Failed') || 'Pending',
                  email_sent: r.status === 'Invited',
                });
              }
            });
            setTeam(Array.from(teamMap.values()));
          }
        }
      } catch {
        // API unavailable — retain existing state (localStorage fallback is sufficient)
      }
    };
    loadRecruiters();
  }, [companyState.name, settings.companyName]);


  const handleInviteRecruiterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    setIsInviting(true);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const compName = companyState.name || settings.companyName || localStorage.getItem('getworxs_company_name') || 'Enterprise';
    let tempPassword = `Recruiter@${Math.random().toString(36).substring(2, 6).toUpperCase()}!2026`;
    let message = `Recruiter '${inviteName}' invitation sent for company '${compName}'.`;
    let emailSent = true;
    let warning: string | null = null;
    let inviteStatus: 'Invited' | 'Email Failed' | 'Pending' = 'Pending';

    try {
      const token = localStorage.getItem('getworxs_access_token');
      const res = await fetch(`${API_URL}/api/v1/companies/invite-recruiter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: inviteName,
          email: inviteEmail.trim(),
          role: inviteRole,
          company_name: compName
        })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.data) {
        tempPassword = data.data.temporary_password || tempPassword;
        message = data.data.message || message;
        emailSent = data.data.email_sent !== false;
        warning = data.data.warning || null;
        inviteStatus = data.data.status === 'Invited' ? 'Invited' : (data.data.status === 'Email Failed' ? 'Email Failed' : 'Pending');
      }
    } catch (err) {
      console.warn('Backend invite failed, falling back to client-side mode:', err);
      inviteStatus = 'Pending';
    }

    // Update local recruiter team state (deduplicated by email)
    const newMember: RecruiterTeam = {
      id: `team-${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      status: inviteStatus,
      email_sent: emailSent,
      warning,
    };
    setTeam(prev => {
      const filtered = prev.filter(t => t.email.toLowerCase() !== inviteEmail.trim().toLowerCase());
      return [...filtered, newMember];
    });

    // Save invited recruiter to localStorage for role detection on login (deduplicated by email)
    try {
      const existing = JSON.parse(localStorage.getItem('getworxs_invited_recruiters') || '[]');
      const filtered = Array.isArray(existing) ? existing.filter((item: any) => item.email && item.email.toLowerCase() !== inviteEmail.trim().toLowerCase()) : [];
      filtered.unshift({
        name: inviteName.trim(),
        email: inviteEmail.trim().toLowerCase(),
        companyName: compName,
        role: inviteRole,
        tempPassword: tempPassword
      });
      localStorage.setItem('getworxs_invited_recruiters', JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to store invited recruiter in localStorage:', e);
    }


    setIsInviting(false);
    setInviteSuccessInfo({
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      companyName: compName,
      tempPassword,
      message,
      emailSent,
      warning,
    });
  };

  const handleResendInvite = async (email: string) => {
    setIsResending(email);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    try {
      const token = localStorage.getItem('getworxs_access_token');
      const res = await fetch(`${API_URL}/api/v1/companies/resend-recruiter-invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ email })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.data) {
        const emailSent = data.data.email_sent !== false;
        const newStatus: RecruiterTeam['status'] = emailSent ? 'Invited' : 'Email Failed';
        setTeam(prev => prev.map(m =>
          m.email === email
            ? { ...m, status: newStatus, email_sent: emailSent, warning: data.data.warning || null }
            : m
        ));
        if (!emailSent && data.data.warning) {
          alert(`⚠️ ${data.data.warning}`);
        }
      } else {
        alert('Resend failed: ' + (data?.error?.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Network error while resending invitation. Please try again.');
    } finally {
      setIsResending(null);
    }
  };

  const handleCloseInviteModal = () => {
    setShowInviteModal(false);
    setInviteName('');
    setInviteEmail('');
    setInviteRole('Recruiter');
    setInviteSuccessInfo(null);
    setCopiedPass(false);
  };





  const handleUpdateCandidateStatus = async (candId: string, targetStatus: string, note?: string) => {
    try {
      await ApplicationAPI.updateStatus(Number(candId), targetStatus, note);
      fetchCandidates(); // Reload applications list from DB
      if (selectedCandidate && selectedCandidate.id === candId) {
        // Update selected candidate details inline
        const statusMap: Record<string, string> = {
          'Applied': 'new',
          'Viewed': 'viewed',
          'Shortlisted': 'shortlisted',
          'Interview Scheduled': 'interview',
          'Interview Completed': 'interview',
          'Selected': 'selected',
          'Offer Sent': 'selected',
          'Hired': 'selected',
          'Rejected': 'rejected',
          'Withdrawn': 'rejected'
        };
        const currentStatus = statusMap[targetStatus] || 'new';
        setSelectedCandidate(prev => {
          if (!prev) return null;
          const newTimelineItem = {
            id: `t-update-${Date.now()}`,
            event: targetStatus,
            date: new Date().toISOString().split('T')[0],
            description: note || `Status updated to ${targetStatus}`,
            type: ['Shortlisted', 'Selected', 'Hired', 'Offer Sent'].includes(targetStatus) ? 'success' as const : ['Rejected', 'Withdrawn'].includes(targetStatus) ? 'accent' as const : 'info' as const
          };
          return {
            ...prev,
            status: currentStatus as any,
            timeline: [...prev.timeline, newTimelineItem]
          };
        });
      }
    } catch (e: any) {
      alert('Failed to update application status: ' + (e.message || 'Unknown error'));
      console.warn('Error updating application status:', e);
    }
  };

  // Add notes to candidate
  const handleAddNote = async () => {
    if (!newNoteText.trim() || !selectedCandidate) return;
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('getworxs_access_token');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/applications/${selectedCandidate.id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          note: newNoteText.trim()
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          fetchCandidates();
          setSelectedCandidate(prev => {
            if (!prev) return null;
            return {
              ...prev,
              interviewNotes: [...prev.interviewNotes, newNoteText.trim()],
              timeline: [...prev.timeline, {
                id: `t-note-${Date.now()}`,
                event: 'Note Added',
                date: new Date().toISOString().split('T')[0],
                description: newNoteText.trim(),
                type: 'info'
              }]
            };
          });
          setNewNoteText('');
        }
      }
    } catch (err) {
      console.warn('Failed to add application note:', err);
    }
  };

  // Schedule Interview
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    const note = `Scheduled: ${scheduleData.type} on ${scheduleData.date} at ${scheduleData.time} with ${scheduleData.interviewer}`;
    await handleUpdateCandidateStatus(selectedCandidate.id, 'Interview Scheduled', note);
    alert('Interview scheduled successfully! Notification sent to candidate.');
    setIsScheduling(false);
  };

  // Send message
  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    const updatedThreads = threads.map(t => {
      if (t.id === activeThreadId) {
        return {
          ...t,
          excerpt: chatMessage,
          messages: [
            ...t.messages,
            { id: `msg-${Date.now()}`, sender: 'recruiter' as const, text: chatMessage, time: 'Just now' }
          ]
        };
      }
      return t;
    });
    setThreads(updatedThreads);
    setChatMessage('');
  };

  // Apply templates to chatbox
  useEffect(() => {
    if (selectedTemplate === 'invite') {
      setChatMessage("Hi, we would love to invite you for a 30-minute technical interview. Please choose a slot that works for you here: [Link]");
    } else if (selectedTemplate === 'offer') {
      setChatMessage("Congratulations! We are thrilled to extend an official offer of employment at GetWorxs. Attached is your offer letter. Please review and sign.");
    } else if (selectedTemplate === 'reject') {
      setChatMessage("Thank you for your time. Unfortunately, we have decided to move forward with other candidates whose profiles align more closely with our requirements. We wish you the best.");
    }
  }, [selectedTemplate]);

  // Filter Logic
  const filteredJobs = jobs.map(job => ({
    ...job,
    applicationsCount: candidates.filter(c => c.appliedJobId === job.id).length
  })).filter(job => {
    const matchSearch = job.title.toLowerCase().includes(jobSearch.toLowerCase()) || 
                        job.location.toLowerCase().includes(jobSearch.toLowerCase());
    const matchStatus = jobStatusFilter === 'all' || job.status === jobStatusFilter;
    const matchDept = jobDeptFilter === 'all' || job.department.toLowerCase() === jobDeptFilter.toLowerCase();
    return matchSearch && matchStatus && matchDept;
  });

  const filteredCandidates = candidates.filter(cand => {
    const matchSearch = cand.name.toLowerCase().includes(candSearch.toLowerCase()) ||
                        cand.skills.some(s => s.toLowerCase().includes(candSearch.toLowerCase())) ||
                        cand.appliedJobTitle.toLowerCase().includes(candSearch.toLowerCase());
    const matchStatus = candStatusFilter === 'all' || cand.status === candStatusFilter;
    return matchSearch && matchStatus;
  });

  const activeThread = threads.find(t => t.id === activeThreadId);

  // Company Verification Approval Data Loader


  useEffect(() => {
    const loadCompanyData = async () => {
      const token = localStorage.getItem('getworxs_access_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

      // Try backend first — fetch logged-in employer's company profile
      if (token) {
        try {
          let c: any = null;
          const myRes = await fetch(`${API_URL}/api/v1/companies/my-company`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const myData = await myRes.json().catch(() => ({}));

          if (myRes.ok && myData.success && myData.data) {
            c = myData.data;
          } else {
            // Fallback: list companies & match logged-in user email
            const listRes = await fetch(`${API_URL}/api/v1/companies?limit=100`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const listData = await listRes.json().catch(() => ({}));
            if (listRes.ok && listData.success && listData.data?.items?.length > 0) {
              const userEmail = localStorage.getItem('getworxs_user_email') || '';
              const matched = listData.data.items.find((item: any) =>
                userEmail && (
                  item.email?.toLowerCase() === userEmail.toLowerCase() ||
                  item.primary_contact_email?.toLowerCase() === userEmail.toLowerCase()
                )
              );
              c = matched || listData.data.items[0];
            }
          }

          if (c) {
            setCompanyState({
              id: c.id,
              name: c.name,
              legal_name: c.legal_name,
              company_code: c.company_code,
              industry: c.industry,
              company_size: c.company_size,
              website: c.website,
              email: c.email,
              phone: c.phone,
              country: c.country,
              state: c.state,
              city: c.city,
              address: c.address,
              postal_code: c.postal_code,
              tax_gst_number: c.tax_gst_number,
              business_reg_number: c.business_reg_number,
              year_established: c.year_established,
              primary_contact_name: c.primary_contact_name,
              primary_contact_designation: c.primary_contact_designation,
              primary_contact_email: c.primary_contact_email,
              primary_contact_phone: c.primary_contact_phone,
              logo_url: c.logo_url,
              description: c.description,
              approval_status: c.approval_status,
              submitted_at: c.created_at,
              is_verified: c.is_verified,
              review_notes: c.review_notes,
              rejection_reason: c.rejection_reason,
              documents: c.documents || []
            });
            if (c.name) {
              localStorage.setItem('getworxs_company_name', c.name);
              setSettings(prev => ({ ...prev, companyName: c.name }));
            }
            setCompanyLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Could not fetch company from backend:', err);
        }
      }

      // Fallback: localStorage
      try {
        const saved = localStorage.getItem('getworxs_registered_companies');
        if (saved) {
          const list = JSON.parse(saved);
          if (list && list.length > 0) {
            setCompanyState(list[0]);
            if (list[0].name) {
              setSettings(prev => ({ ...prev, companyName: list[0].name }));
            }
          }
        }
      } catch (e) {
        console.warn('Storage sync error:', e);
      }

      setCompanyLoading(false);
    };

    loadCompanyData();

    const handleStorageSync = () => {
      try {
        const saved = localStorage.getItem('getworxs_registered_companies');
        if (saved) {
          const list = JSON.parse(saved);
          if (list && list.length > 0) setCompanyState(list[0]);
        }
      } catch (e) {
        console.warn('Storage sync error:', e);
      }
    };
    window.addEventListener('storage', handleStorageSync);
    return () => window.removeEventListener('storage', handleStorageSync);
  }, []);

  useEffect(() => {
    const fetchSubscriptionAccess = async () => {
      const token = localStorage.getItem('getworxs_access_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/api/v1/subscriptions/access-check`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success && data.data) {
          setAccessStatus(data.data);
          if (!data.data.is_dashboard_unlocked && data.data.company_status === 'approved') {
            setShowPlansModal(true);
          }
        }
      } catch (err) {
        console.warn('Subscription access check failed:', err);
      }
    };

    if (companyState.approval_status === 'approved') {
      fetchSubscriptionAccess();
    }
  }, [companyState.approval_status]);


  if (companyLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div className="spinner" style={{ width: 36, height: 36, borderWidth: 4, borderTopColor: 'var(--color-primary)' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Loading your company profile...</p>
      </div>
    );
  }

  if (!companyState.name) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="widget-box" style={{ maxWidth: 520, textAlign: 'center', padding: 40 }}>
          <Building2 size={48} style={{ color: 'var(--color-primary)', marginBottom: 16 }} />
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>No Company Registered</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8 }}>
            You have not registered a company yet. Please complete the company onboarding to access the employer dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (companyState.approval_status !== 'approved' || !companyState.is_verified) {
    return (
      <div style={{ minHeight: '80vh', padding: '24px 16px' }}>
        {/* State Simulator Switcher for Reviewing all workflow states */}
        <div style={{
          maxWidth: '980px',
          margin: '0 auto 16px',
          padding: '12px 20px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info size={15} color="var(--color-primary)" />
            <span>Workflow Simulation: Toggle Company Approval Status</span>
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(['pending_verification', 'under_review', 'rejected', 'approved'] as const).map(st => (
              <button
                key={st}
                onClick={() => setCompanyState(prev => ({
                  ...prev,
                  approval_status: st,
                  is_verified: st === 'approved',
                  review_notes: st === 'under_review' ? 'Please upload a valid Company Registration Certificate with official seal.' : undefined,
                  rejection_reason: st === 'rejected' ? 'Invalid business registration certificate uploaded.' : undefined
                }))}
                style={{
                  padding: '5px 14px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: companyState.approval_status === st ? 'var(--color-primary)' : 'var(--bg-card)',
                  color: companyState.approval_status === st ? '#ffffff' : 'var(--text-primary)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  textTransform: 'capitalize'
                }}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <CompanyVerificationStatus
          company={companyState}
          onCompanyUpdate={setCompanyState}
        />
      </div>
    );
  }

  return (
    <div className="employer-dashboard-container">
      
      {/* Sticky Left Sidebar Navigation */}
      <aside className="ed-sidebar">
        <div className="ed-sidebar-nav">
          <div className="ed-sidebar-section">
            <span className="ed-sidebar-section-title">Main Menu</span>
            <button className={`ed-sidebar-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>
            <button className={`ed-sidebar-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
              <BarChart2 size={18} />
              <span>Analytics</span>
            </button>
          </div>

          <div className="ed-sidebar-section">
            <span className="ed-sidebar-section-title">Recruitment</span>
            <button className={`ed-sidebar-item ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')}>
              <Briefcase size={18} />
              <span>Job Management</span>
              <span className="ed-sidebar-badge">{dashboard?.metrics?.active_jobs?.count ?? (jobs.length > 0 ? jobs.filter(j => j.status === 'active').length : 50)}</span>
            </button>

            <button className={`ed-sidebar-item ${activeTab === 'create-job' ? 'active' : ''}`} onClick={() => { setEditingJob(null); setActiveTab('create-job'); }}>
              <PlusCircle size={18} />
              <span>Create Job</span>
            </button>

            <button className={`ed-sidebar-item ${activeTab === 'applicants' ? 'active' : ''}`} onClick={() => setActiveTab('applicants')}>
              <Users size={18} />
              <span>Applicants</span>
              <span className="ed-sidebar-badge accent">{dashboard?.metrics?.new_applications?.count ?? (candidates.length > 0 ? candidates.filter(c => c.status === 'new').length : 9)}</span>
            </button>

            <button className={`ed-sidebar-item ${activeTab === 'talent-search' ? 'active' : ''}`} onClick={() => setActiveTab('talent-search')}>
              <Search size={18} />
              <span>Talent Search</span>
              <span className="ed-sidebar-badge primary">Global</span>
            </button>

            <button className={`ed-sidebar-item ${activeTab === 'ai-matching' ? 'active' : ''}`} onClick={() => setActiveTab('ai-matching')}>
              <Sparkles size={18} />
              <span>AI Candidate Match</span>
            </button>

            <button className={`ed-sidebar-item ${activeTab === 'interviews' ? 'active' : ''}`} onClick={() => setActiveTab('interviews')}>
              <Calendar size={18} />
              <span>Interviews</span>
            </button>
          </div>

          <div className="ed-sidebar-section">
            <span className="ed-sidebar-section-title">Communication</span>
            <button className={`ed-sidebar-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
              <Bell size={18} />
              <span>Notifications</span>
              {unreadCount > 0 && <span className="ed-sidebar-badge primary">{unreadCount}</span>}
            </button>

            <button className={`ed-sidebar-item ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
              <MessageSquare size={18} />
              <span>Messages</span>
            </button>
          </div>

          <div className="ed-sidebar-section">
            <span className="ed-sidebar-section-title">Organization</span>
            <button className={`ed-sidebar-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
              <Building2 size={18} />
              <span>Company Profile</span>
            </button>

            <button className={`ed-sidebar-item ${activeTab === 'billing' ? 'active' : ''}`} onClick={() => setActiveTab('billing')}>
              <CreditCard size={18} />
              <span>Subscription</span>
            </button>

            <button className={`ed-sidebar-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
              <SettingsIcon size={18} />
              <span>Settings</span>
            </button>
          </div>
        </div>

        <div className="ed-sidebar-footer">
          <div className="ed-sidebar-profile">
            <div className="ed-sidebar-avatar-wrapper">
              <div className="ed-sidebar-avatar">
                {companyState.name ? companyState.name.substring(0, 2).toUpperCase() : 'CS'}
              </div>
              <span className="ed-sidebar-status-dot"></span>
            </div>
            <div className="ed-sidebar-prof-info">
              <span className="ed-sidebar-prof-name">{companyState.name || settings.companyName}</span>
              <span className="ed-sidebar-prof-role">Hiring Workspace</span>
            </div>
            <span className="ed-sidebar-tier-tag">PRO</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ed-content-pane">

        {/* Subscription Status Alert Banner */}
        {!accessStatus.is_dashboard_unlocked && (
          <div style={{
            margin: '0 0 24px 0',
            padding: '16px 20px',
            borderRadius: '16px',
            background: accessStatus.subscription_status === 'EXPIRED'
              ? 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)'
              : 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
            border: accessStatus.subscription_status === 'EXPIRED'
              ? '1px solid #fdba74'
              : '1px solid #c4b5fd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                background: accessStatus.subscription_status === 'EXPIRED' ? '#ea580c' : '#6366f1',
                color: '#ffffff',
                padding: '10px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {accessStatus.subscription_status === 'EXPIRED' ? <AlertTriangle size={20} /> : <Crown size={20} />}
              </div>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: '800', margin: 0, color: accessStatus.subscription_status === 'EXPIRED' ? '#9a3412' : '#4338ca' }}>
                  {accessStatus.subscription_status === 'EXPIRED' ? 'Subscription Expired' : 'Subscription Inactive'}
                </h4>
                <p style={{ fontSize: '13px', margin: '2px 0 0 0', color: accessStatus.subscription_status === 'EXPIRED' ? '#c2410c' : '#5b21b6' }}>
                  {accessStatus.message || (accessStatus.subscription_status === 'EXPIRED'
                    ? 'Your subscription has expired. Renew your subscription to continue hiring.'
                    : 'Your subscription is inactive. Please choose a subscription plan to continue using GetWorxs.')}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowPlansModal(true)}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: 'none',
                background: accessStatus.subscription_status === 'EXPIRED' ? '#ea580c' : '#6366f1',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Crown size={15} />
              <span>{accessStatus.subscription_status === 'EXPIRED' ? 'Renew Subscription' : 'Select Subscription Plan'}</span>
            </button>
          </div>
        )}


        {/* ==========================================
           TAB: DASHBOARD OVERVIEW
           ========================================== */}
        {activeTab === 'overview' && (
        <div className="ed-overview">
          {/* Header */}
          <section className="ed-header">
            <h1 className="ed-greeting">{`Good ${getTimeOfDay()}, ${companyState.name || settings.companyName} 👋`}</h1>
            <p className="ed-subtitle">Here's what's happening with your hiring today.</p>
            <div className="ed-actions">
              <button className="ed-btn ed-btn-primary" onClick={() => setActiveTab('create-job')}>
                <PlusCircle size={16} /> <span>Post a Job</span>
              </button>
              <button className="ed-btn ed-btn-secondary" onClick={() => setActiveTab('applicants')}>
                <Users size={16} /> <span>Find Talent</span>
              </button>
              <button className="ed-btn ed-btn-secondary" onClick={() => {
                const activeSub = accessStatus?.active_subscription;
                const limit = activeSub?.plan?.recruiter_limit ?? 2;
                const count = activeSub?.recruiters_count ?? 2;
                if (limit !== -1 && count >= limit) {
                  setShowRecruiterLimitModal(true);
                } else {
                  setActiveTab('settings');
                  setTimeout(() => setShowInviteModal(true), 100);
                }
              }}>
                <UserPlus size={16} /> <span>Invite Recruiter</span>
              </button>
            </div>
          </section>

          {/* Key Hiring Metrics */}
          <section className="ed-metrics">
            <div className="ed-metric-card primary">
              <div className="ed-metric-icon"><Briefcase size={22} /></div>
              <div className="ed-metric-info">
                <span className="ed-metric-label">ACTIVE JOBS</span>
                <CountUp end={dashboard?.metrics?.active_jobs?.count ?? (jobs.length > 0 ? jobs.filter(j => j.status === 'active').length : 50)} duration={1.5} separator="," className="ed-metric-value" />
              </div>
            </div>
            <div className="ed-metric-card info">
              <div className="ed-metric-icon"><Users size={22} /></div>
              <div className="ed-metric-info">
                <span className="ed-metric-label">NEW APPLICATIONS</span>
                <CountUp end={dashboard?.metrics?.new_applications?.count ?? (candidates.length > 0 ? candidates.filter(c => c.status === 'new').length : 9)} duration={1.5} separator="," className="ed-metric-value" />
              </div>
            </div>
            <div className="ed-metric-card warning">
              <div className="ed-metric-icon"><Award size={22} /></div>
              <div className="ed-metric-info">
                <span className="ed-metric-label">SHORTLISTED</span>
                <CountUp end={dashboard?.metrics?.shortlisted?.count ?? (candidates.length > 0 ? candidates.filter(c => c.status === 'shortlisted').length : 12)} duration={1.5} separator="," className="ed-metric-value" />
              </div>
            </div>
            <div className="ed-metric-card success">
              <div className="ed-metric-icon"><Calendar size={22} /></div>
              <div className="ed-metric-info">
                <span className="ed-metric-label">INTERVIEWS</span>
                <CountUp end={dashboard?.metrics?.interviews?.count ?? (candidates.length > 0 ? candidates.filter(c => c.status === 'interview').length : 4)} duration={1.5} separator="," className="ed-metric-value" />
              </div>
            </div>
          </section>

          {/* Hiring Performance Chart */}
          <section className="ed-performance">
            <h2 className="ed-section-title">Hiring Performance</h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={
                (dashboard?.performance_chart && dashboard.performance_chart.length > 0)
                  ? dashboard.performance_chart
                  : [
                      { date: 'Mon', applications: 14, interviews: 4 },
                      { date: 'Tue', applications: 22, interviews: 8 },
                      { date: 'Wed', applications: 18, interviews: 6 },
                      { date: 'Thu', applications: 31, interviews: 12 },
                      { date: 'Fri', applications: 27, interviews: 9 },
                      { date: 'Sat', applications: 15, interviews: 5 },
                      { date: 'Sun', applications: 19, interviews: 7 },
                    ]
              }>
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', borderColor: '#e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="applications" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1' }} activeDot={{ r: 6 }} name="Applications" />
                <Line type="monotone" dataKey="interviews" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} name="Interviews" />
              </LineChart>
            </ResponsiveContainer>
          </section>
        </div>
      )}

          


        {/* ==========================================
           TAB: JOB MANAGEMENT (JOB LISTINGS TABLE)
           ========================================== */}
        {activeTab === 'jobs' && (
          <div>
            <div className="ed-page-header">
              <div>
                <h1 className="ed-title">Job Management</h1>
                <p className="ed-subtitle">Track and configure corporate openings, application counts, and states.</p>
              </div>
              <button className="ed-btn ed-btn-primary" onClick={() => setActiveTab('create-job')}>
                <PlusCircle size={16} />
                <span>Create Job Listing</span>
              </button>
            </div>

            {/* Filter controls */}
            <div className="ed-filter-bar">
              <div className="ed-filter-left">
                <div className="ed-search-wrapper">
                  <Search size={14} className="ed-search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search jobs..." 
                    className="ed-input ed-search-input"
                    value={jobSearch}
                    onChange={(e) => setJobSearch(e.target.value)}
                  />
                </div>

                <select 
                  className="ed-select" 
                  style={{ width: '150px' }}
                  value={jobStatusFilter}
                  onChange={(e) => setJobStatusFilter(e.target.value)}
                >
                  <option value="all">Status: All</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="paused">Paused</option>
                  <option value="closed">Closed</option>
                </select>

                <select 
                  className="ed-select" 
                  style={{ width: '180px' }}
                  value={jobDeptFilter}
                  onChange={(e) => setJobDeptFilter(e.target.value)}
                >
                  <option value="all">Department: All</option>
                  <option value="engineering">Engineering</option>
                  <option value="product design">Product Design</option>
                  <option value="people operations">People Operations</option>
                </select>
              </div>
            </div>

            {/* Jobs Table */}
            <div className="ed-table-container">
              <table className="ed-table">
                <thead>
                  <tr>
                    <th>Job Title</th>
                    <th>Location</th>
                    <th>Experience</th>
                    <th>Applications</th>
                    <th>Status</th>
                    <th>Posted Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.length > 0 ? (
                    filteredJobs.map(job => (
                      <tr key={job.id}>
                        <td>
                          <div style={{ fontWeight: '700', color: 'var(--ed-text-primary)' }}>{job.title}</div>
                          <div style={{ fontSize: '11px', color: 'var(--ed-text-muted)' }}>Dept: {job.department}</div>
                        </td>
                        <td>{job.location}</td>
                        <td>{job.experience}</td>
                        <td>
                          <button 
                            style={{ background: 'none', border: 'none', color: 'var(--ed-primary)', fontWeight: '700', cursor: 'pointer', fontSize: '13.5px' }}
                            onClick={() => {
                              setCandSearch(job.title);
                              setActiveTab('applicants');
                            }}
                          >
                            {job.applicationsCount} Candidates
                          </button>
                        </td>
                        <td>
                          <span className={`ed-status-badge ${job.status}`}>
                            {job.status}
                          </span>
                        </td>
                        <td>{job.postedDate}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="ed-btn ed-btn-ghost ed-btn-sm" style={{ padding: '4px 8px' }} disabled={isEditingLoading} onClick={() => handleEditJob(job.id)}>Edit</button>
                            <button 
                              className="ed-btn ed-btn-ghost ed-btn-sm" 
                              style={{ padding: '4px 8px', color: 'var(--ed-accent)' }}
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${job.title}?`)) {
                                  setJobs(jobs.filter(j => j.id !== job.id));
                                }
                              }}
                            >
                              Archive
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--ed-text-muted)' }}>
                        <Info size={28} style={{ margin: '0 auto 12px', display: 'block' }} />
                        No active jobs matched your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==========================================
           TAB: NOTIFICATIONS
           ========================================== */}
        {activeTab === 'notifications' && (
          <div>
            <div className="ed-page-header">
              <div>
                <h1 className="ed-title">Notifications</h1>
                <p className="ed-subtitle">Stay updated on applications, assignments, and hiring activity.</p>
              </div>
              <button className="ed-btn ed-btn-outline" onClick={() => markAllRead()}>
                <CheckCircle2 size={16} />
                <span>Mark all as read</span>
              </button>
            </div>
            
            <div className="ed-card" style={{ padding: '0' }}>
              {notifications.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => !n.is_read && markRead(n.id)}
                      style={{ 
                        padding: '16px 20px', 
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        gap: '16px',
                        cursor: n.is_read ? 'default' : 'pointer',
                        background: n.is_read ? 'transparent' : 'rgba(109, 40, 217, 0.03)'
                      }}
                    >
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: n.type === 'submitted' ? 'rgba(5, 150, 105, 0.1)' : 'rgba(109, 40, 217, 0.1)',
                        color: n.type === 'submitted' ? '#059669' : '#6d28d9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <Bell size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: n.is_read ? 600 : 700 }}>{n.title}</h4>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {new Date(n.created_at).toLocaleDateString()} {new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>{n.message}</p>
                      </div>
                      {!n.is_read && (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Bell size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                  <p>You have no notifications yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==========================================
           TAB: CREATE JOB (MULTI-STEP JOB CREATOR)
           ========================================== */}
        {activeTab === 'create-job' && (
          <JobCreationWizard
            companyState={companyState}
            accessStatus={accessStatus}
            jobToEdit={editingJob}
            onJobCreated={() => {
              setEditingJob(null);
              fetchJobs();
              if (onJobPublished) onJobPublished();
              setActiveTab('jobs');
            }}
            onViewPlans={() => {
              setActiveTab('billing');
            }}
          />
        )}

        {/* ==========================================
           TAB: APPLICANTS (CANDIDATES PIPELINE TABLE)
           ========================================== */}
        {activeTab === 'applicants' && (
          <div>
            <div className="ed-page-header">
              <div>
                <h1 className="ed-title">Job Candidates & Applicants</h1>
                <p className="ed-subtitle">Review resume scores, matching ratios, and pipeline positions.</p>
              </div>
            </div>

            {/* Filter controls */}
            <div className="ed-filter-bar">
              <div className="ed-filter-left">
                <div className="ed-search-wrapper">
                  <Search size={14} className="ed-search-icon" />
                  <input 
                    type="text" 
                    placeholder="Search candidate or job..." 
                    className="ed-input ed-search-input"
                    value={candSearch}
                    onChange={(e) => setCandSearch(e.target.value)}
                  />
                </div>

                <select 
                  className="ed-select" 
                  style={{ width: '160px' }}
                  value={candStatusFilter}
                  onChange={(e) => setCandStatusFilter(e.target.value)}
                >
                  <option value="all">Pipeline: All</option>
                  <option value="new">New</option>
                  <option value="viewed">Viewed</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interview">Interview</option>
                  <option value="selected">Selected</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Applicants Grid / Table */}
            <div className="ed-table-container">
              <table className="ed-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>AI Match Score</th>
                    <th>Experience</th>
                    <th>Key Skills</th>
                    <th>Applied Job</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCandidates.length > 0 ? (
                    filteredCandidates.map(cand => (
                      <tr key={cand.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--ed-primary-light)', color: 'var(--ed-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                              {cand.avatar}
                            </div>
                            <div>
                              <div style={{ fontWeight: '700', color: 'var(--ed-text-primary)' }}>{cand.name}</div>
                              <div style={{ fontSize: '11px', color: 'var(--ed-text-muted)' }}>{cand.location}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: '800', color: cand.aiMatchScore >= 90 ? 'var(--ed-success)' : 'var(--ed-warning)' }}>
                              {cand.aiMatchScore}%
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--ed-text-muted)' }}>Match</span>
                          </div>
                        </td>
                        <td>{cand.experienceYears} Years</td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px', maxWidth: '200px', flexWrap: 'wrap' }}>
                            {cand.skills.slice(0, 3).map(skill => (
                              <span key={skill} style={{ fontSize: '10.5px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: 'var(--ed-text-secondary)' }}>{skill}</span>
                            ))}
                            {cand.skills.length > 3 && <span style={{ fontSize: '10px', color: 'var(--ed-text-muted)', alignSelf: 'center' }}>+{cand.skills.length - 3} more</span>}
                          </div>
                        </td>
                        <td style={{ fontSize: '13px', fontWeight: '600' }}>{cand.appliedJobTitle}</td>
                        <td>
                          <span className={`ed-status-badge ${cand.status}`}>
                            {cand.status}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="ed-btn ed-btn-outline ed-btn-sm"
                            onClick={() => {
                              setSelectedCandidate(cand);
                              setCandProfileTab('resume');
                            }}
                          >
                            View Profile
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--ed-text-muted)' }}>
                        <Info size={28} style={{ margin: '0 auto 12px', display: 'block' }} />
                        No candidates matched your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==========================================
           TAB: TALENT SEARCH (GLOBAL CANDIDATE POOL)
           ========================================== */}
        {activeTab === 'talent-search' && (
          <TalentSearchTab />
        )}

        {/* ==========================================
           TAB: AI CANDIDATE MATCHING
           ========================================== */}
        {activeTab === 'ai-matching' && (
          <div>
            <div className="ed-page-header">
              <div>
                <h1 className="ed-title">AI Candidate Matching Insights</h1>
                <p className="ed-subtitle">GetWorxs smart matching algorithm parsing skillsets, roles, and cultural alignment.</p>
              </div>
            </div>

            <div className="ed-card mb-4" style={{ display: 'flex', gap: '16px', background: 'linear-gradient(135deg, #f5f3ff 0%, #fff1f2 100%)', border: '1px solid rgba(109, 40, 217, 0.15)' }}>
              <Sparkles size={24} style={{ color: 'var(--ed-primary)', flexShrink: 0 }} />
              <div>
                <h4 style={{ fontWeight: '800', color: 'var(--ed-primary)' }}>Why trust GetWorxs AI?</h4>
                <p style={{ fontSize: '13px', color: 'var(--ed-text-secondary)', marginTop: '4px' }}>
                  Our models evaluate technical skills, stack depth, region suitability, and job history compatibility. Candidates with score tags above **90%** have been verified to match senior architect roles within a 95% threshold.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {candidates.map(cand => (
                <div key={cand.id} className="ed-card" style={{ display: 'grid', gridTemplateColumns: '80px 1fr 200px', gap: '20px', alignItems: 'center' }}>
                  
                  <div className="ed-ai-score-ring" style={{ width: '60px', height: '60px', border: '3px solid var(--ed-primary)' }}>
                    <div className="ed-ai-score-inner" style={{ width: '50px', height: '50px', fontSize: '14px' }}>{cand.aiMatchScore}%</div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '800' }}>{cand.name}</h3>
                      <span className={`ed-status-badge ${cand.status}`} style={{ transform: 'scale(0.85)', transformOrigin: 'left' }}>{cand.status}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--ed-text-secondary)', marginTop: '4px' }}>
                      Applied for: <strong>{cand.appliedJobTitle}</strong> • Location: {cand.location}
                    </p>
                    
                    {/* Skills match mapping */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--ed-text-muted)' }}>Skills Match:</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {cand.skills.map(skill => (
                          <span key={skill} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10.5px', background: 'rgba(5, 150, 105, 0.08)', color: 'var(--ed-success)', padding: '2px 8px', borderRadius: '4px', fontWeight: '600' }}>
                            <Check size={10} />
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderLeft: '1px solid var(--ed-border)', paddingLeft: '20px' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--ed-text-muted)' }}>EXP LEVEL</span>
                      <span style={{ fontWeight: '700', fontSize: '13px' }}>{cand.experienceYears} Years</span>
                    </div>
                    <button 
                      className="ed-btn ed-btn-primary ed-btn-sm" 
                      onClick={() => {
                        setSelectedCandidate(cand);
                        setCandProfileTab('resume');
                      }}
                    >
                      Analyze Profile
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================
           TAB: INTERVIEWS (CALENDAR & SCHEDULER)
           ========================================== */}
        {activeTab === 'interviews' && (
          <div>
            <div className="ed-page-header">
              <div>
                <h1 className="ed-title">Interview Calendar</h1>
                <p className="ed-subtitle">Schedule, modify, and review video/onsite interviews with global applicants.</p>
              </div>
            </div>

            <div className="ed-dashboard-grid">
              
              {/* Calendar Grid Mock */}
              <div className="ed-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800' }}>July 2026</h3>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="ed-btn ed-btn-outline ed-btn-sm" style={{ padding: '4px 8px' }}>&lt;</button>
                    <button className="ed-btn ed-btn-outline ed-btn-sm" style={{ padding: '4px 8px' }}>&gt;</button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', fontSize: '12px' }}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                    <span key={day} style={{ fontWeight: '700', color: 'var(--ed-text-muted)', paddingBottom: '8px', borderBottom: '1px solid var(--ed-border)' }}>{day}</span>
                  ))}
                  
                  {/* Calendar Dates Mock (Starting Monday Jul 27th is active) */}
                  {Array.from({ length: 28 }).map((_, index) => {
                    const date = index + 1;
                    const hasInterview = date === 28 || date === 29; // July 28/29 mock
                    return (
                      <div 
                        key={index} 
                        style={{ 
                          height: '54px', 
                          background: hasInterview ? 'var(--ed-primary-light)' : '#ffffff', 
                          border: '1px solid var(--ed-border)', 
                          borderRadius: '6px', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          justifyContent: 'space-between', 
                          padding: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <span style={{ fontWeight: '700', fontSize: '11px', color: hasInterview ? 'var(--ed-primary)' : 'var(--ed-text-primary)' }}>{date}</span>
                        {hasInterview && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--ed-primary)' }} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upcoming Interview List */}
              <div className="ed-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '800' }}>Interviews (Today / Tomorrow)</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ padding: '16px', background: '#f8fafc', border: '1px solid var(--ed-border)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="ed-status-badge viewed" style={{ padding: '2px 6px', fontSize: '10px' }}>Video Call</span>
                      <span style={{ fontSize: '11px', color: 'var(--ed-text-muted)' }}>Jul 28, 3:30 PM</span>
                    </div>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', marginTop: '8px' }}>Aishwarya Nair</h4>
                    <p style={{ fontSize: '12px', color: 'var(--ed-text-secondary)', marginTop: '2px' }}>Senior React Developer technical rounds</p>
                    
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button className="ed-btn ed-btn-primary ed-btn-sm" style={{ flex: 1, padding: '4px' }} onClick={() => alert('Launching Google Meet Video Room...')}>Join Google Meet</button>
                    </div>
                  </div>

                  <div style={{ padding: '16px', background: '#f8fafc', border: '1px solid var(--ed-border)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="ed-status-badge viewed" style={{ padding: '2px 6px', fontSize: '10px' }}>Portfolio Review</span>
                      <span style={{ fontSize: '11px', color: 'var(--ed-text-muted)' }}>Jul 29, 10:00 AM</span>
                    </div>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', marginTop: '8px' }}>Marcus Vance</h4>
                    <p style={{ fontSize: '12px', color: 'var(--ed-text-secondary)', marginTop: '2px' }}>Lead Product Designer portfolio deck walk</p>
                    
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <button className="ed-btn ed-btn-primary ed-btn-sm" style={{ flex: 1, padding: '4px' }} onClick={() => alert('Launching Zoom Video Room...')}>Join Zoom Call</button>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ==========================================
           TAB: MESSAGES (INBOX & CHAT)
           ========================================== */}
        {activeTab === 'messages' && (
          <div>
            <div className="ed-page-header">
              <div>
                <h1 className="ed-title">Recruiter Inbox & Candidate Chat</h1>
                <p className="ed-subtitle">Manage communication pipelines, send offers, and customize templates.</p>
              </div>
            </div>

            <div className="ed-messages-grid">
              
              {/* Sidebar threads */}
              <div className="ed-msg-threads">
                {threads.map(thread => (
                  <div 
                    key={thread.id} 
                    className={`ed-msg-thread-item ${thread.id === activeThreadId ? 'active' : ''}`}
                    onClick={() => {
                      setActiveThreadId(thread.id);
                      // Mark read
                      setThreads(threads.map(t => t.id === thread.id ? { ...t, unread: false } : t));
                    }}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--ed-primary-light)', color: 'var(--ed-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                      {thread.avatar}
                    </div>
                    <div className="ed-msg-thread-details">
                      <div className="ed-msg-thread-header">
                        <span className="ed-msg-name">{thread.candidateName}</span>
                        {thread.unread && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--ed-accent)' }} />}
                      </div>
                      <p className="ed-msg-excerpt">{thread.excerpt}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat pane */}
              <div className="ed-msg-chat-pane">
                {activeThread ? (
                  <>
                    <div className="ed-msg-chat-header">
                      <div>
                        <h4 style={{ fontSize: '14.5px', fontWeight: '800' }}>{activeThread.candidateName}</h4>
                        <span style={{ fontSize: '11px', color: 'var(--ed-text-muted)' }}>Online • Conversation on GetWorxs Messenger</span>
                      </div>

                      {/* Dropdown template selector */}
                      <div>
                        <select 
                          className="ed-select" 
                          style={{ width: '180px', padding: '6px 10px', fontSize: '12px' }}
                          value={selectedTemplate}
                          onChange={(e) => setSelectedTemplate(e.target.value)}
                        >
                          <option value="">Choose Template...</option>
                          <option value="invite">Onsite Interview Invitation</option>
                          <option value="offer">Extend Offer Letter</option>
                          <option value="reject">Candidate Rejection Notice</option>
                        </select>
                      </div>
                    </div>

                    <div className="ed-msg-history">
                      {activeThread.messages.map(msg => (
                        <div 
                          key={msg.id} 
                          className={`ed-chat-bubble ${msg.sender === 'recruiter' ? 'outgoing' : 'incoming'}`}
                        >
                          <div>{msg.text}</div>
                          <div style={{ fontSize: '9px', textAlign: 'right', marginTop: '4px', opacity: 0.8 }}>{msg.time}</div>
                        </div>
                      ))}
                    </div>

                    <div className="ed-msg-chat-footer">
                      <div className="ed-msg-input-bar">
                        <button className="ed-btn ed-btn-ghost" style={{ padding: '8px' }} onClick={() => alert('Attachments limit is 5MB. Clicked!')}>
                          <Paperclip size={18} />
                        </button>
                        <input 
                          type="text" 
                          className="ed-input" 
                          placeholder="Type your message here..."
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                        />
                        <button className="ed-btn ed-btn-primary" style={{ padding: '10px' }} onClick={handleSendMessage}>
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--ed-text-muted)' }}>
                    <MessageSquare size={32} style={{ marginBottom: '12px' }} />
                    <span>Select a chat thread to view conversations.</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
           TAB: ANALYTICS (VISUAL FUNNEL CHARTS)
           ========================================== */}
        {activeTab === 'analytics' && (
          <div>
            <div className="ed-page-header">
              <div>
                <h1 className="ed-title">Recruiting Analytics</h1>
                <p className="ed-subtitle">Performance tracking on conversion, source pipeline efficiency, and time-to-hire metrics.</p>
              </div>
            </div>

            <div className="ed-dashboard-grid">
              
              {/* Funnel chart breakdown */}
              <div className="ed-card">
                <h3 className="ed-sidebar-prof-name" style={{ fontSize: '16px' }}>Hiring Conversion Funnel</h3>
                <p className="ed-subtitle">Applicant drop-off ratios per stage</p>
                <div className="ed-funnel-container" style={{ marginTop: '24px' }}>
                  <div className="ed-funnel-row">
                    <span className="ed-funnel-label">Sourced (100%)</span>
                    <div className="ed-funnel-bar-wrapper">
                      <div className="ed-funnel-bar" style={{ width: '100%' }} />
                      <span className="ed-funnel-value">250 candidates</span>
                    </div>
                  </div>
                  <div className="ed-funnel-row">
                    <span className="ed-funnel-label">Screened (68%)</span>
                    <div className="ed-funnel-bar-wrapper">
                      <div className="ed-funnel-bar stage-2" style={{ width: '68%' }} />
                      <span className="ed-funnel-value">170 candidates</span>
                    </div>
                  </div>
                  <div className="ed-funnel-row">
                    <span className="ed-funnel-label">Interviews (28%)</span>
                    <div className="ed-funnel-bar-wrapper">
                      <div className="ed-funnel-bar stage-3" style={{ width: '28%' }} />
                      <span className="ed-funnel-value">70 candidates</span>
                    </div>
                  </div>
                  <div className="ed-funnel-row">
                    <span className="ed-funnel-label">Offers (6%)</span>
                    <div className="ed-funnel-bar-wrapper">
                      <div className="ed-funnel-bar stage-4" style={{ width: '6%' }} />
                      <span className="ed-funnel-value">15 offers</span>
                    </div>
                  </div>
                  <div className="ed-funnel-row">
                    <span className="ed-funnel-label">Hired (4.8%)</span>
                    <div className="ed-funnel-bar-wrapper">
                      <div className="ed-funnel-bar stage-5" style={{ width: '4.8%' }} />
                      <span className="ed-funnel-value">12 hires</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time to Hire & Cost Metrics */}
              <div className="ed-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 className="ed-sidebar-prof-name" style={{ fontSize: '16px' }}>Key Metrics Indicators</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--ed-border)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--ed-text-muted)', fontWeight: '700' }}>TIME TO HIRE</span>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--ed-primary)', marginTop: '4px' }}>18 Days</h2>
                    <span style={{ fontSize: '11px', color: 'var(--ed-success)' }}>⚡ Fast (top 10% sector)</span>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--ed-border)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--ed-text-muted)', fontWeight: '700' }}>COST PER HIRE</span>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--ed-primary)', marginTop: '4px' }}>$1,200</h2>
                    <span style={{ fontSize: '11px', color: 'var(--ed-success)' }}>↘ 12% lower than Q1</span>
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>Application Channels</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span>GetWorxs Platform</span>
                      <span style={{ fontWeight: '700' }}>65%</span>
                    </div>
                    <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '65%', background: 'var(--ed-primary)' }} />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Performance summaries */}
            <div className="ed-card">
              <h3 className="ed-sidebar-prof-name" style={{ fontSize: '16px', marginBottom: '16px' }}>Top Performing Postings</h3>
              <div className="ed-table-container" style={{ margin: 0 }}>
                <table className="ed-table">
                  <thead>
                    <tr>
                      <th>Job Post</th>
                      <th>Views</th>
                      <th>Apply Rate</th>
                      <th>Interview Rate</th>
                      <th>Pipeline Conversion</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: '700' }}>Senior React Developer</td>
                      <td>1,240 views</td>
                      <td>18% (Excellent)</td>
                      <td>12%</td>
                      <td>
                        <div style={{ width: '80px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: '85%', background: 'var(--ed-success)' }} />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: '700' }}>Lead UI/UX Architect</td>
                      <td>850 views</td>
                      <td>14.5%</td>
                      <td>9%</td>
                      <td>
                        <div style={{ width: '80px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: '60%', background: 'var(--ed-success)' }} />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
           TAB: COMPANY PROFILE
           ========================================== */}
        {activeTab === 'profile' && (
          <div>
            <div className="ed-page-header">
              <div>
                <h1 className="ed-title">Company Profile</h1>
                <p className="ed-subtitle">Build employer branding elements visible to active job seekers.</p>
              </div>
            </div>

            <div className="ed-card mb-4" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ height: '140px', background: 'linear-gradient(90deg, var(--ed-primary), #8b5cf6)', position: 'relative' }}>
                <button className="ed-btn ed-btn-outline ed-btn-sm" style={{ position: 'absolute', right: '16px', top: '16px', background: 'rgba(255, 255, 255, 0.25)', color: '#ffffff', borderColor: 'transparent' }} onClick={() => alert('Simulating cover banner upload...')}>Change Cover Banner</button>
              </div>
              <div style={{ padding: '24px', display: 'flex', gap: '20px', position: 'relative', marginTop: '-40px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: '#ffffff', border: '3px solid #ffffff', boxShadow: 'var(--ed-shadow-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '24px', color: 'var(--ed-primary)' }}>
                  {companyState.name ? companyState.name.substring(0, 1).toUpperCase() : 'C'}
                </div>
                <div style={{ marginTop: '40px', flex: 1 }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '800' }}>{companyState.name || 'Company Name'}</h2>
                  <p style={{ fontSize: '12px', color: 'var(--ed-text-muted)' }}>{companyState.is_verified ? 'Verified Global Enterprise Partner' : 'Verification Pending'}</p>
                </div>
              </div>
            </div>

            <div className="ed-card">
              <h3 className="ed-sidebar-prof-name" style={{ fontSize: '16px', marginBottom: '20px' }}>Branding General Details</h3>
              
              <div className="ed-form-group">
                <label className="ed-label">About the Company</label>
                <textarea 
                  className="ed-textarea" 
                  rows={4} 
                  value={profileAbout}
                  onChange={(e) => setProfileAbout(e.target.value)}
                  placeholder="Provide a description of your company..."
                />
              </div>

              <div className="grid-2">
                <div className="ed-form-group">
                  <label className="ed-label">Culture & Mission</label>
                  <input 
                    type="text" 
                    className="ed-input" 
                    value={profileCulture} 
                    onChange={(e) => setProfileCulture(e.target.value)} 
                    placeholder="Company vision or mission..."
                  />
                </div>
                <div className="ed-form-group">
                  <label className="ed-label">Social Links (Website)</label>
                  <input 
                    type="text" 
                    className="ed-input" 
                    value={profileWebsite} 
                    onChange={(e) => setProfileWebsite(e.target.value)} 
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="grid-2">
                <div className="ed-form-group">
                  <label className="ed-label">Primary Office Hubs</label>
                  <input 
                    type="text" 
                    className="ed-input" 
                    value={profileOfficeHubs} 
                    onChange={(e) => setProfileOfficeHubs(e.target.value)} 
                    placeholder="e.g. City, State, Country"
                  />
                </div>
                <div className="ed-form-group">
                  <label className="ed-label">Company Size</label>
                  <select 
                    className="ed-select"
                    value={profileCompanySize}
                    onChange={(e) => setProfileCompanySize(e.target.value)}
                  >
                    <option value="1-10">1 - 10 employees</option>
                    <option value="10-50">10 - 50 employees</option>
                    <option value="50-200">50 - 200 employees</option>
                    <option value="200-1000">200 - 1,000 employees</option>
                    <option value="1000+">1,000 - 5,000 employees</option>
                    <option value="10,000+ employees">10,000+ employees</option>
                    <option value="1,000 - 5,000 employees">1,000 - 5,000 employees</option>
                    <option value="200 - 1,000 employees">200 - 1,000 employees</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button className="ed-btn ed-btn-primary" onClick={handleSaveBranding}>Save Branding Details</button>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
           TAB: SUBSCRIPTION & BILLING
           ========================================== */}
        {activeTab === 'billing' && (() => {
          const activeSub = accessStatus?.active_subscription;
          const planObj = activeSub?.plan;
          const planName = planObj?.name || 'Professional Plan';
          const planStatus = activeSub?.status ? (activeSub.status.charAt(0).toUpperCase() + activeSub.status.slice(1)) : 'Active';
          const priceUsd = planObj?.price_usd ?? 499;
          const priceInr = planObj?.price_inr ?? 39999;
          const jobLimit = planObj?.job_posting_limit ?? 100;
          const recruiterLimit = planObj?.recruiter_limit ?? 10;
          const aiCreditsLimit = planObj?.ai_credits ?? 1000;
          const aiCreditsUsed = activeSub?.ai_credits_used ?? 420;
          const recruitersCount = activeSub?.recruiters_count ?? 2;
          const expiresDate = activeSub?.end_date
            ? new Date(activeSub.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
            : '31 Dec 2026';
          const activeJobCount = jobs.filter(j => j.status === 'active').length;

          return (
            <div>
              <div className="ed-page-header">
                <div>
                  <h1 className="ed-title">Subscription & Usage</h1>
                  <p className="ed-subtitle">Manage plan levels, quotas, team seats, and billing invoices.</p>
                </div>
              </div>

              <div className="ed-dashboard-grid">
                {/* Current plan metrics */}
                <div className="ed-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className="ed-status-badge active" style={{ fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', background: '#dcfce7', color: '#15803d' }}>
                        Current Plan: {planName}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '20px', background: '#e0f2fe', color: '#0369a1' }}>
                        Status: {planStatus}
                      </span>
                    </div>

                    {/* Currency Selector Dropdown */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ed-text-muted)' }}>Currency:</label>
                      <select
                        value={subscriptionCurrency}
                        onChange={(e) => setSubscriptionCurrency(e.target.value as 'USD' | 'INR')}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '8px',
                          border: '1.5px solid var(--ed-primary, #6d28d9)',
                          background: '#ffffff',
                          fontWeight: 700,
                          fontSize: '12.5px',
                          color: 'var(--ed-primary, #6d28d9)',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="USD">USD ($)</option>
                        <option value="INR">INR (₹)</option>
                      </select>
                    </div>
                  </div>

                  <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--ed-text-primary)' }}>
                    {subscriptionCurrency === 'USD' ? `$${priceUsd} / month` : `₹${priceInr.toLocaleString('en-IN')} / month`}
                  </h2>
                  <p className="ed-subtitle">Expires: <strong>{expiresDate}</strong></p>

                  <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                        <span>Jobs Usage</span>
                        <span>{activeJobCount} / {jobLimit === -1 ? 'Unlimited' : jobLimit} jobs</span>
                      </div>
                      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${jobLimit === -1 ? 15 : Math.min(100, (activeJobCount / jobLimit) * 100)}%`, background: 'var(--ed-primary)' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                        <span>Recruiters Usage</span>
                        <span>{recruitersCount} / {recruiterLimit === -1 ? 'Unlimited' : recruiterLimit} seats</span>
                      </div>
                      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${recruiterLimit === -1 ? 20 : Math.min(100, (recruitersCount / recruiterLimit) * 100)}%`, background: '#2563eb' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                        <span>AI Credits</span>
                        <span>{aiCreditsUsed} / {aiCreditsLimit.toLocaleString()} credits</span>
                      </div>
                      <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.min(100, (aiCreditsUsed / aiCreditsLimit) * 100)}%`, background: '#059669' }} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '24px', flexWrap: 'wrap' }}>
                    <button className="ed-btn ed-btn-primary ed-btn-sm" onClick={() => setShowPlansModal(true)}>
                      Upgrade Plan
                    </button>
                    <button className="ed-btn ed-btn-outline ed-btn-sm" onClick={() => setShowPlansModal(true)}>
                      Renew Plan
                    </button>
                    <button className="ed-btn ed-btn-outline ed-btn-sm" onClick={() => {
                      const invoicesSection = document.getElementById('billing-invoices');
                      if (invoicesSection) invoicesSection.scrollIntoView({ behavior: 'smooth' });
                      else alert('Viewing billing invoices & payment receipts.');
                    }}>
                      View Billing
                    </button>
                  </div>
                </div>

                {/* Invoices List */}
                <div className="ed-card">
                  <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>Billing Invoices</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--ed-border)' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '13px' }}>Invoice #GW-9821</div>
                        <div style={{ fontSize: '11px', color: 'var(--ed-text-muted)' }}>
                          Paid {subscriptionCurrency === 'USD' ? `$${priceUsd}` : `₹${priceInr.toLocaleString('en-IN')}`} on Jul 15, 2026
                        </div>
                      </div>
                      <button className="ed-btn ed-btn-ghost ed-btn-sm" style={{ padding: '6px' }} onClick={() => alert('Downloading invoice PDF GW-9821...')}><FileDown size={16} /></button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--ed-border)' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '13px' }}>Invoice #GW-9704</div>
                        <div style={{ fontSize: '11px', color: 'var(--ed-text-muted)' }}>
                          Paid {subscriptionCurrency === 'USD' ? `$${priceUsd}` : `₹${priceInr.toLocaleString('en-IN')}`} on Jun 15, 2026
                        </div>
                      </div>
                      <button className="ed-btn ed-btn-ghost ed-btn-sm" style={{ padding: '6px' }} onClick={() => alert('Downloading invoice PDF GW-9704...')}><FileDown size={16} /></button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          );
        })()}


        {/* ==========================================
           TAB: SETTINGS
           ========================================== */}
        {activeTab === 'settings' && (
          <div>
            <div className="ed-page-header">
              <div>
                <h1 className="ed-title">Settings & Access Control</h1>
                <p className="ed-subtitle">Manage recruiter roles, configure security settings, and generate API keys.</p>
              </div>
            </div>

            <div className="ed-dashboard-grid">
              
              {/* General Settings */}
              <div className="ed-card">
                <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>General Settings</h3>
                <div className="ed-form-group">
                  <label className="ed-label">Company Name</label>
                  <input 
                    type="text" 
                    className="ed-input" 
                    value={settings.companyName}
                    onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  />
                </div>
                <div className="ed-form-group">
                  <label className="ed-label">Company Size</label>
                  <select 
                    className="ed-select"
                    value={settings.companySize}
                    onChange={(e) => setSettings({ ...settings, companySize: e.target.value })}
                  >
                    <option value="1-10">1-10 Employees</option>
                    <option value="10-50">10-50 Employees</option>
                    <option value="50-200">50-200 Employees</option>
                    <option value="200-1000">200-1000 Employees</option>
                    <option value="1000+">1000+ Employees</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={settings.allowApiAccess}
                      onChange={(e) => setSettings({ ...settings, allowApiAccess: e.target.checked })}
                    />
                    Enable ATS Integrations API access
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={settings.notificationEmails}
                      onChange={(e) => setSettings({ ...settings, notificationEmails: e.target.checked })}
                    />
                    Receive candidate notification emails
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={settings.requireMfa}
                      onChange={(e) => setSettings({ ...settings, requireMfa: e.target.checked })}
                    />
                    Require MFA for recruiter logins
                  </label>
                </div>
              </div>

              {/* Recruiter team list */}
              <div className="ed-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Recruiting Team</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="ed-btn ed-btn-outline ed-btn-sm" onClick={() => setShowOutboxModal(true)} title="View sent invitation emails & SMTP dispatch logs">
                      <Mail size={14} />
                      <span>Email Outbox & Logs</span>
                    </button>
                    <button className="ed-btn ed-btn-primary ed-btn-sm" onClick={() => {
                      const activeSub = accessStatus?.active_subscription;
                      const limit = activeSub?.plan?.recruiter_limit ?? 2;
                      const count = activeSub?.recruiters_count ?? 2;
                      if (limit !== -1 && count >= limit) {
                        setShowRecruiterLimitModal(true);
                      } else {
                        setShowInviteModal(true);
                      }
                    }}>
                      <Plus size={14} />
                      <span>Invite Recruiter</span>
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {team.length === 0 && (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'var(--ed-text-muted)', fontSize: '13px' }}>
                      No recruiters invited yet. Click <strong>Invite Recruiter</strong> to get started.
                    </div>
                  )}
                  {team.map(member => {
                    const statusColor =
                      member.status === 'Invited' || member.status === 'Active'
                        ? { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' }
                        : member.status === 'Email Failed'
                        ? { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' }
                        : { bg: '#fef9c3', text: '#92400e', border: '#fde68a' }; // Pending
                    const canResend = member.status === 'Email Failed' || member.status === 'Pending';
                    return (
                    <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: member.status === 'Email Failed' ? '1px solid #fecaca' : '1px solid var(--ed-border)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', fontSize: '13.5px' }}>{member.name}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--ed-text-muted)' }}>{member.email}</div>
                        {member.status === 'Email Failed' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '11px', color: '#b91c1c' }}>
                            <AlertTriangle size={11} />
                            <span>Invitation email failed to send — use Resend Invitation to retry.</span>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                        <select
                          className="ed-select"
                          style={{ width: '110px', padding: '4px 8px', fontSize: '11px' }}
                          value={member.role}
                          onChange={(e) => {
                            const newRole = e.target.value as 'Admin' | 'Recruiter' | 'Interviewer';
                            setTeam(team.map(t => t.id === member.id ? { ...t, role: newRole } : t));
                          }}
                        >
                          <option>Admin</option>
                          <option>Recruiter</option>
                          <option>Interviewer</option>
                        </select>
                        <span style={{
                          fontSize: '10.5px',
                          fontWeight: '700',
                          padding: '3px 8px',
                          borderRadius: '999px',
                          background: statusColor.bg,
                          color: statusColor.text,
                          border: `1px solid ${statusColor.border}`,
                          whiteSpace: 'nowrap',
                        }}>
                          {member.status}
                        </span>
                        {canResend && (
                          <button
                            className="ed-btn ed-btn-outline ed-btn-sm"
                            style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', borderColor: '#6d28d9', color: '#6d28d9' }}
                            title={`Resend invitation email to ${member.email}`}
                            disabled={isResending === member.email}
                            onClick={() => handleResendInvite(member.email)}
                          >
                            <RefreshCcw size={12} style={{ animation: isResending === member.email ? 'spin 1s linear infinite' : 'none' }} />
                            {isResending === member.email ? 'Sending...' : 'Resend Invite'}
                          </button>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>

              {/* API Security control */}
              <div className="ed-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Developer API Keys</h3>
                <p className="ed-subtitle">Integrate GetWorxs candidates directly into Lever, Greenhouse, or Ashby ATS endpoints.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {apiKeys.map(keyItem => (
                    <div key={keyItem.key} style={{ padding: '12px', background: '#f8fafc', border: '1px solid var(--ed-border)', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '700', fontSize: '12.5px' }}>{keyItem.label}</span>
                        <button 
                          className="ed-btn ed-btn-ghost ed-btn-sm" 
                          style={{ padding: '4px', color: 'var(--ed-accent)' }}
                          onClick={() => setApiKeys([])}
                        >
                          Revoke
                        </button>
                      </div>
                      <code style={{ fontSize: '11px', display: 'block', background: '#ffffff', padding: '6px 8px', border: '1px solid var(--ed-border)', borderRadius: '4px', marginTop: '6px', overflowX: 'auto' }}>
                        {keyItem.key}
                      </code>
                    </div>
                  ))}
                </div>

                <button 
                  className="ed-btn ed-btn-outline ed-btn-sm" 
                  onClick={() => {
                    const label = prompt('Enter API key name:');
                    if (label) {
                      setApiKeys([...apiKeys, { key: `gw_live_${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 4)}`, label, created: '2026-07-27' }]);
                    }
                  }}
                >
                  <Key size={14} style={{ marginRight: '6px' }} />
                  <span>Generate API Key</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* ==========================================
         SUB-COMPONENT: CANDIDATE PROFILE SLIDE-DRAWER
         ========================================== */}
      {selectedCandidate && (
        <div className="ed-drawer-overlay" onClick={() => setSelectedCandidate(null)}>
          <div className="ed-drawer" onClick={(e) => e.stopPropagation()}>
            
            <div className="ed-drawer-header">
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '800' }}>{selectedCandidate.name}</h2>
                <p style={{ fontSize: '12px', color: 'var(--ed-text-secondary)' }}>
                  Applying for: <strong>{selectedCandidate.appliedJobTitle}</strong>
                </p>
              </div>
              <button className="ed-btn ed-btn-ghost" style={{ padding: '8px' }} onClick={() => setSelectedCandidate(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="ed-drawer-body">
              
              {/* Scoring banner */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--ed-primary-light)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(109, 40, 217, 0.15)' }}>
                <Sparkles size={22} style={{ color: 'var(--ed-primary)' }} />
                <div>
                  <span style={{ fontWeight: '800', color: 'var(--ed-primary)' }}>AI Matching Score: {selectedCandidate.aiMatchScore}%</span>
                  <p style={{ fontSize: '11.5px', color: 'var(--ed-text-secondary)', marginTop: '2px' }}>
                    Candidate holds required stack skills and has {selectedCandidate.experienceYears} years experience in equivalent segments.
                  </p>
                </div>
              </div>

              {/* Sub tabs nav */}
              <div className="ed-tabs-nav">
                <button className={`ed-tab-btn ${candProfileTab === 'resume' ? 'active' : ''}`} onClick={() => setCandProfileTab('resume')}>Resume Details</button>
                <button className={`ed-tab-btn ${candProfileTab === 'timeline' ? 'active' : ''}`} onClick={() => setCandProfileTab('timeline')}>Timeline Activity</button>
                <button className={`ed-tab-btn ${candProfileTab === 'notes' ? 'active' : ''}`} onClick={() => setCandProfileTab('notes')}>Recruiter Notes ({selectedCandidate.interviewNotes.length})</button>
              </div>

              {/* Tab: Resume */}
              {candProfileTab === 'resume' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--ed-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>CONTACT</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={13} /> {selectedCandidate.email}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={13} /> {selectedCandidate.phone}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={13} /> {selectedCandidate.location}</div>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--ed-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>EDUCATION</span>
                    <div style={{ fontSize: '13px', marginTop: '6px', fontWeight: '600' }}>{selectedCandidate.education}</div>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--ed-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>EXPERIENCE SUMMARY</span>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--ed-border)', marginTop: '6px' }}>
                      <div style={{ fontWeight: '700', fontSize: '13.5px' }}>{selectedCandidate.currentRole}</div>
                      <div style={{ fontSize: '12px', color: 'var(--ed-text-muted)', marginBottom: '6px' }}>{selectedCandidate.currentCompany} ({selectedCandidate.experienceYears}y exp)</div>
                      <p style={{ fontSize: '12.5px', color: 'var(--ed-text-secondary)' }}>
                        Led architectural upgrades and frontend component libraries matching system design criteria. Developed features using React, TypeScript, and microservices logic.
                      </p>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--ed-text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>KEY TECH SKILLS</span>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {selectedCandidate.skills.map(skill => (
                        <span key={skill} style={{ fontSize: '11px', background: '#f1f5f9', color: 'var(--ed-text-primary)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--ed-border)' }}>{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Timeline */}
              {candProfileTab === 'timeline' && (
                <div className="ed-timeline">
                  {selectedCandidate.timeline.map(event => (
                    <div key={event.id} className="ed-timeline-item">
                      <div className={`ed-timeline-indicator ${event.type}`}>
                        {event.type === 'success' ? <Check size={10} color="#059669" /> : <Clock size={10} color="#d97706" />}
                      </div>
                      <div className="ed-timeline-content">
                        <div className="ed-timeline-title">{event.event}</div>
                        <div className="ed-timeline-meta">{event.date}</div>
                        <div className="ed-timeline-desc">{event.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab: Notes */}
              {candProfileTab === 'notes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      className="ed-input" 
                      placeholder="Add assessment note..." 
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleAddNote(); }}
                    />
                    <button className="ed-btn ed-btn-primary ed-btn-sm" onClick={handleAddNote}>Add Note</button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    {selectedCandidate.interviewNotes.length > 0 ? (
                      selectedCandidate.interviewNotes.map((note, index) => (
                        <div key={index} style={{ padding: '12px', background: '#f8fafc', border: '1px solid var(--ed-border)', borderRadius: '8px', fontSize: '13px' }}>
                          <div>{note}</div>
                          <span style={{ fontSize: '10px', color: 'var(--ed-text-muted)', display: 'block', marginTop: '6px' }}>By Sarah Connor • 2026-07-27</span>
                        </div>
                      ))
                    ) : (
                      <span style={{ fontSize: '13px', color: 'var(--ed-text-muted)', textAlign: 'center', padding: '20px' }}>No notes uploaded yet. Add above!</span>
                    )}
                  </div>
                </div>
              )}

              {/* Scheduling Drawer overlay */}
              {isScheduling && (
                <div style={{ border: '1px solid var(--ed-border)', borderRadius: '8px', padding: '16px', background: '#f8fafc', marginTop: '16px' }}>
                  <h4 style={{ fontSize: '13.5px', fontWeight: '800', marginBottom: '12px' }}>Schedule Video / Deck Review Interview</h4>
                  <form onSubmit={handleScheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div className="grid-2">
                      <div className="ed-form-group">
                        <label className="ed-label">Date</label>
                        <input type="date" required className="ed-input" value={scheduleData.date} onChange={(e) => setScheduleData({...scheduleData, date: e.target.value})} />
                      </div>
                      <div className="ed-form-group">
                        <label className="ed-label">Time</label>
                        <input type="time" required className="ed-input" value={scheduleData.time} onChange={(e) => setScheduleData({...scheduleData, time: e.target.value})} />
                      </div>
                    </div>
                    
                    <div className="grid-2">
                      <div className="ed-form-group">
                        <label className="ed-label">Interviewer</label>
                        <select className="ed-select" value={scheduleData.interviewer} onChange={(e) => setScheduleData({...scheduleData, interviewer: e.target.value})}>
                          <option>Sarah Connor</option>
                          <option>James Carter</option>
                        </select>
                      </div>
                      <div className="ed-form-group">
                        <label className="ed-label">Meeting Type</label>
                        <select className="ed-select" value={scheduleData.type} onChange={(e) => setScheduleData({...scheduleData, type: e.target.value})}>
                          <option>Video Meeting</option>
                          <option>Onsite Interview</option>
                          <option>Technical Assessment</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <button type="button" className="ed-btn ed-btn-ghost ed-btn-sm" onClick={() => setIsScheduling(false)}>Cancel</button>
                      <button type="submit" className="ed-btn ed-btn-primary ed-btn-sm">Save Appointment</button>
                    </div>
                  </form>
                </div>
              )}

            </div>

            <div className="ed-drawer-footer" style={{ gap: '8px', display: 'flex', flexWrap: 'wrap' }}>
              <button className="ed-btn ed-btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => {
                if (selectedCandidate.resumeUrl) {
                  window.open(selectedCandidate.resumeUrl, '_blank');
                } else {
                  alert('No resume uploaded yet.');
                }
              }}>
                <Download size={14} />
                <span>Resume PDF</span>
              </button>
              
              {['new', 'viewed'].includes(selectedCandidate.status) && (
                <button 
                  className="ed-btn ed-btn-outline" 
                  style={{ borderColor: '#10b981', color: '#10b981', flex: 1 }}
                  onClick={() => handleUpdateCandidateStatus(selectedCandidate.id, 'Shortlisted', 'Shortlisted by employer')}
                >
                  Shortlist
                </button>
              )}

              {selectedCandidate.status !== 'rejected' && (
                <button 
                  className="ed-btn ed-btn-outline" 
                  style={{ borderColor: '#ef4444', color: '#ef4444', flex: 1 }}
                  onClick={() => handleUpdateCandidateStatus(selectedCandidate.id, 'Rejected', 'Rejected by employer')}
                >
                  Reject
                </button>
              )}

              {!isScheduling && selectedCandidate.status !== 'rejected' && (
                <button className="ed-btn ed-btn-primary" style={{ flex: 1 }} onClick={() => setIsScheduling(true)}>Schedule Interview</button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ==========================================
         SUB-COMPONENT: INVITE RECRUITER MODAL
         ========================================== */}
      {showInviteModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }} onClick={handleCloseInviteModal}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            background: 'var(--bg-card, #ffffff)',
            borderRadius: '16px',
            border: '1px solid var(--ed-border, #e2e8f0)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            padding: '28px',
            position: 'relative'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Close Button */}
            <button 
              onClick={handleCloseInviteModal}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: 'var(--ed-text-muted, #64748b)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '50%'
              }}
            >
              <X size={20} />
            </button>

            {!inviteSuccessInfo ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: 'rgba(109, 40, 217, 0.12)',
                    color: 'var(--ed-primary, #6d28d9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Mail size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '19px', fontWeight: '800', margin: 0, color: 'var(--ed-text-primary, #0f172a)' }}>
                      Invite Recruiter / Team Member
                    </h3>
                    <p style={{ fontSize: '12.5px', color: 'var(--ed-text-muted, #64748b)', margin: '2px 0 0' }}>
                      Send an invitation with a temporary password to access your company portal.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleInviteRecruiterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="ed-form-group">
                    <label className="ed-label">Recruiter Full Name</label>
                    <input 
                      type="text" 
                      required 
                      className="ed-input" 
                      placeholder="e.g. Sarah Connor"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                    />
                  </div>

                  <div className="ed-form-group">
                    <label className="ed-label">Recruiter Email Address</label>
                    <input 
                      type="email" 
                      required 
                      className="ed-input" 
                      placeholder="e.g. sarah.recruiter@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>

                  <div className="ed-form-group">
                    <label className="ed-label">Recruiter Access Role</label>
                    <select 
                      className="ed-select" 
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as any)}
                    >
                      <option value="Recruiter">Recruiter (Post jobs, manage candidates, schedule interviews)</option>
                      <option value="Admin">Admin (Full access to billing, team management, company settings)</option>
                      <option value="Interviewer">Interviewer (View assigned candidates & submit feedback)</option>
                    </select>
                  </div>

                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    fontSize: '12.5px',
                    color: '#0369a1',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px'
                  }}>
                    <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#0284c7' }} />
                    <div>
                      <strong>Temporary Password Generation:</strong> A secure temporary password will be generated automatically and emailed to the recruiter.
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button 
                      type="button" 
                      className="ed-btn ed-btn-ghost" 
                      onClick={handleCloseInviteModal}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="ed-btn ed-btn-primary" 
                      disabled={isInviting}
                      style={{ minWidth: '140px', justifyContent: 'center' }}
                    >
                      {isInviting ? (
                        <span className="spinner" style={{ width: '16px', height: '16px' }} />
                      ) : (
                        <>
                          <Send size={15} style={{ marginRight: '6px' }} />
                          <span>Send Invitation</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: inviteSuccessInfo.emailSent === false ? '#fee2e2' : '#dcfce7',
                  color: inviteSuccessInfo.emailSent === false ? '#b91c1c' : '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  {inviteSuccessInfo.emailSent === false
                    ? <AlertTriangle size={32} />
                    : <CheckCircle2 size={32} />}
                </div>

                <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 6px', color: 'var(--ed-text-primary, #0f172a)' }}>
                  {inviteSuccessInfo.emailSent === false
                    ? 'Recruiter Account Created'
                    : 'Invitation Email Dispatched!'}
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--ed-text-secondary, #475569)', margin: '0 0 20px' }}>
                  {inviteSuccessInfo.message}
                </p>

                {/* Warning banner when email failed */}
                {inviteSuccessInfo.emailSent === false && inviteSuccessInfo.warning && (
                  <div style={{
                    background: '#fff7ed',
                    border: '1px solid #fed7aa',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    fontSize: '12.5px',
                    color: '#92400e'
                  }}>
                    <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#d97706' }} />
                    <div>
                      <strong>⚠️ Email Not Sent:</strong> {inviteSuccessInfo.warning}
                    </div>
                  </div>
                )}

                <div style={{
                  background: '#f8fafc',
                  border: '1px solid var(--ed-border, #e2e8f0)',
                  borderRadius: '12px',
                  padding: '18px',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  marginBottom: '24px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--ed-text-muted, #64748b)' }}>Company Name:</span>
                    <strong style={{ color: 'var(--ed-text-primary, #0f172a)' }}>{inviteSuccessInfo.companyName}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--ed-text-muted, #64748b)' }}>Recruiter Name:</span>
                    <strong style={{ color: 'var(--ed-text-primary, #0f172a)' }}>{inviteSuccessInfo.name}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--ed-text-muted, #64748b)' }}>Recipient Email:</span>
                    <strong style={{ color: 'var(--ed-text-primary, #0f172a)' }}>{inviteSuccessInfo.email}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: 'var(--ed-text-muted, #64748b)' }}>Assigned Role:</span>
                    <strong style={{ color: 'var(--ed-primary, #6d28d9)' }}>{inviteSuccessInfo.role}</strong>
                  </div>

                  <div style={{ borderTop: '1px solid var(--ed-border, #e2e8f0)', paddingTop: '10px', marginTop: '2px' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--ed-text-muted, #64748b)', display: 'block', marginBottom: '6px' }}>
                      GENERATED TEMPORARY PASSWORD
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <code style={{
                        flex: 1,
                        fontSize: '14px',
                        fontWeight: '700',
                        background: '#ffffff',
                        padding: '8px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        color: '#0f172a',
                        letterSpacing: '0.5px'
                      }}>
                        {inviteSuccessInfo.tempPassword}
                      </code>
                      <button 
                        className="ed-btn ed-btn-outline ed-btn-sm" 
                        onClick={() => {
                          navigator.clipboard.writeText(inviteSuccessInfo.tempPassword);
                          setCopiedPass(true);
                          setTimeout(() => setCopiedPass(false), 2000);
                        }}
                        style={{ padding: '8px 12px' }}
                      >
                        <Copy size={14} style={{ marginRight: '4px' }} />
                        <span>{copiedPass ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  className="ed-btn ed-btn-primary" 
                  style={{ width: '100%', padding: '12px', fontSize: '14px', borderRadius: '10px', justifyContent: 'center' }}
                  onClick={handleCloseInviteModal}
                >
                  Done & Back to Recruiting Team
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ==========================================
         SUB-COMPONENT: EMAIL OUTBOX & DISPATCH LOGS MODAL
         ========================================== */}
      {showOutboxModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }} onClick={() => setShowOutboxModal(false)}>
          <div style={{
            width: '100%',
            maxWidth: '680px',
            background: 'var(--bg-card, #ffffff)',
            borderRadius: '16px',
            border: '1px solid var(--ed-border, #e2e8f0)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            padding: '28px',
            position: 'relative',
            maxHeight: '85vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            
            <button 
              onClick={() => { setShowOutboxModal(false); setPreviewEmailItem(null); }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: 'var(--ed-text-muted, #64748b)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '50%'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(2, 132, 199, 0.12)',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Mail size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '19px', fontWeight: '800', margin: 0, color: 'var(--ed-text-primary, #0f172a)' }}>
                  Email Outbox & Recruiter Dispatches
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--ed-text-muted, #64748b)', margin: '2px 0 0' }}>
                  Inspect dispatched recruiter emails, temporary passwords, and email rendering.
                </p>
              </div>
            </div>

            {previewEmailItem ? (
              <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '20px' }}>
                <button 
                  className="ed-btn ed-btn-ghost ed-btn-sm" 
                  onClick={() => setPreviewEmailItem(null)}
                  style={{ marginBottom: '16px' }}
                >
                  ← Back to Outbox List
                </button>

                <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '20px' }}>
                  <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px', fontSize: '13px' }}>
                    <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a', marginBottom: '6px' }}>
                      Subject: Welcome to GetWorxs - Recruiter Account Invitation
                    </div>
                    <div><strong>From:</strong> GetWorxs Platform &lt;noreply@getworxs.com&gt;</div>
                    <div><strong>To:</strong> {previewEmailItem.name} &lt;{previewEmailItem.email}&gt;</div>
                    <div><strong>Company:</strong> {previewEmailItem.companyName || settings.companyName}</div>
                  </div>

                  <div style={{ fontFamily: 'Arial, sans-serif', color: '#0f172a', lineHeight: '1.6', fontSize: '14px' }}>
                    <h3 style={{ color: '#6d28d9', margin: '0 0 10px' }}>Welcome to GetWorxs Global Talent Platform!</h3>
                    <p>Hello <strong>{previewEmailItem.name}</strong>,</p>
                    <p>You have been invited to join <strong>{previewEmailItem.companyName || settings.companyName}</strong> as a Recruiter / Talent Specialist on GetWorxs.</p>

                    <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '16px', borderRadius: '8px', margin: '16px 0' }}>
                      <p style={{ margin: '0 0 8px 0' }}><strong>Registered Recruiter Email:</strong> {previewEmailItem.email}</p>
                      <p style={{ margin: '0 0 8px 0' }}><strong>Temporary Password:</strong> <code style={{ background: '#ffffff', padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 'bold' }}>{previewEmailItem.tempPassword || 'Recruiter@Temp123!'}</code></p>
                      <p style={{ margin: 0 }}><strong>Sign-In Link:</strong> http://localhost:5173</p>
                    </div>

                    <p style={{ color: '#64748b', fontSize: '12px' }}>This temporary password expires in 7 days. Log in using the Sign In portal and select <strong>Recruiter</strong> role.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  fontSize: '12.5px',
                  color: '#0369a1',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}>
                  <Info size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#0284c7' }} />
                  <div>
                    <strong>Why standard emails aren't in external Gmail/Yahoo inboxes by default:</strong> Real external emails require live SMTP credentials (e.g. Gmail App Password, SendGrid, or AWS SES). Dispatched recruiter emails are logged below with temporary passwords for immediate testing.
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(() => {
                    const invited = JSON.parse(localStorage.getItem('getworxs_invited_recruiters') || '[]');
                    if (invited.length === 0 && team.length === 0) {
                      return (
                        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--ed-text-muted, #64748b)', fontSize: '13px' }}>
                          No recruiter invitation emails sent yet. Use "Invite Recruiter" button to send an invite!
                        </div>
                      );
                    }
                    const combined = [...invited];
                    team.forEach(t => {
                      if (!combined.some(c => c.email && c.email.toLowerCase() === t.email.toLowerCase())) {
                        combined.push({
                          name: t.name,
                          email: t.email,
                          companyName: settings.companyName,
                          role: t.role,
                          tempPassword: 'Recruiter@Temp123!'
                        });
                      }
                    });

                    return combined.map((item, idx) => (
                      <div key={idx} style={{
                        padding: '14px',
                        background: '#f8fafc',
                        border: '1px solid var(--ed-border, #e2e8f0)',
                        borderRadius: '10px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--ed-text-primary, #0f172a)' }}>
                            {item.name} &lt;{item.email}&gt;
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--ed-text-muted, #64748b)', marginTop: '2px' }}>
                            Company: <strong>{item.companyName || settings.companyName}</strong> • Role: <strong>{item.role || 'Recruiter'}</strong>
                          </div>
                          <div style={{ fontSize: '12px', color: '#0284c7', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <ShieldCheck size={13} />
                            <span>Temp Password: <code>{item.tempPassword || 'Recruiter@Temp123!'}</code></span>
                          </div>
                        </div>

                        <button 
                          className="ed-btn ed-btn-outline ed-btn-sm"
                          onClick={() => setPreviewEmailItem(item)}
                          style={{ fontSize: '12px' }}
                        >
                          Preview Email Inbox
                        </button>
                      </div>
                    ));
                  })()}
                </div>

                <div style={{ borderTop: '1px solid var(--ed-border, #e2e8f0)', paddingTop: '16px', marginTop: '8px' }}>
                  <h4 style={{ fontSize: '13.5px', fontWeight: '800', margin: '0 0 6px', color: 'var(--ed-text-primary, #0f172a)' }}>
                    Want Real Physical Emails Sent to External Inboxes?
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--ed-text-muted, #64748b)', margin: '0 0 10px' }}>
                    To send real emails to Gmail / Outlook inboxes over the internet, add SMTP credentials in your backend <code>.env</code> file:
                  </p>
                  <code style={{ display: 'block', padding: '10px 12px', background: '#0f172a', color: '#38bdf8', borderRadius: '8px', fontSize: '11.5px' }}>
                    SMTP_HOST="smtp.gmail.com"<br/>
                    SMTP_PORT=587<br/>
                    SMTP_USER="your-email@gmail.com"<br/>
                    SMTP_PASSWORD="your-app-password"<br/>
                    EMAILS_FROM_EMAIL="your-email@gmail.com"
                  </code>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* Subscription Modals */}
      <SubscriptionPlansModal

        isOpen={showPlansModal}
        onClose={() => setShowPlansModal(false)}
        onSelectPlan={(plan, currency) => {
          setSelectedPlanForCheckout(plan);
          setCheckoutCurrency(currency);
          setShowPlansModal(false);
          setShowCheckoutModal(true);
        }}
        currencyCode={checkoutCurrency}
        reasonMessage={!accessStatus.is_dashboard_unlocked ? accessStatus.message : undefined}
        isExpired={accessStatus.subscription_status === 'EXPIRED'}
      />

      <SubscriptionCheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        plan={selectedPlanForCheckout}
        currency={checkoutCurrency}
        onPaymentSuccess={(subData) => {
          setShowCheckoutModal(false);
          setAccessStatus(subData);
        }}
      />

      {showRecruiterLimitModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #f1f5f9',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#fff7ed',
              border: '2px solid #ffedd5',
              color: '#ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto'
            }}>
              <AlertTriangle size={32} />
            </div>
            
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0' }}>
              Recruiter Seat Limit Reached
            </h3>
            
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6', margin: '0 0 24px 0' }}>
              Your current subscription plan has reached its recruiter seat limit. Upgrade your plan to invite more team members.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                className="ed-btn ed-btn-primary"
                style={{ width: '100%', background: '#6366f1', color: '#ffffff', fontWeight: '700', padding: '12px' }}
                onClick={() => {
                  setShowRecruiterLimitModal(false);
                  setActiveTab('billing');
                }}
              >
                Upgrade Plan
              </button>
              
              <button
                type="button"
                className="ed-btn ed-btn-ghost"
                style={{ width: '100%', color: '#64748b', fontWeight: '700', padding: '12px', background: 'transparent', border: 'none', cursor: 'pointer' }}
                onClick={() => setShowRecruiterLimitModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


