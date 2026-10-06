import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AuthUser, SignupFormData } from '../types';
import { getStoredValue, setStoredValue, removeStoredValue } from '../utils/storage';
import { authApi, setAuthToken, removeAuthToken } from '../services/api';

interface AuthContextValue {
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (emailOrPhone: string, password: string) => Promise<void>;
  signup: (data: SignupFormData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const DEFAULT_MOCK_USER: AuthUser = {
  id: 'usr_101',
  name: 'Alex Johnson',
  email: 'alex.student@intelledu.org',
  grade: 'Class 10 Science',
  streak: 14,
  points: 2850,
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return getStoredValue<boolean>('intellEdu_isLoggedIn', false);
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    return getStoredValue<AuthUser | null>('intellEdu_user', isLoggedIn ? DEFAULT_MOCK_USER : null);
  });

  const login = async (emailOrPhone: string, password: string): Promise<void> => {
    const email = emailOrPhone.includes('@') ? emailOrPhone : `${emailOrPhone}@student.intelledu.org`;

    try {
      // 1. Try real AdonisJS Backend API
      const res = await authApi.login({ email, password });
      if (res && res.token) {
        setAuthToken(res.token);
        const loggedUser: AuthUser = {
          id: String(res.user.id),
          name: res.user.fullName,
          email: res.user.email,
          grade: res.user.grade,
          streak: res.user.streak || 1,
          points: res.user.points || 100,
          avatar: res.user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        };
        setUser(loggedUser);
        setIsLoggedIn(true);
        setStoredValue('intellEdu_isLoggedIn', true);
        setStoredValue('intellEdu_user', loggedUser);
        return;
      }
    } catch (err) {
      console.warn('Backend connection unavailable, using local mock session:', err);
    }

    // 2. Offline / Local fallback
    await new Promise<void>((resolve) => setTimeout(resolve, 400));
    const nameFromEmail = emailOrPhone.includes('@')
      ? emailOrPhone.split('@')[0].replace('.', ' ')
      : 'Student User';

    const fallbackUser: AuthUser = {
      id: `usr_${Date.now()}`,
      name: nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1),
      email,
      grade: 'Class 10 Science',
      streak: 14,
      points: 2850,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    };

    setUser(fallbackUser);
    setIsLoggedIn(true);
    setStoredValue('intellEdu_isLoggedIn', true);
    setStoredValue('intellEdu_user', fallbackUser);
  };

  const signup = async (data: SignupFormData): Promise<void> => {
    try {
      // 1. Try real AdonisJS Backend API
      const res = await authApi.register({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        grade: data.grade,
      });

      if (res && res.token) {
        setAuthToken(res.token);
        const newUser: AuthUser = {
          id: String(res.user.id),
          name: res.user.fullName,
          email: res.user.email,
          grade: res.user.grade,
          streak: res.user.streak || 1,
          points: res.user.points || 100,
          avatar: res.user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        };
        setUser(newUser);
        setIsLoggedIn(true);
        setStoredValue('intellEdu_isLoggedIn', true);
        setStoredValue('intellEdu_user', newUser);
        return;
      }
    } catch (err) {
      console.warn('Backend connection unavailable, using local mock session:', err);
    }

    // 2. Offline / Local fallback
    await new Promise<void>((resolve) => setTimeout(resolve, 500));
    const fallbackUser: AuthUser = {
      id: `usr_${Date.now()}`,
      name: data.fullName,
      email: data.email,
      grade: data.grade,
      streak: 1,
      points: 100,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    };

    setUser(fallbackUser);
    setIsLoggedIn(true);
    setStoredValue('intellEdu_isLoggedIn', true);
    setStoredValue('intellEdu_user', fallbackUser);
  };

  const logout = () => {
    try {
      authApi.logout().catch(() => {});
    } catch {
      // ignore
    }
    removeAuthToken();
    setIsLoggedIn(false);
    setUser(null);
    removeStoredValue('intellEdu_isLoggedIn');
    removeStoredValue('intellEdu_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
