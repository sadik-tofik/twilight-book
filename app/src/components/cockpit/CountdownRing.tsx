'use client';

import React, { useEffect, useState } from 'react';
import { Lock, Timer } from 'lucide-react';

interface Props {
  startSlot: number;
  endSlot: number;
  currentSlot: number;
  status: string;
  onTimerZero?: () => void;
}

export const CountdownRing: React.FC<Props> = ({
  startSlot,
  endSlot,
  currentSlot,
  status,
  onTimerZero,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(() => {
    const slots = Math.max(0, endSlot - currentSlot);
    return Math.round(slots * 0.4);
  });

  useEffect(() => {
    const totalSlots = Math.max(1, endSlot - startSlot);
    const slotsRemaining = Math.max(0, endSlot - currentSlot);
    const initialSec = Math.round(slotsRemaining * 0.4);
    setSecondsRemaining(initialSec);

    if (slotsRemaining <= 0) {
      if (onTimerZero) onTimerZero();
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (onTimerZero) onTimerZero();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [startSlot, endSlot, currentSlot, onTimerZero]);

  const slotsRemaining = Math.max(0, endSlot - currentSlot);
  const totalSlots = Math.max(1, endSlot - startSlot);
  const progressPercent = Math.min(100, Math.max(0, ((totalSlots - slotsRemaining) / totalSlots) * 100));

  // Anti-sniping freeze window is active when slotsRemaining <= 10
  const isFrozenWindow = slotsRemaining <= 10 && slotsRemaining > 0;
  const isEnded = slotsRemaining === 0 || secondsRemaining === 0;

  // SVG Ring dimensions
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="bg-[#131619] border border-[#242A30] rounded-lg p-4 flex flex-col items-center justify-between">
      <div className="w-full flex items-center justify-between border-b border-[#242A30] pb-3 mb-2">
        <span className="text-xs font-semibold text-[#8A919C] tracking-wide uppercase flex items-center gap-1.5">
          <Timer className="w-3.5 h-3.5" /> Epoch Auction Timer
        </span>
        <span className="text-[11px] font-mono text-zinc-400">
          Slot {currentSlot} / {endSlot}
        </span>
      </div>

      <div className="relative flex items-center justify-center my-2">
        <svg className="w-24 h-24 transform -rotate-90">
          {/* Background Track */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="#242A30"
            strokeWidth="6"
            fill="transparent"
          />
          {/* Progress Ring */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke={isEnded ? '#3ECF8E' : isFrozenWindow ? '#E5544D' : '#B98CE8'}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="font-mono text-2xl font-bold tabular-nums text-[#EDEFF2]">
            {secondsRemaining}s
          </span>
          <span className="text-[10px] text-[#8A919C] font-mono uppercase tracking-wider">
            {isEnded ? 'Ready' : `${slotsRemaining} slots`}
          </span>
        </div>
      </div>

      {/* Freeze Window or Status Banner */}
      <div className="w-full mt-2">
        {isFrozenWindow ? (
          <div className="flex items-center justify-center gap-1.5 py-1 px-2 rounded bg-[#E5544D]/10 border border-[#E5544D]/30 text-[#E5544D] text-[11px] font-mono">
            <Lock className="w-3 h-3" />
            <span>Freeze Window Active (&lt;10 slots)</span>
          </div>
        ) : isEnded ? (
          <div className="flex items-center justify-center gap-1.5 py-1 px-2 rounded bg-[#3ECF8E]/10 border border-[#3ECF8E]/30 text-[#3ECF8E] text-[11px] font-mono">
            <span>Auction Closed · Ready to Settle</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-1 text-[11px] text-[#8A919C] font-mono">
            <span>Accepting Orders (~400ms / slot)</span>
          </div>
        )}
      </div>
    </div>
  );
};
