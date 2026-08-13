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
  Star
} from 'lucide-react';
import { JobCard, type Job } from './JobCard';
import { type CurrencyCode, CURRENCIES } from '../utils/currency';
import { MOCK_GLOBAL_COMPANIES } from '../data/jobsData';

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
    { label: 'Remote Jobs', query: 'Remote' },
    { label: 'MNCs', query: 'MNC' },
    { label: 'Software & Tech', query: 'Software' },
    { label: 'Startup Jobs', query: 'Startup' },
    { label: 'AI & Data', query: 'AI' },
    { label: 'Marketing', query: 'Marketing' }
  ];

  return (
    <div className="candidate-home-wrapper">
      {/* 1. HERO / SEARCH SECTION (Naukri.com Inspired 3-Field Search) */}
      <section className="naukri-hero-section">
        <div className="naukri-hero-backdrop" />
        
        {/* Floating Currency Selector */}
        <div style={{ 
          position: 'absolute', 
          top: '16px', 
          right: '24px', 
          zIndex: 10, 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px', 
          background: 'rgba(255, 255, 255, 0.95)', 
          padding: '6px 12px', 
          borderRadius: '20px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)', 
          border: '1px solid rgba(226, 232, 240, 0.8)' 
        }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Currency:</span>
          <select
            value={activeCurrency}
            onChange={(e) => setActiveCurrency(e.target.value as CurrencyCode)}
            style={{ 
              border: 'none', 
              background: 'none', 
              fontSize: '12px', 
              fontWeight: 800, 
              color: '#1E1B4B', 
              cursor: 'pointer', 
              outline: 'none', 
              paddingRight: '4px' 
            }}
          >
            {Object.values(CURRENCIES).map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.flag} {curr.code} ({curr.symbol})
              </option>
            ))}
          </select>
        </div>

        <div className="naukri-hero-container">
          <div className="naukri-hero-content">
            <span className="naukri-hero-badge">
              <Sparkles size={14} className="hero-sparkle-icon" />
              <span>India's & Global #1 Job Platform</span>
            </span>

            <h1 className="naukri-hero-heading">
              Find your dream job now
            </h1>

            <p className="naukri-hero-subheading">
              500,000+ jobs from top verified companies around the world
            </p>

            {/* 3-Field Unified Search Bar (Naukri Style) */}
            <form className="naukri-search-bar" onSubmit={handleFormSubmit}>
              {/* Field 1: Skills / Designations / Companies */}
              <div className="naukri-search-field">
                <Search size={18} className="naukri-field-icon" />
                <input 
                  type="text"
                  placeholder="Enter skills / designations / companies"
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
            <div className="naukri-collection-row">
              {popularSearches.map(item => (
                <button
                  key={item.label}
                  type="button"
                  className="naukri-collection-chip"
                  onClick={() => {
                    setLocalTitle(item.query);
                    setSearchQuery(item.query);
                    onSearchSubmit(item.query, localLocation, localExperience);
                  }}
                >
                  {item.label}
                </button>
              ))}
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
