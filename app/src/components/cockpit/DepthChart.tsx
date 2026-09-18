'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';

interface Props {
  totalBidVolume: number;
  totalAskVolume: number;
  clearingPrice?: number;
  matchedVolume?: number;
  baseSymbol: string;
}

export const DepthChart: React.FC<Props> = ({
  totalBidVolume,
  totalAskVolume,
  clearingPrice,
  matchedVolume,
  baseSymbol,
}) => {
  const totalVolume = Math.max(1, totalBidVolume + totalAskVolume);
  const bidPercent = Math.round((totalBidVolume / totalVolume) * 100);
  const askPercent = Math.round((totalAskVolume / totalVolume) * 100);

  return (
    <div className="bg-[#131619] border border-[#242A30] rounded-lg p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[#242A30] pb-3 mb-3">
        <span className="text-xs font-semibold text-[#8A919C] tracking-wide uppercase flex items-center gap-1.5">
          <BarChart3 className="w-3.5 h-3.5" /> Batch Order Depth
        </span>
        <span className="text-[11px] font-mono text-zinc-400">
          Matched (Q*):{' '}
          <strong className="text-[#3ECF8E] font-bold">
            {matchedVolume && matchedVolume > 0 ? `${matchedVolume} shares` : 'Pending'}
          </strong>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <span className="text-[11px] text-[#8A919C] uppercase block mb-0.5">
            Total Bids (Demand)
          </span>
          <div className="font-mono text-xl font-bold text-[#3ECF8E] tabular-nums">
            {totalBidVolume} <span className="text-xs text-zinc-500">{baseSymbol}</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">{bidPercent}% of volume</span>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-[#8A919C] uppercase block mb-0.5">
            Total Asks (Supply)
          </span>
          <div className="font-mono text-xl font-bold text-[#E5544D] tabular-nums">
            {totalAskVolume} <span className="text-xs text-zinc-500">{baseSymbol}</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono">{askPercent}% of volume</span>
        </div>
      </div>

      {/* Visual Volume Bar */}
      <div className="space-y-1">
        <div className="h-3 w-full bg-[#0B0D10] rounded overflow-hidden flex border border-[#242A30]">
          <div
            className="h-full bg-[#3ECF8E]/80 transition-all duration-300"
            style={{ width: `${bidPercent}%` }}
          />
          <div
            className="h-full bg-[#E5544D]/80 transition-all duration-300"
            style={{ width: `${askPercent}%` }}
          />
        </div>

        <div className="flex justify-between text-[10px] font-mono text-zinc-500">
          <span>Buyers (Bid)</span>
          {clearingPrice && clearingPrice > 0 ? (
            <span className="text-[#B98CE8] font-bold">P* = ${clearingPrice.toFixed(2)}</span>
          ) : (
            <span>Uniform Equilibrium</span>
          )}
          <span>Sellers (Ask)</span>
        </div>
      </div>
    </div>
  );
};
