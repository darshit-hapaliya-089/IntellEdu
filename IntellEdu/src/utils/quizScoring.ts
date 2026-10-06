import { Quiz, QuizGrade, QuizReviewRow } from '../types/quiz';
import {
  FIRST_CLEAR_TOKENS,
  PERFECT_BONUS_XP,
  REPEAT_CLEAR_TOKENS,
} from './economy';

/**
 * Grades a finished quiz run. Pure function: it never mutates state or reads
 * time-of-day, so the same inputs always produce the same grade.
 *
 * XP scales with accuracy off the quiz's `baseXp`, with a flat bonus for a
 * flawless run. Token rewards depend on whether this quiz was cleared before.
 */
export function gradeQuiz(
  quiz: Quiz,
  answers: number[],
  timeTakenSeconds: number,
  isFirstClear: boolean
): QuizGrade {
  const totalQuestions = quiz.questions.length;

  const review: QuizReviewRow[] = quiz.questions.map((question, index) => {
    const yourIndex = typeof answers[index] === 'number' ? answers[index] : -1;
    return {
      questionId: question.id,
      question: question.question,
      options: question.options,
      yourIndex,
      correctIndex: question.correctIndex,
      isCorrect: yourIndex === question.correctIndex,
      explanation: question.explanation,
    };
  });

  const score = review.filter((row) => row.isCorrect).length;
  const accuracy = totalQuestions === 0 ? 0 : Math.round((score / totalQuestions) * 100);
  const isPerfect = totalQuestions > 0 && score === totalQuestions;

  const scaledXp = Math.round((quiz.baseXp * accuracy) / 100);
  const xpEarned = scaledXp + (isPerfect ? PERFECT_BONUS_XP : 0);

  // Require at least a passable run (~50%) to earn tokens; a floor sweep gifts none.
  const passed = accuracy >= 50;
  const tokensEarned = passed
    ? isFirstClear
      ? FIRST_CLEAR_TOKENS[quiz.difficulty]
      : REPEAT_CLEAR_TOKENS
    : 0;

  return {
    score,
    totalQuestions,
    accuracy,
    xpEarned,
    tokensEarned,
    isPerfect,
    review: review.map((row) => ({ ...row, timeTakenSeconds } as QuizReviewRow)),
  };
}

/** A short encouraging headline for a finished run. */
export function gradeHeadline(accuracy: number): string {
  if (accuracy === 100) return 'Flawless victory!';
  if (accuracy >= 80) return 'Excellent work!';
  if (accuracy >= 60) return 'Nicely done!';
  if (accuracy >= 40) return 'Good effort — keep going!';
  return 'Every attempt builds mastery.';
}

/** Study minutes contributed to the daily chart by a run (rounded up, min 1). */
export function attemptMinutes(timeTakenSeconds: number): number {
  return Math.max(1, Math.round(timeTakenSeconds / 60));
}
