import React from 'react';
import { Clock3, History, Sparkles, Target } from 'lucide-react';
import { QuizAttempt } from '../../types/quiz';
import { SUBJECT_BY_ID } from '../../data/subjects';
import { usePerformanceMode } from '../../context/PerformanceModeContext';
import { cx } from '../../utils/cx';
import { relativeTime } from '../../utils/dateUtils';
import { accentStyle } from '../../utils/accentStyles';

export interface QuizHistoryPanelProps {
  attempts: QuizAttempt[];
  limit?: number;
}

export const QuizHistoryPanel: React.FC<QuizHistoryPanelProps> = ({ attempts, limit = 6 }) => {
  const { highGraphics } = usePerformanceMode();
  const recent = attempts.slice(0, limit);

  return (
    <div
      className={cx(
        'p-4 sm:p-5 rounded-2xl sm:rounded-3xl',
        highGraphics
          ? 'bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-md shadow-slate-200/50'
          : 'bg-white border border-slate-200'
      )}
    >
      <div className="flex items-center gap-2 mb-3.5 pb-3 border-b border-slate-100">
        <History className="w-4 h-4 text-indigo-600" />
        <h3 className="text-sm font-extrabold text-slate-900">Recent Attempts</h3>
      </div>

      {recent.length === 0 ? (
        <p className="text-xs text-slate-500 py-4 text-center">No quizzes attempted yet — start one above!</p>
      ) : (
        <div className="space-y-2">
          {recent.map((attempt) => {
            const subject = SUBJECT_BY_ID[attempt.subjectId];
            const accent = accentStyle(subject.accent);
            const SubjectIcon = subject.icon;
            const passed = attempt.accuracy >= 60;
            return (
              <div
                key={attempt.id}
                className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50/80 hover:bg-slate-100 transition-colors"
              >
                <div className={cx('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', accent.iconBg)}>
                  <SubjectIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{attempt.quizTitle}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium mt-0.5">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="w-3 h-3" />
                      {relativeTime(attempt.completedAt)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {attempt.score}/{attempt.totalQuestions}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={cx('text-xs font-black', passed ? 'text-emerald-600' : 'text-amber-600')}>
                    {attempt.accuracy}%
                  </p>
                  <p className="text-[10px] font-bold text-amber-600 inline-flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3" />
                    +{attempt.xpEarned}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuizHistoryPanel;
