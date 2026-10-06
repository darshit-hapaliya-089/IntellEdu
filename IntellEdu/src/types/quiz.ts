import { LucideIcon } from 'lucide-react';

/** Every subject that ships a quiz bank. */
export type SubjectId =
  | 'maths'
  | 'science'
  | 'social-science'
  | 'english'
  | 'computer'
  | 'gk';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type SubjectAccent = 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet';

export interface QuizSubject {
  id: SubjectId;
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  accent: SubjectAccent;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: Difficulty;
}

export interface Quiz {
  id: string;
  subjectId: SubjectId;
  title: string;
  description: string;
  grade: string;
  difficulty: Difficulty;
  timeLimitSeconds: number;
  baseXp: number;
  questions: QuizQuestion[];
}

/** A completed quiz sitting in the student's history. */
export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  subjectId: SubjectId;
  score: number;
  totalQuestions: number;
  accuracy: number;
  xpEarned: number;
  tokensEarned: number;
  timeTakenSeconds: number;
  answers: number[];
  completedAt: string;
}

/** Pure result of grading one quiz run, before it is committed to state. */
export interface QuizGrade {
  score: number;
  totalQuestions: number;
  accuracy: number;
  xpEarned: number;
  tokensEarned: number;
  isPerfect: boolean;
  review: QuizReviewRow[];
}

export interface QuizReviewRow {
  questionId: string;
  question: string;
  options: string[];
  yourIndex: number;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
}
