import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  UserCheck, 
  Briefcase, 
  TrendingUp,
  ChevronRight,
  Star,
  HelpCircle,
  FileText,
  BookOpen,
  Users,
  CheckCircle,
  Trophy,
  ShieldCheck,
  Target,
  GraduationCap,
  LineChart,
  Megaphone
} from 'lucide-react';
import { JobCard, type Job } from './JobCard';
import { type CurrencyCode, CURRENCIES } from '../utils/currency';
import { MOCK_GLOBAL_COMPANIES } from '../data/jobsData';
import careerJourneyBg from '../assets/career_journey.png';

import { Footer } from './Footer';

interface CandidateHomeProps {
  user: any;
  isAuthenticated: boolean;
  jobsList: Job[];
  activeCurrency: CurrencyCode;
  setActiveCurrency: (currency: CurrencyCode) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearchSubmit: (titleQuery: string, locationQuery: string, experienceQuery?: string) => void;
  onNavigateTab: (tab: string, subTab?: string) => void;
  savedJobIds: string[];
  appliedJobIds: string[];
  bookmarkCallbacks: Record<string, () => void>;
  handleApplySuccess: (jobId: string) => void;
}

export const CandidateHome: React.FC<CandidateHomeProps> = ({
  user,
  isAuthenticated,
  jobsList,
  activeCurrency,
  setActiveCurrency,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  onNavigateTab,
  savedJobIds,
  appliedJobIds,
  bookmarkCallbacks,
  handleApplySuccess
}) => {
  const [localTitle, setLocalTitle] = useState(searchQuery || '');
  const [localLocation, setLocalLocation] = useState('');
  const [localExperience, setLocalExperience] = useState('all');
  const [profileCompletion, setProfileCompletion] = useState<number>(0);
  const [loadingCompleteness, setLoadingCompleteness] = useState<boolean>(false);

  // Fetch actual profile completion if authenticated
  useEffect(() => {
    let isMounted = true;
    const checkCompleteness = async () => {
      if (!isAuthenticated) {
        if (isMounted) setProfileCompletion(65); // Default sample incomplete status for guest candidates
        return;
      }
      const token = localStorage.getItem('getworxs_access_token');
      if (!token) return;

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      try {
        setLoadingCompleteness(true);
        const res = await fetch(`${API_URL}/api/v1/candidates/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            const perc = data.data.profile_completion_percentage ?? 0;
            if (isMounted) setProfileCompletion(perc);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch candidate profile completeness:', err);
      } finally {
        if (isMounted) setLoadingCompleteness(false);
      }
    };

    checkCompleteness();
    return () => { isMounted = false; };
  }, [isAuthenticated]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localTitle);
    onSearchSubmit(localTitle, localLocation, localExperience);
  };

  // Derive Recommended Jobs (limit 3 cards)
  const recommendedJobs = React.useMemo(() => {
    const sorted = [...jobsList].sort((a, b) => {
      const scoreA = (a.verifiedCompany ? 2 : 0) + (a.topEmployer ? 2 : 0) + (a.visaSponsorship ? 1 : 0);
      const scoreB = (b.verifiedCompany ? 2 : 0) + (b.topEmployer ? 2 : 0) + (b.visaSponsorship ? 1 : 0);
      return scoreB - scoreA;
    });
    return sorted.slice(0, 3);
  }, [jobsList]);

  // Derive Latest Jobs (limit 3 cards)
  const latestJobs = React.useMemo(() => {
    const sorted = [...jobsList].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });
    return sorted.slice(0, 3);
  }, [jobsList]);

  const popularSearches = [
    { label: 'Remote Jobs', query: 'Remote', icon: <Search size={13} style={{ marginRight: '6px', opacity: 0.8 }} /> },
    { label: 'MNCs', query: 'MNC', icon: <FileText size={13} style={{ marginRight: '6px', opacity: 0.8 }} /> },
    { label: 'Software & Tech', query: 'Software', icon: <GraduationCap size={13} style={{ marginRight: '6px', opacity: 0.8 }} /> },
    { label: 'Startup Jobs', query: 'Startup', icon: <Sparkles size={13} style={{ marginRight: '6px', opacity: 0.8 }} /> },
    { label: 'AI & Data', query: 'AI', icon: <LineChart size={13} style={{ marginRight: '6px', opacity: 0.8 }} /> },
    { label: 'Marketing', query: 'Marketing', icon: <Megaphone size={13} style={{ marginRight: '6px', opacity: 0.8 }} /> }
  ];

  return (
    <div className="candidate-home-wrapper">
      {/* Redesigned Career Journey & Hero Unified Banner */}
      <section className="career-journey-section">
        <div className="career-journey-viewport">
          {/* Floating Currency Selector */}
          <div className="hero-currency-container">
            <span className="currency-label">Currency:</span>
            <select
              value={activeCurrency}
              onChange={(e) => setActiveCurrency(e.target.value as CurrencyCode)}
              className="currency-select"
            >
              {Object.values(CURRENCIES).map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.flag} {curr.code} ({curr.symbol})
                </option>
              ))}
            </select>
          </div>

          {/* Unified Search and Hero Content */}
          <div className="hero-search-overlay">
            <div className="naukri-hero-container" style={{ pointerEvents: 'auto' }}>
              <div className="naukri-hero-content">
                <span className="naukri-hero-badge">
                  <Sparkles size={14} className="hero-sparkle-icon" />
                  <span>India's & Global #1 Job Platform</span>
                </span>

                <h1 className="naukri-hero-heading" style={{ fontSize: 'clamp(28px, 4vw, 48px)' }}>
                  Find your <span className="naukri-hero-heading-accent">dream job</span> now
                </h1>

                <p className="naukri-hero-subheading" style={{ marginBottom: '24px', fontSize: 'clamp(14px, 1.2vw, 16px)' }}>
                  500,000+ jobs from top verified companies around the world
                </p>

                {/* 3-Field Unified Search Bar (Naukri Style) */}
                <form className="naukri-search-bar" onSubmit={handleFormSubmit} style={{ boxShadow: '0 10px 30px rgba(109, 40, 217, 0.12)' }}>
                  {/* Field 1: Skills / Designations / Company */}
                  <div className="naukri-search-field">
                    <Search size={18} className="naukri-field-icon" />
                    <input 
                      type="text"
                      placeholder="Enter skills / designations / company"
                      value={localTitle}
                      onChange={(e) => setLocalTitle(e.target.value)}
                      className="naukri-field-input"
                    />
                  </div>

                  <div className="naukri-field-divider" />

                  {/* Field 2: Select Experience */}
                  <div className="naukri-search-field">
                    <Briefcase size={18} className="naukri-field-icon" />
                    <select
                      value={localExperience}
                      onChange={(e) => setLocalExperience(e.target.value)}
                      className="naukri-field-select"
                    >
                      <option value="all">Select experience</option>
                      <option value="fresher">Fresher (0 Yrs)</option>
                      <option value="1-3">1 - 3 Yrs</option>
                      <option value="3-5">3 - 5 Yrs</option>
                      <option value="5-8">5 - 8 Yrs</option>
                      <option value="8+">8+ Yrs</option>
                    </select>
                  </div>

                  <div className="naukri-field-divider" />

                  {/* Field 3: Enter Location */}
                  <div className="naukri-search-field">
                    <MapPin size={18} className="naukri-field-icon" />
                    <input 
                      type="text"
                      placeholder="Enter location / Remote"
                      value={localLocation}
                      onChange={(e) => setLocalLocation(e.target.value)}
                      className="naukri-field-input"
                    />
                  </div>

                  <button type="submit" className="naukri-search-btn">
                    <span>Search</span>
                  </button>
                </form>

                {/* Collection Chips below search bar */}
                <div className="naukri-collection-row" style={{ marginTop: '20px' }}>
                  {popularSearches.map(item => (
                    <button
                      key={item.label}
                      type="button"
                      className="naukri-collection-chip"
                      style={{ display: 'inline-flex', alignItems: 'center' }}
                      onClick={() => {
                        setLocalTitle(item.query);
                        setSearchQuery(item.query);
                        onSearchSubmit(item.query, localLocation, localExperience);
                      }}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Roadmap Graphic Container */}
          <div className="career-journey-graphic">
            {/* HTML Image Tag to ensure container height scales perfectly with the image aspect ratio */}
            <img 
              src={careerJourneyBg} 
              alt="Career Journey Roadmap" 
              className="journey-img" 
            />

            {/* SVG Curves connecting the steps dynamically */}
            <svg 
              className="journey-svg-overlay" 
              viewBox="0 0 1000 320" 
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Step 1 to 2 */}
              <path d="M 115 80 Q 182.5 96 250 112" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeDasharray="5 5" />
              {/* Step 2 to 3 */}
              <path d="M 250 112 Q 309 104 368 96" fill="none" stroke="#10b981" strokeWidth="2.5" strokeDasharray="5 5" />
              {/* Step 3 to 4 */}
              <path d="M 368 96 Q 424 88 480 80" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeDasharray="5 5" />
              {/* Step 4 to 5 */}
              <path d="M 480 80 Q 539 72 598 64" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeDasharray="5 5" />
              {/* Step 5 to 6 */}
              <path d="M 598 64 Q 661 56 724 48" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="5 5" />
              {/* Step 6 to 7 */}
              <path d="M 724 48 Q 809.5 32 895 16" fill="none" stroke="#eab308" strokeWidth="2.5" strokeDasharray="5 5" />
            </svg>

            {/* Step 1 Node */}
            <div className="journey-step-node step-1" style={{ left: '11.5%', top: '25%', '--step-color': '#8b5cf6', '--step-shadow': 'rgba(139, 92, 246, 0.25)', '--step-hover-bg': '#f5f3ff' } as React.CSSProperties}>
              <div className="journey-step-circle">
                <HelpCircle className="journey-step-icon" />
              </div>
            </div>

            {/* Step 2 Node */}
            <div className="journey-step-node step-2" style={{ left: '25%', top: '35%', '--step-color': '#8b5cf6', '--step-shadow': 'rgba(139, 92, 246, 0.25)', '--step-hover-bg': '#f5f3ff' } as React.CSSProperties}>
              <div className="journey-step-circle">
                <Search className="journey-step-icon" />
              </div>
              <div className="journey-step-label-container">
                <span className="journey-step-title">2. DISCOVER</span>
                <span className="journey-step-desc">Explore Job Openings</span>
              </div>
            </div>

            {/* Step 3 Node */}
            <div className="journey-step-node step-3" style={{ left: '36.8%', top: '30%', '--step-color': '#10b981', '--step-shadow': 'rgba(16, 185, 129, 0.25)', '--step-hover-bg': '#ecfdf5' } as React.CSSProperties}>
              <div className="journey-step-circle">
                <FileText className="journey-step-icon" />
              </div>
              <div className="journey-step-label-container">
                <span className="journey-step-title">3. APPLY</span>
                <span className="journey-step-desc">Submit Your Application</span>
              </div>
            </div>

            {/* Step 4 Node */}
            <div className="journey-step-node step-4" style={{ left: '48%', top: '25%', '--step-color': '#06b6d4', '--step-shadow': 'rgba(6, 182, 212, 0.25)', '--step-hover-bg': '#ecfeff' } as React.CSSProperties}>
              <div className="journey-step-circle">
                <BookOpen className="journey-step-icon" />
              </div>
              <div className="journey-step-label-container">
                <span className="journey-step-title">4. PREPARE</span>
                <span className="journey-step-desc">Upskill & Get Ready</span>
              </div>
            </div>

            {/* Step 5 Node */}
            <div className="journey-step-node step-5" style={{ left: '59.8%', top: '20%', '--step-color': '#8b5cf6', '--step-shadow': 'rgba(139, 92, 246, 0.25)', '--step-hover-bg': '#f5f3ff' } as React.CSSProperties}>
              <div className="journey-step-circle">
                <Users className="journey-step-icon" />
              </div>
              <div className="journey-step-label-container">
                <span className="journey-step-title">5. INTERVIEW</span>
                <span className="journey-step-desc">Show Your Potential</span>
              </div>
            </div>

            {/* Step 6 Node */}
            <div className="journey-step-node step-6" style={{ left: '72.4%', top: '15%', '--step-color': '#f59e0b', '--step-shadow': 'rgba(245, 158, 11, 0.25)', '--step-hover-bg': '#fffbeb' } as React.CSSProperties}>
              <div className="journey-step-circle">
                <CheckCircle className="journey-step-icon" />
              </div>
              <div className="journey-step-label-container">
                <span className="journey-step-title">6. SELECTED</span>
                <span className="journey-step-desc">You're the Right Fit!</span>
              </div>
            </div>

            {/* Step 7 Node */}
            <div className="journey-step-node step-7" style={{ left: '89.5%', top: '5%', '--step-color': '#eab308', '--step-shadow': 'rgba(234, 179, 8, 0.25)', '--step-hover-bg': '#fefce8' } as React.CSSProperties}>
              <div className="journey-step-circle">
                <Trophy className="journey-step-icon" />
              </div>
              <div className="journey-step-label-container">
                <span className="journey-step-title">7. JOB ACHIEVED</span>
                <span className="journey-step-desc">New Beginning, Bright Future!</span>
              </div>
            </div>
          </div>

          {/* Bottom Trust Metrics Bar */}
          <div className="journey-bottom-trustbar">
            <div className="trustbar-metrics">
              <div className="trustbar-item">
                <div className="trustbar-icon-wrap">
                  <ShieldCheck size={20} />
                </div>
                <div className="trustbar-text">
                  <span className="trustbar-title">Verified Companies</span>
                  <span className="trustbar-desc">100% Trusted Partners</span>
                </div>
              </div>

              <div className="trustbar-item">
                <div className="trustbar-icon-wrap">
                  <Target size={20} />
                </div>
                <div className="trustbar-text">
                  <span className="trustbar-title">Right Opportunities</span>
                  <span className="trustbar-desc">For Your Dream Career</span>
                </div>
              </div>

              <div className="trustbar-item">
                <div className="trustbar-icon-wrap">
                  <GraduationCap size={20} />
                </div>
                <div className="trustbar-text">
                  <span className="trustbar-title">Career Guidance</span>
                  <span className="trustbar-desc">Expert Interview Coaching</span>
                </div>
              </div>

              <div className="trustbar-item">
                <div className="trustbar-icon-wrap">
                  <LineChart size={20} />
                </div>
                <div className="trustbar-text">
                  <span className="trustbar-title">Growth & Success</span>
                  <span className="trustbar-desc">Achieve Your Global Goals</span>
                </div>
              </div>
            </div>

            <div className="trustbar-logo-wrap">
              <div className="trustbar-brand">
                <div className="trustbar-brand-flex">
                  <div className="trustbar-gv-icon">GV</div>
                  <span className="trustbar-brand-name">GETWORX</span>
                </div>
                <span className="trustbar-brand-slogan">Your Journey. Our Mission.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CONDITIONAL PROFILE COMPLETION BANNER (Naukri Style) */}
      {profileCompletion < 100 && !loadingCompleteness && (
        <section className="profile-completion-section">
          <div className="naukri-profile-card">
            <div className="naukri-profile-info">
              <div className="naukri-profile-avatar">
                <UserCheck size={22} color="#ffffff" />
              </div>
              <div className="naukri-profile-text">
                <div className="naukri-profile-title">
                  Complete your profile to get 3x more recruiter calls
                </div>
                <div className="naukri-profile-subtitle">
                  {isAuthenticated 
                    ? `Welcome back${user?.name ? ', ' + user.name : ''}! Your profile is ${profileCompletion}% complete.`
                    : 'Sign in to add skills and get matched with top hiring managers.'}
                </div>
              </div>
            </div>

            <button 
              className="naukri-btn-complete"
              onClick={() => onNavigateTab(isAuthenticated ? 'profile' : 'login')}
            >
              <span>{isAuthenticated ? 'Complete Profile' : 'Sign In'}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </section>
      )}

      {/* MAIN DISCOVERY FEED CONTAINER */}
      <div className="candidate-feed-container">

        {/* 3. TOP COMPANIES HIRING NOW (Naukri Style Grid) */}
        <section className="jobs-section-block">
          <div className="section-header-clean">
            <div className="section-header-text">
              <h2 className="section-title-clean">Top companies hiring now</h2>
              <p className="section-desc-clean">
                Top global enterprises and high-growth companies actively recruiting talent.
              </p>
            </div>
            <button 
              type="button"
              className="btn-view-all-link"
              onClick={() => onNavigateTab('companies')}
            >
              <span>View all companies</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="naukri-companies-grid">
            {MOCK_GLOBAL_COMPANIES.slice(0, 4).map((comp) => (
              <div key={comp.id} className="naukri-company-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div className="naukri-comp-badge">
                    {comp.name[0]}
                  </div>
                  <div className="naukri-comp-details">
                    <div className="naukri-comp-name">{comp.name}</div>
                    <div className="naukri-comp-meta">
                      <span className="naukri-rating"><Star size={12} fill="#f59e0b" color="#f59e0b" /> {comp.rating}</span>
                      <span className="dot-sep">•</span>
                      <span>{comp.reviews} reviews</span>
                    </div>
                  </div>
                </div>
                <div className="naukri-comp-sector">{comp.sector}</div>
                <button 
                  type="button"
                  className="naukri-comp-view-btn"
                  onClick={() => {
                    setLocalTitle(comp.name);
                    setSearchQuery(comp.name);
                    onSearchSubmit(comp.name, '', localExperience);
                  }}
                >
                  View jobs
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 4. RECOMMENDED JOBS (Naukri Card Layout) */}
        <section className="jobs-section-block">
          <div className="section-header-clean">
            <div className="section-header-text">
              <div className="section-badge-inline">
                <Sparkles size={14} style={{ color: 'var(--color-primary)' }} />
                <span>Recommended for you</span>
              </div>
              <h2 className="section-title-clean">Jobs based on your interest</h2>
              <p className="section-desc-clean">
                Handpicked jobs matching your profile and search preferences.
              </p>
            </div>

            <button 
              type="button"
              className="btn-view-all-link"
              onClick={() => onNavigateTab('jobs')}
            >
              <span>View all recommendations</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="jobs-cards-grid">
            {recommendedJobs.length > 0 ? (
              recommendedJobs.map((job) => (
                <JobCard 
                  key={`rec-${job.id}`}
                  job={job}
                  currencyCode={activeCurrency}
                  onApplySuccess={handleApplySuccess}
                  isBookmarked={savedJobIds.includes(job.id)}
                  onBookmarkToggle={bookmarkCallbacks[job.id]}
                  hasApplied={appliedJobIds.includes(job.id)}
                />
              ))
            ) : (
              <div className="empty-discovery-state">
                <Briefcase size={32} style={{ color: 'var(--text-muted)' }} />
                <p>No job recommendations available at the moment.</p>
              </div>
            )}
          </div>
        </section>

        {/* 5. LATEST JOB OPENINGS */}
        <section className="jobs-section-block">
          <div className="section-header-clean">
            <div className="section-header-text">
              <div className="section-badge-inline">
                <TrendingUp size={14} style={{ color: '#10b981' }} />
                <span>Recently Posted</span>
              </div>
              <h2 className="section-title-clean">Latest Job Openings</h2>
              <p className="section-desc-clean">
                Fresh roles posted by actively hiring companies.
              </p>
            </div>

            <button 
              type="button"
              className="btn-view-all-link"
              onClick={() => onNavigateTab('jobs')}
            >
              <span>View all new jobs</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="jobs-cards-grid">
            {latestJobs.length > 0 ? (
              latestJobs.map((job) => (
                <JobCard 
                  key={`latest-${job.id}`}
                  job={job}
                  currencyCode={activeCurrency}
                  onApplySuccess={handleApplySuccess}
                  isBookmarked={savedJobIds.includes(job.id)}
                  onBookmarkToggle={bookmarkCallbacks[job.id]}
                  hasApplied={appliedJobIds.includes(job.id)}
                />
              ))
            ) : (
              <div className="empty-discovery-state">
                <Briefcase size={32} style={{ color: 'var(--text-muted)' }} />
                <p>No recent jobs posted yet.</p>
              </div>
            )}
          </div>
        </section>

      </div>

      {/* 6. RICH EXECUTIVE FOOTER */}
      <Footer onNavigateTab={onNavigateTab} />
    </div>
  );
};
