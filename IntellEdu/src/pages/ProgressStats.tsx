import React, { useEffect, useState } from 'react';
import { Award, BookOpen, Flame, Target, Trophy } from 'lucide-react';
import { progressApi, type UserProgress } from '../services/api';

const ProgressStats: React.FC = () => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    progressApi.getMyProgress()
      .then(({ progress: result }) => { if (active) setProgress(result); })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Could not load progress from the server.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const stats = progress ? [
    { label: 'Total XP', value: progress.points, icon: Award },
    { label: 'Quizzes Taken', value: progress.quizzesTaken, icon: Trophy },
    { label: 'Average Accuracy', value: `${progress.averageAccuracy}%`, icon: Target },
    { label: 'Courses Completed', value: `${progress.coursesCompleted}/${progress.coursesEnrolled}`, icon: BookOpen },
    { label: 'Current Streak', value: `${progress.streak} days`, icon: Flame },
  ] : [];

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">Progress & Stats</h2>
        <p className="mt-1 text-sm text-slate-500">Account progress and quiz history synced from your IntellEdu account.</p>
      </header>
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      {loading ? <p className="text-sm text-slate-500">Loading progress…</p> : progress && (
        <>
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {stats.map(({ label, value, icon: Icon }) => (
              <article key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-2 text-xs font-bold uppercase text-slate-500">
                  <span>{label}</span><Icon className="h-5 w-5 text-indigo-600" />
                </div>
                <p className="mt-3 text-2xl font-black text-slate-900">{value}</p>
              </article>
            ))}
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
            <h3 className="font-bold text-slate-900">Enrolled Courses</h3>
            {progress.enrolledCourses.length ? (
              <ul className="mt-3 divide-y divide-slate-100">
                {progress.enrolledCourses.map((course) => (
                  <li key={course.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <span className="font-semibold text-slate-800">{course.title}</span>
                    <span className="shrink-0 text-slate-500">{course.completedLessons ?? 0}/{course.totalLessons} lessons · {course.progressPercent ?? 0}%</span>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-2 text-sm text-slate-500">No enrolled courses yet.</p>}
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
            <h3 className="font-bold text-slate-900">Recent Quiz Attempts</h3>
            {progress.recentQuizActivity.length ? (
              <ul className="mt-3 divide-y divide-slate-100">
                {progress.recentQuizActivity.map((attempt) => (
                  <li key={attempt.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                    <span className="font-semibold text-slate-800">{attempt.quiz.title}</span>
                    <span className="text-slate-500">{attempt.score}/{attempt.totalQuestions} · {attempt.accuracy}% · +{attempt.xpEarned} XP</span>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-2 text-sm text-slate-500">Complete a quiz to see your attempt history.</p>}
          </section>
        </>
      )}
    </div>
  );
};

export default ProgressStats;
