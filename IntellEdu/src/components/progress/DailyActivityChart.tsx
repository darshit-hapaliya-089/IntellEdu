import React from 'react';
import { CalendarRange } from 'lucide-react';
import { DailyActivity } from '../../types/progress';
import { usePerformanceMode } from '../../context/PerformanceModeContext';
import { cx } from '../../utils/cx';
import { lastNDayKeys, shortDateLabel, todayKey } from '../../utils/dateUtils';

export interface DailyActivityChartProps {
  daily: Record<string, DailyActivity>;
  days?: number;
}

export const DailyActivityChart: React.FC<DailyActivityChartProps> = ({ daily, days = 14 }) => {
  const { highGraphics } = usePerformanceMode();
  const keys = lastNDayKeys(days);
  const today = todayKey();

  const bars = keys.map((key) => ({
    key,
    xp: daily[key]?.xpEarned ?? 0,
    minutes: daily[key]?.minutes ?? 0,
  }));

  const maxXp = Math.max(10, ...bars.map((bar) => bar.xp));
  const totalXp = bars.reduce((sum, bar) => sum + bar.xp, 0);
  const activeDays = bars.filter((bar) => bar.xp > 0).length;

  return (
    <div
      className={cx(
        'p-4 sm:p-5 rounded-2xl sm:rounded-3xl',
        highGraphics ? 'bg-white/90 border border-slate-200/80 shadow-sm' : 'bg-white border border-slate-200'
      )}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <CalendarRange className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-extrabold text-slate-900">Daily XP ({days} days)</h3>
        </div>
        <div className="text-right">
          <p className="text-sm font-black text-indigo-600 leading-none">{totalXp.toLocaleString()}</p>
          <p className="text-[10px] font-semibold text-slate-400">{activeDays} active days</p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-1 sm:gap-1.5 h-36">
        {bars.map((bar) => {
          const heightPct = bar.xp === 0 ? 4 : Math.max(8, Math.round((bar.xp / maxXp) * 100));
          const isToday = bar.key === today;
          return (
            <div key={bar.key} className="flex-1 flex flex-col items-center justify-end h-full gap-1 group">
              <span className="text-[9px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {bar.xp}
              </span>
              <div
                className={cx(
                  'w-full rounded-t-md transition-all duration-500',
                  bar.xp === 0
                    ? 'bg-slate-100'
                    : isToday
                      ? highGraphics
                        ? 'bg-linear-to-t from-indigo-600 to-violet-400'
                        : 'bg-indigo-600'
                      : highGraphics
                        ? 'bg-linear-to-t from-indigo-400 to-violet-300 group-hover:from-indigo-500'
                        : 'bg-indigo-300 group-hover:bg-indigo-400'
                )}
                style={{ height: `${heightPct}%` }}
                title={`${shortDateLabel(bar.key)}: ${bar.xp} XP, ${bar.minutes} min`}
              />
              <span className={cx('text-[9px] font-semibold', isToday ? 'text-indigo-600' : 'text-slate-400')}>
                {bar.key.slice(-2)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyActivityChart;
