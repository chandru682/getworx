import React, { useState } from 'react';
import { 
  Globe, 
  Award, 
  Plane, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  RotateCcw, 
  SlidersHorizontal,
  Building2,
  Briefcase,
  Sparkles,
  Check,
  Star,
  CheckCircle2,
  Clock,
  GraduationCap,
  Gift,
  Bot,
  X
} from 'lucide-react';
import { REGIONS, type RegionCode } from '../utils/currency';
import { JOB_CATEGORIES, getCleanCategoryName } from '../data/jobCategoriesData';
import { type LangCode, getTranslation } from '../utils/translate';

export interface FilterState {
  // Location
  region: RegionCode;
  country: string;
  state: string;
  city: string;

  // Job Details
  industry: string;
  category: string;
  role: string;
  experience: string;
  salaryMin: number;
  salaryMax: number;

  // Work Mode & Employment Type
  workModes: string[];
  jobTypes: string[];

  // More Filters Accordion
  companyName: string;
  verifiedCompanyOnly: boolean;
  topEmployerOnly: boolean;
  selectedSkills: string[];
  education: string;
  visaOnly: boolean;
  relocationOnly: boolean;
  jobStatuses: string[];
  postedDate: string;
  benefits: string[];
  minAiMatchScore: number;
}

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  matchingCount?: number;
  activeLang?: LangCode;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  matchingCount = 0,
  activeLang = 'en'
}) => {
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [skillSearch, setSkillSearch] = useState('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Lists for Location Dropdowns
  const countries = [
    'All Countries',
    'India',
    'United Arab Emirates'
  ];

  // Dynamic states based on selected country
  const getStatesForCountry = (country: string) => {
    const allStates = [
      'All States / Provinces',
      // India States
      'Karnataka',
      'Maharashtra',
      'Delhi',
      'Telangana',
      'Tamil Nadu',
      'Haryana',
      'Uttar Pradesh',
      // UAE Emirates
      'Dubai Emirate',
      'Abu Dhabi Emirate',
      'Sharjah Emirate'
    ];
    if (country === 'India') {
      return ['All States / Provinces', 'Karnataka', 'Maharashtra', 'Delhi', 'Telangana', 'Tamil Nadu', 'Haryana', 'Uttar Pradesh'];
    }
    if (country === 'United Arab Emirates') {
      return ['All States / Provinces', 'Dubai Emirate', 'Abu Dhabi Emirate', 'Sharjah Emirate'];
    }
    return allStates;
  };

  // Dynamic cities based on selected country/state
  const getCitiesForLocation = (country: string, state: string) => {
    const allCities = [
      'All Cities',
      'Bengaluru',
      'Mumbai',
      'New Delhi',
      'Hyderabad',
      'Chennai',
      'Gurugram',
      'Pune',
      'Noida',
      'Dubai',
      'Abu Dhabi',
      'Sharjah'
    ];
    
    if (state !== 'All States / Provinces') {
      if (state === 'Karnataka') return ['All Cities', 'Bengaluru'];
      if (state === 'Maharashtra') return ['All Cities', 'Mumbai', 'Pune'];
      if (state === 'Delhi') return ['All Cities', 'New Delhi'];
      if (state === 'Telangana') return ['All Cities', 'Hyderabad'];
      if (state === 'Tamil Nadu') return ['All Cities', 'Chennai'];
      if (state === 'Haryana') return ['All Cities', 'Gurugram'];
      if (state === 'Uttar Pradesh') return ['All Cities', 'Noida'];
      if (state === 'Dubai Emirate') return ['All Cities', 'Dubai'];
      if (state === 'Abu Dhabi Emirate') return ['All Cities', 'Abu Dhabi'];
      if (state === 'Sharjah Emirate') return ['All Cities', 'Sharjah'];
    }

    if (country === 'India') {
      return ['All Cities', 'Bengaluru', 'Mumbai', 'New Delhi', 'Hyderabad', 'Chennai', 'Gurugram', 'Pune', 'Noida'];
    }
    if (country === 'United Arab Emirates') {
      return ['All Cities', 'Dubai', 'Abu Dhabi', 'Sharjah'];
    }
    return allCities;
  };

  const states = getStatesForCountry(filters.country);
  const cities = getCitiesForLocation(filters.country, filters.state);

  const experienceOptions = [
    { value: 'all', label: 'Any Experience' },
    { value: 'fresher', label: 'Fresher (0 Yrs)' },
    { value: '1-3', label: '1 - 3 Years' },
    { value: '3-5', label: '3 - 5 Years' },
    { value: '5-8', label: '5 - 8 Years' },
    { value: '8+', label: '8+ Years (Lead)' }
  ];

  const workModesList = ['Remote', 'Hybrid', 'In-office'];
  const employmentTypesList = ['Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance'];

  const availableSkillsList = [
    'React', 'TypeScript', 'Node.js', 'Python', 'AWS', 'Figma', 
    'Docker', 'Kubernetes', 'B2B Sales', 'SEO', 'Finance', 'System Design', 
    'HR Operations', 'Customer Service', 'CAD', 'Radiology', 'SAP ERP', 'Aviation'
  ];

  const educationOptions = ['Any Education', 'High School', "Bachelor's", "Master's", 'Doctorate'];
  const jobStatusesList = ['Easy Apply', 'Featured', 'Urgent Hiring', 'Verified Jobs'];
  const postedDateOptions = [
    { value: 'all', label: 'Anytime' },
    { value: '24h', label: 'Last 24 Hours' },
    { value: '3d', label: 'Last 3 Days' },
    { value: '7d', label: 'Last Week' },
    { value: '30d', label: 'Last Month' }
  ];
  const benefitsList = ['Health Insurance', 'Bonus', 'Paid Leave', 'Stock Options', 'Learning Budget'];
  const aiMatchOptions = [
    { value: 0, label: 'Any Match' },
    { value: 80, label: '80%+ Match' },
    { value: 90, label: '90%+ Match' },
    { value: 95, label: '95%+ Match' },
    { value: 100, label: '100% Match' }
  ];

  // Dynamically compute Job Categories based on selected Industry
  const selectedIndustryObj = JOB_CATEGORIES.find(c => getCleanCategoryName(c.name) === filters.industry);
  const availableCategories = selectedIndustryObj 
    ? selectedIndustryObj.subcategories 
    : Array.from(new Set(JOB_CATEGORIES.flatMap(c => c.subcategories))).slice(0, 20);

  // Dynamically compute Job Roles based on selected Category
  const availableRoles = filters.category 
    ? [`${filters.category} Specialist`, `${filters.category} Lead`, `Senior ${filters.category}`, `Junior ${filters.category}`]
    : ['Software Architect', 'Product Designer', 'DevOps Lead', 'HR Manager', 'Sales Director', 'Data Engineer'];

  // Helper toggle function for multi-select arrays
  const toggleArrayItem = (key: keyof FilterState, item: string) => {
    const list = (filters[key] as string[]) || [];
    const updated = list.includes(item)
      ? list.filter(x => x !== item)
      : [...list, item];
    onFilterChange({ ...filters, [key]: updated });
  };

  const updateSingleField = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  // Count active filters for badge
  const activeCount = [
    filters.region !== 'all',
    filters.country !== 'All Countries',
    filters.state !== 'All States / Provinces',
    filters.city !== 'All Cities',
    filters.industry !== 'All Industries',
    !!filters.category,
    !!filters.role,
    filters.experience !== 'all',
    filters.salaryMin > 0 || filters.salaryMax < 250000,
    filters.workModes.length > 0,
    filters.jobTypes.length > 0,
    !!filters.companyName,
    filters.verifiedCompanyOnly,
    filters.topEmployerOnly,
    filters.selectedSkills.length > 0,
    filters.education !== 'Any Education',
    filters.visaOnly,
    filters.relocationOnly,
    filters.jobStatuses.length > 0,
    filters.postedDate !== 'all',
    filters.benefits.length > 0,
    filters.minAiMatchScore > 0
  ].filter(Boolean).length;

  const renderFilterContent = () => (
    <div className="filter-panel-inner">
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SlidersHorizontal size={18} style={{ color: 'var(--color-primary)' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
            {getTranslation(activeLang, 'filter_jobs')}
          </h3>
          {activeCount > 0 && (
            <span style={{
              background: 'var(--color-primary)',
              color: '#ffffff',
              borderRadius: '12px',
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: '800'
            }}>
              {activeCount}
            </span>
          )}
        </div>

        <button 
          onClick={onResetFilters}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--color-primary)', 
            fontSize: '12.5px', 
            fontWeight: '700', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title="Reset all filters"
        >
          <RotateCcw size={12} />
          {getTranslation(activeLang, 'reset_all')}
        </button>
      </div>

      {/* ================= VISIBLE FILTERS ================= */}

      {/* 🌍 1. Location Card */}
      <div className="filter-card-section">
        <h4 className="filter-section-title">
          <Globe size={14} style={{ color: 'var(--color-primary)' }} /> {getTranslation(activeLang, 'location')}
        </h4>

        {/* Region */}
        <div className="filter-field-group">
          <label className="filter-label">{getTranslation(activeLang, 'region')}</label>
          <select 
            className="filter-select"
            value={filters.region}
            onChange={(e) => updateSingleField('region', e.target.value as RegionCode)}
          >
            {Object.entries(REGIONS).map(([code, reg]) => (
              <option key={code} value={code}>
                {reg.flag} {reg.name}
              </option>
            ))}
          </select>
        </div>

        {/* Country */}
        <div className="filter-field-group">
          <label className="filter-label">{getTranslation(activeLang, 'country')}</label>
          <select 
            className="filter-select"
            value={filters.country}
            onChange={(e) => {
              const newCountry = e.target.value;
              const validStates = getStatesForCountry(newCountry);
              const nextState = validStates.includes(filters.state) ? filters.state : 'All States / Provinces';
              const validCities = getCitiesForLocation(newCountry, nextState);
              const nextCity = validCities.includes(filters.city) ? filters.city : 'All Cities';
              
              onFilterChange({
                ...filters,
                country: newCountry,
                state: nextState,
                city: nextCity
              });
            }}
          >
            {countries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {/* State / Province */}
          <div className="filter-field-group">
            <label className="filter-label">{getTranslation(activeLang, 'state_province')}</label>
            <select 
              className="filter-select"
              value={filters.state}
              onChange={(e) => {
                const newState = e.target.value;
                const validCities = getCitiesForLocation(filters.country, newState);
                const nextCity = validCities.includes(filters.city) ? filters.city : 'All Cities';
                
                onFilterChange({
                  ...filters,
                  state: newState,
                  city: nextCity
                });
              }}
            >
              {states.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div className="filter-field-group">
            <label className="filter-label">{getTranslation(activeLang, 'city')}</label>
            <select 
              className="filter-select"
              value={filters.city}
              onChange={(e) => updateSingleField('city', e.target.value)}
            >
              {cities.map(ct => (
                <option key={ct} value={ct}>{ct}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 💼 2. Job Details Card (Dynamic Cascading) */}
      <div className="filter-card-section">
        <h4 className="filter-section-title">
          <Briefcase size={14} style={{ color: 'var(--color-primary)' }} /> {getTranslation(activeLang, 'job_details')}
        </h4>

        {/* Industry */}
        <div className="filter-field-group">
          <label className="filter-label">{getTranslation(activeLang, 'industry_sector')}</label>
          <select 
            className="filter-select"
            value={filters.industry}
            onChange={(e) => {
              const newInd = e.target.value;
              onFilterChange({
                ...filters,
                industry: newInd,
                category: '', // Reset lower cascade
                role: ''
              });
            }}
          >
            <option value="All Industries">All Industries (33 Sectors)</option>
            {JOB_CATEGORIES.map(cat => {
              const cleanName = getCleanCategoryName(cat.name);
              return <option key={cat.id} value={cleanName}>{cleanName}</option>;
            })}
          </select>
        </div>

        {/* Job Category (Dynamic) */}
        <div className="filter-field-group">
          <label className="filter-label">{getTranslation(activeLang, 'job_category')}</label>
          <select 
            className="filter-select"
            value={filters.category}
            onChange={(e) => {
              const newCat = e.target.value;
              onFilterChange({
                ...filters,
                category: newCat,
                role: '' // Reset role cascade
              });
            }}
          >
            <option value="">All Categories</option>
            {availableCategories.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>

        {/* Job Role (Dynamic) */}
        {filters.category && (
          <div className="filter-field-group">
            <label className="filter-label">{getTranslation(activeLang, 'job_role')}</label>
            <select 
              className="filter-select"
              value={filters.role}
              onChange={(e) => updateSingleField('role', e.target.value)}
            >
              <option value="">All Specific Roles</option>
              {availableRoles.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        )}

        {/* Experience */}
        <div className="filter-field-group">
          <label className="filter-label">{getTranslation(activeLang, 'experience_level')}</label>
          <select 
            className="filter-select"
            value={filters.experience}
            onChange={(e) => updateSingleField('experience', e.target.value)}
          >
            {experienceOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Salary Range (USD) */}
        <div className="filter-field-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label className="filter-label" style={{ margin: 0 }}>{getTranslation(activeLang, 'salary_range')} (USD)</label>
            <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--color-primary)' }}>
              ${filters.salaryMin.toLocaleString()} - ${filters.salaryMax >= 250000 ? '250,000+' : filters.salaryMax.toLocaleString()}/yr
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
              <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', width: '28px', flexShrink: 0 }}>Min</span>
              <input 
                type="range" 
                min="0" 
                max="250000" 
                step="5000"
                value={filters.salaryMin}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val <= filters.salaryMax) {
                    updateSingleField('salaryMin', val);
                  }
                }}
                className="salary-range-input"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
              <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', width: '28px', flexShrink: 0 }}>Max</span>
              <input 
                type="range" 
                min="0" 
                max="250000" 
                step="5000"
                value={filters.salaryMax}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= filters.salaryMin) {
                    updateSingleField('salaryMax', val);
                  }
                }}
                className="salary-range-input"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 🏢 3. Work Mode (Multi-Select Chips) */}
      <div className="filter-card-section">
        <h4 className="filter-section-title">{getTranslation(activeLang, 'work_mode')}</h4>
        <div className="pill-chips-grid">
          {workModesList.map(mode => {
            const isSelected = filters.workModes.includes(mode);
            return (
              <button 
                key={mode}
                type="button"
                className={`filter-chip ${isSelected ? 'active' : ''}`}
                onClick={() => toggleArrayItem('workModes', mode)}
              >
                {isSelected && <Check size={12} />}
                <span>{mode}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 📄 4. Employment Type (Multi-Select Chips) */}
      <div className="filter-card-section">
        <h4 className="filter-section-title">{getTranslation(activeLang, 'employment_type')}</h4>
        <div className="pill-chips-grid">
          {employmentTypesList.map(type => {
            const isSelected = filters.jobTypes.includes(type);
            return (
              <button 
                key={type}
                type="button"
                className={`filter-chip ${isSelected ? 'active' : ''}`}
                onClick={() => toggleArrayItem('jobTypes', type)}
              >
                {isSelected && <Check size={12} />}
                <span>{type}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= MORE FILTERS ACCORDION ================= */}
      <div className="more-filters-accordion-container" style={{ marginTop: '16px' }}>
        <button 
          type="button"
          className="more-filters-toggle-btn"
          onClick={() => setShowMoreFilters(!showMoreFilters)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} style={{ color: 'var(--color-primary)' }} />
            <span>{getTranslation(activeLang, 'advanced_filters')}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', opacity: 0.8 }}>
              {showMoreFilters ? 'Collapse' : 'Expand'}
            </span>
            {showMoreFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </button>

        {showMoreFilters && (
          <div className="more-filters-body" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* 🏢 Company */}
            <div className="filter-card-section">
              <h4 className="filter-section-title">
                <Building2 size={14} style={{ color: 'var(--color-primary)' }} /> Company
              </h4>

              <div className="filter-field-group">
                <input 
                  type="text" 
                  className="filter-input"
                  placeholder="Search by company name..."
                  value={filters.companyName}
                  onChange={(e) => updateSingleField('companyName', e.target.value)}
                />
              </div>

              <div className="filter-list" style={{ gap: '8px' }}>
                <label className="filter-checkbox-label">
                  <input 
                    type="checkbox"
                    checked={filters.verifiedCompanyOnly}
                    onChange={(e) => updateSingleField('verifiedCompanyOnly', e.target.checked)}
                  />
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={13} style={{ color: 'var(--color-success)' }} /> Verified Companies
                  </span>
                </label>

                <label className="filter-checkbox-label">
                  <input 
                    type="checkbox"
                    checked={filters.topEmployerOnly}
                    onChange={(e) => updateSingleField('topEmployerOnly', e.target.checked)}
                  />
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={13} style={{ color: 'var(--color-warning)' }} /> Top Employers
                  </span>
                </label>
              </div>
            </div>

            {/* 🛠 Skills Multi-Select */}
            <div className="filter-card-section">
              <h4 className="filter-section-title">Required Skills</h4>
              <div className="category-search-wrapper" style={{ position: 'relative', marginBottom: '10px' }}>
                <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text"
                  placeholder="Filter skills..."
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 28px',
                    fontSize: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div className="pill-chips-grid">
                {availableSkillsList
                  .filter(sk => !skillSearch || sk.toLowerCase().includes(skillSearch.toLowerCase()))
                  .map(skill => {
                    const isSelected = filters.selectedSkills.includes(skill);
                    return (
                      <button 
                        key={skill}
                        type="button"
                        className={`filter-chip ${isSelected ? 'active' : ''}`}
                        onClick={() => toggleArrayItem('selectedSkills', skill)}
                      >
                        {isSelected && <Check size={11} />}
                        <span>{skill}</span>
                      </button>
                    );
                  })
                }
              </div>
            </div>

            {/* 🎓 Education */}
            <div className="filter-card-section">
              <h4 className="filter-section-title">
                <GraduationCap size={14} style={{ color: 'var(--color-primary)' }} /> Education
              </h4>
              <select 
                className="filter-select"
                value={filters.education}
                onChange={(e) => updateSingleField('education', e.target.value)}
              >
                {educationOptions.map(ed => (
                  <option key={ed} value={ed}>{ed}</option>
                ))}
              </select>
            </div>

            {/* 🌍 Visa & Relocation */}
            <div className="filter-card-section">
              <h4 className="filter-section-title">Visa & Relocation</h4>
              <div className="filter-list" style={{ gap: '8px' }}>
                <label className="filter-checkbox-label">
                  <input 
                    type="checkbox"
                    checked={filters.visaOnly}
                    onChange={(e) => updateSingleField('visaOnly', e.target.checked)}
                  />
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Award size={13} style={{ color: '#8b5cf6' }} /> Visa Sponsored
                  </span>
                </label>

                <label className="filter-checkbox-label">
                  <input 
                    type="checkbox"
                    checked={filters.relocationOnly}
                    onChange={(e) => updateSingleField('relocationOnly', e.target.checked)}
                  />
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Plane size={13} style={{ color: '#06b6d4' }} /> Relocation Available
                  </span>
                </label>
              </div>
            </div>

            {/* ⭐ Job Status */}
            <div className="filter-card-section">
              <h4 className="filter-section-title">Job Status</h4>
              <div className="pill-chips-grid">
                {jobStatusesList.map(st => {
                  const isSelected = filters.jobStatuses.includes(st);
                  return (
                    <button 
                      key={st}
                      type="button"
                      className={`filter-chip ${isSelected ? 'active' : ''}`}
                      onClick={() => toggleArrayItem('jobStatuses', st)}
                    >
                      {isSelected && <Check size={11} />}
                      <span>{st}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 📅 Posted Date */}
            <div className="filter-card-section">
              <h4 className="filter-section-title">
                <Clock size={14} style={{ color: 'var(--color-primary)' }} /> Posted Date
              </h4>
              <div className="pill-chips-grid">
                {postedDateOptions.map(p => {
                  const isSelected = filters.postedDate === p.value;
                  return (
                    <button 
                      key={p.value}
                      type="button"
                      className={`filter-chip ${isSelected ? 'active' : ''}`}
                      onClick={() => updateSingleField('postedDate', p.value)}
                    >
                      {isSelected && <Check size={11} />}
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 🎁 Benefits */}
            <div className="filter-card-section">
              <h4 className="filter-section-title">
                <Gift size={14} style={{ color: 'var(--color-primary)' }} /> Perks & Benefits
              </h4>
              <div className="pill-chips-grid">
                {benefitsList.map(b => {
                  const isSelected = filters.benefits.includes(b);
                  return (
                    <button 
                      key={b}
                      type="button"
                      className={`filter-chip ${isSelected ? 'active' : ''}`}
                      onClick={() => toggleArrayItem('benefits', b)}
                    >
                      {isSelected && <Check size={11} />}
                      <span>{b}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 🤖 AI Match Score */}
            <div className="filter-card-section">
              <h4 className="filter-section-title">
                <Bot size={14} style={{ color: 'var(--color-primary)' }} /> AI Match Score
              </h4>
              <div className="pill-chips-grid">
                {aiMatchOptions.map(ai => {
                  const isSelected = filters.minAiMatchScore === ai.value;
                  return (
                    <button 
                      key={ai.value}
                      type="button"
                      className={`filter-chip ${isSelected ? 'active' : ''}`}
                      onClick={() => updateSingleField('minAiMatchScore', ai.value)}
                    >
                      {isSelected && <Check size={11} />}
                      <span>{ai.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button 
          type="button" 
          className="btn-primary" 
          onClick={() => setMobileDrawerOpen(false)}
          style={{ width: '100%', padding: '12px', fontSize: '14px', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <span>{getTranslation(activeLang, 'apply_filters')}</span>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '10px', fontSize: '12px' }}>
            {matchingCount} Jobs
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Floating Filter Trigger Button */}
      <div className="mobile-filter-trigger-container">
        <button 
          className="btn-primary mobile-filter-btn"
          onClick={() => setMobileDrawerOpen(true)}
        >
          <SlidersHorizontal size={16} />
          <span>Filters</span>
          {activeCount > 0 && <span className="mobile-filter-badge">{activeCount}</span>}
        </button>
      </div>

      {/* Mobile Bottom Sheet Drawer Modal */}
      {mobileDrawerOpen && (
        <div className="mobile-filter-overlay" onClick={() => setMobileDrawerOpen(false)}>
          <div className="mobile-filter-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-sheet-header">
              <span className="mobile-sheet-title">Filters ({activeCount} Active)</span>
              <button className="mobile-sheet-close" onClick={() => setMobileDrawerOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="mobile-sheet-body">
              {renderFilterContent()}
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sticky Filter Sidebar */}
      <aside className="filter-sidebar desktop-filter-sidebar">
        {renderFilterContent()}
      </aside>
    </>
  );
};
