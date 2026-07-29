import React, { useState } from 'react';
import { Globe, TrendingUp, Search } from 'lucide-react';
import { type CurrencyCode, type RegionCode, CURRENCIES } from '../utils/currency';

interface GlobalHubsWidgetProps {
  activeCurrency: CurrencyCode;
  selectedRegion: RegionCode;
  onSelectRegion: (region: RegionCode) => void;
}

interface HubInfo {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  region: RegionCode;
  avgSalaryUSD: number;
  openings: number;
  topTech: string[];
  topCompanies: string[];
  growth: string;
}

const GLOBAL_HUBS: HubInfo[] = [
  // South Asia
  {
    id: 'hub-blr',
    name: 'Bengaluru',
    country: 'India',
    countryCode: 'in',
    region: 'sa',
    avgSalaryUSD: 55000,
    openings: 2400,
    topTech: ['React', 'Node.js', 'Python', 'AWS'],
    topCompanies: ['Google', 'Microsoft', 'Amazon'],
    growth: '+28% YoY'
  },
  {
    id: 'hub-mumbai',
    name: 'Mumbai',
    country: 'India',
    countryCode: 'in',
    region: 'sa',
    avgSalaryUSD: 52000,
    openings: 1800,
    topTech: ['React', 'TypeScript', 'Node.js', 'AWS'],
    topCompanies: ['TCS', 'HDFC Bank', 'Reliance'],
    growth: '+22% YoY'
  },
  {
    id: 'hub-delhi',
    name: 'Delhi NCR',
    country: 'India',
    countryCode: 'in',
    region: 'sa',
    avgSalaryUSD: 48000,
    openings: 1550,
    topTech: ['Python', 'Django', 'React', 'AWS'],
    topCompanies: ['Paytm', 'Zomato', 'MakeMyTrip'],
    growth: '+20% YoY'
  },
  // Middle East
  {
    id: 'hub-dubai',
    name: 'Dubai',
    country: 'United Arab Emirates',
    countryCode: 'ae',
    region: 'mea',
    avgSalaryUSD: 140000,
    openings: 430,
    topTech: ['React', 'Node.js', 'Python', 'Docker'],
    topCompanies: ['Binance', 'Careem', 'Emirates'],
    growth: '+25% YoY'
  },
  {
    id: 'hub-abudhabi',
    name: 'Abu Dhabi',
    country: 'United Arab Emirates',
    countryCode: 'ae',
    region: 'mea',
    avgSalaryUSD: 135000,
    openings: 280,
    topTech: ['Python', 'PyTorch', 'AWS', 'Docker'],
    topCompanies: ['G42', 'ADIA', 'Etisalat'],
    growth: '+18% YoY'
  },
  // North America
  {
    id: 'hub-sf',
    name: 'San Francisco',
    country: 'United States',
    countryCode: 'us',
    region: 'na',
    avgSalaryUSD: 165000,
    openings: 1450,
    topTech: ['React', 'Node.js', 'Python', 'AWS'],
    topCompanies: ['Google', 'Microsoft', 'Amazon'],
    growth: '+20% YoY'
  },
  {
    id: 'hub-ny',
    name: 'New York',
    country: 'United States',
    countryCode: 'us',
    region: 'na',
    avgSalaryUSD: 155000,
    openings: 1200,
    topTech: ['React', 'TypeScript', 'Java', 'AWS'],
    topCompanies: ['JPMorgan', 'Goldman Sachs', 'Morgan Stanley'],
    growth: '+15% YoY'
  },
  {
    id: 'hub-toronto',
    name: 'Toronto',
    country: 'Canada',
    countryCode: 'ca',
    region: 'na',
    avgSalaryUSD: 115000,
    openings: 620,
    topTech: ['React', 'Ruby', 'Node.js', 'AWS'],
    topCompanies: ['Shopify', 'RBC', 'TD Bank'],
    growth: '+18% YoY'
  },
  // Europe
  {
    id: 'hub-london',
    name: 'London',
    country: 'United Kingdom',
    countryCode: 'gb',
    region: 'eu',
    avgSalaryUSD: 105000,
    openings: 980,
    topTech: ['React', 'TypeScript', 'Node.js', 'Kubernetes'],
    topCompanies: ['Barclays', 'HSBC', 'Revolut'],
    growth: '+16% YoY'
  },
  {
    id: 'hub-berlin',
    name: 'Berlin',
    country: 'Germany',
    countryCode: 'de',
    region: 'eu',
    avgSalaryUSD: 95000,
    openings: 540,
    topTech: ['Golang', 'React', 'Docker', 'Kubernetes'],
    topCompanies: ['Zalando', 'N26', 'Delivery Hero'],
    growth: '+14% YoY'
  },
  // Asia Pacific
  {
    id: 'hub-sg',
    name: 'Singapore',
    country: 'Singapore',
    countryCode: 'sg',
    region: 'ap',
    avgSalaryUSD: 120000,
    openings: 480,
    topTech: ['React', 'Python', 'Golang', 'AWS'],
    topCompanies: ['Grab', 'DBS Bank', 'Sea Group'],
    growth: '+22% YoY'
  },
  {
    id: 'hub-tokyo',
    name: 'Tokyo',
    country: 'Japan',
    countryCode: 'jp',
    region: 'ap',
    avgSalaryUSD: 85000,
    openings: 310,
    topTech: ['Python', 'C++', 'IoT', 'Docker'],
    topCompanies: ['Sony', 'Toyota', 'SoftBank'],
    growth: '+12% YoY'
  },
  // Australia
  {
    id: 'hub-sydney',
    name: 'Sydney',
    country: 'Australia',
    countryCode: 'au',
    region: 'aus',
    avgSalaryUSD: 110000,
    openings: 420,
    topTech: ['React', 'TypeScript', 'AWS', 'Node.js'],
    topCompanies: ['Atlassian', 'Canva', 'Macquarie'],
    growth: '+15% YoY'
  },
  {
    id: 'hub-melbourne',
    name: 'Melbourne',
    country: 'Australia',
    countryCode: 'au',
    region: 'aus',
    avgSalaryUSD: 105000,
    openings: 380,
    topTech: ['React', 'Node.js', 'AWS', 'Python'],
    topCompanies: ['Telstra', 'ANZ Bank', 'BHP'],
    growth: '+13% YoY'
  }
];

export const GlobalHubsWidget: React.FC<GlobalHubsWidgetProps> = ({
  activeCurrency,
  selectedRegion,
  onSelectRegion
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHubs = GLOBAL_HUBS.filter((hub) => {
    const matchesRegion = selectedRegion === 'all' || hub.region === selectedRegion;
    if (!searchQuery.trim()) return matchesRegion;
    const q = searchQuery.toLowerCase();
    const matchesQuery = 
      hub.name.toLowerCase().includes(q) || 
      hub.country.toLowerCase().includes(q) || 
      hub.topTech.some(t => t.toLowerCase().includes(q)) ||
      hub.topCompanies.some(c => c.toLowerCase().includes(q));
    return matchesRegion && matchesQuery;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header section with search and pills */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '8px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Globe size={20} style={{ color: 'var(--color-primary)' }} />
            <h2 style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Global Tech & Talent Hubs</h2>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Explore active hiring benchmarks, localized tech packages, and visa mobility across top international markets.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', width: '100%', justifyContent: 'space-between', marginTop: '10px' }}>
          {/* Improved Search Box */}
          <div className="header-search" style={{ minWidth: '260px', width: '360px', maxWidth: '100%', height: '40px', flexShrink: 0 }}>
            <Search size={14} className="text-secondary" />
            <input 
              type="text" 
              placeholder="Search cities, countries or tech hubs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Region Selector Tabs */}
          <div className="region-pill-group" style={{ maxWidth: '100%' }}>
            {(([
              { code: 'all', label: 'All Hubs', icon: 'globe' },
              { code: 'sa', label: 'South Asia', flagCode: 'in' },
              { code: 'mea', label: 'Middle East', flagCode: 'ae' },
              { code: 'na', label: 'North America', flagCode: 'us' },
              { code: 'eu', label: 'Europe', flagCode: 'eu' },
              { code: 'ap', label: 'Asia Pacific', icon: 'globe-ap' },
              { code: 'aus', label: 'Australia', flagCode: 'au' }
            ]) as { code: RegionCode; label: string; flagCode?: string; icon?: string }[]).map((r) => (
              <button
                key={r.code}
                className={`region-pill ${selectedRegion === r.code ? 'active' : ''}`}
                onClick={() => onSelectRegion(r.code)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                {r.icon === 'globe' && <Globe size={13} />}
                {r.icon === 'globe-ap' && <span style={{ fontSize: '13px', display: 'flex', alignItems: 'center' }}>🌏</span>}
                {r.flagCode && (
                  <img 
                    src={`https://flagcdn.com/w20/${r.flagCode}.png`}
                    alt={r.label}
                    style={{ width: '15px', height: '11px', borderRadius: '1px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                )}
                <span>{r.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Global Hub Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {filteredHubs.map((hub) => {
          const convertedSalary = Math.round(hub.avgSalaryUSD * (CURRENCIES[activeCurrency]?.rateVsUSD || 1.0));
          return (
            <div 
              key={hub.id} 
              className="global-hub-card"
              onClick={() => onSelectRegion(hub.region)}
            >
              <div className="hub-card-body">
                {/* Header: Flag, Country & City */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div>
                    {/* Country flag and full country name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <img 
                        src={`https://flagcdn.com/w40/${hub.countryCode}.png`}
                        alt={hub.country}
                        style={{ width: '18px', height: '13px', borderRadius: '2px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                      />
                      <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                        {hub.country}
                      </span>
                    </div>
                    
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                      {hub.name}
                    </h3>
                  </div>
                  
                  <span className="hub-growth-badge">
                    <TrendingUp size={12} /> {hub.growth}
                  </span>
                </div>

                {/* Stats Grid - Average Annual Salary & Active Jobs */}
                <div style={{ margin: '14px 0', padding: '12px 14px', backgroundColor: 'var(--bg-neutral-light)', borderRadius: 'var(--radius-md)', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
                      Average Annual Salary
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--color-primary)' }}>
                      {activeCurrency} {convertedSalary.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700' }}>
                      Active Jobs
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-primary)' }}>
                      {hub.openings.toLocaleString()} Active Jobs
                    </span>
                  </div>
                </div>

                {/* Top Hiring Companies */}
                <div style={{ margin: '12px 0 16px 0' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: '700', marginBottom: '6px' }}>
                    Top Hiring Companies
                  </span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {hub.topCompanies.map((c) => (
                      <span key={c} style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', padding: '3px 8px', borderRadius: '6px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                        {c}
                      </span>
                    ))}
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', marginLeft: '2px' }}>
                      +More
                    </span>
                  </div>
                </div>

                {/* Globally Recognized Skill Chips */}
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {hub.topTech.map(t => (
                    <span key={t} style={{ fontSize: '10.5px', padding: '3px 8px', borderRadius: '12px', backgroundColor: 'var(--bg-neutral-light)', color: 'var(--text-secondary)', fontWeight: '600', border: '1px solid var(--border-color)' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* View Jobs Primary CTA Button */}
              <div className="hub-card-footer" style={{ marginTop: 'auto' }}>
                <button className="view-jobs-btn">
                  <span>View Jobs</span>
                  <span className="arrow-icon">→</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
