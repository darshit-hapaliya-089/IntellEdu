import { LucideIcon } from 'lucide-react';

export type Language = 'en' | 'gu' | 'hi';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  grade: string;
  streak: number;
  points: number;
  avatar: string;
}

export interface LoginFormData {
  emailOrPhone: string;
  password: string;
  rememberMe: boolean;
}

export interface SignupFormData {
  fullName: string;
  email: string;
  phone: string;
  grade: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color?: 'indigo' | 'emerald' | 'amber' | 'sky';
  badge?: string;
}

export interface StepItem {
  stepNumber: number;
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface StatItem {
  id: string;
  value: number;
  suffix?: string;
  label: string;
  icon?: LucideIcon;
}

export interface Course {
  id: string;
  title: string;
  category: string;
  progressPercent: number;
  totalLessons: number;
  completedLessons: number;
  image: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  avatar: string;
  badge: string;
  streak: number;
}

export interface DashboardStat {
  id: string;
  title: string;
  value: string | number;
  label: string;
  icon: LucideIcon;
  color: 'indigo' | 'emerald' | 'amber' | 'purple';
}

export type SidebarKey =
  | 'overview'
  | 'courses'
  | 'doubts'
  | 'quizzes'
  | 'progress'
  | 'community'
  | 'settings';

export interface SidebarItem {
  key: SidebarKey;
  label: string;
  icon: LucideIcon;
}
