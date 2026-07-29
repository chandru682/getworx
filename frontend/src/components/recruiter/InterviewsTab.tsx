import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Users, 
  Video, 
  Star, 
  Sparkles, 
  Plus, 
  X, 
  CheckCircle,
  HelpCircle,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import type { Interview, Candidate } from './types';

interface InterviewsTabProps {
  interviews: Interview[];
  candidates: Candidate[];
  onAddInterview: (newInterview: Interview) => void;
  onUpdateInterview: (intId: string, updates: Partial<Interview>) => void;
  isOpenScheduleModal: boolean;
  setIsOpenScheduleModal: (open: boolean) => void;
  prefilledCandidateName?: string;
}

export const InterviewsTab: React.FC<InterviewsTabProps> = ({
  interviews,
  candidates,
  onAddInterview,
  onUpdateInterview,
  isOpenScheduleModal,
  setIsOpenScheduleModal,
  prefilledCandidateName = ''
}) => {
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'completed' | 'cancelled'>('today');
  const [selectedInterviewId, setSelectedInterviewId] = useState<string | null>(interviews[0]?.id || null);

  // Form scheduling state
  const [candidateName, setCandidateName] = useState(prefilledCandidateName);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('Technical Screening');
  const [meetingType, setMeetingType] = useState<'google' | 'zoom' | 'teams'>('google');
  const [panelMembers, setPanelMembers] = useState('');

  // Form feedback state
  const [feedbackText, setFeedbackText] = useState('');
  const [ratingVal, setRatingVal] = useState(0);

  const filteredInterviews = interviews.filter(i => i.status === activeTab);
  const selectedInterview = interviews.find(i => i.id === selectedInterviewId) || filteredInterviews[0];

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName || !date || !time) {
      alert('Please fill out all fields.');
      return;
    }

    const matchedCand = candidates.find(c => c.name.toLowerCase().includes(candidateName.toLowerCase()));
    
    const newInt: Interview = {
      id: `int-${Date.now()}`,
      candidateId: matchedCand?.id || 'cand-unknown',
      candidateName: candidateName,
      avatar: matchedCand?.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      date,
      time,
      type,
      meetingLink: meetingType === 'google' ? 'https://meet.google.com/xyz-abc' : meetingType === 'zoom' ? 'https://zoom.us/j/1234' : 'https://teams.microsoft.com/l/meet',
      linkType: meetingType,
      panel: panelMembers ? panelMembers.split(',').map(m => m.trim()) : ['Sarah Connor'],
      status: 'upcoming'
    };

    onAddInterview(newInt);
    alert('Interview scheduled successfully!');
    setIsOpenScheduleModal(false);
    setActiveTab('upcoming');

    // Reset Form
    setCandidateName('');
    setDate('');
    setTime('');
    setPanelMembers('');
  };

  const handleSaveFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterview) return;

    onUpdateInterview(selectedInterview.id, {
      feedback: feedbackText,
      rating: ratingVal,
      aiSummary: `AI generated wrap-up: Candidate scored ${ratingVal}/5 in technical evaluation. Recruiter highlighted feedback: "${feedbackText}"`,
      status: 'completed'
    });

    alert('Feedback and rating saved successfully!');
    setFeedbackText('');
    setRatingVal(0);
    setActiveTab('completed');
  };

  return (
    <div className="interviews-workspace font-sans">
      
      {/* Tab Header */}
      <div className="interviews-header">
        <div>
          <h1>Interview Management</h1>
          <p>Schedule new interviews, assign recruiter panels, input notes, and review technical feedback.</p>
        </div>
        <button className="btn-primary font-sans" onClick={() => setIsOpenScheduleModal(true)}>
          <Plus size={16} /> Schedule Interview
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="interviews-tabs-row">
        <div className="tab-filters">
          <button className={`tab-filter-btn ${activeTab === 'today' ? 'active' : ''}`} onClick={() => { setActiveTab('today'); setSelectedInterviewId(null); }}>
            Today's Interviews
          </button>
          <button className={`tab-filter-btn ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => { setActiveTab('upcoming'); setSelectedInterviewId(null); }}>
            Upcoming
          </button>
          <button className={`tab-filter-btn ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => { setActiveTab('completed'); setSelectedInterviewId(null); }}>
            Completed
          </button>
          <button className={`tab-filter-btn ${activeTab === 'cancelled' ? 'active' : ''}`} onClick={() => { setActiveTab('cancelled'); setSelectedInterviewId(null); }}>
            Cancelled
          </button>
        </div>
      </div>

      <div className="interviews-split-layout">
        
        {/* Left Side: Interview Cards List */}
        <div className="interviews-list-col">
          {filteredInterviews.length > 0 ? (
            filteredInterviews.map(int => (
              <div 
                key={int.id} 
                className={`interview-item-card animate-fade-in ${selectedInterview?.id === int.id ? 'selected' : ''}`}
                onClick={() => setSelectedInterviewId(int.id)}
              >
                <div className="card-top">
                  <img src={int.avatar} alt={int.candidateName} className="avatar-md" />
                  <div className="cand-info">
                    <h3>{int.candidateName}</h3>
                    <p className="type">{int.type}</p>
                    <div className="time-details">
                      <Clock size={12} /> <span>{int.time}</span>
                      <Calendar size={12} style={{ marginLeft: '12px' }} /> <span>{int.date}</span>
                    </div>
                  </div>
                </div>

                <div className="panel-list-mini">
                  <Users size={12} />
                  <span>Panel: {int.panel.join(', ')}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-interviews-list">
              <Calendar size={36} />
              <p>No interviews found for this category.</p>
            </div>
          )}
        </div>

        {/* Right Side: Detailed Interview Card & Feedback Form */}
        <div className="interview-details-col">
          {selectedInterview ? (
            <div className="detailed-interview-card animate-slide-up">
              
              {/* Top Banner */}
              <div className="detail-banner">
                <div className="cand-header">
                  <img src={selectedInterview.avatar} alt={selectedInterview.candidateName} className="avatar-lg" />
                  <div>
                    <h2>{selectedInterview.candidateName}</h2>
                    <p>{selectedInterview.type}</p>
                    <span className="datetime"><Calendar size={12} /> {selectedInterview.date} at {selectedInterview.time}</span>
                  </div>
                </div>

                <div className="meeting-link-box">
                  <div className="meet-info">
                    <Video size={16} />
                    <span>Video Conference</span>
                  </div>
                  <a href={selectedInterview.meetingLink} target="_blank" rel="noopener noreferrer" className="btn-launch-meet font-sans">
                    Join via {selectedInterview.linkType.toUpperCase()} <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              {/* Panel Details */}
              <div className="detail-section">
                <h3>Interview Panel</h3>
                <div className="panel-pills">
                  {selectedInterview.panel.map((p, idx) => (
                    <span key={idx} className="panel-pill">{p}</span>
                  ))}
                </div>
              </div>

              {/* Feedbacks / Review Info */}
              {selectedInterview.status === 'completed' ? (
                <div className="completed-assessment-box">
                  <div className="rating-heading">
                    <h3>Technical Assessment Score</h3>
                    <div className="stars-row">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={16} className={`star-icon ${i < (selectedInterview.rating || 0) ? 'filled' : ''}`} />
                      ))}
                    </div>
                  </div>
                  
                  <div className="feedback-section">
                    <h4>Recruiter Feedback</h4>
                    <p className="feedback-txt">"{selectedInterview.feedback}"</p>
                  </div>

                  {selectedInterview.aiSummary && (
                    <div className="ai-wrapup-box">
                      <Sparkles size={16} className="ai-pulse-icon" />
                      <div>
                        <h4>AI Interview Summary</h4>
                        <p>{selectedInterview.aiSummary}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : selectedInterview.status === 'today' || selectedInterview.status === 'upcoming' ? (
                // Feedback Entry Form for Active Interviews
                <div className="feedback-entry-form-box">
                  <h3>Submit Post-Interview Assessment</h3>
                  <form onSubmit={handleSaveFeedback}>
                    
                    <div className="form-group-star">
                      <label>Technical Competency Rating:</label>
                      <div className="stars-input-row">
                        {[1, 2, 3, 4, 5].map(val => (
                          <button 
                            key={val} 
                            type="button" 
                            onClick={() => setRatingVal(val)} 
                            className={`star-select-btn ${ratingVal >= val ? 'active' : ''}`}
                          >
                            <Star size={20} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group-textarea">
                      <label>Detailed Feedback Notes:</label>
                      <textarea 
                        placeholder="Detail the candidate's strengths, system design skills, and technical red flags..." 
                        value={feedbackText} 
                        onChange={(e) => setFeedbackText(e.target.value)}
                        required
                        className="font-sans"
                      />
                    </div>

                    <button type="submit" className="btn-submit-assessment font-sans">
                      <CheckCircle size={14} /> Submit Assessment & Complete
                    </button>
                  </form>
                </div>
              ) : (
                <div className="cancelled-assessment-box">
                  <AlertCircle size={20} className="red-txt" />
                  <p>This interview was cancelled. No feedback assessments are required.</p>
                </div>
              )}

            </div>
          ) : (
            <div className="empty-detailed-interview">
              <HelpCircle size={48} />
              <h3>Select an interview to view insights</h3>
              <p>Click on one of the schedule cards on the left panel to inspect panel details or submit candidate ratings.</p>
            </div>
          )}
        </div>

      </div>

      {/* Schedule Interview Modal overlay */}
      {isOpenScheduleModal && (
        <div className="schedule-modal-backdrop animate-fade-in" onClick={() => setIsOpenScheduleModal(false)}>
          <div className="schedule-modal-content animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Schedule Recruitment Interview</h2>
              <button className="btn-close-modal" onClick={() => setIsOpenScheduleModal(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleScheduleSubmit}>
              <div className="modal-body-form">
                
                <div className="form-group">
                  <label>Candidate Name:</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Alex Morgan" 
                    value={candidateName} 
                    onChange={(e) => setCandidateName(e.target.value)}
                    required
                    className="font-sans"
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Interview Date:</label>
                    <input 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="font-sans"
                    />
                  </div>
                  <div className="form-group">
                    <label>Interview Time:</label>
                    <input 
                      type="time" 
                      value={time} 
                      onChange={(e) => setTime(e.target.value)}
                      required
                      className="font-sans"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Interview Stage Type:</label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className="font-sans">
                    <option value="Technical Screening">Technical Screening</option>
                    <option value="System Design Round 1">System Design Round 1</option>
                    <option value="HR Cultural Fitment">HR Cultural Fitment</option>
                    <option value="Executive Wrap-up">Executive Wrap-up</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Video Conference Platform:</label>
                  <div className="radio-meet-group">
                    <label className={`radio-pill ${meetingType === 'google' ? 'active' : ''}`}>
                      <input type="radio" checked={meetingType === 'google'} onChange={() => setMeetingType('google')} />
                      <span>Google Meet</span>
                    </label>
                    <label className={`radio-pill ${meetingType === 'zoom' ? 'active' : ''}`}>
                      <input type="radio" checked={meetingType === 'zoom'} onChange={() => setMeetingType('zoom')} />
                      <span>Zoom Meeting</span>
                    </label>
                    <label className={`radio-pill ${meetingType === 'teams' ? 'active' : ''}`}>
                      <input type="radio" checked={meetingType === 'teams'} onChange={() => setMeetingType('teams')} />
                      <span>MS Teams</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Panel Interviewers (comma-separated):</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Sarah Connor, Jonathan Vance" 
                    value={panelMembers} 
                    onChange={(e) => setPanelMembers(e.target.value)}
                    className="font-sans"
                  />
                </div>

              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn-cancel font-sans" onClick={() => setIsOpenScheduleModal(false)}>Cancel</button>
                <button type="submit" className="btn-submit font-sans">Confirm Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
