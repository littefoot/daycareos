import React from 'react';

interface AccsLogoProps {
  variant?: 'full' | 'icon' | 'white';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  brandName?: string;
  subtitle?: string;
  onClick?: () => void;
}

export const AccsLogo: React.FC<AccsLogoProps> = ({
  variant = 'full',
  className = '',
  size = 'md',
  brandName = 'DaycareOS',
  subtitle = 'Licensed Child Care Platform',
  onClick
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7 sm:w-8 sm:h-8',
    lg: 'w-10 h-10 sm:w-12 sm:h-12'
  };

  const textSizes = {
    sm: 'text-sm sm:text-base',
    md: 'text-base sm:text-xl',
    lg: 'text-lg sm:text-2xl'
  };

  const subtitleSizes = {
    sm: 'text-[7.5px] sm:text-[8px]',
    md: 'text-[8.5px] sm:text-[9.5px]',
    lg: 'text-[10.5px] sm:text-[12px]'
  };

  const isWhite = variant === 'white';
  const isDefaultBrand = !brandName || brandName === 'Home Care' || brandName === 'ACCS Hub' || brandName === 'All Child Care Solutions' || brandName === 'DaycareOS';
  const isDefaultSubtitle = !subtitle || subtitle === 'Portal' || subtitle === 'Home Care Hub' || subtitle === 'Licensed Child Care Platform';

  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-2 sm:gap-2.5 select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
      title={onClick ? "DaycareOS Command Centre" : undefined}
    >
      {/* Clean Orange Hex/Circle App Mark */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center flex-shrink-0 transition-transform ${onClick ? 'group-hover:scale-105' : ''}`}>
        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-[#ff6900] to-[#e05d00] shadow-sm flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_#0f172a]">
          <span className="text-white font-black text-xs sm:text-sm tracking-tighter">D</span>
        </div>
      </div>

      {/* Brand Typography */}
      {variant !== 'icon' && (
        <div className="flex flex-col leading-none">
          <div className={`font-black tracking-tight font-sans flex items-center gap-0.5 ${textSizes[size]} ${isWhite ? 'text-white' : 'text-slate-900'} ${onClick ? 'group-hover:text-orange-600 transition-colors' : ''}`}>
            {isDefaultBrand ? (
              <>
                <span>Daycare</span>
                <span className={isWhite ? 'text-white' : 'text-[#ff6900]'}>OS</span>
              </>
            ) : (
              <span>{brandName}</span>
            )}
          </div>

          {isDefaultSubtitle ? (
            <div className={`w-full flex justify-between ${subtitleSizes[size]} font-black uppercase tracking-wider ${isWhite ? 'text-orange-200' : 'text-slate-600'} ${onClick ? 'group-hover:text-orange-700' : ''} mt-0.5 select-none`}>
              <span>C</span>
              <span>H</span>
              <span>I</span>
              <span>L</span>
              <span>D</span>
              <span>&nbsp;</span>
              <span>C</span>
              <span>A</span>
              <span>R</span>
              <span>E</span>
            </div>
          ) : (
            <span className={`text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider ${isWhite ? 'text-orange-200' : 'text-slate-600'} ${onClick ? 'group-hover:text-orange-700' : ''} mt-0.5`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export const DaycareOsLogo = AccsLogo;
