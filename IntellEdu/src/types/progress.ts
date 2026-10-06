import { SubjectId } from './quiz';

/** Per-day learning telemetry used by the Progress analytics tab. */
export interface DailyActivity {
  /** ISO date key `YYYY-MM-DD`. */
  date: string;
  quizzes: number;
  xpEarned: number;
  minutes: number;
  lessons: number;
}

/** Aggregated mastery for one subject. */
export interface SubjectStat {
  subjectId: SubjectId;
  attempts: number;
  accuracy: number;
  xpEarned: number;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  requirement: string;
}

export interface BadgeStatus extends BadgeDefinition {
  unlocked: boolean;
  progress: number;
  target: number;
}

export interface WeeklyPoint {
  label: string;
  xp: number;
}
