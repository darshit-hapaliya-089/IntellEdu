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
import SubjectVisual, { SUBJECT_THEMES } from '../components/quiz/SubjectVisual';

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

  // Daily quizzes state
  const [dailyData, setDailyData] = useState<DailyQuizzesResponse | null>(null);
  const [dailyLoading, setDailyLoading] = useState(true);

  // Practice & all quizzes
  const [practiceQuizzes, setPracticeQuizzes] = useState<QuizData[]>([]);
  const [practiceLoading, setPracticeLoading] = useState(true);

  // History state (last 7 days paginated)
  const [history, setHistory] = useState<QuizResultHistory[]>([]);
  const [historyMeta, setHistoryMeta] = useState<{
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
  }>({ total: 0, perPage: 20, currentPage: 1, lastPage: 1 });
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Active quiz state
  const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<QuizSubmitResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  // Filters & global error
  const [error, setError] = useState<string | null>(null);
  const [quizSearch, setQuizSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');

  // Countdown timer to next 00:00 IST
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const resetsAtRef = useRef<string | null>(null);

  // Load Daily Quizzes
  const fetchDaily = useCallback(async () => {
    try {
      setDailyLoading(true);
      const res = await quizzesApi.getDaily();
      setDailyData(res);
      resetsAtRef.current = res.resetsAt;
    } catch (err) {
      console.error('Failed to load daily quizzes:', err);
    } finally {
      setDailyLoading(false);
    }
  }, []);

  // Load Practice Quizzes
  const fetchPractice = useCallback(async () => {
    try {
      setPracticeLoading(true);
      const res = await quizzesApi.getAll();
      setPracticeQuizzes(res.quizzes);
    } catch (err) {
      console.error('Failed to load practice quizzes:', err);
    } finally {
      setPracticeLoading(false);
    }
  }, []);

  // Load Saved Attempts (7-day paginated)
  const fetchHistory = useCallback(async (page: number) => {
    try {
      setHistoryLoading(true);
      const res = await quizzesApi.getMyResults(page);
      setHistory(res.results || []);
      if (res.meta) {
        setHistoryMeta({
          total: res.meta.total ?? res.results.length,
          perPage: res.meta.perPage ?? 20,
          currentPage: res.meta.currentPage ?? page,
          lastPage: res.meta.lastPage ?? 1,
        });
      }
    } catch (err) {
      console.error('Failed to load quiz history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDaily();
    void fetchPractice();
    void fetchHistory(1);
  }, [fetchDaily, fetchPractice, fetchHistory]);

  // Countdown clock calculation
  useEffect(() => {
    const updateCountdown = () => {
      let targetTime: number;
      if (resetsAtRef.current) {
        targetTime = new Date(resetsAtRef.current).getTime();
      } else {
        // Fallback: next 00:00 IST
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istNow = new Date(now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + istOffset);
        const istMidnight = new Date(istNow);
        istMidnight.setHours(24, 0, 0, 0);
        targetTime = now.getTime() + (istMidnight.getTime() - istNow.getTime());
      }

      const diff = Math.max(0, targetTime - Date.now());
      if (diff === 0 && resetsAtRef.current) {
        // Clock expired, trigger fresh daily pull
        void fetchDaily();
      }

      const totalSeconds = Math.floor(diff / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [fetchDaily]);

  // Available filter options
  const availableGrades = useMemo(() => {
    const all = [...(dailyData?.quizzes ?? []), ...practiceQuizzes];
    return [...new Set(all.map((q) => q.grade).filter((g): g is string => Boolean(g)))].sort();
  }, [dailyData, practiceQuizzes]);

  const availableSubjects = useMemo(() => {
    const all = [...(dailyData?.quizzes ?? []), ...practiceQuizzes];
    return [...new Set(all.map((q) => q.subject).filter((s): s is string => Boolean(s)))].sort();
  }, [dailyData, practiceQuizzes]);

  // Filtered practice quizzes
  const visiblePracticeQuizzes = useMemo(() => {
    const query = quizSearch.trim().toLowerCase();
    const dailyIds = new Set((dailyData?.quizzes ?? []).map((q) => String(q.id)));

    return practiceQuizzes
      // Don't duplicate today's featured daily quizzes in practice if present
      .filter((q) => !dailyIds.has(String(q.id)))
      .filter((quiz) => {
        const matchesSearch =
          !query ||
          `${quiz.title} ${quiz.description ?? ''} ${quiz.subject ?? ''} ${quiz.grade ?? ''}`
            .toLowerCase()
            .includes(query);
        return (
          matchesSearch &&
          (gradeFilter === 'all' || quiz.grade === gradeFilter) &&
          (subjectFilter === 'all' || quiz.subject === subjectFilter)
        );
      });
  }, [dailyData, gradeFilter, practiceQuizzes, quizSearch, subjectFilter]);

  // Start a quiz
  const openQuiz = async (quizId: string | number, openedAt: number) => {
    try {
      setError(null);
      setResult(null);
      const { quiz } = await quizzesApi.getById(quizId);
      if (!quiz.questions?.length) throw new Error('This quiz does not have any questions yet.');
      setActiveQuiz(quiz);
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
      setError('Please answer all questions before submitting.');
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

      // Refresh daily quizzes to reflect completed state and history
      void fetchDaily();
      void fetchHistory(1);

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

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= historyMeta.lastPage) {
      setHistoryPage(newPage);
      void fetchHistory(newPage);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Header with XP & Live IST Reset Countdown */}
      <section className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-linear-to-br from-indigo-950 via-slate-900 to-indigo-900 p-6 text-white shadow-xl shadow-indigo-950/20 sm:p-8">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-violet-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Daily Quiz Arena · Asia/Kolkata
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Daily Challenge & Practice
            </h1>
            <p className="max-w-xl text-sm sm:text-base text-slate-300">
              Test your knowledge, claim your first-attempt daily XP reward, and keep your learning streak burning bright!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Countdown Badge */}
            <div className="rounded-2xl border border-slate-700/60 bg-slate-800/80 p-3 text-center backdrop-blur-md min-w-35 shadow-lg">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                New Quizzes In
              </p>
              <p className="font-mono text-lg sm:text-xl font-bold text-amber-300">
                {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </p>
            </div>

            {/* Current XP Card */}
            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-600/30 p-3 text-center backdrop-blur-md min-w-30 shadow-lg">
              <p className="text-[11px] font-medium uppercase tracking-wider text-indigo-200">
                XP Balance
              </p>
              <p className="text-lg sm:text-xl font-bold text-white">
                {user?.points ?? 0} <span className="text-xs font-medium text-indigo-300">XP</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Global Error Banner */}
      {error && (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 shadow-sm flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="font-bold text-rose-600 hover:text-rose-900 ml-4">✕</button>
        </div>
      )}

      {/* ACTIVE QUIZ MODAL / VIEW */}
      {activeQuiz && (
        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                  {activeQuiz.subject || 'General'}
                </span>
                <span className="text-xs text-slate-500">
                  {activeQuiz.questions?.length ?? 0} Questions · {activeQuiz.xpReward} XP Reward
                </span>
              </div>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">{activeQuiz.title}</h2>
              {activeQuiz.description && (
                <p className="mt-1 text-sm text-slate-600">{activeQuiz.description}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveQuiz(null);
                setResult(null);
                setStartedAt(null);
              }}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
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
                <legend className="px-2 text-base font-bold text-slate-900">
                  {qIdx + 1}. {question.question}
                </legend>
                <div className="grid gap-2.5 pt-1 sm:grid-cols-2">
                  {question.options.map((option, optIdx) => {
                    const isSelected = answers[qIdx] === optIdx;
                    return (
                      <label
                        key={`${question.id}-${optIdx}`}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-sm font-medium transition ${
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
                  <p className="mt-1 text-slate-700">
                    Score: <strong>{result.score}/{result.totalQuestions}</strong> · Accuracy: <strong>{result.accuracy}%</strong> · XP Earned: <strong className="text-emerald-700">+{result.xpEarned} XP</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveQuiz(null);
                    setResult(null);
                  }}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white hover:bg-emerald-700 transition"
                >
                  Done
                </button>
              </div>

              <div className="space-y-3 pt-3 border-t border-emerald-200/60">
                <p className="font-bold text-slate-800">Review & Explanations:</p>
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
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900"
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
                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50 transition"
              >
                {submitting ? 'Evaluating…' : 'Submit Quiz'}
              </button>
            </div>
          )}
        </section>
      )}

      {/* SECTION 1: TODAY'S DAILY QUIZZES (00:00 IST) */}
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
                  Today&apos;s Quizzes
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Handpicked daily challenge for {dailyData?.grade || user?.grade || 'your class'}. Earn XP on your first attempt today!
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full px-3 py-1.5">
              <span>Resets nightly at 00:00 IST</span>
            </div>
          </div>

          {dailyLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-56 rounded-3xl border border-slate-100 bg-slate-50 animate-pulse p-6"
                />
              ))}
            </div>
          ) : dailyData?.quizzes?.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {dailyData.quizzes.map((quiz) => {
                const diffBadge = getDifficultyBadge(quiz.difficulty);
                const isDone = Boolean(quiz.completedToday);

                return (
                  <div
                    key={quiz.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-400/80 hover:shadow-xl hover:shadow-indigo-500/10"
                  >
                    {/* Top Subject Visual in Free Space */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${diffBadge.className}`}
                          >
                            {diffBadge.label}
                          </span>
                          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 border border-indigo-100">
                            +{quiz.xpReward} XP
                          </span>
                          <span className="text-[11px] text-slate-500">
                            ⏱ {quiz.timeLimitMinutes} min
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">
                          {quiz.title}
                        </h3>
                      </div>

                      {/* Visual */}
                      <div className="shrink-0">
                        <SubjectVisual subject={quiz.subject} size="md" />
                      </div>
                    </div>

                    {quiz.description && (
                      <p className="mt-3 text-xs sm:text-sm text-slate-600 line-clamp-2">
                        {quiz.description}
                      </p>
                    )}

                    {/* Bottom Status & CTA */}
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
                        onClick={() => void openQuiz(quiz.id, Date.now())}
                        className={`rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm ${
                          isDone
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-700'
                        }`}
                      >
                        {isDone ? 'Retake Quiz' : 'Start Quiz →'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-sm text-slate-500">
              No daily quizzes configured for today. Practice quizzes are available below!
            </div>
          )}
        </section>
      )}

      {/* SECTION 2: PRACTICE QUIZZES & FILTERS */}
      {!activeQuiz && (
        <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Practice Question Bank</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Explore subjects anytime to brush up your concepts.
              </p>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <input
                type="search"
                value={quizSearch}
                onChange={(e) => setQuizSearch(e.target.value)}
                placeholder="Search practice quizzes…"
                aria-label="Search quizzes"
                className="w-full sm:w-48 rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm focus:border-indigo-500 focus:outline-hidden"
              />
              {availableGrades.length > 0 && (
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  aria-label="Filter by grade"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs sm:text-sm focus:border-indigo-500 focus:outline-hidden"
                >
                  <option value="all">All Grades</option>
                  {availableGrades.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              )}
              {availableSubjects.length > 0 && (
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  aria-label="Filter by subject"
                  className="rounded-xl border border-slate-200 px-3 py-2 text-xs sm:text-sm focus:border-indigo-500 focus:outline-hidden"
                >
                  <option value="all">All Subjects</option>
                  {availableSubjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              )}
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
              {visiblePracticeQuizzes.map((quiz) => {
                const diffBadge = getDifficultyBadge(quiz.difficulty);
                return (
                  <div
                    key={quiz.id}
                    onClick={() => void openQuiz(quiz.id, Date.now())}
                    className="group cursor-pointer rounded-2xl border border-slate-200/90 bg-slate-50/40 p-4 transition-all duration-200 hover:border-indigo-300 hover:bg-white hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${diffBadge.className}`}
                          >
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
                      <span>{quiz.grade || 'All Grades'}</span>
                      <span className="font-semibold text-indigo-600 group-hover:underline">
                        Practice →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-500">
              No practice quizzes match your current filters.
            </div>
          )}
        </section>
      )}

      {/* SECTION 3: SAVED ATTEMPTS (LAST 7 DAYS) */}
      {!activeQuiz && (
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Your Saved Attempts</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing activity from the last 7 days (Asia/Kolkata). Lifetime stats remain preserved in Progress & Stats.
              </p>
            </div>
            {historyMeta.total > 0 && (
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                {historyMeta.total} {historyMeta.total === 1 ? 'Attempt' : 'Attempts'}
              </span>
            )}
          </div>

          {historyLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-2xl bg-slate-50 animate-pulse" />
              ))}
            </div>
          ) : history.length > 0 ? (
            <div className="space-y-3">
              {history.map((attempt) => (
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
                    {/* Accuracy Bar */}
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

                    {/* XP Tag */}
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 min-w-17.5 text-center">
                      +{attempt.xpEarned} XP
                    </span>
                  </div>
                </div>
              ))}

              {/* Pagination Controls */}
              {historyMeta.lastPage > 1 && (
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                  <span className="text-slate-500">
                    Page {historyMeta.currentPage} of {historyMeta.lastPage}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={historyMeta.currentPage <= 1}
                      onClick={() => handlePageChange(historyMeta.currentPage - 1)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={historyMeta.currentPage >= historyMeta.lastPage}
                      onClick={() => handlePageChange(historyMeta.currentPage + 1)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-xs text-slate-500">
              <p className="font-semibold text-slate-700 text-sm">No attempts in the last 7 days</p>
              <p className="mt-1">Take today&apos;s daily quiz above to kick off your streak and earn XP!</p>
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
          to="/dashboard/doubts"
          className="rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-violet-600/20 hover:bg-violet-700 transition shrink-0"
        >
          Ask AI Tutor →
        </Link>
      </div>
    </div>
  );
};

export default Quizzes;