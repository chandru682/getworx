import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import { Navbar } from './components/Navbar';
import { FilterSidebar, type FilterState } from './components/FilterSidebar';
import { EmployerDashboard } from './components/EmployerDashboard';
import { RecruiterDashboard } from './components/recruiter/RecruiterDashboard';
import AdminConsole from './components/admin/AdminConsole';
import { JobCard, type Job } from './components/JobCard';
import { CandidateHome } from './components/CandidateHome';
import { AIInterview } from './components/AIInterview';
import { ResumeChecker } from './components/ResumeChecker';
import { UserProfile } from './components/UserProfile';
import { RegistrationPage } from './components/RegistrationPage';
import { LoginPage } from './components/LoginPage';
import { EmployerAuthPage } from './components/EmployerAuthPage';
import { RecruiterLoginPage } from './components/recruiter/RecruiterLoginPage';
import { AdminLoginPage } from './components/admin/AdminLoginPage';
import { GlobalSalaryCalculator } from './components/GlobalSalaryCalculator';
import { CategoryExplorer } from './components/CategoryExplorer';
import { MOCK_GLOBAL_COMPANIES } from './data/jobsData';
import { type CurrencyCode, type RegionCode } from './utils/currency';
import { type LangCode } from './utils/translate';
import { Search, Star } from 'lucide-react';
import './App.css';

// Lazy-loaded dedicated Apply Job page — only loaded when user clicks Apply
const ApplyJobPage = lazy(() => import('./pages/ApplyJobPage'));


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
  const [activeCurrency, setActiveCurrency] = useState<CurrencyCode>('INR');
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

  // Authentication State
  const [user, setUser] = useState<any>(null);
  const [, setToken] = useState<string | null>(() => localStorage.getItem('getworxs_access_token'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [, setAuthLoading] = useState<boolean>(true);

  // Restore Auth Session on Mount & Token Change
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('getworxs_access_token');
      if (!storedToken) {
        setIsAuthenticated(false);
        setUser(null);
        setAuthLoading(false);
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      try {
        const res = await fetch(`${API_URL}/api/v1/auth/me`, {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            const normalizedRole = String(data.data.role || 'candidate').toUpperCase();
            const normalizedUserData = { ...data.data, role: normalizedRole };
            setUser(normalizedUserData);
            setIsAuthenticated(true);
            setToken(storedToken);
          } else {
            handleLogout();
          }
        } else {
          handleLogout();
        }
      } catch (err) {
        console.warn('Failed to restore session:', err);
        handleLogout();
      } finally {
        setAuthLoading(false);
      }
    };
    restoreSession();
  }, []);

  const location = useLocation();

  // Sync URL route with activeTab
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.startsWith('/admin')) {
      setActiveTab('admin');
    } else if (path.startsWith('/employer/login') || path.startsWith('/employer-auth') || path.startsWith('/for-employers')) {
      setActiveTab('employer-auth');
    } else if (path.startsWith('/employer')) {
      setActiveTab('employer');
    } else if (path.startsWith('/recruiter/login')) {
      setActiveTab('recruiter-login');
    } else if (path.startsWith('/recruiter')) {
      setActiveTab('recruiter');
    } else if (path.startsWith('/profile') || path.startsWith('/candidate')) {
      setActiveTab('profile');
    } else if (path.startsWith('/jobs')) {
      setActiveTab('jobs');
    } else if (path.startsWith('/companies')) {
      setActiveTab('companies');
    } else if (path.startsWith('/resources')) {
      setActiveTab('resources');
    } else if (path.startsWith('/login')) {
      setActiveTab('login');
    } else if (path.startsWith('/register')) {
      setActiveTab('register');
    }
  }, [location.pathname]);


  const handleLoginSuccess = (loginResponseData: any) => {
    const responseData = loginResponseData?.data ? loginResponseData.data : loginResponseData;
    const accessToken = responseData?.access_token || responseData?.token || loginResponseData?.access_token || loginResponseData?.token;
    const userData = responseData?.user || responseData;

    if (accessToken) {
      localStorage.setItem('getworxs_access_token', accessToken);
      setToken(accessToken);
    }

    if (userData) {
      const normalizedRole = String(userData.role || 'candidate').toUpperCase();
      const normalizedUserData = { ...userData, role: normalizedRole };

      setUser(normalizedUserData);
      setIsAuthenticated(true);
      
      if (normalizedRole === 'ADMIN' || normalizedRole === 'PLATFORM_ADMIN') {
        setActiveTab('admin');
      } else if (normalizedRole === 'EMPLOYER') {
        setActiveTab('employer');
        setActiveSubTab('overview');
      } else if (normalizedRole === 'RECRUITER') {
        setActiveTab('recruiter');
        setActiveSubTab('dashboard');
      } else {
        setActiveTab('profile');
        setActiveSubTab('dashboard');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('getworxs_access_token');
    localStorage.removeItem('getworxs_user');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setActiveTab('home');
  };

  // Navigation State
  const [activeTab, setActiveTab] = useState('home');
  const [activeSubTab, setActiveSubTab] = useState('');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Database State
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const triggerGlobalRefresh = () => setRefreshTrigger(prev => prev + 1);

  const [jobsList, setJobsList] = useState<Job[]>([]);
  const [dbStats, setDbStats] = useState<{ live_jobs: number; hiring_companies: number; registered_candidates: number; countries: number }>({
    live_jobs: 0,
    hiring_companies: 0,
    registered_candidates: 0,
    countries: 0
  });

  useEffect(() => {
    const fetchPublicStats = async () => {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      try {
        const res = await fetch(`${API_URL}/api/v1/admin/public-stats`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setDbStats(data.data);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch public DB stats:', err);
      }
    };
    fetchPublicStats();
  }, [refreshTrigger]);

  useEffect(() => {
    const fetchJobs = async () => {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('limit', '500');
        if (searchQuery) queryParams.append('search', searchQuery);
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.role) queryParams.append('role', filters.role);
        if (filters.region && filters.region !== 'all') queryParams.append('region', filters.region);
        if (filters.country && filters.country !== 'All Countries') queryParams.append('country', filters.country);
        if (filters.state && filters.state !== 'All States / Provinces') queryParams.append('state', filters.state);
        if (filters.city && filters.city !== 'All Cities') queryParams.append('city', filters.city);
        if (filters.workModes && filters.workModes.length > 0) queryParams.append('work_mode', filters.workModes[0]);
        if (filters.jobTypes && filters.jobTypes.length > 0) queryParams.append('job_type', filters.jobTypes[0]);
        
        const queryString = queryParams.toString();
        const fetchUrl = `${API_URL}/api/v1/jobs/search?${queryString}`;
        const res = await fetch(fetchUrl);
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
              region: j.region || 'all',
              city: j.city,
              state: j.state,
              country: j.country,
              countryName: j.country,
              salaryCurrency: j.salary_currency || 'INR',
              minSalary: j.salary_min || 0,
              maxSalary: j.salary_max || null,
              minSalaryUSD: j.salary_min || 0,
              maxSalaryUSD: j.salary_max || 250000,
              budget: j.salary_min ? `${j.salary_currency === 'INR' || !j.salary_currency ? '₹' : '$'}${j.salary_min.toLocaleString()} - ${j.salary_currency === 'INR' || !j.salary_currency ? '₹' : '$'}${j.salary_max ? j.salary_max.toLocaleString() : ''}/yr` : 'Competitive',
              description: j.summary || 'Premium global role offering competitive benefits and cross-border career path.',
              tags: j.skills_json ? (typeof j.skills_json === 'string' ? JSON.parse(j.skills_json) : j.skills_json) : ['Tech', 'Hiring'],
              postedTime: j.created_at ? new Date(j.created_at).toLocaleDateString() : 'Today',
              workMode: j.work_mode || 'Remote',
              category: j.department || 'Technology',
              experience: j.experience_min || 2,
              jobType: j.employment_type || 'Full Time',
              visaSponsorship: true,
              relocation: true,
              eorSupported: true,
              verifiedCompany: true,
              topEmployer: true,
              status: j.status,
              created_at: j.created_at,
              employer_id: j.employer_id || j.created_by_id,
              company_id: j.company_id,
              screening_questions: j.screening_questions || []
            }));
            console.log("Jobs received from API (Candidate Portal):", data.data.items);
            setJobsList(mapped);
          }
        }
      } catch (err) {
        console.warn('Error fetching jobs:', err);
      }
    };
    fetchJobs();
  }, [searchQuery, filters, activeRegion, refreshTrigger, activeTab]);

  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      if (!isAuthenticated || !user || user.role !== 'CANDIDATE') {
        setAppliedJobIds([]);
        return;
      }
      const tokenStr = localStorage.getItem('getworxs_access_token');
      if (!tokenStr) return;
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      try {
        const res = await fetch(`${API_URL}/api/v1/applications?limit=100`, {
          headers: { 'Authorization': `Bearer ${tokenStr}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data && Array.isArray(data.data.items)) {
            const ids = data.data.items.map((app: any) => String(app.job_id));
            setAppliedJobIds(ids);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch applied jobs:', err);
      }
    };
    fetchAppliedJobs();
  }, [isAuthenticated, user, refreshTrigger]);

  const handleToggleSaveJob = useCallback((jobId: string) => {
    setSavedJobIds(prev =>
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  }, []);

  const handleApplySuccess = useCallback((jobId: string) => {
    setAppliedJobIds(prev => {
      if (prev.includes(jobId)) return prev;
      return [...prev, jobId];
    });
  }, []);

  // Stable per-job bookmark callbacks — prevents React.memo bust on every App render
  // Each callback is recreated only when jobsList changes (new jobs loaded)
  const bookmarkCallbacks = useMemo(() => {
    const map: Record<string, () => void> = {};
    jobsList.forEach(j => {
      map[j.id] = () => handleToggleSaveJob(j.id);
    });
    return map;
  }, [jobsList, handleToggleSaveJob]);

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
      const matchesRegion = targetRegion === 'all' || !job.region || job.region === targetRegion;

      // 3. Country, State & City Match
      const matchesCountry = filters.country === 'All Countries' || !filters.country ||
        (job.countryName && job.countryName.toLowerCase() === filters.country.toLowerCase()) ||
        ((job as any).country && (job as any).country.toLowerCase() === filters.country.toLowerCase()) ||
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

      // 6. Salary Range Match
      const jobMinSalary = job.minSalaryUSD ?? 0;
      const jobMaxSalary = job.maxSalaryUSD ?? 250000;
      const matchesSalary = filters.salaryMin === 0 || (jobMaxSalary >= filters.salaryMin && jobMinSalary <= filters.salaryMax);

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

  const filteredJobs = useMemo(() => {
    const res = getFilteredJobs();
    console.log("Jobs rendered on screen (Candidate Portal):", res.length);
    return res;
  }, [jobsList, filters, searchQuery, activeRegion, visaOnly, relocationOnly, eorOnly, activeSubTab]);

  const appliedJobs = useMemo(() => {
    return jobsList.filter(job => appliedJobIds.includes(job.id));
  }, [jobsList, appliedJobIds]);

  return (
    <Routes>
      {/* ── Dedicated Apply Job page: zero background rendering ── */}
      <Route
        path="/candidate/jobs/:jobId/apply"
        element={
          <Suspense fallback={
            <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-primary)', zIndex:99999, flexDirection:'column', gap:14 }}>
              <div style={{ width:40, height:40, borderRadius:'50%', border:'3px solid var(--border-color)', borderTopColor:'var(--color-primary)', animation:'spin 0.75s linear infinite' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <p style={{ fontSize:14, color:'var(--text-secondary)', margin:0 }}>Loading application…</p>
            </div>
          }>
            <ApplyJobPage />
          </Suspense>
        }
      />

      <Route
        path="/jobs/:slug"
        element={
          <Suspense fallback={
            <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg-primary)', zIndex:99999, flexDirection:'column', gap:14 }}>
              <div style={{ width:40, height:40, borderRadius:'50%', border:'3px solid var(--border-color)', borderTopColor:'var(--color-primary)', animation:'spin 0.75s linear infinite' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <p style={{ fontSize:14, color:'var(--text-secondary)', margin:0 }}>Loading application…</p>
            </div>
          }>
            <ApplyJobPage />
          </Suspense>
        }
      />

      {/* ── All other pages (existing tab-based app) ── */}
      <Route path="/*" element={<AppShell
        theme={theme} setTheme={setTheme}
        activeCurrency={activeCurrency} setActiveCurrency={setActiveCurrency}
        activeRegion={activeRegion} setActiveRegion={setActiveRegion}
        visaOnly={visaOnly} setVisaOnly={setVisaOnly}
        relocationOnly={relocationOnly} setRelocationOnly={setRelocationOnly}
        eorOnly={eorOnly} setEorOnly={setEorOnly}
        activeLang={activeLang} setActiveLang={setActiveLang}
        filters={filters} setFilters={setFilters}
        user={user} isAuthenticated={isAuthenticated}
        activeTab={activeTab} setActiveTab={setActiveTab}
        activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        jobsList={jobsList} filteredJobs={filteredJobs}
        appliedJobIds={appliedJobIds} savedJobIds={savedJobIds}
        bookmarkCallbacks={bookmarkCallbacks}
        handleApplySuccess={handleApplySuccess}
        handleToggleSaveJob={handleToggleSaveJob}
        handleLoginSuccess={handleLoginSuccess}
        handleLogout={handleLogout}
        handleResetFilters={handleResetFilters}
        handleSelectCategoryOrSub={handleSelectCategoryOrSub}
        triggerGlobalRefresh={triggerGlobalRefresh}
        refreshTrigger={refreshTrigger}
        appliedJobs={appliedJobs}
        dbStats={dbStats}
      />} />
    </Routes>
  );
}

// ─── AppShell — rendered only on non-apply routes ──────────────────────────────
function AppShell({
  theme, setTheme,
  activeCurrency, setActiveCurrency,
  activeRegion, setActiveRegion,
  visaOnly, setVisaOnly,
  relocationOnly: _relocationOnly, setRelocationOnly: _setRelocationOnly,
  eorOnly: _eorOnly, setEorOnly: _setEorOnly,
  activeLang, setActiveLang,
  filters, setFilters,
  user, isAuthenticated,
  activeTab, setActiveTab,
  activeSubTab, setActiveSubTab,
  searchQuery, setSearchQuery,
  jobsList, filteredJobs,
  appliedJobIds, savedJobIds,
  bookmarkCallbacks,
  handleApplySuccess,
  handleToggleSaveJob,
  handleLoginSuccess,
  handleLogout,
  handleResetFilters,
  handleSelectCategoryOrSub,
  triggerGlobalRefresh,
  refreshTrigger = 0,
  appliedJobs,
  dbStats: _dbStats = { live_jobs: 0, hiring_companies: 0, registered_candidates: 0, countries: 0 }
}: any) {

  return (
    <div className="app-container">
      {/* Background Animated Mesh */}
      <div className="bg-gradient-mesh" />

      {/* Top Global Navigation Bar */}
      {activeTab !== 'admin' && activeTab !== 'employer-auth' && activeTab !== 'recruiter-login' && (
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
          user={user}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
        />
      )}

      {/* Main Viewport Container */}
      <main style={{ flex: 1 }}>

        {/* View: Home (Redesigned Candidate / Job Seeker Discovery Home) */}
        {activeTab === 'home' && (
          <CandidateHome 
            user={user}
            isAuthenticated={isAuthenticated}
            jobsList={jobsList}
            activeCurrency={activeCurrency}
            setActiveCurrency={setActiveCurrency}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearchSubmit={(titleQuery, locationQuery, experienceQuery) => {
              setSearchQuery(titleQuery);
              setFilters((prev: any) => ({
                ...prev,
                ...(locationQuery.trim() ? { city: locationQuery, country: 'All Countries' } : {}),
                ...(experienceQuery && experienceQuery !== 'all' ? { experience: experienceQuery } : {})
              }));
              setActiveTab('jobs');
            }}
            onNavigateTab={(tab, subTab) => {
              setActiveTab(tab);
              if (subTab) setActiveSubTab(subTab);
            }}
            savedJobIds={savedJobIds}
            appliedJobIds={appliedJobIds}
            bookmarkCallbacks={bookmarkCallbacks}
            handleApplySuccess={handleApplySuccess}
          />
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

              {/* Active Filter Summary Bar */}
              {(filters.workModes.length > 0 || 
                filters.jobTypes.length > 0 || 
                (filters.experience && filters.experience !== 'all') ||
                (filters.city && filters.city !== 'All Cities') ||
                filters.category ||
                (filters.industry && filters.industry !== 'All Industries') ||
                filters.companyName ||
                filters.verifiedCompanyOnly ||
                filters.benefits.length > 0) && (
                <div className="active-filters-summary-bar">
                  <span className="summary-label">Active Filters:</span>
                  <div className="summary-chips-wrap">
                    {filters.city && filters.city !== 'All Cities' && (
                      <span className="active-summary-chip">
                        {filters.city}
                        <button type="button" onClick={() => setFilters((prev: any) => ({ ...prev, city: 'All Cities' }))}>×</button>
                      </span>
                    )}
                    {filters.workModes.map((wm: string) => (
                      <span key={wm} className="active-summary-chip">
                        {wm}
                        <button type="button" onClick={() => setFilters((prev: any) => ({ ...prev, workModes: prev.workModes.filter((m: string) => m !== wm) }))}>×</button>
                      </span>
                    ))}
                    {filters.jobTypes.map((jt: string) => (
                      <span key={jt} className="active-summary-chip">
                        {jt}
                        <button type="button" onClick={() => setFilters((prev: any) => ({ ...prev, jobTypes: prev.jobTypes.filter((t: string) => t !== jt) }))}>×</button>
                      </span>
                    ))}
                    {filters.experience && filters.experience !== 'all' && (
                      <span className="active-summary-chip">
                        {filters.experience === 'fresher' ? 'Fresher' : `${filters.experience} Yrs`}
                        <button type="button" onClick={() => setFilters((prev: any) => ({ ...prev, experience: 'all' }))}>×</button>
                      </span>
                    )}
                    {filters.category && (
                      <span className="active-summary-chip">
                        {filters.category}
                        <button type="button" onClick={() => setFilters((prev: any) => ({ ...prev, category: '' }))}>×</button>
                      </span>
                    )}
                    {filters.industry && filters.industry !== 'All Industries' && (
                      <span className="active-summary-chip">
                        {filters.industry}
                        <button type="button" onClick={() => setFilters((prev: any) => ({ ...prev, industry: 'All Industries' }))}>×</button>
                      </span>
                    )}
                    {filters.verifiedCompanyOnly && (
                      <span className="active-summary-chip">
                        Verified Only
                        <button type="button" onClick={() => setFilters((prev: any) => ({ ...prev, verifiedCompanyOnly: false }))}>×</button>
                      </span>
                    )}
                    {filters.benefits.map((b: string) => (
                      <span key={b} className="active-summary-chip">
                        {b}
                        <button type="button" onClick={() => setFilters((prev: any) => ({ ...prev, benefits: prev.benefits.filter((x: string) => x !== b) }))}>×</button>
                      </span>
                    ))}
                  </div>
                  <button 
                    type="button" 
                    className="btn-clear-all-summary"
                    onClick={handleResetFilters}
                  >
                    Clear All
                  </button>
                </div>
              )}

              <div className="jobs-list">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job: Job) => (
                    <JobCard 
                      key={job.id} 
                      job={job} 
                      currencyCode={activeCurrency}
                      onApplySuccess={handleApplySuccess} 
                      isBookmarked={savedJobIds.includes(job.id)}
                      onBookmarkToggle={bookmarkCallbacks[job.id]}
                      hasApplied={appliedJobIds.includes(job.id)}
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

        {/* View: Profile (Candidate Guard) */}
        {activeTab === 'profile' && (
          <div style={{ width: '100%' }}>
            {(!isAuthenticated || (user?.role && String(user.role).toUpperCase() !== 'CANDIDATE')) ? (
              <div style={{ padding: '40px', maxWidth: '1100px', margin: '40px auto' }}>
                <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '10px' }}>Candidate Profile Access</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Please sign in with a candidate account to access your job applications and profile details.</p>
                  <button className="btn-primary" onClick={() => setActiveTab('login')}>Sign In to Candidate Account</button>
                </div>
              </div>
            ) : (
              <UserProfile 
                appliedJobs={appliedJobs}
                jobsList={jobsList}
                activeSubTab={activeSubTab}
                setActiveSubTab={setActiveSubTab}
                onApplySuccess={handleApplySuccess}
                savedJobIds={savedJobIds}
                onToggleSaveJob={handleToggleSaveJob}
              />
            )}
          </div>
        )}

        {/* View: Employer Auth Page */}
        {activeTab === 'employer-auth' && (
          <EmployerAuthPage
            onLoginSuccess={handleLoginSuccess}
            onNavigateCandidateLogin={() => setActiveTab('login')}
          />
        )}

        {/* View: Recruiter Login Page */}
        {activeTab === 'recruiter-login' && (
          <RecruiterLoginPage
            onLoginSuccess={handleLoginSuccess}
            onNavigateHome={() => setActiveTab('home')}
          />
        )}

        {/* View: Employer Dashboard (Employer Guard) */}
        {activeTab === 'employer' && (
          (!isAuthenticated || (user?.role && String(user.role).toUpperCase() !== 'EMPLOYER')) ? (
            <EmployerAuthPage
              onLoginSuccess={handleLoginSuccess}
              onNavigateCandidateLogin={() => setActiveTab('login')}
            />
          ) : (
            <EmployerDashboard activeTab={activeSubTab || 'overview'} setActiveTab={setActiveSubTab} onJobPublished={triggerGlobalRefresh} />
          )
        )}

        {/* View: Recruiter Dashboard (Recruiter Guard) */}
        {activeTab === 'recruiter' && (
          (!isAuthenticated || (user?.role && String(user.role).toUpperCase() !== 'RECRUITER')) ? (
            <RecruiterLoginPage
              onLoginSuccess={handleLoginSuccess}
              onNavigateHome={() => setActiveTab('home')}
            />
          ) : (
            <RecruiterDashboard 
              activeTab={activeSubTab || 'dashboard'} 
              setActiveTab={setActiveSubTab} 
              exitPortal={() => setActiveTab('home')}
            />
          )
        )}

        {/* View: Admin Platform Console (Admin Guard) */}
        {activeTab === 'admin' && (
          (!isAuthenticated || (user?.role && String(user.role).toUpperCase() !== 'ADMIN' && String(user.role).toUpperCase() !== 'SUPER_ADMIN' && String(user.role).toUpperCase() !== 'PLATFORM_ADMIN')) ? (
            <AdminLoginPage
              onLoginSuccess={handleLoginSuccess}
              onNavigateHome={() => setActiveTab('home')}
            />
          ) : (
            <AdminConsole refreshTrigger={refreshTrigger} />
          )
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
            onLoginSuccess={(loginData: any) => {
              handleLoginSuccess(loginData);
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
