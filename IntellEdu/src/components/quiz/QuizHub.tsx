import React, { useMemo, useState } from 'react';
import { CalendarCheck, Flame, Target, Trophy, Zap } from 'lucide-react';
import { Quiz, QuizGrade, QuizSubject } from '../../types/quiz';
import { CommitAttemptResult } from '../../types/gamification';
import { QUIZ_BANK, getQuizzesBySubject } from '../../data/quizBank';
import { QUIZ_SUBJECTS, SUBJECT_BY_ID } from '../../data/subjects';
import { useGamification } from '../../context/GamificationContext';
import { usePerformanceMode } from '../../context/PerformanceModeContext';
import { cx } from '../../utils/cx';
import { gradeQuiz } from '../../utils/quizScoring';
import QuizSubjectCard from './QuizSubjectCard';
import SubjectQuizList from './SubjectQuizList';
import QuizPlayer from './QuizPlayer';
import QuizResultCard from './QuizResultCard';
import QuizHistoryPanel from './QuizHistoryPanel';
import TokenWalletCard from '../gamification/TokenWalletCard';

type HubView = 'subjects' | 'list' | 'playing' | 'result';

export interface QuizHubProps {
  onOpenAi: () => void;
}

export const QuizHub: React.FC<QuizHubProps> = ({ onOpenAi }) => {
  const { highGraphics } = usePerformanceMode();
  const { attempts, completedQuizIds, subjectStats, streak, overallAccuracy, commitAttempt } = useGamification();

  const [view, setView] = useState<HubView>('subjects');
  const [subjectId, setSubjectId] = useState<QuizSubject['id'] | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [grade, setGrade] = useState<QuizGrade | null>(null);
  const [result, setResult] = useState<CommitAttemptResult | null>(null);

  /** Best accuracy per quiz id, derived from history. */
  const bestAccuracy = useMemo(() => {
    const map: Record<string, number> = {};
    attempts.forEach((attempt) => {
      const current = map[attempt.quizId];
      if (current === undefined || attempt.accuracy > current) map[attempt.quizId] = attempt.accuracy;
    });
    return map;
  }, [attempts]);

  /** Deterministic quiz-of-the-day so it is stable through the session. */
  const dailyQuiz = useMemo(() => {
    const start = new Date(new Date().getFullYear(), 0, 0);
    const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86400000);
    return QUIZ_BANK[dayOfYear % QUIZ_BANK.length];
  }, []);

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setGrade(null);
    setResult(null);
    setView('playing');
  };

  const handleFinish = (answers: number[], timeTakenSeconds: number) => {
    if (!activeQuiz) return;
    const isFirstClear = !completedQuizIds.includes(activeQuiz.id);
    const computedGrade = gradeQuiz(activeQuiz, answers, timeTakenSeconds, isFirstClear);
    const commitResult = commitAttempt(activeQuiz, answers, timeTakenSeconds);
    setGrade(computedGrade);
    setResult(commitResult);
    setView('result');
  };

  const openSubject = (id: QuizSubject['id']) => {
    setSubjectId(id);
    setView('list');
  };

  // ── Playing ────────────────────────────────────────────────────────────────
  if (view === 'playing' && activeQuiz) {
    return (
      <QuizPlayer
        quiz={activeQuiz}
        onFinish={handleFinish}
        onExit={() => setView(subjectId ? 'list' : 'subjects')}
      />
    );
  }

  // ── Result ─────────────────────────────────────────────────────────────────
  if (view === 'result' && activeQuiz && grade && result) {
    return (
      <QuizResultCard
        quiz={activeQuiz}
        grade={grade}
        xpEarned={result.xpEarned}
        tokensEarned={result.tokensEarned}
        freshlyUnlocked={result.freshlyUnlocked}
        leveledUp={result.leveledUp}
        newLevel={result.newLevel}
        onRetake={() => startQuiz(activeQuiz)}
        onBack={() => setView(subjectId ? 'list' : 'subjects')}
        onOpenAi={onOpenAi}
      />
    );
  }

  // ── Subject detail ─────────────────────────────────────────────────────────
  if (view === 'list' && subjectId) {
    return (
      <SubjectQuizList
        subject={SUBJECT_BY_ID[subjectId]}
        quizzes={getQuizzesBySubject(subjectId)}
        bestAccuracy={bestAccuracy}
        onStart={startQuiz}
        onBack={() => setView('subjects')}
      />
    );
  }

  // ── Subjects hub (default) ─────────────────────────────────────────────────
  return (
    <div className="space-y-5 sm:space-y-6 w-full">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">Quizzes & XP</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Clear subject quizzes to earn XP, then convert it into AI Tutor tokens.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { id: 'qs1', label: 'Quizzes Cleared', value: completedQuizIds.length, icon: Trophy, tone: 'text-indigo-600 bg-indigo-50' },
          { id: 'qs2', label: 'Avg Accuracy', value: `${overallAccuracy}%`, icon: Target, tone: 'text-emerald-600 bg-emerald-50' },
          { id: 'qs3', label: 'Day Streak', value: streak, icon: Flame, tone: 'text-amber-600 bg-amber-50' },
          { id: 'qs4', label: 'Subjects', value: subjectStats.length, icon: Zap, tone: 'text-violet-600 bg-violet-50' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={cx(
                'p-3.5 rounded-2xl flex items-center gap-3',
                highGraphics ? 'bg-white/90 border border-slate-100 shadow-sm' : 'bg-white border border-slate-200'
              )}
            >
              <div className={cx('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', item.tone)}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-black text-slate-900 leading-none">{item.value}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-1 truncate">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Daily challenge */}
      <div
        className={cx(
          'p-4 sm:p-5 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row sm:items-center gap-4',
          highGraphics
            ? 'bg-linear-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white shadow-xl shadow-indigo-500/20'
            : 'bg-indigo-900 text-white'
        )}
      >
        <div className={cx('w-11 h-11 rounded-2xl flex items-center justify-center shrink-0', highGraphics ? 'bg-white/15 backdrop-blur-md' : 'bg-white/10')}>
          <CalendarCheck className="w-5 h-5 text-amber-300" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-300">Daily Challenge</p>
          <h3 className="text-sm sm:text-base font-black truncate">{dailyQuiz.title}</h3>
          <p className="text-[11px] text-indigo-100/90">
            {SUBJECT_BY_ID[dailyQuiz.subjectId].name} · {dailyQuiz.questions.length} questions · +{dailyQuiz.baseXp} XP
          </p>
        </div>
        <button
          type="button"
          onClick={() => startQuiz(dailyQuiz)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white text-indigo-700 text-xs font-black hover:bg-indigo-50 transition-colors cursor-pointer active:scale-95 shrink-0"
        >
          Start Today's Quiz
        </button>
      </div>

      {/* Wallet */}
      <TokenWalletCard />

      {/* Subject grid */}
      <div>
        <h3 className="text-sm font-extrabold text-slate-900 mb-3">All Subjects</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {QUIZ_SUBJECTS.map((subject) => {
            const quizzes = getQuizzesBySubject(subject.id);
            const completedCount = quizzes.filter((quiz) => completedQuizIds.includes(quiz.id)).length;
            const stat = subjectStats.find((s) => s.subjectId === subject.id);
            return (
              <QuizSubjectCard
                key={subject.id}
                subject={subject}
                quizCount={quizzes.length}
                completedCount={completedCount}
                accuracy={stat?.accuracy ?? 0}
                onSelect={openSubject}
              />
            );
          })}
        </div>
      </div>

      {/* History */}
      <QuizHistoryPanel attempts={attempts} limit={6} />
    </div>
  );
};

export default QuizHub;
