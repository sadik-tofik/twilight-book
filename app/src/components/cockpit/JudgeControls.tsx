'use client';

import React, { useState } from 'react';
import { Sun, Zap, ShieldAlert, Clock, RefreshCw, Terminal, Check } from 'lucide-react';

interface Props {
  onSimulateMarketOpen: () => void;
  onSimulateWeekendShock: () => void;
  onSimulateMarketHalt: () => void;
  onSimulateStaleFeed: () => void;
  onEvaluateMode: () => void;
}

export const JudgeControls: React.FC<Props> = ({
  onSimulateMarketOpen,
  onSimulateWeekendShock,
  onSimulateMarketHalt,
  onSimulateStaleFeed,
  onEvaluateMode,
}) => {
  const [activePreset, setActivePreset] = useState<string>('open');
  const [evalFeedback, setEvalFeedback] = useState(false);

  const handleTrigger = (name: string, fn: () => void) => {
    setActivePreset(name);
    fn();
  };

  const handleManualEval = () => {
    onEvaluateMode();
    setEvalFeedback(true);
    setTimeout(() => setEvalFeedback(false), 1500);
  };

  return (
    <div className="bg-[#131619] border border-[#242A30] rounded-lg p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#242A30] pb-3 mb-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-[#5B8DEF]/10 border border-[#5B8DEF]/30 text-[#5B8DEF]">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#EDEFF2] tracking-wide uppercase">
              Judge Injection Controls
            </span>
            <span className="text-[11px] text-[#8A919C] block">
              PDR §8 Demo Controls — calls setMockOracle & evaluates circuit
            </span>
          </div>
        </div>

        <button
          onClick={handleManualEval}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#1B1F24] hover:bg-[#242A30] border border-[#242A30] text-[#EDEFF2] text-xs font-mono transition-all self-start sm:self-auto"
        >
          {evalFeedback ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#3ECF8E]" /> Evaluated!
            </>
          ) : (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-[#5B8DEF]" /> evaluate_market_mode()
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Button 1: Market Open */}
        <button
          onClick={() => handleTrigger('open', onSimulateMarketOpen)}
          className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition-all ${
            activePreset === 'open'
              ? 'bg-[#3ECF8E]/10 border-[#3ECF8E]/50 ring-1 ring-[#3ECF8E]/40'
              : 'bg-[#1B1F24] border-[#242A30] hover:border-zinc-600'
          }`}
        >
          <Sun className="w-4 h-4 text-[#3ECF8E] mt-0.5 shrink-0" />
          <div>
            <div className="font-bold text-xs text-[#EDEFF2]">Simulate Market Open</div>
            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
              price=$214.50, conf=0.20 (9.3 bps)
            </div>
            <span className="text-[9px] text-[#3ECF8E] font-semibold block mt-1 uppercase">
              → Continuous Mode
            </span>
          </div>
        </button>

        {/* Button 2: Weekend Shock */}
        <button
          onClick={() => handleTrigger('shock', onSimulateWeekendShock)}
          className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition-all ${
            activePreset === 'shock'
              ? 'bg-[#B98CE8]/10 border-[#B98CE8]/50 ring-1 ring-[#B98CE8]/40'
              : 'bg-[#1B1F24] border-[#242A30] hover:border-zinc-600'
          }`}
        >
          <Zap className="w-4 h-4 text-[#B98CE8] mt-0.5 shrink-0" />
          <div>
            <div className="font-bold text-xs text-[#EDEFF2]">Simulate Weekend Shock</div>
            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
              price=$214.50, conf=6.00 (2798 bps)
            </div>
            <span className="text-[9px] text-[#B98CE8] font-semibold block mt-1 uppercase">
              → Batch Auction Mode
            </span>
          </div>
        </button>

        {/* Button 3: Market Halt */}
        <button
          onClick={() => handleTrigger('halt', onSimulateMarketHalt)}
          className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition-all ${
            activePreset === 'halt'
              ? 'bg-[#E5544D]/10 border-[#E5544D]/50 ring-1 ring-[#E5544D]/40'
              : 'bg-[#1B1F24] border-[#242A30] hover:border-zinc-600'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-[#E5544D] mt-0.5 shrink-0" />
          <div>
            <div className="font-bold text-xs text-[#EDEFF2]">Simulate Market Halt</div>
            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
              status=2 (Halted), Pyth halt
            </div>
            <span className="text-[9px] text-[#E5544D] font-semibold block mt-1 uppercase">
              → Batch Auction Mode
            </span>
          </div>
        </button>

        {/* Button 4: Stale Feed */}
        <button
          onClick={() => handleTrigger('stale', onSimulateStaleFeed)}
          className={`flex items-start gap-2.5 p-3 rounded-lg border text-left transition-all ${
            activePreset === 'stale'
              ? 'bg-[#E5544D]/10 border-[#E5544D]/50 ring-1 ring-[#E5544D]/40'
              : 'bg-[#1B1F24] border-[#242A30] hover:border-zinc-600'
          }`}
        >
          <Clock className="w-4 h-4 text-[#E5544D] mt-0.5 shrink-0" />
          <div>
            <div className="font-bold text-xs text-[#EDEFF2]">Simulate Stale Feed</div>
            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
              publish_time &gt;60s in the past
            </div>
            <span className="text-[9px] text-[#E5544D] font-semibold block mt-1 uppercase">
              → Batch Auction Mode
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
