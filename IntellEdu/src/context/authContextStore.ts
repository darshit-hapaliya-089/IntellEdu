import { createContext } from 'react';
import type { AuthUser } from '../types';
import type { authApi, OtpChallengeResponse } from '../services/api';

export interface AuthContextValue {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isInitializing: boolean;
  login: (emailOrPhone: string, password: string) => Promise<void>;
  sendOtp: (data: Parameters<typeof authApi.sendOtp>[0]) => Promise<OtpChallengeResponse>;
  verifyOtp: (data: { challengeId: string; code: string; password?: string }) => Promise<void>;
  authenticateFirebase: (
    idToken: string,
    mode: 'login' | 'signup',
    profile?: { fullName?: string; grade?: string }
  ) => Promise<void>;
  logout: () => void;
  updateUser: (updatedData: Partial<AuthUser>) => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
