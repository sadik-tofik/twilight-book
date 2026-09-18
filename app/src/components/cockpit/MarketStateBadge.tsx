'use client';

import React from 'react';
import { MarketMode } from '@/lib/types';
import { Activity, Moon } from 'lucide-react';

interface Props {
  mode: MarketMode;
  maxConfBps: number;
  currentConfBps: number;
}

export const MarketStateBadge: React.FC<Props> = ({ mode, maxConfBps, currentConfBps }) => {
  const isContinuous = mode === 'continuous';

  return (
    <div
      className={`relative inline-flex items-center gap-3 px-4 py-2.5 rounded-full border transition-all duration-200 ${
        isContinuous
          ? 'bg-[#3ECF8E]/10 border-[#3ECF8E]/30 text-[#3ECF8E]'
          : 'bg-[#B98CE8]/10 border-[#B98CE8]/30 text-[#B98CE8]'
      }`}
    >
      <div className="relative flex items-center justify-center">
        <span
          className={`absolute w-3 h-3 rounded-full animate-ping opacity-75 ${
            isContinuous ? 'bg-[#3ECF8E]' : 'bg-[#B98CE8]'
          }`}
        />
        <span
          className={`relative w-2.5 h-2.5 rounded-full ${
            isContinuous ? 'bg-[#3ECF8E]' : 'bg-[#B98CE8]'
          }`}
        />
      </div>

      <div className="flex items-center gap-2">
        {isContinuous ? (
          <Activity className="w-4 h-4 text-[#3ECF8E]" />
        ) : (
          <Moon className="w-4 h-4 text-[#B98CE8]" />
        )}
        <span className="font-semibold text-xs tracking-wider uppercase">
          {isContinuous ? 'Continuous Trading (CLMM)' : 'Twilight Batch Auction'}
        </span>
      </div>

      <span className="hidden sm:inline-block text-[11px] text-zinc-400 border-l border-zinc-700/60 pl-2">
        {isContinuous
          ? `Conf: ${currentConfBps.toFixed(1)} bps (≤ ${maxConfBps} bps)`
          : `Uncertainty Triggered: ${currentConfBps.toFixed(1)} bps (> ${maxConfBps} bps)`}
      </span>
    </div>
  );
};
