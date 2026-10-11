import React, { useState } from 'react';
import { Globe, LoaderCircle } from 'lucide-react';
import { firebaseAuthConfigured, getFirebaseAuth } from '../../services/firebase';

interface FirebaseAuthOptionsProps {
  mode: 'login' | 'signup';
  canAuthenticate?: boolean;
  onAuthenticate: (idToken: string) => Promise<void>;
}

export const FirebaseAuthOptions: React.FC<FirebaseAuthOptionsProps> = ({
  mode,
  canAuthenticate = true,
  onAuthenticate,
}) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogle = async () => {
    setBusy(true);
    setError(null);
    try {
      const { GoogleAuthProvider, signInWithPopup } = await import('@firebase/auth');
      const credential = await signInWithPopup(await getFirebaseAuth(), new GoogleAuthProvider());
      await onAuthenticate(await credential.user.getIdToken());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Google sign-in could not be completed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-5 space-y-3" aria-label="Google sign-in">
      <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        <span>OR CONTINUE WITH GOOGLE</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      {!firebaseAuthConfigured ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Google sign-in needs Firebase configuration in the frontend and backend environment.
        </p>
      ) : (
        <button
          type="button"
          onClick={handleGoogle}
          disabled={busy || !canAuthenticate}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
          {mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}
        </button>
      )}
      {error && <p role="alert" className="text-xs font-medium text-rose-600">{error}</p>}
    </section>
  );
};

export default FirebaseAuthOptions;
