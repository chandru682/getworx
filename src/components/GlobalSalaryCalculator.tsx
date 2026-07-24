import React, { useState } from 'react';
import { DollarSign, Calculator, ArrowRight, Info } from 'lucide-react';
import { formatAmount, type CurrencyCode } from '../utils/currency';

interface CityData {
  name: string;
  country: string;
  flag: string;
  colIndex: number; // Cost of Living vs SF (100)
  rentIndex: number;
  taxRateEst: number;
  currency: CurrencyCode;
}

const CITIES: Record<string, CityData> = {
  blr: { name: 'Bengaluru', country: 'India', flag: '🇮🇳', colIndex: 28, rentIndex: 22, taxRateEst: 0.22, currency: 'INR' },
  mumbai: { name: 'Mumbai', country: 'India', flag: '🇮🇳', colIndex: 32, rentIndex: 28, taxRateEst: 0.22, currency: 'INR' },
  delhi: { name: 'New Delhi', country: 'India', flag: '🇮🇳', colIndex: 30, rentIndex: 25, taxRateEst: 0.22, currency: 'INR' },
  dubai: { name: 'Dubai', country: 'United Arab Emirates', flag: '🇦🇪', colIndex: 75, rentIndex: 70, taxRateEst: 0.0, currency: 'AED' },
  abudhabi: { name: 'Abu Dhabi', country: 'United Arab Emirates', flag: '🇦🇪', colIndex: 72, rentIndex: 65, taxRateEst: 0.0, currency: 'AED' },
  sharjah: { name: 'Sharjah', country: 'United Arab Emirates', flag: '🇦🇪', colIndex: 60, rentIndex: 45, taxRateEst: 0.0, currency: 'AED' },
};

export const GlobalSalaryCalculator: React.FC<{ activeCurrency: CurrencyCode }> = ({ activeCurrency }) => {
  const [role, setRole] = useState('Senior Full-Stack Developer');
  const [experienceYears, setExperienceYears] = useState(5);
  const [baseUSD, setBaseUSD] = useState(140000);
  const [homeCityKey, setHomeCityKey] = useState('blr');
  const [targetCityKey, setTargetCityKey] = useState('dubai');

  const homeCity = CITIES[homeCityKey] || CITIES.blr;
  const targetCity = CITIES[targetCityKey] || CITIES.dubai;

  // Purchasing Power Parity (PPP) equivalent formula
  const pppRatio = targetCity.colIndex / homeCity.colIndex;
  const targetEquivalentUSD = baseUSD * pppRatio;

  // Converted to target currency & active user currency
  const homeSalaryInUserCurrency = formatAmount(baseUSD, activeCurrency);
  const targetEquivalentInUserCurrency = formatAmount(targetEquivalentUSD, activeCurrency);
  const targetEquivalentInLocalCurrency = formatAmount(targetEquivalentUSD, targetCity.currency);

  const homeNetEstUSD = baseUSD * (1 - homeCity.taxRateEst);
  const targetNetEstUSD = targetEquivalentUSD * (1 - targetCity.taxRateEst);

  return (
    <div className="widget-box" style={{ gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Calculator size={22} style={{ color: 'var(--color-primary)' }} />
            <h3 style={{ fontSize: '20px', fontWeight: '800' }}>Global Tech Salary & PPP Cost-of-Living Converter</h3>
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
            Compare real purchasing power, local tax rates, and net take-home salary across major tech hubs in India and UAE.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* Role Select */}
        <div>
          <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
            Job Specialization
          </label>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
            className="filter-select"
            style={{ padding: '10px 14px' }}
          >
            <option value="Senior Full-Stack Developer">Senior Full-Stack Developer</option>
            <option value="Frontend Architect">Frontend Architect</option>
            <option value="Lead Product Designer">Lead Product Designer</option>
            <option value="DevOps & Cloud Engineer">DevOps & Cloud Engineer</option>
            <option value="AI / ML Engineer">AI / ML Engineer</option>
            <option value="FinTech Treasury Specialist">FinTech Treasury Specialist</option>
            <option value="Cybersecurity Lead">Cybersecurity Lead</option>
          </select>
        </div>

        {/* Experience Slider */}
        <div>
          <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
            Experience Level: {experienceYears} Years
          </label>
          <input 
            type="range" 
            min="0" 
            max="15" 
            value={experienceYears} 
            onChange={(e) => setExperienceYears(Number(e.target.value))}
            style={{ width: '100%', margin: '12px 0', cursor: 'pointer' }}
          />
        </div>

        {/* Base USD Salary Input */}
        <div>
          <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
            Base Offer (USD)
          </label>
          <div style={{ position: 'relative' }}>
            <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="number"
              value={baseUSD}
              onChange={(e) => setBaseUSD(Number(e.target.value))}
              style={{ width: '100%', padding: '10px 14px 10px 34px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', fontWeight: '700' }}
            />
          </div>
        </div>
      </div>

      {/* Comparison Cities Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'center', backgroundColor: 'var(--bg-card-hover)', padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Current Location
          </span>
          <select 
            value={homeCityKey} 
            onChange={(e) => setHomeCityKey(e.target.value)}
            className="filter-select"
            style={{ marginTop: '6px', fontWeight: '700' }}
          >
            {Object.entries(CITIES).map(([k, c]) => (
              <option key={k} value={k}>
                {c.flag} {c.name}, {c.country}
              </option>
            ))}
          </select>
        </div>

        <div style={{ textAlign: 'center', paddingTop: '16px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <ArrowRight size={18} />
          </div>
        </div>

        <div>
          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Target Relocation / Remote Hub
          </span>
          <select 
            value={targetCityKey} 
            onChange={(e) => setTargetCityKey(e.target.value)}
            className="filter-select"
            style={{ marginTop: '6px', fontWeight: '700' }}
          >
            {Object.entries(CITIES).map(([k, c]) => (
              <option key={k} value={k}>
                {c.flag} {c.name}, {c.country}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dynamic Results Display */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        {/* Card 1: Home City Breakdown */}
        <div style={{ padding: '20px', borderRadius: '14px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '24px' }}>{homeCity.flag}</span>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '800' }}>{homeCity.name} Benchmark</h4>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Cost of Living Index: {homeCity.colIndex}</span>
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-primary)', margin: '12px 0 4px 0' }}>
            {homeSalaryInUserCurrency} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>/ yr</span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Est. Tax Rate:</span>
              <span style={{ fontWeight: '700' }}>{(homeCity.taxRateEst * 100).toFixed(0)}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Est. Take-Home (USD):</span>
              <span style={{ fontWeight: '700', color: 'var(--color-success)' }}>${Math.round(homeNetEstUSD).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Target City PPP Equivalent */}
        <div style={{ padding: '20px', borderRadius: '14px', border: '2px solid var(--color-primary)', backgroundColor: 'rgba(99, 102, 241, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '24px' }}>{targetCity.flag}</span>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-primary)' }}>
                {targetCity.name} Equivalent
              </h4>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                PPP Factor: {(pppRatio * 100).toFixed(0)}% of {homeCity.name}
              </span>
            </div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--color-primary)', margin: '12px 0 4px 0' }}>
            {targetEquivalentInLocalCurrency} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>/ yr</span>
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            (In Selected View Currency: <strong>{targetEquivalentInUserCurrency}</strong>)
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Local Tax Rate:</span>
              <span style={{ fontWeight: '700', color: targetCity.taxRateEst === 0 ? 'var(--color-success)' : 'inherit' }}>
                {targetCity.taxRateEst === 0 ? '0% Tax-Free 🎉' : `${(targetCity.taxRateEst * 100).toFixed(0)}%`}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Est. Take-Home (USD):</span>
              <span style={{ fontWeight: '700', color: 'var(--color-success)' }}>${Math.round(targetNetEstUSD).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '12px 16px', backgroundColor: 'var(--bg-card-hover)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
        <Info size={16} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
        <span>
          Purchasing Power Parity (PPP) calculations automatically adjust for local housing, goods, healthcare, and tax structures.
        </span>
      </div>
    </div>
  );
};
