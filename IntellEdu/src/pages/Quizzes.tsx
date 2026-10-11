import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { authApi, quizzesApi, type QuizData, type QuizResultHistory, type QuizSubmitResult } from '../services/api';

const Quizzes: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [serverQuizzes, setServerQuizzes] = useState<QuizData[]>([]);
  const [history, setHistory] = useState<QuizResultHistory[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<QuizSubmitResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quizSearch, setQuizSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');

  const availableGrades = useMemo(
    () => [...new Set(serverQuizzes.map((quiz) => quiz.grade).filter((grade): grade is string => Boolean(grade)))].sort(),
    [serverQuizzes]
  );
  const availableSubjects = useMemo(
    () => [...new Set(serverQuizzes.map((quiz) => quiz.subject).filter((subject): subject is string => Boolean(subject)))].sort(),
    [serverQuizzes]
  );
  const visibleQuizzes = useMemo(() => {
    const query = quizSearch.trim().toLowerCase();
    return serverQuizzes.filter((quiz) => {
      const matchesSearch = !query || `${quiz.title} ${quiz.description ?? ''} ${quiz.subject ?? ''} ${quiz.grade ?? ''}`.toLowerCase().includes(query);
      return matchesSearch
        && (gradeFilter === 'all' || quiz.grade === gradeFilter)
        && (subjectFilter === 'all' || quiz.subject === subjectFilter);
    });
  }, [gradeFilter, quizSearch, serverQuizzes, subjectFilter]);

  useEffect(() => {
    let active = true;
    Promise.all([quizzesApi.getAll(), quizzesApi.getMyResults()])
      .then(([quizResponse, resultResponse]) => {
        if (!active) return;
        setServerQuizzes(quizResponse.quizzes);
        setHistory(resultResponse.results);
        setError(null);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Could not load quiz data from the server.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const openServerQuiz = async (quizId: string | number, openedAt: number) => {
    try {
      setError(null);
      setResult(null);
      const { quiz } = await quizzesApi.getById(quizId);
      if (!quiz.questions?.length) throw new Error('This quiz does not have any questions yet.');
      setActiveQuiz(quiz);
      setAnswers(Array(quiz.questions?.length ?? 0).fill(-1));
      setStartedAt(openedAt);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not open this server quiz.');
    }
  };

  const submitServerQuiz = async () => {
    if (!activeQuiz) return;
    if (answers.some((answer) => answer < 0)) {
      setError('Answer each question before submitting.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const elapsedSeconds = startedAt === null ? undefined : Math.max(1, Math.floor((Date.now() - startedAt) / 1000));
      const submitted = await quizzesApi.submit(activeQuiz.id, answers, elapsedSeconds);
      setResult(submitted);
      if (typeof submitted.currentXpBalance === 'number') {
        updateUser({ points: submitted.currentXpBalance });
      }
      const [historyResult, profileResult] = await Promise.allSettled([
        quizzesApi.getMyResults(),
        authApi.getProfile(),
      ]);
      if (historyResult.status === 'fulfilled') {
        setHistory(historyResult.value.results);
      }
      if (profileResult.status === 'fulfilled') {
        const { user } = profileResult.value;
        updateUser({
          name: user.fullName,
          email: user.email,
          phone: user.phone,
          grade: user.grade,
          points: user.points,
          streak: user.streak,
          badge: user.badge,
          ...(user.avatarUrl ? { avatar: user.avatarUrl } : {}),
        });
      }
      if (historyResult.status === 'rejected' || profileResult.status === 'rejected') {
        setError('Your quiz was saved, but some account data could not be refreshed. Reload this page to sync it.');
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not submit your quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-bold text-indigo-950">Quizzes & XP</h2>
            <p className="mt-1 text-sm text-indigo-800">
              {loading ? 'Loading quizzes and your saved attempts…' : `${serverQuizzes.length} quizzes · ${history.length} saved attempts, synced with your account`}
            </p>
          </div>
          <p className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-indigo-800">{user?.points ?? 0} XP balance</p>
        </div>
      </section>
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      {!activeQuiz && !loading && serverQuizzes.length > 0 && (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Available Quizzes</h3>
              <p className="mt-1 text-xs text-slate-500">{visibleQuizzes.length} of {serverQuizzes.length} quizzes</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="search"
                value={quizSearch}
                onChange={(event) => setQuizSearch(event.target.value)}
                placeholder="Search quizzes"
                aria-label="Search quizzes"
                className="min-w-40 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
              {availableGrades.length > 0 && (
                <select value={gradeFilter} onChange={(event) => setGradeFilter(event.target.value)} aria-label="Filter quizzes by grade" className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <option value="all">All grades</option>
                  {availableGrades.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
                </select>
              )}
              {availableSubjects.length > 0 && (
                <select value={subjectFilter} onChange={(event) => setSubjectFilter(event.target.value)} aria-label="Filter quizzes by subject" className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <option value="all">All subjects</option>
                  {availableSubjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
                </select>
              )}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {visibleQuizzes.map((quiz) => (
              <button
                key={quiz.id}
                type="button"
                onClick={() => void openServerQuiz(quiz.id, Date.now())}
                className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-indigo-400 hover:bg-indigo-50"
              >
                <span className="block font-bold text-slate-900">{quiz.title}</span>
                {quiz.description && <span className="mt-1 block text-sm text-slate-600">{quiz.description}</span>}
                <span className="mt-2 block text-xs text-slate-500">
                  {[quiz.grade, quiz.subject, `${quiz.xpReward} XP`, `${quiz.timeLimitMinutes} min`].filter(Boolean).join(' · ')}
                </span>
              </button>
            ))}
          </div>
          {visibleQuizzes.length === 0 && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No quizzes match these filters.</p>}
        </section>
      )}
      {activeQuiz && (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-bold text-slate-900">{activeQuiz.title}</h4>
                <button type="button" onClick={() => { setActiveQuiz(null); setResult(null); setStartedAt(null); }} className="text-sm font-semibold text-indigo-600">All quizzes</button>
              </div>
              {activeQuiz.questions?.map((question, questionIndex) => (
                <fieldset key={question.id} className="space-y-2 rounded-xl border border-slate-200 p-4">
                  <legend className="px-1 text-sm font-semibold text-slate-800">{questionIndex + 1}. {question.question}</legend>
                  {question.options.map((option, optionIndex) => (
                    <label key={`${question.id}-${optionIndex}`} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                      <input
                        type="radio"
                        name={`server-quiz-${question.id}`}
                        checked={answers[questionIndex] === optionIndex}
                        onChange={() => setAnswers((current) => current.map((answer, index) => index === questionIndex ? optionIndex : answer))}
                      />
                      {option}
                    </label>
                  ))}
                </fieldset>
              ))}
              {result ? (
                <div role="status" className="space-y-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
                  <p className="font-semibold">{result.message}</p>
                  <p>Score: {result.score}/{result.totalQuestions} · {result.accuracy}% · {result.xpEarned} XP earned.</p>
                  <ul className="space-y-2">
                    {result.review.map((item, index) => (
                      <li key={`${index}-${item.question}`} className="rounded-lg bg-white/70 p-3">
                        <p className="font-semibold">{item.question}</p>
                        <p className={item.isCorrect ? 'text-emerald-700' : 'text-rose-700'}>
                          Your answer: {item.yourAnswer} {item.isCorrect ? '✓' : `· Correct answer: ${item.correctAnswer}`}
                        </p>
                        {item.explanation && <p className="mt-1 text-slate-600">{item.explanation}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => void submitServerQuiz()}
                  disabled={submitting || !activeQuiz.questions?.length || answers.some((answer) => answer < 0)}
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                >
                  {submitting ? 'Submitting…' : 'Submit to Backend'}
                </button>
              )}
          </div>
        </section>
      )}
      {!loading && !activeQuiz && serverQuizzes.length === 0 && !error && (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">No quizzes are published yet.</p>
      )}
      {!loading && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <h3 className="font-bold text-slate-900">Your Saved Attempts</h3>
          {history.length ? (
            <ul className="mt-3 divide-y divide-slate-100">
              {history.map((attempt) => (
                <li key={attempt.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <span className="font-semibold text-slate-800">{attempt.quiz.title}</span>
                  <span className="text-slate-600">{attempt.score}/{attempt.totalQuestions} · {attempt.accuracy}% · +{attempt.xpEarned} XP</span>
                </li>
              ))}
            </ul>
          ) : <p className="mt-2 text-sm text-slate-500">Your completed quizzes will appear here.</p>}
        </section>
      )}
      <Link to="/dashboard/doubts" className="inline-flex rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white">Ask the AI tutor</Link>
    </div>
  );
};

export default Quizzes;