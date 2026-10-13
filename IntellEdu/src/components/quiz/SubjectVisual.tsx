import React from 'react';
import { cx } from '../../utils/cx';

export interface SubjectVisualProps {
  subject?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SUBJECT_THEMES: Record<
  string,
  {
    name: string;
    gradient: string;
    badgeBg: string;
    textColor: string;
    accentColor: string;
    darkGradient: string;
  }
> = {
  mathematics: {
    name: 'Mathematics',
    gradient: 'from-amber-400/20 via-orange-500/15 to-rose-500/10',
    darkGradient: 'from-amber-500 to-orange-600',
    badgeBg: 'bg-amber-50 border-amber-200 text-amber-700',
    textColor: 'text-amber-600',
    accentColor: '#f59e0b',
  },
  physics: {
    name: 'Physics',
    gradient: 'from-sky-400/20 via-indigo-500/15 to-blue-500/10',
    darkGradient: 'from-sky-500 to-indigo-600',
    badgeBg: 'bg-sky-50 border-sky-200 text-sky-700',
    textColor: 'text-sky-600',
    accentColor: '#0ea5e9',
  },
  chemistry: {
    name: 'Chemistry',
    gradient: 'from-emerald-400/20 via-teal-500/15 to-cyan-500/10',
    darkGradient: 'from-emerald-500 to-teal-600',
    badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    textColor: 'text-emerald-600',
    accentColor: '#10b981',
  },
  biology: {
    name: 'Biology',
    gradient: 'from-lime-400/20 via-emerald-500/15 to-green-600/10',
    darkGradient: 'from-lime-500 to-emerald-600',
    badgeBg: 'bg-lime-50 border-lime-200 text-lime-700',
    textColor: 'text-lime-600',
    accentColor: '#84cc16',
  },
  'computer science': {
    name: 'Computer Science',
    gradient: 'from-violet-400/20 via-purple-500/15 to-fuchsia-500/10',
    darkGradient: 'from-violet-600 to-purple-700',
    badgeBg: 'bg-violet-50 border-violet-200 text-violet-700',
    textColor: 'text-violet-600',
    accentColor: '#8b5cf6',
  },
  english: {
    name: 'English',
    gradient: 'from-rose-400/20 via-pink-500/15 to-red-500/10',
    darkGradient: 'from-rose-500 to-pink-600',
    badgeBg: 'bg-rose-50 border-rose-200 text-rose-700',
    textColor: 'text-rose-600',
    accentColor: '#f43f5e',
  },
  commerce: {
    name: 'Commerce',
    gradient: 'from-cyan-400/20 via-blue-500/15 to-indigo-500/10',
    darkGradient: 'from-cyan-600 to-blue-700',
    badgeBg: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    textColor: 'text-cyan-600',
    accentColor: '#06b6d4',
  },
  'general knowledge': {
    name: 'General Knowledge',
    gradient: 'from-indigo-400/20 via-violet-500/15 to-amber-400/10',
    darkGradient: 'from-indigo-600 to-violet-700',
    badgeBg: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    textColor: 'text-indigo-600',
    accentColor: '#6366f1',
  },
};

export function getSubjectTheme(subject?: string | null) {
  const norm = (subject || '').trim().toLowerCase();
  if (norm.includes('math')) return SUBJECT_THEMES.mathematics;
  if (norm.includes('physic')) return SUBJECT_THEMES.physics;
  if (norm.includes('chem')) return SUBJECT_THEMES.chemistry;
  if (norm.includes('bio')) return SUBJECT_THEMES.biology;
  if (norm.includes('comp') || norm.includes('code') || norm.includes('python')) return SUBJECT_THEMES['computer science'];
  if (norm.includes('eng')) return SUBJECT_THEMES.english;
  if (norm.includes('commerc') || norm.includes('account') || norm.includes('econ')) return SUBJECT_THEMES.commerce;
  if (norm.includes('gk') || norm.includes('general') || norm.includes('knowledge')) return SUBJECT_THEMES['general knowledge'];
  if (norm.includes('sci')) return SUBJECT_THEMES.physics;
  return SUBJECT_THEMES['general knowledge'];
}

export const SubjectVisual: React.FC<SubjectVisualProps> = ({
  subject,
  size = 'md',
  className,
}) => {
  const norm = (subject || '').trim().toLowerCase();
  const theme = getSubjectTheme(subject);

  // Dimension scaling
  const pixelSize = size === 'sm' ? 32 : size === 'lg' ? 96 : 64;

  const renderSubjectIllustration = () => {
    // 1. MATHEMATICS: geometric shapes, π symbol, graph curves
    if (norm.includes('math')) {
      return (
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="42" fill="url(#math-bg)" fillOpacity="0.25" />
          {/* Coordinate axes */}
          <line x1="20" y1="75" x2="80" y2="75" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="25" y1="20" x2="25" y2="80" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
          {/* Sine curve */}
          <path
            d="M 25 75 Q 40 30, 52 50 T 80 25"
            stroke="#ea580c"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
          {/* Pi symbol */}
          <path
            d="M 38 42 H 62 M 45 42 V 64 M 55 42 V 64 Q 55 67 58 67"
            stroke="#b45309"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <defs>
            <radialGradient id="math-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ea580c" stopOpacity="0.2" />
            </radialGradient>
          </defs>
        </svg>
      );
    }

    // 2. PHYSICS: atom with orbits and nucleus
    if (norm.includes('physic')) {
      return (
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-sm transition-transform duration-300 group-hover:rotate-12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="42" fill="url(#phys-bg)" fillOpacity="0.25" />
          {/* Orbits */}
          <ellipse cx="50" cy="50" rx="36" ry="14" transform="rotate(30 50 50)" stroke="#0ea5e9" strokeWidth="2.5" strokeDasharray="3 2" />
          <ellipse cx="50" cy="50" rx="36" ry="14" transform="rotate(-30 50 50)" stroke="#6366f1" strokeWidth="2.5" />
          <ellipse cx="50" cy="50" rx="36" ry="14" transform="rotate(90 50 50)" stroke="#38bdf8" strokeWidth="2" strokeOpacity="0.8" />
          {/* Nucleus */}
          <circle cx="50" cy="50" r="8" fill="#4f46e5" />
          <circle cx="48" cy="48" r="3" fill="#a5f3fc" />
          {/* Orbiting electrons */}
          <circle cx="78" cy="36" r="3.5" fill="#0284c7" />
          <circle cx="22" cy="64" r="3.5" fill="#6366f1" />
          <defs>
            <radialGradient id="phys-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.2" />
            </radialGradient>
          </defs>
        </svg>
      );
    }

    // 3. CHEMISTRY: laboratory flask with effervescent bubbles
    if (norm.includes('chem')) {
      return (
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-sm transition-transform duration-300 group-hover:-translate-y-1"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="42" fill="url(#chem-bg)" fillOpacity="0.25" />
          {/* Flask body */}
          <path
            d="M 44 24 H 56 V 42 L 74 72 A 6 6 0 0 1 69 81 H 31 A 6 6 0 0 1 26 72 L 44 42 Z"
            stroke="#059669"
            strokeWidth="3"
            strokeLinejoin="round"
            fill="#10b981"
            fillOpacity="0.15"
          />
          {/* Liquid level */}
          <path
            d="M 33 66 Q 42 62, 50 66 T 67 66 L 70 73 A 4 4 0 0 1 66 78 H 34 A 4 4 0 0 1 30 73 Z"
            fill="#10b981"
            fillOpacity="0.75"
          />
          {/* Bubbles */}
          <circle cx="45" cy="55" r="3" fill="#6ee7b7" />
          <circle cx="55" cy="48" r="2" fill="#6ee7b7" />
          <circle cx="50" cy="38" r="2.5" fill="#a7f3d0" />
          <defs>
            <radialGradient id="chem-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.2" />
            </radialGradient>
          </defs>
        </svg>
      );
    }

    // 4. BIOLOGY: DNA double-helix and organic leaf
    if (norm.includes('bio')) {
      return (
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="42" fill="url(#bio-bg)" fillOpacity="0.25" />
          {/* Organic Leaf shape */}
          <path
            d="M 30 70 C 30 40, 50 25, 75 25 C 75 55, 55 75, 30 70 Z"
            fill="#84cc16"
            fillOpacity="0.3"
            stroke="#65a30d"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M 30 70 Q 50 50, 75 25" stroke="#4d7c0f" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 45 56 Q 52 50, 58 54" stroke="#4d7c0f" strokeWidth="2" strokeLinecap="round" />
          <path d="M 38 63 Q 44 60, 48 64" stroke="#4d7c0f" strokeWidth="2" strokeLinecap="round" />
          {/* DNA helix nodes */}
          <circle cx="28" cy="36" r="4" fill="#15803d" />
          <circle cx="40" cy="28" r="3.5" fill="#84cc16" />
          <line x1="28" y1="36" x2="40" y2="28" stroke="#16a34a" strokeWidth="2" />
          <defs>
            <radialGradient id="bio-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#84cc16" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#15803d" stopOpacity="0.2" />
            </radialGradient>
          </defs>
        </svg>
      );
    }

    // 5. COMPUTER SCIENCE: code brackets & microchip circuits
    if (norm.includes('comp') || norm.includes('code') || norm.includes('python')) {
      return (
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="42" fill="url(#cs-bg)" fillOpacity="0.25" />
          {/* Terminal / Code brackets */}
          <rect x="22" y="24" width="56" height="52" rx="10" stroke="#7c3aed" strokeWidth="3" fill="#6d28d9" fillOpacity="0.15" />
          {/* Code < / > */}
          <path d="M 40 42 L 32 50 L 40 58" stroke="#a78bfa" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 60 42 L 68 50 L 60 58" stroke="#a78bfa" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="53" y1="40" x2="47" y2="60" stroke="#c4b5fd" strokeWidth="3" strokeLinecap="round" />
          <defs>
            <radialGradient id="cs-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#4c1d95" stopOpacity="0.2" />
            </radialGradient>
          </defs>
        </svg>
      );
    }

    // 6. ENGLISH: open literary book with golden quill
    if (norm.includes('eng')) {
      return (
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="42" fill="url(#eng-bg)" fillOpacity="0.25" />
          {/* Open Book */}
          <path
            d="M 50 66 C 42 62, 30 62, 22 65 V 36 C 30 33, 42 33, 50 37 C 58 33, 70 33, 78 36 V 65 C 70 62, 58 62, 50 66 Z"
            fill="#f43f5e"
            fillOpacity="0.2"
            stroke="#e11d48"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <line x1="50" y1="37" x2="50" y2="66" stroke="#be123c" strokeWidth="2.5" />
          {/* Letter 'Aa' */}
          <text x="50" y="80" textAnchor="middle" fontSize="14" fontWeight="900" fill="#be123c" fontFamily="serif">
            Aa
          </text>
          <defs>
            <radialGradient id="eng-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fb7185" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#be123c" stopOpacity="0.2" />
            </radialGradient>
          </defs>
        </svg>
      );
    }

    // 7. COMMERCE: bar chart with currency / coin
    if (norm.includes('commerc') || norm.includes('account')) {
      return (
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-sm transition-transform duration-300 group-hover:-translate-y-1"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="42" fill="url(#comm-bg)" fillOpacity="0.25" />
          {/* Growth Bars */}
          <rect x="25" y="55" width="10" height="22" rx="3" fill="#06b6d4" />
          <rect x="42" y="42" width="10" height="35" rx="3" fill="#0891b2" />
          <rect x="59" y="30" width="10" height="47" rx="3" fill="#0e7490" />
          {/* Upward trend line */}
          <path d="M 24 54 L 45 38 L 65 24 L 78 20" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
          <polygon points="78,16 83,23 76,26" fill="#f59e0b" />
          <defs>
            <radialGradient id="comm-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0e7490" stopOpacity="0.2" />
            </radialGradient>
          </defs>
        </svg>
      );
    }

    // 8. GENERAL KNOWLEDGE / FALLBACK: world globe with orbital ring
    return (
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-sm transition-transform duration-300 group-hover:rotate-6"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="42" fill="url(#gk-bg)" fillOpacity="0.25" />
        {/* Globe */}
        <circle cx="50" cy="50" r="28" stroke="#4f46e5" strokeWidth="3" fill="#6366f1" fillOpacity="0.2" />
        <ellipse cx="50" cy="50" rx="14" ry="28" stroke="#4f46e5" strokeWidth="2" />
        <line x1="22" y1="50" x2="78" y2="50" stroke="#4f46e5" strokeWidth="2" />
        {/* Stars */}
        <circle cx="28" cy="24" r="2" fill="#f59e0b" />
        <circle cx="76" cy="30" r="2.5" fill="#f59e0b" />
        <circle cx="72" cy="74" r="2" fill="#f59e0b" />
        <defs>
          <radialGradient id="gk-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3730a3" stopOpacity="0.2" />
          </radialGradient>
        </defs>
      </svg>
    );
  };

  return (
    <div
      style={{ width: pixelSize, height: pixelSize }}
      className={cx(
        'relative shrink-0 flex items-center justify-center select-none group',
        className
      )}
      aria-label={`${theme.name} Illustration`}
    >
      {renderSubjectIllustration()}
    </div>
  );
};

export default SubjectVisual;
