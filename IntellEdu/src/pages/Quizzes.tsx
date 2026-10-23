import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import {
  authApi,
  quizzesApi,
  type DailyQuizzesResponse,
  type QuizData,
  type QuizResultHistory,
  type QuizSubmitResult,
} from '../services/api';
import SubjectVisual from '../components/quiz/SubjectVisual';

function formatISTDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return dateString;
  }
}

function getTodayIstString(): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function getDifficultyBadge(difficulty?: string) {
  const diff = (difficulty ?? 'medium').toLowerCase();
  if (diff === 'easy') {
    return {
      label: 'Easy',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  }
  if (diff === 'hard') {
    return {
      label: 'Hard',
      className: 'bg-rose-50 text-rose-700 border-rose-200',
    };
  }
  return {
    label: 'Medium',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  };
}

export const Quizzes: React.FC = () => {
  const { user, updateUser } = useAuth();

  // Daily quizzes state (25 quizzes per day)
  const [dailyData, setDailyData] = useState<DailyQuizzesResponse | null>(null);
  const [dailyLoading, setDailyLoading] = useState(true);
  const [dailyPage, setDailyPage] = useState(1);
  const DAILY_PAGE_SIZE = 9;
  const [dailySubjectFilter, setDailySubjectFilter] = useState('all');

  // Practice quizzes (recent 3 days, 0 XP)
  const [practiceQuizzes, setPracticeQuizzes] = useState<QuizData[]>([]);
  const [practiceLoading, setPracticeLoading] = useState(true);
  const [practiceSearch, setPracticeSearch] = useState('');
  const [practiceSubjectFilter, setPracticeSubjectFilter] = useState('all');

  // History state: Today's attempts only by default
  const [todayAttempts, setTodayAttempts] = useState<QuizResultHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyScope, setHistoryScope] = useState<'today' | 'all'>('today');

  // Active quiz state
  const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null);
  const [activeQuizIsDaily, setActiveQuizIsDaily] = useState(true);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<QuizSubmitResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  // Connection & server wakeup states
  const [error, setError] = useState<string | null>(null);
  const [isWakingUp, setIsWakingUp] = useState(false);

  // Countdown timer to next 00:00 IST
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const resetsAtRef = useRef<string | null>(null);
  const loadedIstDateRef = useRef<string>(getTodayIstString());

  // 1. Fetch Daily Quizzes (25 quizzes)
  const fetchDaily = useCallback(async (isRetry = false) => {
    try {
      if (isRetry) setIsWakingUp(true);
      setDailyLoading(true);
      setError(null);
      const res = await quizzesApi.getDaily();
      setDailyData(res);
      resetsAtRef.current = res.resetsAt;
      loadedIstDateRef.current = res.date || getTodayIstString();
    } catch (err) {
      console.error('Failed to load daily quizzes:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Could not connect to the education backend. If the free server was asleep, please give it a moment to wake up.'
      );
    } finally {
      setDailyLoading(false);
      setIsWakingUp(false);
    }
  }, []);

  // 2. Fetch Recent Practice Quizzes (Last 3 days of served quizzes, 0 XP)
  const fetchPractice = useCallback(async () => {
    try {
      setPracticeLoading(true);
      const res = await quizzesApi.getAll();
      setPracticeQuizzes(res.quizzes || []);
    } catch (err) {
      console.error('Failed to load practice quizzes:', err);
    } finally {
      setPracticeLoading(false);
    }
  }, []);

  // 3. Fetch Saved Attempts (Today only by default, starts empty at 00:00 IST)
  const fetchAttempts = useCallback(async (scope: 'today' | 'all' = 'today') => {
    try {
      setHistoryLoading(true);
      const res = await quizzesApi.getMyResults(1, scope);
      setTodayAttempts(res.results || []);
    } catch (err) {
      console.error('Failed to load saved attempts:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    void fetchDaily();
    void fetchPractice();
    void fetchAttempts('today');
  }, [fetchDaily, fetchPractice, fetchAttempts]);

  // Midnight Rollover & Countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const nowIst = getTodayIstString();
      // If date rolled over at midnight IST, refetch everything fresh
      if (loadedIstDateRef.current && nowIst !== loadedIstDateRef.current) {
        loadedIstDateRef.current = nowIst;
        void fetchDaily();
        void fetchPractice();
        void fetchAttempts('today');
        return;
      }

      let targetTime: number;
      if (resetsAtRef.current) {
        targetTime = new Date(resetsAtRef.current).getTime();
      } else {
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istNow = new Date(now.getTime() + now.getTimezoneOffset() * 60 * 1000 + istOffset);
        const istMidnight = new Date(istNow);
        istMidnight.setHours(24, 0, 0, 0);
        targetTime = now.getTime() + (istMidnight.getTime() - istNow.getTime());
      }

      const diff = Math.max(0, targetTime - Date.now());
      if (diff === 0 && resetsAtRef.current) {
        // Clock hit zero: refetch immediately
        void fetchDaily();
        void fetchAttempts('today');
      }

      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    // Also check on tab refocus/visibility change
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        const currentIst = getTodayIstString();
        if (loadedIstDateRef.current && currentIst !== loadedIstDateRef.current) {
          loadedIstDateRef.current = currentIst;
          void fetchDaily();
          void fetchPractice();
          void fetchAttempts('today');
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchDaily, fetchPractice, fetchAttempts]);

  // Daily Subjects for filter pills
  const dailySubjects = useMemo(() => {
    const set = new Set((dailyData?.quizzes ?? []).map((q) => q.subject).filter(Boolean) as string[]);
    return ['all', ...Array.from(set).sort()];
  }, [dailyData]);

  // Filtered & Paginated Daily Quizzes
  const filteredDailyQuizzes = useMemo(() => {
    const list = dailyData?.quizzes ?? [];
    if (dailySubjectFilter === 'all') return list;
    return list.filter((q) => (q.subject || '').toLowerCase() === dailySubjectFilter.toLowerCase());
  }, [dailyData, dailySubjectFilter]);

  const totalDailyPages = Math.max(1, Math.ceil(filteredDailyQuizzes.length / DAILY_PAGE_SIZE));
  const displayedDailyQuizzes = useMemo(() => {
    const start = (dailyPage - 1) * DAILY_PAGE_SIZE;
    return filteredDailyQuizzes.slice(start, start + DAILY_PAGE_SIZE);
  }, [filteredDailyQuizzes, dailyPage]);

  // Completion calculation for Progress Bar
  const completedCount = useMemo(() => {
    return (dailyData?.quizzes ?? []).filter((q) => q.completedToday).length;
  }, [dailyData]);
  const totalDailyCount = dailyData?.quizzes?.length ?? 25;
  const progressPercent = Math.min(100, Math.round((completedCount / (totalDailyCount || 1)) * 100));

  // Filtered practice quizzes (0 XP, last 3 days)
  const visiblePracticeQuizzes = useMemo(() => {
    const query = practiceSearch.trim().toLowerCase();
    const dailyIds = new Set((dailyData?.quizzes ?? []).map((q) => String(q.id)));

    return practiceQuizzes
      .filter((q) => !dailyIds.has(String(q.id))) // Never duplicate today's featured daily quizzes
      .filter((quiz) => {
        const matchesSearch =
          !query ||
          `${quiz.title} ${quiz.description ?? ''} ${quiz.subject ?? ''}`.toLowerCase().includes(query);
        const matchesSubject =
          practiceSubjectFilter === 'all' ||
          (quiz.subject || '').toLowerCase() === practiceSubjectFilter.toLowerCase();
        return matchesSearch && matchesSubject;
      });
  }, [dailyData, practiceQuizzes, practiceSearch, practiceSubjectFilter]);

  // Start a Quiz (Daily or Practice)
  const openQuiz = async (quizId: string | number, isDaily: boolean, openedAt: number) => {
    try {
      setError(null);
      setResult(null);
      const { quiz } = await quizzesApi.getById(quizId);
      if (!quiz.questions?.length) throw new Error('This quiz does not have questions loaded yet.');
      setActiveQuiz(quiz);
      setActiveQuizIsDaily(isDaily);
      setAnswers(Array(quiz.questions.length).fill(-1));
      setStartedAt(openedAt);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open this quiz.');
    }
  };

  // Submit quiz
  const submitQuiz = async () => {
    if (!activeQuiz) return;
    if (answers.some((a) => a < 0)) {
      setError('Please answer all 5 questions before submitting.');
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const elapsedSeconds =
        startedAt === null ? undefined : Math.max(1, Math.floor((Date.now() - startedAt) / 1000));
      const submitted = await quizzesApi.submit(activeQuiz.id, answers, elapsedSeconds);
      setResult(submitted);

      if (typeof submitted.currentXpBalance === 'number') {
        updateUser({ points: submitted.currentXpBalance });
      }

      // Optimistic update of Today's Attempts list
      const optimisticAttempt: QuizResultHistory = {
        id: `opt-${Date.now()}`,
        score: submitted.score,
        totalQuestions: submitted.totalQuestions,
        accuracy: submitted.accuracy,
        xpEarned: submitted.xpEarned,
        timeTakenSeconds: elapsedSeconds ?? null,
        quizDate: getTodayIstString(),
        createdAt: new Date().toISOString(),
        quiz: {
          id: activeQuiz.id,
          title: activeQuiz.title,
          subject: activeQuiz.subject,
        },
      };
      setTodayAttempts((prev) => [optimisticAttempt, ...prev]);

      // Refetch daily pool to update "Completed ✓" badges
      void fetchDaily();
      void fetchAttempts(historyScope);

      // Refresh profile points / streak
      const profileRes = await authApi.getProfile().catch(() => null);
      if (profileRes?.user) {
        updateUser({
          name: profileRes.user.fullName,
          points: profileRes.user.points,
          streak: profileRes.user.streak,
          longestStreak: profileRes.user.longestStreak,
          badge: profileRes.user.badge,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit your quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── TOP HERO BANNER: 25 Daily Quizzes + Progress Bar + 00:00 IST Countdown ── */}
      <section className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-linear-to-br from-indigo-950 via-slate-900 to-indigo-900 p-6 text-white shadow-xl shadow-indigo-950/20 sm:p-8">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-violet-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Daily 25 Quizzes · Asia/Kolkata Midnight Rollover
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Today&apos;s Daily Challenge ({completedCount} / {totalDailyCount} Completed)
            </h1>
            <p className="max-w-xl text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every day at 00:00 IST, exactly 25 fresh quizzes are selected for your grade. A quiz served once is never served again. First attempt awards full XP!
            </p>

            {/* Completion Progress Bar */}
            <div className="max-w-md pt-1 space-y-1.5">
              <div className="flex justify-between text-xs text-indigo-200 font-semibold">
                <span>Daily Goal Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800 border border-slate-700/60">
                <div
                  className="h-full rounded-full bg-linear-to-r from-emerald-400 via-indigo-400 to-violet-500 transition-all duration-700"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Right Badges */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 shrink-0">
            {/* Live IST Countdown Clock */}
            <div className="rounded-2xl border border-slate-700/60 bg-slate-800/80 p-3 text-center backdrop-blur-md min-w-36.25 shadow-lg">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                New 25 Quizzes In
              </p>
              <p className="font-mono text-lg sm:text-xl font-extrabold text-amber-300">
                {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </p>
              <p className="text-[9px] text-slate-400">00:00 IST Reset</p>
            </div>

            {/* Current XP Card */}
            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-600/30 p-3 text-center backdrop-blur-md min-w-31.25 shadow-lg">
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                XP Balance
              </p>
              <p className="text-lg sm:text-xl font-extrabold text-white">
                {user?.points ?? 0} <span className="text-xs font-medium text-indigo-300">XP</span>
              </p>
              <p className="text-[9px] text-indigo-200">🔥 Day {user?.streak ?? 1} streak</p>
            </div>
          </div>
        </div>
      </section>

      {/* Global Error Banner / Free Server Wakeup Callout */}
      {error && (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs sm:text-sm text-rose-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span>{error}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void fetchDaily(true)}
              className="rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition"
            >
              {isWakingUp ? 'Connecting…' : 'Retry Now'}
            </button>
            <button type="button" onClick={() => setError(null)} className="font-bold text-rose-600 hover:text-rose-900 px-2">✕</button>
          </div>
        </div>
      )}

      {/* ── ACTIVE QUIZ MODAL / VIEW ── */}
      {activeQuiz && (
        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                  {activeQuiz.subject || 'General'}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {activeQuiz.questions?.length ?? 5} Questions · {activeQuizIsDaily ? `+${activeQuiz.xpReward} XP (First Attempt)` : 'Practice (0 XP)'}
                </span>
              </div>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">{activeQuiz.title}</h2>
              {activeQuiz.description && (
                <p className="mt-1 text-xs sm:text-sm text-slate-600">{activeQuiz.description}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveQuiz(null);
                setResult(null);
                setStartedAt(null);
              }}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              ← Back to Quizzes
            </button>
          </div>

          {/* Question List */}
          <div className="space-y-6">
            {activeQuiz.questions?.map((question, qIdx) => (
              <fieldset
                key={question.id}
                className="space-y-3 rounded-2xl border border-slate-200/90 bg-slate-50/50 p-5 transition hover:border-indigo-200"
              >
                <legend className="px-2 text-sm sm:text-base font-bold text-slate-900">
                  {qIdx + 1}. {question.question}
                </legend>
                <div className="grid gap-2.5 pt-1 sm:grid-cols-2">
                  {question.options.map((option, optIdx) => {
                    const isSelected = answers[qIdx] === optIdx;
                    return (
                      <label
                        key={`${question.id}-${optIdx}`}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-xs sm:text-sm font-medium transition ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`quiz-q-${question.id}`}
                          checked={isSelected}
                          onChange={() =>
                            setAnswers((cur) =>
                              cur.map((ans, idx) => (idx === qIdx ? optIdx : ans))
                            )
                          }
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          {/* Submit Result Box */}
          {result ? (
            <div
              role="status"
              className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 text-sm text-emerald-950 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-emerald-900">{result.message}</h3>
                  <p className="mt-1 text-slate-700 text-xs sm:text-sm">
                    Score: <strong>{result.score}/{result.totalQuestions}</strong> · Accuracy: <strong>{result.accuracy}%</strong> · XP Earned: <strong className="text-emerald-700">+{result.xpEarned} XP</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveQuiz(null);
                    setResult(null);
                  }}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                >
                  Done
                </button>
              </div>

              <div className="space-y-3 pt-3 border-t border-emerald-200/60">
                <p className="font-bold text-slate-800 text-xs sm:text-sm">Review & Explanations:</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {result.review.map((item, idx) => (
                    <div
                      key={`${idx}-${item.question}`}
                      className="rounded-xl border border-slate-200 bg-white p-4 text-xs shadow-2xs"
                    >
                      <p className="font-semibold text-slate-900">{item.question}</p>
                      <p
                        className={`mt-1 font-bold ${
                          item.isCorrect ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        Your answer: {item.yourAnswer} {item.isCorrect ? '✓' : `(Correct: ${item.correctAnswer})`}
                      </p>
                      {item.explanation && (
                        <p className="mt-1.5 text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-lg">
                          💡 {item.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setActiveQuiz(null);
                  setStartedAt(null);
                }}
                className="rounded-xl px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void submitQuiz()}
                disabled={
                  submitting ||
                  !activeQuiz.questions?.length ||
                  answers.some((ans) => ans < 0)
                }
                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {submitting ? 'Evaluating…' : 'Submit Quiz'}
              </button>
            </div>
          )}
        </section>
      )}

      {/* ── SECTION 1: TODAY'S 25 DAILY QUIZZES (PAGINATED GRID + SUBJECT PILLS) ── */}
      {!activeQuiz && (
        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Today&apos;s 25 Quizzes
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Handpicked 25 fresh quizzes for {dailyData?.grade || user?.grade || 'your class'}. Never repeated!
              </p>
            </div>

            {/* Subject Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {dailySubjects.map((subj) => (
                <button
                  key={subj}
                  type="button"
                  onClick={() => {
                    setDailySubjectFilter(subj);
                    setDailyPage(1);
                  }}
                  className={`rounded-full px-3 py-1 font-semibold transition ${
                    dailySubjectFilter === subj
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {subj === 'all' ? 'All Subjects' : subj}
                </button>
              ))}
            </div>
          </div>

          {dailyLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-56 rounded-3xl border border-slate-100 bg-slate-50 animate-pulse p-6" />
              ))}
            </div>
          ) : displayedDailyQuizzes.length > 0 ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {displayedDailyQuizzes.map((quiz) => {
                  const diffBadge = getDifficultyBadge(quiz.difficulty);
                  const isDone = Boolean(quiz.completedToday);

                  return (
                    <div
                      key={quiz.id}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/80 hover:shadow-xl hover:shadow-indigo-500/10"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${diffBadge.className}`}>
                              {diffBadge.label}
                            </span>
                            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-100">
                              +{quiz.xpReward} XP
                            </span>
                            <span className="text-[10px] text-slate-500">
                              ⏱ {quiz.timeLimitMinutes} min
                            </span>
                          </div>
                          <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">
                            {quiz.title}
                          </h3>
                        </div>

                        <div className="shrink-0">
                          <SubjectVisual subject={quiz.subject} size="md" />
                        </div>
                      </div>

                      {quiz.description && (
                        <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {quiz.description}
                        </p>
                      )}

                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                        {isDone ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                            <span>Completed ✓</span>
                            {quiz.bestScoreToday !== undefined && quiz.bestScoreToday !== null && (
                              <span className="text-emerald-700">({quiz.bestScoreToday} pts)</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            XP Available
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => void openQuiz(quiz.id, true, Date.now())}
                          className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                            isDone
                              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              : 'bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-700'
                          }`}
                        >
                          {isDone ? 'Practice Again (0 XP)' : 'Start Quiz →'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls for 25 cards */}
              {totalDailyPages > 1 && (
                <div className="flex items-center justify-between pt-2 text-xs">
                  <span className="text-slate-500 font-medium">
                    Showing {(dailyPage - 1) * DAILY_PAGE_SIZE + 1}–{Math.min(dailyPage * DAILY_PAGE_SIZE, filteredDailyQuizzes.length)} of {filteredDailyQuizzes.length} Daily Quizzes
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={dailyPage <= 1}
                      onClick={() => setDailyPage((p) => Math.max(1, p - 1))}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="font-bold text-slate-800">
                      {dailyPage} / {totalDailyPages}
                    </span>
                    <button
                      type="button"
                      disabled={dailyPage >= totalDailyPages}
                      onClick={() => setDailyPage((p) => Math.min(totalDailyPages, p + 1))}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-xs sm:text-sm text-slate-500">
              <p className="font-semibold text-slate-700">New quizzes are being prepared for your class</p>
              <p className="mt-1">Check back soon or try the practice question bank below.</p>
            </div>
          )}
        </section>
      )}

      {/* ── SECTION 2: RECENT PRACTICE QUESTION BANK (LAST 3 DAYS, 0 XP) ── */}
      {!activeQuiz && (
        <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Recent Practice Bank</h2>
                <span className="rounded-full bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 text-[10px] font-bold">
                  Last 3 Days · 0 XP
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Practice quizzes previously served in the last 3 days. Older quizzes disappear automatically to keep your study focused.
              </p>
            </div>

            {/* Search & Subject filter */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <input
                type="search"
                value={practiceSearch}
                onChange={(e) => setPracticeSearch(e.target.value)}
                placeholder="Search practice quizzes…"
                aria-label="Search quizzes"
                className="w-full sm:w-48 rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm focus:border-indigo-500 focus:outline-hidden"
              />
              <select
                value={practiceSubjectFilter}
                onChange={(e) => setPracticeSubjectFilter(e.target.value)}
                aria-label="Filter by subject"
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs sm:text-sm focus:border-indigo-500 focus:outline-hidden"
              >
                <option value="all">All Subjects</option>
                {dailySubjects.filter((s) => s !== 'all').map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {practiceLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 rounded-2xl bg-slate-50 animate-pulse" />
              ))}
            </div>
          ) : visiblePracticeQuizzes.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visiblePracticeQuizzes.slice(0, 15).map((quiz) => {
                const diffBadge = getDifficultyBadge(quiz.difficulty);
                return (
                  <div
                    key={quiz.id}
                    onClick={() => void openQuiz(quiz.id, false, Date.now())}
                    className="group cursor-pointer rounded-2xl border border-slate-200/90 bg-slate-50/40 p-4 transition-all duration-200 hover:border-indigo-300 hover:bg-white hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${diffBadge.className}`}>
                            {diffBadge.label}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500">
                            {quiz.subject}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition text-sm">
                          {quiz.title}
                        </h4>
                      </div>
                      <SubjectVisual subject={quiz.subject} size="sm" />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2.5">
                      <span className="font-semibold text-slate-400">Practice · 0 XP</span>
                      <span className="font-semibold text-indigo-600 group-hover:underline">
                        Solve →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
              No recent practice quizzes from the last 3 days match your search.
            </div>
          )}
        </section>
      )}

      {/* ── SECTION 3: YOUR SAVED ATTEMPTS (TODAY ONLY, FILLS UP AS SOLVED) ── */}
      {!activeQuiz && (
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">
                  Today&apos;s Attempts: {todayAttempts.length}
                </h2>
                <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
                  Resets 00:00 IST
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing quizzes you solved today (Asia/Kolkata). Fills up as you solve! Older attempts are safely archived and preserved in Lifetime Progress.
              </p>
            </div>

            {/* Scope toggle */}
            <div className="flex items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  setHistoryScope('today');
                  void fetchAttempts('today');
                }}
                className={`rounded-xl px-3 py-1.5 font-bold transition ${
                  historyScope === 'today'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Today Only
              </button>
              <button
                type="button"
                onClick={() => {
                  setHistoryScope('all');
                  void fetchAttempts('all');
                }}
                className={`rounded-xl px-3 py-1.5 font-bold transition ${
                  historyScope === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All History
              </button>
            </div>
          </div>

          {historyLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-slate-50 animate-pulse" />
              ))}
            </div>
          ) : todayAttempts.length > 0 ? (
            <div className="space-y-3">
              {todayAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-slate-50 hover:border-slate-200"
                >
                  <div className="flex items-center gap-3.5">
                    <SubjectVisual subject={attempt.quiz?.subject} size="sm" />
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {attempt.quiz?.title || 'Daily Quiz'}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {attempt.quiz?.subject || 'General'} · {formatISTDate(attempt.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-slate-200/50 pt-2 sm:pt-0">
                    <div className="w-28 sm:w-36">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>{attempt.score}/{attempt.totalQuestions}</span>
                        <span>{attempt.accuracy}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-indigo-500 to-violet-600"
                          style={{ width: `${Math.min(100, Math.max(0, attempt.accuracy))}%` }}
                        />
                      </div>
                    </div>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 min-w-17.5 text-center">
                      +{attempt.xpEarned} XP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-xs sm:text-sm text-slate-500 space-y-2">
              <p className="font-bold text-slate-700 text-sm">No attempts yet today</p>
              <p className="text-slate-500 max-w-sm mx-auto">
                Solve your first quiz above! As you complete today&apos;s daily challenges, your score and earned XP will appear here immediately.
              </p>
            </div>
          )}
        </section>
      )}

      {/* AI Tutor Callout */}
      <div className="rounded-2xl border border-violet-100 bg-linear-to-r from-violet-50 via-indigo-50 to-purple-50 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">Have doubts about a quiz question?</h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Use your earned XP to ask the AI Tutor for step-by-step guidance!
          </p>
        </div>
        <Link
          to="/doubts"
          className="rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-violet-600/20 hover:bg-violet-700 transition shrink-0"
        >
          Ask AI Tutor →
        </Link>
      </div>
    </div>
  );
};

export default Quizzes;