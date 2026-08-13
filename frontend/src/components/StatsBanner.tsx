import { useEffect, useRef, useState } from 'react';
import { Briefcase, Building2, Globe, Users } from 'lucide-react';
import { type LangCode, getTranslation } from '../utils/translate';

interface CountUpProps {
  end: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
}

function CountUp({ end, duration = 2000, decimals = 0, suffix = '' }: CountUpProps) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const isAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isAnimated.current) {
          isAnimated.current = true;
          let startTime: number | null = null;
          const startValue = 0;

          const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            
            // Cubic ease out animation
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentCount = startValue + easeProgress * (end - startValue);
            setCount(currentCount);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setCount(end);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [end, duration]);

  const formatted = count.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return <span ref={elementRef}>{formatted}{suffix}</span>;
}

interface StatsBannerProps {
  activeLang: LangCode;
  liveJobsCount?: number;
  companiesCount?: number;
  countriesCount?: number;
  candidatesCount?: number;
}

export function StatsBanner({ 
  activeLang,
  liveJobsCount = 0,
  companiesCount = 0,
  countriesCount = 0,
  candidatesCount = 0
}: StatsBannerProps) {
  const stats = [
    {
      key: 'live_jobs',
      icon: Briefcase,
      endValue: liveJobsCount,
      decimals: 0,
      suffix: liveJobsCount > 0 ? '+' : '',
      themeClass: 'purple-theme',
      styles: {
        '--icon-bg': 'var(--tag-purple-bg)',
        '--icon-color': 'var(--tag-purple-text)',
        '--icon-border': 'var(--tag-purple-border)',
        '--icon-shadow': 'rgba(109, 40, 217, 0.15)',
      } as React.CSSProperties,
    },
    {
      key: 'hiring_companies',
      icon: Building2,
      endValue: companiesCount,
      decimals: 0,
      suffix: companiesCount > 0 ? '+' : '',
      themeClass: 'cyan-theme',
      styles: {
        '--icon-bg': 'var(--tag-cyan-bg)',
        '--icon-color': 'var(--tag-cyan-text)',
        '--icon-border': 'var(--tag-cyan-border)',
        '--icon-shadow': 'rgba(2, 132, 199, 0.15)',
      } as React.CSSProperties,
    },
    {
      key: 'countries',
      icon: Globe,
      endValue: countriesCount,
      decimals: 0,
      suffix: countriesCount > 0 ? '+' : '',
      themeClass: 'amber-theme',
      styles: {
        '--icon-bg': 'var(--tag-amber-bg)',
        '--icon-color': 'var(--tag-amber-text)',
        '--icon-border': 'var(--tag-amber-border)',
        '--icon-shadow': 'rgba(217, 119, 6, 0.15)',
      } as React.CSSProperties,
    },
    {
      key: 'registered_professionals',
      icon: Users,
      endValue: candidatesCount,
      decimals: 0,
      suffix: candidatesCount > 0 ? '+' : '',
      themeClass: 'emerald-theme',
      styles: {
        '--icon-bg': 'var(--tag-emerald-bg)',
        '--icon-color': 'var(--tag-emerald-text)',
        '--icon-border': 'var(--tag-emerald-border)',
        '--icon-shadow': 'rgba(5, 150, 105, 0.15)',
      } as React.CSSProperties,
    },
  ];

  return (
    <div className="stats-banner">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <div key={stat.key} className="stats-item">
            <div 
              className="stats-icon-wrapper" 
              style={stat.styles}
            >
              <IconComponent size={22} className="stats-icon" />
            </div>
            <div className="stats-content">
              <span className="stats-number">
                <CountUp 
                  end={stat.endValue} 
                  decimals={stat.decimals} 
                  suffix={stat.suffix} 
                  duration={2000}
                />
              </span>
              <span className="stats-label">
                {getTranslation(activeLang, stat.key as any)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
