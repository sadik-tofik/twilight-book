'use client';

import React, { useState } from 'react';
import { Gavel, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

interface Props {
  isAuctionEnded: boolean;
  clearingPrice: number;
  matchedVolume: number;
  currentEpoch: number;
  onSettle: () => void;
}

export const SettleBar: React.FC<Props> = ({
  isAuctionEnded,
  clearingPrice,
  matchedVolume,
  currentEpoch,
  onSettle,
}) => {
  const [settling, setSettling] = useState(false);

  const handleSettle = () => {
    setSettling(true);
    setTimeout(() => {
      onSettle();
      setSettling(false);
    }, 400);
  };

  const isSettled = clearingPrice > 0;

  return (
    <div className="bg-[#131619] border border-[#242A30] rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg border ${
            isSettled
              ? 'bg-[#3ECF8E]/10 border-[#3ECF8E]/30 text-[#3ECF8E]'
              : 'bg-[#B98CE8]/10 border-[#B98CE8]/30 text-[#B98CE8]'
          }`}
        >
          {isSettled ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <Gavel className="w-5 h-5" />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-[#EDEFF2]">
              {isSettled ? `Epoch #${currentEpoch} Settled` : `Epoch #${currentEpoch} Clearing Engine`}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#1B1F24] border border-[#242A30] text-zinc-400 font-mono">
              Keeper Action
            </span>
          </div>
          <div className="text-xs text-[#8A919C] font-mono mt-0.5">
            {isSettled ? (
              <span className="text-zinc-300">
                Single uniform equilibrium: All trades execute at{' '}
                <strong className="text-[#3ECF8E] font-bold">
                  P* = ${clearingPrice.toFixed(2)}
                </strong>
                , matching{' '}
                <strong className="text-white font-bold">{matchedVolume} shares</strong>.
              </span>
            ) : (
              <span>
                Calculates maximum volume P* with tie-break nearest oracle reference price.
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        {isSettled ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#3ECF8E]/10 border border-[#3ECF8E]/30 text-[#3ECF8E] text-xs font-mono">
            <Sparkles className="w-4 h-4" />
            <span>Auction Settled &amp; Rollover Complete</span>
          </div>
        ) : (
          <button
            onClick={handleSettle}
            disabled={settling}
            className={`w-full md:w-auto px-5 py-2.5 rounded text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              isAuctionEnded
                ? 'bg-[#B98CE8] text-[#0B0D10] hover:bg-[#B98CE8]/90 shadow-lg shadow-[#B98CE8]/20'
                : 'bg-[#B98CE8]/20 text-[#B98CE8] border border-[#B98CE8]/40 hover:bg-[#B98CE8]/30'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            {settling
              ? 'Computing Uniform P* / Q*...'
              : isAuctionEnded
              ? 'Settle Auction Now'
              : 'Trigger Early Keeper Settlement'}
          </button>
        )}
      </div>
    </div>
  );
};
