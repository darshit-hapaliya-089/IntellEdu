import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { FeatureItem } from '../types';
import { usePerformanceMode } from '../context/PerformanceModeContext';
import { cx } from '../utils/cx';

export interface FeatureCardProps {
  item: FeatureItem;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ item }) => {
  const { highGraphics } = usePerformanceMode();
  const Icon = item.icon;

  const colorStyles = {
    indigo: {
      borderHover: 'hover:border-indigo-400/80',
      shadowHover: 'hover:shadow-[0_22px_50px_-12px_rgba(99,102,241,0.28)]',
      glow: 'from-indigo-500/15 to-transparent',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      iconBg: 'bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/30',
      flatIconBg: 'bg-indigo-100 text-indigo-700',
      accentText: 'text-indigo-600'
    },
    emerald: {
      borderHover: 'hover:border-emerald-400/80',
      shadowHover: 'hover:shadow-[0_22px_50px_-12px_rgba(16,185,129,0.28)]',
      glow: 'from-emerald-500/15 to-transparent',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      iconBg: 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/30',
      flatIconBg: 'bg-emerald-100 text-emerald-700',
      accentText: 'text-emerald-600'
    },
    amber: {
      borderHover: 'hover:border-amber-400/80',
      shadowHover: 'hover:shadow-[0_22px_50px_-12px_rgba(245,158,11,0.28)]',
      glow: 'from-amber-500/15 to-transparent',
      badge: 'bg-amber-50 text-amber-700 border-amber-200/80',
      iconBg: 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30',
      flatIconBg: 'bg-amber-100 text-amber-700',
      accentText: 'text-amber-600'
    },
    sky: {
      borderHover: 'hover:border-sky-400/80',
      shadowHover: 'hover:shadow-[0_22px_50px_-12px_rgba(14,165,233,0.28)]',
      glow: 'from-sky-500/15 to-transparent',
      badge: 'bg-sky-50 text-sky-700 border-sky-200/80',
      iconBg: 'bg-gradient-to-tr from-sky-600 to-cyan-500 text-white shadow-lg shadow-sky-500/30',
      flatIconBg: 'bg-sky-100 text-sky-700',
      accentText: 'text-sky-600'
    }
  };

  const style = colorStyles[item.color || 'indigo'];

  return (
    <div
      className={cx(
        'group relative p-5 sm:p-7 rounded-3xl transition-all duration-300 transform-gpu flex flex-col justify-between h-full overflow-hidden cursor-pointer select-none',
        highGraphics
          ? `bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-lg shadow-slate-200/40 hover:-translate-y-2 hover:scale-[1.02] ${style.shadowHover} ${style.borderHover}`
          : 'bg-white border border-slate-200 shadow-none hover:border-slate-400'
      )}
    >
      {/* Top Ambient Light Glow on Hover (High Graphics only) */}
      {highGraphics && (
        <div
          className={cx(
            'absolute -top-16 -right-16 w-36 h-36 rounded-full bg-linear-to-b opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-2xl',
            style.glow
          )}
        />
      )}

      <div>
        {/* Card Header: Icon + Badge */}
        <div className="flex items-start justify-between gap-2 mb-5">
          <div
            className={cx(
              'w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300',
              highGraphics
                ? `${style.iconBg} group-hover:scale-110 group-hover:rotate-6`
                : style.flatIconBg
            )}
          >
            <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>

          {item.badge && (
            <span
              className={cx(
                'px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold border transition-transform duration-300 group-hover:scale-105 whitespace-nowrap shadow-2xs',
                style.badge
              )}
            >
              {item.badge}
            </span>
          )}
        </div>

        {/* Card Title & Description */}
        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mb-2 leading-snug group-hover:text-indigo-950 transition-colors">
          {item.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
          {item.description}
        </p>
      </div>

      {/* Bottom Interactive Explore CTA link */}
      <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
        <span className={cx('text-xs font-bold transition-colors flex items-center gap-1.5', style.accentText)}>
          <span>Explore Feature</span>
          <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1.5 transition-transform duration-300" />
        </span>
        <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-indigo-500 transition-colors duration-300"></div>
      </div>
    </div>
  );
};

export default FeatureCard;
