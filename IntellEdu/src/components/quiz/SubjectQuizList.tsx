import React from 'react';
import { ArrowLeft, Trophy } from 'lucide-react';
import { Quiz, QuizSubject } from '../../types/quiz';
import { usePerformanceMode } from '../../context/PerformanceModeContext';
import { cx } from '../../utils/cx';
import { accentStyle } from '../../utils/accentStyles';
import QuizListItem from './QuizListItem';

export interface SubjectQuizListProps {
  subject: QuizSubject;
  quizzes: Quiz[];
  bestAccuracy: Record<string, number>;
  onStart: (quiz: Quiz) => void;
  onBack: () => void;
}

export const SubjectQuizList: React.FC<SubjectQuizListProps> = ({
  subject,
  quizzes,
  bestAccuracy,
  onStart,
  onBack,
}) => {
  const { highGraphics } = usePerformanceMode();
  const accent = accentStyle(subject.accent);
  const Icon = subject.icon;
  const cleared = quizzes.filter((quiz) => bestAccuracy[quiz.id] !== undefined).length;

  return (
    <div className="space-y-4 sm:space-y-5 w-full">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        All Subjects
      </button>

      {/* Subject header */}
      <div
        className={cx(
          'p-5 sm:p-6 rounded-2xl sm:rounded-3xl flex items-center gap-4',
          highGraphics
            ? 'bg-linear-to-r from-slate-900 to-slate-800 text-white shadow-lg'
            : 'bg-slate-900 text-white'
        )}
      >
        <div className={cx('w-12 h-12 rounded-2xl flex items-center justify-center shrink-0', accent.solid)}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-xl font-black leading-tight truncate">{subject.name}</h2>
          <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 line-clamp-1">{subject.description}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="inline-flex items-center gap-1 text-sm font-black text-amber-400">
            <Trophy className="w-4 h-4" />
            {cleared}/{quizzes.length}
          </div>
          <p className="text-[10px] text-slate-400 font-semibold">cleared</p>
        </div>
      </div>

      {/* Quiz list */}
      <div className="space-y-3">
        {quizzes.map((quiz) => (
          <QuizListItem
            key={quiz.id}
            quiz={quiz}
            bestAccuracy={bestAccuracy[quiz.id] ?? null}
            onStart={onStart}
          />
        ))}
      </div>
    </div>
  );
};

export default SubjectQuizList;
