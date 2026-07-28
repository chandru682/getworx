import React, { useState, useEffect } from 'react';
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
import type { RecruiterJob, Candidate, Interview, Task, MessageThread, RecruiterNotification } from './types';
import { 
  mockJobs, 
  mockCandidates, 
  mockInterviews, 
  mockTasks, 
  mockThreads, 
  mockNotifications,
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
import { ProfileTab } from './ProfileTab';
import { CreateJobTab } from './CreateJobTab';

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
  const [notifications, setNotifications] = useState<RecruiterNotification[]>(mockNotifications);
  
  // Local active tab routing (maps parent tab to local tab)
  const [localTab, setLocalTab] = useState<string>('dashboard');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // Modals visibility state
  const [isScheduleInterviewOpen, setIsScheduleInterviewOpen] = useState(false);
  const [isAiJdOpen, setIsAiJdOpen] = useState(false);

  // Prefilled candidate name for scheduling modal
  const [prefillName, setPrefillName] = useState('');

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
    // Append a mock notification
    setNotifications([
      {
        id: `notif-${Date.now()}`,
        type: 'new_applicant',
        title: 'New Applicant Sourced',
        message: `${newCand.name} was added to the database. AI Match: ${newCand.aiMatchScore}%.`,
        time: 'Just Now',
        read: false,
        category: 'applicant'
      },
      ...notifications
    ]);
  };

  const handleUpdateCandidate = (candId: string, updates: Partial<Candidate>) => {
    const updated = candidates.map(c => c.id === candId ? { ...c, ...updates } : c);
    setCandidates(updated);
    if (selectedCandidate && selectedCandidate.id === candId) {
      setSelectedCandidate({ ...selectedCandidate, ...updates });
    }
  };

  const handleUpdateCandidateStage = (candId: string, newStage: Candidate['currentStage']) => {
    handleUpdateCandidate(candId, { currentStage: newStage });
    // Push timeline log
    const cand = candidates.find(c => c.id === candId);
    if (cand) {
      const log = {
        id: `act-${Date.now()}`,
        event: `Moved to ${newStage.charAt(0).toUpperCase() + newStage.slice(1)}`,
        time: 'Just Now',
        details: 'Updated by Recruiter via Pipeline Board.'
      };
      handleUpdateCandidate(candId, {
        activityTimeline: [log, ...cand.activityTimeline]
      });
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

  // Notification mark read
  const handleMarkNotificationRead = (notifId: string) => {
    setNotifications(notifications.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

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
          <div className="brand-header">
            <div className="brand-logo">G</div>
            <span className="brand-name">GetWorxs Recruit</span>
          </div>

          {/* Navigation Links */}
          <nav className="ed-sidebar-nav">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
              { key: 'jobs', label: 'Job Openings', icon: <Briefcase size={18} />, badge: jobs.filter(j => j.status === 'active').length },
              { key: 'applicants', label: 'Applicants', icon: <Users size={18} />, badge: candidates.filter(c => c.currentStage === 'applied').length },
              { key: 'pipeline', label: 'Candidate Pipeline', icon: <GitBranch size={18} /> },
              { key: 'resume-inbox', label: 'Resume Inbox', icon: <Inbox size={18} /> },
              { key: 'ai-match', label: 'AI Candidate Match', icon: <Sparkles size={18} /> },
              { key: 'interviews', label: 'Interviews', icon: <CalendarIcon size={18} />, badge: interviews.filter(i => i.status === 'today').length },
              { key: 'calendar', label: 'Calendar', icon: <CalendarIcon size={18} /> },
              { key: 'messages', label: 'Messages', icon: <MessageSquare size={18} />, badge: threads.filter(t => t.unreadCount > 0).length },
              { key: 'tasks', label: 'Tasks', icon: <CheckSquare size={18} />, badge: tasks.filter(t => t.status !== 'completed').length },
              { key: 'reports', label: 'Reports', icon: <BarChart2 size={18} /> },
              { key: 'notifications', label: 'Notifications', icon: <Bell size={18} />, badge: notifications.filter(n => !n.read).length },
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
          <div className="global-search-wrapper">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Global Search: candidates, jobs, skills..." 
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="font-sans"
            />
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
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="dot"></span>
              )}
            </button>

            <div className="user-indicator" onClick={() => handleTabChange('profile')}>
              <img src={mockRecruiterProfile.avatar} alt="User" />
            </div>
          </div>
        </header>

        {/* Scrollable Main Viewport */}
        <main className="workspace-main-viewport scroll-y">
          
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
              activeThreadId={prefillName ? (threads.find(t => t.name.toLowerCase().includes(prefillName.toLowerCase()))?.id || null) : null}
              setActiveThreadId={(id) => {
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
              notifications={notifications}
              onMarkRead={handleMarkNotificationRead}
              onClearAll={handleClearNotifications}
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
