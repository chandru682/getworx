import React, { useState } from 'react';
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
}

interface JobCardProps {
  job: Job;
  currencyCode?: CurrencyCode;
  onApplySuccess?: (jobId: string) => void;
  isBookmarked?: boolean;
  onBookmarkToggle?: (e: React.MouseEvent) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  currencyCode = 'USD', 
  onApplySuccess,
  isBookmarked = false,
  onBookmarkToggle
}) => {
  const [applied, setApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (applied) return;
    
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      setApplied(true);
      if (onApplySuccess) {
        onApplySuccess(job.id);
      }
    }, 700);
  };

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
  const displaySalary = job.minSalaryUSD 
    ? formatSalaryRange(job.minSalaryUSD, job.maxSalaryUSD || null, job.jobType, currencyCode)
    : job.budget;

  return (
    <div className="job-card">
      {/* Global Product Header */}
      <div className="job-header">
        <div className="job-meta-left">
          <div 
            className="client-logo"
            style={{ 
              background: getAvatarGradient(job.clientName), 
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              border: 'none',
              fontWeight: '700',
              fontSize: '15px'
            }}
          >
            {getInitials(job.clientName)}
          </div>
          <div className="job-title-wrapper">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 className="job-title">{job.title}</h3>
              {job.countryFlag && (
                <span style={{ fontSize: '16px' }} title={`Located in ${job.clientLocation}`}>
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
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div className="job-budget">
            <span className="budget-amount">{displaySalary}</span>
            <span className="budget-type">{job.jobType}</span>
          </div>
          {onBookmarkToggle && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onBookmarkToggle(e);
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
                marginTop: '2px'
              }}
              title={isBookmarked ? "Remove Bookmark" : "Bookmark Job"}
            >
              <Bookmark size={20} fill={isBookmarked ? "#ef4444" : "none"} />
            </button>
          )}
        </div>
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
          onClick={handleApply}
          disabled={isApplying}
        >
          {isApplying ? (
            <span className="spinner" />
          ) : applied ? (
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
};
