import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  Brain,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Coins,
  Filter,
  Flame,
  Layers,
  ListChecks,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import { Quiz, QuizGrade, QuizSubject, SubjectId } from '../../types/quiz';
import { CommitAttemptResult } from '../../types/gamification';
import { QUIZ_BANK, getQuizzesBySubject } from '../../data/quizBank';
import { QUIZ_SUBJECTS, SUBJECT_BY_ID } from '../../data/subjects';
import { useGamification } from '../../context/GamificationContext';
import { usePerformanceMode } from '../../context/PerformanceModeContext';
import { cx } from '../../utils/cx';
import { gradeQuiz } from '../../utils/quizScoring';
import { FIRST_CLEAR_TOKENS } from '../../utils/economy';
import QuizSubjectCard from './QuizSubjectCard';
import SubjectQuizList from './SubjectQuizList';
import QuizPlayer from './QuizPlayer';
import QuizResultCard from './QuizResultCard';
import QuizHistoryPanel from './QuizHistoryPanel';
import TokenWalletCard from '../gamification/TokenWalletCard';

type HubView = 'main' | 'list' | 'playing' | 'result';
type HubTab = 'all' | 'subjects' | 'history';

export interface QuizHubProps {
  onOpenAi: () => void;
}

const DIFFICULTY_STYLES: Record<Quiz['difficulty'], string> = {
  easy: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  hard: 'bg-rose-100 text-rose-700 border-rose-200',
};

export const QuizHub: React.FC<QuizHubProps> = ({ onOpenAi }) => {
  const { highGraphics } = usePerformanceMode();
  const {
    xp,
    tokens,
    attempts,
    completedQuizIds,
    subjectStats,
    streak,
    overallAccuracy,
    commitAttempt,
  } = useGamification();

  const [view, setView] = useState<HubView>('main');
  const [activeTab, setActiveTab] = useState<HubTab>('all');
  const [subjectId, setSubjectId] = useState<QuizSubject['id'] | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [grade, setGrade] = useState<QuizGrade | null>(null);
  const [result, setResult] = useState<CommitAttemptResult | null>(null);

  // Filters for "All Quizzes" tab
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'cleared' | 'new'>('all');

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

  /** Filtered quizzes list */
  const filteredQuizzes = useMemo(() => {
    return QUIZ_BANK.filter((quiz) => {
      // Subject filter
      if (selectedSubject !== 'all' && quiz.subjectId !== selectedSubject) return false;

      // Difficulty filter
      if (selectedDifficulty !== 'all' && quiz.difficulty !== selectedDifficulty) return false;

      // Status filter
      const isCleared = completedQuizIds.includes(quiz.id);
      if (selectedStatus === 'cleared' && !isCleared) return false;
      if (selectedStatus === 'new' && isCleared) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = quiz.title.toLowerCase().includes(q);
        const matchesDesc = quiz.description.toLowerCase().includes(q);
        const matchesSubject = SUBJECT_BY_ID[quiz.subjectId]?.name.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesSubject) return false;
      }

      return true;
    });
  }, [selectedSubject, selectedDifficulty, selectedStatus, searchQuery, completedQuizIds]);

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
        onExit={() => setView(subjectId ? 'list' : 'main')}
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
        onBack={() => setView(subjectId ? 'list' : 'main')}
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
        onBack={() => setView('main')}
      />
    );
  }

  // ── Main Hub View ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 sm:space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">Quizzes & XP Hub</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Take subject quizzes, score XP points, and recharge your AI Doubt Solver tokens!
          </p>
        </div>

        {/* Quick balance badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-black shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{xp} XP</span>
          </div>
          <button
            type="button"
            onClick={onOpenAi}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 text-xs font-black hover:bg-sky-100 transition-colors cursor-pointer shadow-xs"
          >
            <Brain className="w-3.5 h-3.5 text-sky-600" />
            <span>{tokens} AI Tokens</span>
          </button>
        </div>
      </div>

      {/* Quick stats banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { id: 'qs1', label: 'Quizzes Cleared', value: `${completedQuizIds.length}/${QUIZ_BANK.length}`, icon: Trophy, tone: 'text-indigo-600 bg-indigo-50' },
          { id: 'qs2', label: 'Avg Accuracy', value: `${overallAccuracy}%`, icon: Target, tone: 'text-emerald-600 bg-emerald-50' },
          { id: 'qs3', label: 'Day Streak', value: `${streak} Days`, icon: Flame, tone: 'text-amber-600 bg-amber-50' },
          { id: 'qs4', label: 'Available Quizzes', value: `${QUIZ_BANK.length} Total`, icon: BookOpen, tone: 'text-violet-600 bg-violet-50' },
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
                <p className="text-base sm:text-lg font-black text-slate-900 leading-none">{item.value}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-1 truncate">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quiz XP -> AI Doubt Solver connection hero */}
      <div
        className={cx(
          'p-4 sm:p-5 rounded-2xl sm:rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4',
          highGraphics
            ? 'bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white shadow-xl shadow-indigo-900/20'
            : 'bg-indigo-950 text-white'
        )}
      >
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/10">
            <Brain className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Quiz XP ⇄ AI Doubt Solver
              </span>
              <span className="text-[10px] text-indigo-200">10 XP = 1 AI Token</span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-white mt-1">
              Clear Quizzes to Earn XP and Power Your AI Tutor!
            </h3>
            <p className="text-[11px] sm:text-xs text-indigo-200/90 mt-0.5 max-w-xl">
              Each quiz completion awards up to +100 XP points and bonus tokens. Use your points to ask doubts anytime with 24/7 step-by-step AI solutions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <button
            type="button"
            onClick={onOpenAi}
            className="px-4 py-2.5 rounded-xl bg-amber-400 text-slate-950 text-xs font-black hover:bg-amber-300 transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-md"
          >
            <Brain className="w-4 h-4" />
            <span>Use AI Doubt Solver</span>
          </button>
        </div>
      </div>

      {/* Daily Challenge Card */}
      <div
        className={cx(
          'p-4 sm:p-5 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row sm:items-center gap-4',
          highGraphics
            ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white shadow-lg shadow-indigo-500/20'
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
            {SUBJECT_BY_ID[dailyQuiz.subjectId]?.name} · {dailyQuiz.questions.length} questions · +{dailyQuiz.baseXp} XP · +{FIRST_CLEAR_TOKENS[dailyQuiz.difficulty]} AI Tokens
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

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={cx(
            'flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer',
            activeTab === 'all'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          )}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>All Quizzes ({QUIZ_BANK.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('subjects')}
          className={cx(
            'flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer',
            activeTab === 'subjects'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          )}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>By Subject ({QUIZ_SUBJECTS.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={cx(
            'flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer',
            activeTab === 'history'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          )}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>History ({attempts.length})</span>
        </button>
      </div>

      {/* TAB 1: ALL QUIZZES (બધી Quizzes) */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          {/* Search & Filter Controls */}
          <div
            className={cx(
              'p-4 rounded-2xl sm:rounded-3xl space-y-3',
              highGraphics ? 'bg-white/90 border border-slate-200/80 shadow-xs' : 'bg-white border border-slate-200'
            )}
          >
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search all quizzes by title, concept, or subject..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Subject Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedSubject('all')}
                className={cx(
                  'px-3 py-1.5 rounded-xl text-[11px] font-black shrink-0 transition-all cursor-pointer',
                  selectedSubject === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                All Subjects ({QUIZ_BANK.length})
              </button>
              {QUIZ_SUBJECTS.map((sub) => {
                const count = getQuizzesBySubject(sub.id).length;
                const isSelected = selectedSubject === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSelectedSubject(sub.id)}
                    className={cx(
                      'px-3 py-1.5 rounded-xl text-[11px] font-black shrink-0 transition-all cursor-pointer flex items-center gap-1.5',
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    <span>{sub.name}</span>
                    <span className={cx('text-[10px] px-1.5 py-0.2 rounded-full font-bold', isSelected ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-200 text-slate-600')}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Difficulty & Status Filters */}
            <div className="flex items-center justify-between gap-2 flex-wrap pt-1 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Difficulty:</span>
                {['all', 'easy', 'medium', 'hard'].map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff)}
                    className={cx(
                      'px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer',
                      selectedDifficulty === diff
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    )}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Status:</span>
                {(['all', 'cleared', 'new'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStatus(st)}
                    className={cx(
                      'px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer',
                      selectedStatus === st
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    )}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quizzes List */}
          {filteredQuizzes.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-2">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No quizzes matched your filters</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSubject('all');
                  setSelectedDifficulty('all');
                  setSelectedStatus('all');
                }}
                className="text-xs text-indigo-600 font-black hover:underline cursor-pointer"
              >
                Reset all filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQuizzes.map((quiz) => {
                const isCleared = completedQuizIds.includes(quiz.id);
                const accuracy = bestAccuracy[quiz.id] ?? null;
                const subject = SUBJECT_BY_ID[quiz.subjectId];
                const minutes = Math.round(quiz.timeLimitSeconds / 60);

                return (
                  <div
                    key={quiz.id}
                    className={cx(
                      'p-4 sm:p-5 rounded-2xl sm:rounded-3xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 border',
                      isCleared ? 'bg-indigo-50/20 border-indigo-100' : 'bg-white border-slate-200',
                      highGraphics && 'hover:shadow-md'
                    )}
                  >
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {subject && (
                          <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-black">
                            {subject.name}
                          </span>
                        )}
                        <h4 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                          {quiz.title}
                        </h4>
                        <span className={cx('px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border', DIFFICULTY_STYLES[quiz.difficulty])}>
                          {quiz.difficulty}
                        </span>
                        {isCleared && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Best {accuracy}%
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2">
                        {quiz.description}
                      </p>

                      <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-[11px] font-semibold text-slate-500 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <ListChecks className="w-3.5 h-3.5 text-slate-400" />
                          {quiz.questions.length} questions
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {minutes} min
                        </span>
                        <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                          <Sparkles className="w-3.5 h-3.5" />
                          +{quiz.baseXp} XP Points
                        </span>
                        <span className="inline-flex items-center gap-1 text-sky-600 font-bold">
                          <Brain className="w-3.5 h-3.5" />
                          +{FIRST_CLEAR_TOKENS[quiz.difficulty]} AI Tokens
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => startQuiz(quiz)}
                      className={cx(
                        'flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shrink-0 w-full sm:w-auto',
                        highGraphics
                          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      )}
                    >
                      {isCleared ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                      <span>{isCleared ? 'Retake Quiz' : 'Start Quiz'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BY SUBJECT FOLDERS */}
      {activeTab === 'subjects' && (
        <div className="space-y-4">
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
      )}

      {/* TAB 3: QUIZ HISTORY */}
      {activeTab === 'history' && (
        <QuizHistoryPanel attempts={attempts} limit={30} />
      )}

      {/* Token Wallet Component */}
      <TokenWalletCard />
    </div>
  );
};

export default QuizHub;
