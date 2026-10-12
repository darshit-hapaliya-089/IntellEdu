/**
 * IntellEdu Frontend API Client Service
 * Connects the React TypeScript application to the AdonisJS Backend API
 * Set VITE_API_URL to the backend API root, including /api/v1.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '');

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
  if (!API_BASE_URL) {
    throw new Error('VITE_API_URL is not configured. Set it to your backend API root, including /api/v1.');
  }

  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (error) {
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
      throw new ApiError('This request took too long. Please retry in a moment.', 408);
    }
    throw new Error(
      `Cannot reach the IntellEdu API at ${API_BASE_URL}. Make sure the backend is running and VITE_API_URL is correct.`,
      { cause: error }
    );
  }

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}`;
    try {
      const responseBody = await response.text();
      try {
        const errData = JSON.parse(responseBody) as { message?: string; errors?: unknown };
        errorMessage = errData.message || (errData.errors ? JSON.stringify(errData.errors) : errorMessage);
      } catch {
        errorMessage = /password authentication failed|no pg_hba\.conf entry|database "[^"]+" does not exist/i.test(responseBody)
          ? 'The backend cannot connect to PostgreSQL. Set DB_PASSWORD in the backend .env file, confirm the DB_USER and database settings, then restart the backend.'
          : responseBody.trim() || errorMessage;
      }
    } catch {
      // Keep the HTTP status as a fallback when the response body cannot be read.
    }
    throw new ApiError(errorMessage, response.status);
  }

  return response.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
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
    phone?: string | null;
    grade: string;
    points: number;
    streak: number;
    badge?: string;
    role: string;
    avatarUrl?: string;
  };
}

export interface OtpChallengeResponse {
  success: boolean;
  challengeId: string;
  channel: 'email' | 'phone' | 'whatsapp' | null;
  expiresInSeconds: number;
  expiresAt: string;
  message: string;
  whatsappLink?: string;
}

export const authApi = {
  health: async (): Promise<void> => {
    if (!API_BASE_URL) return;
    const serverBase = API_BASE_URL.replace(/\/api\/v1\/?$/i, '');
    try {
      await fetch(`${serverBase}/health`, { signal: AbortSignal.timeout(10000) });
    } catch {
      // The health ping is intentionally silent; the OTP request reports connectivity failures.
    }
  },

  sendOtp: (data: {
    channel: 'email' | 'phone' | 'whatsapp';
    flow: 'login' | 'signup';
    recipient: string;
    fullName?: string;
    email?: string;
    phone?: string;
    grade?: string;
  }) => request<OtpChallengeResponse>('/auth/otp/send', {
    method: 'POST',
    body: JSON.stringify(data),
    signal: AbortSignal.timeout(20_000),
  }),

  verifyOtp: (data: { challengeId: string; code: string; password?: string }) =>
    request<AuthResponse>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  firebase: (data: {
    idToken: string;
    mode: 'login' | 'signup';
    fullName?: string;
    grade?: string;
  }) =>
    request<AuthResponse>('/auth/firebase', {
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

  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<{ message: string }>('/auth/password', {
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
  rating?: number;
  completedLessons?: number;
  progressPercent?: number;
}

export interface CourseResource {
  id: number | string;
  courseId: number | string;
  title: string;
  resourceType: 'video' | 'reading';
  resourceUrl: string;
  estimatedMinutes?: number | null;
  sortOrder: number;
}

export const coursesApi = {
  getAll: (params?: { grade?: string; category?: string }) => {
    const queryParams = new URLSearchParams();
    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value) queryParams.set(key, value);
    });
    const query = queryParams.toString();
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

  getResources: (id: string | number) =>
    request<{ courseId: number | string; resources: CourseResource[] }>(`/courses/${id}/resources`),

  startResourceSession: (courseId: string | number, resourceId: string | number) =>
    request<{
      sessionId: number | string;
      courseId: number | string;
      resourceId: number | string;
      startedAt: string;
      maxSessionMinutes: number;
    }>(`/courses/${courseId}/resources/${resourceId}/sessions`, { method: 'POST' }),

  completeResourceSession: (courseId: string | number, resourceId: string | number, sessionId: string | number) =>
    request<{
      message: string;
      elapsedSeconds: number;
      awardedMinutes: number;
      xpEarned: number;
      currentXpBalance: number;
      limits: { maxMinutesPerSession: number; maxMinutesPerDay: number; xpPerMinute: number };
    }>(`/courses/${courseId}/resources/${resourceId}/sessions/${sessionId}/complete`, { method: 'POST' }),
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Quizzes API
// ─────────────────────────────────────────────────────────────────────────────

export interface QuizData {
  id: number | string;
  title: string;
  description?: string;
  grade?: string;
  subject?: string;
  xpReward: number;
  timeLimitMinutes: number;
  questions?: Array<{
    id: number;
    question: string;
    options: string[];
  }>;
}

export interface QuizResultHistory {
  id: number | string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  xpEarned: number;
  timeTakenSeconds?: number | null;
  createdAt: string;
  quiz: { id: number | string; title: string };
}

export interface QuizSubmitResult {
  message: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  xpEarned: number;
  currentXpBalance?: number;
  review: Array<{
    question: string;
    yourAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation?: string;
  }>;
}

export const quizzesApi = {
  getAll: (params?: { grade?: string; subject?: string }) => {
    const queryParams = new URLSearchParams();
    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value) queryParams.set(key, value);
    });
    const query = queryParams.toString();
    return request<{ quizzes: QuizData[] }>(`/quizzes${query ? `?${query}` : ''}`);
  },

  getById: (id: string | number) => request<{ quiz: QuizData }>(`/quizzes/${id}`),

  submit: (id: string | number, answers: number[], timeTakenSeconds?: number) =>
    request<QuizSubmitResult>(`/quizzes/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers, timeTakenSeconds }),
    }),

  getMyResults: () => request<{ results: QuizResultHistory[] }>('/quizzes/my-results'),
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
  getGlobal: () => request<{ leaderboard: LeaderboardItem[] }>('/leaderboard/worldwide'),

  getWeekly: () => request<{ leaderboard: LeaderboardItem[] }>('/leaderboard/weekly'),

  getByGrade: (grade: string) =>
    request<{ leaderboard: LeaderboardItem[] }>(`/leaderboard/class/${encodeURIComponent(grade)}`),

  getFriends: () =>
    request<{ scope: 'friends'; currentUserRank: number | null; leaderboard: LeaderboardItem[] }>('/leaderboard/friends'),
};

export interface FriendAccount {
  id: number | string;
  name: string;
  grade: string;
  points: number;
  streak: number;
  badge?: string | null;
  avatarUrl?: string | null;
}

export const friendsApi = {
  getAll: () => request<{ friends: FriendAccount[]; suggestions: FriendAccount[] }>('/friends'),
  add: (id: number | string) =>
    request<{ message: string }>(`/friends/${id}`, { method: 'POST' }),
  remove: (id: number | string) =>
    request<{ message: string }>(`/friends/${id}`, { method: 'DELETE' }),
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. Learning Progress & Daily Streak API
// ─────────────────────────────────────────────────────────────────────────────

export interface UserProgress {
  userId: number | string;
  points: number;
  streak: number;
  badge: string;
  coursesEnrolled: number;
  coursesCompleted: number;
  quizzesTaken: number;
  averageAccuracy: number;
  enrolledCourses: CourseData[];
  recentQuizActivity: QuizResultHistory[];
}

export const progressApi = {
  getMyProgress: () => request<{ progress: UserProgress }>('/progress'),

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
  xpCost?: number;
  xpBalance?: number;
  currentXpBalance?: number;
  trialActive?: boolean;
  trialDay?: number | null;
  trialDaysRemaining?: number;
}

export interface DoubtSolverStatus {
  xpBalance: number;
  currentXpBalance: number;
  xpCostPerQuestion: number;
  trialActive: boolean;
  trialDay: number | null;
  trialStartedAt: string | null;
  trialExpiresAt: string | null;
  trialDaysRemaining: number;
}

export const doubtSolverApi = {
  getStatus: () => request<DoubtSolverStatus>('/doubts/status'),

  ask: (question: string, subject?: string) =>
    request<DoubtResponse>('/doubts/ask', {
      method: 'POST',
      body: JSON.stringify({ question, subject }),
    }),

  getHistory: () => request<{ history: DoubtResponse[] }>('/doubts/history'),
};
