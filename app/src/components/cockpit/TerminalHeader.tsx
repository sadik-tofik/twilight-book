'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MarketMode } from '@/lib/types';
import { MarketStateBadge } from './MarketStateBadge';
import { BookOpen, Wallet, ChevronDown, ExternalLink, Radio, Zap } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { PROGRAM_ID } from '@/lib/solanaConfig';

interface Props {
  mode: MarketMode;
  maxConfBps: number;
  currentConfBps: number;
  baseSymbol: string;
  quoteSymbol: string;
  isLiveDevnet?: boolean;
  onToggleLiveDevnet?: () => void;
  onSelectPair?: (symbol: string) => void;
}

export const TerminalHeader: React.FC<Props> = ({
  mode,
  maxConfBps,
  currentConfBps,
  baseSymbol,
  quoteSymbol,
  isLiveDevnet = false,
  onToggleLiveDevnet,
}) => {
  const [mounted, setMounted] = useState(false);
  const { publicKey, disconnect, connected, connecting } = useWallet();
  const { setVisible } = useWalletModal();

  useEffect(() => {
    setMounted(true);
  }, []);

  const truncatedAddress = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : null;

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

          {/* Devnet Program ID link */}
          <a
            href={`https://explorer.solana.com/address/${PROGRAM_ID.toBase58()}?cluster=devnet`}
            target="_blank"
            rel="noreferrer"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#131619] border border-[#242A30] hover:border-zinc-600 text-[11px] font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
            title="View Deployed Program on Solana Explorer (Devnet)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#3ECF8E]" />
            <span>Devnet: {PROGRAM_ID.toBase58().slice(0, 4)}...{PROGRAM_ID.toBase58().slice(-4)}</span>
            <ExternalLink className="w-3 h-3 text-zinc-500" />
          </a>
        </div>

        {/* Center: Market State Badge */}
        <div className="hidden md:flex items-center justify-center">
          <MarketStateBadge
            mode={mode}
            maxConfBps={maxConfBps}
            currentConfBps={currentConfBps}
          />
        </div>

        {/* Right: Mode Switcher, Docs Link & Wallet Button */}
        <div className="flex items-center gap-2.5">
          {/* Mode Switcher: Live Devnet vs Instant Sim */}
          {onToggleLiveDevnet && (
            <button
              onClick={onToggleLiveDevnet}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                isLiveDevnet
                  ? 'bg-[#3ECF8E]/10 border-[#3ECF8E]/50 text-[#3ECF8E]'
                  : 'bg-[#131619] border-[#242A30] text-zinc-400 hover:text-zinc-200'
              }`}
              title="Toggle between Live On-Chain Devnet execution and instant client-side simulation"
            >
              {isLiveDevnet ? (
                <>
                  <Radio className="w-3 h-3 animate-pulse text-[#3ECF8E]" />
                  <span className="font-bold">LIVE DEVNET</span>
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3 text-[#B98CE8]" />
                  <span>INSTANT SIM</span>
                </>
              )}
            </button>
          )}

          <Link
            href="/docs"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#131619] hover:bg-[#1B1F24] border border-[#242A30] text-zinc-300 text-xs font-medium transition-colors"
          >
            <BookOpen className="w-4 h-4 text-[#5B8DEF]" />
            <span>Docs</span>
          </Link>

          {/* Real Solana Wallet Adapter Button */}
          {mounted && (
            connected && publicKey ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setVisible(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#131619] hover:bg-[#1B1F24] border border-[#3ECF8E]/40 text-xs font-mono text-[#EDEFF2] transition-colors"
                  title="Click to change wallet"
                >
                  <span className="w-2 h-2 rounded-full bg-[#3ECF8E] animate-ping" />
                  <Wallet className="w-3.5 h-3.5 text-[#3ECF8E]" />
                  <span className="font-bold text-[#3ECF8E]">{truncatedAddress}</span>
                </button>
                <button
                  onClick={() => disconnect()}
                  className="px-2 py-1.5 rounded-lg bg-[#131619] hover:bg-[#1B1F24] border border-[#242A30] text-[11px] text-zinc-500 hover:text-rose-400 transition-colors"
                  title="Disconnect Wallet"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setVisible(true)}
                disabled={connecting}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#3ECF8E] hover:bg-[#32B47A] text-black text-xs font-bold font-mono transition-transform hover:scale-[1.02] shadow-sm"
              >
                <Wallet className="w-3.5 h-3.5" />
                <span>{connecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )
          )}
        </div>
      </div>
    </header>
  );
};

