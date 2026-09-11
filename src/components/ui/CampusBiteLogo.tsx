import React from 'react';

interface CampusBiteLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'dark' | 'light'; // dark for light backgrounds (dark text), light for dark backgrounds (white text)
  showText?: boolean;
}

export const CampusBiteLogo: React.FC<CampusBiteLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'dark',
  showText = true,
}) => {
  const sizeMap = {
    xs: { icon: 'w-6 h-6', text: 'text-base', subtext: 'text-[9px]' },
    sm: { icon: 'w-8 h-8', text: 'text-lg', subtext: 'text-[10px]' },
    md: { icon: 'w-10 h-10', text: 'text-xl', subtext: 'text-xs' },
    lg: { icon: 'w-12 h-12', text: 'text-2xl', subtext: 'text-sm' },
    xl: { icon: 'w-16 h-16', text: 'text-3xl', subtext: 'text-base' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const textColor = variant === 'light' ? 'text-white' : 'text-[#28170B]';
  const badgeBg = variant === 'light' ? 'text-amber-300' : 'text-amber-600';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Campus Bite Arched Fork Icon */}
      <div className={`relative ${currentSize.icon} shrink-0 transition-transform`}>
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
        >
          {/* Outer Arch with Bite Mark on Top-Right */}
          <path
            d="M 22 104 L 22 58 C 22 28 42 16 60 16 C 70 16 78 20 84 26 C 85 24 88 23 91 24 C 95 25 97 29 96 33 C 99 35 100 39 98 43 C 98 47 98 52 98 58 L 98 104"
            stroke="#EA580C"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Inner Parallel Arch */}
          <path
            d="M 38 104 L 38 60 C 38 42 48 32 60 32 C 72 32 82 42 82 60 L 82 104"
            stroke="#EA580C"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Center Fork Symbol */}
          {/* Fork Handle */}
          <path
            d="M 60 104 L 60 72"
            stroke="#EA580C"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Fork Head / Base */}
          <path
            d="M 48 56 C 48 68 72 68 72 56"
            stroke="#EA580C"
            strokeWidth="7"
            strokeLinecap="round"
          />
          {/* Fork Tines (4 prongs) */}
          <path
            d="M 49 56 L 49 44 M 56 56 L 56 44 M 64 56 L 64 44 M 71 56 L 71 44"
            stroke="#EA580C"
            strokeWidth="4.5"
            strokeLinecap="round"
          />

          {/* Bite Cutout Subtle Details */}
          <circle cx="89" cy="30" r="4.5" fill="#EA580C" opacity="0.3" />
        </svg>
      </div>

      {/* Official Typography: "Campus Bite" */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1">
            <span
              className={`font-black tracking-tight ${currentSize.text} ${textColor}`}
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
            >
              Campus Bite
            </span>
            <span className={`text-[9px] font-black ${badgeBg} -mt-2 ml-0.5`}>
              ®
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
