import React from 'react';
import { Flame, UserMinus, UserPlus } from 'lucide-react';
import { Friend } from '../../types/community';
import { usePerformanceMode } from '../../context/PerformanceModeContext';
import { cx } from '../../utils/cx';

export interface FriendCardProps {
  friend: Friend;
  onToggle: (friendId: string) => void;
}

const PRESENCE: Record<Friend['status'], { dot: string; label: string; text: string }> = {
  online: { dot: 'bg-emerald-500', label: 'Online', text: 'text-emerald-600' },
  studying: { dot: 'bg-amber-500', label: 'Studying', text: 'text-amber-600' },
  offline: { dot: 'bg-slate-300', label: 'Offline', text: 'text-slate-400' },
};

export const FriendCard: React.FC<FriendCardProps> = ({ friend, onToggle }) => {
  const { highGraphics } = usePerformanceMode();
  const presence = PRESENCE[friend.status];

  return (
    <div
      className={cx(
        'p-3.5 rounded-2xl flex items-center gap-3 transition-all',
        highGraphics ? 'bg-white/90 border border-slate-100 shadow-xs hover:shadow-sm' : 'bg-white border border-slate-200'
      )}
    >
      <div className="relative shrink-0">
        <img src={friend.avatar} alt={friend.name} className="w-11 h-11 rounded-full object-cover border border-slate-200" />
        <span className={cx('absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white', presence.dot)} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">{friend.name}</p>
        <div className="flex items-center gap-2 text-[10px] font-semibold mt-0.5 flex-wrap">
          <span className={presence.text}>{presence.label}</span>
          <span className="text-slate-300">·</span>
          <span className="inline-flex items-center gap-0.5 text-amber-600">
            <Flame className="w-3 h-3" />
            {friend.streak}d
          </span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-500 truncate">{friend.subjectFocus}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onToggle(friend.id)}
        aria-label={friend.added ? `Remove ${friend.name}` : `Add ${friend.name}`}
        className={cx(
          'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer active:scale-95 shrink-0',
          friend.added
            ? 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600'
            : highGraphics
              ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-sm'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
        )}
      >
        {friend.added ? <UserMinus className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
        <span className="hidden xs:inline">{friend.added ? 'Remove' : 'Add'}</span>
      </button>
    </div>
  );
};

export default FriendCard;
