import React, { useEffect, useState } from 'react';
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
  UploadCloud, 
  Plus, 
  Edit3, 
  Building2,
  Award,
  Globe,
  Clock,
  Check,
  Sparkles,
  Calendar,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  X,
  Camera,
  GraduationCap,
  FolderGit2,
  TrendingUp,
  Eye,
  Search,
  Download
} from 'lucide-react';
import { type Job, JobCard } from './JobCard';
import { useNotifications } from '../utils/useNotifications';
import { InterviewAPI } from '../utils/api';

interface UserProfileProps {
  appliedJobs: Job[];
  jobsList: Job[];
  activeSubTab: string;
  setActiveSubTab: (tab: string) => void;
  onApplySuccess: (jobId: string) => void;
  savedJobIds: string[];
  onToggleSaveJob: (jobId: string) => void;
}

interface ProfileState {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  dob: string;
  gender: string;
  maritalStatus: string;
  languages: string[];
  totalExperience: string;
  highestQualification: string;
  university: string;
  passingYear: string;
  cgpa: string;
  currentSalary: string;
  expectedSalary: string;
  noticePeriod: string;
  preferredWorkMode: string;
  preferredJobType: string;
  resumeHeadline: string;
  githubUrl: string;
  linkedinUrl: string;
  portfolioUrl: string;
  bio: string;
  openToWork: boolean;
  completeness: number;
  profileLastUpdated: string;
}

const initialProfileState: ProfileState = {
  name: 'Candidate User',
  title: 'Senior Full Stack Software Engineer',
  email: 'candidate@getworxs.com',
  phone: '+91 98765 43210',
  location: 'Bangalore, Karnataka, India',
  dob: '15 Aug 1998',
  gender: 'Male',
  maritalStatus: 'Single',
  languages: ['English', 'Hindi', 'Tamil'],
  totalExperience: '3 Years 6 Months',
  highestQualification: "B.Tech / B.E. in Computer Science",
  university: 'Indian Institute of Technology (IIT) Madras',
  passingYear: '2021',
  cgpa: '8.7 / 10',
  currentSalary: '₹ 12 Lakhs / yr',
  expectedSalary: '₹ 18 Lakhs / yr',
  noticePeriod: '15 Days or less (Serving Notice)',
  preferredWorkMode: 'Hybrid / Remote',
  preferredJobType: 'Full Time',
  resumeHeadline: 'Full Stack Software Engineer with 3.5 years of experience building scalable React, Node.js, Python microservices & cloud architectures.',
  githubUrl: 'https://github.com',
  linkedinUrl: 'https://linkedin.com',
  portfolioUrl: 'https://portfolio.com',
  bio: 'Energetic software engineer with proven expertise in building high-throughput web applications, RESTful microservices, and AI integrations.',
  openToWork: true,
  completeness: 85,
  profileLastUpdated: 'Updated 2 days ago',
};

export const UserProfile: React.FC<UserProfileProps> = ({
  appliedJobs,
  jobsList: initialJobsList,
  activeSubTab,
  setActiveSubTab,
  onApplySuccess,
  savedJobIds,
  onToggleSaveJob
}) => {
  const [jobsList, setJobsList] = React.useState<Job[]>(initialJobsList || []);
  const [activeQuickSection, setActiveQuickSection] = useState('resume');
  const [localSubTab, setLocalSubTab] = useState(activeSubTab || 'dashboard');

  useEffect(() => {
    if (activeSubTab) {
      setLocalSubTab(activeSubTab);
    }
  }, [activeSubTab]);

  const handleSubTabChange = (tabId: string) => {
    setLocalSubTab(tabId);
    if (setActiveSubTab) {
      setActiveSubTab(tabId);
    }
  };

  React.useEffect(() => {
    const fetchLiveJobs = async () => {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      try {
        const res = await fetch(`${API_URL}/api/v1/jobs/search?limit=500`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data && Array.isArray(data.data.items)) {
            const mapped = data.data.items.map((j: any) => ({
              id: String(j.id),
              title: j.title,
              clientName: j.company?.name || j.about_company || 'Premium Company',
              clientRating: 4.8,
              clientLocation: j.city ? `${j.city}, ${j.state}, ${j.country}` : j.country,
              countryCode: j.country ? j.country.toLowerCase().substring(0, 2) : 'in',
              region: 'all',
              city: j.city,
              state: j.state,
              salaryCurrency: j.salary_currency || 'INR',
              minSalary: j.salary_min || 0,
              maxSalary: j.salary_max || null,
              budget: j.salary_min ? `${j.salary_currency === 'INR' || !j.salary_currency ? '₹' : '$'}${j.salary_min.toLocaleString()} - ${j.salary_currency === 'INR' || !j.salary_currency ? '₹' : '$'}${j.salary_max ? j.salary_max.toLocaleString() : ''}/yr` : 'Competitive',
              description: j.summary || 'Premium global role offering competitive benefits.',
              tags: j.skills_json ? JSON.parse(j.skills_json) : ['Tech', 'Hiring'],
              postedTime: j.created_at ? new Date(j.created_at).toLocaleDateString() : 'Today',
              workMode: j.work_mode || 'Remote',
              category: j.department || 'Technology',
              experience: j.experience_min || 2,
              jobType: j.employment_type || 'Full Time',
              visaSponsorship: true,
              relocation: true,
              eorSupported: true,
              verifiedCompany: true,
              topEmployer: true
            }));
            setJobsList(mapped);
          }
        }
      } catch (err) {
        console.warn('Candidate profile failed to fetch jobs:', err);
      }
    };
    fetchLiveJobs();
  }, [initialJobsList]);

  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();

  const currentTab = ['dashboard', 'interviews', 'saved', 'applied', 'documents', 'notifications', 'alerts', 'settings'].includes(localSubTab) 
    ? localSubTab 
    : 'dashboard';

  // Candidate Details State
  const [profile, setProfile] = useState<ProfileState>(initialProfileState);
  const [isEditing, setIsEditing] = useState(false);
  const [editHeadlineModal, setEditHeadlineModal] = useState(false);
  const [editHeadlineInput, setEditHeadlineInput] = useState(profile.resumeHeadline);

  // Dedicated Section Modals State
  const [addEmploymentModal, setAddEmploymentModal] = useState(false);
  const [addEducationModal, setAddEducationModal] = useState(false);
  const [addProjectModal, setAddProjectModal] = useState(false);

  // Employment Form
  const [empForm, setEmpForm] = useState({
    title: 'Senior Full Stack Software Engineer',
    company: 'GetWorxs Tech & Software Solutions',
    type: 'Full Time',
    duration: 'July 2021 – Present (3 Yrs 6 Months)',
    description: 'Architected high-throughput microservices using React, Node.js, Python FastAPI and PostgreSQL.'
  });

  // Education Form
  const [eduForm, setEduForm] = useState({
    degree: profile.highestQualification,
    university: profile.university,
    year: profile.passingYear,
    cgpa: profile.cgpa
  });

  // Project Form
  const [projForm, setProjForm] = useState({
    title: 'GetWorxs Global Job Match & Video AI Platform',
    client: 'GetWorxs Tech Inc',
    role: 'Lead Full Stack Engineer',
    duration: 'Jan 2024 - Present',
    details: 'Architected high-throughput candidate matching platform using React, FastAPI & PostgreSQL handling 100k+ daily queries.'
  });

  const [editForm, setEditForm] = useState({ ...initialProfileState });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [requestError, setRequestError] = useState<string | null>(null);

  const [skills, setSkills] = useState<string[]>(['React.js', 'Node.js', 'TypeScript', 'Python', 'REST APIs', 'PostgreSQL', 'Docker', 'AWS', 'TailwindCSS', 'Redux']);
  const [newSkill, setNewSkill] = useState('');
  const [editSkillsModal, setEditSkillsModal] = useState(false);

  // Projects Data
  const [projectsList, setProjectsList] = useState([
    {
      title: 'GetWorxs Global Job Match & Video AI Platform',
      client: 'GetWorxs Tech Inc',
      duration: 'Jan 2024 - Present',
      role: 'Lead Full Stack Engineer',
      details: 'Architected high-throughput candidate matching platform using React, FastAPI & PostgreSQL handling 100k+ daily queries.'
    },
    {
      title: 'Enterprise HR & Payroll Automation Portal',
      client: 'FinTech Enterprise',
      duration: 'July 2021 - Dec 2023',
      role: 'Software Engineer',
      details: 'Built automated salary disbursement and tax calculation module reducing monthly processing time by 40%.'
    }
  ]);

  const [candInterviews, setCandInterviews] = useState<any[]>([]);
  const [dbApplications, setDbApplications] = useState<any[]>([]);
  const [rescheduleModalId, setRescheduleModalId] = useState<number | null>(null);
  const [rescheduleReasonInput, setRescheduleReasonInput] = useState('');
  const [rescheduleDateInput, setRescheduleDateInput] = useState('');

  const fetchInterviews = async () => {
    try {
      const res = await InterviewAPI.listCandidate();
      if (res && res.items) {
        setCandInterviews(res.items);
      }
    } catch (err) {
      console.warn('Failed to fetch candidate interviews:', err);
    }
  };

  const handleRespondInterview = async (interviewId: number | null, statusAction: 'accept' | 'decline' | 'reschedule', reason?: string, newTime?: string) => {
    if (!interviewId) return;
    const rawUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    const API_URL = rawUrl.replace(/\/+$/, '').replace(/\/api\/v1$/, '');
    const token = localStorage.getItem('getworxs_access_token');

    try {
      const res = await fetch(`${API_URL}/api/v1/candidate/interviews/${interviewId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          action: statusAction,
          reason,
          proposed_time: newTime
        })
      });
      if (res.ok) {
        setCandInterviews(prev => prev.map(inv => inv.id === interviewId ? { ...inv, status: statusAction === 'accept' ? 'accepted' : statusAction === 'decline' ? 'cancelled' : 'rescheduled' } : inv));
      }
    } catch (e) {
      console.error('Error responding to interview:', e);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchApplications = async () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('getworxs_access_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/api/v1/applications?limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data && Array.isArray(data.data.items)) {
          setDbApplications(data.data.items);
        }
      }
    } catch (err) {
      console.warn('Failed to load DB applications in profile:', err);
    }
  };

  useEffect(() => {
    if (currentTab === 'applied') {
      fetchApplications();
    }
  }, [currentTab]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('getworxs_access_token');
    if (!token) {
      setRequestError('Unable to update profile without authentication');
      return;
    }

    const requestPayload = {
      name: editForm.name,
      phone: editForm.phone,
      dob: editForm.dob,
      gender: editForm.gender,
      country: editForm.location,
      state: editForm.location,
      city: editForm.location,
      current_role: editForm.title,
      total_experience: editForm.totalExperience,
      preferred_job_role: editForm.preferredJobType,
      preferred_location: editForm.preferredWorkMode,
      expected_salary: editForm.expectedSalary,
      highest_qualification: editForm.highestQualification,
      university: editForm.university,
      graduation_year: editForm.passingYear,
      resume_url: profile.portfolioUrl,
      linkedin_url: editForm.linkedinUrl,
      portfolio_url: editForm.githubUrl,
      skills: skills,
    };

    try {
      const response = await fetch(`${API_URL}/api/v1/candidates/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestPayload),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const profileData = result.data;
          setProfile((prev) => ({
            ...prev,
            name: profileData.name || prev.name,
            title: profileData.current_role || prev.title,
            email: profileData.email || prev.email,
            phone: profileData.phone || prev.phone,
            dob: profileData.dob || prev.dob,
            gender: profileData.gender || prev.gender,
            location: profileData.city || prev.location,
            totalExperience: profileData.total_experience || prev.totalExperience,
            highestQualification: profileData.highest_qualification || prev.highestQualification,
            university: profileData.university || prev.university,
            passingYear: profileData.graduation_year || prev.passingYear,
            expectedSalary: profileData.expected_salary || prev.expectedSalary,
            linkedinUrl: profileData.linkedin_url || prev.linkedinUrl,
            githubUrl: profileData.portfolio_url || prev.githubUrl,
            portfolioUrl: profileData.portfolio_url || prev.portfolioUrl,
          }));
          setIsEditing(false);
          setRequestError(null);
        }
      }
    } catch (err) {
      console.warn('Profile save error:', err);
    }
  };

  const handleAddSkill = () => {
    if (!newSkill.trim() || skills.includes(newSkill.trim())) return;
    setSkills([...skills, newSkill.trim()]);
    setNewSkill('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleDownloadResume = () => {
    alert('Downloading Candidate_Resume.pdf...');
  };

  useEffect(() => {
    const fetchCandidateProfile = async () => {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('getworxs_access_token');
      if (!token) {
        setLoadingProfile(false);
        return;
      }

      try {
        const [profileRes, completionRes] = await Promise.all([
          fetch(`${API_URL}/api/v1/candidates/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/v1/candidates/profile-completion`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (profileRes.ok) {
          const profileJson = await profileRes.json();
          if (profileJson.success && profileJson.data) {
            const profileData = profileJson.data;
            const location = [profileData.city, profileData.state, profileData.country]
              .filter(Boolean)
              .join(', ');
            setProfile({
              ...initialProfileState,
              name: profileData.name || 'Candidate User',
              title: profileData.current_role || 'Senior Full Stack Software Engineer',
              email: profileData.email || 'candidate@getworxs.com',
              phone: profileData.phone || '+91 98765 43210',
              location: location || 'Bangalore, Karnataka, India',
              dob: profileData.dob || '15 Aug 1998',
              gender: profileData.gender || 'Male',
              totalExperience: profileData.total_experience || '3 Years 6 Months',
              highestQualification: profileData.highest_qualification || "B.Tech / B.E. in Computer Science",
              university: profileData.university || 'IIT Madras',
              passingYear: profileData.graduation_year || '2021',
              expectedSalary: profileData.expected_salary || '₹ 18 Lakhs / yr',
              preferredWorkMode: profileData.preferred_location || 'Hybrid / Remote',
              preferredJobType: profileData.preferred_job_role || 'Full Time',
              linkedinUrl: profileData.linkedin_url || 'https://linkedin.com',
              githubUrl: profileData.portfolio_url || 'https://github.com',
              portfolioUrl: profileData.portfolio_url || '',
              completeness: profileData.profile_completion_percentage || 85,
              profileLastUpdated: profileData.profile_last_updated ? `Updated ${new Date(profileData.profile_last_updated).toLocaleDateString()}` : 'Updated 2 days ago',
            });
            setEditForm({
              ...initialProfileState,
              name: profileData.name || 'Candidate User',
              title: profileData.current_role || 'Senior Full Stack Software Engineer',
              email: profileData.email || '',
              phone: profileData.phone || '',
              location: location || 'Bangalore, India',
              totalExperience: profileData.total_experience || '3.5 Years',
              highestQualification: profileData.highest_qualification || "B.Tech / B.E.",
              university: profileData.university || '',
              passingYear: profileData.graduation_year || '2021',
              expectedSalary: profileData.expected_salary || '',
              preferredWorkMode: profileData.preferred_location || 'Hybrid',
              preferredJobType: profileData.preferred_job_role || 'Full Time',
              linkedinUrl: profileData.linkedin_url || '',
              githubUrl: profileData.portfolio_url || '',
              portfolioUrl: profileData.portfolio_url || '',
            });

            if (profileData.skills && Array.isArray(profileData.skills) && profileData.skills.length > 0) {
              setSkills(profileData.skills);
            }
          }
        }

        if (completionRes.ok) {
          await completionRes.json();
        }
      } catch (err) {
        console.warn('Candidate profile load error:', err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchCandidateProfile();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'CU';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const scrollToSection = (id: string) => {
    setActiveQuickSection(id);
    const element = document.getElementById(`naukri-sec-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loadingProfile) {
    return (
      <div className="profile-loading-viewport">
        <div className="spinner-primary" />
        <p>Loading candidate profile...</p>
      </div>
    );
  }

  return (
    <div className="naukri-profile-page-wrapper">

      {/* 1. TOP NAUKRI CANDIDATE HEADER CARD */}
      <div className="naukri-candidate-header-card">
        <div className="naukri-header-container">
          
          <div className="naukri-avatar-column">
            <div className="naukri-avatar-circle">
              {getInitials(profile.name)}
              <button 
                type="button" 
                className="btn-add-photo-icon" 
                title="Change profile photo"
                onClick={() => setIsEditing(true)}
              >
                <Camera size={13} />
              </button>
            </div>
          </div>

          <div className="naukri-candidate-info-column">
            <div className="candidate-name-row">
              <h1 className="candidate-name-text">{profile.name}</h1>
              <button type="button" className="btn-pencil-edit" onClick={() => setIsEditing(true)}>
                <Edit3 size={15} />
              </button>
            </div>

            <p className="candidate-designation-text">{profile.title}</p>
            <p className="candidate-company-text">GetWorxs Tech & Software Solutions</p>

            <div className="naukri-meta-details-grid">
              <span className="naukri-meta-item">
                <MapPin size={13.5} className="meta-icon" /> {profile.location}
              </span>
              <span className="naukri-meta-item">
                <Briefcase size={13.5} className="meta-icon" /> {profile.totalExperience}
              </span>
              <span className="naukri-meta-item">
                <Clock size={13.5} className="meta-icon" /> {profile.noticePeriod}
              </span>
              <span className="naukri-meta-item">
                <Mail size={13.5} className="meta-icon" /> {profile.email}
              </span>
              <span className="naukri-meta-item">
                <Phone size={13.5} className="meta-icon" /> {profile.phone}
              </span>
              <span className="naukri-meta-item highlight">
                💰 {profile.expectedSalary}
              </span>
            </div>
          </div>

          {/* Right Header Strength Widget */}
          <div className="naukri-header-strength-column">
            <div className="strength-widget-box">
              <div className="strength-header-row">
                <span className="strength-label">Profile Performance</span>
                <span className="strength-percent">{profile.completeness}%</span>
              </div>
              <div className="strength-progress-track">
                <div className="strength-progress-fill" style={{ width: `${profile.completeness}%` }} />
              </div>
              <span className="last-updated-text">{profile.profileLastUpdated}</span>
            </div>

            <button type="button" className="btn-naukri-update-profile" onClick={() => setIsEditing(true)}>
              Update Profile
            </button>
          </div>

        </div>
      </div>

      {/* 2. SUBTAB NAVIGATION BAR (Naukri Portal Tabs) */}
      <div className="profile-subtab-navbar">
        <div className="profile-subtab-container">
          {[
            { id: 'dashboard', label: 'Profile', icon: User },
            { id: 'applied', label: 'Applied Jobs', icon: Briefcase, count: dbApplications.length || appliedJobs.length },
            { id: 'interviews', label: 'Interviews', icon: Calendar, count: candInterviews.length },
            { id: 'saved', label: 'Saved Jobs', icon: Bookmark, count: savedJobIds.length },
            { id: 'documents', label: 'Resume & Docs', icon: FileText },
            { id: 'notifications', label: 'Notifications', icon: Bell, count: unreadCount },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            const active = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                className={`profile-subtab-btn ${active ? 'active' : ''}`}
                onClick={() => handleSubTabChange(tab.id)}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="subtab-count-badge">{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. MAIN TAB CONTENT AREA */}
      <div className="naukri-profile-content-container">

        {/* TAB 1: NAUKRI PROFILE (mnjuser/profile 3-Column Layout) */}
        {currentTab === 'dashboard' && (
          <div className="naukri-3col-layout">
            
            {/* COLUMN 1: LEFT STICKY QUICK LINKS SIDEBAR (220px) */}
            <aside className="naukri-quick-links-sidebar">
              <div className="quick-links-card">
                <span className="quick-links-title">Quick Links</span>
                <nav className="quick-links-nav">
                  {[
                    { id: 'resume', label: 'Resume' },
                    { id: 'headline', label: 'Resume Headline' },
                    { id: 'skills', label: 'Key Skills' },
                    { id: 'employment', label: 'Employment' },
                    { id: 'education', label: 'Education' },
                    { id: 'projects', label: 'Projects' },
                    { id: 'summary', label: 'Profile Summary' },
                    { id: 'accomplishments', label: 'Accomplishments' },
                    { id: 'career', label: 'Career Profile' },
                    { id: 'personal', label: 'Personal Details' }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      className={`quick-link-item ${activeQuickSection === item.id ? 'active' : ''}`}
                      onClick={() => scrollToSection(item.id)}
                    >
                      <span>{item.label}</span>
                      {activeQuickSection === item.id && <ChevronRight size={13} />}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* COLUMN 2: MIDDLE MAIN CARDS FEED (Flexible Width) */}
            <main className="naukri-main-cards-feed">

              {/* CARD 1: RESUME BOX */}
              <section id="naukri-sec-resume" className="naukri-card-section">
                <div className="naukri-card-header">
                  <h3 className="naukri-card-title">Resume</h3>
                  <span className="naukri-card-subtitle">Resume is the most important document recruiters look for</span>
                </div>

                <div className="naukri-resume-upload-box">
                  <div className="resume-icon-badge">
                    <FileText size={28} color="var(--color-primary)" />
                  </div>
                  <div className="resume-details-block">
                    <span className="resume-filename">Candidate_Resume.pdf</span>
                    <span className="resume-upload-time">Uploaded on 05 Aug 2026</span>
                  </div>

                  <div className="resume-action-buttons">
                    <label htmlFor="naukri-resume-file" className="btn-naukri-action-primary">
                      UPDATE RESUME
                    </label>
                    <input type="file" id="naukri-resume-file" className="file-input-hidden" accept=".pdf,.doc,.docx" />
                    
                    <button 
                      type="button" 
                      className="btn-naukri-action-secondary"
                      onClick={handleDownloadResume}
                    >
                      <Download size={13} style={{ marginRight: 4 }} /> DOWNLOAD
                    </button>
                  </div>
                </div>
                <span className="supported-formats-text">Supported Formats: doc, docx, rtf, pdf | Max file size: 2MB</span>
              </section>

              {/* CARD 2: RESUME HEADLINE */}
              <section id="naukri-sec-headline" className="naukri-card-section">
                <div className="naukri-card-header">
                  <h3 className="naukri-card-title">Resume Headline</h3>
                  <button 
                    type="button" 
                    className="btn-card-edit" 
                    onClick={() => {
                      setEditHeadlineInput(profile.resumeHeadline);
                      setEditHeadlineModal(true);
                    }}
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                </div>
                <p className="headline-content-text">{profile.resumeHeadline}</p>
              </section>

              {/* CARD 3: KEY SKILLS */}
              <section id="naukri-sec-skills" className="naukri-card-section">
                <div className="naukri-card-header">
                  <h3 className="naukri-card-title">Key Skills</h3>
                  <button type="button" className="btn-card-edit" onClick={() => setEditSkillsModal(true)}>
                    <Edit3 size={14} /> Add / Edit Skills
                  </button>
                </div>

                <div className="naukri-skills-chips-wrap">
                  {skills.map(sk => (
                    <span key={sk} className="naukri-skill-chip-pill">
                      {sk}
                    </span>
                  ))}
                </div>
              </section>

              {/* CARD 4: EMPLOYMENT HISTORY */}
              <section id="naukri-sec-employment" className="naukri-card-section">
                <div className="naukri-card-header">
                  <h3 className="naukri-card-title">Employment</h3>
                  <button type="button" className="btn-card-add-link" onClick={() => setAddEmploymentModal(true)}>
                    <Plus size={14} /> Add employment
                  </button>
                </div>

                <div className="naukri-employment-item">
                  <div className="employment-title-row">
                    <h4 className="emp-role-title">{empForm.title}</h4>
                    <span className="emp-type-tag">{empForm.type}</span>
                  </div>
                  <p className="emp-company-name">{empForm.company}</p>
                  <p className="emp-duration-text">{empForm.duration}</p>
                  <p className="emp-desc-text">{empForm.description}</p>
                </div>
              </section>

              {/* CARD 5: EDUCATION */}
              <section id="naukri-sec-education" className="naukri-card-section">
                <div className="naukri-card-header">
                  <h3 className="naukri-card-title">Education</h3>
                  <button type="button" className="btn-card-add-link" onClick={() => setAddEducationModal(true)}>
                    <Plus size={14} /> Add education
                  </button>
                </div>

                <div className="naukri-education-item">
                  <div className="edu-icon-badge">
                    <GraduationCap size={20} color="var(--color-primary)" />
                  </div>
                  <div className="edu-details-block">
                    <h4 className="edu-degree-title">{eduForm.degree}</h4>
                    <p className="edu-college-name">{eduForm.university}</p>
                    <p className="edu-meta-text">{eduForm.year} • Full Time • CGPA: {eduForm.cgpa}</p>
                  </div>
                </div>
              </section>

              {/* CARD 6: PROJECTS */}
              <section id="naukri-sec-projects" className="naukri-card-section">
                <div className="naukri-card-header">
                  <h3 className="naukri-card-title">Projects</h3>
                  <button type="button" className="btn-card-add-link" onClick={() => setAddProjectModal(true)}>
                    <Plus size={14} /> Add project
                  </button>
                </div>

                {projectsList.map((proj, idx) => (
                  <div key={idx} className="naukri-project-item">
                    <div className="proj-header">
                      <FolderGit2 size={18} color="var(--color-primary)" />
                      <h4 className="proj-title">{proj.title}</h4>
                    </div>
                    <p className="proj-client">Client: <strong>{proj.client}</strong> | Role: {proj.role}</p>
                    <p className="proj-duration">{proj.duration}</p>
                    <p className="proj-details">{proj.details}</p>
                  </div>
                ))}
              </section>

              {/* CARD 8: PROFILE SUMMARY */}
              <section id="naukri-sec-summary" className="naukri-card-section">
                <div className="naukri-card-header">
                  <h3 className="naukri-card-title">Profile Summary</h3>
                  <button type="button" className="btn-card-edit" onClick={() => setIsEditing(true)}>
                    <Edit3 size={14} /> Edit
                  </button>
                </div>
                <p className="profile-summary-paragraph">{profile.bio}</p>
              </section>

              {/* CARD 9: ACCOMPLISHMENTS */}
              <section id="naukri-sec-accomplishments" className="naukri-card-section">
                <div className="naukri-card-header">
                  <h3 className="naukri-card-title">Accomplishments</h3>
                </div>
                <div className="accomplishment-item">
                  <Award size={18} color="#f59e0b" />
                  <div>
                    <h4 className="acc-title">AWS Certified Solutions Architect – Associate</h4>
                    <p className="acc-issuer">Issued by Amazon Web Services • Valid till 2028</p>
                  </div>
                </div>
              </section>

              {/* CARD 10: CAREER PROFILE */}
              <section id="naukri-sec-career" className="naukri-card-section">
                <div className="naukri-card-header">
                  <h3 className="naukri-card-title">Career Profile</h3>
                  <button type="button" className="btn-card-edit" onClick={() => setIsEditing(true)}>
                    <Edit3 size={14} /> Edit
                  </button>
                </div>

                <div className="career-profile-grid">
                  <div className="cp-item">
                    <span className="cp-lbl">Desired Job Type</span>
                    <span className="cp-val">{profile.preferredJobType}</span>
                  </div>
                  <div className="cp-item">
                    <span className="cp-lbl">Preferred Work Mode</span>
                    <span className="cp-val">{profile.preferredWorkMode}</span>
                  </div>
                  <div className="cp-item">
                    <span className="cp-lbl">Expected Salary</span>
                    <span className="cp-val highlight">{profile.expectedSalary}</span>
                  </div>
                  <div className="cp-item">
                    <span className="cp-lbl">Notice Period</span>
                    <span className="cp-val">{profile.noticePeriod}</span>
                  </div>
                </div>
              </section>

              {/* CARD 11: PERSONAL DETAILS */}
              <section id="naukri-sec-personal" className="naukri-card-section">
                <div className="naukri-card-header">
                  <h3 className="naukri-card-title">Personal Details</h3>
                  <button type="button" className="btn-card-edit" onClick={() => setIsEditing(true)}>
                    <Edit3 size={14} /> Edit
                  </button>
                </div>

                <div className="personal-details-grid">
                  <div className="pd-item">
                    <span className="pd-lbl">Date of Birth</span>
                    <span className="pd-val">{profile.dob}</span>
                  </div>
                  <div className="pd-item">
                    <span className="pd-lbl">Gender</span>
                    <span className="pd-val">{profile.gender}</span>
                  </div>
                  <div className="pd-item">
                    <span className="pd-lbl">Marital Status</span>
                    <span className="pd-val">{profile.maritalStatus}</span>
                  </div>
                  <div className="pd-item">
                    <span className="pd-lbl">Languages Known</span>
                    <span className="pd-val">{profile.languages.join(', ')}</span>
                  </div>
                </div>
              </section>

            </main>

            {/* COLUMN 3: RIGHT WIDGET SIDEBAR (280px Performance & Missing Items) */}
            <aside className="naukri-right-widgets-sidebar">

              {/* Performance Widget */}
              <div className="naukri-widget-card">
                <div className="widget-header-title">
                  <TrendingUp size={16} color="var(--color-primary)" />
                  <span>Profile Performance</span>
                </div>

                <div className="performance-stats-duo">
                  <div className="perf-stat-box">
                    <Search size={18} color="var(--color-primary)" />
                    <span className="stat-num">42</span>
                    <span className="stat-label">Search Appearances</span>
                  </div>
                  <div className="perf-stat-box">
                    <Eye size={18} color="#0284c7" />
                    <span className="stat-num">12</span>
                    <span className="stat-label">Recruiter Views</span>
                  </div>
                </div>
                <span className="perf-subtext">Stats measured over the last 90 days</span>
              </div>

              {/* Missing Items Helper Widget */}
              <div className="naukri-widget-card completion-helper-card">
                <div className="widget-header-title">
                  <Sparkles size={16} color="var(--color-primary)" />
                  <span>Add Missing Information</span>
                </div>

                <p className="helper-desc">
                  Recruiters prefer profiles with 100% complete details:
                </p>

                <ul className="naukri-missing-items-list">
                  <li>
                    <span>Add Project Details</span>
                    <span className="points-add">+10%</span>
                  </li>
                  <li>
                    <span>Add Certifications</span>
                    <span className="points-add">+5%</span>
                  </li>
                </ul>

                <button type="button" className="btn-widget-action" onClick={() => setIsEditing(true)}>
                  Add Details Now
                </button>
              </div>

            </aside>

          </div>
        )}

        {/* TAB 2: INTERVIEWS */}
        {currentTab === 'interviews' && (
          <div className="profile-tab-section">
            <div className="tab-section-header">
              <h2 className="tab-title">Interview Schedules</h2>
              <p className="tab-subtitle">Manage upcoming recruiter and AI Video Interview invites.</p>
            </div>

            {candInterviews.length > 0 ? (
              <div className="interviews-cards-grid">
                {candInterviews.map((inv) => (
                  <div key={inv.id} className="interview-invite-card">
                    <div className="invite-header">
                      <div className="invite-company-logo">
                        <Building2 size={20} color="#ffffff" />
                      </div>
                      <div className="invite-title-block">
                        <h4 className="invite-role-title">{inv.job_title || 'Software Engineer Role'}</h4>
                        <p className="invite-company-name">{inv.company_name || 'Global Enterprise'}</p>
                      </div>
                      <span className={`invite-status-badge ${inv.status}`}>
                        {inv.status}
                      </span>
                    </div>

                    <div className="invite-details-row">
                      <div className="detail-item">
                        <Clock size={14} />
                        <span>{new Date(inv.scheduled_at).toLocaleString()}</span>
                      </div>
                      <div className="detail-item">
                        <Globe size={14} />
                        <span>{inv.location_or_link || 'AI Video Platform'}</span>
                      </div>
                    </div>

                    <div className="invite-actions-row">
                      {inv.status === 'scheduled' ? (
                        <>
                          <button 
                            type="button"
                            className="btn-inv-accept"
                            onClick={() => handleRespondInterview(inv.id, 'accept')}
                          >
                            <Check size={14} /> Accept
                          </button>
                          <button 
                            type="button"
                            className="btn-inv-reschedule"
                            onClick={() => setRescheduleModalId(inv.id)}
                          >
                            Reschedule
                          </button>
                          <button 
                            type="button"
                            className="btn-inv-decline"
                            onClick={() => handleRespondInterview(inv.id, 'decline')}
                          >
                            Decline
                          </button>
                        </>
                      ) : (
                        <span className="inv-status-note">Status: {inv.status}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-tab-state">
                <Calendar size={36} color="var(--text-muted)" />
                <p>No interviews scheduled yet. Apply for jobs to get recruiter invites!</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: APPLIED JOBS */}
        {currentTab === 'applied' && (
          <div className="profile-tab-section">
            <div className="tab-section-header">
              <h2 className="tab-title">Applied Jobs Tracker</h2>
              <p className="tab-subtitle">Real-time status tracking for positions you have applied for.</p>
            </div>

            {dbApplications.length > 0 ? (
              <div className="applied-apps-list">
                {dbApplications.map((app) => (
                  <div key={app.id} className="application-status-card">
                    <div className="app-card-left">
                      <div className="app-comp-avatar">
                        {app.job?.company?.name ? app.job.company.name[0] : 'C'}
                      </div>
                      <div className="app-info">
                        <h4 className="app-title">{app.job?.title || 'Applied Role'}</h4>
                        <p className="app-comp">{app.job?.company?.name || 'Verified Company'}</p>
                        <span className="app-date">Applied on {new Date(app.created_at || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="app-card-right">
                      <span className={`app-status-badge ${app.status || 'submitted'}`}>
                        <CheckCircle2 size={13} />
                        {app.status || 'Application Submitted'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : appliedJobs.length > 0 ? (
              <div className="jobs-cards-grid">
                {appliedJobs.map(job => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    currencyCode="INR" 
                    onApplySuccess={onApplySuccess}
                    isBookmarked={savedJobIds.includes(job.id)}
                    onBookmarkToggle={() => onToggleSaveJob(job.id)}
                    hasApplied={true}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-tab-state">
                <Briefcase size={36} color="var(--text-muted)" />
                <p>You haven't applied for any jobs yet. Discover jobs on the Home dashboard!</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: SAVED JOBS */}
        {currentTab === 'saved' && (
          <div className="profile-tab-section">
            <div className="tab-section-header">
              <h2 className="tab-title">Saved Jobs ({savedJobIds.length})</h2>
              <p className="tab-subtitle">Roles you have bookmarked to apply later.</p>
            </div>

            {savedJobIds.length > 0 ? (
              <div className="jobs-cards-grid">
                {jobsList.filter(j => savedJobIds.includes(j.id)).map(job => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    currencyCode="INR" 
                    onApplySuccess={onApplySuccess}
                    isBookmarked={true}
                    onBookmarkToggle={() => onToggleSaveJob(job.id)}
                    hasApplied={appliedJobs.some(a => a.id === job.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-tab-state">
                <Bookmark size={36} color="var(--text-muted)" />
                <p>No saved jobs yet. Click the bookmark icon on any job card to save it!</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: DOCUMENTS */}
        {currentTab === 'documents' && (
          <div className="profile-tab-section">
            <div className="tab-section-header">
              <h2 className="tab-title">Resume & Documents</h2>
              <p className="tab-subtitle">Upload and manage your CV for 1-click job applications.</p>
            </div>

            <div className="upload-dropzone-box">
              <UploadCloud size={40} color="var(--color-primary)" />
              <h3>Upload your latest Resume (PDF or DOCX)</h3>
              <p>Supported formats: .pdf, .docx, .doc (Max 2MB)</p>
              <input type="file" accept=".pdf,.doc,.docx" className="file-input-hidden" id="resume-upload-input" />
              <label htmlFor="resume-upload-input" className="btn-browse-file">
                Browse Files
              </label>
            </div>
          </div>
        )}

        {/* TAB 6: NOTIFICATIONS */}
        {currentTab === 'notifications' && (
          <div className="profile-tab-section">
            <div className="tab-section-header">
              <div className="title-row-between">
                <div>
                  <h2 className="tab-title">Notifications</h2>
                  <p className="tab-subtitle">Recruiter interview updates and job alert notifications.</p>
                </div>
                {unreadCount > 0 && (
                  <button type="button" className="btn-mark-read" onClick={markAllRead}>
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {notifications.length > 0 ? (
              <div className="notifications-feed-list">
                {notifications.map((n: any) => (
                  <div key={n.id} className={`notif-item-card ${!n.is_read && !n.read ? 'unread' : ''}`} onClick={() => markRead(n.id)}>
                    <div className="notif-icon-circle">
                      <Bell size={16} color="var(--color-primary)" />
                    </div>
                    <div className="notif-text-content">
                      <h4 className="notif-title">{n.title}</h4>
                      <p className="notif-message">{n.message}</p>
                      <span className="notif-time">{n.time || n.created_at || 'Recently'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-tab-state">
                <Bell size={36} color="var(--text-muted)" />
                <p>No notifications yet.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: SETTINGS */}
        {currentTab === 'settings' && (
          <div className="profile-tab-section">
            <div className="tab-section-header">
              <h2 className="tab-title">Account Settings</h2>
              <p className="tab-subtitle">Manage candidate privacy, notifications, and security preferences.</p>
            </div>

            <div className="settings-options-card">
              <h3 className="settings-card-title">Job Alerts & Email Preferences</h3>
              <label className="filter-toggle-switch-row">
                <span>Receive daily AI job recommendation emails</span>
                <input type="checkbox" defaultChecked className="filter-toggle-checkbox" />
              </label>
              <label className="filter-toggle-switch-row">
                <span>Instant SMS / WhatsApp interview reminders</span>
                <input type="checkbox" defaultChecked className="filter-toggle-checkbox" />
              </label>
            </div>
          </div>
        )}

      </div>

      {/* 1. EDIT HEADLINE MODAL */}
      {editHeadlineModal && (
        <div className="modal-backdrop-overlay" onClick={() => setEditHeadlineModal(false)}>
          <div className="modal-card-container compact" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>Edit Resume Headline</h3>
              <button type="button" className="btn-close-modal" onClick={() => setEditHeadlineModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="edit-profile-form">
              <div className="form-field full-width">
                <label>Resume Headline</label>
                <textarea 
                  rows={4}
                  value={editHeadlineInput}
                  onChange={(e) => setEditHeadlineInput(e.target.value)}
                />
              </div>

              <div className="modal-footer-row">
                <button type="button" className="btn-modal-cancel" onClick={() => setEditHeadlineModal(false)}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn-modal-submit"
                  onClick={() => {
                    setProfile({ ...profile, resumeHeadline: editHeadlineInput });
                    setEditHeadlineModal(false);
                  }}
                >
                  Save Headline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. EDIT SKILLS MODAL */}
      {editSkillsModal && (
        <div className="modal-backdrop-overlay" onClick={() => setEditSkillsModal(false)}>
          <div className="modal-card-container compact" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>Add / Edit Key & IT Skills</h3>
              <button type="button" className="btn-close-modal" onClick={() => setEditSkillsModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="edit-profile-form">
              <div className="naukri-skills-chips-wrap">
                {skills.map(sk => (
                  <span key={sk} className="naukri-skill-chip-pill editable">
                    <span>{sk}</span>
                    <button type="button" onClick={() => handleRemoveSkill(sk)}><X size={12} /></button>
                  </span>
                ))}
              </div>

              <div className="add-skill-inline-form" style={{ marginTop: '14px' }}>
                <input 
                  type="text"
                  placeholder="Type a new skill (e.g. GraphQL, Next.js)..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddSkill(); }}
                  className="add-skill-input"
                />
                <button type="button" className="btn-add-skill-pill" onClick={handleAddSkill}>
                  <Plus size={14} /> Add
                </button>
              </div>

              <div className="modal-footer-row">
                <button type="button" className="btn-modal-submit" onClick={() => setEditSkillsModal(false)}>
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. ADD EMPLOYMENT MODAL */}
      {addEmploymentModal && (
        <div className="modal-backdrop-overlay" onClick={() => setAddEmploymentModal(false)}>
          <div className="modal-card-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>Add Employment Details</h3>
              <button type="button" className="btn-close-modal" onClick={() => setAddEmploymentModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="edit-profile-form">
              <div className="form-grid-2">
                <div className="form-field">
                  <label>Designation / Role Title</label>
                  <input 
                    type="text"
                    value={empForm.title}
                    onChange={(e) => setEmpForm({ ...empForm, title: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Company Name</label>
                  <input 
                    type="text"
                    value={empForm.company}
                    onChange={(e) => setEmpForm({ ...empForm, company: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Employment Type</label>
                  <select 
                    value={empForm.type}
                    onChange={(e) => setEmpForm({ ...empForm, type: e.target.value })}
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Duration / Period</label>
                  <input 
                    type="text"
                    value={empForm.duration}
                    onChange={(e) => setEmpForm({ ...empForm, duration: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-field full-width">
                <label>Job Responsibilities & Accomplishments</label>
                <textarea 
                  rows={3}
                  value={empForm.description}
                  onChange={(e) => setEmpForm({ ...empForm, description: e.target.value })}
                />
              </div>

              <div className="modal-footer-row">
                <button type="button" className="btn-modal-cancel" onClick={() => setAddEmploymentModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn-modal-submit" onClick={() => setAddEmploymentModal(false)}>
                  Save Employment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. ADD EDUCATION MODAL */}
      {addEducationModal && (
        <div className="modal-backdrop-overlay" onClick={() => setAddEducationModal(false)}>
          <div className="modal-card-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>Add Education Details</h3>
              <button type="button" className="btn-close-modal" onClick={() => setAddEducationModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="edit-profile-form">
              <div className="form-grid-2">
                <div className="form-field">
                  <label>Degree / Qualification</label>
                  <input 
                    type="text"
                    value={eduForm.degree}
                    onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Institute / University</label>
                  <input 
                    type="text"
                    value={eduForm.university}
                    onChange={(e) => setEduForm({ ...eduForm, university: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Passing Year</label>
                  <input 
                    type="text"
                    value={eduForm.year}
                    onChange={(e) => setEduForm({ ...eduForm, year: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>CGPA / Percentage</label>
                  <input 
                    type="text"
                    value={eduForm.cgpa}
                    onChange={(e) => setEduForm({ ...eduForm, cgpa: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer-row">
                <button type="button" className="btn-modal-cancel" onClick={() => setAddEducationModal(false)}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn-modal-submit"
                  onClick={() => {
                    setProfile({ ...profile, highestQualification: eduForm.degree, university: eduForm.university, passingYear: eduForm.year, cgpa: eduForm.cgpa });
                    setAddEducationModal(false);
                  }}
                >
                  Save Education
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. ADD PROJECT MODAL */}
      {addProjectModal && (
        <div className="modal-backdrop-overlay" onClick={() => setAddProjectModal(false)}>
          <div className="modal-card-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>Add Project Details</h3>
              <button type="button" className="btn-close-modal" onClick={() => setAddProjectModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="edit-profile-form">
              <div className="form-grid-2">
                <div className="form-field">
                  <label>Project Title</label>
                  <input 
                    type="text"
                    value={projForm.title}
                    onChange={(e) => setProjForm({ ...projForm, title: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Client / Organization</label>
                  <input 
                    type="text"
                    value={projForm.client}
                    onChange={(e) => setProjForm({ ...projForm, client: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Your Role</label>
                  <input 
                    type="text"
                    value={projForm.role}
                    onChange={(e) => setProjForm({ ...projForm, role: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Duration</label>
                  <input 
                    type="text"
                    value={projForm.duration}
                    onChange={(e) => setProjForm({ ...projForm, duration: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-field full-width">
                <label>Project Details & Tech Stack</label>
                <textarea 
                  rows={3}
                  value={projForm.details}
                  onChange={(e) => setProjForm({ ...projForm, details: e.target.value })}
                />
              </div>

              <div className="modal-footer-row">
                <button type="button" className="btn-modal-cancel" onClick={() => setAddProjectModal(false)}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn-modal-submit"
                  onClick={() => {
                    setProjectsList([{ title: projForm.title, client: projForm.client, role: projForm.role, duration: projForm.duration, details: projForm.details }, ...projectsList]);
                    setAddProjectModal(false);
                  }}
                >
                  Save Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. EDIT FULL PROFILE MODAL */}
      {isEditing && (
        <div className="modal-backdrop-overlay" onClick={() => setIsEditing(false)}>
          <div className="modal-card-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>Edit Basic & Personal Profile</h3>
              <button type="button" className="btn-close-modal" onClick={() => setIsEditing(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="edit-profile-form">
              {requestError && (
                <div className="form-error-banner">
                  <AlertCircle size={15} /> {requestError}
                </div>
              )}

              <div className="form-grid-2">
                <div className="form-field">
                  <label>Full Name</label>
                  <input 
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Current Designation / Headline</label>
                  <input 
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Phone Number</label>
                  <input 
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Location (City, State, Country)</label>
                  <input 
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Total Experience</label>
                  <input 
                    type="text"
                    value={editForm.totalExperience}
                    onChange={(e) => setEditForm({ ...editForm, totalExperience: e.target.value })}
                  />
                </div>

                <div className="form-field">
                  <label>Expected Salary</label>
                  <input 
                    type="text"
                    value={editForm.expectedSalary}
                    onChange={(e) => setEditForm({ ...editForm, expectedSalary: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-field full-width">
                <label>Profile Summary</label>
                <textarea 
                  rows={3}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                />
              </div>

              <div className="modal-footer-row">
                <button type="button" className="btn-modal-cancel" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-modal-submit">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. RESCHEDULE MODAL */}
      {rescheduleModalId !== null && (
        <div className="modal-backdrop-overlay" onClick={() => setRescheduleModalId(null)}>
          <div className="modal-card-container compact" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <h3>Request Interview Reschedule</h3>
              <button type="button" className="btn-close-modal" onClick={() => setRescheduleModalId(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="edit-profile-form">
              <div className="form-field full-width">
                <label>Reason for Reschedule</label>
                <textarea 
                  rows={3}
                  placeholder="State your reason..."
                  value={rescheduleReasonInput}
                  onChange={(e) => setRescheduleReasonInput(e.target.value)}
                />
              </div>

              <div className="form-field full-width">
                <label>Proposed New Date & Time</label>
                <input 
                  type="datetime-local"
                  value={rescheduleDateInput}
                  onChange={(e) => setRescheduleDateInput(e.target.value)}
                />
              </div>

              <div className="modal-footer-row">
                <button type="button" className="btn-modal-cancel" onClick={() => setRescheduleModalId(null)}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn-modal-submit"
                  onClick={() => {
                    handleRespondInterview(rescheduleModalId, 'reschedule', rescheduleReasonInput, rescheduleDateInput);
                    setRescheduleModalId(null);
                  }}
                >
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
