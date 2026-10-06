import { DailyActivity } from './progress';
import { QuizAttempt } from './quiz';

/**
 * Everything the XP ⇄ token economy needs, persisted to localStorage as one blob.
 */
export interface GamificationState {
  /** Total XP — leaderboard score and the currency convertible into tokens. */
  xp: number;
  /** Untouched AI Tutor tokens available to spend on chatbot answers. */
  tokens: number;
  /** Lifetime tokens spent in the AI Tutor. */
  tokensSpent: number;
  /** Lifetime tokens earned specifically from clearing quizzes. */
  tokensEarnedFromQuizzes: number;
  /** Consecutive days with at least one learning action. */
  streak: number;
  bestStreak: number;
  /** ISO day key of the most recent learning action. */
  lastActiveDate: string;
  attempts: QuizAttempt[];
  /** Daily activity keyed by `YYYY-MM-DD`. */
  daily: Record<string, DailyActivity>;
  completedQuizIds: string[];
  unlockedBadgeIds: string[];
}

/** Result returned when a quiz attempt is committed. */
export interface CommitAttemptResult {
  xpEarned: number;
  tokensEarned: number;
  freshlyUnlocked: string[];
  leveledUp: boolean;
  newLevel: number;
}
