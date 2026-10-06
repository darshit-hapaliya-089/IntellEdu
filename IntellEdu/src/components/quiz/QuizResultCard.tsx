import React from 'react';
import {
  Award,
  ArrowLeft,
  Bot,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
} from 'lucide-react';
import { Quiz, QuizGrade } from '../../types/quiz';
import { BADGES } from '../../data/badges';
import { usePerformanceMode } from '../../context/PerformanceModeContext';
import { cx } from '../../utils/cx';
import { gradeHeadline } from '../../utils/quizScoring';

export interface QuizResultCardProps {
  quiz: Quiz;
  grade: QuizGrade;
  xpEarned: number;
  tokensEarned: number;
  freshlyUnlocked: string[];
  leveledUp: boolean;
  newLevel: number;
  onRetake: () => void;
  onBack: () => void;
  onOpenAi: () => void;
}

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const QuizResultCard: React.FC<QuizResultCardProps> = ({
  quiz,
  grade,
  xpEarned,
  tokensEarned,
  freshlyUnlocked,
  leveledUp,
  newLevel,
  onRetake,
  onBack,
  onOpenAi,
}) => {
  const { highGraphics } = usePerformanceMode();
  const dashOffset = CIRCUMFERENCE * (1 - grade.accuracy / 100);
  const unlockedBadges = BADGES.filter((badge) => freshlyUnlocked.includes(badge.id));

  return (
    <div className="max-w-3xl mx-auto w-full space-y-4 sm:space-y-5">
      {/* Score hero */}
      <div
        className={cx(
          'p-5 sm:p-8 rounded-2xl sm:rounded-3xl text-center space-y-4 relative overflow-hidden',
          highGraphics
            ? 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 text-white shadow-xl shadow-indigo-500/20'
            : 'bg-indigo-900 text-white'
        )}
      >
        {highGraphics && (
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-violet-400/20 rounded-full blur-2xl pointer-events-none" />
        )}

        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 120 120" className="w-32 h-32 -rotate-90">
              <circle cx="60" cy="60" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10" />
              <circle
                cx="60"
                cy="60"
                r={RADIUS}
                fill="none"
                stroke="#fbbf24"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black leading-none">{grade.accuracy}%</span>
              <span className="text-[11px] font-bold text-indigo-100 mt-0.5">
                {grade.score}/{grade.totalQuestions} correct
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black">{gradeHeadline(grade.accuracy)}</h2>
            <p className="text-xs sm:text-sm text-indigo-100/90 mt-1">{quiz.title}</p>
          </div>

          {/* Reward chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-md text-xs font-black text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              +{xpEarned} XP
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-md text-xs font-black text-sky-200">
              <Bot className="w-3.5 h-3.5" />
              +{tokensEarned} AI tokens
            </span>
            {grade.isPerfect && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-amber-950 text-xs font-black">
                <Trophy className="w-3.5 h-3.5" />
                Perfect!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Level up + badges */}
      {leveledUp && (
        <div
          className={cx(
            'p-4 rounded-2xl flex items-center gap-3',
            highGraphics ? 'bg-linear-to-r from-amber-50 to-amber-100 border border-amber-200' : 'bg-amber-50 border border-amber-200'
          )}
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-extrabold text-amber-900">Level up! You reached Level {newLevel}</p>
            <p className="text-[11px] text-amber-700">Keep clearing quizzes to climb higher.</p>
          </div>
        </div>
      )}

      {unlockedBadges.length > 0 && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">New badges unlocked</p>
          <div className="flex flex-wrap gap-2">
            {unlockedBadges.map((badge) => {
              const BadgeIcon = badge.icon;
              return (
                <span key={badge.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold">
                  <BadgeIcon className="w-3.5 h-3.5" />
                  {badge.name}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={onOpenAi}
          className={cx(
            'inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95',
            highGraphics
              ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          )}
        >
          <Bot className="w-4 h-4" />
          Ask AI Tutor
        </button>
        <button
          type="button"
          onClick={onRetake}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          Retake
        </button>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer active:scale-95 col-span-2 sm:col-span-1"
        >
          <ArrowLeft className="w-4 h-4" />
          More Quizzes
        </button>
      </div>

      {/* Review */}
      <div className="space-y-2.5">
        <h3 className="text-sm font-extrabold text-slate-900 px-1">Answer Review</h3>
        {grade.review.map((row, index) => (
          <div
            key={row.questionId}
            className={cx(
              'p-4 rounded-2xl border',
              row.isCorrect
                ? 'bg-emerald-50/60 border-emerald-200'
                : 'bg-rose-50/60 border-rose-200'
            )}
          >
            <div className="flex items-start gap-2.5">
              {row.isCorrect ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-bold text-slate-900">
                  {index + 1}. {row.question}
                </p>
                <div className="mt-2 space-y-1 text-[11px] sm:text-xs">
                  <p className="text-slate-600">
                    Your answer:{' '}
                    <span className={cx('font-bold', row.isCorrect ? 'text-emerald-700' : 'text-rose-700')}>
                      {row.yourIndex >= 0 ? row.options[row.yourIndex] : 'Not answered'}
                    </span>
                  </p>
                  {!row.isCorrect && (
                    <p className="text-slate-600">
                      Correct answer: <span className="font-bold text-emerald-700">{row.options[row.correctIndex]}</span>
                    </p>
                  )}
                  <p className="text-slate-500 italic pt-1">{row.explanation}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizResultCard;
