import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '', showTagline = true }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`${iconSizes[size]} rounded-xl bg-slate-900 border border-slate-800 shadow-xs flex items-center justify-center p-1.5 shrink-0`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-emerald-400" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="5" className="stroke-slate-700" fill="#0F172A" />
          <path d="M12 7v10" stroke="#10B981" strokeWidth="2" />
          <path d="M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0z" stroke="#34D399" strokeWidth="1.8" fill="#10B981" fillOpacity="0.15" />
          <circle cx="12" cy="12" r="1.5" fill="#34D399" />
        </svg>
      </div>
      <div className="flex flex-col justify-center">
        <div className="flex items-baseline leading-none">
          <span className={`font-sans ${textSizes[size]} font-bold tracking-tight text-slate-900`}>
            footyfolio
          </span>
          <span className="text-amber-500 font-black leading-none ml-0.5">.</span>
        </div>
        {showTagline && (
          <p className="text-[9px] font-sans text-slate-500 tracking-widest uppercase mt-0.5 font-semibold">
            get scouted. get seen.
          </p>
        )}
      </div>
    </div>
  );
};
