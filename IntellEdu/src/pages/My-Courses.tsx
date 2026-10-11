import React, { useEffect, useState } from 'react';
import CourseCard from '../components/CourseCard';
import { useAuth } from '../context/useAuth';
import { ApiError, coursesApi, progressApi, type CourseData, type CourseResource } from '../services/api';

const MyCourses: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState(() => {
    const match = user?.grade.match(/class\s*(5|6|7|8|9|10|11|12)/i);
    return match ? `Class ${match[1]}` : 'all';
  });
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [resources, setResources] = useState<CourseResource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [activeStudy, setActiveStudy] = useState<{ courseId: string | number; resource: CourseResource; sessionId: string | number } | null>(null);
  const [studyBusy, setStudyBusy] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      coursesApi.getAll(selectedGrade === 'all' ? undefined : { grade: selectedGrade }),
      progressApi.getMyProgress(),
    ])
      .then(([catalogResult, progressResult]) => {
        if (!active) return;
        if (catalogResult.status === 'rejected') {
          throw catalogResult.reason;
        }
        const enrolledCourses = progressResult.status === 'fulfilled' ? progressResult.value.progress.enrolledCourses : [];
        const enrolledById = new Map(enrolledCourses.map((course) => [String(course.id), course]));
        setCourses(catalogResult.value.data.map((course) => {
          const enrolled = enrolledById.get(String(course.id));
          return enrolled ? { ...course, completedLessons: enrolled.completedLessons, progressPercent: enrolled.progressPercent } : course;
        }));
        setEnrolledCourseIds(new Set(enrolledById.keys()));
        setError(progressResult.status === 'rejected'
          ? `Could not load your enrollment status: ${progressResult.reason instanceof Error ? progressResult.reason.message : 'unknown backend error'}`
          : null);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Could not load courses.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selectedGrade]);

  const openCourse = async (course: CourseData) => {
    try {
      if (!enrolledCourseIds.has(String(course.id))) {
        const result = await coursesApi.enroll(course.id);
        setEnrolledCourseIds((current) => new Set(current).add(String(course.id)));
        setNotice(result.message);
      }
      setActiveCourseId(String(course.id));
      setResources([]);
      setResourcesLoading(true);
      setError(null);
      const result = await coursesApi.getResources(course.id);
      setResources(result.resources);
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 409) {
        setEnrolledCourseIds((current) => new Set(current).add(String(course.id)));
        try {
          setActiveCourseId(String(course.id));
          setResources((await coursesApi.getResources(course.id)).resources);
          setError(null);
        } catch (resourceError) {
          setError(resourceError instanceof Error ? resourceError.message : 'Could not load course lessons.');
        }
      } else {
        setError(reason instanceof Error ? reason.message : 'Could not open this course.');
      }
    } finally {
      setResourcesLoading(false);
    }
  };

  const startStudySession = async (courseId: string | number, resource: CourseResource) => {
    setStudyBusy(true);
    setError(null);
    try {
      const session = await coursesApi.startResourceSession(courseId, resource.id);
      setActiveStudy({ courseId, resource, sessionId: session.sessionId });
      setNotice('Study session started. Open the resource, then return here to record your learning time.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not start a study session.');
    } finally {
      setStudyBusy(false);
    }
  };

  const completeStudySession = async () => {
    if (!activeStudy) return;
    setStudyBusy(true);
    setError(null);
    try {
      const result = await coursesApi.completeResourceSession(
        activeStudy.courseId,
        activeStudy.resource.id,
        activeStudy.sessionId,
      );
      setNotice(`${result.message} ${result.awardedMinutes} minute(s) · +${result.xpEarned} XP`);
      updateUser({ points: result.currentXpBalance });
      setActiveStudy(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not finish this study session.');
    } finally {
      setStudyBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <header>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">My Courses</h2>
        <p className="mt-1 text-sm text-slate-500">Browse study courses for standards 5–12 and continue your learning.</p>
      </header>
      <label className="flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-700">
        Standard
        <select value={selectedGrade} disabled={Boolean(activeStudy)} onChange={(event) => { setSelectedGrade(event.target.value); setLoading(true); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 disabled:opacity-50">
          <option value="all">All standards</option>
          {Array.from({ length: 8 }, (_, index) => `Class ${index + 5}`).map((grade) => <option key={grade} value={grade}>{grade}</option>)}
        </select>
      </label>
      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-700">{notice}</p>}
      {loading ? <p className="text-sm text-slate-500">Loading courses…</p> : courses.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
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
              actionLabel={enrolledCourseIds.has(String(course.id)) ? 'Open lessons' : 'Enroll & view lessons'}
              onResume={() => void openCourse(course)}
            />
          ))}
        </div>
      ) : !error ? <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">No published courses are available for your grade yet.</p> : null}
      {activeCourseId && (
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900">Course videos & readings</h3>
              <p className="mt-1 text-xs text-slate-500">Earn 5 XP per recorded minute, up to 60 minutes per session and 120 minutes per day.</p>
            </div>
            <button type="button" disabled={Boolean(activeStudy)} onClick={() => { setActiveCourseId(null); setResources([]); }} className="text-sm font-semibold text-indigo-700 disabled:opacity-50">Close</button>
          </div>
          {resourcesLoading ? <p className="text-sm text-slate-500">Loading course resources…</p> : resources.length ? (
            <ul className="divide-y divide-slate-100">
              {resources.map((resource) => (
                <li key={resource.id} className="flex flex-wrap items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800">{resource.title}</p>
                    <p className="text-xs capitalize text-slate-500">{resource.resourceType}{resource.estimatedMinutes ? ` · about ${resource.estimatedMinutes} min` : ''}</p>
                  </div>
                  <a href={resource.resourceUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-indigo-700">
                    Open {resource.resourceType === 'video' ? 'video' : 'reading'}
                  </a>
                  <button
                    type="button"
                    disabled={studyBusy || Boolean(activeStudy)}
                    onClick={() => void startStudySession(activeCourseId, resource)}
                    className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {studyBusy && activeStudy?.resource.id === resource.id ? 'Starting…' : 'Start study session'}
                  </button>
                </li>
              ))}
            </ul>
          ) : <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No resources have been published for this course yet. Add verified video or reading links to the backend catalogue.</p>}
          {activeStudy && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div>
                <p className="font-semibold text-emerald-950">Session active: {activeStudy.resource.title}</p>
                <a href={activeStudy.resource.resourceUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-emerald-800 underline">
                  Open this resource
                </a>
              </div>
              <button type="button" onClick={() => void completeStudySession()} disabled={studyBusy} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-bold text-white disabled:opacity-50">
                {studyBusy ? 'Saving…' : 'Finish & earn XP'}
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default MyCourses;