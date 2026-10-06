import React from 'react';
import { TrendingUp } from 'lucide-react';
import { WeeklyPoint } from '../../types/progress';
import { usePerformanceMode } from '../../context/PerformanceModeContext';
import { cx } from '../../utils/cx';

export interface WeeklyTrendChartProps {
  points: WeeklyPoint[];
}

const WIDTH = 320;
const HEIGHT = 110;
const PAD = 12;

export const WeeklyTrendChart: React.FC<WeeklyTrendChartProps> = ({ points }) => {
  const { highGraphics } = usePerformanceMode();
  const maxXp = Math.max(10, ...points.map((p) => p.xp));
  const stepX = points.length > 1 ? (WIDTH - PAD * 2) / (points.length - 1) : 0;

  const coords = points.map((point, index) => {
    const x = PAD + index * stepX;
    const y = HEIGHT - PAD - (point.xp / maxXp) * (HEIGHT - PAD * 2);
    return { x, y, point };
  });

  const linePath = coords.map((c) => `${c.x},${c.y}`).join(' ');
  const areaPath = `${PAD},${HEIGHT - PAD} ${linePath} ${WIDTH - PAD},${HEIGHT - PAD}`;
  const weekTotal = points.reduce((sum, p) => sum + p.xp, 0);

  return (
    <div
      className={cx(
        'p-4 sm:p-5 rounded-2xl sm:rounded-3xl',
        highGraphics ? 'bg-white/90 border border-slate-200/80 shadow-sm' : 'bg-white border border-slate-200'
      )}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-violet-600" />
          <h3 className="text-sm font-extrabold text-slate-900">This Week</h3>
        </div>
        <span className="text-sm font-black text-violet-600">{weekTotal.toLocaleString()} XP</span>
      </div>

      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-28" preserveAspectRatio="none">
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPath} fill="url(#trendFill)" />
        <polyline
          points={linePath}
          fill="none"
          stroke={highGraphics ? '#7c3aed' : '#6d28d9'}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {coords.map((c) => (
          <circle key={c.point.label + c.x} cx={c.x} cy={c.y} r="3.5" fill="#7c3aed" />
        ))}
      </svg>

      <div className="flex items-center justify-between gap-1 mt-1">
        {coords.map((c) => (
          <span key={c.point.label + c.x} className="flex-1 text-center text-[10px] font-semibold text-slate-400">
            {c.point.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default WeeklyTrendChart;
