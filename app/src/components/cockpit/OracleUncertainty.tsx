'use client';

import React from 'react';
import { OracleState } from '@/lib/types';
import { ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

interface Props {
  oracle: OracleState;
  k: number;
}

export const OracleUncertainty: React.FC<Props> = ({ oracle, k }) => {
  const isHalted = oracle.status === 2;
  const isTrading = oracle.status === 1;

  return (
    <div className="bg-[#131619] border border-[#242A30] rounded-lg p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-[#242A30] pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#8A919C] tracking-wide uppercase">
            Pyth Oracle Reference
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1B1F24] text-[#8A919C] font-mono">
            V2 Price Feed
          </span>
        </div>

        <div className="flex items-center gap-2">
          {oracle.isStale && (
            <span className="flex items-center gap-1 text-[11px] text-[#E5544D] bg-[#E5544D]/10 px-2 py-0.5 rounded border border-[#E5544D]/30">
              <Clock className="w-3 h-3" /> Stale (&gt;60s)
            </span>
          )}

          <span
            className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${
              isTrading
                ? 'bg-[#3ECF8E]/10 border-[#3ECF8E]/30 text-[#3ECF8E]'
                : isHalted
                ? 'bg-[#E5544D]/10 border-[#E5544D]/30 text-[#E5544D]'
                : 'bg-zinc-800 border-zinc-700 text-zinc-300'
            }`}
          >
            {isTrading ? (
              <CheckCircle2 className="w-3 h-3" />
            ) : (
              <ShieldAlert className="w-3 h-3" />
            )}
            {oracle.statusName}
          </span>
        </div>
      </div>

      {/* Main Numbers: Price & Confidence */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <span className="text-[11px] text-[#8A919C] uppercase block mb-1">
            Reference Price (P_ref)
          </span>
          <div className="font-mono text-2xl font-bold text-[#EDEFF2] tabular-nums tracking-tight">
            ${oracle.price.toFixed(2)}
          </div>
        </div>

        <div>
          <span className="text-[11px] text-[#8A919C] uppercase block mb-1">
            Confidence Interval (±σ)
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={`font-mono text-2xl font-bold tabular-nums tracking-tight ${
                oracle.confBps > 200 ? 'text-[#B98CE8]' : 'text-[#3ECF8E]'
              }`}
            >
              ±${oracle.conf.toFixed(2)}
            </span>
            <span className="font-mono text-xs text-[#8A919C] tabular-nums">
              ({oracle.confBps.toFixed(1)} bps)
            </span>
          </div>
        </div>
      </div>

      {/* Visual Bounded Trade Envelope Band */}
      <div className="bg-[#1B1F24] rounded border border-[#242A30] p-3">
        <div className="flex items-center justify-between text-[11px] text-[#8A919C] mb-1.5">
          <span className="flex items-center gap-1">
            <span>Filter Band (k={k})</span>
            <span className="text-[10px] text-zinc-500 font-mono">[P_ref ± {k}σ]</span>
          </span>
          <span className="font-mono tabular-nums text-zinc-300">
            ${oracle.minPrice.toFixed(2)} — ${oracle.maxPrice.toFixed(2)}
          </span>
        </div>

        {/* Visual progress bar representation of band */}
        <div className="relative h-2 w-full bg-[#0B0D10] rounded-full overflow-hidden border border-[#242A30]">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              oracle.confBps > 200 ? 'bg-[#B98CE8]' : 'bg-[#3ECF8E]'
            }`}
            style={{
              width: `${Math.min(100, Math.max(15, (oracle.confBps / 400) * 100))}%`,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono mt-1">
          <span>Min: ${oracle.minPrice.toFixed(2)}</span>
          <span className="text-zinc-400">Target: ${oracle.price.toFixed(2)}</span>
          <span>Max: ${oracle.maxPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
