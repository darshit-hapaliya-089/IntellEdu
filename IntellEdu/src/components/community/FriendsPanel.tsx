import React from 'react';
import { UserPlus, Users } from 'lucide-react';
import { Friend } from '../../types/community';
import { usePerformanceMode } from '../../context/PerformanceModeContext';
import { cx } from '../../utils/cx';
import FriendCard from './FriendCard';

export interface FriendsPanelProps {
  friends: Friend[];
  onToggle: (friendId: string) => void;
}

export const FriendsPanel: React.FC<FriendsPanelProps> = ({ friends, onToggle }) => {
  const { highGraphics } = usePerformanceMode();
  const myFriends = friends.filter((friend) => friend.added);
  const suggestions = friends.filter((friend) => !friend.added);
  const onlineCount = myFriends.filter((friend) => friend.status !== 'offline').length;

  return (
    <div className="space-y-4">
      <div
        className={cx(
          'p-4 sm:p-5 rounded-2xl sm:rounded-3xl',
          highGraphics ? 'bg-white/90 border border-slate-200/80 shadow-sm' : 'bg-white border border-slate-200'
        )}
      >
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-extrabold text-slate-900">My Friends</h3>
          </div>
          <span className="text-[11px] font-bold text-emerald-600">{onlineCount} online</span>
        </div>

        {myFriends.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No friends added yet — add someone below!</p>
        ) : (
          <div className="space-y-2.5">
            {myFriends.map((friend) => (
              <FriendCard key={friend.id} friend={friend} onToggle={onToggle} />
            ))}
          </div>
        )}
      </div>

      <div
        className={cx(
          'p-4 sm:p-5 rounded-2xl sm:rounded-3xl',
          highGraphics ? 'bg-white/90 border border-slate-200/80 shadow-sm' : 'bg-white border border-slate-200'
        )}
      >
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-4 h-4 text-violet-600" />
          <h3 className="text-sm font-extrabold text-slate-900">Suggested Friends</h3>
        </div>
        {suggestions.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">You've added everyone in your circle!</p>
        ) : (
          <div className="space-y-2.5">
            {suggestions.map((friend) => (
              <FriendCard key={friend.id} friend={friend} onToggle={onToggle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FriendsPanel;
