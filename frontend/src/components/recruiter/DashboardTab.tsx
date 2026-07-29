import React from 'react';
import { 
  Sparkles, 
  Calendar, 
  Users, 
  Briefcase, 
  Clock, 
  CheckSquare, 
  TrendingUp, 
  UserCheck, 
  Award, 
  ChevronRight, 
  Play,
  ArrowUpRight,
  FileText,
  UserPlus
} from 'lucide-react';
import type { Candidate, RecruiterJob, Interview, Task } from './types';
import { mockRecruiterProfile } from './mockData';

interface DashboardTabProps {
  jobs: RecruiterJob[];
  candidates: Candidate[];
  interviews: Interview[];
  tasks: Task[];
  onNavigate: (tab: string) => void;
  onSelectCandidate: (candidate: Candidate) => void;
  openCreateJobModal: () => void;
  openScheduleInterviewModal: () => void;
  openAiJdGenerator: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  jobs,
  candidates,
  interviews,
  tasks,
  onNavigate,
  onSelectCandidate,
  openCreateJobModal,
  openScheduleInterviewModal,
  openAiJdGenerator
}) => {
  // Statistics Computations
  const activeJobsCount = jobs.filter(j => j.status === 'active').length;
  const newApplicantsCount = candidates.filter(c => c.currentStage === 'applied').length;
  const shortlistedCount = candidates.filter(c => c.currentStage === 'shortlisted').length;
  const todayInterviews = interviews.filter(i => i.status === 'today');
  const upcomingInterviewsCount = interviews.filter(i => i.status === 'upcoming').length;
  const offersReleased = candidates.filter(c => c.currentStage === 'offer').length;
  const joinedCount = candidates.filter(c => c.currentStage === 'joined').length;
  const tasksDue = tasks.filter(t => t.status !== 'completed').length;
  
  // Mock metrics
  const avgHiringTime = '18 Days';
  const hiringSuccessRate = '94.2%';

  // AI recommendations (candidates with score >= 90 and state is applied/screening)
  const aiRecommendations = candidates
    .filter(c => c.aiMatchScore >= 90 && (c.currentStage === 'applied' || c.currentStage === 'screening'))
    .slice(0, 3);

  // Recent activity items (e.g. from candidate logs)
  const recentActivities = candidates
    .flatMap(c => c.activityTimeline.map(a => ({ ...a, candidate: c })))
    .sort((a, b) => b.time.localeCompare(a.time))
    .slice(0, 4);

  return (
    <div className="recruiter-dashboard">
      {/* Welcome Banner */}
      <div className="recruiter-welcome-banner">
        <div className="welcome-banner-content">
          <div className="ai-badge">
            <Sparkles size={14} className="ai-icon-pulse" />
            <span>AI Recruiter Copilot Active</span>
          </div>
          <h1>Welcome Back, {mockRecruiterProfile.name}</h1>
          <p>
            You have <strong>{todayInterviews.length}</strong> interviews scheduled today and <strong>{tasksDue}</strong> pending recruiting tasks. AI has identified <strong>{aiRecommendations.length}</strong> high-match candidates.
          </p>
        </div>
        <div className="welcome-banner-stats">
          <div className="circular-progress-container">
            <div className="circular-progress-text">
              <span className="large-stat">{mockRecruiterProfile.performanceScore}%</span>
              <span className="stat-label">Performance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="stats-cards-grid">
        <div className="stat-card" onClick={() => onNavigate('applicants')}>
          <div className="stat-icon-wrapper purple">
            <Users size={20} />
          </div>
          <div className="stat-data">
            <h3>New Applications</h3>
            <div className="stat-value-group">
              <span className="stat-number">{newApplicantsCount}</span>
              <span className="stat-trend green">
                <TrendingUp size={12} /> +12% today
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('jobs')}>
          <div className="stat-icon-wrapper blue">
            <Briefcase size={20} />
          </div>
          <div className="stat-data">
            <h3>Open Positions</h3>
            <div className="stat-value-group">
              <span className="stat-number">{activeJobsCount}</span>
              <span className="stat-subtitle">/ {jobs.length} total</span>
            </div>
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('applicants')}>
          <div className="stat-icon-wrapper green">
            <UserCheck size={20} />
          </div>
          <div className="stat-data">
            <h3>Shortlisted</h3>
            <div className="stat-value-group">
              <span className="stat-number">{shortlistedCount}</span>
              <span className="stat-subtitle">Candidates</span>
            </div>
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('interviews')}>
          <div className="stat-icon-wrapper orange">
            <Calendar size={20} />
          </div>
          <div className="stat-data">
            <h3>Interviews</h3>
            <div className="stat-value-group">
              <span className="stat-number">{todayInterviews.length + upcomingInterviewsCount}</span>
              <span className="stat-subtitle">{todayInterviews.length} today</span>
            </div>
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('applicants')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-wrapper coral">
            <Award size={20} />
          </div>
          <div className="stat-data">
            <h3>Offers / Joined</h3>
            <div className="stat-value-group">
              <span className="stat-number">{offersReleased} / {joinedCount}</span>
              <span className="stat-subtitle">Joined</span>
            </div>
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('reports')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-wrapper slate">
            <Clock size={20} />
          </div>
          <div className="stat-data">
            <h3>Avg Hiring Time</h3>
            <div className="stat-value-group">
              <span className="stat-number">{avgHiringTime}</span>
              <span className="stat-subtitle">Target: 21d</span>
            </div>
          </div>
        </div>

        <div className="stat-card" onClick={() => onNavigate('reports')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon-wrapper purple">
            <TrendingUp size={20} />
          </div>
          <div className="stat-data">
            <h3>Success Rate</h3>
            <div className="stat-value-group">
              <span className="stat-number">{hiringSuccessRate}</span>
              <span className="stat-trend green">+0.8% MoM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="quick-actions-bar">
        <h3>Quick Actions</h3>
        <div className="quick-actions-buttons">
          <button className="q-btn font-sans" onClick={openCreateJobModal}>
            <Briefcase size={16} />
            <span>Create Job</span>
          </button>
          <button className="q-btn font-sans" onClick={() => onNavigate('applicants')}>
            <Users size={16} />
            <span>Review Applicants</span>
          </button>
          <button className="q-btn font-sans" onClick={openScheduleInterviewModal}>
            <Calendar size={16} />
            <span>Schedule Interview</span>
          </button>
          <button className="q-btn font-sans" onClick={() => onNavigate('applicants')}>
            <UserPlus size={16} />
            <span>Search Candidates</span>
          </button>
          <button className="q-btn ai-q-btn font-sans" onClick={openAiJdGenerator}>
            <Sparkles size={16} />
            <span>Generate AI Job Description</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Widgets */}
      <div className="dashboard-widgets-grid">
        {/* Left Column */}
        <div className="widget-col">
          {/* Today's Interviews Widget */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Today's Interviews</h2>
              <span className="header-badge count-badge">{todayInterviews.length} Today</span>
            </div>
            <div className="card-body scroll-y max-h-350">
              {todayInterviews.length > 0 ? (
                <div className="interview-list-dashboard">
                  {todayInterviews.map(interview => (
                    <div key={interview.id} className="interview-dashboard-item">
                      <img src={interview.avatar} alt={interview.candidateName} className="avatar-sm" />
                      <div className="interview-info">
                        <h4>{interview.candidateName}</h4>
                        <p>{interview.type} • {interview.time}</p>
                      </div>
                      <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer" className="btn-join-meeting font-sans">
                        <Play size={12} fill="currentColor" /> Join
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-widget-state">
                  <Calendar size={32} />
                  <p>No interviews scheduled for today.</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="dashboard-card">
            <div className="card-header">
              <div className="header-title-ai">
                <Sparkles size={16} />
                <h2>AI Top Match Recommendations</h2>
              </div>
              <button className="text-btn font-sans" onClick={() => onNavigate('ai-match')}>
                View Matches <ChevronRight size={14} />
              </button>
            </div>
            <div className="card-body">
              {aiRecommendations.length > 0 ? (
                <div className="ai-recommendations-list">
                  {aiRecommendations.map(candidate => (
                    <div key={candidate.id} className="ai-rec-item" onClick={() => onSelectCandidate(candidate)}>
                      <div className="ai-rec-avatar-wrapper">
                        <img src={candidate.photoUrl} alt={candidate.name} className="avatar-sm" />
                        <span className="match-pill-floating">{candidate.aiMatchScore}%</span>
                      </div>
                      <div className="ai-rec-details">
                        <h4>{candidate.name}</h4>
                        <p>{candidate.currentDesignation} • {candidate.experienceYears} yrs</p>
                        <div className="ai-skills-mini">
                          {candidate.skills.slice(0, 3).map((s, idx) => (
                            <span key={idx} className="skill-mini-badge">{s}</span>
                          ))}
                        </div>
                      </div>
                      <ArrowUpRight size={16} className="item-arrow" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-widget-state">
                  <Sparkles size={32} />
                  <p>No new AI candidate recommendations available.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="widget-col">
          {/* Tasks Widget */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Tasks Due Today</h2>
              <span className="header-badge alert-badge">{tasksDue} Pending</span>
            </div>
            <div className="card-body scroll-y max-h-300">
              {tasks.filter(t => t.status !== 'completed').length > 0 ? (
                <div className="tasks-dashboard-list">
                  {tasks.filter(t => t.status !== 'completed').slice(0, 5).map(task => (
                    <div key={task.id} className="task-dashboard-item" onClick={() => onNavigate('tasks')} style={{ cursor: 'pointer' }}>
                      <div className="task-checkbox-label">
                        <CheckSquare size={16} className={`task-checkbox-icon ${task.priority}`} />
                        <div className="task-content">
                          <span className="task-title">{task.title}</span>
                          {task.candidateName && <span className="task-subtext">Candidate: {task.candidateName}</span>}
                        </div>
                      </div>
                      <span className={`task-priority-badge ${task.priority}`}>{task.priority}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-widget-state">
                  <CheckSquare size={32} />
                  <p>All caught up! No pending tasks due today.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Candidate Activities */}
          <div className="dashboard-card">
            <div className="card-header">
              <h2>Recent Candidate Activities</h2>
            </div>
            <div className="card-body scroll-y max-h-350">
              {recentActivities.length > 0 ? (
                <div className="activities-dashboard-timeline">
                  {recentActivities.map((act, idx) => (
                    <div key={idx} className="activity-timeline-item" onClick={() => onSelectCandidate(act.candidate)}>
                      <div className="timeline-line"></div>
                      <div className="timeline-bullet"></div>
                      <div className="activity-details">
                        <div className="activity-title-group">
                          <strong>{act.candidate.name}</strong>
                          <span className="activity-time">{act.time}</span>
                        </div>
                        <p>{act.event}</p>
                        {act.details && <span className="activity-sub">{act.details}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-widget-state">
                  <FileText size={32} />
                  <p>No recent candidate activities logged.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
