import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  FileText, 
  Bell, 
  Settings, 
  Bookmark, 
  CheckCircle2, 
  UploadCloud, 
  Plus, 
  Edit3, 
  Share2, 
  ShieldCheck,
  Building2,
  Award,
  Download,
  Globe,
  Clock,
  Check
} from 'lucide-react';
import { type Job, JobCard } from './JobCard';

interface UserProfileProps {
  appliedJobs: Job[];
  jobsList: Job[];
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
  onApplySuccess: (jobId: string) => void;
  savedJobIds: string[];
  onToggleSaveJob: (jobId: string) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  appliedJobs,
  jobsList,
  activeSubTab,
  setActiveSubTab,
  onApplySuccess,
  savedJobIds,
  onToggleSaveJob
}) => {
  const currentTab = ['dashboard', 'saved', 'applied', 'documents', 'alerts', 'settings'].includes(activeSubTab) 
    ? activeSubTab 
    : 'dashboard';

  // Comprehensive Job Seeker Basic Details State
  const [profile, setProfile] = useState({
    name: 'Alex Morgan',
    title: 'Senior Full-Stack Engineer',
    email: 'alex.morgan@getworxs.com',
    phone: '+1 (555) 382-9102',
    location: 'San Francisco, CA',
    dob: '1998-05-14',
    gender: 'Male',
    totalExperience: '5 Years',
    highestQualification: 'B.Tech in Computer Science',
    university: 'Stanford University',
    passingYear: '2020',
    currentSalary: '$130,000 / yr',
    expectedSalary: '$150,000 / yr',
    noticePeriod: '15 Days (Serving Notice)',
    preferredWorkMode: 'Hybrid / Remote',
    preferredJobType: 'Full Time',
    githubUrl: 'https://github.com/alexmorgan',
    linkedinUrl: 'https://linkedin.com/in/alexmorgan',
    portfolioUrl: 'https://alexmorgan.dev',
    bio: 'Passionate full-stack developer with 5+ years of experience building scalable enterprise web applications using React, TypeScript, Node.js, and Cloud Architecture.',
    openToWork: true,
    completeness: 94
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...profile });

  const [skills, setSkills] = useState([
    'React', 'TypeScript', 'Node.js', 'GraphQL', 'Python', 'AWS Cloud', 'Docker', 'Tailwind CSS', 'PostgreSQL', 'System Design'
  ]);
  const [newSkill, setNewSkill] = useState('');

  const experiences = [
    {
      id: 1,
      role: 'Senior Software Engineer',
      company: 'Apex Tech Solutions',
      period: '2023 - Present',
      location: 'San Francisco, CA',
      desc: 'Led frontend architecture for enterprise SaaS analytics platforms serving over 100k daily active users.'
    },
    {
      id: 2,
      role: 'Full-Stack Web Developer',
      company: 'CloudScale Inc',
      period: '2021 - 2023',
      location: 'Austin, TX',
      desc: 'Developed RESTful APIs and real-time dashboard visualization tools using TypeScript and PostgreSQL.'
    }
  ];

  const documents = [
    { id: 'doc-1', name: 'Alex_Morgan_Senior_Engineer_Resume.pdf', size: '1.4 MB', updated: '2 days ago', type: 'Primary ATS Resume', score: 94 },
    { id: 'doc-2', name: 'Cover_Letter_Frontend_Lead.pdf', size: '420 KB', updated: '1 week ago', type: 'Cover Letter', score: 88 }
  ];

  const [alerts, setAlerts] = useState({
    emailAlerts: true,
    instantNotify: true,
    minSalary: '$110,000/yr',
    preferredCategory: 'Engineering',
    preferredMode: 'Hybrid'
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({ ...editForm });
    setIsEditing(false);
  };

  const handleAddSkill = () => {
    if (!newSkill.trim() || skills.includes(newSkill.trim())) return;
    setSkills([...skills, newSkill.trim()]);
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };



  const savedJobs = jobsList.filter(job => savedJobIds.includes(job.id));

  return (
    <div className="profile-wrapper">
      
      {/* Hero Header Card */}
      <div className="profile-hero-card">
        <div className="profile-hero-top">
          
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div className="profile-avatar-large">
              AM
            </div>

            <div className="profile-meta-block">
              <div className="profile-name-row">
                <h1 className="profile-user-name">
                  {profile.name}
                </h1>
                {profile.openToWork && (
                  <span className="job-tag-badge" style={{ backgroundColor: 'var(--tag-emerald-bg)', color: 'var(--tag-emerald-text)', borderColor: 'var(--tag-emerald-border)' }}>
                    <ShieldCheck size={13} />
                    Open to Opportunities
                  </span>
                )}
              </div>

              <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-primary)' }}>
                {profile.title}
              </p>

              <div className="profile-contact-pills">
                <span className="contact-pill">
                  <MapPin size={13} style={{ color: 'var(--color-primary)' }} />
                  {profile.location}
                </span>
                <span className="contact-pill">
                  <Mail size={13} style={{ color: 'var(--color-primary)' }} />
                  {profile.email}
                </span>
                <span className="contact-pill">
                  <Phone size={13} style={{ color: 'var(--color-primary)' }} />
                  {profile.phone}
                </span>
                <span className="contact-pill" style={{ backgroundColor: 'var(--tag-amber-bg)', color: 'var(--tag-amber-text)', borderColor: 'var(--tag-amber-border)' }}>
                  <Clock size={13} />
                  Notice: {profile.noticePeriod}
                </span>
              </div>
            </div>
          </div>

          <div className="profile-actions-right">
            <button 
              className="btn-outline" 
              onClick={() => setIsEditing(!isEditing)}
              style={{ padding: '9px 16px', fontSize: '13.5px' }}
            >
              <Edit3 size={15} />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Basic Details'}</span>
            </button>
            <button className="btn-primary" style={{ padding: '9px 18px', fontSize: '13.5px' }}>
              <Share2 size={15} />
              <span>Share Profile</span>
            </button>
          </div>
        </div>

        {/* Completeness Bar */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '240px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}>
              <span>Job Seeker Profile Completeness</span>
              <span style={{ color: 'var(--color-primary)', fontWeight: '700' }}>{profile.completeness}% ATS Ready</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-neutral-light)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${profile.completeness}%`, height: '100%', background: 'linear-gradient(90deg, #6d28d9 0%, #ff1744 100%)', borderRadius: '4px' }} />
            </div>
          </div>
          <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Updated 2 hours ago</span>
        </div>
      </div>

      {/* Segmented Control Nav */}
      <div className="profile-segmented-nav">
        {[
          { id: 'dashboard', label: 'Basic Details & Overview', icon: User, count: null },
          { id: 'applied', label: 'Applied Jobs', icon: Briefcase, count: appliedJobs.length },
          { id: 'saved', label: 'Saved Jobs', icon: Bookmark, count: savedJobs.length },
          { id: 'documents', label: 'Resume & Docs', icon: FileText, count: documents.length },
          { id: 'alerts', label: 'Job Alerts', icon: Bell, count: null },
          { id: 'settings', label: 'Settings', icon: Settings, count: null }
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`profile-pill-tab ${isActive ? 'active' : ''}`}
            >
              <IconComp size={15} />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className="profile-tab-count">{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* EDIT JOB SEEKER BASIC DETAILS FORM MODAL */}
      {isEditing && (
        <form onSubmit={handleSaveProfile} className="widget-box" style={{ border: '2px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '19px', fontWeight: '800' }}>Job Seeker Basic Details Form</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Fill out your personal information, experience, education, and salary preferences.
              </p>
            </div>
            <button type="button" className="btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>

          {/* Section 1: Personal Info */}
          <div className="form-section-header">1. Personal Information</div>
          <div className="form-grid">
            <label className="form-label">
              <span>Full Name *</span>
              <input className="form-input" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
            </label>
            <label className="form-label">
              <span>Professional Headline / Designation *</span>
              <input className="form-input" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} required />
            </label>
            <label className="form-label">
              <span>Email Address *</span>
              <input className="form-input" type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} required />
            </label>
            <label className="form-label">
              <span>Phone Number *</span>
              <input className="form-input" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} required />
            </label>
            <label className="form-label">
              <span>Current City & Location *</span>
              <input className="form-input" value={editForm.location} onChange={e => setEditForm({ ...editForm, location: e.target.value })} required />
            </label>
            <label className="form-label">
              <span>Date of Birth</span>
              <input className="form-input" type="date" value={editForm.dob} onChange={e => setEditForm({ ...editForm, dob: e.target.value })} />
            </label>
            <label className="form-label">
              <span>Gender</span>
              <select className="filter-select" value={editForm.gender} onChange={e => setEditForm({ ...editForm, gender: e.target.value })}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </label>
          </div>

          {/* Section 2: Work & Salary Preferences */}
          <div className="form-section-header">2. Work Experience & Compensation Preferences</div>
          <div className="form-grid">
            <label className="form-label">
              <span>Total Work Experience *</span>
              <select className="filter-select" value={editForm.totalExperience} onChange={e => setEditForm({ ...editForm, totalExperience: e.target.value })}>
                <option value="Fresher (0 Yrs)">Fresher (0 Yrs)</option>
                <option value="1 Year">1 Year</option>
                <option value="2 Years">2 Years</option>
                <option value="3 Years">3 Years</option>
                <option value="5 Years">5 Years</option>
                <option value="8+ Years">8+ Years</option>
              </select>
            </label>
            <label className="form-label">
              <span>Notice Period / Availability *</span>
              <select className="filter-select" value={editForm.noticePeriod} onChange={e => setEditForm({ ...editForm, noticePeriod: e.target.value })}>
                <option value="Immediate">Immediate Joining</option>
                <option value="15 Days (Serving Notice)">15 Days</option>
                <option value="30 Days">30 Days</option>
                <option value="60 Days">60 Days</option>
              </select>
            </label>
            <label className="form-label">
              <span>Current Salary (CTC)</span>
              <input className="form-input" value={editForm.currentSalary} onChange={e => setEditForm({ ...editForm, currentSalary: e.target.value })} />
            </label>
            <label className="form-label">
              <span>Expected Salary (CTC)</span>
              <input className="form-input" value={editForm.expectedSalary} onChange={e => setEditForm({ ...editForm, expectedSalary: e.target.value })} />
            </label>
            <label className="form-label">
              <span>Preferred Work Mode</span>
              <select className="filter-select" value={editForm.preferredWorkMode} onChange={e => setEditForm({ ...editForm, preferredWorkMode: e.target.value })}>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="In-office">In-office</option>
              </select>
            </label>
            <label className="form-label">
              <span>Preferred Job Type</span>
              <select className="filter-select" value={editForm.preferredJobType} onChange={e => setEditForm({ ...editForm, preferredJobType: e.target.value })}>
                <option value="Full Time">Full Time</option>
                <option value="Contract">Contract</option>
                <option value="Part Time">Part Time</option>
                <option value="Internship">Internship</option>
              </select>
            </label>
          </div>

          {/* Section 3: Education Background */}
          <div className="form-section-header">3. Education Background</div>
          <div className="form-grid">
            <label className="form-label">
              <span>Highest Qualification / Degree *</span>
              <input className="form-input" value={editForm.highestQualification} onChange={e => setEditForm({ ...editForm, highestQualification: e.target.value })} required />
            </label>
            <label className="form-label">
              <span>University / College Name</span>
              <input className="form-input" value={editForm.university} onChange={e => setEditForm({ ...editForm, university: e.target.value })} />
            </label>
            <label className="form-label">
              <span>Passing Year</span>
              <input className="form-input" value={editForm.passingYear} onChange={e => setEditForm({ ...editForm, passingYear: e.target.value })} />
            </label>
          </div>

          {/* Section 4: Web & Portfolio Links */}
          <div className="form-section-header">4. Online Profiles & Portfolio Links</div>
          <div className="form-grid">
            <label className="form-label">
              <span>LinkedIn Profile URL</span>
              <input className="form-input" value={editForm.linkedinUrl} onChange={e => setEditForm({ ...editForm, linkedinUrl: e.target.value })} />
            </label>
            <label className="form-label">
              <span>GitHub / Portfolio Website</span>
              <input className="form-input" value={editForm.githubUrl} onChange={e => setEditForm({ ...editForm, githubUrl: e.target.value })} />
            </label>
          </div>

          <label className="form-label" style={{ marginTop: '12px' }}>
            <span>About / Professional Summary</span>
            <textarea className="widget-textarea" value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} rows={3} />
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button type="button" className="btn-outline" onClick={() => setIsEditing(false)}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Check size={16} /> Save Basic Details
            </button>
          </div>
        </form>
      )}

      {/* TAB 1: OVERVIEW & JOB SEEKER BASIC DETAILS DISPLAY */}
      {currentTab === 'dashboard' && (
        <div className="grid-profile-layout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Job Seeker Basic Details Summary Grid Card */}
            <div className="widget-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Job Seeker Basic Details</h3>
                <button 
                  className="btn-outline" 
                  onClick={() => setIsEditing(true)}
                  style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Edit3 size={13} /> Update Details
                </button>
              </div>

              <div className="job-seeker-info-grid" style={{ marginTop: '14px' }}>
                <div className="info-field-card">
                  <span className="info-field-label">Total Experience</span>
                  <span className="info-field-val">{profile.totalExperience}</span>
                </div>
                <div className="info-field-card">
                  <span className="info-field-label">Notice Period</span>
                  <span className="info-field-val" style={{ color: 'var(--color-primary)' }}>{profile.noticePeriod}</span>
                </div>
                <div className="info-field-card">
                  <span className="info-field-label">Expected CTC</span>
                  <span className="info-field-val" style={{ color: 'var(--color-success)' }}>{profile.expectedSalary}</span>
                </div>
                <div className="info-field-card">
                  <span className="info-field-label">Current CTC</span>
                  <span className="info-field-val">{profile.currentSalary}</span>
                </div>
                <div className="info-field-card">
                  <span className="info-field-label">Highest Qualification</span>
                  <span className="info-field-val">{profile.highestQualification}</span>
                </div>
                <div className="info-field-card">
                  <span className="info-field-label">University / College</span>
                  <span className="info-field-val">{profile.university} ({profile.passingYear})</span>
                </div>
                <div className="info-field-card">
                  <span className="info-field-label">Preferred Mode</span>
                  <span className="info-field-val">{profile.preferredWorkMode} ({profile.preferredJobType})</span>
                </div>
                <div className="info-field-card">
                  <span className="info-field-label">Gender & D.O.B</span>
                  <span className="info-field-val">{profile.gender} • {profile.dob}</span>
                </div>
              </div>

              {/* Online Portfolio Links */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
                {profile.linkedinUrl && (
                  <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="contact-pill" style={{ textDecoration: 'none', color: 'var(--color-primary)', fontWeight: '600' }}>
                    <Globe size={13} /> LinkedIn Profile
                  </a>
                )}
                {profile.githubUrl && (
                  <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="contact-pill" style={{ textDecoration: 'none', color: 'var(--text-primary)', fontWeight: '600' }}>
                    <Globe size={13} /> GitHub / Portfolio
                  </a>
                )}
              </div>
            </div>

            <div className="widget-box">
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>About Summary</h3>
              <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: '1.65' }}>
                {profile.bio}
              </p>
            </div>

            <div className="widget-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Work Experience</h3>
                <button className="btn-outline" style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Plus size={14} /> Add Position
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '14px' }}>
                {experiences.map((exp) => (
                  <div key={exp.id} style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                    <div className="company-icon-box">
                      <Building2 size={20} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '700' }}>{exp.role}</h4>
                      <span style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: '600' }}>{exp.company} • {exp.location}</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{exp.period}</span>
                      <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: '1.5' }}>{exp.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="widget-box">
              <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Skills & Stack</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                {skills.map((skill) => (
                  <span key={skill} className="job-tag-badge" style={{ backgroundColor: 'var(--tag-purple-bg)', color: 'var(--tag-purple-text)', borderColor: 'var(--tag-purple-border)', gap: '6px' }}>
                    {skill}
                    <button onClick={() => handleRemoveSkill(skill)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, fontSize: '14px' }}>
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <input 
                  className="form-input"
                  placeholder="Add skill (e.g. Next.js)..."
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                  style={{ flex: 1 }}
                />
                <button className="btn-primary" type="button" onClick={handleAddSkill} style={{ padding: '8px 16px', fontSize: '13px' }}>
                  <Plus size={15} /> Add
                </button>
              </div>
            </div>
          </div>

          {/* Right Column Metrics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="widget-box">
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Candidate Metrics</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                <div className="metric-row">
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>Applications</span>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-primary)' }}>{appliedJobs.length}</span>
                </div>
                <div className="metric-row">
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>Saved Jobs</span>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-accent)' }}>{savedJobIds.length}</span>
                </div>
                <div className="metric-row">
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>Profile Views</span>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-success)' }}>142</span>
                </div>
              </div>
            </div>

            <div className="widget-box">
              <h3 style={{ fontSize: '16px', fontWeight: '700' }}>ATS Verification</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', backgroundColor: 'var(--tag-purple-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--tag-purple-border)' }}>
                <Award size={26} style={{ color: 'var(--color-primary)' }} />
                <div>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-primary)', display: 'block' }}>Verified ATS Resume</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Overall Score: 94 / 100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APPLIED JOBS */}
      {currentTab === 'applied' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '800' }}>Applications Pipeline ({appliedJobs.length})</h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Track progress stage for your active job proposals.
            </p>
          </div>

          {appliedJobs.length > 0 ? (
            <div className="jobs-list">
              {appliedJobs.map((job) => (
                <div key={job.id} className="job-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: '700' }}>{job.title}</h4>
                      <span style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                        {job.clientName} • {job.clientLocation} • {job.budget}
                      </span>
                    </div>
                    <span className="job-tag-badge" style={{ backgroundColor: 'var(--tag-emerald-bg)', color: 'var(--tag-emerald-text)', borderColor: 'var(--tag-emerald-border)', padding: '6px 14px', fontSize: '13px' }}>
                      <CheckCircle2 size={14} style={{ marginRight: '4px' }} /> Proposal Submitted
                    </span>
                  </div>

                  <div className="pipeline-track">
                    <div className="pipeline-step active">
                      <div className="pipeline-line" />
                      <span className="pipeline-label">1. Submitted</span>
                    </div>
                    <div className="pipeline-step">
                      <div className="pipeline-line" />
                      <span className="pipeline-label">2. Under Review</span>
                    </div>
                    <div className="pipeline-step">
                      <div className="pipeline-line" />
                      <span className="pipeline-label">3. Interview</span>
                    </div>
                    <div className="pipeline-step">
                      <div className="pipeline-line" />
                      <span className="pipeline-label">4. Decision</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Briefcase size={36} style={{ color: 'var(--text-muted)' }} />
              <div className="empty-state-title">No applications submitted yet</div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Explore open positions in the job portal to submit applications.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SAVED JOBS */}
      {currentTab === 'saved' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '800' }}>Bookmarked Jobs ({savedJobs.length})</h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Jobs saved for review or direct application.
            </p>
          </div>

          {savedJobs.length > 0 ? (
            <div className="jobs-list">
              {savedJobs.map((job) => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onApplySuccess={onApplySuccess} 
                  isBookmarked={true}
                  onBookmarkToggle={() => onToggleSaveJob(job.id)}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Bookmark size={36} style={{ color: 'var(--text-muted)' }} />
              <div className="empty-state-title">No saved jobs</div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Bookmark jobs while browsing to review them here anytime.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DOCUMENTS */}
      {currentTab === 'documents' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '800' }}>Resumes & Document Manager</h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Upload and manage your ATS resumes and cover letters.
            </p>
          </div>

          <div className="upload-area">
            <UploadCloud size={36} style={{ color: 'var(--color-primary)' }} />
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>
                Upload ATS Resume or Portfolio Document
              </span>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Supports PDF, DOCX (Max: 10MB)
              </span>
            </div>
            <button className="btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
              Select File
            </button>
          </div>

          <div className="widget-box">
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '14px' }}>Your Uploaded Files</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {documents.map((doc) => (
                <div key={doc.id} className="profile-doc-row">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <FileText size={22} style={{ color: 'var(--color-primary)' }} />
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>
                        {doc.name}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {doc.type} • {doc.size} • Uploaded {doc.updated}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="job-tag-badge" style={{ backgroundColor: 'var(--tag-emerald-bg)', color: 'var(--tag-emerald-text)', borderColor: 'var(--tag-emerald-border)' }}>
                      ATS Score: {doc.score}%
                    </span>
                    <button className="btn-outline" style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Download size={13} /> Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ALERTS */}
      {currentTab === 'alerts' && (
        <div className="widget-box">
          <h3 style={{ fontSize: '20px', fontWeight: '800' }}>Job Preference & Alerts Configuration</h3>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Configure real-time notifications when matching positions are published.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
            <div className="form-grid">
              <label className="form-label">
                <span>Preferred Industry Category</span>
                <select className="filter-select">
                  <option>Engineering & Software Development</option>
                  <option>UI/UX & Product Design</option>
                  <option>Finance & Accounting</option>
                  <option>HR & Recruitment</option>
                </select>
              </label>
              <label className="form-label">
                <span>Target Minimum Salary</span>
                <input className="form-input" defaultValue={alerts.minSalary} />
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <label className="filter-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={alerts.emailAlerts} 
                  onChange={e => setAlerts({ ...alerts, emailAlerts: e.target.checked })} 
                />
                <span>Daily email digest of matching IT & Non-IT openings</span>
              </label>
              <label className="filter-checkbox-label">
                <input 
                  type="checkbox" 
                  checked={alerts.instantNotify} 
                  onChange={e => setAlerts({ ...alerts, instantNotify: e.target.checked })} 
                />
                <span>Instant notifications for high-paying Remote jobs</span>
              </label>
            </div>

            <button className="btn-primary" style={{ width: 'fit-content', marginTop: '12px' }}>
              Save Alert Preferences
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: SETTINGS */}
      {currentTab === 'settings' && (
        <div className="widget-box">
          <h3 style={{ fontSize: '20px', fontWeight: '800' }}>Account & Security Settings</h3>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Manage security credentials, password, and authentication settings.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
            <div className="form-grid">
              <label className="form-label">
                <span>Current Password</span>
                <input className="form-input" type="password" placeholder="••••••••" />
              </label>
              <label className="form-label">
                <span>New Password</span>
                <input className="form-input" type="password" placeholder="••••••••" />
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>
                  Two-Factor Authentication (2FA)
                </span>
                <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  Protect your account with SMS or Authenticator App.
                </span>
              </div>
              <button className="btn-outline" style={{ fontSize: '12px' }}>Enable 2FA</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
