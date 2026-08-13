import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';

import { 
  Star, 
  MapPin, 
  CheckCircle, 
  Clock, 
  Briefcase, 
  Globe, 
  Plane, 
  ShieldCheck, 
  Award,
  Bookmark
} from 'lucide-react';
import { formatSalaryRange, type CurrencyCode } from '../utils/currency';

export interface Job {
  id: string;
  title: string;
  clientName: string;
  clientRating: number;
  clientLocation: string;
  countryCode?: string;
  countryFlag?: string;
  countryName?: string;
  region?: 'na' | 'eu' | 'apac' | 'sa' | 'latam' | 'mea' | string;
  city?: string;
  state?: string;
  minSalaryUSD?: number;
  maxSalaryUSD?: number | null;
  budget: string;
  description: string;
  tags: string[];
  postedTime: string;
  postedDaysAgo?: number;
  workMode: 'Hybrid' | 'Remote' | 'In-office';
  category: string;
  subcategory?: string;
  role?: string;
  experience: number; // 0 = Fresher, 1 = 1 year, etc.
  jobType: 'Full Time' | 'Part Time' | 'Contract' | 'Internship' | 'Freelance';
  visaSponsorship?: boolean;
  relocation?: boolean;
  eorSupported?: boolean;
  timezone?: string;
  // SaaS Filter Fields
  verifiedCompany?: boolean;
  topEmployer?: boolean;
  skills?: string[];
  education?: string;
  jobStatus?: string[];
  benefits?: string[];
  aiMatchScore?: number;
  screening_questions?: ScreeningQuestion[];
  created_at?: string;
}

export interface ScreeningQuestion {
  id: number;
  question_text: string;
  question_type: string;
  options_json?: string;
  is_mandatory: boolean;
  is_knockout: boolean;
  preferred_answer?: string;
  display_order: number;
}

interface JobCardProps {
  job: Job;
  currencyCode?: CurrencyCode;
  onApplySuccess?: (jobId: string) => void;
  isBookmarked?: boolean;
  onBookmarkToggle?: () => void;
  hasApplied?: boolean;
}

export const JobCard: React.FC<JobCardProps> = memo(({ 
  job, 
  currencyCode = 'USD', 
  onApplySuccess: _onApplySuccess,
  isBookmarked = false,
  onBookmarkToggle,
  hasApplied = false
}: JobCardProps) => {
  const navigate = useNavigate();
  const [applied, setApplied] = useState(hasApplied);

  useEffect(() => {
    setApplied(hasApplied);
  }, [hasApplied]);

  // Decode role from JWT payload — avoids localStorage role key which is never written
  const getTokenRole = useCallback((): string | null => {
    try {
      const token = localStorage.getItem('getworxs_access_token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return (payload.role || payload.user_role || '').toUpperCase();
    } catch { return null; }
  }, []);

  const handleApplyClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (applied) return;

    const token = localStorage.getItem('getworxs_access_token');
    if (!token) {
      alert('Please log in to apply for jobs.');
      return;
    }

    const role = getTokenRole();
    if (role && role !== 'CANDIDATE') {
      alert('Only Candidate accounts can apply for jobs.');
      return;
    }

    // Navigate to dedicated full-page apply route — zero overlay, preserves history
    navigate(`/candidate/jobs/${job.id}/apply`);
  }, [applied, job.id, getTokenRole, navigate]);


  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Deterministic avatar gradient generator based on company name
  const getAvatarGradient = (name: string) => {
    const gradients = [
      'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', // Indigo/Purple
      'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)', // Sky/Cyan
      'linear-gradient(135deg, #059669 0%, #10b981 100%)', // Emerald
      'linear-gradient(135deg, #7c3aed 0%, #c084fc 100%)', // Violet
      'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)', // Amber
      'linear-gradient(135deg, #e11d48 0%, #f43f5e 100%)'  // Rose
    ];
    let charSum = 0;
    for (let i = 0; i < name.length; i++) charSum += name.charCodeAt(i);
    return gradients[charSum % gradients.length];
  };

  // Get pastel tag color scheme
  const getTagStyle = (tagText: string, index: number) => {
    const tagStyles = [
      { bg: 'var(--tag-indigo-bg)', color: 'var(--tag-indigo-text)', border: 'var(--tag-indigo-border)' },
      { bg: 'var(--tag-cyan-bg)', color: 'var(--tag-cyan-text)', border: 'var(--tag-cyan-border)' },
      { bg: 'var(--tag-emerald-bg)', color: 'var(--tag-emerald-text)', border: 'var(--tag-emerald-border)' },
      { bg: 'var(--tag-amber-bg)', color: 'var(--tag-amber-text)', border: 'var(--tag-amber-border)' },
      { bg: 'var(--tag-purple-bg)', color: 'var(--tag-purple-text)', border: 'var(--tag-purple-border)' },
      { bg: 'var(--tag-rose-bg)', color: 'var(--tag-rose-text)', border: 'var(--tag-rose-border)' }
    ];
    let sum = 0;
    for (let i = 0; i < tagText.length; i++) sum += tagText.charCodeAt(i);
    const styleObj = tagStyles[(sum + index) % tagStyles.length];
    return {
      backgroundColor: styleObj.bg,
      color: styleObj.color,
      borderColor: styleObj.border
    };
  };

  // Compute dynamic salary string if numeric values are present
  const displaySalary = job.budget || (job.minSalaryUSD 
    ? formatSalaryRange(job.minSalaryUSD, job.maxSalaryUSD || null, job.jobType, currencyCode)
    : 'Competitive');

  return (
    <div className="job-card">
      {/* Redesigned Clean Header Row */}
      <div className="job-card-top-row">
        <div 
          className="client-logo"
          style={{ 
            background: getAvatarGradient(job.clientName), 
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
            border: 'none',
            fontWeight: '700',
            fontSize: '15px'
          }}
        >
          {getInitials(job.clientName)}
        </div>

        <div className="job-title-block">
          <div className="job-title-row">
            <h3 className="job-title">{job.title}</h3>
            {job.countryFlag && (
              <span style={{ fontSize: '15px' }} title={`Located in ${job.clientLocation}`}>
                {job.countryFlag}
              </span>
            )}
          </div>

          <div className="client-info">
            <span className="client-name">{job.clientName}</span>
            <span className="info-dot">•</span>
            <div className="client-rating">
              <Star size={13} fill="#f59e0b" style={{ color: '#f59e0b' }} />
              <span>{job.clientRating.toFixed(1)}</span>
            </div>
            <span className="info-dot">•</span>
            <span className="client-location">
              <MapPin size={13} />
              {job.clientLocation}
            </span>
          </div>
        </div>

        {onBookmarkToggle && (
          <button 
            className="job-bookmark-btn"
            onClick={(e) => {
              e.stopPropagation();
              onBookmarkToggle();
            }}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: isBookmarked ? '#ef4444' : 'var(--text-muted)', 
              cursor: 'pointer', 
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
            title={isBookmarked ? "Remove Bookmark" : "Bookmark Job"}
          >
            <Bookmark size={19} fill={isBookmarked ? "#ef4444" : "none"} />
          </button>
        )}
      </div>

      {/* Compact Executive Salary & Employment Type Pill Tag Row */}
      <div className="job-salary-highlight-row">
        <span className="salary-amount-pill">
          {displaySalary}
        </span>
        <span className="job-type-pill">{job.jobType}</span>
      </div>

      <p className="job-description">{job.description}</p>

      {/* Global Mobility & Compliance Perks Row */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        {job.visaSponsorship && (
          <span className="global-badge visa">
            <Award size={12} /> Visa Sponsored
          </span>
        )}
        {job.relocation && (
          <span className="global-badge relocation">
            <Plane size={12} /> Relocation Package
          </span>
        )}
        {job.eorSupported && (
          <span className="global-badge eor">
            <ShieldCheck size={12} /> Global Remote Hire
          </span>
        )}
        {job.timezone && (
          <span className="global-badge timezone">
            <Globe size={12} /> {job.timezone}
          </span>
        )}
      </div>

      {/* Styled Tag Groups */}
      <div className="job-tags-group">
        <span 
          className="job-tag-badge" 
          style={{ 
            backgroundColor: 'var(--tag-cyan-bg)', 
            color: 'var(--tag-cyan-text)', 
            borderColor: 'var(--tag-cyan-border)' 
          }}
        >
          <Briefcase size={11} style={{ marginRight: '4px' }} />
          {job.workMode}
        </span>
        <span 
          className="job-tag-badge" 
          style={{ 
            backgroundColor: 'var(--tag-indigo-bg)', 
            color: 'var(--tag-indigo-text)', 
            borderColor: 'var(--tag-indigo-border)' 
          }}
        >
          {job.experience === 0 ? 'Fresher (0 Yrs)' : `${job.experience} Yrs Exp`}
        </span>
        <span 
          className="job-tag-badge" 
          style={{ 
            backgroundColor: 'var(--tag-purple-bg)', 
            color: 'var(--tag-purple-text)', 
            borderColor: 'var(--tag-purple-border)' 
          }}
        >
          {job.category}
        </span>
        {job.tags.map((tag, idx) => {
          const tStyle = getTagStyle(tag, idx);
          return (
            <span key={tag} className="job-tag-badge" style={tStyle}>
              {tag}
            </span>
          );
        })}
      </div>

      <div className="job-footer">
        <span className="job-posted-time">
          <Clock size={12} style={{ display: 'inline-block', verticalAlign: '-1px', marginRight: '4px' }} />
          Posted {job.postedTime}
        </span>
        
        <button 
          className={`btn-apply ${applied ? 'applied' : ''}`}
          onClick={handleApplyClick}
        >
          {applied ? (
            <>
              <CheckCircle size={15} />
              <span>Applied</span>
            </>
          ) : (
            'Apply Now'
          )}
        </button>
      </div>
    </div>
  );
});
