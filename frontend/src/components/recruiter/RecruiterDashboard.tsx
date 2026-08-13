import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  GitBranch, 
  Inbox, 
  Sparkles, 
  Calendar as CalendarIcon, 
  MessageSquare, 
  CheckSquare, 
  BarChart2, 
  Bell, 
  User, 
  Search, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  X,
  Clock,
  FileText,
  LogOut
} from 'lucide-react';
import type { RecruiterJob, Candidate, Interview, Task, MessageThread } from './types';
import { 
  mockJobs, 
  mockCandidates, 
  mockInterviews, 
  mockTasks, 
  mockThreads, 
  mockRecruiterProfile
} from './mockData';

// Subcomponents import
import { DashboardTab } from './DashboardTab';
import { JobsTab } from './JobsTab';
import { ApplicantsTab } from './ApplicantsTab';
import { PipelineTab } from './PipelineTab';
import { ResumeInboxTab } from './ResumeInboxTab';
import { AiMatchTab } from './AiMatchTab';
import { InterviewsTab } from './InterviewsTab';
import { CalendarTab } from './CalendarTab';
import { MessagesTab } from './MessagesTab';
import { TasksTab } from './TasksTab';
import { ReportsTab } from './ReportsTab';
import { NotificationsTab } from './NotificationsTab';
import { CreateJobTab } from './CreateJobTab';
import { ProfileTab } from './ProfileTab';
import { TalentSearchTab } from '../employer/TalentSearchTab';
import { GetWorxsLogo } from '../GetWorxsLogo';
import { useNotifications } from '../../utils/useNotifications';

import './RecruiterDashboard.css';

interface RecruiterDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  exitPortal: () => void;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({
  activeTab: parentActiveTab,
  setActiveTab: parentSetActiveTab,
  exitPortal
}) => {
  // Collapsible Sidebar State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Global search input state
  const [globalSearch, setGlobalSearch] = useState('');
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

  // AI Copilot Panel State
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    { sender: 'ai', text: 'Hi! I am your GetWorxs Recruitment Copilot. Ask me to find matching candidates, draft a Job Description, or summarize candidate profiles.' }
  ]);

  // Global DB States
  const [jobs, setJobs] = useState<RecruiterJob[]>(mockJobs);
  const [candidates, setCandidates] = useState<Candidate[]>(mockCandidates);
  const [interviews, setInterviews] = useState<Interview[]>(mockInterviews);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [threads, setThreads] = useState<MessageThread[]>(mockThreads);
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  
  const globalSearchResults = useMemo(() => {
    const q = globalSearch.toLowerCase().trim();
    if (!q) return { candidates: [], jobs: [], interviews: [], tasks: [] };

    return {
      candidates: candidates.filter((c: Candidate) => c.name.toLowerCase().includes(q) || c.currentDesignation.toLowerCase().includes(q) || c.skills.some((s: string) => s.toLowerCase().includes(q))).slice(0, 4),
      jobs: jobs.filter((j: RecruiterJob) => j.title.toLowerCase().includes(q) || j.department.toLowerCase().includes(q) || j.location.toLowerCase().includes(q)).slice(0, 4),
      interviews: interviews.filter((i: Interview) => i.candidateName.toLowerCase().includes(q) || i.type.toLowerCase().includes(q)).slice(0, 3),
      tasks: tasks.filter((t: Task) => t.title.toLowerCase().includes(q) || (t.candidateName && t.candidateName.toLowerCase().includes(q))).slice(0, 3)
    };
  }, [globalSearch, candidates, jobs, interviews, tasks]);

  const totalRecruiterResults = globalSearchResults.candidates.length + globalSearchResults.jobs.length + globalSearchResults.interviews.length + globalSearchResults.tasks.length;
  const [localTab, setLocalTab] = useState<string>('dashboard');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // Modals visibility state
  const [isScheduleInterviewOpen, setIsScheduleInterviewOpen] = useState(false);
  const [isAiJdOpen, setIsAiJdOpen] = useState(false);

  // Prefilled candidate name for scheduling modal
  const [prefillName, setPrefillName] = useState('');
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  // Sync prefillName selections to active selected message thread
  useEffect(() => {
    if (prefillName) {
      const found = threads.find(t => t.name.toLowerCase().includes(prefillName.toLowerCase()));
      if (found) {
        setActiveThreadId(found.id);
      }
    }
  }, [prefillName, threads]);

  const fetchRecruiterJobs = async () => {
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
            department: j.department || 'Engineering',
            location: j.city ? `${j.city}, ${j.country}` : j.country,
            type: j.employment_type || 'Full-Time',
            experience: `${j.experience_min}-${j.experience_max} yrs`,
            postedDate: j.created_at ? new Date(j.created_at).toLocaleDateString() : 'Recent',
            status: (j.status || 'active').toLowerCase(),
            applicantCount: typeof j.applications_count === 'number' ? j.applications_count : 0,
            assignedRecruiter: j.hiring_manager_name || 'HR Team'
          }));
          setJobs(mapped);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch recruiter jobs:', err);
    }
  };

  const fetchRecruiterApplications = async () => {
    const rawUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    const API_URL = rawUrl.replace(/\/+$/, '').replace(/\/api\/v1$/, '');
    const token = localStorage.getItem('getworxs_access_token') || localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/applications/recruiter?limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data && Array.isArray(data.data.items)) {
          const jobAppCounts: Record<string, number> = {};
          const mapped = data.data.items.map((app: any) => {
            const nameStr = app.candidate?.name || 'Candidate';
            
            const jobIdStr = String(app.job_id);
            jobAppCounts[jobIdStr] = (jobAppCounts[jobIdStr] || 0) + 1;

            const statusMap: Record<string, string> = {
              'Applied': 'applied',
              'Viewed': 'screening',
              'Shortlisted': 'shortlisted',
              'Interview Scheduled': 'interview1',
              'Interview Completed': 'interview2',
              'Selected': 'final',
              'Offer Sent': 'offer',
              'Hired': 'joined',
              'Rejected': 'rejected',
              'Withdrawn': 'rejected'
            };
            
            const currentStage = statusMap[app.status] || 'applied';

            const skillsArr = app.candidate?.candidate_profile?.skills_json 
              ? (typeof app.candidate.candidate_profile.skills_json === 'string' 
                  ? JSON.parse(app.candidate.candidate_profile.skills_json) 
                  : app.candidate.candidate_profile.skills_json) 
              : (app.candidate?.candidate_profile?.skills || ['React', 'TypeScript']);

            const recruiterNotes = (app.notes_json || []).map((n: string, i: number) => ({
              id: `rec-note-${i}-${app.id}`,
              author: 'Assigned Recruiter',
              text: n,
              date: new Date().toISOString().split('T')[0]
            }));

            const activityTimeline = (app.status_history_json || []).map((hist: any, i: number) => ({
              id: `act-${i}-${app.id}`,
              event: hist.status,
              time: hist.changed_at ? new Date(hist.changed_at).toLocaleDateString() : 'Just Now',
              details: hist.note || `Status updated to ${hist.status}`
            }));

            return {
              id: String(app.id),
              name: nameStr,
              avatar: nameStr.split(' ').map((n: any) => n[0]).slice(0, 2).join('').toUpperCase(),
              email: app.candidate?.email || '',
              phone: app.candidate?.phone || app.candidate?.candidate_profile?.phone || '',
              location: app.candidate?.candidate_profile?.city 
                ? `${app.candidate.candidate_profile.city}, ${app.candidate.candidate_profile.country}` 
                : (app.candidate?.candidate_profile?.country || 'Remote'),
              currentStage: currentStage as any,
              aiMatchScore: app.candidate?.candidate_profile?.profile_completion_percentage || 85,
              experienceYears: parseInt(app.candidate?.candidate_profile?.total_experience) || 2,
              skills: Array.isArray(skillsArr) ? skillsArr : ['React', 'TypeScript'],
              currentDesignation: app.candidate?.candidate_profile?.current_role || 'Software Engineer',
              currentCompany: app.candidate?.candidate_profile?.university || 'Graduate',
              education: app.candidate?.candidate_profile?.highest_qualification || 'Degree',
              portfolioUrl: app.candidate?.candidate_profile?.portfolio_url || '',
              resumeUrl: app.resume_url || app.candidate?.candidate_profile?.resume_url || '',
              recruiterNotes: recruiterNotes,
              activityTimeline: activityTimeline,
              noticePeriod: 'Immediate'
            };
          });
          setCandidates(mapped);

          // Recount applications for jobs
          setJobs(prevJobs => prevJobs.map(j => ({
            ...j,
            applications: Math.max(j.applications, jobAppCounts[j.id] || 0)
          })));
        }
      }
    } catch (err) {
      console.warn('Failed to fetch recruiter applications:', err);
    }
  };

  useEffect(() => {
    fetchRecruiterJobs();
    fetchRecruiterApplications();
  }, []);

  // Sync prop active tab changes from Navbar/Parent App
  useEffect(() => {
    if (parentActiveTab) {
      const mapped = mapPropToLocalTab(parentActiveTab);
      setLocalTab(mapped);
    }
  }, [parentActiveTab]);

  const mapPropToLocalTab = (tab: string): string => {
    switch (tab) {
      case 'overview': return 'dashboard';
      case 'ai-matching': return 'ai-match';
      case 'analytics': return 'reports';
      case 'create-job': return 'create-job';
      case 'settings':
      case 'billing': return 'profile';
      default: return tab;
    }
  };

  const handleTabChange = (tab: string) => {
    setLocalTab(tab);
    // Notify parent App component
    parentSetActiveTab(tab === 'dashboard' ? 'overview' : tab === 'ai-match' ? 'ai-matching' : tab === 'reports' ? 'analytics' : tab);
  };

  // Sourcing & Candidates Mutation
  const handleAddCandidate = (newCand: Candidate) => {
    setCandidates([newCand, ...candidates]);
  };

  const mapStageToBackendStatus = (stage: string): string => {
    switch (stage) {
      case 'applied': return 'Applied';
      case 'screening': return 'Viewed';
      case 'shortlisted': return 'Shortlisted';
      case 'interview1': return 'Interview Scheduled';
      case 'interview2': return 'Interview Completed';
      case 'final': return 'Selected';
      case 'offer': return 'Offer Sent';
      case 'joined': return 'Hired';
      case 'rejected': return 'Rejected';
      default: return 'Applied';
    }
  };

  const handleUpdateCandidate = async (candId: string, updates: Partial<Candidate>) => {
    // If updating recruiter notes:
    if (updates.recruiterNotes && Array.isArray(updates.recruiterNotes)) {
      const existingCandidate = candidates.find(c => c.id === candId);
      const existingNotes = existingCandidate?.recruiterNotes || [];
      const newNotes = updates.recruiterNotes.filter(
        (n: any) => !existingNotes.some((ex: any) => ex.id === n.id)
      );

      if (newNotes.length > 0) {
        const latestNote = newNotes[0].text;
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const token = localStorage.getItem('getworxs_access_token');
        if (token) {
          try {
            await fetch(`${API_URL}/api/v1/applications/${candId}/notes`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ note: latestNote })
            });
            fetchRecruiterApplications();
            return;
          } catch (e) {
            console.warn('Failed to append note to backend:', e);
          }
        }
      }
    }

    const updated = candidates.map(c => c.id === candId ? { ...c, ...updates } : c);
    setCandidates(updated);
    if (selectedCandidate && selectedCandidate.id === candId) {
      setSelectedCandidate({ ...selectedCandidate, ...updates });
    }
  };

  const handleUpdateCandidateStage = async (candId: string, newStage: Candidate['currentStage']) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('getworxs_access_token');
    if (!token) return;

    const backendStatus = mapStageToBackendStatus(newStage);
    try {
      const res = await fetch(`${API_URL}/api/v1/applications/${candId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: backendStatus,
          note: `Recruiter moved candidate to stage: ${newStage}`
        })
      });
      if (res.ok) {
        fetchRecruiterApplications();
        if (selectedCandidate && selectedCandidate.id === candId) {
          setSelectedCandidate(prev => prev ? { ...prev, currentStage: newStage } : null);
        }
      }
    } catch (err) {
      console.warn('Failed to update stage on backend:', err);
    }
  };

  // Sourcing & Jobs Mutation
  const handleAddJob = (newJob: RecruiterJob) => {
    setJobs([newJob, ...jobs]);
  };

  const handleUpdateJob = (jobId: string, updates: Partial<RecruiterJob>) => {
    setJobs(jobs.map(j => j.id === jobId ? { ...j, ...updates } : j));
  };

  const handleDeleteJob = (jobId: string) => {
    setJobs(jobs.filter(j => j.id !== jobId));
  };

  // Interviews Mutation
  const handleAddInterview = (newInt: Interview) => {
    setInterviews([newInt, ...interviews]);
    // Create automatic task
    const newTask: Task = {
      id: `task-int-${Date.now()}`,
      title: `Interview with ${newInt.candidateName}`,
      priority: 'high',
      dueDate: newInt.date,
      candidateName: newInt.candidateName,
      status: 'todo',
      category: 'Schedule Interview'
    };
    setTasks([newTask, ...tasks]);
  };

  const handleUpdateInterview = (intId: string, updates: Partial<Interview>) => {
    setInterviews(interviews.map(i => i.id === intId ? { ...i, ...updates } : i));
  };

  // Tasks Mutation
  const handleAddTask = (newTask: Task) => {
    setTasks([newTask, ...tasks]);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, ...updates } : t));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  // Message Sending
  const handleSendMessage = (threadId: string, text: string) => {
    setThreads(threads.map(t => {
      if (t.id === threadId) {
        const newMsg: any = {
          id: `msg-${Date.now()}`,
          sender: 'recruiter',
          senderName: 'Sarah Connor',
          text,
          time: 'Just Now',
          read: true
        };
        return {
          ...t,
          lastMessage: text,
          time: 'Just Now',
          messages: [...t.messages, newMsg]
        };
      }
      return t;
    }));
  };

  const handleTriggerMessage = (candidateName: string) => {
    setPrefillName(candidateName);
    const existing = threads.find(t => t.name.toLowerCase().includes(candidateName.toLowerCase()));
    if (existing) {
      handleTabChange('messages');
    } else {
      // Create new thread
      const newThread: MessageThread = {
        id: `thread-${Date.now()}`,
        type: 'candidate',
        name: candidateName,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        lastMessage: 'Conversation started.',
        time: 'Just Now',
        unreadCount: 0,
        messages: []
      };
      setThreads([newThread, ...threads]);
      handleTabChange('messages');
    }
  };

  const handleTriggerSchedule = (candidateName: string) => {
    setPrefillName(candidateName);
    setIsScheduleInterviewOpen(true);
  };

  // Notification mark read handled by hook


  // AI Copilot Chat Form Submission
  const handleAiChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiChatInput.trim()) return;

    const userMsg = { sender: 'user' as const, text: aiChatInput };
    setAiChatHistory(prev => [...prev, userMsg]);
    setAiChatInput('');

    // Simulated AI response
    setTimeout(() => {
      let aiText = "I've processed your query. Let me know if you want me to match candidates or outline interview pipelines.";
      const query = aiChatInput.toLowerCase();

      if (query.includes('match') || query.includes('candidate')) {
        aiText = "Based on our matching logs, Alex Morgan (95% Match) and David Chen (98% Match) are top candidates for open React and AI engineering tracks. You can review details in the AI Candidate Match tab.";
      } else if (query.includes('jd') || query.includes('description')) {
        aiText = "Sure! I can construct high-impact JDs. Try selecting 'Generate AI Job Description' in the Dashboard quick actions panel.";
      } else if (query.includes('schedule') || query.includes('interview')) {
        aiText = "To schedule an interview, click 'Schedule Interview' on the top right workspace panel or candidate profile drawer.";
      }

      setAiChatHistory(prev => [...prev, { sender: 'ai', text: aiText }]);
    }, 600);
  };

  // AI JD Generator
  const [jdRoleTitle, setJdRoleTitle] = useState('');
  const [jdKeywords, setJdKeywords] = useState('');
  const [generatedJd, setGeneratedJd] = useState('');
  const [isJdGenerating, setIsJdGenerating] = useState(false);

  const handleGenerateJd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jdRoleTitle) return;

    setIsJdGenerating(true);
    setGeneratedJd('');

    setTimeout(() => {
      setIsJdGenerating(false);
      const text = `Position: ${jdRoleTitle}\nDepartment: Engineering\n\nAbout GetWorxs:\nGetWorxs is a global talent solution provider. We are seeking a self-driven ${jdRoleTitle} who specializes in building highly resilient systems.\n\nRequired Skills:\n- ${jdKeywords || 'Core framework languages'}\n- 3+ years running containerized applications\n- Experience building REST / GraphQL interfaces\n- Strong debugging skills\n\nPerks:\n- 100% remote workspace freedom\n- Health and dental insurance plans\n- Annual learning stipend ($2,500)`;
      setGeneratedJd(text);
    }, 1200);
  };

  const handleAdoptJd = () => {
    setIsAiJdOpen(false);
    handleTabChange('create-job');
  };

  return (
    <div className="employer-dashboard-container font-sans">
      
      {/* Sticky Collapsible Left Sidebar */}
      <aside className={`ed-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-top-section">
          <div className="brand-header-box">
            <div className="brand-header" onClick={() => handleTabChange('dashboard')}>
              <GetWorxsLogo size="sm" showText={false} />
              {!sidebarCollapsed && (
                <div className="brand-text-group">
                  <span className="brand-name">getworxs</span>
                  <span className="brand-badge">Recruit</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="ed-sidebar-nav">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
              { key: 'jobs', label: 'Job Openings', icon: <Briefcase size={18} />, badge: jobs.filter(j => j.status === 'active').length },
              { key: 'applicants', label: 'Applicants', icon: <Users size={18} />, badge: candidates.filter(c => c.currentStage === 'applied').length },
              { key: 'talent-search', label: 'Talent Search', icon: <Search size={18} /> },
              { key: 'pipeline', label: 'Candidate Pipeline', icon: <GitBranch size={18} /> },
              { key: 'resume-inbox', label: 'Resume Inbox', icon: <Inbox size={18} /> },
              { key: 'ai-match', label: 'AI Candidate Match', icon: <Sparkles size={18} /> },
              { key: 'interviews', label: 'Interviews', icon: <CalendarIcon size={18} />, badge: interviews.filter(i => i.status === 'today').length },
              { key: 'calendar', label: 'Calendar', icon: <CalendarIcon size={18} /> },
              { key: 'messages', label: 'Messages', icon: <MessageSquare size={18} />, badge: threads.filter(t => t.unreadCount > 0).length },
              { key: 'tasks', label: 'Tasks', icon: <CheckSquare size={18} />, badge: tasks.filter(t => t.status !== 'completed').length },
              { key: 'reports', label: 'Reports', icon: <BarChart2 size={18} /> },
              { key: 'notifications', label: 'Notifications', icon: <Bell size={18} />, badge: unreadCount },
              { key: 'profile', label: 'Recruiter Profile', icon: <User size={18} /> }
            ].map(item => (
              <button 
                key={item.key} 
                className={`ed-sidebar-item ${localTab === item.key ? 'active' : ''}`}
                onClick={() => handleTabChange(item.key)}
              >
                {item.icon}
                <span className="lbl">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="badge">{item.badge}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer with Collapse Trigger */}
        <div className="sidebar-footer-section">
          <div className="user-profile-widget">
            <img src={mockRecruiterProfile.avatar} alt="Profile" className="user-avatar" />
            <div className="user-meta">
              <strong>{mockRecruiterProfile.name}</strong>
              <span>{mockRecruiterProfile.designation}</span>
            </div>
          </div>

          <button className="btn-collapse" onClick={exitPortal} style={{ color: 'var(--ed-accent)', marginBottom: '4px' }}>
            <LogOut size={16} />
            <span className="lbl">Exit Portal</span>
          </button>

          <button className="btn-collapse" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            <span className="lbl">Collapse Sidebar</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="ed-workspace-frame">
        
        {/* Top Navbar */}
        <header className="workspace-top-bar">
          {/* Global Search Bar */}
          <div className="global-search-wrapper" style={{ position: 'relative' }}>
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Global Search: candidates, jobs, skills..." 
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                setIsGlobalSearchOpen(true);
              }}
              onFocus={() => setIsGlobalSearchOpen(true)}
              onBlur={() => setTimeout(() => setIsGlobalSearchOpen(false), 200)}
              className="font-sans"
            />
            {globalSearch && (
              <button 
                onClick={() => { setGlobalSearch(''); setIsGlobalSearchOpen(false); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ed-text-muted)', display: 'flex', alignItems: 'center', padding: '0 6px' }}
              >
                <X size={16} />
              </button>
            )}

            {/* Recruiter Live Search Dropdown Overlay */}
            {isGlobalSearchOpen && globalSearch.trim() !== '' && (
              <div className="recruiter-search-dropdown" onMouseDown={e => e.preventDefault()}>
                <div className="recruiter-search-header">
                  <span>Found {totalRecruiterResults} matches for "{globalSearch}"</span>
                  <button onClick={() => setIsGlobalSearchOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--ed-text-muted)' }}>Esc</button>
                </div>

                {totalRecruiterResults === 0 ? (
                  <div style={{ padding: 20, textAlign: 'center', color: 'var(--ed-text-muted)', fontSize: 13 }}>
                    No records matched your search criteria.
                  </div>
                ) : (
                  <div className="recruiter-search-list">
                    {/* Candidates */}
                    {globalSearchResults.candidates.length > 0 && (
                      <div className="recruiter-search-group">
                        <div className="recruiter-search-group-title">Applicants ({globalSearchResults.candidates.length})</div>
                        {globalSearchResults.candidates.map((c: Candidate) => (
                          <div 
                            key={c.id} 
                            className="recruiter-search-item"
                            onClick={() => {
                              setSelectedCandidate(c);
                              handleTabChange('applicants');
                              setIsGlobalSearchOpen(false);
                            }}
                          >
                            <img src={c.photoUrl} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                            <div>
                              <div className="recruiter-search-item-title">{c.name}</div>
                              <div className="recruiter-search-item-sub">{c.currentDesignation} · {c.currentCompany}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Jobs */}
                    {globalSearchResults.jobs.length > 0 && (
                      <div className="recruiter-search-group">
                        <div className="recruiter-search-group-title">Jobs ({globalSearchResults.jobs.length})</div>
                        {globalSearchResults.jobs.map((j: RecruiterJob) => (
                          <div 
                            key={j.id} 
                            className="recruiter-search-item"
                            onClick={() => {
                              handleTabChange('jobs');
                              setIsGlobalSearchOpen(false);
                            }}
                          >
                            <Briefcase size={16} style={{ color: 'var(--ed-accent)' }} />
                            <div>
                              <div className="recruiter-search-item-title">{j.title}</div>
                              <div className="recruiter-search-item-sub">{j.department} · {j.location}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Interviews */}
                    {globalSearchResults.interviews.length > 0 && (
                      <div className="recruiter-search-group">
                        <div className="recruiter-search-group-title">Interviews ({globalSearchResults.interviews.length})</div>
                        {globalSearchResults.interviews.map((i: Interview) => (
                          <div 
                            key={i.id} 
                            className="recruiter-search-item"
                            onClick={() => {
                              handleTabChange('interviews');
                              setIsGlobalSearchOpen(false);
                            }}
                          >
                            <CalendarIcon size={16} style={{ color: '#10B981' }} />
                            <div>
                              <div className="recruiter-search-item-title">{i.candidateName} — {i.type}</div>
                              <div className="recruiter-search-item-sub">{i.date} at {i.time}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Header Widgets */}
          <div className="header-utilities">
            <button className="utility-btn font-sans" onClick={() => handleTabChange('create-job')}>
              <Plus size={16} />
              <span>Create Job</span>
            </button>
            
            <button className="utility-btn ai-copilot-toggle" onClick={() => setShowAiAssistant(!showAiAssistant)}>
              <Sparkles size={16} />
              <span>AI Assistant</span>
            </button>

            <button className="utility-badge-btn" onClick={() => handleTabChange('messages')}>
              <MessageSquare size={18} />
              {threads.filter(t => t.unreadCount > 0).length > 0 && (
                <span className="dot"></span>
              )}
            </button>

            <button className="utility-badge-btn" onClick={() => handleTabChange('notifications')}>
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="dot"></span>
              )}
            </button>

            <div className="user-indicator" onClick={() => handleTabChange('profile')}>
              <img src={mockRecruiterProfile.avatar} alt="User" />
            </div>
          </div>
        </header>

        {/* Scrollable Main Viewport */}
        <main className={`workspace-main-viewport ${localTab === 'messages' ? 'no-padding no-scroll' : 'scroll-y'}`}>
          
          {localTab === 'dashboard' && (
            <DashboardTab 
              jobs={jobs} 
              candidates={candidates} 
              interviews={interviews} 
              tasks={tasks}
              onNavigate={handleTabChange}
              onSelectCandidate={setSelectedCandidate}
              openCreateJobModal={() => handleTabChange('create-job')}
              openScheduleInterviewModal={() => setIsScheduleInterviewOpen(true)}
              openAiJdGenerator={() => setIsAiJdOpen(true)}
            />
          )}

          {localTab === 'jobs' && (
            <JobsTab 
              jobs={jobs}
              onAddJob={handleAddJob}
              onUpdateJob={handleUpdateJob}
              onDeleteJob={handleDeleteJob}
              openCreateJobModal={() => handleTabChange('create-job')}
              openAiJdGenerator={() => setIsAiJdOpen(true)}
            />
          )}

          {localTab === 'create-job' && (
            <CreateJobTab 
              onAddJob={handleAddJob}
              onNavigate={handleTabChange}
            />
          )}

          {localTab === 'applicants' && (
            <ApplicantsTab 
              candidates={candidates}
              jobs={jobs}
              onUpdateCandidate={handleUpdateCandidate}
              selectedCandidate={selectedCandidate}
              onSelectCandidate={setSelectedCandidate}
              onSendMessage={handleTriggerMessage}
              openScheduleInterviewModal={handleTriggerSchedule}
            />
          )}

          {localTab === 'talent-search' && (
            <TalentSearchTab />
          )}

          {localTab === 'pipeline' && (
            <PipelineTab 
              candidates={candidates}
              onUpdateCandidateStage={handleUpdateCandidateStage}
              onSelectCandidate={(cand) => {
                setSelectedCandidate(cand);
                handleTabChange('applicants');
              }}
            />
          )}

          {localTab === 'resume-inbox' && (
            <ResumeInboxTab 
              onAddCandidate={handleAddCandidate}
              onNavigate={handleTabChange}
            />
          )}

          {localTab === 'ai-match' && (
            <AiMatchTab 
              jobs={jobs}
              candidates={candidates}
              onUpdateCandidate={handleUpdateCandidate}
              onSelectCandidate={(cand) => {
                setSelectedCandidate(cand);
                handleTabChange('applicants');
              }}
            />
          )}

          {localTab === 'interviews' && (
            <InterviewsTab 
              interviews={interviews}
              candidates={candidates}
              onAddInterview={handleAddInterview}
              onUpdateInterview={handleUpdateInterview}
              isOpenScheduleModal={isScheduleInterviewOpen}
              setIsOpenScheduleModal={setIsScheduleInterviewOpen}
              prefilledCandidateName={prefillName}
            />
          )}

          {localTab === 'calendar' && (
            <CalendarTab 
              interviews={interviews}
              tasks={tasks}
            />
          )}

          {localTab === 'messages' && (
            <MessagesTab 
              threads={threads}
              onSendMessage={handleSendMessage}
              activeThreadId={activeThreadId}
              setActiveThreadId={(id) => {
                setActiveThreadId(id);
                if(!id) setPrefillName('');
              }}
            />
          )}

          {localTab === 'tasks' && (
            <TasksTab 
              tasks={tasks}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {localTab === 'reports' && (
            <ReportsTab />
          )}

          {localTab === 'notifications' && (
            <NotificationsTab 
              notifications={notifications as any}
              onMarkRead={(id) => markRead(Number(id))}
              onClearAll={markAllRead}
            />
          )}

          {localTab === 'profile' && (
            <ProfileTab />
          )}

        </main>
      </div>

      {/* Floating Quick Action Button */}
      <div className="floating-quick-action-trigger">
        <button className="fab-btn" onClick={() => handleTabChange('create-job')}>
          <Plus size={24} />
        </button>
      </div>

      {/* Global AI Copilot Sidebar Drawer */}
      {showAiAssistant && (
        <div className="ai-assistant-drawer-backdrop" onClick={() => setShowAiAssistant(false)}>
          <div className="ai-assistant-drawer animate-slide-left" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <Sparkles size={18} className="ai-pulse-icon" />
              <h3>GetWorxs AI Copilot</h3>
              <button className="btn-close" onClick={() => setShowAiAssistant(false)}><X size={18} /></button>
            </div>

            <div className="drawer-chat-body scroll-y">
              {aiChatHistory.map((chat, idx) => (
                <div key={idx} className={`chat-msg ${chat.sender}`}>
                  <p>{chat.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAiChatSubmit} className="drawer-chat-input font-sans">
              <input 
                type="text" 
                placeholder="Ask AI Copilot to draft a JD or search candidates..." 
                value={aiChatInput}
                onChange={(e) => setAiChatInput(e.target.value)}
                className="font-sans"
              />
              <button type="submit"><Sparkles size={14} /></button>
            </form>
          </div>
        </div>
      )}

      {/* AI Job Description Generator Modal */}
      {isAiJdOpen && (
        <div className="schedule-modal-backdrop animate-fade-in" onClick={() => setIsAiJdOpen(false)}>
          <div className="schedule-modal-content animate-scale-up lg-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <Sparkles size={18} className="ai-icon-pulse" />
              <h2>AI Job Description Generator</h2>
              <button className="btn-close-modal" onClick={() => setIsAiJdOpen(false)}><X size={18} /></button>
            </div>

            <div className="ai-jd-generator-split">
              <form onSubmit={handleGenerateJd} className="jd-form-col">
                <div className="form-group">
                  <label>Target Role Title:</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Senior PyTorch Developer" 
                    value={jdRoleTitle}
                    onChange={(e) => setJdRoleTitle(e.target.value)}
                    required
                    className="font-sans"
                  />
                </div>
                <div className="form-group">
                  <label>Core Keywords (comma separated):</label>
                  <input 
                    type="text" 
                    placeholder="e.g. PyTorch, CNN, Vector DB" 
                    value={jdKeywords}
                    onChange={(e) => setJdKeywords(e.target.value)}
                    className="font-sans"
                  />
                </div>
                <button type="submit" className="btn-submit font-sans" disabled={isJdGenerating}>
                  {isJdGenerating ? 'Generating Description...' : 'Generate Description'}
                </button>
              </form>

              <div className="jd-output-col">
                {isJdGenerating ? (
                  <div className="generating-state">
                    <Clock size={32} className="ai-icon-pulse" />
                    <p>AI Copilot is drafting requirements structure...</p>
                  </div>
                ) : generatedJd ? (
                  <div className="generated-output-box">
                    <pre className="font-sans">{generatedJd}</pre>
                    <button className="btn-adopt font-sans" onClick={handleAdoptJd}>Adopt & Create Job Listing</button>
                  </div>
                ) : (
                  <div className="empty-jd-output">
                    <FileText size={48} />
                    <p>Generated description draft will be outputted here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default RecruiterDashboard;
