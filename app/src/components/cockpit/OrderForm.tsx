'use client';

import React, { useState } from 'react';
import { MarketMode, OrderSide, OracleState } from '@/lib/types';
import { AlertCircle, ArrowUpRight, ArrowDownLeft, ShieldCheck, Check } from 'lucide-react';

interface Props {
  mode: MarketMode;
  oracle: OracleState;
  baseSymbol: string;
  quoteSymbol: string;
  onPlaceOrder: (side: OrderSide, lotSize: number, limitPrice: number) => { success: boolean; error?: string };
}

export const OrderForm: React.FC<Props> = ({
  mode,
  oracle,
  baseSymbol,
  quoteSymbol,
  onPlaceOrder,
}) => {
  const [side, setSide] = useState<OrderSide>('bid');
  const [lotSizeInput, setLotSizeInput] = useState('10');
  const [priceInput, setPriceInput] = useState(oracle.price.toFixed(2));
  const [placedFeedback, setPlacedFeedback] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isBatchMode = mode === 'batchAuction';
  const lotSizeNum = parseFloat(lotSizeInput) || 0;
  const priceNum = parseFloat(priceInput) || 0;
  const totalValue = lotSizeNum * priceNum;

  // Client-side validation against confidence band
  const isOutOfBand = priceNum > 0 && (priceNum < oracle.minPrice || priceNum > oracle.maxPrice);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isBatchMode) {
      setErrorMsg('Continuous mode active. Batch orders are only permitted in Twilight Batch Auction mode.');
      return;
    }

    if (lotSizeNum <= 0) {
      setErrorMsg('Lot size must be greater than zero.');
      return;
    }

    if (priceNum <= 0) {
      setErrorMsg('Limit price must be positive.');
      return;
    }

    if (isOutOfBand) {
      setErrorMsg(`Limit price $${priceNum.toFixed(2)} exceeds Pyth confidence band [$${oracle.minPrice.toFixed(2)}, $${oracle.maxPrice.toFixed(2)}]. Rejecting client-side before failed transaction.`);
      return;
    }

    const res = onPlaceOrder(side, lotSizeNum, priceNum);
    if (res.success) {
      setPlacedFeedback(true);
      setTimeout(() => setPlacedFeedback(false), 2000);
    } else {
      setErrorMsg(res.error || 'Failed to place order.');
    }
  };

  return (
    <div className="bg-[#131619] border border-[#242A30] rounded-lg p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-[#242A30] pb-3 mb-4">
          <span className="text-xs font-semibold text-[#8A919C] tracking-wide uppercase">
            Submit Limit Order
          </span>
          <span className="text-[11px] font-mono text-zinc-400">
            Escrowed Vault CPI
          </span>
        </div>

        {/* Side Toggle: Buy vs Sell */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#0B0D10] rounded-lg mb-4 border border-[#242A30]">
          <button
            type="button"
            onClick={() => setSide('bid')}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded transition-all ${
              side === 'bid'
                ? 'bg-[#3ECF8E] text-[#0B0D10] shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" /> Buy ({baseSymbol})
          </button>
          <button
            type="button"
            onClick={() => setSide('ask')}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded transition-all ${
              side === 'ask'
                ? 'bg-[#E5544D] text-[#0B0D10] shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" /> Sell ({baseSymbol})
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Lot Size Input */}
          <div>
            <div className="flex justify-between text-[11px] text-[#8A919C] mb-1">
              <span>Lot Size ({baseSymbol})</span>
              <span className="font-mono text-zinc-500">6 Decimals</span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="1"
                min="1"
                value={lotSizeInput}
                onChange={(e) => setLotSizeInput(e.target.value)}
                className="w-full bg-[#1B1F24] border border-[#242A30] rounded px-3 py-2 text-sm font-mono text-white tabular-nums focus:outline-none focus:border-[#5B8DEF]"
                placeholder="10"
              />
              <span className="absolute right-3 top-2.5 text-xs text-zinc-500 font-mono">
                shares
              </span>
            </div>
          </div>

          {/* Limit Price Input */}
          <div>
            <div className="flex justify-between text-[11px] text-[#8A919C] mb-1">
              <span>Limit Price ({quoteSymbol})</span>
              <button
                type="button"
                onClick={() => setPriceInput(oracle.price.toFixed(2))}
                className="text-[10px] text-[#5B8DEF] hover:underline font-mono"
              >
                Use P_ref (${oracle.price.toFixed(2)})
              </button>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                className={`w-full bg-[#1B1F24] border rounded px-3 py-2 text-sm font-mono text-white tabular-nums focus:outline-none ${
                  isOutOfBand
                    ? 'border-[#E5544D] focus:border-[#E5544D]'
                    : 'border-[#242A30] focus:border-[#5B8DEF]'
                }`}
                placeholder="214.50"
              />
              <span className="absolute right-3 top-2.5 text-xs text-zinc-500 font-mono">
                USD
              </span>
            </div>
          </div>

          {/* Real-Time Client-Side Validation Warning Banner */}
          {isOutOfBand && (
            <div className="p-2.5 bg-[#E5544D]/10 border border-[#E5544D]/30 rounded text-[#E5544D] text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-snug">
                <span className="font-semibold block font-mono">
                  OrderPriceExceedsConfidenceBand
                </span>
                Price must stay inside [${oracle.minPrice.toFixed(2)}, ${oracle.maxPrice.toFixed(2)}].
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-2.5 bg-[#E5544D]/10 border border-[#E5544D]/30 rounded text-[#E5544D] text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Estimated Total */}
          <div className="flex justify-between items-center py-2 px-3 bg-[#0B0D10] rounded border border-[#242A30] text-xs font-mono">
            <span className="text-zinc-400">Total Escrow Value:</span>
            <span className="text-white font-bold tabular-nums">
              ${totalValue.toFixed(2)} {quoteSymbol}
            </span>
          </div>

          {/* Submit Button (Gated when mode === continuous) */}
          <button
            type="submit"
            disabled={!isBatchMode || isOutOfBand}
            className={`w-full py-2.5 px-4 rounded font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              placedFeedback
                ? 'bg-[#3ECF8E] text-[#0B0D10]'
                : !isBatchMode
                ? 'bg-[#1B1F24] text-zinc-500 border border-[#242A30] cursor-not-allowed'
                : isOutOfBand
                ? 'bg-[#E5544D]/20 text-[#E5544D] border border-[#E5544D]/40 cursor-not-allowed'
                : side === 'bid'
                ? 'bg-[#3ECF8E] text-[#0B0D10] hover:bg-[#3ECF8E]/90'
                : 'bg-[#E5544D] text-white hover:bg-[#E5544D]/90'
            }`}
          >
            {placedFeedback ? (
              <>
                <Check className="w-4 h-4" /> Order Escrowed!
              </>
            ) : !isBatchMode ? (
              'Continuous Mode (CLMM Swaps Only)'
            ) : isOutOfBand ? (
              'Price Outside Confidence Band'
            ) : (
              `Submit ${side === 'bid' ? 'Bid' : 'Ask'} to Batch`
            )}
          </button>
        </form>
      </div>

      <div className="mt-4 pt-3 border-t border-[#242A30] flex items-center justify-between text-[10px] text-zinc-500 font-mono">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-[#3ECF8E]" />
          Zero-Loss Invariant Escrow
        </span>
        <span>Anchor Fixed u64</span>
      </div>
    </div>
  );
};
