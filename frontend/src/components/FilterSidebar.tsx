import React, { useState, useMemo } from 'react';
import { 
  Search, 
  RotateCcw, 
  SlidersHorizontal,
  ChevronDown, 
  ChevronUp, 
  Check, 
  X,
  Building2,
  MapPin,
  Sparkles,
  ShieldCheck,
  Filter
} from 'lucide-react';
import { type CurrencyCode, type RegionCode, CURRENCIES } from '../utils/currency';
import { type LangCode } from '../utils/translate';

export interface FilterState {
  // Location
  region: RegionCode;
  country: string;
  state: string;
  city: string;
  locationSearch?: string;

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

  // More Filters Accordion & Company
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

  // Advanced Filters
  noticePeriod?: string;
  language?: string;
  travelRequirement?: string;
}

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  matchingCount?: number;
  activeLang?: LangCode;
  activeCurrency?: CurrencyCode;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  matchingCount = 0,
  activeCurrency = 'INR'
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showAllIndustries, setShowAllIndustries] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [industrySearch, setIndustrySearch] = useState('');

  const currencySymbol = CURRENCIES[activeCurrency]?.symbol || '$';

  // Calculate total active applied filters count
  const appliedFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.country && filters.country !== 'All Countries') count++;
    if (filters.state && filters.state !== 'All States / Provinces') count++;
    if (filters.city && filters.city !== 'All Cities') count++;
    if (filters.workModes.length > 0) count += filters.workModes.length;
    if (filters.jobTypes.length > 0) count += filters.jobTypes.length;
    if (filters.experience && filters.experience !== 'all') count++;
    if (filters.salaryMin > 0 || (filters.salaryMax < 250000 && filters.salaryMax > 0)) count++;
    if (filters.category) count++;
    if (filters.industry && filters.industry !== 'All Industries') count++;
    if (filters.companyName) count++;
    if (filters.verifiedCompanyOnly) count++;
    if (filters.visaOnly) count++;
    if (filters.relocationOnly) count++;
    if (filters.benefits.length > 0) count += filters.benefits.length;
    if (filters.postedDate && filters.postedDate !== 'all') count++;
    if (filters.noticePeriod && filters.noticePeriod !== 'any') count++;
    if (filters.education && filters.education !== 'Any Education') count++;
    return count;
  }, [filters]);

  // Hierarchical Location Dropdowns Logic
  const countries = [
    'All Countries',
    'India',
    'United States',
    'United Arab Emirates',
    'United Kingdom',
    'Singapore',
    'Canada',
    'Germany'
  ];

  const getStatesForCountry = (country: string) => {
    switch (country) {
      case 'India':
        return ['All States / Provinces', 'Karnataka', 'Telangana', 'Maharashtra', 'Tamil Nadu', 'Delhi NCR', 'Haryana'];
      case 'United States':
        return ['All States / Provinces', 'California', 'New York', 'Texas', 'Washington', 'Massachusetts'];
      case 'United Arab Emirates':
        return ['All States / Provinces', 'Dubai Emirate', 'Abu Dhabi Emirate', 'Sharjah Emirate'];
      default:
        return ['All States / Provinces'];
    }
  };

  const getCitiesForState = (state: string) => {
    switch (state) {
      case 'Karnataka':
        return ['All Cities', 'Bangalore', 'Mysore', 'Hubli'];
      case 'Telangana':
        return ['All Cities', 'Hyderabad', 'Warangal'];
      case 'Maharashtra':
        return ['All Cities', 'Mumbai', 'Pune', 'Nagpur'];
      case 'Tamil Nadu':
        return ['All Cities', 'Chennai', 'Coimbatore'];
      case 'California':
        return ['All Cities', 'San Francisco', 'Los Angeles', 'San Jose'];
      case 'Dubai Emirate':
        return ['All Cities', 'Dubai City', 'Jebel Ali'];
      default:
        return ['All Cities'];
    }
  };

  const statesList = getStatesForCountry(filters.country);
  const citiesList = getCitiesForState(filters.state);

  // Quick Filter Pill Toggles
  const quickPills = [
    { label: 'Remote', active: filters.workModes.includes('Remote'), toggle: () => toggleWorkMode('Remote') },
    { label: 'Hybrid', active: filters.workModes.includes('Hybrid'), toggle: () => toggleWorkMode('Hybrid') },
    { label: 'On-site', active: filters.workModes.includes('In-office') || filters.workModes.includes('On-site'), toggle: () => toggleWorkMode('In-office') },
    { label: 'Full-time', active: filters.jobTypes.includes('Full Time'), toggle: () => toggleJobType('Full Time') },
    { label: 'Part-time', active: filters.jobTypes.includes('Part Time'), toggle: () => toggleJobType('Part Time') },
    { label: 'Internship', active: filters.jobTypes.includes('Internship'), toggle: () => toggleJobType('Internship') },
    { label: 'Fresher', active: filters.experience === 'fresher', toggle: () => setExperience('fresher') },
    { label: 'Urgent Hiring', active: filters.jobStatuses.includes('urgent'), toggle: () => toggleJobStatus('urgent') }
  ];

  const toggleWorkMode = (mode: string) => {
    const exists = filters.workModes.includes(mode);
    const updated = exists ? filters.workModes.filter(m => m !== mode) : [...filters.workModes, mode];
    onFilterChange({ ...filters, workModes: updated });
  };

  const toggleJobType = (type: string) => {
    const exists = filters.jobTypes.includes(type);
    const updated = exists ? filters.jobTypes.filter(t => t !== type) : [...filters.jobTypes, type];
    onFilterChange({ ...filters, jobTypes: updated });
  };

  const setExperience = (exp: string) => {
    const newExp = filters.experience === exp ? 'all' : exp;
    onFilterChange({ ...filters, experience: newExp });
  };

  const toggleJobStatus = (status: string) => {
    const exists = filters.jobStatuses.includes(status);
    const updated = exists ? filters.jobStatuses.filter(s => s !== status) : [...filters.jobStatuses, status];
    onFilterChange({ ...filters, jobStatuses: updated });
  };

  const toggleBenefit = (benefit: string) => {
    const exists = filters.benefits.includes(benefit);
    const updated = exists ? filters.benefits.filter(b => b !== benefit) : [...filters.benefits, benefit];
    onFilterChange({ ...filters, benefits: updated });
  };

  // Job Categories list
  const topCategories = [
    'Software Development',
    'Sales & Business',
    'Marketing & Growth',
    'Human Resources',
    'Finance & Accounting',
    'Product Management',
    'UI/UX & Design',
    'Data Science & AI',
    'Operations & Supply Chain',
    'Customer Support'
  ];

  const filteredCategories = topCategories.filter(cat => 
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Industries List
  const allIndustriesList = [
    'All Industries',
    'Information Technology & Services',
    'Computer Software & SaaS',
    'Financial Services & Fintech',
    'E-Commerce & Retail',
    'Healthcare & Telemedicine',
    'EdTech & Education',
    'Automotive & EV Technology',
    'Media & Digital Entertainment',
    'Telecommunications',
    'Cybersecurity & Cloud',
    'Biotechnology & Pharma',
    'Logistics & Supply Chain'
  ];

  const filteredIndustries = allIndustriesList.filter(ind =>
    ind.toLowerCase().includes(industrySearch.toLowerCase())
  );

  const displayedIndustries = showAllIndustries ? filteredIndustries : filteredIndustries.slice(0, 5);

  // Filter Panel Component Content
  const renderFilterContent = () => (
    <div className="filter-sidebar-inner">
      {/* 1. FILTER HEADER */}
      <div className="filter-header-main">
        <div className="filter-header-title-group">
          <SlidersHorizontal size={18} className="filter-icon-primary" />
          <h3 className="filter-title-text">Filter Jobs</h3>
          {appliedFiltersCount > 0 && (
            <span className="applied-count-badge">
              {appliedFiltersCount} applied
            </span>
          )}
        </div>
        {appliedFiltersCount > 0 && (
          <button 
            type="button" 
            className="btn-reset-filters-text"
            onClick={onResetFilters}
          >
            <RotateCcw size={13} />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* 2. QUICK FILTERS ROW */}
      <div className="filter-block-group">
        <span className="filter-block-label">Quick Filters</span>
        <div className="quick-chips-wrap">
          {quickPills.map(pill => (
            <button
              key={pill.label}
              type="button"
              className={`quick-pill-chip ${pill.active ? 'active' : ''}`}
              onClick={pill.toggle}
            >
              {pill.active && <Check size={12} />}
              <span>{pill.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. LOCATION FILTER (Hierarchical Cascading) */}
      <div className="filter-block-group">
        <span className="filter-block-label">Location</span>
        
        {/* Unified Search Input */}
        <div className="filter-input-search-box">
          <MapPin size={15} className="filter-input-icon" />
          <input 
            type="text"
            placeholder="Search city, state or country"
            value={filters.city !== 'All Cities' ? filters.city : (filters.locationSearch || '')}
            onChange={(e) => onFilterChange({ ...filters, city: e.target.value, locationSearch: e.target.value })}
            className="filter-text-input"
          />
          {filters.city !== 'All Cities' && (
            <button 
              type="button" 
              className="btn-clear-field"
              onClick={() => onFilterChange({ ...filters, city: 'All Cities', locationSearch: '' })}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Cascading Country Dropdown */}
        <div className="filter-select-wrapper">
          <label className="filter-field-sublabel">Country</label>
          <select
            value={filters.country}
            onChange={(e) => {
              const country = e.target.value;
              onFilterChange({
                ...filters,
                country,
                state: 'All States / Provinces',
                city: 'All Cities'
              });
            }}
            className="filter-select-dropdown"
          >
            {countries.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Cascading State Dropdown (Loaded when country is selected) */}
        {filters.country !== 'All Countries' && (
          <div className="filter-select-wrapper">
            <label className="filter-field-sublabel">State / Province</label>
            <select
              value={filters.state}
              onChange={(e) => {
                const state = e.target.value;
                onFilterChange({
                  ...filters,
                  state,
                  city: 'All Cities'
                });
              }}
              className="filter-select-dropdown"
            >
              {statesList.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}

        {/* Cascading City Dropdown (Loaded when state is selected) */}
        {filters.state !== 'All States / Provinces' && (
          <div className="filter-select-wrapper">
            <label className="filter-field-sublabel">City</label>
            <select
              value={filters.city}
              onChange={(e) => onFilterChange({ ...filters, city: e.target.value })}
              className="filter-select-dropdown"
            >
              {citiesList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 4. WORK MODE (Multi-select Chips) */}
      <div className="filter-block-group">
        <span className="filter-block-label">Work Mode</span>
        <div className="chips-grid-wrap">
          {['Remote', 'Hybrid', 'In-office'].map(mode => {
            const active = filters.workModes.includes(mode);
            return (
              <button
                key={mode}
                type="button"
                className={`filter-selector-chip ${active ? 'selected' : ''}`}
                onClick={() => toggleWorkMode(mode)}
              >
                {active && <Check size={12} />}
                <span>{mode === 'In-office' ? 'On-site' : mode}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. JOB TYPE (Multi-select Chips) */}
      <div className="filter-block-group">
        <span className="filter-block-label">Job Type</span>
        <div className="chips-grid-wrap">
          {[
            { id: 'Full Time', label: 'Full-time' },
            { id: 'Part Time', label: 'Part-time' },
            { id: 'Contract', label: 'Contract' },
            { id: 'Internship', label: 'Internship' },
            { id: 'Temporary', label: 'Temporary' }
          ].map(type => {
            const active = filters.jobTypes.includes(type.id);
            return (
              <button
                key={type.id}
                type="button"
                className={`filter-selector-chip ${active ? 'selected' : ''}`}
                onClick={() => toggleJobType(type.id)}
              >
                {active && <Check size={12} />}
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. EXPERIENCE RANGES */}
      <div className="filter-block-group">
        <span className="filter-block-label">Experience</span>
        <div className="chips-grid-wrap">
          {[
            { id: 'fresher', label: 'Fresher (0 Yrs)' },
            { id: '0-1', label: '0 – 1 Yrs' },
            { id: '1-3', label: '1 – 3 Yrs' },
            { id: '3-5', label: '3 – 5 Yrs' },
            { id: '5-10', label: '5 – 10 Yrs' },
            { id: '10+', label: '10+ Yrs' }
          ].map(exp => {
            const active = filters.experience === exp.id;
            return (
              <button
                key={exp.id}
                type="button"
                className={`filter-selector-chip ${active ? 'selected' : ''}`}
                onClick={() => setExperience(exp.id)}
              >
                {active && <Check size={12} />}
                <span>{exp.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 7. DYNAMIC SALARY FILTER */}
      <div className="filter-block-group">
        <div className="filter-label-row">
          <span className="filter-block-label">Salary Range</span>
          <span className="salary-currency-tag">{activeCurrency} ({currencySymbol})</span>
        </div>

        <div className="salary-input-duo">
          <div className="salary-input-box">
            <span className="currency-prefix">{currencySymbol}</span>
            <input 
              type="number"
              placeholder="Min"
              value={filters.salaryMin || ''}
              onChange={(e) => onFilterChange({ ...filters, salaryMin: Number(e.target.value) || 0 })}
              className="salary-number-input"
            />
          </div>
          <span className="salary-dash">–</span>
          <div className="salary-input-box">
            <span className="currency-prefix">{currencySymbol}</span>
            <input 
              type="number"
              placeholder="Max"
              value={filters.salaryMax && filters.salaryMax < 250000 ? filters.salaryMax : ''}
              onChange={(e) => onFilterChange({ ...filters, salaryMax: Number(e.target.value) || 250000 })}
              className="salary-number-input"
            />
          </div>
        </div>

        <input 
          type="range"
          min="0"
          max="250000"
          step="10000"
          value={filters.salaryMax || 250000}
          onChange={(e) => onFilterChange({ ...filters, salaryMax: Number(e.target.value) })}
          className="salary-range-slider"
        />
        <div className="salary-slider-labels">
          <span>{currencySymbol}0</span>
          <span>{currencySymbol}{filters.salaryMax >= 250000 ? '250k+' : filters.salaryMax.toLocaleString()}</span>
        </div>
      </div>

      {/* 8. JOB CATEGORY (Searchable Multi-select Chips) */}
      <div className="filter-block-group">
        <span className="filter-block-label">Job Category</span>
        <div className="filter-input-search-box">
          <Search size={14} className="filter-input-icon" />
          <input 
            type="text"
            placeholder="Search categories..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className="filter-text-input"
          />
        </div>

        <div className="chips-grid-wrap category-chips-scroll">
          {filteredCategories.map(cat => {
            const active = filters.category === cat;
            return (
              <button
                key={cat}
                type="button"
                className={`filter-selector-chip ${active ? 'selected' : ''}`}
                onClick={() => onFilterChange({ ...filters, category: active ? '' : cat })}
              >
                {active && <Check size={12} />}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 9. INDUSTRY (Expandable Section) */}
      <div className="filter-block-group">
        <span className="filter-block-label">Industry</span>
        <div className="filter-input-search-box">
          <Building2 size={14} className="filter-input-icon" />
          <input 
            type="text"
            placeholder="Search industries..."
            value={industrySearch}
            onChange={(e) => setIndustrySearch(e.target.value)}
            className="filter-text-input"
          />
        </div>

        <div className="industry-list-wrap">
          {displayedIndustries.map(ind => {
            const active = filters.industry === ind;
            return (
              <button
                key={ind}
                type="button"
                className={`industry-list-item ${active ? 'active' : ''}`}
                onClick={() => onFilterChange({ ...filters, industry: active ? 'All Industries' : ind })}
              >
                <span>{ind}</span>
                {active && <Check size={14} color="var(--color-primary)" />}
              </button>
            );
          })}
        </div>

        {filteredIndustries.length > 5 && (
          <button 
            type="button"
            className="btn-toggle-expand"
            onClick={() => setShowAllIndustries(!showAllIndustries)}
          >
            <span>{showAllIndustries ? 'Show Less' : `+ Show ${filteredIndustries.length - 5} More Industries`}</span>
            {showAllIndustries ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      {/* 10. COMPANY SEARCH & VERIFIED TOGGLE */}
      <div className="filter-block-group">
        <span className="filter-block-label">Company</span>
        <div className="filter-input-search-box">
          <Building2 size={14} className="filter-input-icon" />
          <input 
            type="text"
            placeholder="Search company name..."
            value={filters.companyName}
            onChange={(e) => onFilterChange({ ...filters, companyName: e.target.value })}
            className="filter-text-input"
          />
        </div>

        <label className="filter-toggle-switch-row">
          <div className="toggle-switch-text">
            <ShieldCheck size={15} color="#10b981" />
            <span>Verified Companies only</span>
          </div>
          <input 
            type="checkbox"
            checked={filters.verifiedCompanyOnly}
            onChange={(e) => onFilterChange({ ...filters, verifiedCompanyOnly: e.target.checked })}
            className="filter-toggle-checkbox"
          />
        </label>
      </div>

      {/* 11. BENEFITS / PERKS */}
      <div className="filter-block-group">
        <span className="filter-block-label">Benefits & Perks</span>
        <div className="chips-grid-wrap">
          {[
            'Visa Sponsorship',
            'Relocation Package',
            'Health Insurance',
            'Work From Home',
            'Flexible Hours',
            'Paid Leave',
            'ESOP',
            'Performance Bonus'
          ].map(benefit => {
            const active = filters.benefits.includes(benefit);
            return (
              <button
                key={benefit}
                type="button"
                className={`filter-selector-chip ${active ? 'selected' : ''}`}
                onClick={() => toggleBenefit(benefit)}
              >
                {active && <Check size={12} />}
                <span>{benefit}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 12. DATE POSTED */}
      <div className="filter-block-group">
        <span className="filter-block-label">Date Posted</span>
        <div className="chips-grid-wrap">
          {[
            { id: 'all', label: 'Anytime' },
            { id: '24h', label: 'Today' },
            { id: '3d', label: 'Last 3 Days' },
            { id: '7d', label: 'Last 7 Days' },
            { id: '30d', label: 'Last 30 Days' }
          ].map(date => {
            const active = filters.postedDate === date.id;
            return (
              <button
                key={date.id}
                type="button"
                className={`filter-selector-chip ${active ? 'selected' : ''}`}
                onClick={() => onFilterChange({ ...filters, postedDate: date.id })}
              >
                {active && <Check size={12} />}
                <span>{date.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 13. ADVANCED FILTERS ("More Filters" Accordion) */}
      <div className="filter-block-group">
        <button 
          type="button"
          className="more-filters-accordion-header"
          onClick={() => setShowMoreFilters(!showMoreFilters)}
        >
          <div className="accordion-title">
            <Sparkles size={15} color="var(--color-primary)" />
            <span>More Advanced Filters</span>
          </div>
          {showMoreFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showMoreFilters && (
          <div className="more-filters-accordion-body">
            {/* Notice Period */}
            <div className="filter-select-wrapper">
              <label className="filter-field-sublabel">Notice Period</label>
              <select
                value={filters.noticePeriod || 'any'}
                onChange={(e) => onFilterChange({ ...filters, noticePeriod: e.target.value })}
                className="filter-select-dropdown"
              >
                <option value="any">Any Notice Period</option>
                <option value="immediate">Immediate Joiner</option>
                <option value="15days">15 Days or less</option>
                <option value="30days">30 Days or less</option>
                <option value="60days">60 Days</option>
              </select>
            </div>

            {/* Minimum Education */}
            <div className="filter-select-wrapper">
              <label className="filter-field-sublabel">Education Level</label>
              <select
                value={filters.education}
                onChange={(e) => onFilterChange({ ...filters, education: e.target.value })}
                className="filter-select-dropdown"
              >
                <option value="Any Education">Any Education</option>
                <option value="Bachelor's Degree">Bachelor's Degree</option>
                <option value="Master's Degree">Master's Degree</option>
                <option value="Doctorate / PhD">Doctorate / PhD</option>
              </select>
            </div>

            {/* Preferred Language */}
            <div className="filter-select-wrapper">
              <label className="filter-field-sublabel">Preferred Language</label>
              <select
                value={filters.language || 'any'}
                onChange={(e) => onFilterChange({ ...filters, language: e.target.value })}
                className="filter-select-dropdown"
              >
                <option value="any">Any Language</option>
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
                <option value="arabic">Arabic</option>
                <option value="german">German</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* DESKTOP ACTION FOOTER */}
      <div className="filter-desktop-footer">
        <button 
          type="button" 
          className="btn-desktop-reset"
          onClick={onResetFilters}
        >
          Reset All
        </button>
        <button 
          type="button"
          className="btn-desktop-apply"
          onClick={() => {}}
        >
          Apply Filters
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR CONTAINER */}
      <aside className="getworxs-filter-sidebar desktop-only">
        {renderFilterContent()}
      </aside>

      {/* MOBILE TOP TRIGGER BAR ([Filter] [Sort]) */}
      <div className="mobile-filter-trigger-bar mobile-only">
        <button 
          type="button"
          className="btn-mobile-trigger-filter"
          onClick={() => setMobileDrawerOpen(true)}
        >
          <Filter size={16} />
          <span>Filter</span>
          {appliedFiltersCount > 0 && (
            <span className="mobile-badge-count">{appliedFiltersCount}</span>
          )}
        </button>
      </div>

      {/* MOBILE FULL-SCREEN FILTER DRAWER */}
      {mobileDrawerOpen && (
        <div className="mobile-filter-drawer-overlay">
          <div className="mobile-filter-drawer-content">
            <div className="drawer-header-top">
              <h3>Filter Jobs</h3>
              <button 
                type="button" 
                className="btn-close-drawer"
                onClick={() => setMobileDrawerOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="drawer-scrollable-body">
              {renderFilterContent()}
            </div>

            {/* STICKY BOTTOM BAR IN MOBILE DRAWER */}
            <div className="mobile-drawer-sticky-bottom">
              <button 
                type="button"
                className="btn-mobile-clear"
                onClick={onResetFilters}
              >
                Clear All
              </button>
              <button 
                type="button"
                className="btn-mobile-show-jobs"
                onClick={() => setMobileDrawerOpen(false)}
              >
                Show {matchingCount} Jobs
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
