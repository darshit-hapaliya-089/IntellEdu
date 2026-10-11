import React, { useEffect, useRef, useState } from 'react';
import { Brain, Send, Sparkles, Trophy } from 'lucide-react';
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
  const [trialStatus, setTrialStatus] = useState<DoubtSolverStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const aiLockedOut = Boolean(
    trialStatus
    && !trialStatus.trialActive
    && trialStatus.trialStartedAt
    && trialStatus.xpBalance < trialStatus.xpCostPerQuestion
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

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
    doubtSolverApi.getStatus()
      .then((status) => {
        if (!active) return;
        setTrialStatus(status);
        updateUser({ points: status.currentXpBalance });
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Could not load your AI trial and XP status.');
      })
      .finally(() => { if (active) setStatusLoading(false); });
    return () => { active = false; };
  }, [updateUser]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || thinking) return;

    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, sender: 'user', text: question }]);
    setInput('');
    setThinking(true);
    setError(null);

    try {
      const response = await doubtSolverApi.ask(question);
      setMessages((prev) => [
        ...prev,
        { id: `a-${response.id}`, sender: 'ai', text: response.answer },
      ]);
      if (typeof response.currentXpBalance === 'number') {
        updateUser({ points: response.currentXpBalance });
      }
      const updatedStatus = await doubtSolverApi.getStatus();
      setTrialStatus(updatedStatus);
      updateUser({ points: updatedStatus.currentXpBalance });
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'The AI service could not answer this question.';
      setError(message);
      void doubtSolverApi.getStatus().then((status) => {
        setTrialStatus(status);
        updateUser({ points: status.currentXpBalance });
      }).catch((statusError: unknown) => {
        console.error('Could not refresh AI trial status after the request failed.', statusError);
      });
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 w-full">
      {/* Title & Quick Points Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">AI Instant Doubt Solver</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ask questions and review your saved conversations with the IntellEdu AI service.
          </p>
        </div>

      </div>
      <section aria-live="polite" className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-violet-100 bg-violet-50 p-3 text-sm">
        <p className="font-semibold text-violet-950">
          {statusLoading
            ? 'Checking your free trial and XP…'
            : trialStatus?.trialActive
              ? `Free AI trial · Day ${trialStatus.trialDay ?? 1} of 10 · ${trialStatus.trialDaysRemaining} days remaining`
              : trialStatus && !trialStatus.trialStartedAt
                ? `Free 10-day AI trial starts with your first question · ${trialStatus.xpBalance} XP available`
              : trialStatus
                ? `AI answer cost: ${trialStatus.xpCostPerQuestion} XP · ${trialStatus.xpBalance} XP available`
                : 'AI trial and XP status is unavailable.'}
        </p>
        {!statusLoading && trialStatus && (
          <span className="rounded-full bg-white px-3 py-1 font-bold text-violet-800">
            {trialStatus.xpBalance} XP
          </span>
        )}
      </section>
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

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
              <p className="text-[11px] text-slate-500">AI responses and conversation history are connected to your account</p>
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
            placeholder="Ask a question…"
            aria-label="Ask the AI tutor a question"
            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 min-w-0 disabled:opacity-60"
            disabled={aiLockedOut}
          />
          <button
            type="submit"
            disabled={thinking || !input.trim() || aiLockedOut}
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

      <button type="button" onClick={onOpenQuizzes} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white">
        <Trophy className="h-4 w-4" /> Practice a server quiz
      </button>
    </div>
  );
};

export default AiTutorPanel;
