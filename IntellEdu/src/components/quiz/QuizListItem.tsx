import React from 'react';
import { Clock, ListChecks, Play, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import { Quiz } from '../../types/quiz';
import { usePerformanceMode } from '../../context/PerformanceModeContext';
import { cx } from '../../utils/cx';

export interface QuizListItemProps {
  quiz: Quiz;
  bestAccuracy: number | null;
  onStart: (quiz: Quiz) => void;
}

const DIFFICULTY_STYLES: Record<Quiz['difficulty'], string> = {
  easy: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-rose-100 text-rose-700',
};

export const QuizListItem: React.FC<QuizListItemProps> = ({ quiz, bestAccuracy, onStart }) => {
  const { highGraphics } = usePerformanceMode();
  const minutes = Math.round(quiz.timeLimitSeconds / 60);
  const isCleared = bestAccuracy !== null;

  return (
    <div
      className={cx(
        'p-4 sm:p-5 rounded-2xl sm:rounded-3xl transition-all flex flex-col sm:flex-row sm:items-center gap-4',
        highGraphics
          ? 'bg-white/90 backdrop-blur-md border border-slate-100 shadow-xs hover:shadow-md'
          : 'bg-white border border-slate-200'
      )}
    >
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">{quiz.title}</h4>
          <span className={cx('px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide', DIFFICULTY_STYLES[quiz.difficulty])}>
            {quiz.difficulty}
          </span>
          {isCleared && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
              <Trophy className="w-3 h-3" />
              Best {bestAccuracy}%
            </span>
          )}
        </div>

        <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2">{quiz.description}</p>

        <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] font-semibold text-slate-500 flex-wrap">
          <span className="inline-flex items-center gap-1">
            <ListChecks className="w-3.5 h-3.5 text-slate-400" />
            {quiz.questions.length} questions
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {minutes} min
          </span>
          <span className="inline-flex items-center gap-1 text-amber-600">
            <Sparkles className="w-3.5 h-3.5" />
            up to +{quiz.baseXp} XP
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onStart(quiz)}
        className={cx(
          'flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shrink-0 w-full sm:w-auto',
          highGraphics
            ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        )}
      >
        {isCleared ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
        <span>{isCleared ? 'Retake' : "Start Quiz"}</span>
      </button>
    </div>
  );
};

export default QuizListItem;
