import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  textColor?: string;
  onClick?: () => void;
}

export const GetWorxsLogo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true,
  textColor,
  onClick
}) => {
  const dimensions = size === 'sm' 
    ? { iconWidth: 36, iconHeight: 36, fontSize: '20px' }
    : size === 'lg'
      ? { iconWidth: 56, iconHeight: 56, fontSize: '30px' }
      : { iconWidth: 44, iconHeight: 44, fontSize: '24px' };

  return (
    <div 
      className="getworxs-brand-logo" 
      onClick={onClick}
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        gap: '12px', 
        cursor: 'pointer',
        userSelect: 'none'
      }}
    >
      <div 
        className="getworxs-logo-badge"
        style={{
          width: `${dimensions.iconWidth}px`,
          height: `${dimensions.iconHeight}px`,
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #6d28d9 0%, #5b21b6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(109, 40, 217, 0.4)',
          padding: '5px',
          flexShrink: 0
        }}
      >
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '85%', height: '85%' }}>
          {/* Left Person Figure */}
          <circle cx="34" cy="26" r="10" fill="#FFFFFF" />
          <rect x="26" y="42" width="16" height="42" rx="8" fill="#FFFFFF" />

          {/* Right Person Figure */}
          <circle cx="66" cy="26" r="10" fill="#FFFFFF" />
          <rect x="58" y="42" width="16" height="34" rx="8" fill="#FFFFFF" />

          {/* Red Smile Accent */}
          <path d="M 32 54 Q 50 72 68 54" stroke="#FF1744" strokeWidth="8" strokeLinecap="round" fill="none" />
        </svg>
      </div>

      {showText && (
        <span 
          style={{ 
            fontSize: dimensions.fontSize, 
            fontWeight: '800', 
            letterSpacing: '-0.8px',
            color: textColor || 'var(--text-primary)',
            fontFamily: 'var(--font-sans)',
            lineHeight: 1
          }}
        >
          getworxs
        </span>
      )}
    </div>
  );
};
