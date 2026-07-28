import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FilterSidebar, type FilterState } from './components/FilterSidebar';
import { EmployerDashboard } from './components/EmployerDashboard';
import { RecruiterDashboard } from './components/recruiter/RecruiterDashboard';
import { JobCard, type Job } from './components/JobCard';
import { AIInterview } from './components/AIInterview';
import { ResumeChecker } from './components/ResumeChecker';
import { UserProfile } from './components/UserProfile';
import { RegistrationPage } from './components/RegistrationPage';
import { LoginPage } from './components/LoginPage';
import { GlobalHubsWidget } from './components/GlobalHubsWidget';
import { GlobalSalaryCalculator } from './components/GlobalSalaryCalculator';
import { CategoryExplorer } from './components/CategoryExplorer';
import { StatsBanner } from './components/StatsBanner';
import { GLOBAL_INITIAL_JOBS, MOCK_GLOBAL_COMPANIES } from './data/jobsData';
import { type CurrencyCode, type RegionCode } from './utils/currency';
import { type LangCode, getTranslation } from './utils/translate';
import { 
  Sparkles, 
  Search,
  ArrowRight,
  Award,
  Plane,
  ShieldCheck,
  Star
} from 'lucide-react';
import './App.css';

const initialFilterState: FilterState = {
  region: 'all',
  country: 'All Countries',
  state: 'All States / Provinces',
  city: 'All Cities',
  industry: 'All Industries',
  category: '',
  role: '',
  experience: 'all',
  salaryMin: 0,
  salaryMax: 250000,
  workModes: [],
  jobTypes: [],
  companyName: '',
  verifiedCompanyOnly: false,
  topEmployerOnly: false,
  selectedSkills: [],
  education: 'Any Education',
  visaOnly: false,
  relocationOnly: false,
  jobStatuses: [],
  postedDate: 'all',
  benefits: [],
  minAiMatchScore: 0
};

function App() {
  // Global Product States
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [activeCurrency, setActiveCurrency] = useState<CurrencyCode>('USD');
  const [activeRegion, setActiveRegion] = useState<RegionCode>('all');
  const [visaOnly, setVisaOnly] = useState(false);
  const [relocationOnly, setRelocationOnly] = useState(false);
  const [eorOnly, setEorOnly] = useState(false);
  const [activeLang, setActiveLang] = useState<LangCode>('en');

  // SaaS Filter State
  const [filters, setFilters] = useState<FilterState>(initialFilterState);

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  // Sync region and mobility toggles into main filters
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      region: activeRegion,
      visaOnly,
      relocationOnly
    }));
  }, [activeRegion, visaOnly, relocationOnly]);

  // Navigation State
  const [activeTab, setActiveTab] = useState('home');
  const [activeSubTab, setActiveSubTab] = useState('');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Database State
  const [jobsList] = useState<Job[]>(GLOBAL_INITIAL_JOBS);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>(['job-1', 'job-3']);

  const handleToggleSaveJob = (jobId: string) => {
    setSavedJobIds(prev => 
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  const handleApplySuccess = (jobId: string) => {
    setAppliedJobIds(prev => {
      if (prev.includes(jobId)) return prev;
      return [...prev, jobId];
    });
  };

  const handleSelectCategoryOrSub = (name: string) => {
    setFilters(prev => ({
      ...prev,
      category: name
    }));
    setActiveTab('jobs');
  };

  const handleResetFilters = () => {
    setFilters(initialFilterState);
    setActiveRegion('all');
    setVisaOnly(false);
    setRelocationOnly(false);
    setEorOnly(false);
    setActiveSubTab('');
    setSearchQuery('');
  };

  // Main Global Filter Logic (Supports all Visible & Advanced SaaS Filters)
  const getFilteredJobs = () => {
    return jobsList.filter((job) => {
      // 1. Search Query Match
      const matchesSearch = !searchQuery.trim() ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.clientLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // 2. Region Match
      const targetRegion = filters.region !== 'all' ? filters.region : activeRegion;
      const matchesRegion = targetRegion === 'all' || job.region === targetRegion;

      // 3. Country, State & City Match
      const matchesCountry = filters.country === 'All Countries' ||
        (job.countryName && job.countryName.toLowerCase() === filters.country.toLowerCase()) ||
        job.clientLocation.toLowerCase().includes(filters.country.toLowerCase());

      const matchesState = filters.state === 'All States / Provinces' ||
        (job.state && job.state.toLowerCase() === filters.state.toLowerCase()) ||
        job.clientLocation.toLowerCase().includes(filters.state.toLowerCase());

      const matchesCity = filters.city === 'All Cities' ||
        (job.city && job.city.toLowerCase() === filters.city.toLowerCase()) ||
        job.clientLocation.toLowerCase().includes(filters.city.toLowerCase());

      // 4. Industry, Category & Role Match
      let matchesIndustry = filters.industry === 'All Industries' ||
        job.category.toLowerCase().includes(filters.industry.toLowerCase()) ||
        (job.subcategory && job.subcategory.toLowerCase().includes(filters.industry.toLowerCase()));

      let matchesCategory = !filters.category ||
        job.category.toLowerCase().includes(filters.category.toLowerCase()) ||
        (job.subcategory && job.subcategory.toLowerCase().includes(filters.category.toLowerCase())) ||
        job.tags.some(t => t.toLowerCase().includes(filters.category.toLowerCase()));

      let matchesRole = !filters.role ||
        (job.role && job.role.toLowerCase().includes(filters.role.toLowerCase())) ||
        job.title.toLowerCase().includes(filters.role.toLowerCase());

      // Subtab Overrides
      if (activeSubTab) {
        const sub = activeSubTab.toLowerCase();
        if (sub === 'startup') {
          matchesCategory = (job.category || '').toLowerCase().includes('startup') || job.tags.some(t => t.toLowerCase().includes('startup'));
        } else if (sub === 'ai') {
          matchesCategory = (job.category || '').toLowerCase().includes('it') || (job.subcategory || '').toLowerCase().includes('ai') || job.tags.some(t => t.toLowerCase().includes('ai') || t.toLowerCase().includes('machine learning'));
        } else if (sub === 'internship') {
          matchesCategory = job.jobType === 'Internship';
        } else if (sub !== 'remote' && sub !== 'walkin') {
          matchesCategory = 
            job.category.toLowerCase().includes(sub) ||
            (job.subcategory && job.subcategory.toLowerCase().includes(sub)) ||
            job.tags.some(t => t.toLowerCase().includes(sub));
        }
      }

      // 5. Experience Match
      let matchesExperience = true;
      if (filters.experience !== 'all') {
        if (filters.experience === 'fresher') {
          matchesExperience = job.experience === 0;
        } else if (filters.experience === '1-3') {
          matchesExperience = job.experience >= 1 && job.experience <= 3;
        } else if (filters.experience === '3-5') {
          matchesExperience = job.experience >= 3 && job.experience <= 5;
        } else if (filters.experience === '5-8') {
          matchesExperience = job.experience >= 5 && job.experience <= 8;
        } else if (filters.experience === '8+') {
          matchesExperience = job.experience >= 8;
        }
      }

      // 6. Salary Range Match (USD)
      const jobMinSalary = job.minSalaryUSD ?? 0;
      const jobMaxSalary = job.maxSalaryUSD ?? job.minSalaryUSD ?? 250000;
      const matchesSalary = jobMaxSalary >= filters.salaryMin && jobMinSalary <= filters.salaryMax;

      // 7. Work Mode Match
      let matchesWorkMode = filters.workModes.length === 0 || filters.workModes.includes(job.workMode);
      if (activeSubTab === 'remote') {
        matchesWorkMode = job.workMode === 'Remote' || job.eorSupported === true;
      } else if (activeSubTab === 'walkin') {
        matchesWorkMode = job.workMode === 'In-office' || job.workMode === 'Hybrid';
      }

      // 8. Employment Type Match
      const matchesJobType = filters.jobTypes.length === 0 || filters.jobTypes.includes(job.jobType);

      // ================= ADVANCED FILTERS =================

      // Company Filters
      const matchesCompanyName = !filters.companyName ||
        job.clientName.toLowerCase().includes(filters.companyName.toLowerCase());

      const matchesVerifiedCompany = !filters.verifiedCompanyOnly || job.verifiedCompany === true;
      const matchesTopEmployer = !filters.topEmployerOnly || job.topEmployer === true;

      // Required Skills Match
      const matchesSkills = filters.selectedSkills.length === 0 ||
        filters.selectedSkills.some(sk => (job.skills || []).includes(sk) || job.tags.includes(sk));

      // Education Match
      const matchesEducation = filters.education === 'Any Education' ||
        !job.education || job.education === filters.education;

      // Visa & Relocation
      const matchesVisa = !(filters.visaOnly || visaOnly) || job.visaSponsorship === true;
      const matchesRelocation = !(filters.relocationOnly || relocationOnly) || job.relocation === true;
      const matchesEor = !eorOnly || job.eorSupported === true;

      // Job Status
      const matchesJobStatus = filters.jobStatuses.length === 0 ||
        filters.jobStatuses.some(st => (job.jobStatus || []).includes(st));

      // Posted Date
      let matchesPostedDate = true;
      if (filters.postedDate !== 'all' && job.postedDaysAgo !== undefined) {
        if (filters.postedDate === '24h') matchesPostedDate = job.postedDaysAgo <= 1;
        else if (filters.postedDate === '3d') matchesPostedDate = job.postedDaysAgo <= 3;
        else if (filters.postedDate === '7d') matchesPostedDate = job.postedDaysAgo <= 7;
        else if (filters.postedDate === '30d') matchesPostedDate = job.postedDaysAgo <= 30;
      }

      // Benefits
      const matchesBenefits = filters.benefits.length === 0 ||
        filters.benefits.some(b => (job.benefits || []).includes(b));

      // AI Match Score
      const matchesAiScore = filters.minAiMatchScore === 0 ||
        (job.aiMatchScore !== undefined && job.aiMatchScore >= filters.minAiMatchScore);

      return (
        matchesSearch && 
        matchesRegion && 
        matchesCountry &&
        matchesState &&
        matchesCity &&
        matchesIndustry &&
        matchesCategory && 
        matchesRole &&
        matchesExperience && 
        matchesSalary &&
        matchesWorkMode && 
        matchesJobType &&
        matchesCompanyName &&
        matchesVerifiedCompany &&
        matchesTopEmployer &&
        matchesSkills &&
        matchesEducation &&
        matchesVisa && 
        matchesRelocation && 
        matchesEor && 
        matchesJobStatus &&
        matchesPostedDate &&
        matchesBenefits &&
        matchesAiScore
      );
    });
  };

  const filteredJobs = getFilteredJobs();
  const appliedJobs = jobsList.filter(job => appliedJobIds.includes(job.id));

  return (
    <div className="app-container">
      {/* Background Animated Mesh */}
      <div className="bg-gradient-mesh" />

      {/* Top Global Navigation Bar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        activeSubTab={activeSubTab} 
        setActiveSubTab={setActiveSubTab} 
        theme={theme}
        setTheme={setTheme}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        jobsList={jobsList}
        activeCurrency={activeCurrency}
        setActiveCurrency={setActiveCurrency}
        activeRegion={activeRegion}
        setActiveRegion={setActiveRegion}
        visaOnly={visaOnly}
        setVisaOnly={setVisaOnly}
        activeLang={activeLang}
        setActiveLang={setActiveLang}
      />

      {/* Main Viewport Container */}
      <main style={{ flex: 1 }}>

        {/* View: Home */}
        {activeTab === 'home' && (
          <div style={{ padding: '40px', maxWidth: '1240px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '44px' }}>
            
            {/* Global Hero Banner */}
            <div className="dashboard-hero">
              <div className="hero-text">
                <span className="hero-badge">
                  <Sparkles size={13} style={{ marginRight: '6px', display: 'inline', verticalAlign: 'middle' }} />
                  Global Talent & Career Marketplace
                </span>
                <h1>{getTranslation(activeLang, 'hero_title')}</h1>
                <p>
                  {getTranslation(activeLang, 'hero_desc')}
                </p>
              </div>
              <div className="hero-image-wrapper">
                <img 
                  src="/global_hero_illustration.jpg" 
                  alt="Global Remote Tech Career Marketplace" 
                  className="hero-image"
                />
              </div>
            </div>

            {/* Quick Stats Banner */}
            <StatsBanner activeLang={activeLang} />

            {/* Interactive 33 Job Categories Explorer Widget */}
            <CategoryExplorer 
              selectedCategories={filters.category ? [filters.category] : []}
              onSelectCategory={handleSelectCategoryOrSub}
              activeCurrency={activeCurrency}
            />

            {/* Interactive Global Hiring Hotspots Section */}
            <GlobalHubsWidget 
              activeCurrency={activeCurrency}
              selectedRegion={activeRegion}
              onSelectRegion={(region) => {
                setActiveRegion(region);
                setFilters(prev => ({ ...prev, region }));
                setActiveTab('jobs');
              }}
            />

            {/* International Mobility Quick Filter Cards */}
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px' }}>Filter by International Perks</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                <div 
                  className="company-card"
                  onClick={() => {
                    setVisaOnly(true);
                    setFilters(prev => ({ ...prev, visaOnly: true }));
                    setActiveTab('jobs');
                  }}
                  style={{ gap: '8px', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Award size={18} style={{ color: '#8b5cf6' }} />
                      <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Visa Sponsorship</h3>
                    </div>
                    <span className="exam-tag">3,200+ roles</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Employers offering H1-B transfers, EU Blue Cards, and work visa assistance.
                  </p>
                </div>

                <div 
                  className="company-card"
                  onClick={() => {
                    setRelocationOnly(true);
                    setFilters(prev => ({ ...prev, relocationOnly: true }));
                    setActiveTab('jobs');
                  }}
                  style={{ gap: '8px', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Plane size={18} style={{ color: '#06b6d4' }} />
                      <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Relocation Package</h3>
                    </div>
                    <span className="exam-tag">1,850+ roles</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Flight tickets, temporary housing, and relocation allowances for top candidates.
                  </p>
                </div>

                <div 
                  className="company-card"
                  onClick={() => {
                    setEorOnly(true);
                    setActiveTab('jobs');
                  }}
                  style={{ gap: '8px', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={18} style={{ color: '#10b981' }} />
                      <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Work From Anywhere</h3>
                    </div>
                    <span className="exam-tag">Global Remote</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    Flexible global remote contracts across 150+ countries.
                  </p>
                </div>
              </div>
            </div>

            {/* Featured Global Job Openings */}
            <div>
              <div className="section-header">
                <div>
                  <h2 className="section-title">Featured Global Job Openings</h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Converted live into <strong>{activeCurrency}</strong> ({activeCurrency === 'USD' ? '$' : activeCurrency})
                  </p>
                </div>
                <button 
                  onClick={() => { setActiveTab('jobs'); setActiveSubTab(''); }} 
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                >
                  <span>Explore all global jobs</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              <div className="jobs-list">
                {jobsList.slice(0, 6).map((job) => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    currencyCode={activeCurrency}
                    onApplySuccess={handleApplySuccess} 
                    isBookmarked={savedJobIds.includes(job.id)}
                    onBookmarkToggle={() => handleToggleSaveJob(job.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* View: Dedicated 33 Job Categories Explorer */}
        {activeTab === 'categories' && (
          <div style={{ padding: '40px', maxWidth: '1240px', width: '100%', margin: '0 auto' }}>
            <CategoryExplorer 
              selectedCategories={filters.category ? [filters.category] : []}
              onSelectCategory={handleSelectCategoryOrSub}
              activeCurrency={activeCurrency}
            />
          </div>
        )}

        {/* View: Jobs Feed (with Redesigned SaaS Filter Sidebar) */}
        {activeTab === 'jobs' && (
          <div className="portal-layout">
            <FilterSidebar 
              filters={filters}
              onFilterChange={setFilters}
              onResetFilters={handleResetFilters}
              matchingCount={filteredJobs.length}
              activeLang={activeLang}
            />

            <div className="main-viewport">
              <div className="dashboard-header-bar">
                <div>
                  <h2 className="page-title">
                    {filters.category
                      ? `Category: ${filters.category}`
                      : filters.industry !== 'All Industries'
                      ? `Industry: ${filters.industry}`
                      : activeSubTab === 'remote' ? 'Remote Jobs Feed'
                      : activeSubTab === 'startup' ? 'Startup Jobs'
                      : activeSubTab === 'ai' ? 'AI & Machine Learning Jobs'
                      : activeSubTab === 'internship' ? 'Internships & Trainee Positions'
                      : activeSubTab === 'walkin' ? 'Walk-in & In-Office Jobs'
                      : activeSubTab ? `${activeSubTab.toUpperCase()} Positions` : 'Global Openings Feed'}
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Showing {filteredJobs.length} verified jobs. Displaying compensation in <strong>{activeCurrency}</strong>.
                  </p>
                </div>
                
                {/* Search input in job feed */}
                <div className="header-search" style={{ width: '280px' }}>
                  <Search size={14} className="text-secondary" />
                  <input 
                    type="text" 
                    placeholder="Search openings..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="jobs-list">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <JobCard 
                      key={job.id} 
                      job={job} 
                      currencyCode={activeCurrency}
                      onApplySuccess={handleApplySuccess} 
                      isBookmarked={savedJobIds.includes(job.id)}
                      onBookmarkToggle={() => handleToggleSaveJob(job.id)}
                    />
                  ))
                ) : (
                  <div className="empty-state">
                    <Search size={36} style={{ color: 'var(--text-muted)' }} />
                    <div className="empty-state-title">No matching global jobs found</div>
                    <p style={{ fontSize: '14px' }}>Try adjusting your region or filter preferences.</p>
                    <button className="btn-outline" onClick={handleResetFilters}>
                      Reset All Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* View: Companies */}
        {activeTab === 'companies' && (
          <div style={{ padding: '40px', maxWidth: '1240px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div>
              <h2 className="page-title">Verified International Employers</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Discover global tech enterprises, check headquarters, and view visa sponsorship details.
              </p>
            </div>

            <div className="companies-grid">
              {MOCK_GLOBAL_COMPANIES.map((company) => (
                <div key={company.id} className="company-card">
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div className="company-logo-badge">
                      {company.name[0]}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{company.name}</h3>
                        <span style={{ fontSize: '16px' }}>{company.countryFlag}</span>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: '600' }}>{company.sector}</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    <div>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>Location</span>
                      <span>{company.location}</span>
                    </div>
                    <div>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>Global Size</span>
                      <span>{company.size}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-warning)', fontWeight: '700', fontSize: '13px' }}>
                      <Star size={14} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                      <span>{company.rating}</span>
                      <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>({company.reviews})</span>
                    </div>
                    <button 
                      className="btn-outline" 
                      style={{ padding: '6px 12px', fontSize: '12px' }} 
                      onClick={() => {
                        setSearchQuery(company.name);
                        setActiveTab('jobs');
                      }}
                    >
                      View Jobs
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View: AI Services / Resources */}
        {activeTab === 'resources' && (
          <div style={{ padding: '40px', maxWidth: '1100px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {activeSubTab === 'score-checker' ? (
              <ResumeChecker />
            ) : activeSubTab === 'salary-calc' ? (
              <GlobalSalaryCalculator activeCurrency={activeCurrency} />
            ) : activeSubTab === 'mock-interview' ? (
              <AIInterview />
            ) : (
              // AI Services Landing
              <>
                <div>
                  <h2 className="page-title">Global AI Career Suite</h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    AI-powered tools for cross-border recruitment, resume scoring, and interview preparation.
                  </p>
                </div>

                <div className="companies-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                  <div className="company-card" style={{ gap: '12px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--color-primary)' }}>Global PPP Salary Estimator</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Compare purchasing power, local taxes, and net take-home salary across 10 major global tech hubs.
                    </p>
                    <button className="btn-primary" style={{ marginTop: 'auto', padding: '8px 14px', fontSize: '12px' }} onClick={() => setActiveSubTab('salary-calc')}>
                      Launch Estimator
                    </button>
                  </div>

                  <div className="company-card" style={{ gap: '12px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--color-primary)' }}>Global ATS Resume Checker</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Benchmark your resume against US, EU, and Asian ATS parsers for 95%+ pass rates.
                    </p>
                    <button className="btn-primary" style={{ marginTop: 'auto', padding: '8px 14px', fontSize: '12px' }} onClick={() => setActiveSubTab('score-checker')}>
                      Check Resume Score
                    </button>
                  </div>

                  <div className="company-card" style={{ gap: '12px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--color-primary)' }}>AI Mock Technical Interview</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Practice domain-specific technical questions with instant grading and recruiter feedback.
                    </p>
                    <button className="btn-primary" style={{ marginTop: 'auto', padding: '8px 14px', fontSize: '12px' }} onClick={() => setActiveSubTab('mock-interview')}>
                      Start AI Interview
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* View: Profile */}
        {activeTab === 'profile' && (
          <div style={{ padding: '40px', maxWidth: '1100px', width: '100%', margin: '0 auto' }}>
            <UserProfile 
              appliedJobs={appliedJobs}
              jobsList={jobsList}
              activeSubTab={activeSubTab}
              setActiveSubTab={setActiveSubTab}
              onApplySuccess={handleApplySuccess}
              savedJobIds={savedJobIds}
              onToggleSaveJob={handleToggleSaveJob}
            />
          </div>
        )}

        {/* View: Employer Dashboard */}
        {activeTab === 'employer' && (
          <EmployerDashboard activeTab={activeSubTab || 'overview'} setActiveTab={setActiveSubTab} />
        )}

        {/* View: Recruiter Dashboard */}
        {activeTab === 'recruiter' && (
          <RecruiterDashboard 
            activeTab={activeSubTab || 'dashboard'} 
            setActiveTab={setActiveSubTab} 
            exitPortal={() => setActiveTab('home')}
          />
        )}

        {/* View: Registration */}
        {activeTab === 'register' && (
          <RegistrationPage 
            onRegisterSuccess={() => {
              setActiveTab('profile');
              setActiveSubTab('dashboard');
            }}
            onNavigateLogin={() => {
              setActiveTab('login');
            }}
          />
        )}

        {/* View: Login */}
        {activeTab === 'login' && (
          <LoginPage 
            onLoginSuccess={() => {
              setActiveTab('profile');
              setActiveSubTab('dashboard');
            }}
            onNavigateRegister={() => {
              setActiveTab('register');
            }}
          />
        )}

      </main>
    </div>
  );
}

export default App;
