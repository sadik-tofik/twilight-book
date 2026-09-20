'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
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
import {
  getAnchorProgram,
  fetchLiveMarketState,
  fetchLiveBatchState,
  fetchLiveOracleState,
  executeOnChainSetMockOracle,
  executeOnChainEvaluateMarketMode,
  executeOnChainPlaceOrder,
  executeOnChainCancelOrder,
  executeOnChainSettle,
  executeOnChainClaim,
  findBatchPda,
  DEVNET_DEPLOYMENT,
  PROGRAM_ID,
} from '@/lib/solanaConfig';
import { ExternalLink, CheckCircle2, AlertCircle, Loader2, Info, X } from 'lucide-react';

export default function CockpitPage() {
  const { connection } = useConnection();
  const wallet = useWallet();

  // Environment Mode: Live Devnet vs Instant Simulation
  const [isLiveDevnet, setIsLiveDevnet] = useState(false);

  // Application Data States
  const [market, setMarket] = useState(INITIAL_MARKET);
  const [oracle, setOracle] = useState(INITIAL_ORACLE);
  const [batch, setBatch] = useState(INITIAL_BATCH);

  // Transaction Status & Live Feedback
  const [onChainTx, setOnChainTx] = useState<string | null>(null);
  const [txLoading, setTxLoading] = useState(false);
  const [txMessage, setTxMessage] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  // Auto-enable live devnet mode when a wallet connects
  useEffect(() => {
    if (wallet.connected && !isLiveDevnet) {
      setIsLiveDevnet(true);
    }
  }, [wallet.connected, isLiveDevnet]);

  // Sync state from Solana Devnet when Live Mode is active
  const refreshOnChainState = useCallback(async () => {
    if (!connection) return;
    try {
      const liveMarket = await fetchLiveMarketState(connection);
      if (liveMarket) setMarket(liveMarket);

      const liveOracle = await fetchLiveOracleState(
        connection,
        DEVNET_DEPLOYMENT.mockOracle,
        liveMarket?.confFilterMult || 2
      );
      if (liveOracle) setOracle(liveOracle);

      const batchPda = liveMarket
        ? findBatchPda(DEVNET_DEPLOYMENT.marketPda, liveMarket.currentEpoch)[0]
        : DEVNET_DEPLOYMENT.epoch0Batch;
      const liveBatch = await fetchLiveBatchState(connection, batchPda);
      if (liveBatch) setBatch(liveBatch);
    } catch (err) {
      console.warn("Live on-chain sync error:", err);
    }
  }, [connection]);

  useEffect(() => {
    if (isLiveDevnet) {
      refreshOnChainState();
      const interval = setInterval(refreshOnChainState, 10000);
      return () => clearInterval(interval);
    }
  }, [isLiveDevnet, refreshOnChainState]);

  // Evaluate market circuit logic locally if in simulation mode
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
  const handleSimulateMarketOpen = async () => {
    if (isLiveDevnet) {
      if (!wallet.connected || !wallet.publicKey) {
        setTxError("Please connect your Phantom or Solflare wallet to execute on Devnet.");
        return;
      }
      try {
        setTxLoading(true);
        setTxMessage("Writing Pyth V2 binary format (price=$214.50, conf=0.20, status=1) to Devnet...");
        setTxError(null);
        const program = getAnchorProgram(connection, wallet);
        const sig = await executeOnChainSetMockOracle(program, wallet, 214.50, 0.20, -6, 1);
        setOnChainTx(sig);
        setTxMessage("Mock oracle updated! Now evaluating on-chain circuit breaker...");
        const evalSig = await executeOnChainEvaluateMarketMode(program, wallet);
        setOnChainTx(evalSig);
        setTxMessage("Circuit breaker evaluated on Devnet! Market returned to Continuous mode.");
        await refreshOnChainState();
      } catch (err: any) {
        setTxError(err?.message || "Failed to set mock oracle on Devnet.");
      } finally {
        setTxLoading(false);
      }
    } else {
      const newOracle = createMockPythState(214.50, 0.20, 1, undefined, market.confFilterMult);
      setOracle(newOracle);
      evaluateCircuit(newOracle);
    }
  };

  const handleSimulateWeekendShock = async () => {
    if (isLiveDevnet) {
      if (!wallet.connected || !wallet.publicKey) {
        setTxError("Please connect your Phantom or Solflare wallet to execute on Devnet.");
        return;
      }
      try {
        setTxLoading(true);
        setTxMessage("Injecting Weekend Shock (price=$214.50, conf=6.00 ~2798 bps, status=1) on Devnet...");
        setTxError(null);
        const program = getAnchorProgram(connection, wallet);
        const sig = await executeOnChainSetMockOracle(program, wallet, 214.50, 6.00, -6, 1);
        setOnChainTx(sig);
        setTxMessage("Shock oracle injected! Now triggering evaluate_market_mode()...");
        const evalSig = await executeOnChainEvaluateMarketMode(program, wallet);
        setOnChainTx(evalSig);
        setTxMessage("Circuit tripped! Market successfully transitioned to BatchAuction on Devnet.");
        await refreshOnChainState();
      } catch (err: any) {
        setTxError(err?.message || "Failed to inject weekend shock on Devnet.");
      } finally {
        setTxLoading(false);
      }
    } else {
      const newOracle = createMockPythState(214.50, 6.00, 1, undefined, market.confFilterMult);
      setOracle(newOracle);
      evaluateCircuit(newOracle);
    }
  };

  const handleSimulateMarketHalt = async () => {
    if (isLiveDevnet) {
      if (!wallet.connected || !wallet.publicKey) {
        setTxError("Please connect your Phantom or Solflare wallet to execute on Devnet.");
        return;
      }
      try {
        setTxLoading(true);
        setTxMessage("Setting Pyth status to Halted (status=2) on Devnet...");
        setTxError(null);
        const program = getAnchorProgram(connection, wallet);
        const sig = await executeOnChainSetMockOracle(program, wallet, 214.50, 0.20, -6, 2);
        setOnChainTx(sig);
        const evalSig = await executeOnChainEvaluateMarketMode(program, wallet);
        setOnChainTx(evalSig);
        setTxMessage("Pyth status Halted! Circuit tripped into BatchAuction.");
        await refreshOnChainState();
      } catch (err: any) {
        setTxError(err?.message || "Failed to set market halt on Devnet.");
      } finally {
        setTxLoading(false);
      }
    } else {
      const newOracle = createMockPythState(214.50, 0.20, 2, undefined, market.confFilterMult);
      setOracle(newOracle);
      evaluateCircuit(newOracle);
    }
  };

  const handleSimulateStaleFeed = async () => {
    if (isLiveDevnet) {
      if (!wallet.connected || !wallet.publicKey) {
        setTxError("Please connect your Phantom or Solflare wallet to execute on Devnet.");
        return;
      }
      try {
        setTxLoading(true);
        setTxMessage("Writing stale timestamp (300s in past) to mock oracle on Devnet...");
        setTxError(null);
        const program = getAnchorProgram(connection, wallet);
        const pastTime = Math.floor(Date.now() / 1000) - 300;
        const sig = await executeOnChainSetMockOracle(program, wallet, 214.50, 0.20, -6, 1, pastTime);
        setOnChainTx(sig);
        const evalSig = await executeOnChainEvaluateMarketMode(program, wallet);
        setOnChainTx(evalSig);
        setTxMessage("Stale feed injected! Circuit tripped into BatchAuction.");
        await refreshOnChainState();
      } catch (err: any) {
        setTxError(err?.message || "Failed to set stale oracle on Devnet.");
      } finally {
        setTxLoading(false);
      }
    } else {
      const pastTime = Math.floor(Date.now() / 1000) - 300;
      const newOracle = createMockPythState(214.50, 0.20, 1, pastTime, market.confFilterMult);
      setOracle(newOracle);
      evaluateCircuit(newOracle);
    }
  };

  // Order Placement
  const handlePlaceOrder = async (side: OrderSide, lotSize: number, limitPrice: number) => {
    if (isLiveDevnet) {
      if (!wallet.connected || !wallet.publicKey) {
        setTxError("Please connect your Phantom or Solflare wallet to submit on-chain orders.");
        return { success: false, error: "Wallet not connected" };
      }
      try {
        setTxLoading(true);
        setTxMessage(`Signing & escrowing ${side.toUpperCase()} order (${lotSize} shares @ $${limitPrice}) on Devnet...`);
        setTxError(null);
        const program = getAnchorProgram(connection, wallet);
        const sig = await executeOnChainPlaceOrder(program, wallet, side, lotSize, limitPrice);
        setOnChainTx(sig);
        setTxMessage(`Order placed successfully on Solana Devnet! Signature: ${sig.slice(0, 8)}...`);
        await refreshOnChainState();
        return { success: true };
      } catch (err: any) {
        const msg = err?.message || "Failed to place order on Devnet.";
        setTxError(msg);
        return { success: false, error: msg };
      } finally {
        setTxLoading(false);
      }
    } else {
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
    }
  };

  // Order Cancellation (with anti-sniping freeze window check)
  const handleCancelOrder = async (index: number) => {
    const slotsRemaining = Math.max(0, batch.endSlot - batch.currentSlot);
    if (slotsRemaining <= 10 && slotsRemaining > 0) {
      return { success: false, error: 'Freeze window active (<10 slots). Cancellations locked.' };
    }

    if (isLiveDevnet) {
      if (!wallet.connected || !wallet.publicKey) {
        setTxError("Please connect wallet to cancel order.");
        return { success: false, error: "Wallet not connected" };
      }
      try {
        setTxLoading(true);
        setTxMessage(`Cancelling order index ${index} on Devnet...`);
        setTxError(null);
        const program = getAnchorProgram(connection, wallet);
        const sig = await executeOnChainCancelOrder(program, wallet, index);
        setOnChainTx(sig);
        setTxMessage(`Order ${index} cancelled on Devnet.`);
        await refreshOnChainState();
        return { success: true };
      } catch (err: any) {
        const msg = err?.message || "Failed to cancel order on Devnet.";
        setTxError(msg);
        return { success: false, error: msg };
      } finally {
        setTxLoading(false);
      }
    } else {
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
    }
  };

  // Settlement execution
  const handleSettle = async () => {
    if (isLiveDevnet) {
      if (!wallet.connected || !wallet.publicKey) {
        setTxError("Please connect your wallet to trigger permissionless settlement.");
        return;
      }
      try {
        setTxLoading(true);
        setTxMessage("Invoking permissionless keeper settlement on Solana Devnet...");
        setTxError(null);
        const program = getAnchorProgram(connection, wallet);
        const sig = await executeOnChainSettle(program, wallet);
        setOnChainTx(sig);
        setTxMessage("Batch auction settled! Uniform price calculated and epoch rolled over.");
        await refreshOnChainState();
      } catch (err: any) {
        setTxError(err?.message || "Failed to settle batch auction on Devnet.");
      } finally {
        setTxLoading(false);
      }
    } else {
      const result = solveUniformPrice(batch.orders, oracle.price);
      setBatch((prev) => ({
        ...prev,
        status: 'settled',
        clearingPrice: result.clearingPrice,
        matchedVolume: result.matchedVolume,
        orders: result.filledOrders,
        currentSlot: prev.endSlot,
      }));
    }
  };

  // Claim proceeds handler
  const handleClaim = async (index: number) => {
    if (isLiveDevnet) {
      if (!wallet.connected || !wallet.publicKey) {
        setTxError("Please connect your wallet to claim proceeds.");
        return { success: false };
      }
      try {
        setTxLoading(true);
        setTxMessage(`Claiming proceeds & refunds for order ${index} on Devnet...`);
        setTxError(null);
        const program = getAnchorProgram(connection, wallet);
        const sig = await executeOnChainClaim(program, wallet, index);
        setOnChainTx(sig);
        setTxMessage(`Proceeds claimed on Devnet! Signature: ${sig.slice(0, 8)}...`);
        await refreshOnChainState();
        return { success: true };
      } catch (err: any) {
        setTxError(err?.message || "Failed to claim proceeds on Devnet.");
        return { success: false };
      } finally {
        setTxLoading(false);
      }
    } else {
      setBatch((prev) => ({
        ...prev,
        orders: prev.orders.map((o) =>
          o.index === index ? { ...o, claimed: true } : o
        ),
      }));
      return { success: true };
    }
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
        isLiveDevnet={isLiveDevnet}
        onToggleLiveDevnet={() => setIsLiveDevnet((prev) => !prev)}
      />

      {/* Transaction & Environment Status Banner */}
      <div className="border-b border-[#242A30] bg-[#131619]/80 px-4 sm:px-6 py-2.5">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isLiveDevnet ? 'bg-[#3ECF8E] animate-pulse' : 'bg-[#B98CE8]'
              }`}
            />
            <span className="text-zinc-400">Environment:</span>
            <span className={`font-bold ${isLiveDevnet ? 'text-[#3ECF8E]' : 'text-[#B98CE8]'}`}>
              {isLiveDevnet ? 'LIVE SOLANA DEVNET' : 'INSTANT CLIENT SIMULATION'}
            </span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400 hidden md:inline">Program:</span>
            <a
              href={`https://explorer.solana.com/address/${PROGRAM_ID.toBase58()}?cluster=devnet`}
              target="_blank"
              rel="noreferrer"
              className="text-zinc-300 hover:text-white underline decoration-zinc-600 flex items-center gap-1"
            >
              <span>{PROGRAM_ID.toBase58().slice(0, 6)}...{PROGRAM_ID.toBase58().slice(-6)}</span>
              <ExternalLink className="w-3 h-3 text-zinc-500" />
            </a>
          </div>

          <div className="flex items-center gap-3">
            {txLoading && (
              <div className="flex items-center gap-1.5 text-[#5B8DEF]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{txMessage || 'Processing transaction...'}</span>
              </div>
            )}

            {!txLoading && onChainTx && (
              <div className="flex items-center gap-1.5 text-[#3ECF8E]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirmed:</span>
                <a
                  href={`https://explorer.solana.com/tx/${onChainTx}?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold underline flex items-center gap-0.5 hover:text-white"
                >
                  <span>{onChainTx.slice(0, 8)}...</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={() => setOnChainTx(null)}
                  className="text-zinc-500 hover:text-zinc-300 ml-1"
                  title="Dismiss"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {!txLoading && txError && (
              <div className="flex items-center gap-1.5 text-rose-400">
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="truncate max-w-[280px] sm:max-w-md">{txError}</span>
                <button
                  onClick={() => setTxError(null)}
                  className="text-zinc-500 hover:text-zinc-300 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

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
