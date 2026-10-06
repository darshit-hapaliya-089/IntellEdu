import React from 'react';
import { GraduationCap } from 'lucide-react';
import { SubjectStat } from '../../types/progress';
import { SUBJECT_BY_ID } from '../../data/subjects';
import { usePerformanceMode } from '../../context/PerformanceModeContext';
import { cx } from '../../utils/cx';
import { accentStyle } from '../../utils/accentStyles';

export interface SubjectMasteryListProps {
  stats: SubjectStat[];
}

export const SubjectMasteryList: React.FC<SubjectMasteryListProps> = ({ stats }) => {
  const { highGraphics } = usePerformanceMode();
  const ordered = [...stats].sort((a, b) => b.accuracy - a.accuracy);

  return (
    <div
      className={cx(
        'p-4 sm:p-5 rounded-2xl sm:rounded-3xl',
        highGraphics ? 'bg-white/90 border border-slate-200/80 shadow-sm' : 'bg-white border border-slate-200'
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap className="w-4 h-4 text-indigo-600" />
        <h3 className="text-sm font-extrabold text-slate-900">Subject Mastery</h3>
      </div>

      {ordered.length === 0 ? (
        <p className="text-xs text-slate-500 py-4 text-center">Attempt a quiz to see your subject mastery.</p>
      ) : (
        <div className="space-y-3.5">
          {ordered.map((stat) => {
            const subject = SUBJECT_BY_ID[stat.subjectId];
            const accent = accentStyle(subject.accent);
            const Icon = subject.icon;
            return (
              <div key={stat.subjectId} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={cx('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', accent.iconBg)}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 truncate">{subject.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-semibold text-slate-400">{stat.attempts} quizzes</span>
                    <span className={cx('text-xs font-black', accent.text)}>{stat.accuracy}%</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={cx('h-full rounded-full transition-all duration-700', accent.bar)}
                    style={{ width: `${stat.accuracy}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SubjectMasteryList;
