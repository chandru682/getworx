import React, { useState } from 'react';
import { 
  JOB_CATEGORIES, 
  getCleanCategoryName
} from '../data/jobCategoriesData';
import { 
  Code2, 
  Building2, 
  TrendingUp, 
  Target, 
  Users, 
  Headphones, 
  Cpu, 
  Factory, 
  HardHat, 
  HeartPulse, 
  Pill, 
  GraduationCap, 
  Scale, 
  Landmark, 
  Truck, 
  Plane, 
  UtensilsCrossed, 
  Film, 
  Palette, 
  ShoppingBag, 
  ShoppingCart, 
  Sprout, 
  Home, 
  Radio, 
  Zap, 
  Shield, 
  FlaskConical, 
  HeartHandshake, 
  Laptop, 
  Wrench, 
  Navigation, 
  Rocket, 
  FolderKanban,
  Search,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { type CurrencyCode, CURRENCIES } from '../utils/currency';

interface CategoryExplorerProps {
  selectedCategories: string[];
  onSelectCategory: (categoryOrSubCategoryName: string) => void;
  onSelectSubCategory?: (subCategoryName: string) => void;
  activeCurrency?: CurrencyCode;
}

interface CategoryEnrichment {
  liveJobs: number;
  companiesHiring: number;
  avgSalaryMinUSD: number;
  avgSalaryMaxUSD: number;
  trend: string;
  trendUp: boolean;
  badge?: string;
  topSkills: string[];
}

const CATEGORY_ENRICHMENTS: Record<string, Partial<CategoryEnrichment>> = {
  it: {
    liveJobs: 12458,
    companiesHiring: 2350,
    avgSalaryMinUSD: 95000,
    avgSalaryMaxUSD: 170000,
    trend: "+18%",
    trendUp: true,
    badge: "🔥 AI Boom",
    topSkills: ["React", "Node.js", "Python", "AWS", "Docker"]
  },
  bfsi: {
    liveJobs: 8240,
    companiesHiring: 1420,
    avgSalaryMinUSD: 85000,
    avgSalaryMaxUSD: 155000,
    trend: "+12%",
    trendUp: true,
    badge: "⭐ Most Applied",
    topSkills: ["Risk Mgmt", "Taxation", "FinTech", "Accounting", "Auditing"]
  },
  sales: {
    liveJobs: 9850,
    companiesHiring: 1850,
    avgSalaryMinUSD: 60000,
    avgSalaryMaxUSD: 120000,
    trend: "+15%",
    trendUp: true,
    badge: "🟢 Hiring Now",
    topSkills: ["B2B Sales", "Negotiation", "CRM", "SaaS Sales", "Account Mgmt"]
  },
  marketing: {
    liveJobs: 6540,
    companiesHiring: 1100,
    avgSalaryMinUSD: 55000,
    avgSalaryMaxUSD: 110000,
    trend: "+9%",
    trendUp: true,
    badge: "🔥 Trending",
    topSkills: ["SEO", "Google Ads", "Content Strategy", "PPC", "Analytics"]
  },
  hr: {
    liveJobs: 3420,
    companiesHiring: 890,
    avgSalaryMinUSD: 50000,
    avgSalaryMaxUSD: 95000,
    trend: "+6%",
    trendUp: true,
    topSkills: ["Talent Acquisition", "HR Operations", "HRBP", "Payroll", "Relations"]
  },
  engineering: {
    liveJobs: 7120,
    companiesHiring: 950,
    avgSalaryMinUSD: 80000,
    avgSalaryMaxUSD: 145000,
    trend: "+14%",
    trendUp: true,
    badge: "🚀 Fast Growing",
    topSkills: ["CAD", "SolidWorks", "MATLAB", "PLC", "Circuit Design"]
  },
  healthcare: {
    liveJobs: 8900,
    companiesHiring: 1200,
    avgSalaryMinUSD: 110000,
    avgSalaryMaxUSD: 220000,
    trend: "+16%",
    trendUp: true,
    badge: "🟢 Hiring Now",
    topSkills: ["Radiology", "MRI", "Clinical Care", "Nursing", "Surgery"]
  },
  startup: {
    liveJobs: 4120,
    companiesHiring: 780,
    avgSalaryMinUSD: 70000,
    avgSalaryMaxUSD: 135000,
    trend: "+22%",
    trendUp: true,
    badge: "🚀 Fast Growing",
    topSkills: ["Ops", "Growth hacking", "BizDev", "Pitching", "SaaS"]
  }
};

const getEnrichment = (id: string, _name: string): CategoryEnrichment => {
  const explicit = CATEGORY_ENRICHMENTS[id];
  if (explicit) {
    return {
      liveJobs: explicit.liveJobs || 1200,
      companiesHiring: explicit.companiesHiring || 350,
      avgSalaryMinUSD: explicit.avgSalaryMinUSD || 45000,
      avgSalaryMaxUSD: explicit.avgSalaryMaxUSD || 85000,
      trend: explicit.trend || "+5%",
      trendUp: explicit.trendUp !== undefined ? explicit.trendUp : true,
      badge: explicit.badge,
      topSkills: explicit.topSkills || ["Communication", "Problem Solving", "Management", "Operations", "Strategy"]
    };
  }

  // Deterministic generation based on string character codes
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const jobs = Math.abs((hash * 17) % 3500) + 150;
  const companies = Math.abs((hash * 31) % 450) + 40;
  const minSalary = Math.abs((hash * 13) % 40) + 40;
  const maxSalary = minSalary + Math.abs((hash * 7) % 50) + 20;
  const trendPercent = Math.abs((hash * 9) % 15) + 2;
  
  const defaultSkills = ["Management", "Operations", "Customer Service", "Scheduling", "Support"];
  
  return {
    liveJobs: jobs,
    companiesHiring: companies,
    avgSalaryMinUSD: minSalary * 1000,
    avgSalaryMaxUSD: maxSalary * 1000,
    trend: `+${trendPercent}%`,
    trendUp: true,
    topSkills: defaultSkills.slice(0, 5)
  };
};

function formatSalaryShort(minUSD: number, maxUSD: number, currencyCode: CurrencyCode): string {
  const config = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const convertedMin = minUSD * config.rateVsUSD;
  const convertedMax = maxUSD * config.rateVsUSD;

  const formatVal = (val: number) => {
    if (currencyCode === 'INR') {
      if (val >= 10000000) {
        return `${(val / 10000000).toFixed(1).replace(/\.0$/, '')}Cr`;
      }
      if (val >= 100000) {
        return `${(val / 100000).toFixed(1).replace(/\.0$/, '')}L`;
      }
      return `${Math.round(val / 1000)}K`;
    }
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    return `${Math.round(val / 1000)}K`;
  };

  return `${config.symbol}${formatVal(convertedMin)}–${formatVal(convertedMax)}`;
}

export const CategoryExplorer: React.FC<CategoryExplorerProps> = ({
  selectedCategories,
  onSelectCategory,
  activeCurrency = 'USD'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  // Map icon name to Lucide icon component
  const renderCategoryIcon = (iconName: string, size = 20) => {
    const props = { size, style: { color: 'var(--color-primary)' } };
    switch (iconName) {
      case 'Code2': return <Code2 {...props} />;
      case 'Building2': return <Building2 {...props} />;
      case 'TrendingUp': return <TrendingUp {...props} />;
      case 'Target': return <Target {...props} />;
      case 'Users': return <Users {...props} />;
      case 'Headphones': return <Headphones {...props} />;
      case 'Cpu': return <Cpu {...props} />;
      case 'Factory': return <Factory {...props} />;
      case 'HardHat': return <HardHat {...props} />;
      case 'HeartPulse': return <HeartPulse {...props} />;
      case 'Pill': return <Pill {...props} />;
      case 'GraduationCap': return <GraduationCap {...props} />;
      case 'Scale': return <Scale {...props} />;
      case 'Landmark': return <Landmark {...props} />;
      case 'Truck': return <Truck {...props} />;
      case 'Plane': return <Plane {...props} />;
      case 'UtensilsCrossed': return <UtensilsCrossed {...props} />;
      case 'Film': return <Film {...props} />;
      case 'Palette': return <Palette {...props} />;
      case 'ShoppingBag': return <ShoppingBag {...props} />;
      case 'ShoppingCart': return <ShoppingCart {...props} />;
      case 'Sprout': return <Sprout {...props} />;
      case 'Home': return <Home {...props} />;
      case 'Radio': return <Radio {...props} />;
      case 'Zap': return <Zap {...props} />;
      case 'Shield': return <Shield {...props} />;
      case 'FlaskConical': return <FlaskConical {...props} />;
      case 'HeartHandshake': return <HeartHandshake {...props} />;
      case 'Laptop': return <Laptop {...props} />;
      case 'Wrench': return <Wrench {...props} />;
      case 'Navigation': return <Navigation {...props} />;
      case 'Rocket': return <Rocket {...props} />;
      case 'FolderKanban': return <FolderKanban {...props} />;
      default: return <Sparkles {...props} />;
    }
  };

  const filteredCategories = JOB_CATEGORIES.filter((cat) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const cleanName = getCleanCategoryName(cat.name).toLowerCase();
    const matchesCat = cleanName.includes(q) || cat.name.toLowerCase().includes(q);
    const matchesSub = cat.subcategories.some((sub) => sub.toLowerCase().includes(q));
    return matchesCat || matchesSub;
  });

  const displayedCategories = showAll ? filteredCategories : filteredCategories.slice(0, 6);

  return (
    <div className="widget-box category-explorer-widget" style={{ padding: '32px', borderRadius: 'var(--radius-xl)' }}>
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
        <div>
          <span className="hero-badge" style={{ marginBottom: '10px', display: 'inline-flex', alignItems: 'center', fontWeight: '800', gap: '6px' }}>
            <span>🔥</span> 33 Industries • 300+ Categories • 100,000+ Live Jobs
          </span>
          <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '6px 0 8px 0', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Browse Jobs by Industry & Specialization
          </h2>
          <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Discover thousands of verified job opportunities across industries worldwide.
          </p>
        </div>

        {/* Improved Search box aligned perfectly with header */}
        <div className="header-search" style={{ minWidth: '380px', height: '44px' }}>
          <Search size={16} className="text-secondary" />
          <input 
            type="text"
            placeholder="Search industries, categories, roles or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid of Categories */}
      <div className="category-explorer-grid">
        {displayedCategories.map((cat) => {
          const cleanName = getCleanCategoryName(cat.name);
          const isSelected = selectedCategories.includes(cleanName) || selectedCategories.includes(cat.name);
          const enrichment = getEnrichment(cat.id, cat.name);

          return (
            <div 
              key={cat.id} 
              className={`premium-industry-card ${isSelected ? 'selected' : ''}`}
            >
              <div className="industry-card-body">
                {/* Header: Icon & Badges */}
                <div className="industry-card-header">
                  <div className="industry-icon-box">
                    {renderCategoryIcon(cat.icon, 22)}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    {enrichment.badge && (
                      <span className={`industry-top-badge ${
                        enrichment.badge.includes("AI") ? "ai-boom" : 
                        enrichment.badge.includes("Trending") ? "trending" : 
                        enrichment.badge.includes("Applied") ? "most-applied" : 
                        enrichment.badge.includes("Growing") ? "fast-growing" : 
                        "hiring-now"
                      }`}>
                        {enrichment.badge}
                      </span>
                    )}
                    <span className="industry-trend-badge">
                      📈 Hiring {enrichment.trend}
                    </span>
                  </div>
                </div>

                {/* Title & Categories count */}
                <div className="industry-title-block">
                  <h4 className="industry-title">{cleanName}</h4>
                  <span className="industry-subtitle">{cat.subcategories.length} Categories</span>
                </div>

                {/* Stats Grid */}
                <div className="industry-stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Live Jobs</span>
                    <span className="stat-value">{enrichment.liveJobs.toLocaleString()}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Hiring Companies</span>
                    <span className="stat-value">{enrichment.companiesHiring.toLocaleString()}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Avg Salary ({activeCurrency})</span>
                    <span className="stat-value salary">
                      {formatSalaryShort(
                        enrichment.avgSalaryMinUSD,
                        enrichment.avgSalaryMaxUSD,
                        activeCurrency
                      )}
                    </span>
                  </div>
                </div>

                {/* Demanded Skills - displaying top 4 chips + more indicators */}
                <div className="industry-skills-row">
                  <span className="skills-label">Top Skills</span>
                  <div className="skills-tags-container">
                    {enrichment.topSkills.slice(0, 4).map((skill) => (
                      <span key={skill} className="skill-tag">
                        {skill}
                      </span>
                    ))}
                    {cat.subcategories.length > 4 && (
                      <span className="skill-tag more-tag">
                        +{cat.subcategories.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="industry-card-footer">
                <button 
                  className="browse-industry-btn"
                  onClick={() => onSelectCategory(cleanName)}
                >
                  <span>Browse Jobs</span>
                  <span className="arrow-icon">→</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Actions section */}
      {filteredCategories.length > 6 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '36px' }}>
          <button
            onClick={() => setShowAll(!showAll)}
            className="btn-outline"
            style={{
              padding: '12px 28px',
              fontSize: '14px',
              fontWeight: '700',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderWidth: '1.5px',
              cursor: 'pointer'
            }}
          >
            <span>{showAll ? 'Show Less' : 'View All Industries'}</span>
            <ArrowRight size={16} style={{ transition: 'transform 0.2s', transform: showAll ? 'rotate(-90deg)' : 'none' }} />
          </button>
        </div>
      )}
    </div>
  );
};
