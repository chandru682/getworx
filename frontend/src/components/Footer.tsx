import React from 'react';
import { 
  Globe, 
  Send, 
  ShieldCheck, 
  Share2,
  Mail,
  ExternalLink,
  Award,
  Lock,
  Heart
} from 'lucide-react';
import { GetWorxsLogo } from './GetWorxsLogo';

interface FooterProps {
  onNavigateTab: (tab: string, subTab?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTab }) => {
  return (
    <footer className="getworxs-footer">
      {/* 1. TOP NEWSLETTER / BRAND ROW */}
      <div className="footer-top-bar">
        <div className="footer-container">
          <div className="footer-brand-summary">
            <div className="footer-logo-wrapper" onClick={() => onNavigateTab('home')}>
              <GetWorxsLogo size="md" />
            </div>
            <p className="footer-tagline">
              Connecting top tech talent and global enterprises through AI-powered recruitment, seamless EOR compliance, and international mobility.
            </p>
          </div>

          <div className="footer-newsletter-box">
            <div className="newsletter-text">
              <span className="newsletter-title">Subscribe to daily job alerts</span>
              <span className="newsletter-subtitle">Get matched opportunities directly in your inbox</span>
            </div>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="newsletter-input"
                required
              />
              <button type="submit" className="newsletter-btn">
                <span>Subscribe</span>
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 2. MAIN 4-COLUMN NAVIGATION LINKS */}
      <div className="footer-main-links">
        <div className="footer-container footer-grid-4">
          {/* Column 1: For Job Seekers */}
          <div className="footer-col">
            <h4 className="footer-col-title">For Job Seekers</h4>
            <ul className="footer-link-list">
              <li><button type="button" onClick={() => onNavigateTab('jobs')}>Search All Jobs</button></li>
              <li><button type="button" onClick={() => onNavigateTab('home')}>Recommended Jobs</button></li>
              <li><button type="button" onClick={() => onNavigateTab('companies')}>Browse Top Companies</button></li>
              <li><button type="button" onClick={() => onNavigateTab('resume-checker')}>AI Resume Checker</button></li>
              <li><button type="button" onClick={() => onNavigateTab('salary-calculator')}>Global Salary Calculator</button></li>
              <li><button type="button" onClick={() => onNavigateTab('categories')}>Job Categories Explorer</button></li>
            </ul>
          </div>

          {/* Column 2: For Employers & Recruiters */}
          <div className="footer-col">
            <h4 className="footer-col-title">For Employers</h4>
            <ul className="footer-link-list">
              <li><button type="button" onClick={() => onNavigateTab('employer-portal')}>Post a Job Opening</button></li>
              <li><button type="button" onClick={() => onNavigateTab('recruiter-console')}>Recruiter Dashboard</button></li>
              <li><button type="button" onClick={() => onNavigateTab('employer-portal')}>Employer Portal</button></li>
              <li><button type="button" onClick={() => onNavigateTab('ai-interview')}>AI Video Interviews</button></li>
              <li><button type="button" onClick={() => onNavigateTab('employer-portal')}>Global EOR & Visa Mobility</button></li>
              <li><button type="button" onClick={() => onNavigateTab('employer-portal')}>Pricing & Enterprise Plans</button></li>
            </ul>
          </div>

          {/* Column 3: Top Locations & Hubs */}
          <div className="footer-col">
            <h4 className="footer-col-title">Top Locations & Hubs</h4>
            <ul className="footer-link-list">
              <li><button type="button" onClick={() => onNavigateTab('jobs')}>Jobs in Bangalore</button></li>
              <li><button type="button" onClick={() => onNavigateTab('jobs')}>Jobs in Hyderabad</button></li>
              <li><button type="button" onClick={() => onNavigateTab('jobs')}>Jobs in Mumbai & Delhi NCR</button></li>
              <li><button type="button" onClick={() => onNavigateTab('jobs')}>Jobs in United States</button></li>
              <li><button type="button" onClick={() => onNavigateTab('jobs')}>Global Remote Jobs</button></li>
              <li><button type="button" onClick={() => onNavigateTab('jobs')}>Visa Sponsorship Jobs</button></li>
            </ul>
          </div>

          {/* Column 4: Platform & Support */}
          <div className="footer-col">
            <h4 className="footer-col-title">Platform & Support</h4>
            <ul className="footer-link-list">
              <li><button type="button" onClick={() => onNavigateTab('home')}>About GetWorxs</button></li>
              <li><button type="button" onClick={() => onNavigateTab('home')}>Careers at GetWorxs</button></li>
              <li><button type="button" onClick={() => onNavigateTab('home')}>Trust & Security Center</button></li>
              <li><button type="button" onClick={() => onNavigateTab('home')}>Privacy Policy</button></li>
              <li><button type="button" onClick={() => onNavigateTab('home')}>Terms of Service</button></li>
              <li><button type="button" onClick={() => onNavigateTab('home')}>24/7 Help & Support</button></li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. BOTTOM LEGAL & COMPLIANCE BAR */}
      <div className="footer-bottom-bar">
        <div className="footer-container footer-bottom-flex">
          <div className="footer-copyright">
            <span>© 2026 GetWorxs Inc. All rights reserved.</span>
            <span className="footer-sep">•</span>
            <span className="footer-sub-text">Built with <Heart size={12} fill="#ef4444" color="#ef4444" className="heart-icon" /> for global talent.</span>
          </div>

          <div className="footer-security-badges">
            <span className="sec-badge"><ShieldCheck size={14} color="#10b981" /> SOC-2 Type II</span>
            <span className="sec-badge"><Lock size={14} color="#0284c7" /> ISO 27001</span>
            <span className="sec-badge"><Award size={14} color="#8b5cf6" /> GDPR Compliant</span>
          </div>

          <div className="footer-social-links">
            <a href="#" onClick={(e) => e.preventDefault()} title="Global Network"><Globe size={18} /></a>
            <a href="#" onClick={(e) => e.preventDefault()} title="Share GetWorxs"><Share2 size={18} /></a>
            <a href="#" onClick={(e) => e.preventDefault()} title="Contact Us"><Mail size={18} /></a>
            <a href="#" onClick={(e) => e.preventDefault()} title="Portal Link"><ExternalLink size={18} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};
