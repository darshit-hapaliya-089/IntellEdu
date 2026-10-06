import { Difficulty } from '../types/quiz';

/**
 * The single source of truth for the XP ⇄ AI-token economy and levelling.
 * Quiz XP is the currency: it both ranks you on the leaderboard and can be
 * converted into AI Tutor tokens for the chatbot.
 */
export const XP_PER_TOKEN = 10;

/** Tokens a brand-new student starts with, so the AI Tutor is usable instantly. */
export const STARTING_TOKENS = 6;

/** Tokens handed out the first time each quiz is cleared, by difficulty. */
export const FIRST_CLEAR_TOKENS: Record<Difficulty, number> = {
  easy: 2,
  medium: 3,
  hard: 5,
};

/** Tokens handed out for repeat clears of an already-completed quiz. */
export const REPEAT_CLEAR_TOKENS = 1;

/** Tokens the AI Tutor charges per answered question. */
export const TOKEN_COST_PER_MESSAGE = 1;

/** XP awarded for a 100%-accuracy run, on top of the accuracy-scaled base. */
export const PERFECT_BONUS_XP = 25;

export interface LevelInfo {
  level: number;
  title: string;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
}

const LEVEL_TITLES = [
  'Curious Mind',
  'Rising Learner',
  'Focus Apprentice',
  'Knowledge Seeker',
  'Sharp Thinker',
  'Problem Solver',
  'Concept Master',
  'Scholar',
  'High Achiever',
  'Grandmaster',
];

/** XP required to *complete* a given level (level 1 starts at 0 XP). */
function xpForLevel(level: number): number {
  return Math.round(150 * (level - 1) ** 1.35);
}

/** Maps total XP onto a level, its title, and progress toward the next level. */
export function getLevelInfo(xp: number): LevelInfo {
  let level = 1;
  while (xpForLevel(level + 1) <= xp && level < 60) {
    level += 1;
  }

  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const span = Math.max(1, nextLevelXp - currentLevelXp);
  const progressPercent = Math.min(100, Math.round(((xp - currentLevelXp) / span) * 100));

  return {
    level,
    title: LEVEL_TITLES[Math.min(LEVEL_TITLES.length - 1, level - 1)],
    currentLevelXp,
    nextLevelXp,
    progressPercent,
  };
}

/** How many whole tokens a given XP amount can buy. */
export function xpToTokens(xpAmount: number): number {
  return Math.floor(Math.max(0, xpAmount) / XP_PER_TOKEN);
}

/** The XP cost of buying `tokenCount` tokens. */
export function tokensToXp(tokenCount: number): number {
  return Math.max(0, tokenCount) * XP_PER_TOKEN;
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-IN');
}

/** `1,240` → `1.2k` for tight UI spots. */
export function compactNumber(value: number): string {
  if (value < 1000) return String(value);
  if (value < 100000) return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return `${(value / 100000).toFixed(1).replace(/\.0$/, '')}L`;
}
