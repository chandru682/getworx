import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDown, 
  User, 
  Bell,
  Sun,
  Moon,
  CheckCheck,
  Briefcase,
  UserCheck,
  FileText,
  Trash2,
  X,
  Globe,
  Menu,
  LogOut,
  Search,
  Sparkles,
  MessageSquare,
  Building2,
  Settings,
  CreditCard
} from 'lucide-react';
import { GetWorxsLogo } from './GetWorxsLogo';
import { type CurrencyCode, type RegionCode } from '../utils/currency';
import { type Job } from './JobCard';
import { type LangCode, getTranslation } from '../utils/translate';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeSubTab: string;
  setActiveSubTab: (subTab: string) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  jobsList?: Job[];
  // Global product props
  activeCurrency: CurrencyCode;
  setActiveCurrency: (currency: CurrencyCode) => void;
  activeRegion: RegionCode;
  setActiveRegion: (region: RegionCode) => void;
  visaOnly: boolean;
  setVisaOnly: (visa: boolean) => void;
  activeLang: LangCode;
  setActiveLang: (lang: LangCode) => void;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'job' | 'recruiter' | 'application' | 'system';
  targetTab?: string;
  targetSubTab?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  activeSubTab,
  setActiveSubTab,
  theme,
  setTheme,
  searchQuery,
  setSearchQuery,
  jobsList = [],
  activeLang,
  setActiveLang
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const navbarRightRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navbarRightRef.current && !navbarRightRef.current.contains(event.target as Node)) {
        setShowLangDropdown(false);
        setShowNotifications(false);
        setShowAuthDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n-1',
      title: '🌐 Global Relocation Opening Match',
      message: 'Shopify Global (Canada) posted a Cloud DevOps role offering full visa sponsorship & relocation.',
      time: '10 mins ago',
      read: false,
      type: 'job',
      targetTab: 'jobs'
    },
    {
      id: 'n-2',
      title: 'Recruiter Profile View (Europe)',
      message: 'Spotify Tech recruitment team in Stockholm viewed your developer profile.',
      time: '1 hour ago',
      read: false,
      type: 'recruiter',
      targetTab: 'profile',
      targetSubTab: 'dashboard'
    },
    {
      id: 'n-3',
      title: 'Cross-Border Application Update',
      message: 'Your application for Lead UI/UX Designer at Canva Sydney was shortlisted.',
      time: '3 hours ago',
      read: false,
      type: 'application',
      targetTab: 'profile',
      targetSubTab: 'applied'
    },
    {
      id: 'n-4',
      title: 'Global ATS Score 96/100',
      message: 'Your resume achieved 96% global compatibility across US, EU & APAC ATS parsers.',
      time: 'Yesterday',
      read: true,
      type: 'system',
      targetTab: 'resources',
      targetSubTab: 'score-checker'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNavClick = (tab: string, subTab?: string) => {
    setActiveTab(tab);
    if (subTab) {
      setActiveSubTab(subTab);
    } else {
      setActiveSubTab('');
    }
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
    setShowNotifications(false);

    if (item.targetTab) {
      handleNavClick(item.targetTab, item.targetSubTab);
    }
  };

  const getNotificationIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'job': return <Briefcase size={16} style={{ color: 'var(--color-primary)' }} />;
      case 'recruiter': return <UserCheck size={16} style={{ color: 'var(--color-secondary)' }} />;
      case 'application': return <FileText size={16} style={{ color: 'var(--color-success)' }} />;
      default: return <Bell size={16} style={{ color: 'var(--color-accent)' }} />;
    }
  };

  const languages: { code: LangCode; name: string; flag: string }[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ar', name: 'العربية', flag: '🇦🇪' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];

  const matchingJobs = (jobsList || []).filter(job => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(q) ||
      job.clientName.toLowerCase().includes(q) ||
      job.clientLocation.toLowerCase().includes(q) ||
      job.tags.some(t => t.toLowerCase().includes(q))
    );
  });

  if (activeTab === 'recruiter') {
    return null;
  }

  if (activeTab === 'employer') {
    return (
      <nav className="navbar employer-navbar" style={{ borderBottom: '1px solid #e2e8f0', background: '#ffffff', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}>
        
        {/* Left column: Logo & Nav items */}
        <div className="navbar-left">
          <GetWorxsLogo onClick={() => handleNavClick('employer', 'overview')} />
          
          <ul className="navbar-menu" style={{ marginLeft: '24px' }}>
            {/* Jobs Dropdown */}
            <li className="navbar-item">
              <a 
                href="#jobs" 
                className={`navbar-link ${(activeSubTab === 'jobs' || activeSubTab === 'create-job') ? 'active' : ''}`}
                onClick={(e) => e.preventDefault()}
              >
                Jobs <ChevronDown size={14} />
              </a>
              <div className="dropdown-menu">
                <a href="#all-jobs" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleNavClick('employer', 'jobs'); }}>All Jobs</a>
                <a href="#create-job" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleNavClick('employer', 'create-job'); }}>Create Job</a>
                <a href="#draft-jobs" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleNavClick('employer', 'jobs'); }}>Draft Jobs</a>
                <a href="#active-jobs" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleNavClick('employer', 'jobs'); }}>Active Jobs</a>
              </div>
            </li>

            {/* Candidates Dropdown */}
            <li className="navbar-item">
              <a 
                href="#candidates" 
                className={`navbar-link ${(activeSubTab === 'applicants' || activeSubTab === 'interviews') ? 'active' : ''}`}
                onClick={(e) => e.preventDefault()}
              >
                Candidates <ChevronDown size={14} />
              </a>
              <div className="dropdown-menu">
                <a href="#applicants" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleNavClick('employer', 'applicants'); }}>Applicants</a>
                <a href="#shortlisted" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleNavClick('employer', 'applicants'); }}>Shortlisted</a>
                <a href="#interviews" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleNavClick('employer', 'interviews'); }}>Interviews</a>
              </div>
            </li>

            {/* AI Hiring Dropdown */}
            <li className="navbar-item">
              <a 
                href="#ai-hiring" 
                className={`navbar-link ${(activeSubTab === 'ai-matching' || activeSubTab === 'resume-checker') ? 'active' : ''}`}
                onClick={(e) => e.preventDefault()}
              >
                AI Hiring <ChevronDown size={14} />
              </a>
              <div className="dropdown-menu">
                <a href="#ai-match" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleNavClick('employer', 'ai-matching'); }}>AI Candidate Match</a>
                <a href="#resume-analysis" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleNavClick('employer', 'ai-matching'); }}>Resume Parser</a>
                <a href="#ai-jd" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleNavClick('employer', 'create-job'); }}>AI Job Description</a>
                <a href="#interview-assistant" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleNavClick('employer', 'interviews'); }}>Interview Assistant</a>
              </div>
            </li>

            {/* Company Dropdown */}
            <li className="navbar-item">
              <a 
                href="#company" 
                className={`navbar-link ${(activeSubTab === 'profile' || activeSubTab === 'billing' || activeSubTab === 'settings') ? 'active' : ''}`}
                onClick={(e) => e.preventDefault()}
              >
                Company <ChevronDown size={14} />
              </a>
              <div className="dropdown-menu">
                <a href="#profile" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleNavClick('employer', 'profile'); }}>Company Profile</a>
                <a href="#recruiters" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleNavClick('employer', 'settings'); }}>Recruiters</a>
                <a href="#branches" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleNavClick('employer', 'profile'); }}>Branches</a>
                <a href="#billing" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleNavClick('employer', 'billing'); }}>Billing</a>
                <a href="#settings" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleNavClick('employer', 'settings'); }}>Settings</a>
              </div>
            </li>
          </ul>
        </div>

        {/* Right column: Action controls */}
        <div className="navbar-right" ref={navbarRightRef}>
          
          {/* Compact search input container */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {showSearchInput ? (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                border: '1px solid #cbd5e1', 
                borderRadius: '99px', 
                padding: '0 12px', 
                background: '#f8fafc',
                height: '36px',
                boxSizing: 'border-box'
              }}>
                <Search size={14} color="#94a3b8" style={{ marginRight: '6px' }} />
                <input 
                  type="text" 
                  placeholder="Search candidates, jobs or skills..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12.5px', width: '150px', color: '#1e293b', padding: 0, height: '100%' }}
                  autoFocus
                />
                <button onClick={() => setShowSearchInput(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '0 2px', display: 'flex', alignItems: 'center' }}>
                  <X size={12} color="#94a3b8" />
                </button>
              </div>
            ) : (
              <button className="icon-button" onClick={() => setShowSearchInput(true)} title="Search Candidates" style={{ width: '38px', height: '38px', borderRadius: '50%' }}>
                <Search size={17} style={{ color: '#4b5563' }} />
              </button>
            )}
          </div>

          {/* Messages */}
          <button 
            className="icon-button"
            onClick={() => handleNavClick('employer', 'messages')}
            title="Messages"
            style={{ position: 'relative', width: '38px', height: '38px', borderRadius: '50%' }}
          >
            <MessageSquare size={17} style={{ color: '#4b5563' }} />
            <span style={{ position: 'absolute', top: '4px', right: '4px', width: '6px', height: '6px', borderRadius: '50%', background: '#0284c7' }} />
          </button>

          {/* Notifications Bell */}
          <div className="notification-bell-container" style={{ position: 'relative' }}>
            <button 
              className="icon-button" 
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
              style={{ position: 'relative', width: '38px', height: '38px', borderRadius: '50%' }}
            >
              <Bell size={17} style={{ color: '#4b5563' }} />
              {unreadCount > 0 && (
                <span 
                  className="notification-badge" 
                  style={{ 
                    position: 'absolute', 
                    top: '4px', 
                    right: '4px', 
                    background: '#ef4444', 
                    color: '#ffffff', 
                    borderRadius: '50%', 
                    padding: '2px', 
                    fontSize: '9.5px', 
                    fontWeight: '800', 
                    lineHeight: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    minWidth: '12px',
                    height: '12px',
                    boxSizing: 'border-box'
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {showNotifications && (
              <div className="notification-panel" style={{ right: 0 }}>
                <div className="notification-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '800' }}>Employer Alerts</h4>
                    {unreadCount > 0 && <span className="profile-tab-count">{unreadCount} New</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button 
                      onClick={handleMarkAllRead} 
                      style={{ fontSize: '11px', color: '#0284c7', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, fontWeight: '600' }}
                    >
                      Mark read
                    </button>
                    <button 
                      onClick={handleClearAll} 
                      style={{ fontSize: '11px', color: '#ef4444', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, fontWeight: '600' }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
                
                <div className="notification-list">
                  {notifications.length > 0 ? (
                    notifications.map(item => (
                      <div 
                        key={item.id} 
                        className={`notification-item ${item.read ? 'read' : 'unread'}`}
                        onClick={() => handleNotificationClick(item)}
                      >
                        <div className="notification-item-icon">
                          {getNotificationIcon(item.type)}
                        </div>
                        <div className="notification-item-content">
                          <div className="notification-item-title">{item.title}</div>
                          <div className="notification-item-desc">{item.message}</div>
                          <div className="notification-item-time">{item.time}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                      No new recruitment notifications.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Employer Profile Menu Dropdown */}
          <div style={{ position: 'relative' }}>
            <button 
              className="global-nav-btn"
              onClick={() => setShowAuthDropdown(!showAuthDropdown)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', height: '36px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
            >
              <span style={{ fontSize: '14px', display: 'flex', alignItems: 'center' }}>🏢</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>CHN Technologies</span>
              <ChevronDown size={12} style={{ marginLeft: '4px', color: '#64748b' }} />
            </button>

            {showAuthDropdown && (
              <div className="dropdown-menu show" style={{ display: 'flex', position: 'absolute', top: 'calc(100% + 8px)', right: 0, minWidth: '220px', zIndex: 1000, padding: '8px' }}>
                <div style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fef08a', color: '#ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px' }}>
                    C
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-primary)' }}>CHN Technologies</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>muthukumar@chn.tech</div>
                  </div>
                </div>

                <div className="dropdown-divider" style={{ margin: '6px 0' }} />

                <div 
                  className="dropdown-item" 
                  onClick={() => { handleNavClick('employer', 'profile'); setShowAuthDropdown(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 10px', borderRadius: '6px', fontSize: '13px' }}
                >
                  <Building2 size={14} style={{ color: '#0284c7' }} />
                  <span>Company Profile</span>
                </div>

                <div 
                  className="dropdown-item" 
                  onClick={() => { handleNavClick('employer', 'settings'); setShowAuthDropdown(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 10px', borderRadius: '6px', fontSize: '13px' }}
                >
                  <UserCheck size={14} style={{ color: '#6366f1' }} />
                  <span>Recruiters</span>
                </div>

                <div 
                  className="dropdown-item" 
                  onClick={() => { handleNavClick('employer', 'billing'); setShowAuthDropdown(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 10px', borderRadius: '6px', fontSize: '13px' }}
                >
                  <CreditCard size={14} style={{ color: '#059669' }} />
                  <span>Billing</span>
                </div>

                <div 
                  className="dropdown-item" 
                  onClick={() => { handleNavClick('employer', 'settings'); setShowAuthDropdown(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 10px', borderRadius: '6px', fontSize: '13px' }}
                >
                  <Settings size={14} style={{ color: '#64748b' }} />
                  <span>Settings</span>
                </div>

                <div className="dropdown-divider" style={{ margin: '6px 0' }} />

                {/* Inline Language Selector */}
                <div style={{ padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Globe size={13} />
                    <span>Language</span>
                  </span>
                  <select 
                    value={activeLang} 
                    onChange={(e) => setActiveLang(e.target.value as LangCode)}
                    style={{ fontSize: '11px', padding: '2px 4px', border: '1px solid #e2e8f0', borderRadius: '4px', background: '#fff', outline: 'none' }}
                  >
                    <option value="en">English 🇺🇸</option>
                    <option value="hi">हिन्दी 🇮🇳</option>
                    <option value="ar">العربية 🇦🇪</option>
                    <option value="es">Español 🇪🇸</option>
                  </select>
                </div>

                {/* Inline Theme Toggle */}
                <div 
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderRadius: '6px' }}
                  className="dropdown-item"
                >
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
                    <span>Appearance</span>
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#0284c7' }}>
                    {theme === 'dark' ? 'Dark' : 'Light'}
                  </span>
                </div>

                {/* Switch back to Job Seeker Portal link */}
                <div 
                  className="dropdown-item" 
                  onClick={() => { handleNavClick('home'); setShowAuthDropdown(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', color: 'var(--color-primary)' }}
                >
                  <Sparkles size={14} style={{ color: 'var(--color-primary)' }} />
                  <span>Job Seeker Portal</span>
                </div>

                {/* Switch to Recruiter Portal link */}
                <div 
                  className="dropdown-item" 
                  onClick={() => { handleNavClick('recruiter'); setShowAuthDropdown(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '600', color: '#6d28d9' }}
                >
                  <Sparkles size={14} style={{ color: '#6d28d9' }} />
                  <span>Recruiter Portal</span>
                </div>

                <div className="dropdown-divider" style={{ margin: '6px 0' }} />

                <div 
                  className="dropdown-item logout-item" 
                  onClick={() => { handleNavClick('home'); setShowAuthDropdown(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 10px', borderRadius: '6px', fontSize: '13px', color: '#ef4444' }}
                >
                  <LogOut size={14} style={{ color: '#ef4444' }} />
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <GetWorxsLogo onClick={() => handleNavClick('home')} />

        <ul className="navbar-menu">
          {/* Home */}
          <li className="navbar-item">
            <a 
              href="#home" 
              className={`navbar-link ${activeTab === 'home' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}
            >
              {getTranslation(activeLang, 'home')}
            </a>
          </li>

          {/* Jobs */}
          <li className="navbar-item">
            <a 
              href="#jobs" 
              className={`navbar-link ${(activeTab === 'jobs' || activeTab.startsWith('jobs-')) ? 'active' : ''}`}
              onClick={(e) => e.preventDefault()}
            >
              {getTranslation(activeLang, 'jobs')} <ChevronDown size={14} />
            </a>
            <div className="dropdown-menu">
              <a href="#browse-jobs" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleNavClick('jobs', ''); }}>{getTranslation(activeLang, 'browse_jobs')}</a>
              <a href="#remote-jobs" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleNavClick('jobs', 'remote'); }}>{getTranslation(activeLang, 'remote_jobs')}</a>
              <a href="#startup-jobs" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleNavClick('jobs', 'startup'); }}>{getTranslation(activeLang, 'startup_jobs')}</a>
              <a href="#ai-jobs" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleNavClick('jobs', 'ai'); }}>{getTranslation(activeLang, 'ai_jobs')}</a>
              <a href="#internships" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleNavClick('jobs', 'internship'); }}>{getTranslation(activeLang, 'internships')}</a>
              <a href="#walk-in-jobs" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleNavClick('jobs', 'walkin'); }}>{getTranslation(activeLang, 'walkin_jobs')}</a>
              <a href="#top-companies" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleNavClick('companies'); }}>{getTranslation(activeLang, 'top_companies')}</a>
            </div>
          </li>

          {/* Companies */}
          <li className="navbar-item">
            <a 
              href="#companies" 
              className={`navbar-link ${activeTab === 'companies' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleNavClick('companies'); }}
            >
              {getTranslation(activeLang, 'top_companies')}
            </a>
          </li>

          {/* AI Services */}
          <li className="navbar-item">
            <a 
              href="#resources" 
              className={`navbar-link ${activeTab === 'resources' ? 'active' : ''}`}
              onClick={(e) => e.preventDefault()}
            >
              {getTranslation(activeLang, 'ai_services')} <ChevronDown size={14} />
            </a>
            <div className="dropdown-menu">
              <a href="#ai-interview" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleNavClick('resources', 'mock-interview'); }}>{getTranslation(activeLang, 'mock_interview')}</a>
              <a href="#resume-checker" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleNavClick('resources', 'score-checker'); }}>{getTranslation(activeLang, 'resume_checker')}</a>
              <a href="#salary-calculator" className="dropdown-item" onClick={(e) => { e.preventDefault(); handleNavClick('resources', 'salary-calc'); }}>{getTranslation(activeLang, 'salary_calc')}</a>
            </div>
          </li>
        </ul>
      </div>

      {/* Navbar Global Search Input (Capsule Pill with Live Filter Dropdown) */}
      <div className="navbar-search-container" ref={searchRef}>
        <div className="navbar-search-wrapper">
          <input 
            type="text"
            className="navbar-search-input"
            placeholder={getTranslation(activeLang, 'search_placeholder')}
            value={searchQuery}
            onFocus={() => setShowSearchDropdown(true)}
            onChange={(e) => {
              const val = e.target.value;
              setSearchQuery(val);
              setShowSearchDropdown(true);
              if (val.trim()) {
                setActiveTab('jobs');
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setActiveTab('jobs');
                setShowSearchDropdown(false);
              }
            }}
          />
          {searchQuery && (
            <button 
              type="button"
              className="navbar-search-clear"
              onClick={() => {
                setSearchQuery('');
                setShowSearchDropdown(false);
              }}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
          <button 
            className="navbar-search-btn"
            onClick={() => {
              setActiveTab('jobs');
              setShowSearchDropdown(false);
            }}
            title="Search jobs"
          >
            <Search size={16} color="#ffffff" />
          </button>
        </div>

        {/* Live Search Results Dropdown Suggestions */}
        {showSearchDropdown && searchQuery.trim().length > 0 && (
          <div className="navbar-search-results-dropdown">
            <div className="search-results-header">
              <span>Matching Jobs ({matchingJobs.length})</span>
              <span className="search-results-hint">Press Enter to view all</span>
            </div>

            {matchingJobs.length > 0 ? (
              <div className="search-results-list">
                {matchingJobs.slice(0, 5).map(job => (
                  <div 
                    key={job.id} 
                    className="search-result-item"
                    onClick={() => {
                      setSearchQuery(job.title);
                      setActiveTab('jobs');
                      setShowSearchDropdown(false);
                    }}
                  >
                    <div className="search-result-icon">
                      <Briefcase size={15} />
                    </div>
                    <div className="search-result-info">
                      <div className="search-result-title">{job.title}</div>
                      <div className="search-result-sub">
                        <span>{job.clientName}</span> • <span>{job.clientLocation}</span>
                      </div>
                    </div>
                    <span className="search-result-tag">{job.workMode}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="search-no-results">
                No jobs found matching "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      <div className="navbar-right" ref={navbarRightRef}>

        {/* Language Selector */}
        <div style={{ position: 'relative' }} className="hide-mobile">
          <button
            className="global-nav-btn"
            onClick={() => {
              setShowLangDropdown(!showLangDropdown);
            }}
          >
            <Globe size={14} />
            <span>{languages.find(l => l.code === activeLang)?.name || 'English'}</span>
            <ChevronDown size={12} />
          </button>

          {showLangDropdown && (
            <div className="dropdown-menu show" style={{ display: 'flex', position: 'absolute', top: 'calc(100% + 8px)', right: 0, left: 'auto', minWidth: '170px', zIndex: 1000 }}>
              {languages.map((lang) => (
                <div
                  key={lang.code}
                  className="dropdown-item"
                  onClick={() => {
                    setActiveLang(lang.code);
                    setShowLangDropdown(false);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button 
          className="icon-button" 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Employer Switch Button */}
        <button
          className="global-nav-btn hide-mobile"
          style={{
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            borderColor: 'var(--color-primary-border)',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '99px',
            cursor: 'pointer',
            fontSize: '13px',
            marginRight: '8px',
            border: '1px solid var(--color-primary-border)'
          }}
          onClick={() => handleNavClick('employer')}
        >
          <Building2 size={14} style={{ color: 'var(--color-primary)' }} />
          <span>Employer Portal</span>
        </button>

        {/* Recruiter Switch Button */}
        <button
          className="global-nav-btn hide-mobile"
          style={{
            background: 'rgba(109, 40, 217, 0.08)',
            color: '#6d28d9',
            borderColor: 'rgba(109, 40, 217, 0.15)',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '99px',
            cursor: 'pointer',
            fontSize: '13px',
            marginRight: '8px',
            border: '1px solid rgba(109, 40, 217, 0.15)'
          }}
          onClick={() => handleNavClick('recruiter')}
        >
          <Sparkles size={14} style={{ color: '#6d28d9' }} />
          <span>Recruiter Portal</span>
        </button>

        {/* Standalone Bell Notification Icon */}
        <div className="notification-bell-container" style={{ position: 'relative' }}>
          <button 
            className="icon-button" 
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            style={{ 
              background: 'none', 
              border: 'none', 
              boxShadow: 'none',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Bell size={24} style={{ color: '#4b5563', strokeWidth: 1.8 }} />
          </button>

          {/* Floating Notification Panel */}
          {showNotifications && (
            <div className="notification-panel" style={{ right: 0 }}>
              <div className="notification-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-primary)' }}>Global Alerts</h4>
                  {unreadCount > 0 && (
                    <span className="profile-tab-count" style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}>
                      {unreadCount} New
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                      title="Mark all as read"
                    >
                      <CheckCheck size={14} /> Read All
                    </button>
                  )}
                  <button 
                    onClick={() => setShowNotifications(false)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="notification-list">
                {notifications.length > 0 ? (
                  notifications.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`notification-item ${!item.read ? 'unread' : ''}`}
                    >
                      <div className="company-icon-box" style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
                        {getNotificationIcon(item.type)}
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)' }}>
                            {item.title}
                          </span>
                          {!item.read && <div className="notification-item-dot" />}
                        </div>
                        <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                          {item.message}
                        </p>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {item.time}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13.5px' }}>
                    <Bell size={28} style={{ opacity: 0.5, marginBottom: '8px' }} />
                    <div>No new notifications</div>
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-neutral-light)', display: 'flex', justifyContent: 'center' }}>
                  <button 
                    onClick={handleClearAll}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Trash2 size={13} /> Clear Notification List
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Account & Auth Pill Container (Matches User Image) */}
        <div style={{ position: 'relative' }}>
          <button 
            className="navbar-profile-pill"
            onClick={() => setShowAuthDropdown(!showAuthDropdown)}
            title="Account & Profile Menu"
          >
            {/* Hamburger Icon */}
            <Menu size={18} className="pill-menu-icon" style={{ color: '#64748b' }} />

            {/* User Avatar Circle with Notification Badge */}
            <div className="pill-avatar-wrapper">
              <div className="pill-avatar-circle">
                <User size={18} className="avatar-icon" />
              </div>
              <span className="pill-avatar-badge">
                {unreadCount > 0 ? unreadCount : 2}
              </span>
            </div>
          </button>

          {/* Floating Dropdown Menu */}
          {showAuthDropdown && (
            <div 
              className="dropdown-menu show profile-dropdown-menu" 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                position: 'absolute', 
                top: 'calc(100% + 10px)', 
                right: 0, 
                left: 'auto',
                width: '250px', 
                maxWidth: 'calc(100vw - 32px)',
                zIndex: 1000,
                padding: '10px',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-lg)',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)'
              }}
            >
              {/* Account Section */}
              <div className="dropdown-header" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', padding: '4px 8px 6px', letterSpacing: '0.5px' }}>
                ACCOUNT
              </div>
              
              <div 
                className="dropdown-item"
                onClick={() => {
                  handleNavClick('login');
                  setShowAuthDropdown(false);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer' }}
              >
                <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(109, 40, 217, 0.12)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <UserCheck size={17} />
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: '700', fontSize: '13.5px', color: 'var(--text-primary)' }}>{getTranslation(activeLang, 'login')}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Sign in to existing account</div>
                </div>
              </div>

              <div 
                className="dropdown-item"
                onClick={() => {
                  handleNavClick('register');
                  setShowAuthDropdown(false);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', cursor: 'pointer' }}
              >
                <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255, 23, 68, 0.12)', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={17} />
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: '700', fontSize: '13.5px', color: 'var(--text-primary)' }}>{getTranslation(activeLang, 'register')}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Create free candidate profile</div>
                </div>
              </div>

              <div className="dropdown-divider" style={{ margin: '8px 0' }} />

              {/* Candidate Portal Section */}
              <div className="dropdown-header" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', padding: '4px 8px 6px', letterSpacing: '0.5px' }}>
                CANDIDATE PORTAL
              </div>

              <div 
                className="dropdown-item" 
                onClick={() => { handleNavClick('profile', 'dashboard'); setShowAuthDropdown(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '9px 12px', borderRadius: '8px', fontWeight: '600', fontSize: '13.5px' }}
              >
                <User size={15} style={{ color: 'var(--color-primary)' }} />
                <span>Candidate Hub</span>
              </div>
              <div 
                className="dropdown-item" 
                onClick={() => { handleNavClick('profile', 'saved'); setShowAuthDropdown(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '9px 12px', borderRadius: '8px', fontWeight: '600', fontSize: '13.5px' }}
              >
                <Briefcase size={15} style={{ color: 'var(--color-secondary)' }} />
                <span>Saved Jobs</span>
              </div>
              <div 
                className="dropdown-item" 
                onClick={() => { handleNavClick('profile', 'applied'); setShowAuthDropdown(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '9px 12px', borderRadius: '8px', fontWeight: '600', fontSize: '13.5px' }}
              >
                <FileText size={15} style={{ color: 'var(--color-success)' }} />
                <span>Applications</span>
              </div>
              <div 
                className="dropdown-item" 
                onClick={() => { handleNavClick('profile', 'settings'); setShowAuthDropdown(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '9px 12px', borderRadius: '8px', fontWeight: '600', fontSize: '13.5px' }}
              >
                <Globe size={15} style={{ color: 'var(--text-muted)' }} />
                <span>Global Settings</span>
              </div>

              <div className="dropdown-divider" style={{ margin: '6px 0' }} />

              {/* Work Portals Section */}
              <div className="dropdown-header" style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', padding: '4px 8px 6px', letterSpacing: '0.5px' }}>
                WORK PORTALS
              </div>

              <div 
                className="dropdown-item" 
                onClick={() => { handleNavClick('employer'); setShowAuthDropdown(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '9px 12px', borderRadius: '8px', fontWeight: '600', fontSize: '13.5px' }}
              >
                <Building2 size={15} style={{ color: 'var(--color-primary)' }} />
                <span>Employer Portal</span>
              </div>

              <div 
                className="dropdown-item" 
                onClick={() => { handleNavClick('recruiter'); setShowAuthDropdown(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '9px 12px', borderRadius: '8px', fontWeight: '600', fontSize: '13.5px' }}
              >
                <Sparkles size={15} style={{ color: '#6d28d9' }} />
                <span>Recruiter Portal</span>
              </div>

              <div className="dropdown-divider" style={{ margin: '6px 0' }} />

              <div 
                className="dropdown-item logout-item" 
                onClick={() => { 
                  handleNavClick('home'); 
                  setShowAuthDropdown(false); 
                }}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  cursor: 'pointer', 
                  padding: '9px 12px', 
                  borderRadius: '8px', 
                  fontWeight: '600', 
                  fontSize: '13.5px',
                  color: 'var(--color-accent)' 
                }}
              >
                <LogOut size={15} style={{ color: 'var(--color-accent)' }} />
                <span>{getTranslation(activeLang, 'logout')}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
