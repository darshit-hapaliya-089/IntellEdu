import { BadgeMetrics } from '../data/badges';
import { DailyActivity, SubjectStat, WeeklyPoint } from '../types/progress';
import { GamificationState } from '../types/gamification';
import { QuizAttempt, SubjectId } from '../types/quiz';
import { lastNDayKeys, todayKey, weekdayLabel } from './dateUtils';

const EMPTY_DAY: DailyActivity = {
  date: '',
  quizzes: 0,
  xpEarned: 0,
  minutes: 0,
  lessons: 0,
};

/** Aggregate accuracy and XP per subject the student has attempted. */
export function computeSubjectStats(attempts: QuizAttempt[]): SubjectStat[] {
  const map = new Map<SubjectId, { correct: number; total: number; attempts: number; xp: number }>();

  attempts.forEach((attempt) => {
    const entry =
      map.get(attempt.subjectId) ?? { correct: 0, total: 0, attempts: 0, xp: 0 };
    entry.correct += attempt.score;
    entry.total += attempt.totalQuestions;
    entry.attempts += 1;
    entry.xp += attempt.xpEarned;
    map.set(attempt.subjectId, entry);
  });

  return Array.from(map.entries()).map(([subjectId, value]) => ({
    subjectId,
    attempts: value.attempts,
    accuracy: value.total === 0 ? 0 : Math.round((value.correct / value.total) * 100),
    xpEarned: value.xp,
  }));
}

/** XP earned across the last seven days, oldest first, for the trend chart. */
export function computeWeeklyPoints(daily: Record<string, DailyActivity>): WeeklyPoint[] {
  return lastNDayKeys(7).map((dayKey) => ({
    label: weekdayLabel(dayKey),
    xp: daily[dayKey]?.xpEarned ?? 0,
  }));
}

/** Today's activity record, or a zeroed record when nothing has happened yet. */
export function getTodayActivity(daily: Record<string, DailyActivity>): DailyActivity {
  const key = todayKey();
  return daily[key] ?? { ...EMPTY_DAY, date: key };
}

/** Lifetime study minutes accumulated from every logged activity. */
export function computeTotalStudyMinutes(daily: Record<string, DailyActivity>): number {
  return Object.values(daily).reduce((sum, entry) => sum + entry.minutes, 0);
}

/** Weighted accuracy across every question ever answered. */
export function computeOverallAccuracy(attempts: QuizAttempt[]): number {
  const totals = attempts.reduce(
    (acc, attempt) => {
      acc.correct += attempt.score;
      acc.total += attempt.totalQuestions;
      return acc;
    },
    { correct: 0, total: 0 }
  );
  return totals.total === 0 ? 0 : Math.round((totals.correct / totals.total) * 100);
}

/** Count distinct quizzes that have ever been answered perfectly. */
export function countPerfectQuizzes(attempts: QuizAttempt[]): number {
  const perfect = new Set<string>();
  attempts.forEach((attempt) => {
    if (attempt.accuracy === 100) perfect.add(attempt.quizId);
  });
  return perfect.size;
}

/** Distinct subjects the student has attempted at least one quiz in. */
export function countSubjectsTouched(attempts: QuizAttempt[]): number {
  return new Set(attempts.map((attempt) => attempt.subjectId)).size;
}

/** Total XP banked from quiz attempts only (excludes carry-over). */
export function sumAttemptXp(attempts: QuizAttempt[]): number {
  return attempts.reduce((sum, attempt) => sum + attempt.xpEarned, 0);
}

/** All metrics a badge can unlock against, derived from current state. */
export function computeBadgeMetrics(state: GamificationState): BadgeMetrics {
  return {
    totalQuizzes: state.attempts.length,
    perfectQuizzes: countPerfectQuizzes(state.attempts),
    currentStreak: state.streak,
    totalXp: state.xp,
    subjectsTouched: countSubjectsTouched(state.attempts),
    averageAccuracy: computeOverallAccuracy(state.attempts),
    tokensEarnedFromQuizzes: state.tokensEarnedFromQuizzes,
  };
}
