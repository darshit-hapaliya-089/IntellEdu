import { SubjectAccent } from '../types/quiz';

/** Tailwind class bundles per subject accent, kept static so JIT can see them. */
export interface AccentStyle {
  iconBg: string;
  solid: string;
  soft: string;
  bar: string;
  text: string;
  ring: string;
}

export const ACCENT_STYLES: Record<SubjectAccent, AccentStyle> = {
  indigo: {
    iconBg: 'bg-indigo-50 text-indigo-600',
    solid: 'bg-indigo-600 text-white',
    soft: 'bg-indigo-100 text-indigo-700',
    bar: 'bg-indigo-500',
    text: 'text-indigo-600',
    ring: 'ring-indigo-500/30',
  },
  emerald: {
    iconBg: 'bg-emerald-50 text-emerald-600',
    solid: 'bg-emerald-600 text-white',
    soft: 'bg-emerald-100 text-emerald-700',
    bar: 'bg-emerald-500',
    text: 'text-emerald-600',
    ring: 'ring-emerald-500/30',
  },
  amber: {
    iconBg: 'bg-amber-50 text-amber-600',
    solid: 'bg-amber-500 text-white',
    soft: 'bg-amber-100 text-amber-700',
    bar: 'bg-amber-500',
    text: 'text-amber-600',
    ring: 'ring-amber-500/30',
  },
  rose: {
    iconBg: 'bg-rose-50 text-rose-600',
    solid: 'bg-rose-600 text-white',
    soft: 'bg-rose-100 text-rose-700',
    bar: 'bg-rose-500',
    text: 'text-rose-600',
    ring: 'ring-rose-500/30',
  },
  sky: {
    iconBg: 'bg-sky-50 text-sky-600',
    solid: 'bg-sky-600 text-white',
    soft: 'bg-sky-100 text-sky-700',
    bar: 'bg-sky-500',
    text: 'text-sky-600',
    ring: 'ring-sky-500/30',
  },
  violet: {
    iconBg: 'bg-violet-50 text-violet-600',
    solid: 'bg-violet-600 text-white',
    soft: 'bg-violet-100 text-violet-700',
    bar: 'bg-violet-500',
    text: 'text-violet-600',
    ring: 'ring-violet-500/30',
  },
};

export function accentStyle(accent: SubjectAccent): AccentStyle {
  return ACCENT_STYLES[accent];
}
