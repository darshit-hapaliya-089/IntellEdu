import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Brain, Send, Sparkles, Trophy, Flame, AlertCircle } from 'lucide-react';
import { ChatSender } from './ChatBubble';
import ChatBubble from './ChatBubble';
import { usePerformanceMode } from '../../context/PerformanceModeContext';
import { cx } from '../../utils/cx';
import { doubtSolverApi, type DoubtSolverStatus } from '../../services/api';
import { useAuth } from '../../context/useAuth';

interface TutorMessage {
  id: string;
  sender: ChatSender;
  text: string;
}

export interface AiTutorPanelProps {
  onOpenQuizzes: () => void;
}

const GREETING = "Hi! I'm your IntellEdu AI Tutor. Ask me any doubt in Maths, Science, Social Science, English or Coding.";

export const AiTutorPanel: React.FC<AiTutorPanelProps> = ({ onOpenQuizzes }) => {
  const { highGraphics } = usePerformanceMode();
  const { updateUser } = useAuth();
  const [messages, setMessages] = useState<TutorMessage[]>([
    { id: 'greet', sender: 'ai', text: GREETING },
  ]);
  const [input, setInput] = useState<string>('');
  const [thinking, setThinking] = useState<boolean>(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [aiStatus, setAiStatus] = useState<DoubtSolverStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [insufficientXp, setInsufficientXp] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const canAsk = aiStatus ? Boolean(aiStatus.canAsk) : true;
  const isPaid = aiStatus?.mode === 'paid';
  const costXp = aiStatus?.costXp ?? 10;
  const xpAvailable = aiStatus?.xpAvailable ?? aiStatus?.currentXpBalance ?? 0;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const refreshStatus = useCallback(async () => {
    try {
      const status = await doubtSolverApi.getStatus();
      setAiStatus(status);
      updateUser({ points: status.xpAvailable ?? status.currentXpBalance });
      if (status.mode === 'paid' && !status.canAsk) {
        setInsufficientXp(true);
      } else {
        setInsufficientXp(false);
      }
      return status;
    } catch (err: unknown) {
      console.warn('Could not refresh AI status:', err);
      return null;
    }
  }, [updateUser]);

  useEffect(() => {
    let active = true;
    doubtSolverApi.getHistory()
      .then(({ history }) => {
        if (!active || history.length === 0) return;
        const savedMessages = history.reverse().flatMap((item) => [
          { id: `q-${item.id}`, sender: 'user' as const, text: item.question },
          { id: `a-${item.id}`, sender: 'ai' as const, text: item.answer },
        ]);
        setMessages((current) => [...current, ...savedMessages]);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Could not load your saved AI conversations.');
      })
      .finally(() => { if (active) setHistoryLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setStatusLoading(true);
    refreshStatus().finally(() => {
      if (active) setStatusLoading(false);
    });
    return () => { active = false; };
  }, [refreshStatus]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || thinking || !canAsk) return;

    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, sender: 'user', text: question }]);
    setInput('');
    setThinking(true);
    setError(null);
    setInsufficientXp(false);

    try {
      const response = await doubtSolverApi.ask(question);
      setMessages((prev) => [
        ...prev,
        { id: `a-${response.id}`, sender: 'ai', text: response.answer },
      ]);
      if (typeof response.xpAvailable === 'number') {
        updateUser({ points: response.xpAvailable });
      } else if (typeof response.currentXpBalance === 'number') {
        updateUser({ points: response.currentXpBalance });
      }
      await refreshStatus();
    } catch (cause: any) {
      const is402 = cause?.status === 402 || cause?.message?.includes('XP');
      if (is402) {
        setInsufficientXp(true);
      }
      const message = cause instanceof Error ? cause.message : 'The AI service could not answer this question.';
      setError(message);
      await refreshStatus();
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 w-full">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">AI Instant Doubt Solver</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ask questions and get instant step-by-step guidance from your IntellEdu AI tutor.
          </p>
        </div>
      </div>

      {/* Mode & Streak/XP Status Banner */}
      <section aria-live="polite" className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-violet-100 bg-violet-50 p-3.5 text-sm shadow-xs">
        <div className="flex items-center gap-2">
          {isPaid ? (
            <Brain className="h-5 w-5 text-violet-600 shrink-0" />
          ) : (
            <Flame className="h-5 w-5 text-amber-500 shrink-0" />
          )}
          <p className="font-semibold text-violet-950">
            {statusLoading ? (
              'Checking your streak and AI billing status…'
            ) : !isPaid ? (
              aiStatus && aiStatus.daysToUnlockPaid > 0 ? (
                `Free AI mode: ${aiStatus.daysToUnlockPaid} more streak ${aiStatus.daysToUnlockPaid === 1 ? 'day' : 'days'} until XP-based mode`
              ) : (
                'Free AI mode: Unlimited questions with 0 XP cost'
              )
            ) : (
              `AI answer cost: ${costXp} XP · ${xpAvailable} XP available`
            )}
          </p>
        </div>
        {!statusLoading && (
          <span className="rounded-full bg-white px-3.5 py-1 text-xs font-bold text-violet-800 shadow-xs border border-violet-100">
            {xpAvailable} XP
          </span>
        )}
      </section>

      {/* Insufficient XP Callout Card */}
      {insufficientXp && (
        <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/90 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fade-slide-up">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-black text-amber-950">You need {costXp} XP to ask the AI</h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Solve quizzes to earn XP and continue asking questions. You currently have {xpAvailable} XP.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenQuizzes}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition active:scale-95 shrink-0 cursor-pointer"
          >
            <Trophy className="h-4 w-4" /> Go to Quizzes & Earn XP
          </button>
        </div>
      )}

      {/* Friendly Error Banner */}
      {error && !insufficientXp && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs sm:text-sm text-rose-800 flex items-center justify-between gap-2 shadow-xs">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-600 hover:text-rose-900 font-bold px-2 py-0.5 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Chat Window */}
      <div
        className={cx(
          'rounded-2xl sm:rounded-3xl overflow-hidden',
          highGraphics
            ? 'bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-xl shadow-slate-200/50'
            : 'bg-white border border-slate-200'
        )}
      >
        {/* Chat header */}
        <div className={cx('flex items-center justify-between gap-3 p-4 border-b border-slate-100', highGraphics && 'bg-gradient-to-r from-indigo-50/60 to-violet-50/40')}>
          <div className="flex items-center gap-3 min-w-0">
            <div className={cx(
              'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-white',
              highGraphics ? 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/25' : 'bg-indigo-600'
            )}>
              <Brain className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-slate-900 leading-tight truncate">IntellEdu AI Tutor</p>
              <p className="text-[11px] text-slate-500">
                {!isPaid ? 'Free mode active (0 XP per answer)' : `Paid mode active (${costXp} XP per answer)`}
              </p>
            </div>
          </div>
        </div>

        {/* Message Log */}
        <div ref={scrollRef} className="h-[46vh] sm:h-80 overflow-y-auto p-3 sm:p-4 space-y-3 bg-slate-50/60">
          {historyLoading && <p className="text-center text-xs text-slate-500">Loading saved conversation…</p>}
          {messages.map((message) => (
            <ChatBubble key={message.id} sender={message.sender} text={message.text} />
          ))}
          {thinking && (
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 pl-9">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-500" />
              AI Tutor is analyzing your question step-by-step…
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-slate-100 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={!canAsk ? `Insufficient XP (${xpAvailable}/${costXp} XP) — solve quizzes to unlock` : "Ask a question in Maths, Science, English, etc…"}
            aria-label="Ask the AI tutor a question"
            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 min-w-0 disabled:opacity-60"
            disabled={!canAsk || thinking}
          />
          <button
            type="submit"
            disabled={thinking || !input.trim() || !canAsk}
            title={!canAsk ? `You need ${costXp} XP to ask the AI tutor` : undefined}
            className={cx(
              'px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed',
              highGraphics
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            )}
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      <button
        type="button"
        onClick={onOpenQuizzes}
        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
      >
        <Trophy className="h-4 w-4" /> Practice a server quiz
      </button>
    </div>
  );
};

export default AiTutorPanel;
