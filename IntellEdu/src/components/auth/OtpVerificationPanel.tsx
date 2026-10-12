import React, { useEffect, useState } from 'react';
import { LoaderCircle, Mail, Phone, ShieldCheck } from 'lucide-react';
import { OtpChallengeResponse } from '../../services/api';

interface OtpVerificationPanelProps {
  channel: 'email' | 'phone';
  recipient: string;
  disabled?: boolean;
  onSend: () => Promise<OtpChallengeResponse>;
  onVerify: (challengeId: string, code: string) => Promise<void>;
}

export const OtpVerificationPanel: React.FC<OtpVerificationPanelProps> = ({
  channel,
  recipient,
  disabled = false,
  onSend,
  onVerify,
}) => {
  const [challenge, setChallenge] = useState<OtpChallengeResponse | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (expiresAt === null) return;
    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setRemainingSeconds(remaining);
    };
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 250);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  const send = async () => {
    if (busy || disabled || !recipient.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const result = await onSend();
      setChallenge(result);
      setExpiresAt(Date.parse(result.expiresAt));
      setRemainingSeconds(result.expiresInSeconds);
      setCode('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not send the verification code.');
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (!challenge || remainingSeconds === 0 || code.length !== 6 || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onVerify(challenge.challengeId, code);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The verification code could not be verified.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={send}
          disabled={busy || disabled || !recipient.trim() || (Boolean(challenge) && remainingSeconds > 0)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer active:scale-98 transition-all"
        >
          {busy && !challenge ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : channel === 'email' ? <Mail className="h-3.5 w-3.5" /> : <Phone className="h-3.5 w-3.5" />}
          {busy && !challenge ? 'Sending...' : challenge && remainingSeconds > 0 ? `Resend in ${remainingSeconds}s` : 'Send 6-digit OTP'}
        </button>
        <span className="text-[10px] text-slate-500">Expires after 1 minute</span>
      </div>

      {challenge && (
        <div className="space-y-2">
          <p aria-live="polite" className="text-[11px] text-emerald-700 font-medium">
            {challenge.message || `Verification code sent via ${challenge.channel ?? channel}.`}
            {remainingSeconds > 0 ? ` Expires in ${remainingSeconds}s.` : ' This code has expired; request a new one.'}
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              aria-label={`${channel === 'email' ? 'Email' : 'Phone'} verification code`}
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
            />
            <button
              type="button"
              onClick={verify}
              disabled={busy || code.length !== 6 || remainingSeconds === 0}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 shadow-xs cursor-pointer active:scale-98 transition-all"
            >
              {busy ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
              Verify & continue
            </button>
          </div>
        </div>
      )}

      {error && <p role="alert" className="text-[11px] font-semibold text-rose-600">{error}</p>}
    </div>
  );
};

export default OtpVerificationPanel;
