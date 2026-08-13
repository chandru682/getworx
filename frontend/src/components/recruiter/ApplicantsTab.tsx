import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  Eye, 
  Check, 
  X, 
  MessageSquare, 
  FileText, 
  Phone,
  Mail,
  Globe,
  Calendar,
  Download,
  AlertCircle
} from 'lucide-react';
import type { Candidate, RecruiterJob } from './types';

interface ApplicantsTabProps {
  candidates: Candidate[];
  jobs: RecruiterJob[];
  onUpdateCandidate: (candId: string, updates: Partial<Candidate>) => void;
  selectedCandidate: Candidate | null;
  onSelectCandidate: (candidate: Candidate | null) => void;
  onSendMessage: (candidateName: string) => void;
  openScheduleInterviewModal: (candidateName: string) => void;
}

export const ApplicantsTab: React.FC<ApplicantsTabProps> = ({
  candidates,
  jobs: _jobs,
  onUpdateCandidate,
  selectedCandidate,
  onSelectCandidate,
  onSendMessage,
  openScheduleInterviewModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [jobFilter, setJobFilter] = useState<string>('all');
  const [minAiScore, setMinAiScore] = useState<number>(0);
  const [expFilter, setExpFilter] = useState<string>('all');
  const [noticeFilter, setNoticeFilter] = useState<string>('all');
  const [newNoteText, setNewNoteText] = useState('');

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const handleToggleSkillFilter = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddNote = (candId: string) => {
    if (!newNoteText.trim()) return;
    const candidate = candidates.find(c => c.id === candId);
    if (!candidate) return;

    const newNote = {
      id: `note-${Date.now()}`,
      author: 'Sarah Connor',
      text: newNoteText,
      date: new Date().toISOString().split('T')[0]
    };

    onUpdateCandidate(candId, {
      recruiterNotes: [newNote, ...candidate.recruiterNotes]
    });
    setNewNoteText('');
  };

  // Filter candidates
  const filteredCandidates = candidates.filter(cand => {
    const matchSearch = cand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        cand.currentDesignation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        cand.currentCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        cand.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchStage = stageFilter === 'all' || cand.currentStage === stageFilter;
    
    const matchJob = jobFilter === 'all' || 
                     (jobFilter === 'React' && cand.skills.includes('React')) ||
                     (jobFilter === 'AI' && cand.skills.includes('Python')) ||
                     (jobFilter === 'HR' && cand.skills.includes('Talent Sourcing'));

    const matchAiScore = cand.aiMatchScore >= minAiScore;

    let matchExp = true;
    if (expFilter !== 'all') {
      if (expFilter === 'junior') matchExp = cand.experienceYears <= 3;
      else if (expFilter === 'mid') matchExp = cand.experienceYears > 3 && cand.experienceYears <= 6;
      else if (expFilter === 'senior') matchExp = cand.experienceYears > 6;
    }

    const matchNotice = noticeFilter === 'all' || cand.noticePeriod === noticeFilter;
    const matchSkills = selectedSkills.length === 0 || selectedSkills.every(s => cand.skills.includes(s));

    return matchSearch && matchStage && matchJob && matchAiScore && matchExp && matchNotice && matchSkills;
  });

  return (
    <div className="applicants-workspace">
      {/* Filters sidebar on the left, CRM list on the right */}
      <div className="applicants-crm-layout">
        
        {/* Left Filters Panel */}
        <aside className="crm-filters-sidebar">
          <div className="filter-sidebar-header">
            <h3>Advanced CRM Filters</h3>
            <button className="clear-link-btn" onClick={() => {
              setSearchTerm('');
              setStageFilter('all');
              setJobFilter('all');
              setMinAiScore(0);
              setExpFilter('all');
              setNoticeFilter('all');
              setSelectedSkills([]);
            }}>Reset</button>
          </div>

          <div className="filter-group-block">
            <label>Current Status Stage</label>
            <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
              <option value="all">All Stages</option>
              <option value="applied">Applied</option>
              <option value="screening">Screening</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interview1">Interview Round 1</option>
              <option value="interview2">Interview Round 2</option>
              <option value="final">Final Discussion</option>
              <option value="offer">Offer Released</option>
              <option value="joined">Joined</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="filter-group-block">
            <label>Experience Range</label>
            <select value={expFilter} onChange={(e) => setExpFilter(e.target.value)}>
              <option value="all">All Experience</option>
              <option value="junior">Junior (0-3 yrs)</option>
              <option value="mid">Mid-level (3-6 yrs)</option>
              <option value="senior">Senior (6+ yrs)</option>
            </select>
          </div>

          <div className="filter-group-block">
            <label>Notice Period</label>
            <select value={noticeFilter} onChange={(e) => setNoticeFilter(e.target.value)}>
              <option value="all">All Durations</option>
              <option value="Immediate">Immediate / Serving</option>
              <option value="15 Days">15 Days</option>
              <option value="30 Days">30 Days</option>
              <option value="60 Days">60 Days</option>
            </select>
          </div>

          <div className="filter-group-block">
            <div className="range-label-row">
              <label>Min AI Match Score</label>
              <span>{minAiScore}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="95" 
              value={minAiScore} 
              onChange={(e) => setMinAiScore(Number(e.target.value))} 
            />
          </div>

          <div className="filter-group-block">
            <label>Filter by Skills Required</label>
            <div className="skills-checklist">
              {['React', 'TypeScript', 'Python', 'PyTorch', 'Node.js', 'Kubernetes', 'Terraform', 'Figma', 'Talent Sourcing'].map(skill => (
                <label key={skill} className="skill-check-item">
                  <input 
                    type="checkbox" 
                    checked={selectedSkills.includes(skill)} 
                    onChange={() => handleToggleSkillFilter(skill)}
                  />
                  <span>{skill}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Center/Right Candidate Grid */}
        <main className="crm-results-area">
          <div className="crm-results-header">
            <div className="search-crm-box">
              <Search size={16} />
              <input 
                type="text" 
                placeholder="Search candidates by name, company, role, or skills..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <span className="results-count">Showing <strong>{filteredCandidates.length}</strong> Profiles</span>
          </div>

          <div className="candidates-cards-grid">
            {filteredCandidates.length > 0 ? (
              filteredCandidates.map(cand => (
                <div 
                  key={cand.id} 
                  className={`candidate-crm-card animate-fade-in ${selectedCandidate?.id === cand.id ? 'active-border' : ''}`}
                >
                  <div className="crm-card-header">
                    <div className="cand-main-profile">
                      <img src={cand.photoUrl} alt={cand.name} className="cand-avatar" />
                      <div>
                        <h3>{cand.name}</h3>
                        <p className="designation-company">{cand.currentDesignation} at <strong>{cand.currentCompany}</strong></p>
                        <span className="cand-location-exp"><MapPin size={12} /> {cand.location} • {cand.experienceYears} yrs exp</span>
                      </div>
                    </div>
                    <div className="score-badge-pair">
                      <div className="score-badge ai">
                        <Sparkles size={11} />
                        <span>AI Match {cand.aiMatchScore}%</span>
                      </div>
                      <div className="score-badge ats">
                        <span>ATS {cand.resumeScore}</span>
                      </div>
                    </div>
                  </div>

                  <div className="crm-card-tags scroll-x-hidden">
                    {cand.skills.map((s, idx) => (
                      <span key={idx} className="crm-skill-pill">{s}</span>
                    ))}
                  </div>

                  <div className="crm-card-metrics">
                    <div className="metric">
                      <span className="lbl">Notice Period</span>
                      <span className="val">{cand.noticePeriod}</span>
                    </div>
                    <div className="metric">
                      <span className="lbl">Exp Salary</span>
                      <span className="val">{cand.expectedSalary}</span>
                    </div>
                    <div className="metric">
                      <span className="lbl">Availability</span>
                      <span className="val">{cand.availability}</span>
                    </div>
                    <div className="metric">
                      <span className="lbl">Current Stage</span>
                      <span className={`lbl-stage ${cand.currentStage}`}>{cand.currentStage.replace('1', ' R1').replace('2', ' R2').toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="crm-card-actions">
                    <button className="crm-action-btn font-sans secondary" onClick={() => onSelectCandidate(cand)}>
                      <Eye size={14} /> Profile
                    </button>
                    <button className="crm-action-btn font-sans secondary" onClick={() => onSendMessage(cand.name)}>
                      <MessageSquare size={14} /> Message
                    </button>
                    {cand.currentStage !== 'shortlisted' && cand.currentStage !== 'joined' && cand.currentStage !== 'rejected' && (
                      <button className="crm-action-btn font-sans success" onClick={() => onUpdateCandidate(cand.id, { currentStage: 'shortlisted' })}>
                        <Check size={14} /> Shortlist
                      </button>
                    )}
                    {cand.currentStage !== 'rejected' && (
                      <button className="crm-action-btn font-sans danger" onClick={() => onUpdateCandidate(cand.id, { currentStage: 'rejected' })}>
                        <X size={14} /> Reject
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-results-crm">
                <AlertCircle size={48} />
                <h3>No applications received.</h3>
                <p>Applications submitted by job seekers will appear here.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Slide-over Premium Candidate Profile Drawer */}
      {selectedCandidate && (
        <div className="candidate-profile-drawer-backdrop animate-fade-in" onClick={() => onSelectCandidate(null)}>
          <div className="candidate-profile-drawer animate-slide-left font-sans" onClick={(e) => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className="drawer-header-bar">
              <div className="drawer-header-info">
                <h2>Candidate Profile File</h2>
                <span className="drawer-id">ID: {selectedCandidate.id}</span>
              </div>
              <button className="btn-close-drawer" onClick={() => onSelectCandidate(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body Scroll */}
            <div className="drawer-body-scroll scroll-y">
              {/* Profile Card Banner */}
              <div className="drawer-profile-banner">
                <div className="main-meta-summary">
                  <img src={selectedCandidate.photoUrl} alt={selectedCandidate.name} className="drawer-avatar" />
                  <div className="meta-text">
                    <h2>{selectedCandidate.name}</h2>
                    <p className="title">{selectedCandidate.currentDesignation}</p>
                    <p className="company">{selectedCandidate.currentCompany} • {selectedCandidate.experienceYears} Years Exp</p>
                    <div className="socials-links-drawer">
                      {selectedCandidate.socialLinks.linkedin && (
                        <a href={`https://${selectedCandidate.socialLinks.linkedin}`} target="_blank" rel="noreferrer">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                        </a>
                      )}
                      {selectedCandidate.socialLinks.github && (
                        <a href={`https://${selectedCandidate.socialLinks.github}`} target="_blank" rel="noreferrer">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                        </a>
                      )}
                      {selectedCandidate.portfolioUrl && (
                        <a href={selectedCandidate.portfolioUrl} target="_blank" rel="noreferrer"><Globe size={14} /></a>
                      )}
                      <a href={`mailto:${selectedCandidate.email}`}><Mail size={14} /></a>
                      <a href={`tel:${selectedCandidate.phone}`}><Phone size={14} /></a>
                    </div>
                  </div>
                </div>

                <div className="drawer-scores-block">
                  <div className="match-pill large purple">
                    <Sparkles size={16} />
                    <div>
                      <span className="percent">{selectedCandidate.aiMatchScore}%</span>
                      <span className="label">AI Match Score</span>
                    </div>
                  </div>
                  <div className="match-pill large gray">
                    <FileText size={16} />
                    <div>
                      <span className="percent">{selectedCandidate.resumeScore}</span>
                      <span className="label">ATS Resume Score</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="drawer-action-toolbar">
                <button className="t-btn font-sans secondary" onClick={() => onSendMessage(selectedCandidate.name)}>
                  <MessageSquare size={14} /> Send Message
                </button>
                <button className="t-btn font-sans secondary" onClick={() => openScheduleInterviewModal(selectedCandidate.name)}>
                  <Calendar size={14} /> Schedule Interview
                </button>
                {selectedCandidate.currentStage !== 'shortlisted' && (
                  <button className="t-btn font-sans success" onClick={() => onUpdateCandidate(selectedCandidate.id, { currentStage: 'shortlisted' })}>
                    <Check size={14} /> Shortlist Candidate
                  </button>
                )}
                {selectedCandidate.currentStage !== 'rejected' && (
                  <button className="t-btn font-sans danger" onClick={() => onUpdateCandidate(selectedCandidate.id, { currentStage: 'rejected' })}>
                    <X size={14} /> Reject Application
                  </button>
                )}
              </div>

              {/* Grid content */}
              <div className="drawer-content-grid">
                
                {/* Left Col (Summary, Work, Projects) */}
                <div className="drawer-grid-left">
                  {/* Summary */}
                  <div className="drawer-profile-section">
                    <h3>Professional Summary</h3>
                    <p>{selectedCandidate.professionalSummary}</p>
                  </div>

                  {/* Work Experience */}
                  <div className="drawer-profile-section">
                    <h3>Experience Timeline</h3>
                    <div className="experience-timeline-drawer">
                      {selectedCandidate.experienceTimeline.map(exp => (
                        <div key={exp.id} className="timeline-exp-card">
                          <div className="exp-circle"></div>
                          <div className="exp-details">
                            <div className="exp-header">
                              <h4>{exp.role}</h4>
                              <span className="duration">{exp.duration}</span>
                            </div>
                            <h5 className="company-lbl">{exp.company}</h5>
                            <p>{exp.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Projects */}
                  {selectedCandidate.projects && selectedCandidate.projects.length > 0 && (
                    <div className="drawer-profile-section">
                      <h3>Featured Projects</h3>
                      <div className="projects-grid-drawer">
                        {selectedCandidate.projects.map(proj => (
                          <div key={proj.id} className="project-card-drawer">
                            <h4>{proj.title}</h4>
                            <p>{proj.description}</p>
                            <div className="stack">
                              {proj.techStack.map((t, idx) => <span key={idx}>{t}</span>)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  <div className="drawer-profile-section">
                    <h3>Education</h3>
                    <div className="education-list-drawer">
                      {selectedCandidate.education.map(edu => (
                        <div key={edu.id} className="edu-card-drawer">
                          <h4>{edu.degree}</h4>
                          <p>{edu.school} • {edu.duration}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Col (Skills, Notes, Activity, Documents) */}
                <div className="drawer-grid-right">
                  {/* Skills Grid */}
                  <div className="drawer-profile-section">
                    <h3>Skills Inventory</h3>
                    <div className="skills-tags-container">
                      {selectedCandidate.skills.map((s, idx) => (
                        <span key={idx} className="skill-label-tag">{s}</span>
                      ))}
                    </div>
                  </div>

                  {/* Certifications & Languages */}
                  <div className="drawer-profile-section-split">
                    {selectedCandidate.certifications.length > 0 && (
                      <div>
                        <h3>Certifications</h3>
                        <ul className="drawer-list">
                          {selectedCandidate.certifications.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                    )}
                    {selectedCandidate.languages.length > 0 && (
                      <div>
                        <h3>Languages</h3>
                        <ul className="drawer-list">
                          {selectedCandidate.languages.map((l, i) => <li key={i}>{l}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Documents & Resume Viewer */}
                  <div className="drawer-profile-section">
                    <h3>Attached Documents</h3>
                    <div className="documents-list-drawer">
                      {selectedCandidate.documents.map(doc => (
                        <div key={doc.id} className="doc-item-drawer">
                          <FileText size={16} />
                          <div className="doc-info">
                            <span className="doc-name">{doc.name}</span>
                            <span className="doc-size">{doc.size}</span>
                          </div>
                          <button className="doc-dl-btn"><Download size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recruiter Notes */}
                  <div className="drawer-profile-section">
                    <h3>Recruiter Notes</h3>
                    <div className="notes-entry-block">
                      <textarea 
                        placeholder="Add a private note about candidate..." 
                        value={newNoteText} 
                        onChange={(e) => setNewNoteText(e.target.value)}
                        className="font-sans"
                      />
                      <button className="btn-add-note font-sans" onClick={() => handleAddNote(selectedCandidate.id)}>
                        Add Note
                      </button>
                    </div>
                    <div className="notes-feed-list scroll-y max-h-200">
                      {selectedCandidate.recruiterNotes.length > 0 ? (
                        selectedCandidate.recruiterNotes.map(note => (
                          <div key={note.id} className="rec-note-item">
                            <div className="note-meta">
                              <strong>{note.author}</strong>
                              <span>{note.date}</span>
                            </div>
                            <p>{note.text}</p>
                          </div>
                        ))
                      ) : (
                        <p className="no-notes-lbl">No recruiter notes yet. Add one above.</p>
                      )}
                    </div>
                  </div>

                  {/* Candidate Activity Feed */}
                  <div className="drawer-profile-section">
                    <h3>Candidate Activity Timeline</h3>
                    <div className="activities-timeline-drawer scroll-y max-h-200">
                      {selectedCandidate.activityTimeline.map(act => (
                        <div key={act.id} className="act-drawer-item">
                          <div className="bullet"></div>
                          <div className="details">
                            <div className="title-row">
                              <strong>{act.event}</strong>
                              <span className="time">{act.time}</span>
                            </div>
                            {act.details && <p>{act.details}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
