import React from 'react';

interface AccsLogoProps {
  variant?: 'full' | 'icon' | 'white';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AccsLogo: React.FC<AccsLogoProps> = ({
  variant = 'full',
  className = '',
  size = 'md'
}) => {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const isWhite = variant === 'white';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Playful Stylized Sun & Care Shield Vector Mark */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center flex-shrink-0`}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
          {/* Outer Sun Rays */}
          <circle cx="50" cy="50" r="44" stroke="#ff6900" strokeWidth="4" strokeDasharray="6 6" fill="#fff7ed" />
          
          {/* Friendly Sun Center */}
          <circle cx="50" cy="50" r="32" fill="#ff6900" />
          <circle cx="50" cy="50" r="26" fill="#fcb900" />

          {/* Child & Guardian Silhouette Holding Hands */}
          <path
            d="M38 58C38 51.3726 43.3726 46 50 46C56.6274 46 62 51.3726 62 58V62H38V58Z"
            fill="#0f172a"
          />
          <circle cx="50" cy="38" r="7" fill="#0f172a" />
          
          {/* Sparkling Heart / Care Accent */}
          <path
            d="M66 32C66 29.5 63.5 28 61 30C58.5 28 56 29.5 56 32C56 35 61 38 61 38C61 38 66 35 66 32Z"
            fill="#ef4444"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      {variant !== 'icon' && (
        <div className="flex flex-col leading-tight">
          <div className={`font-bold tracking-tight font-heading flex items-center gap-1.5 ${textSizes[size]} ${isWhite ? 'text-white' : 'text-slate-900'}`}>
            <span>All Child Care</span>
            <span className="text-orange-500 font-extrabold">Solutions</span>
          </div>
          <span className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${isWhite ? 'text-orange-200' : 'text-slate-500'}`}>
            Licensed Home Child Care • Ontario
          </span>
        </div>
      )}
    </div>
  );
};
