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
  FileText, 
  Check, 
  X, 
  ChevronRight, 
  Paperclip, 
  Send, 
  Plus, 
  Key, 
  Clock, 
  FileDown,
  Info
} from 'lucide-react';
import './EmployerDashboard.css';

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
  status: 'Active' | 'Pending';
}

const initialJobsData: RecruiterJob[] = [
  {
    id: 'job-101',
    title: 'Senior React Developer',
    location: 'Bengaluru, India (Hybrid)',
    employmentType: 'Full-time',
    applicationsCount: 24,
    status: 'active',
    postedDate: '2026-07-20',
    industry: 'Technology',
    experience: '5-8 years',
    department: 'Engineering'
  },
  {
    id: 'job-102',
    title: 'Lead UI/UX Architect',
    location: 'London, UK (Remote)',
    employmentType: 'Full-time',
    applicationsCount: 12,
    status: 'active',
    postedDate: '2026-07-22',
    industry: 'Design',
    experience: '8+ years',
    department: 'Product Design'
  },
  {
    id: 'job-103',
    title: 'HR Business Partner',
    location: 'Mumbai, India (In-office)',
    employmentType: 'Full-time',
    applicationsCount: 4,
    status: 'paused',
    postedDate: '2026-07-15',
    industry: 'Human Resources',
    experience: '3-5 years',
    department: 'People Operations'
  },
  {
    id: 'job-104',
    title: 'Node.js Developer (Junior)',
    location: 'San Francisco, USA (Hybrid)',
    employmentType: 'Internship',
    applicationsCount: 8,
    status: 'draft',
    postedDate: '2026-07-25',
    industry: 'Technology',
    experience: '1-3 years',
    department: 'Engineering'
  }
];

const initialCandidatesData: Candidate[] = [
  {
    id: 'cand-1',
    name: 'Aishwarya Nair',
    avatar: 'AN',
    email: 'aishwarya.nair@example.com',
    phone: '+91 98765 43210',
    location: 'Bengaluru, India',
    aiMatchScore: 96,
    experienceYears: 6,
    skills: ['React', 'TypeScript', 'Redux Toolkit', 'TailwindCSS', 'System Design'],
    currentRole: 'Senior Frontend Engineer',
    currentCompany: 'TechnoLabs Solutions',
    education: 'B.Tech in Computer Science - NIT Calicut',
    portfolioUrl: 'https://aishwaryacodes.dev',
    resumeUrl: 'aishwarya_nair_resume.pdf',
    status: 'shortlisted',
    appliedJobId: 'job-101',
    appliedJobTitle: 'Senior React Developer',
    interviewNotes: [
      'Strong architecture understanding of micro-frontends.',
      'Excellent communicator. Answered React 19 fiber questions flawlessly.'
    ],
    timeline: [
      { id: 't-1', event: 'Applied via GetWorxs', date: '2026-07-21', description: 'Matched with 96% confidence score.', type: 'success' },
      { id: 't-2', event: 'Profile Viewed', date: '2026-07-22', description: 'Reviewed by Hiring Manager.', type: 'info' },
      { id: 't-3', event: 'Moved to Shortlist', date: '2026-07-23', description: 'Scheduled for Technical Screening.', type: 'success' }
    ]
  },
  {
    id: 'cand-2',
    name: 'Marcus Vance',
    avatar: 'MV',
    email: 'marcus.vance@example.com',
    phone: '+44 7911 123456',
    location: 'London, UK',
    aiMatchScore: 92,
    experienceYears: 9,
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Ashby', 'User Research', 'Prototyping'],
    currentRole: 'Lead Product Designer',
    currentCompany: 'RetailChain Corp',
    education: 'MA in Interaction Design - Royal College of Art',
    portfolioUrl: 'https://marcusvance.co',
    resumeUrl: 'marcus_vance_designer.pdf',
    status: 'interview',
    appliedJobId: 'job-102',
    appliedJobTitle: 'Lead UI/UX Architect',
    interviewNotes: [
      'Clean visual style. Deep expertise in Stripe-like minimal interfaces.',
      'Needs visa sponsorships in the long run.'
    ],
    timeline: [
      { id: 't-4', event: 'Applied', date: '2026-07-22', description: 'Applied to Lead UI/UX Architect.', type: 'success' },
      { id: 't-5', event: 'Shortlisted', date: '2026-07-23', description: 'Moved to interview queue.', type: 'success' },
      { id: 't-6', event: 'Round 1 Scheduled', date: '2026-07-25', description: 'Portfolio walk-through with team.', type: 'info' }
    ]
  },
  {
    id: 'cand-3',
    name: 'Rahul Sharma',
    avatar: 'RS',
    email: 'rahul.sharma@example.com',
    phone: '+91 99887 76655',
    location: 'Mumbai, India',
    aiMatchScore: 84,
    experienceYears: 4,
    skills: ['Talent Acquisition', 'Onboarding', 'HR Operations', 'Workday'],
    currentRole: 'HR Associate',
    currentCompany: 'Global Fintech Ltd',
    education: 'MBA in Human Resources - NMIMS Mumbai',
    portfolioUrl: '',
    resumeUrl: 'rahul_sharma_hr.pdf',
    status: 'new',
    appliedJobId: 'job-103',
    appliedJobTitle: 'HR Business Partner',
    interviewNotes: [],
    timeline: [
      { id: 't-7', event: 'Application Submitted', date: '2026-07-26', description: 'Pending recruiter review.', type: 'info' }
    ]
  },
  {
    id: 'cand-4',
    name: 'Emily Watson',
    avatar: 'EW',
    email: 'emily.w@example.com',
    phone: '+1 415 987 6543',
    location: 'San Francisco, USA',
    aiMatchScore: 78,
    experienceYears: 2,
    skills: ['Node.js', 'Express', 'MongoDB', 'JavaScript'],
    currentRole: 'Software Intern',
    currentCompany: 'ByteSize Tech',
    education: 'BS in Computer Science - UC Berkeley',
    portfolioUrl: 'https://emilycodes.io',
    resumeUrl: 'emily_watson_resume.pdf',
    status: 'viewed',
    appliedJobId: 'job-104',
    appliedJobTitle: 'Node.js Developer (Junior)',
    interviewNotes: ['Solid database concepts, needs hand-holding on AWS.'],
    timeline: [
      { id: 't-8', event: 'Applied', date: '2026-07-25', description: 'Applied via GetWorxs system.', type: 'success' },
      { id: 't-9', event: 'Profile Opened', date: '2026-07-26', description: 'Recruiter opened resume profile.', type: 'info' }
    ]
  }
];

const initialThreads: MessageThread[] = [
  {
    id: 'th-1',
    candidateName: 'Aishwarya Nair',
    avatar: 'AN',
    unread: true,
    excerpt: 'Hi, I have uploaded my updated experience summary. Looking forward to...',
    messages: [
      { id: 'm-1', sender: 'recruiter', text: 'Hello Aishwarya, thanks for applying. Your profile looks impressive! Can we connect for a brief 15 min chat on Tuesday?', time: 'Jul 25, 10:30 AM' },
      { id: 'm-2', sender: 'candidate', text: 'Hi! Yes, I am free on Tuesday from 2:00 PM to 5:00 PM IST. Tuesday works perfectly.', time: 'Jul 25, 11:15 AM' },
      { id: 'm-3', sender: 'recruiter', text: 'Awesome, scheduled! I sent a calendar link.', time: 'Jul 25, 11:20 AM' },
      { id: 'm-4', sender: 'candidate', text: 'Hi, I have uploaded my updated experience summary. Looking forward to speaking!', time: 'Jul 26, 4:02 PM' }
    ]
  },
  {
    id: 'th-2',
    candidateName: 'Marcus Vance',
    avatar: 'MV',
    unread: false,
    excerpt: 'Thanks! I will review the team details before the call.',
    messages: [
      { id: 'm-5', sender: 'recruiter', text: 'Hi Marcus, looking forward to our portfolio review session tomorrow.', time: 'Jul 24, 3:00 PM' },
      { id: 'm-6', sender: 'candidate', text: 'Thanks! I will review the team details before the call.', time: 'Jul 24, 3:45 PM' }
    ]
  }
];

const initialTeamData: RecruiterTeam[] = [
  { id: 'team-1', name: 'Sarah Connor', email: 's.connor@getworxs.com', role: 'Admin', status: 'Active' },
  { id: 'team-2', name: 'James Carter', email: 'j.carter@getworxs.com', role: 'Recruiter', status: 'Active' },
  { id: 'team-3', name: 'Elena Rostova', email: 'e.rostova@getworxs.com', role: 'Interviewer', status: 'Pending' }
];

export const EmployerDashboard: React.FC = () => {
  // Navigation State
  const [activeTab, setActiveTab] = useState('overview');

  // Database State
  const [jobs, setJobs] = useState<RecruiterJob[]>(initialJobsData);
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidatesData);
  const [threads, setThreads] = useState<MessageThread[]>(initialThreads);
  const [activeThreadId, setActiveThreadId] = useState('th-1');
  const [team, setTeam] = useState<RecruiterTeam[]>(initialTeamData);

  // Search and Filter States for Jobs
  const [jobSearch, setJobSearch] = useState('');
  const [jobStatusFilter, setJobStatusFilter] = useState('all');
  const [jobDeptFilter, setJobDeptFilter] = useState('all');

  // Search and Filter States for Candidates
  const [candSearch, setCandSearch] = useState('');
  const [candStatusFilter, setCandStatusFilter] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [candProfileTab, setCandProfileTab] = useState<'resume' | 'timeline' | 'notes'>('resume');
  const [newNoteText, setNewNoteText] = useState('');

  // Messages Input state
  const [chatMessage, setChatMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Create Job Step Form State
  const [jobFormStep, setJobFormStep] = useState(1);
  const [jobForm, setJobForm] = useState({
    title: 'Senior Software Engineer',
    location: 'Chennai, Tamil Nadu',
    industry: 'Technology',
    department: 'Software Development',
    category: 'Backend Development',
    role: 'Back End Developer',
    employmentType: 'Full Time, Permanent',
    experienceMin: '1 year',
    experienceMax: '3 years',
    freshersCanApply: false,
    technologies: ['Emerging Technologies'],
    diversityHiring: {
      women: false,
      womenReturning: false,
      defence: false,
      disabled: false
    },
    videoProfileNeeded: false,
    description: `Role & responsibilities:\nOutline the day-to-day responsibilities for this role.\n\nPreferred candidate profile:\nSpecify required role expertise, previous job experience, or relevant certifications.`,
    screeningQuestions: [] as string[],
    isWalkin: false,
    teamMembers: ['muthukumar@chn.technologies'],
    emailResponses: 'Only you will receive responses',
    referenceCode: '',
    autoRefresh: false
  });

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
  const [apiKeys, setApiKeys] = useState<{key: string; label: string; created: string}[]>([
    { key: 'gw_live_a8f9c1...2c', label: 'Production API Key', created: '2026-03-12' }
  ]);

  // AI JD Generator Mock
  const handleGenerateAIJD = () => {
    if (!jobForm.title) {
      alert('Please enter a Job Title first to generate a relevant Job Description!');
      return;
    }
    const generated = `Role & responsibilities:
We are seeking a high-caliber **${jobForm.title}** to join our team in **${jobForm.location}**.
In this Software Development role under **${jobForm.department}**, you will design, develop, and maintain clean Backend/Frontend features.

Preferred candidate profile:
- Required work experience: **${jobForm.experienceMin} to ${jobForm.experienceMax}**.
- Solid experience working with: **${jobForm.technologies.join(', ') || 'React, TypeScript, Node.js'}**.
- Selected Candidate will collaborate in a **${jobForm.employmentType}** capacity.`;
    
    setJobForm(prev => ({ ...prev, description: generated }));
  };

  const handlePublishJob = () => {
    const newJob: RecruiterJob = {
      id: `job-${Date.now()}`,
      title: jobForm.title || 'Untitled Role',
      location: jobForm.location || 'Remote',
      employmentType: jobForm.employmentType || 'Full-time',
      applicationsCount: 0,
      status: 'active',
      postedDate: new Date().toISOString().split('T')[0],
      industry: jobForm.industry,
      experience: `${jobForm.experienceMin} to ${jobForm.experienceMax}`,
      department: jobForm.department
    };

    setJobs(prev => [newJob, ...prev]);
    alert('Job published successfully!');
    setActiveTab('jobs');
    // Reset form
    setJobForm({
      title: 'Senior Software Engineer',
      location: 'Chennai, Tamil Nadu',
      industry: 'Technology',
      department: 'Software Development',
      category: 'Backend Development',
      role: 'Back End Developer',
      employmentType: 'Full Time, Permanent',
      experienceMin: '1 year',
      experienceMax: '3 years',
      freshersCanApply: false,
      technologies: ['Emerging Technologies'],
      diversityHiring: {
        women: false,
        womenReturning: false,
        defence: false,
        disabled: false
      },
      videoProfileNeeded: false,
      description: `Role & responsibilities:\nOutline the day-to-day responsibilities for this role.\n\nPreferred candidate profile:\nSpecify required role expertise, previous job experience, or relevant certifications.`,
      screeningQuestions: [] as string[],
      isWalkin: false,
      teamMembers: ['muthukumar@chn.technologies'],
      emailResponses: 'Only you will receive responses',
      referenceCode: '',
      autoRefresh: false
    });
    setJobFormStep(1);
  };

  // Add notes to candidate
  const handleAddNote = () => {
    if (!newNoteText.trim() || !selectedCandidate) return;
    const updatedCandidates = candidates.map(c => {
      if (c.id === selectedCandidate.id) {
        const updatedNotes = [...c.interviewNotes, newNoteText];
        const updatedTimeline: CandidateTimeline[] = [
          ...c.timeline,
          { id: `t-note-${Date.now()}`, event: 'Recruiter Note Added', date: new Date().toISOString().split('T')[0], description: newNoteText, type: 'info' }
        ];
        return { ...c, interviewNotes: updatedNotes, timeline: updatedTimeline };
      }
      return c;
    });

    setCandidates(updatedCandidates);
    setSelectedCandidate(prev => {
      if (!prev) return null;
      return {
        ...prev,
        interviewNotes: [...prev.interviewNotes, newNoteText],
        timeline: [...prev.timeline, { id: `t-note-${Date.now()}`, event: 'Recruiter Note Added', date: new Date().toISOString().split('T')[0], description: newNoteText, type: 'info' }]
      };
    });
    setNewNoteText('');
  };

  // Schedule Interview
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    const updatedCandidates = candidates.map(c => {
      if (c.id === selectedCandidate.id) {
        const updatedTimeline: CandidateTimeline[] = [
          ...c.timeline,
          {
            id: `t-sch-${Date.now()}`,
            event: 'Interview Scheduled',
            date: scheduleData.date,
            description: `${scheduleData.type} at ${scheduleData.time} with ${scheduleData.interviewer}`,
            type: 'info'
          }
        ];
        return { ...c, status: 'interview' as const, timeline: updatedTimeline };
      }
      return c;
    });

    setCandidates(updatedCandidates);
    setSelectedCandidate(prev => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'interview' as const,
        timeline: [...prev.timeline, {
          id: `t-sch-${Date.now()}`,
          event: 'Interview Scheduled',
          date: scheduleData.date,
          description: `${scheduleData.type} at ${scheduleData.time} with ${scheduleData.interviewer}`,
          type: 'info'
        }]
      };
    });

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
  const filteredJobs = jobs.filter(job => {
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

  return (
    <div className="employer-dashboard-container">
      
      {/* Sticky Left Sidebar Navigation */}
      <aside className="ed-sidebar">
        <div className="ed-sidebar-nav">
          <button className={`ed-sidebar-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button className={`ed-sidebar-item ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')}>
            <Briefcase size={18} />
            <span>Job Management</span>
            <span className="ed-sidebar-badge">{jobs.filter(j => j.status === 'active').length}</span>
          </button>

          <button className={`ed-sidebar-item ${activeTab === 'create-job' ? 'active' : ''}`} onClick={() => setActiveTab('create-job')}>
            <PlusCircle size={18} />
            <span>Create Job</span>
          </button>

          <button className={`ed-sidebar-item ${activeTab === 'applicants' ? 'active' : ''}`} onClick={() => setActiveTab('applicants')}>
            <Users size={18} />
            <span>Applicants</span>
            <span className="ed-sidebar-badge accent">{candidates.filter(c => c.status === 'new').length}</span>
          </button>

          <button className={`ed-sidebar-item ${activeTab === 'ai-matching' ? 'active' : ''}`} onClick={() => setActiveTab('ai-matching')}>
            <Sparkles size={18} />
            <span>AI Candidate Match</span>
          </button>

          <button className={`ed-sidebar-item ${activeTab === 'interviews' ? 'active' : ''}`} onClick={() => setActiveTab('interviews')}>
            <Calendar size={18} />
            <span>Interviews</span>
          </button>

          <button className={`ed-sidebar-item ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
            <MessageSquare size={18} />
            <span>Messages</span>
          </button>

          <button className={`ed-sidebar-item ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            <BarChart2 size={18} />
            <span>Analytics</span>
          </button>

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

        <div className="ed-sidebar-footer">
          <div className="ed-sidebar-profile">
            <div className="ed-sidebar-avatar">SC</div>
            <div className="ed-sidebar-prof-info">
              <span className="ed-sidebar-prof-name">Sarah Connor</span>
              <span className="ed-sidebar-prof-role">Hiring Lead, Google</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ed-content-pane">

        {/* ==========================================
           TAB: DASHBOARD OVERVIEW
           ========================================== */}
        {activeTab === 'overview' && (
          <div>
            <div className="ed-page-header">
              <div>
                <h1 className="ed-title">Recruitment Dashboard</h1>
                <p className="ed-subtitle">Real-time overview of your company hiring funnels and candidates.</p>
              </div>
              <button className="ed-btn ed-btn-primary" onClick={() => setActiveTab('create-job')}>
                <PlusCircle size={16} />
                <span>Create New Job</span>
              </button>
            </div>

            {/* Summary Grid Cards */}
            <div className="ed-stats-grid">
              <div className="ed-stat-card primary">
                <div className="ed-stat-header">
                  <span className="ed-stat-label">Active Jobs</span>
                  <div className="ed-stat-icon-wrapper"><Briefcase size={16} /></div>
                </div>
                <span className="ed-stat-value">{jobs.filter(j => j.status === 'active').length}</span>
                <span className="ed-stat-trend up">↗ 3 new this week</span>
              </div>

              <div className="ed-stat-card info">
                <div className="ed-stat-header">
                  <span className="ed-stat-label">Total Applications</span>
                  <div className="ed-stat-icon-wrapper"><Users size={16} /></div>
                </div>
                <span className="ed-stat-value">{candidates.length + 38}</span>
                <span className="ed-stat-trend up">↗ 14% vs last month</span>
              </div>

              <div className="ed-stat-card warning">
                <div className="ed-stat-header">
                  <span className="ed-stat-label">Shortlisted</span>
                  <div className="ed-stat-icon-wrapper"><Award size={16} /></div>
                </div>
                <span className="ed-stat-value">{candidates.filter(c => c.status === 'shortlisted').length}</span>
                <span className="ed-stat-trend up">↗ 8 active reviews</span>
              </div>

              <div className="ed-stat-card success">
                <div className="ed-stat-header">
                  <span className="ed-stat-label">Interviews</span>
                  <div className="ed-stat-icon-wrapper"><Calendar size={16} /></div>
                </div>
                <span className="ed-stat-value">6</span>
                <span className="ed-stat-trend">⚡ Scheduled today</span>
              </div>

              <div className="ed-stat-card accent">
                <div className="ed-stat-header">
                  <span className="ed-stat-label">Offers Sent</span>
                  <div className="ed-stat-icon-wrapper"><FileText size={16} /></div>
                </div>
                <span className="ed-stat-value">2</span>
                <span className="ed-stat-trend">⏳ Awaiting responses</span>
              </div>
            </div>

            {/* Visual Sections */}
            <div className="ed-dashboard-grid">
              <div className="ed-card">
                <h3 className="ed-sidebar-prof-name" style={{ fontSize: '16px' }}>Hiring Activity Trends</h3>
                <p className="ed-subtitle">Monthly applications received vs. interviews conducted</p>
                <div className="ed-chart-container">
                  <div className="ed-chart-y-axis">
                    <span>100</span>
                    <span>50</span>
                    <span>0</span>
                  </div>
                  <div className="ed-chart-plot-area">
                    {/* Inline Stripe-style SVG Chart */}
                    <svg className="ed-svg-chart" viewBox="0 0 500 200">
                      <defs>
                        <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(109, 40, 217, 0.15)" />
                          <stop offset="100%" stopColor="rgba(109, 40, 217, 0)" />
                        </linearGradient>
                      </defs>
                      <path d="M 0 150 Q 80 80 160 110 T 320 60 T 480 40 L 480 200 L 0 200 Z" fill="url(#chartGlow)" />
                      <path d="M 0 150 Q 80 80 160 110 T 320 60 T 480 40" fill="none" stroke="var(--ed-primary)" strokeWidth="3" />
                      <circle cx="160" cy="110" r="5" fill="var(--ed-primary)" stroke="#fff" strokeWidth="2" />
                      <circle cx="320" cy="60" r="5" fill="var(--ed-primary)" stroke="#fff" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className="ed-chart-x-axis">
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May</span>
                    <span>Jun</span>
                    <span>Jul</span>
                  </div>
                </div>
              </div>

              {/* Sidebar stats panel */}
              <div className="ed-card">
                <h3 className="ed-sidebar-prof-name" style={{ fontSize: '16px' }}>Application Funnel</h3>
                <p className="ed-subtitle">Current pipeline efficiency breakdown</p>
                
                <div className="ed-funnel-container">
                  <div className="ed-funnel-row">
                    <span className="ed-funnel-label">Sourced</span>
                    <div className="ed-funnel-bar-wrapper">
                      <div className="ed-funnel-bar" style={{ width: '100%' }} />
                      <span className="ed-funnel-value">120</span>
                    </div>
                  </div>
                  <div className="ed-funnel-row">
                    <span className="ed-funnel-label">Screening</span>
                    <div className="ed-funnel-bar-wrapper">
                      <div className="ed-funnel-bar stage-2" style={{ width: '75%' }} />
                      <span className="ed-funnel-value">90</span>
                    </div>
                  </div>
                  <div className="ed-funnel-row">
                    <span className="ed-funnel-label">Interviews</span>
                    <div className="ed-funnel-bar-wrapper">
                      <div className="ed-funnel-bar stage-3" style={{ width: '40%' }} />
                      <span className="ed-funnel-value">48</span>
                    </div>
                  </div>
                  <div className="ed-funnel-row">
                    <span className="ed-funnel-label">Offers</span>
                    <div className="ed-funnel-bar-wrapper">
                      <div className="ed-funnel-bar stage-4" style={{ width: '10%' }} />
                      <span className="ed-funnel-value">12</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lower row details */}
            <div className="ed-dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              
              {/* Upcoming Interviews */}
              <div className="ed-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 className="ed-sidebar-prof-name" style={{ fontSize: '16px' }}>Upcoming Interviews</h3>
                  <button className="ed-btn ed-btn-ghost ed-btn-sm" onClick={() => setActiveTab('interviews')}>View Calendar</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {candidates.filter(c => c.status === 'interview').map(cand => (
                    <div key={cand.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--ed-border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--ed-primary-light)', color: 'var(--ed-primary)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontWeight: '700' }}>
                          {cand.avatar}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', fontSize: '13.5px' }}>{cand.name}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--ed-text-muted)' }}>{cand.appliedJobTitle}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--ed-primary)' }}>Tomorrow</div>
                        <div style={{ fontSize: '11px', color: 'var(--ed-text-muted)' }}>3:30 PM IST</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Best Fit recommendations */}
              <div className="ed-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 className="ed-sidebar-prof-name" style={{ fontSize: '16px' }}>AI Recommended Candidates</h3>
                  <button className="ed-btn ed-btn-ghost ed-btn-sm" onClick={() => setActiveTab('ai-matching')}>View All Matchings</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {candidates.slice(0, 2).map(cand => (
                    <div key={cand.id} className="ed-ai-rec-item">
                      <div className="ed-ai-score-ring" style={{ border: '2px solid var(--ed-primary)' }}>
                        <div className="ed-ai-score-inner">{cand.aiMatchScore}%</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '700', fontSize: '13.5px' }}>{cand.name}</span>
                          <span style={{ fontSize: '11px', color: 'var(--ed-text-muted)' }}>Exp: {cand.experienceYears}y</span>
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--ed-text-secondary)', margin: '4px 0' }}>
                          Fits: <strong>{cand.appliedJobTitle}</strong>
                        </p>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {cand.skills.slice(0, 3).map(skill => (
                            <span key={skill} style={{ fontSize: '10px', background: 'rgba(109, 40, 217, 0.08)', color: 'var(--ed-primary)', padding: '2px 6px', borderRadius: '4px' }}>{skill}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
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
                            <button className="ed-btn ed-btn-ghost ed-btn-sm" style={{ padding: '4px 8px' }} onClick={() => alert(`Configuring details of ${job.title}...`)}>Edit</button>
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
           TAB: CREATE JOB (MULTI-STEP JOB CREATOR)
           ========================================== */}
        {activeTab === 'create-job' && (
          <div>
            <div className="naukri-post-container">
              
              {/* Stepper Sidebar on Left */}
              <aside className="naukri-sidebar">
                <div>
                  <div className="naukri-sidebar-header">
                    <h2 className="naukri-sidebar-title">Post a job</h2>
                    <span className="naukri-hot-badge">Hot Vacancy</span>
                  </div>
                </div>

                <div className="naukri-step-list">
                  <div 
                    className={`naukri-step-item ${jobFormStep === 1 ? 'active' : ''} ${jobFormStep > 1 ? 'completed' : ''}`}
                    onClick={() => setJobFormStep(1)}
                  >
                    <div className="naukri-step-dot">
                      {jobFormStep > 1 ? <Check size={12} /> : '1'}
                    </div>
                    <span className="naukri-step-label">Job details</span>
                  </div>

                  <div 
                    className={`naukri-step-item ${jobFormStep === 2 ? 'active' : ''} ${jobFormStep > 2 ? 'completed' : ''}`}
                    onClick={() => { if (jobFormStep >= 2 || jobForm.title) setJobFormStep(2); }}
                  >
                    <div className="naukri-step-dot">
                      {jobFormStep > 2 ? <Check size={12} /> : '2'}
                    </div>
                    <span className="naukri-step-label">Preferred candidate details</span>
                  </div>

                  <div 
                    className={`naukri-step-item ${jobFormStep === 3 ? 'active' : ''} ${jobFormStep > 3 ? 'completed' : ''}`}
                    onClick={() => { if (jobFormStep >= 3 || jobForm.title) setJobFormStep(3); }}
                  >
                    <div className="naukri-step-dot">
                      {jobFormStep > 3 ? <Check size={12} /> : '3'}
                    </div>
                    <span className="naukri-step-label">Job description</span>
                  </div>

                  <div 
                    className={`naukri-step-item ${jobFormStep === 4 ? 'active' : ''} ${jobFormStep > 4 ? 'completed' : ''}`}
                    onClick={() => { if (jobFormStep >= 4 || jobForm.title) setJobFormStep(4); }}
                  >
                    <div className="naukri-step-dot">
                      {jobFormStep > 4 ? <Check size={12} /> : '4'}
                    </div>
                    <span className="naukri-step-label">Screening questions</span>
                  </div>

                  <div 
                    className={`naukri-step-item ${jobFormStep === 5 ? 'active' : ''} ${jobFormStep > 5 ? 'completed' : ''}`}
                    onClick={() => { if (jobFormStep >= 5 || jobForm.title) setJobFormStep(5); }}
                  >
                    <div className="naukri-step-dot">
                      {jobFormStep > 5 ? <Check size={12} /> : '5'}
                    </div>
                    <span className="naukri-step-label">Advanced options</span>
                  </div>
                </div>

                {/* Webinar Promotional Box */}
                <div className="naukri-webinar-card">
                  <span className="naukri-webinar-title">Join our free GetWorxs webinar</span>
                  <p className="naukri-webinar-desc">Learn to post jobs and attract quality talent</p>
                  <a href="#webinar" className="naukri-webinar-link" onClick={(e) => { e.preventDefault(); alert('Redirecting to GetWorxs webinar reservation page...'); }}>
                    <span>Reserve your slot</span>
                    <ChevronRight size={12} />
                  </a>
                </div>
              </aside>

              {/* Form Panels on Right */}
              <div className="naukri-form-wrapper">
                
                <div className="naukri-prefill-banner">
                  Begin from scratch or <a href="#prefill" className="naukri-prefill-link" onClick={(e) => { e.preventDefault(); alert('Prefilling form with last Senior Software Engineer template...'); }}>Prefill from previous jobs</a>
                </div>

                <div className="naukri-form-card">
                  
                  {/* Step 1: Job Details */}
                  {jobFormStep === 1 && (
                    <div>
                      <h3 className="naukri-form-section-title">Job details</h3>
                      
                      <div className="ed-form-group">
                        <label className="ed-label">Job title *</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Senior Software Engineer" 
                          className="ed-input"
                          value={jobForm.title}
                          onChange={(e) => setJobForm({...jobForm, title: e.target.value})}
                        />
                      </div>

                      <div className="grid-2">
                        <div className="ed-form-group">
                          <label className="ed-label">Department *</label>
                          <select 
                            className="ed-select"
                            value={jobForm.department}
                            onChange={(e) => setJobForm({...jobForm, department: e.target.value})}
                          >
                            <option>Software Development</option>
                            <option>Product Management</option>
                            <option>Quality Assurance</option>
                            <option>Hardware Engineering</option>
                          </select>
                        </div>

                        <div className="ed-form-group">
                          <label className="ed-label">Role *</label>
                          <select 
                            className="ed-select"
                            value={jobForm.role}
                            onChange={(e) => setJobForm({...jobForm, role: e.target.value})}
                          >
                            <option>Back End Developer</option>
                            <option>Front End Developer</option>
                            <option>Full Stack Developer</option>
                            <option>DevOps Architect</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid-2">
                        <div className="ed-form-group">
                          <label className="ed-label">Employment type *</label>
                          <select 
                            className="ed-select"
                            value={jobForm.employmentType}
                            onChange={(e) => setJobForm({...jobForm, employmentType: e.target.value})}
                          >
                            <option>Full Time, Permanent</option>
                            <option>Contract</option>
                            <option>Internship</option>
                            <option>Part Time</option>
                          </select>
                        </div>

                        <div className="ed-form-group">
                          <label className="ed-label">Work experience *</label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <select 
                              className="ed-select"
                              value={jobForm.experienceMin}
                              onChange={(e) => setJobForm({...jobForm, experienceMin: e.target.value})}
                            >
                              <option>Fresher</option>
                              <option>1 year</option>
                              <option>2 years</option>
                              <option>3 years</option>
                            </select>
                            <span style={{ fontSize: '13px', color: '#64748b' }}>to</span>
                            <select 
                              className="ed-select"
                              value={jobForm.experienceMax}
                              onChange={(e) => setJobForm({...jobForm, experienceMax: e.target.value})}
                            >
                              <option>2 years</option>
                              <option>3 years</option>
                              <option>5 years</option>
                              <option>8 years</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                        <input 
                          type="checkbox" 
                          id="freshers-can-apply"
                          checked={jobForm.freshersCanApply}
                          onChange={(e) => setJobForm({...jobForm, freshersCanApply: e.target.checked})}
                          style={{ cursor: 'pointer' }}
                        />
                        <label htmlFor="freshers-can-apply" style={{ fontSize: '13px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>
                          Freshers can also apply
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Preferred Candidate Details */}
                  {jobFormStep === 2 && (
                    <div>
                      <h3 className="naukri-form-section-title">Preferred candidate details</h3>
                      
                      <div className="ed-form-group">
                        <label className="ed-label">Key Skills / Technologies</label>
                        <div className="naukri-tags-input-wrapper">
                          <div className="naukri-selected-tags">
                            {jobForm.technologies.map(tag => (
                              <span key={tag} className="naukri-tag-pill">
                                <span>{tag}</span>
                                <button 
                                  type="button" 
                                  className="naukri-tag-remove"
                                  onClick={() => setJobForm({
                                    ...jobForm,
                                    technologies: jobForm.technologies.filter(t => t !== tag)
                                  })}
                                >
                                  <X size={10} />
                                </button>
                              </span>
                            ))}
                          </div>
                          
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Suggested keywords (click to add):</div>
                          <div className="naukri-tag-suggestions">
                            {['Emerging Technologies', 'Electronic Components / Semiconductors', 'React', 'TypeScript', 'Node.js', 'System Design'].filter(t => !jobForm.technologies.includes(t)).map(t => (
                              <button 
                                key={t} 
                                type="button" 
                                className="naukri-tag-suggest-btn"
                                onClick={() => setJobForm({
                                  ...jobForm,
                                  technologies: [...jobForm.technologies, t]
                                })}
                              >
                                + {t}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="ed-form-group" style={{ marginTop: '24px' }}>
                        <label className="ed-label">Diversity hiring <span style={{ fontSize: '11px', color: '#d97706', background: '#fffbeb', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>Optional • Free for limited time</span></label>
                        
                        <div className="naukri-checkbox-card-grid">
                          <div 
                            className={`naukri-checkbox-card ${jobForm.diversityHiring.women ? 'selected' : ''}`}
                            onClick={() => setJobForm({
                              ...jobForm,
                              diversityHiring: { ...jobForm.diversityHiring, women: !jobForm.diversityHiring.women }
                            })}
                          >
                            <div className="naukri-checkbox-card-header">
                              <input type="checkbox" checked={jobForm.diversityHiring.women} readOnly />
                            </div>
                            <span className="naukri-checkbox-card-label">Women</span>
                          </div>

                          <div 
                            className={`naukri-checkbox-card ${jobForm.diversityHiring.womenReturning ? 'selected' : ''}`}
                            onClick={() => setJobForm({
                              ...jobForm,
                              diversityHiring: { ...jobForm.diversityHiring, womenReturning: !jobForm.diversityHiring.womenReturning }
                            })}
                          >
                            <div className="naukri-checkbox-card-header">
                              <input type="checkbox" checked={jobForm.diversityHiring.womenReturning} readOnly />
                            </div>
                            <span className="naukri-checkbox-card-label">Women returning to work</span>
                          </div>

                          <div 
                            className={`naukri-checkbox-card ${jobForm.diversityHiring.defence ? 'selected' : ''}`}
                            onClick={() => setJobForm({
                              ...jobForm,
                              diversityHiring: { ...jobForm.diversityHiring, defence: !jobForm.diversityHiring.defence }
                            })}
                          >
                            <div className="naukri-checkbox-card-header">
                              <input type="checkbox" checked={jobForm.diversityHiring.defence} readOnly />
                            </div>
                            <span className="naukri-checkbox-card-label">Ex-defence personnel</span>
                          </div>

                          <div 
                            className={`naukri-checkbox-card ${jobForm.diversityHiring.disabled ? 'selected' : ''}`}
                            onClick={() => setJobForm({
                              ...jobForm,
                              diversityHiring: { ...jobForm.diversityHiring, disabled: !jobForm.diversityHiring.disabled }
                            })}
                          >
                            <div className="naukri-checkbox-card-header">
                              <input type="checkbox" checked={jobForm.diversityHiring.disabled} readOnly />
                            </div>
                            <span className="naukri-checkbox-card-label">Differently-abled</span>
                          </div>
                        </div>
                      </div>

                      <div className="ed-form-group" style={{ marginTop: '24px' }}>
                        <label className="ed-label" style={{ marginBottom: '8px', display: 'block' }}>Video profile needed from candidates</label>
                        <div className="naukri-pill-group">
                          <button 
                            type="button"
                            className={`naukri-pill-option ${jobForm.videoProfileNeeded ? 'active' : ''}`}
                            onClick={() => setJobForm({...jobForm, videoProfileNeeded: true})}
                          >
                            Yes
                          </button>
                          <button 
                            type="button"
                            className={`naukri-pill-option ${!jobForm.videoProfileNeeded ? 'active' : ''}`}
                            onClick={() => setJobForm({...jobForm, videoProfileNeeded: false})}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Job Description */}
                  {jobFormStep === 3 && (
                    <div>
                      <h3 className="naukri-form-section-title">Job description</h3>
                      
                      <div className="ed-form-group">
                        <div className="naukri-editor-box">
                          <div className="naukri-editor-toolbar">
                            <button type="button" className="naukri-editor-btn" style={{ fontWeight: '700' }} onClick={() => alert('Bold applied')}>B</button>
                            <button type="button" className="naukri-editor-btn" style={{ fontStyle: 'italic' }} onClick={() => alert('Italic applied')}>I</button>
                            <button type="button" className="naukri-editor-btn" style={{ textDecoration: 'underline' }} onClick={() => alert('Underline applied')}>U</button>
                            <div className="naukri-editor-divider" />
                            <button type="button" className="naukri-editor-btn" onClick={() => alert('Bullet list added')}>•</button>
                            <button type="button" className="naukri-editor-btn" onClick={() => alert('Ordered list added')}>1.</button>
                            <div className="naukri-editor-divider" />
                            <button 
                              type="button" 
                              className="ed-btn ed-btn-ghost ed-btn-sm" 
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0284c7', padding: '2px 8px' }}
                              onClick={handleGenerateAIJD}
                            >
                              <Sparkles size={12} />
                              <span>JD suggestions</span>
                            </button>
                            <button 
                              type="button" 
                              className="ed-btn ed-btn-ghost ed-btn-sm" 
                              style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#475569', padding: '2px 8px' }}
                              onClick={() => alert('Uploading mock JD file... (limit 2MB)')}
                            >
                              <span>Upload JD</span>
                            </button>
                          </div>
                          
                          <textarea 
                            className="naukri-editor-textarea"
                            rows={10}
                            value={jobForm.description}
                            onChange={(e) => setJobForm({...jobForm, description: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="ed-form-group" style={{ marginTop: '24px' }}>
                        <label className="ed-label" style={{ marginBottom: '10px', display: 'block' }}>About your company</label>
                        <div className="naukri-company-card">
                          <div className="naukri-company-info">
                            <div className="naukri-company-logo">
                              C
                            </div>
                            <div>
                              <div className="naukri-company-name">CHN Technologies</div>
                              <div className="naukri-company-desc">We are an end-to-end solution provider for Technology & Consulting Services...</div>
                            </div>
                          </div>
                          <button 
                            type="button" 
                            className="ed-btn ed-btn-ghost ed-btn-sm" 
                            style={{ color: '#0284c7', fontWeight: '700' }}
                            onClick={() => {
                              const name = prompt('Edit company name:', 'CHN Technologies');
                              if (name) alert(`Simulated company name change to ${name}`);
                            }}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Screening Questions */}
                  {jobFormStep === 4 && (
                    <div>
                      <h3 className="naukri-form-section-title">Screening questions</h3>
                      
                      <div 
                        className="naukri-add-question-dashed"
                        onClick={() => {
                          const customQ = prompt('Type your custom screening question:');
                          if (customQ) {
                            setJobForm({
                              ...jobForm,
                              screeningQuestions: [...jobForm.screeningQuestions, customQ]
                            });
                          }
                        }}
                      >
                        + Add a question
                      </div>

                      {jobForm.screeningQuestions.length > 0 && (
                        <div style={{ marginTop: '20px' }}>
                          <div className="ed-label" style={{ marginBottom: '10px', display: 'block' }}>Selected Questions:</div>
                          {jobForm.screeningQuestions.map(q => (
                            <div key={q} className="naukri-question-active-pill">
                              <span>{q}</span>
                              <button 
                                type="button" 
                                className="naukri-question-remove"
                                onClick={() => setJobForm({
                                  ...jobForm,
                                  screeningQuestions: jobForm.screeningQuestions.filter(item => item !== q)
                                })}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ marginTop: '24px' }}>
                        <div className="ed-label" style={{ marginBottom: '12px', display: 'block' }}>Suggested questions:</div>
                        <div className="naukri-suggested-questions">
                          {[
                            'What is your current CTC in Lacs per annum?',
                            'What is your expected CTC in Lacs per annum?',
                            'What is your notice period?',
                            'How many years of experience do you have in Backend Development?',
                            'How many years of experience do you have in Java?',
                            'How many years of experience do you have in Spring?',
                            'Are you currently residing in Chennai or willing to relocate to Chennai?',
                            'How many years of experience do you have in Spring Boot?',
                            'How many years of experience do you have in Microservices?'
                          ].filter(q => !jobForm.screeningQuestions.includes(q)).map(q => (
                            <button 
                              key={q} 
                              type="button" 
                              className="naukri-question-pill"
                              onClick={() => setJobForm({
                                ...jobForm,
                                screeningQuestions: [...jobForm.screeningQuestions, q]
                              })}
                            >
                              <span>+</span>
                              <span>{q}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Advanced Options */}
                  {jobFormStep === 5 && (
                    <div>
                      <h3 className="naukri-form-section-title">Advanced options</h3>
                      
                      <div className="ed-form-group">
                        <label className="ed-label" style={{ marginBottom: '8px', display: 'block' }}>Is this a walk-in job?</label>
                        <div className="naukri-pill-group">
                          <button 
                            type="button"
                            className={`naukri-pill-option ${jobForm.isWalkin ? 'active' : ''}`}
                            onClick={() => setJobForm({...jobForm, isWalkin: true})}
                          >
                            Yes
                          </button>
                          <button 
                            type="button"
                            className={`naukri-pill-option ${!jobForm.isWalkin ? 'active' : ''}`}
                            onClick={() => setJobForm({...jobForm, isWalkin: false})}
                          >
                            No
                          </button>
                        </div>
                      </div>

                      <div className="ed-form-group" style={{ marginTop: '20px' }}>
                        <label className="ed-label">Collaborate with team members to manage responses</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                          {jobForm.teamMembers.map(email => (
                            <span key={email} className="naukri-tag-pill" style={{ background: '#f8fafc', color: '#475569', borderColor: '#e2e8f0' }}>
                              <span>{email}</span>
                              <button 
                                type="button" 
                                className="naukri-tag-remove"
                                style={{ color: '#94a3b8' }}
                                onClick={() => setJobForm({
                                  ...jobForm,
                                  teamMembers: jobForm.teamMembers.filter(e => e !== email)
                                })}
                              >
                                <X size={10} />
                              </button>
                            </span>
                          ))}
                          <button 
                            type="button" 
                            className="ed-btn ed-btn-outline ed-btn-sm" 
                            style={{ borderRadius: '16px', fontSize: '11px', padding: '4px 10px' }}
                            onClick={() => {
                              const newEmail = prompt('Enter team member email address:');
                              if (newEmail) {
                                setJobForm({ ...jobForm, teamMembers: [...jobForm.teamMembers, newEmail] });
                              }
                            }}
                          >
                            + Add members
                          </button>
                        </div>
                      </div>

                      <div className="ed-form-group" style={{ marginTop: '24px' }}>
                        <label className="ed-label">Receive responses over email</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px' }}>
                          <span style={{ fontSize: '13.5px', color: '#334155', fontWeight: '600' }}>
                            {jobForm.emailResponses}
                          </span>
                          <button 
                            type="button" 
                            className="ed-btn ed-btn-ghost ed-btn-sm" 
                            style={{ color: '#0284c7', fontWeight: '700', padding: 0 }}
                            onClick={() => {
                              const choice = prompt('Edit email receipt rules (e.g. All Team Members, Only Me):', 'Only you will receive responses');
                              if (choice) setJobForm({ ...jobForm, emailResponses: choice });
                            }}
                          >
                            Edit
                          </button>
                          
                          <select 
                            className="ed-select" 
                            style={{ width: '180px', padding: '6px 10px', fontSize: '12px' }}
                          >
                            <option>As a daily summary</option>
                            <option>Instantly per application</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
                        <div 
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                          onClick={() => {
                            const code = prompt('Enter reference code to distinctly identify this job:');
                            if (code !== null) setJobForm({ ...jobForm, referenceCode: code });
                          }}
                        >
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>Reference code to distinctly identify this job</span>
                          <span style={{ color: '#0284c7', fontWeight: '800' }}>{jobForm.referenceCode ? jobForm.referenceCode : '+'}</span>
                        </div>

                        <div 
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                          onClick={() => setJobForm({ ...jobForm, autoRefresh: !jobForm.autoRefresh })}
                        >
                          <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>Schedule job for automatic refresh</span>
                          <span style={{ color: '#0284c7', fontWeight: '800' }}>{jobForm.autoRefresh ? 'Enabled' : '+'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons footer */}
                  <div className="naukri-footer-bar">
                    {jobFormStep > 1 && (
                      <button 
                        type="button" 
                        className="ed-btn ed-btn-outline"
                        onClick={() => setJobFormStep(jobFormStep - 1)}
                      >
                        Back
                      </button>
                    )}
                    
                    {jobFormStep < 5 ? (
                      <button 
                        type="button" 
                        className="ed-btn ed-btn-primary"
                        onClick={() => setJobFormStep(jobFormStep + 1)}
                        style={{ background: '#0284c7' }}
                      >
                        Next
                      </button>
                    ) : (
                      <button 
                        type="button" 
                        className="ed-btn ed-btn-primary"
                        onClick={handlePublishJob}
                        style={{ background: '#059669' }}
                      >
                        Preview & post job
                      </button>
                    )}
                  </div>

                </div>

              </div>

            </div>
          </div>
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
                  G
                </div>
                <div style={{ marginTop: '40px', flex: 1 }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '800' }}>Google India</h2>
                  <p style={{ fontSize: '12px', color: 'var(--ed-text-muted)' }}>Verified Global Enterprise Partner</p>
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
                  value="Google India Private Limited is a leading provider of internet-related products and services, including online advertising, search engine, cloud computing, software, and hardware ecosystems."
                  onChange={() => {}}
                />
              </div>

              <div className="grid-2">
                <div className="ed-form-group">
                  <label className="ed-label">Culture & Mission</label>
                  <input type="text" className="ed-input" value="To organize the world's information and make it universally accessible and useful." onChange={() => {}} />
                </div>
                <div className="ed-form-group">
                  <label className="ed-label">Social Links (Website)</label>
                  <input type="text" className="ed-input" value="https://google.co.in/about" onChange={() => {}} />
                </div>
              </div>

              <div className="grid-2">
                <div className="ed-form-group">
                  <label className="ed-label">Primary Office Hubs</label>
                  <input type="text" className="ed-input" value="Bengaluru, Hyderabad, Gurgaon" onChange={() => {}} />
                </div>
                <div className="ed-form-group">
                  <label className="ed-label">Company Size</label>
                  <select className="ed-select">
                    <option>10,000+ employees</option>
                    <option>1,000 - 5,000 employees</option>
                    <option>200 - 1,000 employees</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                <button className="ed-btn ed-btn-primary" onClick={() => alert('Company profile changes saved successfully!')}>Save Branding Details</button>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
           TAB: SUBSCRIPTION & BILLING
           ========================================== */}
        {activeTab === 'billing' && (
          <div>
            <div className="ed-page-header">
              <div>
                <h1 className="ed-title">Subscription & Usage</h1>
                <p className="ed-subtitle">Manage plan levels, limits, API integrations, and invoice details.</p>
              </div>
            </div>

            <div className="ed-dashboard-grid">
              
              {/* Current plan metrics */}
              <div className="ed-card">
                <span className="ed-status-badge active" style={{ marginBottom: '12px' }}>Current Plan: Growth SaaS</span>
                <h2 style={{ fontSize: '32px', fontWeight: '800' }}>$249 / month</h2>
                <p className="ed-subtitle">Renews automatically on August 15, 2026.</p>

                <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                      <span>Active Jobs Quota</span>
                      <span>{jobs.filter(j => j.status === 'active').length} / 10 jobs</span>
                    </div>
                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(jobs.filter(j => j.status === 'active').length / 10) * 100}%`, background: 'var(--ed-primary)' }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                      <span>AI Match Credits (Monthly)</span>
                      <span>720 / 1,000 scans</span>
                    </div>
                    <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '72%', background: 'var(--ed-primary)' }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
                  <button className="ed-btn ed-btn-primary ed-btn-sm" onClick={() => alert('Forwarding to secure Stripe billing portal...')}>Manage Payments</button>
                  <button className="ed-btn ed-btn-outline ed-btn-sm" onClick={() => alert('Contacting sales for enterprise customized quota upgrades...')}>Upgrade Quota</button>
                </div>
              </div>

              {/* Invoices List */}
              <div className="ed-card">
                <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px' }}>Billing Invoices</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--ed-border)' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '13px' }}>Invoice #GW-9821</div>
                      <div style={{ fontSize: '11px', color: 'var(--ed-text-muted)' }}>Paid on Jul 15, 2026</div>
                    </div>
                    <button className="ed-btn ed-btn-ghost ed-btn-sm" style={{ padding: '6px' }} onClick={() => alert('Downloading invoice PDF GW-9821...')}><FileDown size={16} /></button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--ed-border)' }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '13px' }}>Invoice #GW-9704</div>
                      <div style={{ fontSize: '11px', color: 'var(--ed-text-muted)' }}>Paid on Jun 15, 2026</div>
                    </div>
                    <button className="ed-btn ed-btn-ghost ed-btn-sm" style={{ padding: '6px' }} onClick={() => alert('Downloading invoice PDF GW-9704...')}><FileDown size={16} /></button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

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
                  <button className="ed-btn ed-btn-outline ed-btn-sm" onClick={() => {
                    const name = prompt('Enter recruiter name:');
                    const email = prompt('Enter recruiter email:');
                    if (name && email) {
                      setTeam([...team, { id: `team-${Date.now()}`, name, email, role: 'Interviewer', status: 'Pending' }]);
                    }
                  }}>
                    <Plus size={14} />
                    <span>Invite Team</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {team.map(member => (
                    <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--ed-border)' }}>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '13.5px' }}>{member.name}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--ed-text-muted)' }}>{member.email}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                        <span className={`ed-status-badge ${member.status.toLowerCase()}`} style={{ fontSize: '10px', padding: '2px 6px' }}>{member.status}</span>
                      </div>
                    </div>
                  ))}
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

            <div className="ed-drawer-footer">
              <button className="ed-btn ed-btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => alert(`Downloading resume ${selectedCandidate.resumeUrl}...`)}>
                <Download size={14} />
                <span>Resume PDF</span>
              </button>
              
              {!isScheduling && (
                <button className="ed-btn ed-btn-primary" style={{ flex: 1 }} onClick={() => setIsScheduling(true)}>Schedule Interview</button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
