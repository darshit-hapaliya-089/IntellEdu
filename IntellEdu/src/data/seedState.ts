import { GamificationState } from '../types/gamification';
import { DailyActivity } from '../types/progress';
import { QuizAttempt } from '../types/quiz';
import { getQuizById } from './quizBank';
import { gradeQuiz, attemptMinutes } from '../utils/quizScoring';
import { dayKeyOffset } from '../utils/dateUtils';
import { STARTING_TOKENS } from '../utils/economy';

/** A base amount of XP the demo student "arrived with" before this session. */
const CARRY_OVER_XP = 2050;

interface SeedSpec {
  quizId: string;
  score: number;
  daysAgo: number;
  timeTakenSeconds: number;
}

/**
 * A small, realistic history spread across the last two weeks so the Progress
 * tab, badges and daily chart are populated the moment the app loads.
 */
const SEED_SPECS: SeedSpec[] = [
  { quizId: 'science-chemical-reactions', score: 4, daysAgo: 11, timeTakenSeconds: 190 },
  { quizId: 'maths-algebra-basics', score: 5, daysAgo: 11, timeTakenSeconds: 130 },
  { quizId: 'gk-india', score: 5, daysAgo: 9, timeTakenSeconds: 95 },
  { quizId: 'social-resources', score: 4, daysAgo: 8, timeTakenSeconds: 160 },
  { quizId: 'english-grammar-essentials', score: 3, daysAgo: 6, timeTakenSeconds: 175 },
  { quizId: 'computer-fundamentals', score: 5, daysAgo: 5, timeTakenSeconds: 120 },
  { quizId: 'science-motion-force', score: 4, daysAgo: 3, timeTakenSeconds: 205 },
  { quizId: 'maths-arithmetic-speed', score: 5, daysAgo: 2, timeTakenSeconds: 110 },
  { quizId: 'english-vocabulary-power', score: 4, daysAgo: 1, timeTakenSeconds: 185 },
  { quizId: 'gk-world', score: 3, daysAgo: 1, timeTakenSeconds: 200 },
];

function buildSeedAttempt(spec: SeedSpec, attemptIndex: number): QuizAttempt | null {
  const quiz = getQuizById(spec.quizId);
  if (!quiz) return null;

  // Answer the first `score` questions correctly and miss the rest.
  const preciseAnswers = quiz.questions.map((question, index) =>
    index < spec.score ? question.correctIndex : (question.correctIndex + 1) % 4
  );

  const grade = gradeQuiz(quiz, preciseAnswers, spec.timeTakenSeconds, true);
  const completedAt = new Date();
  completedAt.setDate(completedAt.getDate() - spec.daysAgo);

  return {
    id: `seed-${attemptIndex}-${quiz.id}`,
    quizId: quiz.id,
    quizTitle: quiz.title,
    subjectId: quiz.subjectId,
    score: grade.score,
    totalQuestions: grade.totalQuestions,
    accuracy: grade.accuracy,
    xpEarned: grade.xpEarned,
    tokensEarned: grade.tokensEarned,
    timeTakenSeconds: spec.timeTakenSeconds,
    answers: preciseAnswers,
    completedAt: completedAt.toISOString(),
  };
}

/** Build the full initial gamification state, fully populated. */
export function buildSeedState(): GamificationState {
  const attempts: QuizAttempt[] = [];
  const daily: Record<string, DailyActivity> = {};
  const completedQuizIds = new Set<string>();
  let seedXp = 0;
  let seedTokens = 0;

  SEED_SPECS.forEach((spec, index) => {
    const attempt = buildSeedAttempt(spec, index);
    if (!attempt) return;

    attempts.push(attempt);
    completedQuizIds.add(attempt.quizId);
    seedXp += attempt.xpEarned;
    seedTokens += attempt.tokensEarned;

    const dayKey = dayKeyOffset(spec.daysAgo);
    const entry = daily[dayKey] ?? { date: dayKey, quizzes: 0, xpEarned: 0, minutes: 0, lessons: 0 };
    entry.quizzes += 1;
    entry.xpEarned += attempt.xpEarned;
    entry.minutes += attemptMinutes(spec.timeTakenSeconds);
    daily[dayKey] = entry;
  });

  attempts.sort((a, b) => (a.completedAt < b.completedAt ? 1 : -1));

  return {
    xp: CARRY_OVER_XP + seedXp,
    tokens: STARTING_TOKENS + seedTokens,
    tokensSpent: 0,
    tokensEarnedFromQuizzes: seedTokens,
    streak: 14,
    bestStreak: 21,
    lastActiveDate: dayKeyOffset(0),
    attempts,
    daily,
    completedQuizIds: Array.from(completedQuizIds),
    unlockedBadgeIds: [],
  };
}
