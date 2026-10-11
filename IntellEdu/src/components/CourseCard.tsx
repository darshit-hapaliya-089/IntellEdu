import React from 'react';
import { PlayCircle, BookOpen, Star } from 'lucide-react';
import { Course } from '../types';
import { usePerformanceMode } from '../context/PerformanceModeContext';
import { cx } from '../utils/cx';

export interface CourseCardProps {
  course: Course;
  onResume?: (courseId: string) => void;
  actionLabel?: string;
  actionDisabled?: boolean;
  className?: string;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onResume,
  actionLabel = 'Resume Learning',
  actionDisabled = false,
  className = '',
}) => {
  const { highGraphics } = usePerformanceMode();

  return (
    <div
      className={cx(
        'group w-full rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between',
        highGraphics
          ? 'bg-white border border-slate-100 shadow-md shadow-slate-200/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10'
          : 'bg-white border border-slate-200 shadow-none',
        className
      )}
    >
      <div className="relative h-40 sm:h-44 md:h-48 overflow-hidden bg-slate-900 shrink-0">
        <img
          src={course.image || '/intelledu-logo.png'}
          alt={course.title}
          data-no-translate
          loading="lazy"
          className={cx(
            'w-full h-full object-cover transition-transform duration-500',
            highGraphics ? 'group-hover:scale-105 opacity-90' : 'opacity-85'
          )}
        />
        <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold text-indigo-300 border border-slate-700/60 shadow-xs">
          <span data-no-translate>{course.category}</span>
        </div>
        <div className="absolute bottom-3 right-3 bg-slate-900/85 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-[11px] sm:text-xs font-bold text-amber-400 flex items-center gap-1 border border-slate-700/60 shadow-xs">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span>{course.rating ?? '—'}</span>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 space-y-4">
        <div>
          <h4 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-2 mb-2.5 group-hover:text-indigo-600 transition-colors leading-snug" data-no-translate>
            {course.title}
          </h4>

          <div className="mb-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>{course.completedLessons}/{course.totalLessons} Lessons</span>
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-600 text-[11px]">Progress</span>
              <span className="text-indigo-600 font-bold text-[11px]">{course.progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 sm:h-2.5 rounded-full overflow-hidden">
              <div
                className={cx(
                  'h-full rounded-full transition-all duration-500',
                  highGraphics ? 'bg-linear-to-r from-indigo-500 to-violet-600' : 'bg-indigo-600'
                )}
                style={{ width: `${course.progressPercent}%` }}
              >
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => onResume?.(course.id)}
          disabled={actionDisabled || !onResume}
          type="button"
          className={cx(
            'w-full py-2.5 sm:py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 shadow-sm',
            highGraphics
              ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-101'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          )}
        >
          <PlayCircle className="w-4 h-4 shrink-0" />
          <span>{actionLabel}</span>
        </button>
      </div>
    </div>
  );
};

export default CourseCard;
