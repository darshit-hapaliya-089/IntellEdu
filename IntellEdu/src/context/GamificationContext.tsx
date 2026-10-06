import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import { CommitAttemptResult, GamificationState } from '../types/gamification';
import { DailyActivity, SubjectStat, WeeklyPoint } from '../types/progress';
import { Quiz, QuizAttempt } from '../types/quiz';
import { BadgeStatus, resolveBadges } from '../data/badges';
import { buildSeedState } from '../data/seedState';
import { gradeQuiz, attemptMinutes } from '../utils/quizScoring';
import {
  computeBadgeMetrics,
  computeOverallAccuracy,
  computeSubjectStats,
  computeTotalStudyMinutes,
  computeWeeklyPoints,
  getTodayActivity,
} from '../utils/gamificationSelectors';
import { getLevelInfo, LevelInfo, tokensToXp, xpToTokens } from '../utils/economy';
import { getStoredValue, setStoredValue } from '../utils/storage';
import { todayKey, yesterdayKey } from '../utils/dateUtils';

const STORAGE_KEY = 'intellEdu_gamification';

export interface TokenExchangeResult {
  xpSpent: number;
  tokensGained: number;
}

interface GamificationContextValue {
  xp: number;
  tokens: number;
  tokensSpent: number;
  streak: number;
  bestStreak: number;
  attempts: QuizAttempt[];
  levelInfo: LevelInfo;
  badges: BadgeStatus[];
  subjectStats: SubjectStat[];
  weeklyPoints: WeeklyPoint[];
  todayActivity: DailyActivity;
  daily: Record<string, DailyActivity>;
  totalStudyMinutes: number;
  overallAccuracy: number;
  completedQuizIds: string[];
  commitAttempt: (quiz: Quiz, answers: number[], timeTakenSeconds: number) => CommitAttemptResult;
  convertXpToTokens: (xpAmount: number) => TokenExchangeResult | null;
  spendTokens: (count: number) => boolean;
  registerLesson: () => void;
  resetProgress: () => void;
}

const GamificationContext = createContext<GamificationContextValue | undefined>(undefined);

/** Returns a fresh daily record for `dayKey`. */
function emptyDay(dayKey: string): DailyActivity {
  return { date: dayKey, quizzes: 0, xpEarned: 0, minutes: 0, lessons: 0 };
}

/**
 * Advances the streak for a learning action happening today and adds the
 * action to today's daily bucket. Pure — returns a new state object.
 */
function applyActivity(
  state: GamificationState,
  delta: { quizzes: number; xp: number; minutes: number; lessons: number }
): GamificationState {
  const today = todayKey();
  const existing = state.daily[today] ?? emptyDay(today);
  const updatedDay: DailyActivity = {
    ...existing,
    date: today,
    quizzes: existing.quizzes + delta.quizzes,
    xpEarned: existing.xpEarned + delta.xp,
    minutes: existing.minutes + delta.minutes,
    lessons: existing.lessons + delta.lessons,
  };

  let streak = state.streak;
  if (state.lastActiveDate !== today) {
    streak = state.lastActiveDate === yesterdayKey() ? state.streak + 1 : 1;
  }

  return {
    ...state,
    streak,
    bestStreak: Math.max(state.bestStreak, streak),
    lastActiveDate: today,
    daily: { ...state.daily, [today]: updatedDay },
  };
}
interface GamificationProviderProps {
  children: ReactNode;
}

export const GamificationProvider: React.FC<GamificationProviderProps> = ({ children }) => {
  const [state, setState] = useState<GamificationState>(() =>
    getStoredValue<GamificationState>(STORAGE_KEY, buildSeedState())
  );

  /** Persist every state change so progress survives reloads. */
  const persist = useCallback((next: GamificationState) => {
    setState(next);
    setStoredValue(STORAGE_KEY, next);
  }, []);

  const commitAttempt = useCallback(
    (quiz: Quiz, answers: number[], timeTakenSeconds: number): CommitAttemptResult => {
      let result: CommitAttemptResult = {
        xpEarned: 0,
        tokensEarned: 0,
        freshlyUnlocked: [],
        leveledUp: false,
        newLevel: 1,
      };

      setState((prev) => {
        const isFirstClear = !prev.completedQuizIds.includes(quiz.id);
        const grade = gradeQuiz(quiz, answers, timeTakenSeconds, isFirstClear);
        const levelBefore = getLevelInfo(prev.xp).level;

        const attempt: QuizAttempt = {
          id: `att-${Date.now()}-${quiz.id}`,
          quizId: quiz.id,
          quizTitle: quiz.title,
          subjectId: quiz.subjectId,
          score: grade.score,
          totalQuestions: grade.totalQuestions,
          accuracy: grade.accuracy,
          xpEarned: grade.xpEarned,
          tokensEarned: grade.tokensEarned,
          timeTakenSeconds,
          answers,
          completedAt: new Date().toISOString(),
        };

        const withActivity = applyActivity(prev, {
          quizzes: 1,
          xp: grade.xpEarned,
          minutes: attemptMinutes(timeTakenSeconds),
          lessons: 0,
        });

        const completedQuizIds = isFirstClear
          ? [...withActivity.completedQuizIds, quiz.id]
          : withActivity.completedQuizIds;

        const next: GamificationState = {
          ...withActivity,
          xp: withActivity.xp + grade.xpEarned,
          tokens: withActivity.tokens + grade.tokensEarned,
          tokensEarnedFromQuizzes: withActivity.tokensEarnedFromQuizzes + grade.tokensEarned,
          attempts: [attempt, ...withActivity.attempts],
          completedQuizIds,
        };

        // Recompute badge unlocks and record any newly earned ones.
        const resolved = resolveBadges(computeBadgeMetrics(next));
        const previouslyUnlocked = new Set(prev.unlockedBadgeIds);
        const freshlyUnlocked = resolved
          .filter((badge) => badge.unlocked && !previouslyUnlocked.has(badge.id))
          .map((badge) => badge.id);
        next.unlockedBadgeIds = resolved.filter((b) => b.unlocked).map((b) => b.id);

        const newLevel = getLevelInfo(next.xp).level;
        result = {
          xpEarned: grade.xpEarned,
          tokensEarned: grade.tokensEarned,
          freshlyUnlocked,
          leveledUp: newLevel > levelBefore,
          newLevel,
        };

        setStoredValue(STORAGE_KEY, next);
        return next;
      });

      return result;
    },
    []
  );

  const convertXpToTokens = useCallback(
    (xpAmount: number): TokenExchangeResult | null => {
      const tokensGained = xpToTokens(xpAmount);
      if (tokensGained <= 0) return null;

      const xpSpent = tokensToXp(tokensGained);
      let success = false;

      setState((prev) => {
        if (prev.xp < xpSpent) return prev;
        success = true;
        const next: GamificationState = { ...prev, xp: prev.xp - xpSpent, tokens: prev.tokens + tokensGained };
        setStoredValue(STORAGE_KEY, next);
        return next;
      });

      return success ? { xpSpent, tokensGained } : null;
    },
    []
  );

  const spendTokens = useCallback((count: number): boolean => {
    let success = false;
    setState((prev) => {
      if (prev.tokens < count) return prev;
      success = true;
      const next: GamificationState = {
        ...prev,
        tokens: prev.tokens - count,
        tokensSpent: prev.tokensSpent + count,
      };
      setStoredValue(STORAGE_KEY, next);
      return next;
    });
    return success;
  }, []);

  const registerLesson = useCallback(() => {
    setState((prev) => {
      const next = applyActivity(prev, { quizzes: 0, xp: 10, minutes: 5, lessons: 1 });
      const withXp = { ...next, xp: next.xp + 10 };
      setStoredValue(STORAGE_KEY, withXp);
      return withXp;
    });
  }, []);

  const resetProgress = useCallback(() => {
    persist(buildSeedState());
  }, [persist]);

  const levelInfo = useMemo(() => getLevelInfo(state.xp), [state.xp]);
  const badges = useMemo(() => resolveBadges(computeBadgeMetrics(state)), [state]);
  const subjectStats = useMemo(() => computeSubjectStats(state.attempts), [state.attempts]);
  const weeklyPoints = useMemo(() => computeWeeklyPoints(state.daily), [state.daily]);
  const todayActivity = useMemo(() => getTodayActivity(state.daily), [state.daily]);
  const totalStudyMinutes = useMemo(() => computeTotalStudyMinutes(state.daily), [state.daily]);
  const overallAccuracy = useMemo(() => computeOverallAccuracy(state.attempts), [state.attempts]);

  return (
    <GamificationContext.Provider
      value={{
        xp: state.xp,
        tokens: state.tokens,
        tokensSpent: state.tokensSpent,
        streak: state.streak,
        bestStreak: state.bestStreak,
        attempts: state.attempts,
        levelInfo,
        badges,
        subjectStats,
        weeklyPoints,
        todayActivity,
        daily: state.daily,
        totalStudyMinutes,
        overallAccuracy,
        completedQuizIds: state.completedQuizIds,
        commitAttempt,
        convertXpToTokens,
        spendTokens,
        registerLesson,
        resetProgress,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = (): GamificationContextValue => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};
