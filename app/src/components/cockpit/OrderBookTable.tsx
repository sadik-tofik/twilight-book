'use client';

import React from 'react';
import { BatchOrder, BatchStatus } from '@/lib/types';
import { Lock, CheckCircle, Clock, XCircle, ArrowUpRight, ArrowDownLeft, Gift } from 'lucide-react';

interface Props {
  orders: BatchOrder[];
  status: BatchStatus;
  currentSlot: number;
  endSlot: number;
  clearingPrice: number;
  onCancelOrder: (index: number) => { success: boolean; error?: string } | Promise<{ success: boolean; error?: string } | void>;
  onClaimProceeds: (index: number) => { success: boolean; error?: string } | Promise<{ success: boolean; error?: string } | void>;
}

export const OrderBookTable: React.FC<Props> = ({
  orders,
  status,
  currentSlot,
  endSlot,
  clearingPrice,
  onCancelOrder,
  onClaimProceeds,
}) => {
  const isSettled = status === 'settled';
  const slotsRemaining = Math.max(0, endSlot - currentSlot);
  const isFrozen = slotsRemaining <= 10 && slotsRemaining > 0;

  // Filter out non-existent or cancelled orders
  const activeOrders = orders.filter((o) => o.lotSize > 0);

  return (
    <div className="bg-[#131619] border border-[#242A30] rounded-lg p-4">
      <div className="flex items-center justify-between border-b border-[#242A30] pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#8A919C] tracking-wide uppercase">
            Active Epoch Orders
          </span>
          <span className="text-[11px] font-mono text-zinc-400">
            ({activeOrders.length} / 32 Ring Buffer)
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono">
          {isSettled ? (
            <span className="text-[#3ECF8E] flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Batch Cleared at P* = ${clearingPrice.toFixed(2)}
            </span>
          ) : isFrozen ? (
            <span className="text-[#E5544D] flex items-center gap-1">
              <Lock className="w-3 h-3" /> Cancellations Locked (Freeze Window)
            </span>
          ) : (
            <span className="text-zinc-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Cancellation Window Open
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#242A30] text-[11px] text-[#8A919C] font-mono uppercase tracking-wider">
              <th className="py-2 px-3">#</th>
              <th className="py-2 px-3">Trader</th>
              <th className="py-2 px-3">Side</th>
              <th className="py-2 px-3 text-right">Shares</th>
              <th className="py-2 px-3 text-right">Limit Price</th>
              <th className="py-2 px-3 text-right">Filled</th>
              <th className="py-2 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1B1F24] font-mono text-xs tabular-nums">
            {activeOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-zinc-500 font-mono text-xs">
                  No batch orders placed in this epoch yet.
                </td>
              </tr>
            ) : (
              activeOrders.map((order) => {
                const isBid = order.side === 'bid';
                const hasSurplusRefund =
                  isSettled &&
                  isBid &&
                  order.filledLotSize > 0 &&
                  order.limitPrice > clearingPrice;
                const surplusAmount = hasSurplusRefund
                  ? (order.limitPrice - clearingPrice) * order.filledLotSize
                  : 0;

                return (
                  <tr key={order.index} className="hover:bg-[#1B1F24]/50 transition-colors">
                    <td className="py-2.5 px-3 text-zinc-500">{order.index}</td>
                    <td className="py-2.5 px-3 text-zinc-300 font-medium">{order.user}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isBid
                            ? 'bg-[#3ECF8E]/10 text-[#3ECF8E]'
                            : 'bg-[#E5544D]/10 text-[#E5544D]'
                        }`}
                      >
                        {isBid ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownLeft className="w-3 h-3" />
                        )}
                        {isBid ? 'BID' : 'ASK'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#EDEFF2]">{order.lotSize}</td>
                    <td className="py-2.5 px-3 text-right text-zinc-300">
                      ${order.limitPrice.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {isSettled ? (
                        <span
                          className={
                            order.filledLotSize > 0
                              ? 'text-[#3ECF8E] font-bold'
                              : 'text-zinc-500'
                          }
                        >
                          {order.filledLotSize} / {order.lotSize}
                        </span>
                      ) : (
                        <span className="text-zinc-500">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {isSettled ? (
                        order.claimed ? (
                          <span className="text-zinc-500 text-[11px]">Claimed</span>
                        ) : (
                          <button
                            onClick={() => onClaimProceeds(order.index)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#5B8DEF]/20 hover:bg-[#5B8DEF]/30 text-[#5B8DEF] border border-[#5B8DEF]/40 text-[11px] font-bold transition-all"
                          >
                            <Gift className="w-3 h-3" />
                            Claim {hasSurplusRefund && `(+$${surplusAmount.toFixed(2)})`}
                          </button>
                        )
                      ) : (
                        <button
                          disabled={isFrozen}
                          onClick={() => onCancelOrder(order.index)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium border transition-all ${
                            isFrozen
                              ? 'text-zinc-600 border-zinc-800 cursor-not-allowed'
                              : 'text-[#E5544D] border-[#E5544D]/30 hover:bg-[#E5544D]/10'
                          }`}
                        >
                          <XCircle className="w-3 h-3" />
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
