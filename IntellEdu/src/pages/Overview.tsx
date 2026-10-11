import React, { useEffect, useState } from 'react';
import { Award, BookOpen, Flame, Trophy } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../context/useAuth';
import { progressApi, type UserProgress } from '../services/api';
import { cx } from '../utils/cx';
import { usePerformanceMode } from '../context/PerformanceModeContext';

const Overview: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { highGraphics } = usePerformanceMode();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    progressApi.getMyProgress()
      .then(({ progress: progressResponse }) => {
        if (!active) return;
        setProgress(progressResponse);
        setError(null);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Could not load your dashboard data.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [user?.grade]);

  const stats = [
    { label: 'Courses Enrolled', value: progress?.coursesEnrolled ?? 0, icon: BookOpen },
    { label: 'Quizzes Taken', value: progress?.quizzesTaken ?? 0, icon: Trophy },
    { label: 'Current Streak', value: progress ? `${progress.streak} days` : '—', icon: Flame },
    { label: 'Total XP', value: progress?.points ?? '—', icon: Award },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className={cx(
        'p-5 sm:p-8 rounded-2xl sm:rounded-3xl text-white',
        highGraphics ? 'bg-linear-to-r from-indigo-600 via-indigo-700 to-violet-700 shadow-xl shadow-indigo-500/20' : 'bg-indigo-900'
      )}>
        <p className="text-sm text-indigo-100">Your learning overview</p>
        <h2 className="mt-1 text-2xl sm:text-3xl font-black">Welcome back, {user?.name || 'Student'}!</h2>
        <p className="mt-2 max-w-2xl text-sm text-indigo-100">Pick up where you left off, practice a quiz, or ask the AI tutor for help.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/dashboard/courses" className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-indigo-700">My Courses</Link>
          <Link to="/dashboard/doubts" className="rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950">Ask AI Doubt</Link>
        </div>
      </section>

      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

      <section className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2 text-xs font-bold uppercase text-slate-500">
              <span>{label}</span><Icon className="h-5 w-5 text-indigo-600" />
            </div>
            <p className="mt-3 text-2xl font-black text-slate-900">{value}</p>
          </article>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Continue Learning</h2>
          <Link to="/dashboard/courses" className="text-sm font-bold text-indigo-600 hover:underline">View all courses</Link>
        </div>
        {loading ? (
          <p className="text-sm text-slate-500">Loading your courses…</p>
        ) : progress?.enrolledCourses.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {progress.enrolledCourses.slice(0, 3).map((course) => (
              <CourseCard
                key={course.id}
                course={{
                  id: String(course.id),
                  title: course.title,
                  category: course.category,
                  progressPercent: course.progressPercent ?? 0,
                  totalLessons: course.totalLessons,
                  completedLessons: course.completedLessons ?? 0,
                  image: course.imageUrl || '',
                  rating: course.rating,
                }}
                actionLabel="View enrolled courses"
                onResume={() => navigate('/dashboard/courses')}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">You are not enrolled in any courses yet. Browse the course catalogue to enroll.</p>
        )}
      </section>
    </div>
  );
};

export default Overview;
