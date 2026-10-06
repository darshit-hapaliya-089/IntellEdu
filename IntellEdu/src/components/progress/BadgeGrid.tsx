import React from 'react';
import { Lock, Medal } from 'lucide-react';
import { BadgeStatus } from '../../data/badges';
import { usePerformanceMode } from '../../context/PerformanceModeContext';
import { cx } from '../../utils/cx';
import { accentStyle } from '../../utils/accentStyles';

export interface BadgeGridProps {
  badges: BadgeStatus[];
}

export const BadgeGrid: React.FC<BadgeGridProps> = ({ badges }) => {
  const { highGraphics } = usePerformanceMode();
  const unlockedCount = badges.filter((badge) => badge.unlocked).length;

  return (
    <div
      className={cx(
        'p-4 sm:p-5 rounded-2xl sm:rounded-3xl',
        highGraphics ? 'bg-white/90 border border-slate-200/80 shadow-sm' : 'bg-white border border-slate-200'
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Medal className="w-4 h-4 text-amber-500" />
          <h3 className="text-sm font-extrabold text-slate-900">Achievements</h3>
        </div>
        <span className="text-[11px] font-bold text-slate-500">
          {unlockedCount}/{badges.length} unlocked
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {badges.map((badge) => {
          const Icon = badge.icon;
          const accent = accentStyle(badge.accent);
          return (
            <div
              key={badge.id}
              className={cx(
                'p-3 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all',
                badge.unlocked
                  ? highGraphics
                    ? 'bg-white border-slate-100 shadow-sm'
                    : 'bg-white border-slate-200'
                  : 'bg-slate-50 border-slate-200 opacity-70'
              )}
            >
              <div
                className={cx(
                  'w-11 h-11 rounded-2xl flex items-center justify-center relative shrink-0',
                  badge.unlocked ? accent.soft : 'bg-slate-200 text-slate-400'
                )}
              >
                <Icon className="w-5 h-5" />
                {!badge.unlocked && (
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center border-2 border-white">
                    <Lock className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>

              <div className="min-w-0 w-full">
                <p className="text-[11px] font-extrabold text-slate-900 leading-tight truncate">{badge.name}</p>
                <p className="text-[9px] text-slate-500 leading-snug mt-0.5 line-clamp-2">{badge.description}</p>
              </div>

              {!badge.unlocked && (
                <div className="w-full">
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-400 rounded-full"
                      style={{ width: `${Math.round((badge.progress / badge.target) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[9px] font-semibold text-slate-400 mt-1">
                    {badge.progress}/{badge.target}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BadgeGrid;
