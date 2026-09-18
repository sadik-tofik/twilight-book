'use client';

import React from 'react';
import Link from 'next/link';
import { MarketMode } from '@/lib/types';
import { MarketStateBadge } from './MarketStateBadge';
import { BookOpen, Wallet, ChevronDown } from 'lucide-react';

interface Props {
  mode: MarketMode;
  maxConfBps: number;
  currentConfBps: number;
  baseSymbol: string;
  quoteSymbol: string;
  onSelectPair?: (symbol: string) => void;
}

export const TerminalHeader: React.FC<Props> = ({
  mode,
  maxConfBps,
  currentConfBps,
  baseSymbol,
  quoteSymbol,
}) => {
  return (
    <header className="border-b border-[#242A30] bg-[#0B0D10] sticky top-0 z-40">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Pair */}
        <div className="flex items-center gap-5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-[#3ECF8E] to-[#B98CE8] flex items-center justify-center font-bold text-black text-sm tracking-wider">
              TB
            </div>
            <div>
              <span className="font-bold text-base text-[#EDEFF2] tracking-tight block leading-tight">
                TwilightBook
              </span>
              <span className="text-[10px] text-[#8A919C] font-mono block leading-tight">
                24/7 Tokenized Equities
              </span>
            </div>
          </Link>

          {/* Market Pair Selector */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#131619] border border-[#242A30] text-xs font-mono">
            <span className="text-zinc-500">PAIR:</span>
            <span className="text-white font-bold">{baseSymbol} / {quoteSymbol}</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500 ml-1" />
          </div>
        </div>

        {/* Center: Market State Badge */}
        <div className="hidden md:flex items-center justify-center">
          <MarketStateBadge
            mode={mode}
            maxConfBps={maxConfBps}
            currentConfBps={currentConfBps}
          />
        </div>

        {/* Right: Docs Link & Wallet / Simulation Status */}
        <div className="flex items-center gap-3">
          <Link
            href="/docs"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#131619] hover:bg-[#1B1F24] border border-[#242A30] text-zinc-300 text-xs font-medium transition-colors"
          >
            <BookOpen className="w-4 h-4 text-[#5B8DEF]" />
            <span>Developer Docs</span>
          </Link>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#131619] border border-[#242A30] text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-[#3ECF8E]" />
            <Wallet className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-300 hidden sm:inline">Demo Wallet:</span>
            <span className="text-[#3ECF8E] font-bold">Devnet/Sim</span>
          </div>
        </div>
      </div>
    </header>
  );
};
