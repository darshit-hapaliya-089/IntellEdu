import React, { useEffect, useRef, useState } from 'react';
import { Award, BookOpen, Flame, Target, Trophy, TrendingUp, Zap } from 'lucide-react';
import { progressApi, type ProgressOverview } from '../services/api';
import SubjectVisual from '../components/quiz/SubjectVisual';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatISTDate(dateString: string | Date) {
  try {
    const d = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return String(dateString);
  }
}

function getDayLabel(dateStr: string, idx: number, total: number): string {
  // Show label every ~7 days
  if (idx % 7 !== 0 && idx !== total - 1) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00+05:30');
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return dateStr.slice(5);
  }
}

// ─── Count-up hook ────────────────────────────────────────────────────────────

function useCountUp(target: number, duration = 900, skip = false): number {
  const [value, setValue] = useState(skip ? target : 0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (skip) {
      setValue(target);
      return;
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setValue(target);
      return;
    }

    let start: number | null = null;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      // ease-out
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, skip]);

  return value;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface HeroCardProps {
  label: string;
  value: number;
  display?: string;
  icon: React.ReactNode;
  gradient: string;
  sub?: string;
  ready: boolean;
}

const HeroCard: React.FC<HeroCardProps> = ({ label, value, display, icon, gradient, sub, ready }) => {
  const animated = useCountUp(value, 900, !ready);
  return (
    <div className={`relative overflow-hidden rounded-3xl border border-white/20 bg-linear-to-br ${gradient} p-5 text-white shadow-lg`}>
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-xl pointer-events-none" />
      <div className="flex items-start justify-between gap-2">
        <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-sm">{icon}</div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{label}</span>
      </div>
      <p className="mt-4 text-3xl font-extrabold tracking-tight">
        {display ?? animated.toLocaleString('en-IN')}
      </p>
      {sub && <p className="mt-0.5 text-xs font-semibold text-white/70">{sub}</p>}
    </div>
  );
};

interface RadialGaugeProps {
  value: number; // 0–100
  size?: number;
  strokeWidth?: number;
  label: string;
  color: string;
}

const RadialGauge: React.FC<RadialGaugeProps> = ({
  value,
  size = 120,
  strokeWidth = 10,
  label,
  color,
}) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (value / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circ - filled}`}
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="text-center -mt-16 mb-8">
        <p className="text-2xl font-extrabold text-slate-900">{value}%</p>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
      </div>
    </div>
  );
};

// Inline SVG mini XP area chart
interface XPChartProps {
  data: { date: string; xp: number }[];
}

const XPChart: React.FC<XPChartProps> = ({ data }) => {
  if (!data.length) return null;
  const W = 600;
  const H = 100;
  const maxXP = Math.max(...data.map((d) => d.xp), 1);
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - (d.xp / maxXP) * (H - 12) - 4;
    return `${x},${y}`;
  });
  const polyline = pts.join(' ');
  const areaPath = `M${pts[0]} L${pts.join(' L')} L${(data.length - 1) * (W / (data.length - 1))},${H} L0,${H} Z`;

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/50 p-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height: 80 }}>
        <defs>
          <linearGradient id="xp-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#xp-fill)" />
        <polyline points={polyline} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) =>
          d.xp > 0 ? (
            <circle
              key={d.date}
              cx={(i / (data.length - 1)) * W}
              cy={H - (d.xp / maxXP) * (H - 12) - 4}
              r="3.5"
              fill="#6366f1"
            />
          ) : null
        )}
      </svg>
      <div className="flex justify-between px-1 mt-1">
        {data.map((d, i) => {
          const label = getDayLabel(d.date, i, data.length);
          return (
            <span
              key={d.date}
              className="text-[9px] text-slate-400"
              style={{ visibility: label ? 'visible' : 'hidden' }}
            >
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const ProgressStats: React.FC = () => {
  const [overview, setOverview] = useState<ProgressOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    progressApi
      .getOverview()
      .then(({ overview: data }) => {
        if (active) setOverview(data);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Could not load progress.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const ready = !loading && overview !== null;

  // XP level system: every 500 XP = 1 level
  const xpPerLevel = 500;
  const level = Math.floor((overview?.totalXp ?? 0) / xpPerLevel) + 1;
  const xpProgress = ((overview?.totalXp ?? 0) % xpPerLevel) / xpPerLevel;

  return (
    <div className="space-y-8">
      {/* ── PAGE HEADER ──────────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 h-48 w-48 rounded-full bg-violet-500/15 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-300 mb-2">
            Your Learning Journey
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight">Progress &amp; Stats</h1>
          <p className="mt-2 max-w-lg text-sm text-slate-300">
            A holistic view of your academic growth — streaks, XP, quiz accuracy, and course milestones.
          </p>
        </div>
      </header>

      {/* ── ERROR ─────────────────────────────────────────────────────────────── */}
      {error && (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* ── SKELETON / HERO STAT CARDS ────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : overview ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <HeroCard
            label="Total XP"
            value={overview.totalXp}
            icon={<Zap className="h-5 w-5 text-white" />}
            gradient="from-amber-500 via-orange-500 to-rose-500"
            sub={`Level ${level}`}
            ready={ready}
          />
          <HeroCard
            label="Quizzes Taken"
            value={overview.quizzesTaken}
            icon={<Trophy className="h-5 w-5 text-white" />}
            gradient="from-indigo-600 via-violet-600 to-purple-600"
            ready={ready}
          />
          <HeroCard
            label="Avg Accuracy"
            value={overview.averageAccuracy}
            display={`${overview.averageAccuracy}%`}
            icon={<Target className="h-5 w-5 text-white" />}
            gradient="from-emerald-500 via-teal-500 to-cyan-600"
            ready={ready}
          />
          <HeroCard
            label="Courses Done"
            value={overview.coursesCompleted}
            display={`${overview.coursesCompleted}/${overview.coursesEnrolled}`}
            icon={<BookOpen className="h-5 w-5 text-white" />}
            gradient="from-sky-500 via-blue-600 to-indigo-700"
            sub="enrolled"
            ready={ready}
          />
          <HeroCard
            label="Current Streak"
            value={overview.currentStreak}
            display={`${overview.currentStreak} 🔥`}
            icon={<Flame className="h-5 w-5 text-white" />}
            gradient="from-rose-500 via-pink-500 to-fuchsia-500"
            sub={`Best: ${overview.longestStreak} days`}
            ready={ready}
          />
        </div>
      ) : null}

      {/* ── XP LEVEL PROGRESS BAR + ACCURACY GAUGE ────────────────────────────── */}
      {ready && overview && (
        <div className="grid gap-5 sm:grid-cols-2">
          {/* XP Level bar */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Award className="h-5 w-5 text-amber-500" />
              <h3 className="font-bold text-slate-900">XP Level Progress</h3>
            </div>
            <div className="flex items-end justify-between mb-2">
              <div>
                <span className="text-4xl font-extrabold text-slate-900">Level {level}</span>
                <span className="ml-2 text-sm text-slate-500">
                  ({overview.totalXp.toLocaleString('en-IN')} XP total)
                </span>
              </div>
              <span className="text-sm font-semibold text-amber-600">
                {Math.round(xpProgress * xpPerLevel)}/{xpPerLevel} to Level {level + 1}
              </span>
            </div>
            <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-amber-400 to-orange-500 transition-all duration-1000"
                style={{ width: `${xpProgress * 100}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-slate-500">
              {overview.isActiveToday ? (
                <span className="text-emerald-600 font-semibold">✓ Active today</span>
              ) : (
                <span className="text-rose-500 font-semibold">⚠ Stay active to keep your streak alive!</span>
              )}
            </p>
          </div>

          {/* Accuracy Gauge */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 mb-2 self-start">
              <Target className="h-5 w-5 text-emerald-500" />
              <h3 className="font-bold text-slate-900">Average Accuracy</h3>
            </div>
            <RadialGauge
              value={overview.averageAccuracy}
              size={140}
              strokeWidth={12}
              label="across all quizzes"
              color={overview.averageAccuracy >= 70 ? '#10b981' : overview.averageAccuracy >= 50 ? '#f59e0b' : '#ef4444'}
            />
          </div>
        </div>
      )}

      {/* ── 30-DAY ACTIVITY HEATMAP ───────────────────────────────────────────── */}
      {ready && overview && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="h-5 w-5 text-indigo-500" />
            <h3 className="text-lg font-bold text-slate-900">30-Day Activity Heatmap</h3>
            <span className="ml-auto text-xs text-slate-400">Asia/Kolkata</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {overview.heatmap.map((day) => (
              <div key={day.date} className="group relative">
                <div
                  className={`h-7 w-7 rounded-lg transition cursor-default ${
                    day.active
                      ? day.quizCount >= 3
                        ? 'bg-indigo-700 shadow-md'
                        : day.quizCount >= 1
                        ? 'bg-indigo-500'
                        : 'bg-indigo-300'
                      : 'bg-slate-100'
                  }`}
                />
                {/* Tooltip */}
                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center">
                  <div className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-[10px] font-medium text-white whitespace-nowrap shadow-xl">
                    <span className="font-bold">{day.date.slice(5)}</span>
                    {day.active ? (
                      <>
                        <br />
                        {day.quizCount} quiz{day.quizCount !== 1 ? 'zes' : ''} · +{day.xpEarned} XP
                      </>
                    ) : (
                      <> — inactive</>
                    )}
                  </div>
                  <div className="h-1.5 w-1.5 rotate-45 bg-slate-900 -mt-0.5" />
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
            <span>Less</span>
            {['bg-slate-100', 'bg-indigo-200', 'bg-indigo-400', 'bg-indigo-600', 'bg-indigo-800'].map((c) => (
              <span key={c} className={`h-4 w-4 rounded ${c}`} />
            ))}
            <span>More</span>
          </div>
        </div>
      )}

      {/* ── XP OVER TIME LINE CHART ────────────────────────────────────────────── */}
      {ready && overview && overview.xpByDay.some((d) => d.xp > 0) && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp className="h-5 w-5 text-violet-500" />
            <h3 className="text-lg font-bold text-slate-900">XP Earned — Last 30 Days</h3>
          </div>
          <XPChart data={overview.xpByDay} />
        </div>
      )}

      {/* ── ACCURACY BY SUBJECT BAR ───────────────────────────────────────────── */}
      {ready && overview && overview.accuracyBySubject.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2 mb-5">
            <Target className="h-5 w-5 text-sky-500" />
            <h3 className="text-lg font-bold text-slate-900">Accuracy by Subject</h3>
          </div>
          <div className="space-y-4">
            {[...overview.accuracyBySubject]
              .sort((a, b) => b.accuracy - a.accuracy)
              .map((s) => (
                <div key={s.subject} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <SubjectVisual subject={s.subject} size="sm" />
                      <span className="font-semibold text-slate-800 capitalize">{s.subject}</span>
                      <span className="text-xs text-slate-400">({s.quizCount} quiz{s.quizCount !== 1 ? 'zes' : ''})</span>
                    </div>
                    <span className={`font-bold ${s.accuracy >= 70 ? 'text-emerald-600' : s.accuracy >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {s.accuracy}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        s.accuracy >= 70
                          ? 'bg-linear-to-r from-emerald-400 to-teal-500'
                          : s.accuracy >= 50
                          ? 'bg-linear-to-r from-amber-400 to-orange-500'
                          : 'bg-linear-to-r from-rose-400 to-pink-500'
                      }`}
                      style={{ width: `${s.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── ENROLLED COURSES ─────────────────────────────────────────────────── */}
      {ready && overview && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2 mb-5">
            <BookOpen className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-bold text-slate-900">Enrolled Courses</h3>
          </div>

          {overview.enrolledCourses.length ? (
            <div className="space-y-4">
              {overview.enrolledCourses.map((course: any) => (
                <div key={course.id} className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{course.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{course.category} · Grade {course.grade}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold border ${
                        course.isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                      }`}
                    >
                      {course.isCompleted ? 'Completed ✓' : 'In Progress'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                      <span className="font-semibold text-indigo-600">{course.progressPercent}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          course.isCompleted
                            ? 'bg-linear-to-r from-emerald-400 to-teal-500'
                            : 'bg-linear-to-r from-indigo-500 to-violet-600'
                        }`}
                        style={{ width: `${course.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
              <p className="font-semibold text-slate-700">No courses enrolled yet</p>
              <p className="mt-1 text-xs">Head to My Courses to start your learning journey.</p>
            </div>
          )}
        </div>
      )}

      {/* ── RECENT QUIZ ATTEMPTS ─────────────────────────────────────────────── */}
      {ready && overview && overview.recentQuizActivity.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2 mb-5">
            <Trophy className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-bold text-slate-900">Recent Quiz Attempts</h3>
          </div>
          <div className="space-y-3">
            {overview.recentQuizActivity.map((attempt: any) => (
              <div
                key={attempt.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition hover:bg-white hover:border-slate-200"
              >
                <div className="flex items-center gap-3.5">
                  <SubjectVisual subject={attempt.quiz?.subject} size="sm" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{attempt.quiz?.title || 'Quiz'}</h4>
                    <p className="text-xs text-slate-500">
                      {attempt.quiz?.subject || 'General'} · {formatISTDate(attempt.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0">
                  <div className="w-28">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                      <span>{attempt.score}/{attempt.totalQuestions}</span>
                      <span>{attempt.accuracy}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-indigo-500 to-violet-600"
                        style={{ width: `${Math.min(100, attempt.accuracy)}%` }}
                      />
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 min-w-17 text-center">
                    +{attempt.xpEarned} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressStats;
