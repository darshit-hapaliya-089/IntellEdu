import React, { useEffect, useState } from 'react';
import { LoaderCircle, MessageSquare, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { OtpChallengeResponse } from '../../services/api';

interface WhatsAppOtpPanelProps {
  recipient: string;
  disabled?: boolean;
  onSend: () => Promise<OtpChallengeResponse>;
  onVerify: (challengeId: string, code: string) => Promise<void>;
}

function maskPhone(recipient: string): string {
  const digits = recipient.replace(/\D/g, '');
  if (digits.length >= 10) {
    const prefix = recipient.startsWith('+') ? recipient.slice(0, 3) : '';
    const last4 = digits.slice(-4);
    const first2 = digits.slice(0, 2);
    return `${prefix} ${first2}••••${last4}`;
  }
  return recipient;
}

export const WhatsAppOtpPanel: React.FC<WhatsAppOtpPanelProps> = ({
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
  const [isSuccess, setIsSuccess] = useState(false);

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
      setError(cause instanceof Error ? cause.message : 'Could not send WhatsApp verification code.');
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
      setIsSuccess(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The verification code could not be verified.');
    } finally {
      setBusy(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
        {challenge?.channel === 'email' ? 'Email verified successfully!' : 'WhatsApp phone number verified successfully!'}
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      {/* Send button row */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={send}
          disabled={busy || disabled || !recipient.trim() || (Boolean(challenge) && remainingSeconds > 0)}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer active:scale-98 transition-all shadow-xs"
        >
          {busy && !challenge ? (
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
          )}
          {busy && !challenge
            ? 'Sending...'
            : challenge && remainingSeconds > 0
            ? `Resend in ${remainingSeconds}s`
            : 'Send WhatsApp OTP'}
        </button>
        <span className="text-[10px] text-slate-500">Instant delivery · Free</span>
      </div>

      {/* Challenge active section */}
      {challenge && (
        <div className="space-y-2.5 rounded-xl border border-emerald-100 bg-emerald-50/60 p-2.5 sm:p-3">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium">
            <MessageSquare className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <p aria-live="polite">
              {challenge.message || `Verification code sent to ${maskPhone(recipient)} via ${challenge.channel ?? 'WhatsApp'}.`}
              {remainingSeconds > 0 ? ` Expires in ${remainingSeconds}s.` : ' Expired; request a new code.'}
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              aria-label="WhatsApp verification code"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs tracking-[0.25em] focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-slate-900 placeholder:tracking-normal"
            />
            <button
              type="button"
              onClick={verify}
              disabled={busy || code.length !== 6 || remainingSeconds === 0}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm cursor-pointer active:scale-98 transition-all"
            >
              {busy ? (
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5" />
              )}
              Verify & continue
            </button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-[11px] font-semibold text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default WhatsAppOtpPanel;
