import React from 'react';
import { ChevronRight } from 'lucide-react';
import { QuizSubject } from '../../types/quiz';
import { usePerformanceMode } from '../../context/PerformanceModeContext';
import { cx } from '../../utils/cx';
import { accentStyle } from '../../utils/accentStyles';

export interface QuizSubjectCardProps {
  subject: QuizSubject;
  quizCount: number;
  completedCount: number;
  accuracy: number;
  onSelect: (subjectId: QuizSubject['id']) => void;
}

export const QuizSubjectCard: React.FC<QuizSubjectCardProps> = ({
  subject,
  quizCount,
  completedCount,
  accuracy,
  onSelect,
}) => {
  const { highGraphics } = usePerformanceMode();
  const accent = accentStyle(subject.accent);
  const Icon = subject.icon;
  const completion = quizCount === 0 ? 0 : Math.round((completedCount / quizCount) * 100);

  return (
    <button
      type="button"
      onClick={() => onSelect(subject.id)}
      className={cx(
        'group text-left w-full p-4 sm:p-5 rounded-2xl sm:rounded-3xl transition-all cursor-pointer flex flex-col gap-3',
        highGraphics
          ? 'bg-white/90 backdrop-blur-md border border-slate-100 shadow-md shadow-slate-200/50 hover:-translate-y-0.5 hover:shadow-lg'
          : 'bg-white border border-slate-200 hover:border-slate-300'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={cx('w-11 h-11 rounded-2xl flex items-center justify-center shrink-0', accent.iconBg)}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <ChevronRight className={cx('w-5 h-5 text-slate-300 shrink-0 transition-transform group-hover:translate-x-0.5', highGraphics && 'group-hover:text-slate-400')} />
      </div>

      <div className="min-w-0">
        <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight truncate">{subject.name}</h4>
        <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-2">{subject.tagline}</p>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-semibold">
          <span className="text-slate-500">{completedCount}/{quizCount} quizzes cleared</span>
          <span className={accent.text}>{accuracy}% acc</span>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className={cx('h-full rounded-full transition-all duration-500', accent.bar)}
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>
    </button>
  );
};

export default QuizSubjectCard;
