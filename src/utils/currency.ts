export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'AUD' | 'JPY' | 'CAD' | 'SGD' | 'AED';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateVsUSD: number; // 1 USD = X Currency
  flag: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rateVsUSD: 1.0, flag: '🇺🇸' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rateVsUSD: 0.92, flag: '🇪🇺' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rateVsUSD: 0.79, flag: '🇬🇧' },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateVsUSD: 83.5, flag: '🇮🇳' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rateVsUSD: 1.52, flag: '🇦🇺' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rateVsUSD: 155.0, flag: '🇯🇵' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rateVsUSD: 1.36, flag: '🇨🇦' },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rateVsUSD: 1.35, flag: '🇸🇬' },
  AED: { code: 'AED', symbol: 'AED', name: 'UAE Dirham', rateVsUSD: 3.67, flag: '🇦🇪' },
};

export type RegionCode = 'all' | 'sa' | 'mea' | 'na' | 'eu' | 'ap' | 'aus';

export interface RegionConfig {
  code: RegionCode;
  name: string;
  flag: string;
  cities: string[];
}

export const REGIONS: Record<RegionCode, RegionConfig> = {
  all: { code: 'all', name: 'Global (All Regions)', flag: '🌐', cities: ['Worldwide'] },
  sa: { code: 'sa', name: 'South Asia (India)', flag: '🇮🇳', cities: ['Bengaluru', 'Mumbai', 'Gurugram', 'Hyderabad', 'Pune', 'Chennai', 'Noida'] },
  mea: { code: 'mea', name: 'Middle East & Africa (UAE)', flag: '🇦🇪', cities: ['Dubai', 'Abu Dhabi', 'Sharjah'] },
  na: { code: 'na', name: 'North America', flag: '🇺🇸', cities: ['San Francisco', 'New York', 'Toronto'] },
  eu: { code: 'eu', name: 'Europe', flag: '🇪🇺', cities: ['London', 'Berlin'] },
  ap: { code: 'ap', name: 'Asia Pacific', flag: '🇸🇬', cities: ['Singapore', 'Tokyo'] },
  aus: { code: 'aus', name: 'Australia', flag: '🇦🇺', cities: ['Sydney', 'Melbourne'] },
};

/**
 * Converts a base USD amount to target currency and formats it.
 */
export function formatAmount(usdAmount: number, currencyCode: CurrencyCode): string {
  const config = CURRENCIES[currencyCode] || CURRENCIES.USD;
  const converted = usdAmount * config.rateVsUSD;

  if (currencyCode === 'INR') {
    // Round to nearest 50,000 for clean display e.g. ₹12,50,000
    const rounded = Math.round(converted / 10000) * 10000;
    return `${config.symbol}${rounded.toLocaleString('en-IN')}`;
  }
  if (currencyCode === 'JPY') {
    const rounded = Math.round(converted / 1000) * 1000;
    return `${config.symbol}${rounded.toLocaleString('ja-JP')}`;
  }

  // General rounding to nearest 1,000 or whole amount
  if (converted >= 1000) {
    const rounded = Math.round(converted / 500) * 500;
    return `${config.symbol}${rounded.toLocaleString('en-US')}`;
  }
  return `${config.symbol}${Math.round(converted).toLocaleString('en-US')}`;
}

/**
 * Formats budget range (min & max in USD) to target currency string.
 */
export function formatSalaryRange(
  minUSD: number, 
  maxUSD: number | null, 
  jobType: string, 
  currencyCode: CurrencyCode
): string {
  const config = CURRENCIES[currencyCode] || CURRENCIES.USD;

  if (jobType === 'Contract' || jobType === 'Hourly') {
    // Hourly rate
    const minHourly = Math.round(minUSD * config.rateVsUSD);
    if (maxUSD) {
      const maxHourly = Math.round(maxUSD * config.rateVsUSD);
      return `${config.symbol}${minHourly} - ${config.symbol}${maxHourly}/hr`;
    }
    return `${config.symbol}${minHourly}/hr`;
  }

  // Annual salary
  const minFormatted = formatAmount(minUSD, currencyCode);
  if (maxUSD) {
    const maxFormatted = formatAmount(maxUSD, currencyCode);
    return `${minFormatted} - ${maxFormatted}/yr`;
  }
  return `${minFormatted}/yr`;
}
