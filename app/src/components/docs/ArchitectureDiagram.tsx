'use client';

import React from 'react';

export const ArchitectureDiagram: React.FC = () => {
  return (
    <div className="my-6 p-6 rounded-lg border border-[#242A30] bg-[#0B0D10] overflow-x-auto">
      <div className="min-w-[640px]">
        <svg viewBox="0 0 760 320" className="w-full h-auto">
          <defs>
            <linearGradient id="gradCont" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3ECF8E" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3ECF8E" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="gradTwilight" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B98CE8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#B98CE8" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="gradOracle" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5B8DEF" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#5B8DEF" stopOpacity="0.05" />
            </linearGradient>
            <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#8A919C" />
            </marker>
          </defs>

          {/* Background Grid Accent */}
          <rect x="0" y="0" width="760" height="320" fill="transparent" />

          {/* Top Block: Continuous CLMM Swaps */}
          <rect x="40" y="30" width="280" height="100" rx="8" fill="url(#gradCont)" stroke="#3ECF8E" strokeWidth="1.5" />
          <text x="60" y="60" fill="#3ECF8E" fontWeight="bold" fontSize="13" fontFamily="Inter, sans-serif">
            Continuous Swaps (CLMM Mode)
          </text>
          <text x="60" y="82" fill="#EDEFF2" fontSize="11" fontFamily="Inter, sans-serif">
            • High Liquidity, TradFi Market Open
          </text>
          <text x="60" y="102" fill="#8A919C" fontSize="10" fontFamily="'JetBrains Mono', monospace">
            Pyth Conf ≤ 200 bps · Status: Trading
          </text>

          {/* Bottom Block: Twilight Batch Auction */}
          <rect x="40" y="180" width="280" height="110" rx="8" fill="url(#gradTwilight)" stroke="#B98CE8" strokeWidth="1.5" />
          <text x="60" y="210" fill="#B98CE8" fontWeight="bold" fontSize="13" fontFamily="Inter, sans-serif">
            Twilight Batch Auction (Discrete)
          </text>
          <text x="60" y="232" fill="#EDEFF2" fontSize="11" fontFamily="Inter, sans-serif">
            • 32-Order Ring Buffer · Uniform Price P*
          </text>
          <text x="60" y="252" fill="#EDEFF2" fontSize="11" fontFamily="Inter, sans-serif">
            • 10-Slot Anti-Sniping Freeze Window
          </text>
          <text x="60" y="272" fill="#8A919C" fontSize="10" fontFamily="'JetBrains Mono', monospace">
            Pyth Conf &gt; 200 bps OR Halted / Stale
          </text>

          {/* Center Box: Pyth Circuit Evaluator */}
          <rect x="400" y="90" width="320" height="130" rx="8" fill="url(#gradOracle)" stroke="#5B8DEF" strokeWidth="1.5" />
          <text x="420" y="120" fill="#5B8DEF" fontWeight="bold" fontSize="13" fontFamily="Inter, sans-serif">
            evaluate_market_mode (Circuit Evaluator)
          </text>
          <text x="420" y="142" fill="#EDEFF2" fontSize="11" fontFamily="Inter, sans-serif">
            Reads Pyth V2 Price Account binary layout:
          </text>
          <text x="420" y="162" fill="#8A919C" fontSize="10" fontFamily="'JetBrains Mono', monospace">
            • Price (i64, expo -6) &amp; Conf Interval (u64)
          </text>
          <text x="420" y="182" fill="#8A919C" fontSize="10" fontFamily="'JetBrains Mono', monospace">
            • Status (Trading=1, Halted=2, Auction=3)
          </text>
          <text x="420" y="202" fill="#8A919C" fontSize="10" fontFamily="'JetBrains Mono', monospace">
            • Publish Time (staleness &gt;60s check)
          </text>

          {/* Connecting Arrows */}
          <path d="M 400 135 L 330 90" stroke="#8A919C" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
          <path d="M 400 175 L 330 220" stroke="#8A919C" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
        </svg>
      </div>
    </div>
  );
};
