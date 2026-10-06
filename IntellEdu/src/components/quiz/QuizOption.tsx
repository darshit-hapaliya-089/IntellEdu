import React from 'react';
import { usePerformanceMode } from '../../context/PerformanceModeContext';
import { cx } from '../../utils/cx';

export interface QuizOptionProps {
  index: number;
  text: string;
  isSelected: boolean;
  onSelect: (index: number) => void;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export const QuizOption: React.FC<QuizOptionProps> = ({ index, text, isSelected, onSelect }) => {
  const { highGraphics } = usePerformanceMode();

  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      className={cx(
        'w-full text-left flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer active:scale-[0.99]',
        isSelected
          ? highGraphics
            ? 'border-indigo-500 bg-indigo-50/80 shadow-md shadow-indigo-500/10'
            : 'border-indigo-600 bg-indigo-50'
          : highGraphics
            ? 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
            : 'border-slate-200 bg-white hover:border-slate-400'
      )}
    >
      <span
        className={cx(
          'w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-colors',
          isSelected
            ? highGraphics
              ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white'
              : 'bg-indigo-600 text-white'
            : 'bg-slate-100 text-slate-600'
        )}
      >
        {LETTERS[index] ?? index + 1}
      </span>
      <span className={cx('text-xs sm:text-sm font-semibold leading-snug pt-0.5', isSelected ? 'text-indigo-900' : 'text-slate-700')}>
        {text}
      </span>
    </button>
  );
};

export default QuizOption;
