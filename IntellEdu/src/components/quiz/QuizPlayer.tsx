import React, { useCallback, useMemo, useState } from 'react';
import { AlarmClock, ChevronLeft, ChevronRight, Send, X } from 'lucide-react';
import { Quiz } from '../../types/quiz';
import { usePerformanceMode } from '../../context/PerformanceModeContext';
import { cx } from '../../utils/cx';
import { formatClock } from '../../utils/dateUtils';
import { useCountdown } from '../../hooks/useCountdown';
import QuizOption from './QuizOption';
import QuestionPalette from './QuestionPalette';

export interface QuizPlayerProps {
  quiz: Quiz;
  onFinish: (answers: number[], timeTakenSeconds: number) => void;
  onExit: () => void;
}

export const QuizPlayer: React.FC<QuizPlayerProps> = ({ quiz, onFinish, onExit }) => {
  const { highGraphics } = usePerformanceMode();
  const [answers, setAnswers] = useState<number[]>(() => quiz.questions.map(() => -1));
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleExpire = useCallback(() => {
    if (submitted) return;
    onFinish(answers, quiz.timeLimitSeconds);
  }, [answers, onFinish, quiz.timeLimitSeconds, submitted]);

  const secondsLeft = useCountdown(quiz.timeLimitSeconds, handleExpire, !submitted);

  /** Finish the run early, reporting the time actually spent. */
  const submit = (finalAnswers: number[]) => {
    if (submitted) return;
    setSubmitted(true);
    onFinish(finalAnswers, Math.max(1, quiz.timeLimitSeconds - secondsLeft));
  };

  const question = quiz.questions[currentIndex];
  const answeredCount = useMemo(() => answers.filter((a) => a >= 0).length, [answers]);
  const isLast = currentIndex === quiz.questions.length - 1;
  const isLowTime = secondsLeft <= 30;

  const selectOption = (optionIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = optionIndex;
      return next;
    });
  };

  return (
    <div className="max-w-3xl mx-auto w-full space-y-4 sm:space-y-5">
      {/* Header: title + timer */}
      <div
        className={cx(
          'p-4 sm:p-5 rounded-2xl sm:rounded-3xl flex items-center justify-between gap-3',
          highGraphics
            ? 'bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-md shadow-slate-200/50'
            : 'bg-white border border-slate-200'
        )}
      >
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate" data-no-translate>{quiz.title}</h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Question {currentIndex + 1} of {quiz.questions.length} · {answeredCount} answered
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={cx(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black tabular-nums',
              isLowTime ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-slate-100 text-slate-700'
            )}
          >
            <AlarmClock className="w-3.5 h-3.5" />
            {formatClock(secondsLeft)}
          </span>
          <button
            type="button"
            onClick={onExit}
            aria-label="Exit quiz"
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 cursor-pointer active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
        <div
          className="h-full bg-linear-to-r from-indigo-500 to-violet-600 rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
        />
      </div>

      {/* Question card */}
      <div
        className={cx(
          'p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-4',
          highGraphics
            ? 'bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-xl shadow-slate-200/50'
            : 'bg-white border-2 border-slate-300'
        )}
      >
        <div className="flex items-start gap-3">
          <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white text-xs font-black flex items-center justify-center shrink-0">
            {currentIndex + 1}
          </span>
          <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug pt-0.5" data-no-translate>
            {question.question}
          </h4>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {question.options.map((option, index) => (
            <QuizOption
              key={option}
              index={index}
              text={option}
              isSelected={answers[currentIndex] === index}
              onSelect={selectOption}
            />
          ))}
        </div>

        {/* Palette */}
        <div className="pt-2 border-t border-slate-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Jump to question</p>
          <QuestionPalette
            total={quiz.questions.length}
            currentIndex={currentIndex}
            answers={answers}
            onJump={setCurrentIndex}
          />
        </div>
      </div>

      {/* Footer nav */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className={cx(
            'inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed',
            'bg-slate-100 text-slate-700 hover:bg-slate-200'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={() => submit(answers)}
            className={cx(
              'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-md',
              highGraphics
                ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-500/25'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            )}
          >
            <Send className="w-4 h-4" />
            Submit Quiz
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCurrentIndex((i) => Math.min(quiz.questions.length - 1, i + 1))}
            className={cx(
              'inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95',
              highGraphics
                ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            )}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizPlayer;
