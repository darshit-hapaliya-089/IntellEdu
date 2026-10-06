import React from 'react';
import { StepItem } from '../types';
import { usePerformanceMode } from '../context/PerformanceModeContext';
import { cx } from '../utils/cx';

export interface StepCardProps {
  item: StepItem;
}

export const StepCard: React.FC<StepCardProps> = ({ item }) => {
  const { highGraphics } = usePerformanceMode();
  const Icon = item.icon;

  return (
    <div
      className={cx(
        'group relative flex flex-col items-center text-center p-6 sm:p-8 rounded-3xl transition-all duration-300 transform-gpu h-full overflow-hidden select-none',
        highGraphics
          ? 'bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-lg shadow-slate-200/40 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_22px_50px_-12px_rgba(99,102,241,0.28)] hover:border-indigo-300'
          : 'bg-white border border-slate-200 shadow-none hover:border-slate-400'
      )}
    >
      {/* Top Ambient Light Glow on Hover (High Graphics only) */}
      {highGraphics && (
        <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-linear-to-b from-indigo-500/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-2xl" />
      )}

      {/* Step Icon with Glowing Step Number */}
      <div
        className={cx(
          'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-extrabold text-base sm:text-lg mb-5 relative shrink-0 transition-transform duration-300',
          highGraphics
            ? 'bg-linear-to-tr from-indigo-600 via-indigo-700 to-violet-600 text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 group-hover:-rotate-6'
            : 'bg-indigo-600 text-white'
        )}
      >
        <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
        <span className="absolute -top-2 -right-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-linear-to-tr from-amber-400 to-amber-500 text-slate-950 text-xs sm:text-sm flex items-center justify-center font-black border-2 border-white shadow-md shadow-amber-500/30">
          {item.stepNumber}
        </span>
      </div>

      {/* Step Title & Description */}
      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mb-2 group-hover:text-indigo-950 transition-colors">
        {item.title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium max-w-xs">
        {item.description}
      </p>

      {/* Bottom Step Indicator Pill */}
      <div className="mt-5 pt-4 border-t border-slate-100 w-full flex justify-center">
        <span className="px-3 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-extrabold tracking-wider uppercase group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
          Step 0{item.stepNumber}
        </span>
      </div>
    </div>
  );
};

export default StepCard;
