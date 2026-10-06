import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Brain, Coins, Send, Sparkles, Trophy } from 'lucide-react';
import { ChatSender } from './ChatBubble';
import ChatBubble from './ChatBubble';
import TokenWalletCard from '../gamification/TokenWalletCard';
import { useGamification } from '../../context/GamificationContext';
import { usePerformanceMode } from '../../context/PerformanceModeContext';
import { cx } from '../../utils/cx';
import { TOKEN_COST_PER_MESSAGE } from '../../utils/economy';
import { generateTutorReply } from '../../utils/tutorResponses';

interface TutorMessage {
  id: string;
  sender: ChatSender;
  text: string;
}

export interface AiTutorPanelProps {
  onOpenQuizzes: () => void;
}

const GREETING =
  "Hi! I'm your IntellEdu AI Tutor. Ask me any doubt in Maths, Science, Social Science, English or Coding.\n\nEach answer costs 1 AI token — clear quizzes to earn more XP and buy tokens.";

export const AiTutorPanel: React.FC<AiTutorPanelProps> = ({ onOpenQuizzes }) => {
  const { highGraphics } = usePerformanceMode();
  const { tokens, spendTokens, tokensSpent } = useGamification();

  const [messages, setMessages] = useState<TutorMessage[]>([
    { id: 'greet', sender: 'ai', text: GREETING },
  ]);
  const [input, setInput] = useState<string>('');
  const [thinking, setThinking] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const outOfTokens = tokens < TOKEN_COST_PER_MESSAGE;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || thinking) return;
    if (!spendTokens(TOKEN_COST_PER_MESSAGE)) return;

    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, sender: 'user', text: question }]);
    setInput('');
    setThinking(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, sender: 'ai', text: generateTutorReply(question) },
      ]);
      setThinking(false);
    }, 600);
  };

  return (
    <div className="space-y-4 sm:space-y-5 w-full">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">AI Doubt Solver</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          24/7 instant help across every subject — powered by your quiz XP.
        </p>
      </div>

      <div
        className={cx(
          'rounded-2xl sm:rounded-3xl overflow-hidden',
          highGraphics
            ? 'bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-xl shadow-slate-200/50'
            : 'bg-white border border-slate-200'
        )}
      >
        <div className={cx('flex items-center justify-between gap-3 p-4 border-b border-slate-100', highGraphics && 'bg-linear-to-r from-indigo-50/60 to-violet-50/40')}>
          <div className="flex items-center gap-3 min-w-0">
            <div className={cx(
              'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-white',
              highGraphics ? 'bg-linear-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/25' : 'bg-indigo-600'
            )}>
              <Brain className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-slate-900 leading-tight truncate">IntellEdu AI Tutor</p>
              <p className="text-[11px] text-slate-500">Online · {TOKEN_COST_PER_MESSAGE} token per answer</p>
            </div>
          </div>
          <span className={cx(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black shrink-0',
            outOfTokens ? 'bg-rose-100 text-rose-700' : 'bg-sky-100 text-sky-700'
          )}>
            <Coins className="w-3.5 h-3.5" />
            {tokens}
          </span>
        </div>

        <div ref={scrollRef} className="h-[46vh] sm:h-80 overflow-y-auto p-3 sm:p-4 space-y-3 bg-slate-50/60">
          {messages.map((message) => (
            <ChatBubble key={message.id} sender={message.sender} text={message.text} />
          ))}
          {thinking && (
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 pl-9">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              AI Tutor is thinking…
            </div>
          )}
        </div>

        {outOfTokens && (
          <div className="px-4 py-3 bg-amber-50 border-t border-amber-200 flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-[11px] font-semibold text-amber-800 flex-1 min-w-0">
              You're out of AI tokens. Clear a quiz or convert XP below to keep asking.
            </p>
            <button
              type="button"
              onClick={onOpenQuizzes}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-[11px] font-black hover:bg-amber-600 transition-colors cursor-pointer shrink-0"
            >
              <Trophy className="w-3.5 h-3.5" />
              Earn now
            </button>
          </div>
        )}

        <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-slate-100 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={outOfTokens}
            placeholder={outOfTokens ? 'Earn tokens to continue…' : "Type your doubt (e.g. Explain Newton's Law)…"}
            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 min-w-0 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={outOfTokens || !input.trim()}
            className={cx(
              'px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed',
              highGraphics
                ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            )}
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TokenWalletCard />
        <div
          className={cx(
            'p-4 sm:p-5 rounded-2xl sm:rounded-3xl',
            highGraphics ? 'bg-white/90 border border-slate-200/80 shadow-sm' : 'bg-white border border-slate-200'
          )}
        >
          <h3 className="text-sm font-extrabold text-slate-900 mb-3">How AI tokens work</h3>
          <ul className="space-y-2.5 text-[11px] sm:text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
              Every quiz you clear rewards XP and bonus AI tokens.
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
              10 XP converts into 1 AI token using the packs alongside.
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
              Each AI answer costs exactly 1 token.
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
              Tokens spent so far: <span className="font-black text-slate-900">{tokensSpent}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AiTutorPanel;
