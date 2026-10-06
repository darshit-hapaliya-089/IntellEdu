import React from 'react';
import { Sparkles, Gauge } from 'lucide-react';
import { usePerformanceMode } from '../context/PerformanceModeContext';

export interface PerformanceToggleProps {
  compact?: boolean;
  className?: string;
}

export const PerformanceToggle: React.FC<PerformanceToggleProps> = ({ compact = false, className = '' }) => {
  const { highGraphics, toggleHighGraphics, t } = usePerformanceMode();

  return (
    <button
      onClick={toggleHighGraphics}
      type="button"
      aria-label={`Toggle Performance Mode (Currently ${highGraphics ? 'High Graphics' : 'Normal Mode'})`}
      className={`relative inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer select-none active:scale-95 shrink-0 ${highGraphics
        ? 'bg-linear-to-r from-amber-400 via-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 hover:scale-105'
        : 'bg-slate-200 text-slate-700 hover:bg-slate-300 border border-slate-300'
        } ${className}`}
    >
      {highGraphics ? (
        <>
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin-slow shrink-0" />
          {!compact && (
            <span className="hidden md:inline whitespace-nowrap">
              {t('highGraphics')}
            </span>
          )}
          {!compact && (
            <span className="inline md:hidden whitespace-nowrap">
              High
            </span>
          )}
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
        </>
      ) : (
        <>
          <Gauge className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          {!compact && (
            <span className="hidden md:inline whitespace-nowrap">
              {t('normalMode')}
            </span>
          )}
          {!compact && (
            <span className="inline md:hidden whitespace-nowrap">
              Normal
            </span>
          )}
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-slate-400 shrink-0"></span>
        </>
      )}
    </button>
  );
};

export default PerformanceToggle;
