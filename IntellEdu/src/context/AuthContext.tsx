import React, { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { AuthUser } from '../types';
import { getStoredValue, setStoredValue, removeStoredValue } from '../utils/storage';
import {
  authApi,
  AuthResponse,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  ApiError,
} from '../services/api';
import { firebaseAuthConfigured, getFirebaseAuth } from '../services/firebase';
import { AuthContext, type AuthContextValue } from './authContextStore';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    return getStoredValue<AuthUser | null>('intellEdu_user', null);
  });
  const initialUser = useRef(user);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return Boolean(getAuthToken() && getStoredValue<boolean>('intellEdu_isLoggedIn', false) && user);
  });
  const [isInitializing, setIsInitializing] = useState<boolean>(() => Boolean(getAuthToken() && user));

  const saveUser = useCallback((profile: AuthResponse['user']) => {
    const loggedUser: AuthUser = {
      id: String(profile.id),
      name: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      grade: profile.grade,
      streak: profile.currentStreak ?? profile.streak ?? 1,
      currentStreak: profile.currentStreak ?? profile.streak ?? 1,
      longestStreak: profile.longestStreak ?? profile.streak ?? 1,
      lastActivityDate: profile.lastActivityDate ?? null,
      streakIncreasedToday: profile.streakIncreasedToday ?? false,
      isActiveToday: profile.isActiveToday ?? false,
      points: profile.points ?? 100,
      avatar: profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      badge: profile.badge,
    };
    setUser(loggedUser);
    setIsLoggedIn(true);
    setStoredValue('intellEdu_isLoggedIn', true);
    setStoredValue('intellEdu_user', loggedUser);
  }, []);

  useEffect(() => {
    if (!getAuthToken() || !initialUser.current) return;

    let active = true;
    authApi.getProfile()
      .then(({ user: profile }) => {
        if (active) saveUser(profile);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        if (reason instanceof ApiError && reason.status === 401) {
          removeAuthToken();
          removeStoredValue('intellEdu_isLoggedIn');
          removeStoredValue('intellEdu_user');
          setUser(null);
          setIsLoggedIn(false);
        } else {
          console.error('Could not refresh the signed-in profile from the backend.', reason);
        }
      })
      .finally(() => {
        if (active) setIsInitializing(false);
      });

    return () => { active = false; };
  }, [saveUser]);

  const saveSession = (res: AuthResponse) => {
    if (!res.token || !res.user) {
      throw new Error('The backend returned an invalid authentication response.');
    }
    setAuthToken(res.token);
    saveUser(res.user);
  };

  const login = async (emailOrPhone: string, password: string): Promise<void> => {
    if (!emailOrPhone.includes('@')) {
      throw new Error('Use your email and password, or sign in with phone verification.');
    }
    saveSession(await authApi.login({ email: emailOrPhone.trim(), password }));
  };

  const sendOtp: AuthContextValue['sendOtp'] = (data) => authApi.sendOtp(data);

  const verifyOtp: AuthContextValue['verifyOtp'] = async (data) => {
    saveSession(await authApi.verifyOtp(data));
  };

  const authenticateFirebase: AuthContextValue['authenticateFirebase'] = async (idToken, mode, profile) => {
    saveSession(await authApi.firebase({ idToken, mode, ...profile }));
  };

  const authenticatePhoneFirebase: AuthContextValue['authenticatePhoneFirebase'] = async (idToken, mode, profile) => {
    saveSession(await authApi.phoneFirebaseVerify({ idToken, mode, ...profile }));
  };

  const logout = () => {
    void authApi.logout().catch((error: unknown) => {
      console.warn('Backend logout failed; local session was cleared.', error);
    });
    removeAuthToken();
    if (firebaseAuthConfigured) {
      void getFirebaseAuth().then(async (auth) => {
        const { signOut } = await import('firebase/auth');
        return signOut(auth);
      }).catch((error: unknown) => {
        console.warn('Firebase logout failed after clearing the local session.', error);
      });
    }
    setIsLoggedIn(false);
    setUser(null);
    removeStoredValue('intellEdu_isLoggedIn');
    removeStoredValue('intellEdu_user');
  };

  const updateUser = useCallback((updatedData: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedData };
      setStoredValue('intellEdu_user', updated);
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, isInitializing, login, sendOtp, verifyOtp, authenticateFirebase, authenticatePhoneFirebase, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
