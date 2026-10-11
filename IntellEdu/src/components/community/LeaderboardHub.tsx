import React, { useMemo, useState } from 'react';
import {
  Award,
  Crown,
  Flame,
  Globe2,
  MapPin,
  Medal,
  Plus,
  Search,
  Sparkles,
  Trophy,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { Friend, WorldMember } from '../../types/community';
import { INITIAL_FRIENDS, WORLD_MEMBERS } from '../../data/communityData';
import { useGamification } from '../../context/GamificationContext';
import { useAuth } from '../../context/useAuth';
import { usePerformanceMode } from '../../context/PerformanceModeContext';
import { cx } from '../../utils/cx';
import { formatNumber } from '../../utils/economy';

type LeaderboardTab = 'world' | 'friends' | 'nearby';

interface RankedWorldEntry {
  id: string;
  rank: number;
  name: string;
  country: string;
  countryCode: string;
  grade: string;
  points: number;
  streak: number;
  avatar: string;
  isYou: boolean;
}

export interface LeaderboardHubProps {
  onOpenQuizzes?: () => void;
}

export const LeaderboardHub: React.FC<LeaderboardHubProps> = ({ onOpenQuizzes }) => {
  const { highGraphics } = usePerformanceMode();
  const { user } = useAuth();
  const { xp, streak } = useGamification();

  const [activeTab, setActiveTab] = useState<LeaderboardTab>('world');
  const [friends, setFriends] = useState<Friend[]>(INITIAL_FRIENDS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [worldFilter, setWorldFilter] = useState<'all' | 'top10' | 'top50'>('all');
  const [feedback, setFeedback] = useState<string | null>(null);

  const userPoints = xp || user?.points || 2850;
  const userStreak = streak || user?.streak || 14;
  const userName = user?.name || 'Alex Johnson';
  const userAvatar =
    user?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

  const showNotification = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  };

  const handleToggleFriend = (friendId: string) => {
    setFriends((prev) =>
      prev.map((f) => {
        if (f.id === friendId) {
          const nextAdded = !f.added;
          showNotification(nextAdded ? `Added ${f.name} to your friends!` : `Removed ${f.name}`);
          return { ...f, added: nextAdded };
        }
        return f;
      })
    );
  };

  /** Ranked World List including the user (Top 100) */
  const rankedWorldList = useMemo<RankedWorldEntry[]>(() => {
    const list: RankedWorldEntry[] = WORLD_MEMBERS.map((m) => ({
      id: m.id,
      rank: m.rank,
      name: m.name,
      country: m.country,
      countryCode: m.countryCode,
      grade: m.grade,
      points: m.points,
      streak: m.streak,
      avatar: m.avatar,
      isYou: false,
    }));

    const withYou: RankedWorldEntry[] = [
      ...list,
      {
        id: 'you',
        rank: 0,
        name: `${userName} (You)`,
        country: 'India',
        countryCode: 'IN',
        grade: user?.grade || 'Class 10 Science',
        points: userPoints,
        streak: userStreak,
        avatar: userAvatar,
        isYou: true,
      },
    ];

    // Sort descending by points
    withYou.sort((a, b) => b.points - a.points);

    // Re-assign ranks 1..101
    return withYou.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }, [userName, userAvatar, userPoints, userStreak, user?.grade]);

  const userWorldRank = rankedWorldList.find((e) => e.isYou)?.rank || 1;

  /** Filtered World list */
  const filteredWorld = useMemo(() => {
    return rankedWorldList.filter((m) => {
      if (worldFilter === 'top10' && m.rank > 10 && !m.isYou) return false;
      if (worldFilter === 'top50' && m.rank > 50 && !m.isYou) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesCountry = m.country.toLowerCase().includes(q);
        if (!matchesName && !matchesCountry && !m.isYou) return false;
      }
      return true;
    });
  }, [rankedWorldList, worldFilter, searchQuery]);

  /** Ranked Friends List including the user */
  const friendsLeaderboard = useMemo(() => {
    const myCircle = friends.filter((f) => f.added);
    const list = myCircle.map((f) => ({
      id: f.id,
      name: f.name,
      avatar: f.avatar,
      grade: f.grade,
      points: f.points,
      streak: f.streak,
      status: f.status,
      subjectFocus: f.subjectFocus,
      isYou: false,
    }));

    const withYou = [
      ...list,
      {
        id: 'you',
        name: `${userName} (You)`,
        avatar: userAvatar,
        grade: user?.grade || 'Class 10 Science',
        points: userPoints,
        streak: userStreak,
        status: 'online' as const,
        subjectFocus: 'Full Curriculum',
        isYou: true,
      },
    ];

    withYou.sort((a, b) => b.points - a.points);
    return withYou;
  }, [friends, userName, userAvatar, userPoints, userStreak, user?.grade]);

  /** Nearby contacts list */
  const nearbyContacts = useMemo(() => {
    return friends.filter((f) => f.isNearby);
  }, [friends]);

  const podium = rankedWorldList.slice(0, 3);

  return (
    <div className="space-y-5 sm:space-y-6 w-full">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">Leaderboard & Friends</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Compare your scores & streaks with classmates, nearby friends, and the World's Top 100!
          </p>
        </div>

        {/* User Rank highlight chip */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {onOpenQuizzes && (
            <button
              type="button"
              onClick={onOpenQuizzes}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Earn XP in Quizzes</span>
            </button>
          )}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black shadow-xs">
            <Trophy className="w-3.5 h-3.5 text-indigo-600" />
            <span>World Rank #{userWorldRank}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-black shadow-xs">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            <span>{userStreak} Day Streak</span>
          </div>
        </div>
      </div>

      {/* Toast feedback */}
      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-fade-in shadow-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 max-w-lg">
        <button
          type="button"
          onClick={() => setActiveTab('world')}
          className={cx(
            'flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer',
            activeTab === 'world'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          )}
        >
          <Globe2 className="w-3.5 h-3.5" />
          <span>World Top 100</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('friends')}
          className={cx(
            'flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer',
            activeTab === 'friends'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          )}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Friends ({friends.filter((f) => f.added).length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('nearby')}
          className={cx(
            'flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer',
            activeTab === 'nearby'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          )}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Nearby Classmates</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: WORLD TOP 100 LEADERBOARD
      ────────────────────────────────────────────────────────────── */}
      {activeTab === 'world' && (
        <div className="space-y-4">
          {/* Top 3 Podium Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {podium.map((entry, index) => {
              const medals = [
                { title: '1st Place', icon: Crown, border: 'border-amber-300 bg-amber-50/70', medalBg: 'bg-amber-400 text-amber-950' },
                { title: '2nd Place', icon: Medal, border: 'border-slate-300 bg-slate-50', medalBg: 'bg-slate-300 text-slate-800' },
                { title: '3rd Place', icon: Award, border: 'border-amber-200 bg-amber-50/40', medalBg: 'bg-amber-600 text-white' },
              ];
              const config = medals[index];
              const Icon = config.icon;

              return (
                <div
                  key={entry.id}
                  className={cx(
                    'p-4 sm:p-5 rounded-2xl sm:rounded-3xl border text-center flex flex-col items-center justify-between gap-3 relative transition-all shadow-sm',
                    config.border,
                    entry.isYou && 'ring-2 ring-indigo-500 bg-indigo-50/60'
                  )}
                >
                  <span className={cx('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider', config.medalBg)}>
                    <Icon className="w-3 h-3" />
                    {config.title}
                  </span>

                  <div className="relative">
                    <img
                      src={entry.avatar}
                      alt={entry.name}
                      className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-md"
                    />
                    <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-md bg-white border border-slate-200 text-[10px] font-black text-slate-700 shadow-xs">
                      {entry.countryCode}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm sm:text-base font-black text-slate-900 truncate max-w-50">
                      {entry.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-semibold">{entry.country} · {entry.grade}</p>
                  </div>

                  <div className="flex items-center gap-3 pt-1 text-xs">
                    <span className="font-black text-indigo-600 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      {formatNumber(entry.points)} XP
                    </span>
                    <span className="font-bold text-amber-600 flex items-center gap-0.5">
                      <Flame className="w-3.5 h-3.5 fill-amber-400" />
                      {entry.streak}d
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Search & Filter Bar */}
          <div
            className={cx(
              'p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 border',
              highGraphics ? 'bg-white/90 border-slate-200 shadow-xs' : 'bg-white border-slate-200'
            )}
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Top 100 learners by name or country..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setWorldFilter('all')}
                className={cx(
                  'px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer',
                  worldFilter === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                Top 100
              </button>
              <button
                type="button"
                onClick={() => setWorldFilter('top50')}
                className={cx(
                  'px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer',
                  worldFilter === 'top50'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                Top 50
              </button>
              <button
                type="button"
                onClick={() => setWorldFilter('top10')}
                className={cx(
                  'px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer',
                  worldFilter === 'top10'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                Top 10
              </button>
            </div>
          </div>

          {/* Leaderboard List (Top 100) */}
          <div
            className={cx(
              'rounded-2xl sm:rounded-3xl overflow-hidden border',
              highGraphics ? 'bg-white/90 border-slate-200 shadow-sm' : 'bg-white border-slate-200'
            )}
          >
            {/* Header row */}
            <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-400">
              <span className="col-span-2 sm:col-span-1 text-center">Rank</span>
              <span className="col-span-6 sm:col-span-6">Learner</span>
              <span className="col-span-2 sm:col-span-2 text-center">Streak</span>
              <span className="col-span-2 sm:col-span-3 text-right">Score</span>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-100 max-h-150 overflow-y-auto">
              {filteredWorld.map((entry) => (
                <div
                  key={entry.id}
                  className={cx(
                    'grid grid-cols-12 gap-2 items-center px-4 py-3 transition-colors',
                    entry.isYou
                      ? 'bg-indigo-50/80 border-y border-indigo-200 font-bold'
                      : 'hover:bg-slate-50/60'
                  )}
                >
                  {/* Rank */}
                  <div className="col-span-2 sm:col-span-1 text-center">
                    <span
                      className={cx(
                        'inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black',
                        entry.rank === 1
                          ? 'bg-amber-400 text-amber-950'
                          : entry.rank === 2
                          ? 'bg-slate-300 text-slate-800'
                          : entry.rank === 3
                          ? 'bg-amber-600 text-white'
                          : 'text-slate-500'
                      )}
                    >
                      #{entry.rank}
                    </span>
                  </div>

                  {/* Learner Info */}
                  <div className="col-span-6 sm:col-span-6 flex items-center gap-3 min-w-0">
                    <img
                      src={entry.avatar}
                      alt={entry.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className={cx('text-xs sm:text-sm font-extrabold truncate', entry.isYou ? 'text-indigo-700' : 'text-slate-900')}>
                        {entry.name}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                        <span className="px-1.5 rounded bg-slate-100 text-slate-600 font-black">{entry.countryCode}</span>
                        <span className="truncate">{entry.country}</span>
                        <span className="text-slate-300">·</span>
                        <span className="truncate">{entry.grade}</span>
                      </div>
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="col-span-2 sm:col-span-2 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600">
                      <Flame className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{entry.streak}d</span>
                    </span>
                  </div>

                  {/* Score */}
                  <div className="col-span-2 sm:col-span-3 text-right">
                    <span className="text-xs sm:text-sm font-black text-indigo-600">
                      {formatNumber(entry.points)} XP
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: FRIENDS LEADERBOARD
      ────────────────────────────────────────────────────────────── */}
      {activeTab === 'friends' && (
        <div className="space-y-4">
          <div
            className={cx(
              'p-4 rounded-2xl sm:rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3',
              highGraphics ? 'bg-linear-to-r from-indigo-50 to-violet-50 border-indigo-100' : 'bg-white border-slate-200'
            )}
          >
            <div>
              <h3 className="text-sm font-black text-slate-900">Your Friends Circle Leaderboard</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                See how your study streak and quiz XP compare with your friends!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('nearby')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 cursor-pointer self-start sm:self-auto shadow-xs active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add More Friends</span>
            </button>
          </div>

          <div
            className={cx(
              'rounded-2xl sm:rounded-3xl overflow-hidden border',
              highGraphics ? 'bg-white/90 border-slate-200 shadow-sm' : 'bg-white border-slate-200'
            )}
          >
            <div className="divide-y divide-slate-100">
              {friendsLeaderboard.map((f, index) => (
                <div
                  key={f.id}
                  className={cx(
                    'p-3.5 sm:p-4 flex items-center gap-3 sm:gap-4 transition-colors',
                    f.isYou ? 'bg-indigo-50/70' : 'hover:bg-slate-50'
                  )}
                >
                  <span className="w-6 text-center text-xs font-black text-slate-400 shrink-0">
                    #{index + 1}
                  </span>

                  <div className="relative shrink-0">
                    <img
                      src={f.avatar}
                      alt={f.name}
                      className="w-11 h-11 rounded-full object-cover border border-slate-200"
                    />
                    <span
                      className={cx(
                        'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white',
                        f.status === 'online'
                          ? 'bg-emerald-500'
                          : f.status === 'studying'
                          ? 'bg-amber-500'
                          : 'bg-slate-300'
                      )}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className={cx('text-xs sm:text-sm font-extrabold truncate', f.isYou ? 'text-indigo-700' : 'text-slate-900')}>
                      {f.name}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold mt-0.5 flex-wrap">
                      <span>{f.grade}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-indigo-600 font-bold">{f.subjectFocus}</span>
                    </div>
                  </div>

                  {/* Streak & Score */}
                  <div className="text-right shrink-0">
                    <div className="text-xs sm:text-sm font-black text-indigo-600">
                      {formatNumber(f.points)} XP
                    </div>
                    <div className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600">
                      <Flame className="w-3 h-3 fill-amber-400" />
                      <span>{f.streak}d streak</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: NEARBY CLASSMATES & CONTACTS
      ────────────────────────────────────────────────────────────── */}
      {activeTab === 'nearby' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>Nearby Classmates & Local Study Circles</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Connect with students from your school, coaching, or local study clubs to study together and compete.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {nearbyContacts.map((contact) => (
              <div
                key={contact.id}
                className={cx(
                  'p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3',
                  highGraphics ? 'bg-white/90 border-slate-200 hover:shadow-md' : 'bg-white border-slate-200'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200"
                    />
                    <span
                      className={cx(
                        'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white',
                        contact.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'
                      )}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-extrabold text-slate-900 truncate">{contact.name}</h4>
                    <p className="text-[11px] font-bold text-indigo-600">{contact.grade}</p>
                    {contact.location && (
                      <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{contact.location}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-black text-indigo-600">{formatNumber(contact.points)} XP</span>
                    <span className="font-bold text-amber-600 flex items-center gap-0.5">
                      <Flame className="w-3 h-3 fill-amber-400" />
                      {contact.streak}d
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleFriend(contact.id)}
                    className={cx(
                      'inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95',
                      contact.added
                        ? 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                    )}
                  >
                    {contact.added ? <UserCheck className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{contact.added ? 'Friend' : 'Add Friend'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardHub;
