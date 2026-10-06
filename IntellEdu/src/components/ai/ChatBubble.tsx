import React from 'react';
import { Bot, User } from 'lucide-react';
import { usePerformanceMode } from '../../context/PerformanceModeContext';
import { cx } from '../../utils/cx';

export type ChatSender = 'user' | 'ai';

export interface ChatBubbleProps {
  sender: ChatSender;
  text: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ sender, text }) => {
  const { highGraphics } = usePerformanceMode();
  const isUser = sender === 'user';

  return (
    <div className={cx('flex items-end gap-2', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className={cx(
          'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mb-0.5',
          highGraphics ? 'bg-linear-to-br from-indigo-500 to-violet-600 text-white' : 'bg-indigo-600 text-white'
        )}>
          <Bot className="w-4 h-4" />
        </div>
      )}
      <div
        className={cx(
          'max-w-[85%] sm:max-w-md p-3 sm:p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed font-medium whitespace-pre-wrap',
          isUser
            ? 'bg-indigo-600 text-white rounded-br-none shadow-xs'
            : highGraphics
              ? 'bg-white text-slate-800 border border-slate-200 shadow-xs rounded-bl-none'
              : 'bg-white text-slate-800 border border-slate-300 rounded-bl-none'
        )}
      >
        {text}
      </div>
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shri  nk-0 mb-0.5">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};

export default ChatBubble;
