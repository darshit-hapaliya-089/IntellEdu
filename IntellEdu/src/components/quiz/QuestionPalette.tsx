import React from 'react';
import { cx } from '../../utils/cx';

export interface QuestionPaletteProps {
  total: number;
  currentIndex: number;
  answers: number[];
  onJump: (index: number) => void;
}

/** A row of numbered dots used to jump between and review questions. */
export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  total,
  currentIndex,
  answers,
  onJump,
}) => {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: total }, (_unused, index) => {
        const isCurrent = index === currentIndex;
        const isAnswered = answers[index] >= 0;
        return (
          <button
            key={index}
            type="button"
            onClick={() => onJump(index)}
            aria-label={`Go to question ${index + 1}`}
            aria-current={isCurrent ? 'true' : undefined}
            className={cx(
              'w-7 h-7 rounded-lg text-[11px] font-black transition-all cursor-pointer',
              isCurrent
                ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                : isAnswered
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            )}
          >
            {index + 1}
          </button>
        );
      })}
    </div>
  );
};

export default QuestionPalette;
