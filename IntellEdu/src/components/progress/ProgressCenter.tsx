import React from 'react';
import { Award, BookOpenCheck, Clock4, Flame, Target, TrendingUp } from 'lucide-react';
import { useGamification } from '../../context/GamificationContext';
import { usePerformanceMode } from '../../context/PerformanceModeContext';
import { cx } from '../../utils/cx';
import { formatNumber } from '../../utils/economy';
import DailyActivityChart from './DailyActivityChart';
import WeeklyTrendChart from './WeeklyTrendChart';
import SubjectMasteryList from './SubjectMasteryList';
import BadgeGrid from './BadgeGrid';
import QuizHistoryPanel from '../quiz/QuizHistoryPanel';

export const ProgressCenter: React.FC = () => {
  const { highGraphics } = usePerformanceMode();
  const {
    xp,
    levelInfo,
    overallAccuracy,
    totalStudyMinutes,
    streak,
    bestStreak,
    attempts,
    completedQuizIds,
    daily,
    weeklyPoints,
    subjectStats,
    badges,
  } = useGamification();

  const tiles = [
    { id: 'p1', label: 'Total XP', value: formatNumber(xp), icon: Award, tone: 'bg-violet-50 text-violet-600' },
    { id: 'p2', label: 'Quizzes Cleared', value: completedQuizIds.length, icon: BookOpenCheck, tone: 'bg-indigo-50 text-indigo-600' },
    { id: 'p3', label: 'Average Accuracy', value: `${overallAccuracy}%`, icon: Target, tone: 'bg-emerald-50 text-emerald-600' },
    { id: 'p4', label: 'Study Minutes', value: totalStudyMinutes, icon: Clock4, tone: 'bg-sky-50 text-sky-600' },
    { id: 'p5', label: 'Current Streak', value: `${streak}d`, icon: Flame, tone: 'bg-amber-50 text-amber-600' },
    { id: 'p6', label: 'Best Streak', value: `${bestStreak}d`, icon: TrendingUp, tone: 'bg-rose-50 text-rose-600' },
  ];

  return (
    <div className="space-y-5 sm:space-y-6 w-full">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">Progress & Stats</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Track your accuracy, daily output and skill mastery over time.
        </p>
      </div>

      {/* Level hero */}
      <div
        className={cx(
          'p-5 sm:p-6 rounded-2xl sm:rounded-3xl text-white relative overflow-hidden',
          highGraphics
            ? 'bg-linear-to-r from-indigo-600 via-indigo-700 to-violet-700 shadow-xl shadow-indigo-500/20'
            : 'bg-indigo-900'
        )}
      >
        {highGraphics && <div className="absolute -right-10 -bottom-10 w-52 h-52 bg-violet-400/20 rounded-full blur-2xl pointer-events-none" />}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0">
            <Award className="w-7 h-7 text-amber-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-wider text-amber-300">Level {levelInfo.level}</p>
            <h3 className="text-lg sm:text-xl font-black">{levelInfo.title}</h3>
            <div className="mt-2.5 space-y-1">
              <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all duration-700" style={{ width: `${levelInfo.progressPercent}%` }} />
              </div>
              <p className="text-[11px] text-indigo-100/90">
                {formatNumber(xp - levelInfo.currentLevelXp)} / {formatNumber(levelInfo.nextLevelXp - levelInfo.currentLevelXp)} XP to Level {levelInfo.level + 1}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <div
              key={tile.id}
              className={cx(
                'p-3.5 rounded-2xl flex items-center gap-3',
                highGraphics ? 'bg-white/90 border border-slate-100 shadow-sm' : 'bg-white border border-slate-200'
              )}
            >
              <div className={cx('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', tile.tone)}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-black text-slate-900 leading-none truncate">{tile.value}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-1 truncate">{tile.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DailyActivityChart daily={daily} days={14} />
        <WeeklyTrendChart points={weeklyPoints} />
      </div>

      {/* Mastery + badges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SubjectMasteryList stats={subjectStats} />
        <BadgeGrid badges={badges} />
      </div>

      {/* Attempt history */}
      <QuizHistoryPanel attempts={attempts} limit={8} />
    </div>
  );
};

export default ProgressCenter;
