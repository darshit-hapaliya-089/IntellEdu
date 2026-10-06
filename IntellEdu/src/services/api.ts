/**
 * IntellEdu Frontend API Client Service
 * Connects the React TypeScript application to the AdonisJS Backend API
 * Base URL: http://localhost:3333/api/v1
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api/v1';

// Token helpers
export const getAuthToken = (): string | null => {
  return localStorage.getItem('intellEdu_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('intellEdu_token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('intellEdu_token');
};

/**
 * Standardized typed HTTP fetch wrapper with JWT bearer token support
 */
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    try {
      const errData = await response.json();
      errorMessage = errData.message || (errData.errors ? JSON.stringify(errData.errors) : errorMessage);
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Authentication API
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: number | string;
    fullName: string;
    email: string;
    grade: string;
    points: number;
    streak: number;
    badge?: string;
    role: string;
    avatarUrl?: string;
  };
}

export const authApi = {
  register: (data: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    grade: string;
  }) => request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),

  getProfile: () => request<{ user: AuthResponse['user'] }>('/auth/me'),

  updateProfile: (data: { fullName?: string; grade?: string; avatarUrl?: string }) =>
    request<{ message: string; user: AuthResponse['user'] }>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Courses API
// ─────────────────────────────────────────────────────────────────────────────

export interface CourseData {
  id: number | string;
  title: string;
  description?: string;
  category: string;
  grade: string;
  imageUrl?: string;
  totalLessons: number;
  rating: number;
  completedLessons?: number;
  progressPercent?: number;
}

export const coursesApi = {
  getAll: (params?: { grade?: string; category?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return request<{ data: CourseData[] }>(`/courses${query ? `?${query}` : ''}`);
  },

  getById: (id: string | number) => request<{ course: CourseData }>(`/courses/${id}`),

  enroll: (id: string | number) =>
    request<{ message: string }>(`/courses/${id}/enroll`, { method: 'POST' }),

  updateProgress: (id: string | number, completedLessons: number) =>
    request<{ message: string; progressPercent: number; isCompleted: boolean }>(
      `/courses/${id}/progress`,
      {
        method: 'PUT',
        body: JSON.stringify({ completedLessons }),
      }
    ),
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Quizzes API
// ─────────────────────────────────────────────────────────────────────────────

export interface QuizData {
  id: number | string;
  title: string;
  description?: string;
  xpReward: number;
  timeLimitMinutes: number;
  questions?: Array<{
    id: number;
    question: string;
    options: string[];
  }>;
}

export interface QuizSubmitResult {
  message: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  xpEarned: number;
  review: Array<{
    question: string;
    yourAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation?: string;
  }>;
}

export const quizzesApi = {
  getAll: () => request<{ quizzes: QuizData[] }>('/quizzes'),

  getById: (id: string | number) => request<{ quiz: QuizData }>(`/quizzes/${id}`),

  submit: (id: string | number, answers: number[], timeTakenSeconds?: number) =>
    request<QuizSubmitResult>(`/quizzes/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers, timeTakenSeconds }),
    }),

  getMyResults: () => request<{ results: any[] }>('/quizzes/my-results'),
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Leaderboard API
// ─────────────────────────────────────────────────────────────────────────────

export interface LeaderboardItem {
  rank: number;
  id: number | string;
  name: string;
  grade?: string;
  points: number;
  streak: number;
  badge?: string;
  avatarUrl?: string;
}

export const leaderboardApi = {
  getGlobal: () => request<{ leaderboard: LeaderboardItem[] }>('/leaderboard'),

  getWeekly: () => request<{ leaderboard: LeaderboardItem[] }>('/leaderboard/weekly'),

  getByGrade: (grade: string) =>
    request<{ leaderboard: LeaderboardItem[] }>(`/leaderboard/class/${encodeURIComponent(grade)}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. Learning Progress & Daily Streak API
// ─────────────────────────────────────────────────────────────────────────────

export const progressApi = {
  getMyProgress: () => request<{ progress: any }>('/progress'),

  getStreak: () =>
    request<{ streak: number; isActiveToday: boolean; badge?: string }>('/progress/streak'),

  pingStreak: () =>
    request<{ message: string; streak: number; points: number }>('/progress/streak/ping', {
      method: 'POST',
    }),
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. AI Doubt Solver API
// ─────────────────────────────────────────────────────────────────────────────

export interface DoubtResponse {
  id: number | string;
  question: string;
  answer: string;
  subject?: string;
  createdAt: string;
}

export const doubtSolverApi = {
  ask: (question: string, subject?: string) =>
    request<DoubtResponse>('/doubts/ask', {
      method: 'POST',
      body: JSON.stringify({ question, subject }),
    }),

  getHistory: () => request<{ history: DoubtResponse[] }>('/doubts/history'),
};

