'use client';

import React, { useState } from 'react';
import { TerminalHeader } from '@/components/cockpit/TerminalHeader';
import { OracleUncertainty } from '@/components/cockpit/OracleUncertainty';
import { CountdownRing } from '@/components/cockpit/CountdownRing';
import { DepthChart } from '@/components/cockpit/DepthChart';
import { OrderForm } from '@/components/cockpit/OrderForm';
import { OrderBookTable } from '@/components/cockpit/OrderBookTable';
import { JudgeControls } from '@/components/cockpit/JudgeControls';
import { SettleBar } from '@/components/cockpit/SettleBar';
import {
  INITIAL_ORACLE,
  INITIAL_MARKET,
  INITIAL_BATCH,
  solveUniformPrice,
} from '@/lib/simulationStore';
import { createMockPythState } from '@/lib/mockPythDecoder';
import { OrderSide, BatchOrder } from '@/lib/types';

export default function CockpitPage() {
  const [market, setMarket] = useState(INITIAL_MARKET);
  const [oracle, setOracle] = useState(INITIAL_ORACLE);
  const [batch, setBatch] = useState(INITIAL_BATCH);

  // Evaluate market circuit logic based on live Pyth state
  const evaluateCircuit = (currentOracle = oracle) => {
    let targetMode = market.mode;
    if (currentOracle.status !== 1 || currentOracle.isStale || currentOracle.confBps > market.maxConfBps) {
      targetMode = 'batchAuction';
    } else {
      targetMode = 'continuous';
    }
    setMarket((prev) => ({ ...prev, mode: targetMode }));
  };

  // Demo Control Handlers
  const handleSimulateMarketOpen = () => {
    // Normal Trading, tight confidence (0.20 USD -> 9.3 bps <= 200 bps)
    const newOracle = createMockPythState(214.50, 0.20, 1, undefined, market.confFilterMult);
    setOracle(newOracle);
    evaluateCircuit(newOracle);
  };

  const handleSimulateWeekendShock = () => {
    // Weekend shock: wide confidence (6.00 USD -> 2797 bps > 200 bps)
    const newOracle = createMockPythState(214.50, 6.00, 1, undefined, market.confFilterMult);
    setOracle(newOracle);
    evaluateCircuit(newOracle);
  };

  const handleSimulateMarketHalt = () => {
    // Market Halted status = 2
    const newOracle = createMockPythState(214.50, 0.20, 2, undefined, market.confFilterMult);
    setOracle(newOracle);
    evaluateCircuit(newOracle);
  };

  const handleSimulateStaleFeed = () => {
    // Stale feed: publishTime > 60s in the past (300s ago)
    const pastTime = Math.floor(Date.now() / 1000) - 300;
    const newOracle = createMockPythState(214.50, 0.20, 1, pastTime, market.confFilterMult);
    setOracle(newOracle);
    evaluateCircuit(newOracle);
  };

  // Order Placement
  const handlePlaceOrder = (side: OrderSide, lotSize: number, limitPrice: number) => {
    if (batch.orders.length >= 32) {
      return { success: false, error: 'Epoch batch ring buffer full (max 32 orders).' };
    }

    const factor = BigInt(1_000_000);
    const newOrder: BatchOrder = {
      index: batch.orders.length,
      user: `Trader...${Math.random().toString(36).substring(2, 6)}`,
      side,
      lotSize,
      lotSizeRaw: BigInt(Math.round(lotSize)) * factor,
      limitPrice,
      limitPriceRaw: BigInt(Math.round(limitPrice * 1_000_000)),
      filledLotSize: 0,
      claimed: false,
      timestamp: Date.now(),
    };

    const updatedOrders = [...batch.orders, newOrder];
    const totalBid = updatedOrders
      .filter((o) => o.side === 'bid' && o.lotSize > 0)
      .reduce((sum, o) => sum + o.lotSize, 0);
    const totalAsk = updatedOrders
      .filter((o) => o.side === 'ask' && o.lotSize > 0)
      .reduce((sum, o) => sum + o.lotSize, 0);

    setBatch((prev) => ({
      ...prev,
      orders: updatedOrders,
      orderCount: updatedOrders.length,
      totalBidVolume: totalBid,
      totalAskVolume: totalAsk,
    }));

    return { success: true };
  };

  // Order Cancellation (with anti-sniping freeze window check)
  const handleCancelOrder = (index: number) => {
    const slotsRemaining = Math.max(0, batch.endSlot - batch.currentSlot);
    if (slotsRemaining <= 10 && slotsRemaining > 0) {
      return { success: false, error: 'Freeze window active (<10 slots). Cancellations locked.' };
    }

    const updatedOrders = batch.orders.map((o) =>
      o.index === index ? { ...o, lotSize: 0, lotSizeRaw: BigInt(0) } : o
    );

    const totalBid = updatedOrders
      .filter((o) => o.side === 'bid' && o.lotSize > 0)
      .reduce((sum, o) => sum + o.lotSize, 0);
    const totalAsk = updatedOrders
      .filter((o) => o.side === 'ask' && o.lotSize > 0)
      .reduce((sum, o) => sum + o.lotSize, 0);

    setBatch((prev) => ({
      ...prev,
      orders: updatedOrders,
      totalBidVolume: totalBid,
      totalAskVolume: totalAsk,
    }));

    return { success: true };
  };

  // Settlement execution
  const handleSettle = () => {
    const result = solveUniformPrice(batch.orders, oracle.price);
    setBatch((prev) => ({
      ...prev,
      status: 'settled',
      clearingPrice: result.clearingPrice,
      matchedVolume: result.matchedVolume,
      orders: result.filledOrders,
      currentSlot: prev.endSlot,
    }));
  };

  // Claim proceeds handler
  const handleClaim = (index: number) => {
    setBatch((prev) => ({
      ...prev,
      orders: prev.orders.map((o) =>
        o.index === index ? { ...o, claimed: true } : o
      ),
    }));
    return { success: true };
  };

  const isAuctionEnded = batch.currentSlot >= batch.endSlot || batch.status === 'settled';

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#EDEFF2] flex flex-col font-sans">
      <TerminalHeader
        mode={market.mode}
        maxConfBps={market.maxConfBps}
        currentConfBps={oracle.confBps}
        baseSymbol={market.baseSymbol}
        quoteSymbol={market.quoteSymbol}
      />

      <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 flex-1 space-y-6">
        {/* Judge Injection Controls Panel */}
        <JudgeControls
          onSimulateMarketOpen={handleSimulateMarketOpen}
          onSimulateWeekendShock={handleSimulateWeekendShock}
          onSimulateMarketHalt={handleSimulateMarketHalt}
          onSimulateStaleFeed={handleSimulateStaleFeed}
          onEvaluateMode={() => evaluateCircuit()}
        />

        {/* Top 3-Card Analytics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <OracleUncertainty oracle={oracle} k={market.confFilterMult} />
          <CountdownRing
            startSlot={batch.startSlot}
            endSlot={batch.endSlot}
            currentSlot={batch.currentSlot}
            status={batch.status}
            onTimerZero={() => {
              setBatch((prev) => ({ ...prev, currentSlot: prev.endSlot }));
            }}
          />
          <DepthChart
            totalBidVolume={batch.totalBidVolume}
            totalAskVolume={batch.totalAskVolume}
            clearingPrice={batch.clearingPrice}
            matchedVolume={batch.matchedVolume}
            baseSymbol={market.baseSymbol}
          />
        </div>

        {/* Settle Bar (Keeper Trigger) */}
        <SettleBar
          isAuctionEnded={isAuctionEnded}
          clearingPrice={batch.clearingPrice}
          matchedVolume={batch.matchedVolume}
          currentEpoch={market.currentEpoch}
          onSettle={handleSettle}
        />

        {/* Bottom 2-Column Trading Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Order Placement Form */}
          <div className="lg:col-span-4">
            <OrderForm
              mode={market.mode}
              oracle={oracle}
              baseSymbol={market.baseSymbol}
              quoteSymbol={market.quoteSymbol}
              onPlaceOrder={handlePlaceOrder}
            />
          </div>

          {/* Active Epoch Orders Table */}
          <div className="lg:col-span-8">
            <OrderBookTable
              orders={batch.orders}
              status={batch.status}
              currentSlot={batch.currentSlot}
              endSlot={batch.endSlot}
              clearingPrice={batch.clearingPrice}
              onCancelOrder={handleCancelOrder}
              onClaimProceeds={handleClaim}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
