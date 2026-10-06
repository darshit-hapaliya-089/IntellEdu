import {
  Rocket,
  Compass,
  Target,
  Flame,
  CalendarCheck,
  Coins,
  Shapes,
  Crosshair,
  Sparkles,
} from 'lucide-react';

/** The raw numbers a badge can be unlocked against. */
export interface BadgeMetrics {
  totalQuizzes: number;
  perfectQuizzes: number;
  currentStreak: number;
  totalXp: number;
  subjectsTouched: number;
  averageAccuracy: number;
  tokensEarnedFromQuizzes: number;
}

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  requirement: string;
  metric: keyof BadgeMetrics;
  target: number;
  icon: typeof Rocket;
  accent: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'violet';
}

export interface BadgeStatus extends BadgeDefinition {
  unlocked: boolean;
  progress: number;
}

export const BADGES: BadgeDefinition[] = [
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Completed your very first quiz.',
    requirement: 'Complete 1 quiz',
    metric: 'totalQuizzes',
    target: 1,
    icon: Rocket,
    accent: 'indigo',
  },
  {
    id: 'quiz-explorer',
    name: 'Quiz Explorer',
    description: 'Worked through a wide range of quizzes.',
    requirement: 'Complete 10 quizzes',
    metric: 'totalQuizzes',
    target: 10,
    icon: Compass,
    accent: 'sky',
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Aced multiple quizzes with a flawless score.',
    requirement: '3 perfect scores',
    metric: 'perfectQuizzes',
    target: 3,
    icon: Target,
    accent: 'emerald',
  },
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: 'Kept a full week of daily learning going.',
    requirement: '7-day streak',
    metric: 'currentStreak',
    target: 7,
    icon: Flame,
    accent: 'amber',
  },
  {
    id: 'monthly-master',
    name: 'Monthly Master',
    description: 'A whole month without missing a day.',
    requirement: '30-day streak',
    metric: 'currentStreak',
    target: 30,
    icon: CalendarCheck,
    accent: 'rose',
  },
  {
    id: 'xp-collector',
    name: 'XP Collector',
    description: 'Banked a serious amount of XP.',
    requirement: 'Earn 1,000 XP',
    metric: 'totalXp',
    target: 1000,
    icon: Coins,
    accent: 'violet',
  },
  {
    id: 'all-rounder',
    name: 'All-Rounder',
    description: 'Attempted a quiz in every subject.',
    requirement: 'Quiz in 6 subjects',
    metric: 'subjectsTouched',
    target: 6,
    icon: Shapes,
    accent: 'indigo',
  },
  {
    id: 'sharp-shooter',
    name: 'Sharp Shooter',
    description: 'Maintained a high average accuracy.',
    requirement: '80% average accuracy',
    metric: 'averageAccuracy',
    target: 80,
    icon: Crosshair,
    accent: 'emerald',
  },
  {
    id: 'ai-explorer',
    name: 'AI Explorer',
    description: 'Earned tokens through quiz mastery.',
    requirement: 'Earn 15 tokens from quizzes',
    metric: 'tokensEarnedFromQuizzes',
    target: 15,
    icon: Sparkles,
    accent: 'sky',
  },
];

/** Resolve the live unlock state of every badge against fresh metrics. */
export function resolveBadges(metrics: BadgeMetrics): BadgeStatus[] {
  return BADGES.map((badge) => {
    const value = metrics[badge.metric] ?? 0;
    return {
      ...badge,
      unlocked: value >= badge.target,
      progress: Math.min(value, badge.target),
    };
  });
}

export const BADGE_COUNT = BADGES.length;
