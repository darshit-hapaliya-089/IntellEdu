import React, { useState } from 'react';
import { Coins, Sparkles, Zap } from 'lucide-react';
import { useGamification } from '../../context/GamificationContext';
import { usePerformanceMode } from '../../context/PerformanceModeContext';
import { cx } from '../../utils/cx';
import { XP_PER_TOKEN, formatNumber } from '../../utils/economy';

export interface TokenWalletCardProps {
  /** Compact variant used inside the AI Tutor header. */
  compact?: boolean;
}

const TOKEN_PACKS = [5, 10, 20];

export const TokenWalletCard: React.FC<TokenWalletCardProps> = ({ compact = false }) => {
  const { highGraphics } = usePerformanceMode();
  const { xp, tokens, convertXpToTokens } = useGamification();
  const [selectedPack, setSelectedPack] = useState<number>(TOKEN_PACKS[0]);
  const [flash, setFlash] = useState<string | null>(null);

  const packCost = selectedPack * XP_PER_TOKEN;
  const canAfford = xp >= packCost;

  const handleConvert = () => {
    const result = convertXpToTokens(packCost);
    setFlash(result ? `+${result.tokensGained} tokens added` : 'Not enough XP');
    setTimeout(() => setFlash(null), 1800);
  };

  return (
    <div
      className={cx(
        'rounded-2xl sm:rounded-3xl transition-all',
        compact ? 'p-4' : 'p-4 sm:p-5',
        highGraphics
          ? 'bg-linear-to-br from-indigo-50 to-violet-50 border border-indigo-100 shadow-sm'
          : 'bg-white border border-slate-200'
      )}
    >
      {/* Balances */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cx(
              'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0',
              highGraphics ? 'bg-linear-to-br from-amber-400 to-orange-500 text-white' : 'bg-amber-100 text-amber-600'
            )}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 leading-none">Total XP</p>
            <p className="text-lg font-black text-slate-900 leading-tight">{formatNumber(xp)}</p>
          </div>
        </div>

        <div className="h-10 w-px bg-slate-200" />

        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cx(
              'w-10 h-10 rounded-2xl flex items-center justify-center shrink-0',
              highGraphics ? 'bg-linear-to-br from-sky-500 to-indigo-600 text-white' : 'bg-sky-100 text-sky-600'
            )}
          >
            <Coins className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 leading-none">AI Tokens</p>
            <p className="text-lg font-black text-sky-700 leading-tight">{formatNumber(tokens)}</p>
          </div>
        </div>
      </div>

      {!compact && (
        <p className="text-[11px] text-slate-500 mt-3 leading-snug">
          Convert XP into AI Tutor tokens. Every {XP_PER_TOKEN} XP buys 1 token, and each AI answer costs 1 token.
        </p>
      )}

      {/* Conversion packs */}
      <div className="mt-3.5 space-y-2.5">
        <div className="flex items-center gap-2">
          {TOKEN_PACKS.map((pack) => {
            const isActive = selectedPack === pack;
            return (
              <button
                key={pack}
                type="button"
                onClick={() => setSelectedPack(pack)}
                className={cx(
                  'flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95 border',
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                )}
              >
                +{pack}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleConvert}
          disabled={!canAfford}
          className={cx(
            'w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
            highGraphics
              ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          )}
        >
          <Zap className="w-4 h-4" />
          Buy {selectedPack} tokens for {packCost} XP
        </button>

        {flash && (
          <p className={cx('text-center text-[11px] font-black', flash.startsWith('+') ? 'text-emerald-600' : 'text-rose-600')}>
            {flash}
          </p>
        )}
      </div>
    </div>
  );
};

export default TokenWalletCard;
