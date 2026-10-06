import React, { useState, useEffect } from 'react';
import { StatItem } from '../types';
import { usePerformanceMode } from '../context/PerformanceModeContext';
import { cx } from '../utils/cx';

export interface StatCounterProps {
  item: StatItem;
}

/**
 * Custom typed hook for smooth numeric count-up animation
 */
export function useCountUp(target: number, durationMs: number = 1500, enabled: boolean = true): number {
  const [count, setCount] = useState<number>(enabled ? 0 : target);

  useEffect(() => {
    if (!enabled) {
      setCount(target);
      return;
    }

    let start = 0;
    const steps = 30;
    const increment = target / steps;
    const stepTime = durationMs / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target, durationMs, enabled]);

  return count;
}

export const StatCounter: React.FC<StatCounterProps> = ({ item }) => {
  const { highGraphics } = usePerformanceMode();
  const animatedValue = useCountUp(item.value, 1500, highGraphics);
  const Icon = item.icon;

  return (
    <div
      className={cx(
        'p-3.5 xs:p-4 sm:p-5 lg:p-6 rounded-2xl flex flex-col items-center text-center transition-all',
        highGraphics
          ? 'bg-white/80 backdrop-blur-md border border-slate-100 shadow-lg shadow-indigo-500/5 hover:border-indigo-200 hover:-translate-y-0.5'
          : 'bg-white border border-slate-200'
      )}
    >
      {Icon && (
        <div
          className={cx(
            'w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-2 sm:mb-3',
            highGraphics ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-700'
          )}
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      )}
      <div className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
        {animatedValue.toLocaleString()}{item.suffix || ''}
      </div>
      <div className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1 text-center line-clamp-2">
        {item.label}
      </div>
    </div>
  );
};

export default StatCounter;
