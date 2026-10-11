import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { friendsApi, leaderboardApi, type FriendAccount, type LeaderboardItem } from '../services/api';

type BoardScope = 'global' | 'weekly' | 'grade' | 'friends';

const LeaderBoard: React.FC = () => {
  const { user } = useAuth();
  const [scope, setScope] = useState<BoardScope>('global');
  const [leaders, setLeaders] = useState<LeaderboardItem[]>([]);
  const [loadedScope, setLoadedScope] = useState<BoardScope | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [friends, setFriends] = useState<FriendAccount[]>([]);
  const [suggestions, setSuggestions] = useState<FriendAccount[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [friendsError, setFriendsError] = useState<string | null>(null);
  const [friendsNotice, setFriendsNotice] = useState<string | null>(null);
  const [busyFriendId, setBusyFriendId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = scope === 'weekly'
      ? leaderboardApi.getWeekly()
      : scope === 'grade'
        ? user?.grade
          ? leaderboardApi.getByGrade(user.grade)
          : Promise.reject(new Error('Your grade is not available in your profile.'))
        : scope === 'friends'
          ? leaderboardApi.getFriends()
          : leaderboardApi.getGlobal();

    load.then(({ leaderboard }) => {
      if (active) {
        setLeaders(leaderboard);
        setError(null);
        setLoadedScope(scope);
      }
    }).catch((reason: unknown) => {
      if (active) {
        setError(reason instanceof Error ? reason.message : 'Could not load the leaderboard.');
        setLoadedScope(scope);
      }
    });
    return () => { active = false; };
  }, [scope, user?.grade, reloadKey]);
  const loading = loadedScope !== scope;

  useEffect(() => {
    let active = true;
    friendsApi.getAll()
      .then(({ friends: currentFriends, suggestions: candidates }) => {
        if (!active) return;
        setFriends(currentFriends);
        setSuggestions(candidates);
        setFriendsError(null);
      })
      .catch((reason: unknown) => {
        if (active) setFriendsError(reason instanceof Error ? reason.message : 'Could not load friends.');
      })
      .finally(() => { if (active) setFriendsLoading(false); });
    return () => { active = false; };
  }, []);

  const changeFriend = async (account: FriendAccount, isFriend: boolean) => {
    setBusyFriendId(String(account.id));
    setFriendsError(null);
    setFriendsNotice(null);
    try {
      const result = isFriend ? await friendsApi.remove(account.id) : await friendsApi.add(account.id);
      setFriendsNotice(result.message);
      const updated = await friendsApi.getAll();
      setFriends(updated.friends);
      setSuggestions(updated.suggestions);
    } catch (reason) {
      setFriendsError(reason instanceof Error ? reason.message : 'Could not update your friends.');
    } finally {
      setBusyFriendId(null);
    }
  };

  const scopes: Array<{ id: BoardScope; label: string }> = [
    { id: 'global', label: 'Worldwide' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'grade', label: 'My grade' },
    { id: 'friends', label: 'Friends' },
  ];

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">Leaderboard</h2>
          <p className="mt-1 text-sm text-slate-500">Worldwide rankings and friends XP standings from your account.</p>
        </div>
        <Link to="/dashboard/quizzes" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white">
          Earn XP in Quizzes
        </Link>
      </header>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4">
          {scopes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setScope(item.id)}
              aria-pressed={scope === item.id}
              className={`rounded-lg px-3 py-2 text-sm font-semibold ${scope === item.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {item.label}
            </button>
          ))}
          <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="ml-auto rounded-lg px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">
            Refresh
          </button>
        </div>
        {error && (
          <div className="p-4">
            <p role="alert" className="text-sm text-rose-700">{error}</p>
            <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="mt-2 text-sm font-semibold text-indigo-700">Try again</button>
          </div>
        )}
        {loading ? <p className="p-4 text-sm text-slate-500">Loading leaderboard…</p> : !error && leaders.length ? (
          <ol className="divide-y divide-slate-100">
            {leaders.map((leader) => {
              const isCurrentUser = String(leader.id) === user?.id;
              return (
                <li key={leader.id} className={`flex items-center gap-3 px-4 py-3 ${isCurrentUser ? 'bg-indigo-50' : ''}`}>
                  <span className="w-10 shrink-0 text-center text-sm font-black text-indigo-700">#{leader.rank}</span>
                  {leader.avatarUrl ? (
                    <img src={leader.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-500">{leader.name.slice(0, 1).toUpperCase()}</span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-800">{leader.name}{isCurrentUser ? ' (You)' : ''}</p>
                    {leader.grade && <p className="text-xs text-slate-500">{leader.grade}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold text-slate-800">{leader.points} XP</p>
                    <p className="text-xs text-slate-500">{leader.streak} day streak</p>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : !error && <p className="p-4 text-sm text-slate-500">No students appear in this ranking yet.</p>}
      </section>
      <section className="grid gap-4 xl:grid-cols-2">
        {[
          { title: 'My Friends', accounts: friends, isFriend: true },
          { title: 'Suggested Students', accounts: suggestions, isFriend: false },
        ].map(({ title, accounts, isFriend }) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
            <h3 className="font-bold text-slate-900">{title}</h3>
            {friendsLoading ? <p className="mt-3 text-sm text-slate-500">Loading students…</p> : accounts.length ? (
              <ul className="mt-3 divide-y divide-slate-100">
                {accounts.map((account) => (
                  <li key={account.id} className="flex items-center gap-3 py-3">
                    {account.avatarUrl ? (
                      <img src={account.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-500">{account.name.slice(0, 1).toUpperCase()}</span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-800">{account.name}</p>
                      <p className="text-xs text-slate-500">{account.grade} · {account.points} XP · {account.streak} day streak</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void changeFriend(account, isFriend)}
                      disabled={busyFriendId === String(account.id)}
                      className="rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
                    >
                      {busyFriendId === String(account.id) ? 'Saving…' : isFriend ? 'Remove' : 'Add'}
                    </button>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-3 text-sm text-slate-500">{isFriend ? 'You have not added any friends yet.' : 'There are no student suggestions right now.'}</p>}
          </div>
        ))}
      </section>
      {friendsNotice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{friendsNotice}</p>}
      {friendsError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{friendsError}</p>}
    </div>
  );
};

export default LeaderBoard;
