import React, { useState } from 'react';
import { 
  Check, 
  ChevronRight, 
  X, 
  Sparkles, 
  Briefcase, 
  FileText, 
  Sliders, 
  Users, 
  HelpCircle
} from 'lucide-react';
import type { RecruiterJob } from './types';

interface CreateJobTabProps {
  onAddJob: (newJob: RecruiterJob) => void;
  onNavigate: (tab: string) => void;
}

export const CreateJobTab: React.FC<CreateJobTabProps> = ({ onAddJob, onNavigate }) => {
  const [step, setStep] = useState(1);

  // Form State
  const [form, setForm] = useState({
    title: '',
    department: 'Engineering',
    role: 'Full Stack Developer',
    employmentType: 'Full-time',
    experienceMin: 'Fresher',
    experienceMax: '2 years',
    freshersCanApply: false,
    technologies: [] as string[],
    diversityWomen: false,
    diversityWomenReturning: false,
    diversityDefence: false,
    diversityDisabled: false,
    videoProfileNeeded: false,
    description: '',
    companyName: 'Congi Hub Private Limited',
    companyDesc: 'Leading Technology & Talent Solutions Enterprise Provider.',
    screeningQuestions: [] as string[],
    isWalkin: false,
    teamMembers: [] as string[],
    emailResponses: 'Only you will receive responses',
    emailFrequency: 'As a daily summary',
    referenceCode: '',
    autoRefresh: false
  });

  const [customQuestion, setCustomQuestion] = useState('');
  const [newTeamMember, setNewTeamMember] = useState('');

  const handleToggleTechnology = (tech: string) => {
    if (form.technologies.includes(tech)) {
      setForm({ ...form, technologies: form.technologies.filter(t => t !== tech) });
    } else {
      setForm({ ...form, technologies: [...form.technologies, tech] });
    }
  };

  const handleAddCustomQuestion = () => {
    if (!customQuestion.trim()) return;
    setForm({ ...form, screeningQuestions: [...form.screeningQuestions, customQuestion.trim()] });
    setCustomQuestion('');
  };

  const handleRemoveQuestion = (q: string) => {
    setForm({ ...form, screeningQuestions: form.screeningQuestions.filter(item => item !== q) });
  };

  const handleAddTeamMember = () => {
    if (!newTeamMember.trim()) return;
    setForm({ ...form, teamMembers: [...form.teamMembers, newTeamMember.trim()] });
    setNewTeamMember('');
  };

  const handleGenerateAIJD = () => {
    if (!form.title) {
      alert('Please enter a Job Title first.');
      return;
    }
    const generated = `Position: ${form.title}\nDepartment: ${form.department}\nRole Focus: ${form.role}\n\nWe are seeking a dedicated ${form.title} to join our growing team. The ideal candidate has experience in:\n- Modern web application architectures\n- Skills in: ${form.technologies.join(', ') || 'React, TypeScript, Node.js'}\n- Collaborating with cross-functional product teams.\n\nKey Responsibilities:\n- Build scalable, responsive frontend and backend systems.\n- Participate in design sessions and write clear, maintainable code.\n- Optimize systems for performance, reliability, and security.`;
    setForm({ ...form, description: generated });
  };

  const handlePublish = () => {
    if (!form.title) {
      alert('Please fill out the Job Title.');
      setStep(1);
      return;
    }

    const experienceRange = form.experienceMin === 'Fresher' 
      ? `Fresher - ${form.experienceMax}` 
      : `${form.experienceMin} - ${form.experienceMax}`;

    const newJob: RecruiterJob = {
      id: `job-${Date.now()}`,
      title: form.title,
      department: form.department,
      location: 'Bengaluru, India (Hybrid)',
      employmentType: form.employmentType,
      experience: experienceRange,
      salaryRange: '$90k - $130k',
      applications: 0,
      shortlisted: 0,
      interviewProgress: 0,
      status: 'active',
      postedDate: new Date().toISOString().split('T')[0],
      requirements: form.technologies
    };

    onAddJob(newJob);
    alert(`Successfully launched "${form.title}"!`);
    onNavigate('jobs');
  };

  return (
    <div className="naukri-post-container animate-slide-up font-sans">
      
      {/* Stepper Sidebar on Left */}
      <aside className="naukri-sidebar">
        <div>
          <div className="naukri-sidebar-header">
            <h2 className="naukri-sidebar-title">Post a job</h2>
            <span className="naukri-hot-badge">Hot Vacancy</span>
          </div>
        </div>

        <div className="naukri-step-list">
          {[
            { stepNum: 1, label: 'Job details', icon: <Briefcase size={12} /> },
            { stepNum: 2, label: 'Candidate details', icon: <Users size={12} /> },
            { stepNum: 3, label: 'Job description', icon: <FileText size={12} /> },
            { stepNum: 4, label: 'Screening questions', icon: <HelpCircle size={12} /> },
            { stepNum: 5, label: 'Advanced options', icon: <Sliders size={12} /> }
          ].map(item => (
            <div 
              key={item.stepNum}
              className={`naukri-step-item ${step === item.stepNum ? 'active' : ''} ${step > item.stepNum ? 'completed' : ''}`}
              onClick={() => { if (step >= item.stepNum || form.title) setStep(item.stepNum); }}
            >
              <div className="naukri-step-dot">
                {step > item.stepNum ? <Check size={12} /> : item.stepNum}
              </div>
              <span className="naukri-step-label">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="naukri-webinar-card">
          <span className="naukri-webinar-title">Join our free webinar</span>
          <p className="naukri-webinar-desc">Learn how to attract top talent with modern JDs.</p>
          <button className="naukri-webinar-link" onClick={() => alert('Webinar invitation registered!')}>
            <span>Reserve your slot</span>
            <ChevronRight size={12} />
          </button>
        </div>
      </aside>

      {/* Form Panels on Right */}
      <div className="naukri-form-wrapper">
        <div className="naukri-prefill-banner">
          Begin from scratch or <button className="naukri-prefill-link" onClick={() => {
            setForm({
              ...form,
              title: 'Senior Frontend Developer',
              department: 'Engineering',
              role: 'Front End Developer',
              technologies: ['React', 'TypeScript', 'Redux Toolkit', 'TailwindCSS'],
              description: 'We are seeking a senior engineer to drive our client-side experience.'
            });
            alert('Prefilled with Senior Frontend Developer template!');
          }}>Prefill from previous templates</button>
        </div>

        <div className="naukri-form-card">
          
          {/* Step 1: Job Details */}
          {step === 1 && (
            <div className="form-fade-in">
              <h3 className="naukri-form-section-title">Job details</h3>
              
              <div className="form-group">
                <label>Job title *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Senior Software Engineer" 
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="font-sans"
                  required
                />
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Department *</label>
                  <select 
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="font-sans"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product Management">Product Management</option>
                    <option value="Design">Product Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="People Operations">People Operations</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Role *</label>
                  <select 
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="font-sans"
                  >
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="Front End Developer">Front End Developer</option>
                    <option value="Back End Developer">Back End Developer</option>
                    <option value="DevOps Architect">DevOps Architect</option>
                    <option value="UI/UX Designer">UI/UX Designer</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label>Employment type *</label>
                  <select 
                    value={form.employmentType}
                    onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                    className="font-sans"
                  >
                    <option value="Full-time">Full-time, Permanent</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Part-time">Part-time</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Work experience *</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <select 
                      value={form.experienceMin}
                      onChange={(e) => setForm({ ...form, experienceMin: e.target.value })}
                      className="font-sans"
                      style={{ flexGrow: 1 }}
                    >
                      <option value="Fresher">Fresher</option>
                      <option value="1 year">1 year</option>
                      <option value="2 years">2 years</option>
                      <option value="3 years">3 years</option>
                    </select>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>to</span>
                    <select 
                      value={form.experienceMax}
                      onChange={(e) => setForm({ ...form, experienceMax: e.target.value })}
                      className="font-sans"
                      style={{ flexGrow: 1 }}
                    >
                      <option value="2 years">2 years</option>
                      <option value="3 years">3 years</option>
                      <option value="5 years">5 years</option>
                      <option value="8 years">8 years</option>
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                <input 
                  type="checkbox" 
                  id="freshersCanApply"
                  checked={form.freshersCanApply}
                  onChange={(e) => setForm({ ...form, freshersCanApply: e.target.checked })}
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
                <label htmlFor="freshersCanApply" style={{ fontSize: '13.5px', color: 'var(--ed-text-secondary)', fontWeight: '600', cursor: 'pointer' }}>
                  Freshers can also apply
                </label>
              </div>
            </div>
          )}

          {/* Step 2: Preferred Candidate Details */}
          {step === 2 && (
            <div className="form-fade-in">
              <h3 className="naukri-form-section-title">Preferred candidate details</h3>
              
              <div className="form-group">
                <label>Key Skills / Technologies</label>
                <div className="naukri-tags-input-wrapper">
                  <div className="naukri-selected-tags">
                    {form.technologies.map(tag => (
                      <span key={tag} className="naukri-tag-pill">
                        <span>{tag}</span>
                        <button type="button" onClick={() => handleToggleTechnology(tag)}>
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                  
                  <div style={{ fontSize: '12px', color: 'var(--ed-text-muted)', marginBottom: '8px' }}>Suggested keywords (click to add):</div>
                  <div className="naukri-tag-suggestions">
                    {['React', 'TypeScript', 'Node.js', 'Redux', 'System Design', 'Python', 'AWS', 'Docker'].filter(t => !form.technologies.includes(t)).map(t => (
                      <button 
                        key={t} 
                        type="button" 
                        className="naukri-tag-suggest-btn"
                        onClick={() => handleToggleTechnology(t)}
                      >
                        + {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '24px' }}>
                <label>Diversity hiring <span style={{ fontSize: '11px', color: 'var(--ed-warning)', background: 'var(--ed-warning-light)', padding: '2px 6px', borderRadius: '4px', marginLeft: '6px' }}>Optional • Active Promotion</span></label>
                
                <div className="naukri-checkbox-card-grid">
                  {[
                    { key: 'diversityWomen', label: 'Women' },
                    { key: 'diversityWomenReturning', label: 'Women returning to work' },
                    { key: 'diversityDefence', label: 'Ex-defence personnel' },
                    { key: 'diversityDisabled', label: 'Differently-abled' }
                  ].map(item => (
                    <div 
                      key={item.key}
                      className={`naukri-checkbox-card ${(form as any)[item.key] ? 'selected' : ''}`}
                      onClick={() => setForm({ ...form, [item.key]: !(form as any)[item.key] })}
                    >
                      <input type="checkbox" checked={(form as any)[item.key]} readOnly style={{ width: '16px', height: '16px' }} />
                      <span className="naukri-checkbox-card-label">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '24px' }}>
                <label style={{ marginBottom: '8px', display: 'block' }}>Video profile needed from candidates</label>
                <div className="naukri-pill-group">
                  <button 
                    type="button"
                    className={`naukri-pill-option ${form.videoProfileNeeded ? 'active' : ''}`}
                    onClick={() => setForm({ ...form, videoProfileNeeded: true })}
                  >
                    Yes
                  </button>
                  <button 
                    type="button"
                    className={`naukri-pill-option ${!form.videoProfileNeeded ? 'active' : ''}`}
                    onClick={() => setForm({ ...form, videoProfileNeeded: false })}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Job Description */}
          {step === 3 && (
            <div className="form-fade-in">
              <h3 className="naukri-form-section-title">Job description</h3>
              
              <div className="form-group">
                <div className="naukri-editor-box">
                  <div className="naukri-editor-toolbar">
                    <button type="button" className="naukri-editor-btn" style={{ fontWeight: '700' }} onClick={() => alert('Bold text')}>B</button>
                    <button type="button" className="naukri-editor-btn" style={{ fontStyle: 'italic' }} onClick={() => alert('Italic text')}>I</button>
                    <button type="button" className="naukri-editor-btn" style={{ textDecoration: 'underline' }} onClick={() => alert('Underline text')}>U</button>
                    <div className="naukri-editor-divider" />
                    <button type="button" className="naukri-editor-btn" onClick={() => alert('List item')}>• List</button>
                    <div className="naukri-editor-divider" />
                    <button 
                      type="button" 
                      className="btn-secondary font-sans"
                      style={{ fontSize: '11px', padding: '4px 10px', height: 'auto' }}
                      onClick={handleGenerateAIJD}
                    >
                      <Sparkles size={12} />
                      <span>JD suggestions</span>
                    </button>
                  </div>
                  
                  <textarea 
                    className="naukri-editor-textarea font-sans"
                    rows={8}
                    placeholder="Provide a detailed job description..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '24px' }}>
                <label style={{ marginBottom: '10px', display: 'block' }}>About your company</label>
                <div className="naukri-company-card">
                  <div className="naukri-company-info">
                    <div className="naukri-company-logo">C</div>
                    <div>
                      <div className="naukri-company-name">{form.companyName}</div>
                      <div className="naukri-company-desc">{form.companyDesc}</div>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="btn-secondary font-sans"
                    style={{ fontSize: '11px', padding: '6px 12px', height: 'auto' }}
                    onClick={() => {
                      const name = prompt('Edit Company Name:', form.companyName);
                      if (name) setForm({ ...form, companyName: name });
                    }}
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Screening Questions */}
          {step === 4 && (
            <div className="form-fade-in">
              <h3 className="naukri-form-section-title">Screening questions</h3>
              
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input 
                  type="text" 
                  placeholder="Enter a custom screening question..."
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  className="font-sans"
                  style={{ flexGrow: 1 }}
                />
                <button type="button" className="btn-primary" onClick={handleAddCustomQuestion}>
                  Add Question
                </button>
              </div>

              {form.screeningQuestions.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ marginBottom: '10px', display: 'block' }}>Active Screening Questions:</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {form.screeningQuestions.map(q => (
                      <div key={q} className="naukri-question-active-pill">
                        <span>{q}</span>
                        <button type="button" onClick={() => handleRemoveQuestion(q)}>
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label style={{ marginBottom: '12px', display: 'block' }}>Suggested questions (click to add):</label>
                <div className="naukri-suggested-questions">
                  {[
                    'What is your notice period?',
                    'What is your expected salary?',
                    'Are you willing to relocate to Bengaluru?',
                    'How many years of experience do you have with React?',
                    'How many years of experience do you have with Node.js?'
                  ].filter(q => !form.screeningQuestions.includes(q)).map(q => (
                    <button 
                      key={q} 
                      type="button" 
                      className="naukri-question-pill"
                      onClick={() => setForm({ ...form, screeningQuestions: [...form.screeningQuestions, q] })}
                    >
                      <span>+ {q}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Advanced Options */}
          {step === 5 && (
            <div className="form-fade-in">
              <h3 className="naukri-form-section-title">Advanced options</h3>
              
              <div className="form-group">
                <label>Is this a walk-in job?</label>
                <div className="naukri-pill-group">
                  <button 
                    type="button"
                    className={`naukri-pill-option ${form.isWalkin ? 'active' : ''}`}
                    onClick={() => setForm({ ...form, isWalkin: true })}
                  >
                    Yes
                  </button>
                  <button 
                    type="button"
                    className={`naukri-pill-option ${!form.isWalkin ? 'active' : ''}`}
                    onClick={() => setForm({ ...form, isWalkin: false })}
                  >
                    No
                  </button>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '24px' }}>
                <label>Collaborate with team members</label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                  <input 
                    type="email" 
                    placeholder="Enter teammate email address..."
                    value={newTeamMember}
                    onChange={(e) => setNewTeamMember(e.target.value)}
                    className="font-sans"
                    style={{ flexGrow: 1 }}
                  />
                  <button type="button" className="btn-primary" onClick={handleAddTeamMember}>
                    Add Member
                  </button>
                </div>

                {form.teamMembers.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {form.teamMembers.map(email => (
                      <span key={email} className="naukri-tag-pill" style={{ background: '#f8fafc', color: 'var(--ed-text-secondary)' }}>
                        <span>{email}</span>
                        <button type="button" onClick={() => setForm({ ...form, teamMembers: form.teamMembers.filter(e => e !== email) })}>
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginTop: '24px' }}>
                <label>Email notifications frequency</label>
                <select 
                  value={form.emailFrequency}
                  onChange={(e) => setForm({ ...form, emailFrequency: e.target.value })}
                  className="font-sans"
                >
                  <option value="As a daily summary">As a daily summary</option>
                  <option value="Instantly per application">Instantly per application</option>
                </select>
              </div>

              <div className="form-grid-2" style={{ marginTop: '24px' }}>
                <div className="form-group">
                  <label>Reference code</label>
                  <input 
                    type="text" 
                    placeholder="e.g. GET-2026-DEV"
                    value={form.referenceCode}
                    onChange={(e) => setForm({ ...form, referenceCode: e.target.value })}
                    className="font-sans"
                  />
                </div>

                <div className="form-group" style={{ justifyContent: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '100%', marginTop: '20px' }}>
                    <input 
                      type="checkbox" 
                      id="autoRefresh"
                      checked={form.autoRefresh}
                      onChange={(e) => setForm({ ...form, autoRefresh: e.target.checked })}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    <label htmlFor="autoRefresh" style={{ fontSize: '13.5px', color: 'var(--ed-text-secondary)', fontWeight: '600', cursor: 'pointer' }}>
                      Schedule auto-refresh weekly
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Footer */}
          <div className="naukri-footer-bar">
            {step > 1 && (
              <button 
                type="button" 
                className="btn-secondary font-sans"
                onClick={() => setStep(step - 1)}
              >
                Back
              </button>
            )}
            
            {step < 5 ? (
              <button 
                type="button" 
                className="btn-primary font-sans"
                onClick={() => {
                  if (step === 1 && !form.title) {
                    alert('Job title is required.');
                    return;
                  }
                  setStep(step + 1);
                }}
                style={{ marginLeft: 'auto' }}
              >
                Next
              </button>
            ) : (
              <button 
                type="button" 
                className="btn-primary font-sans"
                onClick={handlePublish}
                style={{ marginLeft: 'auto', background: 'var(--ed-success)' }}
              >
                Publish Job Listing
              </button>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};
