/**
 * FirebasePhoneOtpPanel
 * ---------------------
 * Sends a real SMS OTP via Firebase Phone Authentication (10,000 SMS/month free).
 * Uses invisible reCAPTCHA — the user never sees a CAPTCHA challenge.
 *
 * Usage:
 *   <FirebasePhoneOtpPanel
 *     phoneNumber="+919876543210"
 *     disabled={false}
 *     onVerified={(idToken) => void}   ← called on success; parent sends idToken to backend
 *   />
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { LoaderCircle, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { firebaseAuthConfigured, getFirebaseAuth } from '../../services/firebase';

interface FirebasePhoneOtpPanelProps {
  phoneNumber: string;    // must be in E.164 format e.g. "+919876543210"
  disabled?: boolean;
  onVerified: (idToken: string) => Promise<void>;
}

type PanelState =
  | { step: 'idle' }
  | { step: 'sending' }
  | { step: 'awaiting_code'; confirmationResult: import('@firebase/auth').ConfirmationResult }
  | { step: 'verifying'; confirmationResult: import('@firebase/auth').ConfirmationResult }
  | { step: 'done' };

export const FirebasePhoneOtpPanel: React.FC<FirebasePhoneOtpPanelProps> = ({
  phoneNumber,
  disabled = false,
  onVerified,
}) => {
  const [panelState, setPanelState] = useState<PanelState>({ step: 'idle' });
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<import('@firebase/auth').RecaptchaVerifier | null>(null);

  // Countdown timer for resend throttle
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { window.clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [countdown]);

  // Cleanup reCAPTCHA on unmount
  useEffect(() => {
    return () => {
      try { recaptchaVerifierRef.current?.clear(); } catch { /* ignore */ }
    };
  }, []);

  const setupRecaptcha = useCallback(async () => {
    // Reuse existing verifier if still valid
    if (recaptchaVerifierRef.current) return recaptchaVerifierRef.current;

    const { RecaptchaVerifier } = await import('@firebase/auth');
    const auth = await getFirebaseAuth();

    if (!recaptchaContainerRef.current) throw new Error('reCAPTCHA container not found.');

    const verifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, {
      size: 'invisible',
      callback: () => { /* reCAPTCHA solved automatically */ },
      'expired-callback': () => {
        // Reset verifier on expiry so next send recreates it
        try { recaptchaVerifierRef.current?.clear(); } catch { /* ignore */ }
        recaptchaVerifierRef.current = null;
      },
    });

    await verifier.render();
    recaptchaVerifierRef.current = verifier;
    return verifier;
  }, []);

  const sendOtp = async () => {
    if (disabled || !phoneNumber.trim() || countdown > 0) return;
    if (!firebaseAuthConfigured) {
      setError('Firebase is not configured. Contact the administrator.');
      return;
    }

    setPanelState({ step: 'sending' });
    setError(null);
    setCode('');

    try {
      const { signInWithPhoneNumber } = await import('@firebase/auth');
      const auth = await getFirebaseAuth();
      const verifier = await setupRecaptcha();

      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber.trim(), verifier);
      setPanelState({ step: 'awaiting_code', confirmationResult });
      setCountdown(60); // Prevent resend for 60 seconds
    } catch (err: unknown) {
      // Reset verifier so a fresh one is created on retry
      try { recaptchaVerifierRef.current?.clear(); } catch { /* ignore */ }
      recaptchaVerifierRef.current = null;
      setPanelState({ step: 'idle' });

      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('invalid-phone-number') || msg.includes('INVALID_PHONE_NUMBER')) {
        setError('Invalid phone number format. Use international format e.g. +919876543210.');
      } else if (msg.includes('too-many-requests') || msg.includes('TOO_MANY_ATTEMPTS')) {
        setError('Too many SMS requests. Please wait a few minutes before trying again.');
      } else if (msg.includes('quota-exceeded') || msg.includes('QUOTA_EXCEEDED')) {
        setError('Firebase SMS quota exceeded for today. Try again tomorrow or use email OTP.');
      } else {
        setError(`Could not send OTP: ${msg}`);
      }
    }
  };

  const verifyOtp = async () => {
    if (panelState.step !== 'awaiting_code' || code.length !== 6) return;
    const { confirmationResult } = panelState;

    setPanelState({ step: 'verifying', confirmationResult });
    setError(null);

    try {
      const result = await confirmationResult.confirm(code);
      const idToken = await result.user.getIdToken();
      await onVerified(idToken);
      setPanelState({ step: 'done' });
    } catch (err: unknown) {
      setPanelState({ step: 'awaiting_code', confirmationResult });
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('invalid-verification-code') || msg.includes('INVALID_CODE')) {
        setError('Incorrect OTP. Please check the SMS and try again.');
      } else if (msg.includes('session-expired') || msg.includes('CODE_EXPIRED')) {
        setError('This OTP has expired. Please request a new one.');
        setPanelState({ step: 'idle' });
      } else {
        setError(`Verification failed: ${msg}`);
      }
    }
  };

  const isAwaiting = panelState.step === 'awaiting_code' || panelState.step === 'verifying';
  const isBusy = panelState.step === 'sending' || panelState.step === 'verifying';

  if (panelState.step === 'done') {
    return (
      <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        Phone number verified successfully!
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      {/* Invisible reCAPTCHA anchor — Firebase requires a DOM node */}
      <div ref={recaptchaContainerRef} />

      {/* Send / Resend button row */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={sendOtp}
          disabled={isBusy || disabled || !phoneNumber.trim() || countdown > 0}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-2 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer active:scale-98 transition-all"
        >
          {panelState.step === 'sending'
            ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
            : <Phone className="h-3.5 w-3.5" />
          }
          {isAwaiting && countdown > 0
            ? `Resend in ${countdown}s`
            : isAwaiting
            ? 'Resend OTP'
            : 'Send SMS OTP'
          }
        </button>
        <span className="text-[10px] text-slate-500">
          {firebaseAuthConfigured ? 'Real SMS via Google Firebase · Free' : 'Firebase not configured'}
        </span>
      </div>

      {/* Code input + Verify button */}
      {isAwaiting && (
        <div className="space-y-1.5">
          <p aria-live="polite" className="text-[11px] text-emerald-700 font-medium">
            OTP sent to {phoneNumber.slice(0, 4)}••••{phoneNumber.slice(-3)}. Check your SMS messages.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              aria-label="Phone verification code"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
            />
            <button
              type="button"
              onClick={verifyOtp}
              disabled={panelState.step === 'verifying' || code.length !== 6}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 shadow-xs cursor-pointer active:scale-98 transition-all"
            >
              {panelState.step === 'verifying'
                ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                : <ShieldCheck className="h-3.5 w-3.5" />
              }
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

export default FirebasePhoneOtpPanel;

