import React, { useMemo } from 'react';
import { Crown, Flame, Globe2 } from 'lucide-react';
import { WorldMember } from '../../types/community';
import { usePerformanceMode } from '../../context/PerformanceModeContext';
import { cx } from '../../utils/cx';
import { formatNumber } from '../../utils/economy';

interface RankedEntry {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  points: number;
  streak: number;
  avatar: string;
  isYou: boolean;
}

export interface WorldLeaderboardProps {
  members: WorldMember[];
  userXp: number;
  userName: string;
  userAvatar: string;
}

export const WorldLeaderboard: React.FC<WorldLeaderboardProps> = ({
  members,
  userXp,
  userName,
  userAvatar,
}) => {
  const { highGraphics } = usePerformanceMode();

  const ranked = useMemo<RankedEntry[]>(() => {
    const base: RankedEntry[] = members.map((member) => ({
      id: member.id,
      name: member.name,
      country: member.country,
      countryCode: member.countryCode,
      points: member.points,
      streak: member.streak,
      avatar: member.avatar,
      isYou: false,
    }));

    const withYou: RankedEntry[] = [
      ...base,
      {
        id: 'you',
        name: `${userName} (You)`,
        country: 'India',
        countryCode: 'IN',
        points: userXp,
        streak: 0,
        avatar: userAvatar,
        isYou: true,
      },
    ];

    return withYou.sort((a, b) => b.points - a.points);
  }, [members, userXp, userName, userAvatar]);

  const podium = ranked.slice(0, 3);
  const rest = ranked.slice(3);
  const userRank = ranked.findIndex((entry) => entry.isYou) + 1;

  return (
    <div
      className={cx(
        'p-4 sm:p-5 rounded-2xl sm:rounded-3xl',
        highGraphics ? 'bg-white/90 border border-slate-200/80 shadow-sm' : 'bg-white border border-slate-200'
      )}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-extrabold text-slate-900">Worldwide Leaderboard</h3>
        </div>
        <span className="text-[11px] font-bold text-indigo-600">Your rank #{userRank}</span>
      </div>

      {/* Podium */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {podium.map((entry, index) => (
          <div
            key={entry.id}
            className={cx(
              'p-3 rounded-2xl text-center flex flex-col items-center gap-2',
              entry.isYou
                ? 'bg-indigo-50 border border-indigo-200'
                : index === 0
                  ? 'bg-amber-50 border border-amber-200'
                  : 'bg-slate-50 border border-slate-200'
            )}
          >
            <div className="relative">
              <img src={entry.avatar} alt={entry.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
              {index === 0 && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-amber-400 text-amber-900 flex items-center justify-center">
                  <Crown className="w-3 h-3" />
                </span>
              )}
            </div>
            <p className="text-[11px] font-extrabold text-slate-900 truncate w-full">{entry.name}</p>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/70 text-[9px] font-black text-slate-500">
              {entry.countryCode}
            </span>
            <p className="text-xs font-black text-indigo-600">{formatNumber(entry.points)} XP</p>
          </div>
        ))}
      </div>

      {/* Rest */}
      <div className="space-y-1.5">
        {rest.map((entry, index) => (
          <div
            key={entry.id}
            className={cx(
              'flex items-center gap-3 p-2.5 rounded-xl transition-colors',
              entry.isYou ? 'bg-indigo-50 border border-indigo-200' : 'bg-slate-50/80 hover:bg-slate-100'
            )}
          >
            <span className="w-6 text-center text-xs font-black text-slate-500 shrink-0">#{index + 4}</span>
            <img src={entry.avatar} alt={entry.name} className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className={cx('text-xs font-bold truncate', entry.isYou ? 'text-indigo-700' : 'text-slate-900')}>{entry.name}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                <span className="px-1.5 rounded bg-white/80 text-slate-500 font-black">{entry.countryCode}</span>
                <span className="truncate">{entry.country}</span>
                {entry.streak > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-amber-600">
                    <Flame className="w-3 h-3" />
                    {entry.streak}d
                  </span>
                )}
              </div>
            </div>
            <span className="text-xs font-black text-indigo-600 shrink-0">{formatNumber(entry.points)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorldLeaderboard;
