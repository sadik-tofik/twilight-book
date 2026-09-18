'use client';

import React from 'react';
import Link from 'next/link';
import { DocsPage } from '@/lib/types';
import { CodeBlock } from './CodeBlock';
import { ArchitectureDiagram } from './ArchitectureDiagram';
import { FeedbackWidget } from './FeedbackWidget';
import { DocsTOC } from './DocsTOC';
import { ShieldCheck, Info, AlertTriangle, ArrowRight, Zap, Play } from 'lucide-react';

interface Props {
  page: DocsPage;
}

export const DocPageContent: React.FC<Props> = ({ page }) => {
  const renderBody = () => {
    switch (`${page.section}/${page.slug}`) {
      case 'start-here/index':
        return (
          <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
            <p className="text-base text-[#EDEFF2] leading-normal font-normal">
              <strong>TwilightBook</strong> is a high-performance Solana program (Anchor) engineered to operate a 24/7 tokenized-equity venue. It dynamically alternates between continuous CLMM-style swaps and discrete uniform-price batch auctions depending on real-time Pyth oracle confidence intervals and status flags.
            </p>

            <h2 id="overview" className="text-xl font-bold text-white border-b border-[#242A30] pb-2 mt-8">
              Overview
            </h2>
            <p>
              Traditional equity markets close for roughly 135 hours each week (weekends, nights, bank holidays). When equities are tokenized on Solana, trading continues 24/7, but the underlying asset&apos;s primary price discovery halts or experiences extreme uncertainty.
            </p>
            <p>
              If a continuous AMM pool is left open against a stale or wide-confidence oracle feed, it suffers from catastrophic adverse selection: informed arbitrageurs trade against stale liquidity pools before market makers can adjust. TwilightBook solves this by converting continuous trading into discrete batch auctions whenever market uncertainty exceeds defined thresholds.
            </p>

            <h2 id="problem" className="text-xl font-bold text-white border-b border-[#242A30] pb-2 mt-8">
              The TradFi Off-Hours Problem
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              <div className="p-4 rounded-lg bg-[#131619] border border-[#242A30]">
                <div className="font-bold text-white mb-1">Standard AMM Pools</div>
                <div className="text-xs text-zinc-400">
                  Vulnerable to toxic order flow, MEV sandwiching, and latency sniping when off-market news breaks during TradFi closures.
                </div>
              </div>
              <div className="p-4 rounded-lg bg-[#131619] border border-[#242A30]">
                <div className="font-bold text-[#B98CE8] mb-1">TwilightBook Discrete Batches</div>
                <div className="text-xs text-zinc-400">
                  Aggregates all liquidity into periodic epochs, executing all crossed trades at a single uniform equilibrium price (P*).
                </div>
              </div>
            </div>

            <h2 id="solution" className="text-xl font-bold text-white border-b border-[#242A30] pb-2 mt-8">
              The Twilight Solution
            </h2>
            <p>
              During normal hours, when Pyth reports status <code>Trading</code> and confidence is tight (e.g. ≤ 200 bps), the market operates in <strong>Continuous Mode</strong>.
            </p>
            <p>
              When a weekend shock occurs, confidence widens beyond the threshold, the feed is halted, or publish time becomes stale, the permissionless circuit evaluator flips the venue into <strong>Twilight Batch Auction Mode</strong>.
            </p>

            <h2 id="key-features" className="text-xl font-bold text-white border-b border-[#242A30] pb-2 mt-8">
              Key Features
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-zinc-300">
              <li><strong>Zero MEV Extraction:</strong> No order in a batch can front-run another because every matched order clears at the exact same uniform price P*.</li>
              <li><strong>Price-Improvement Surplus Refund:</strong> Buyers bidding higher than the clearing price P* automatically receive their surplus back.</li>
              <li><strong>Anti-Sniping Freeze Window:</strong> Cancellations are cryptographically locked inside the final 10 slots before settlement.</li>
              <li><strong>Zero Vault Leakage (INV-01 / INV-02):</strong> Every atom of base and quote token is mathematically accounted for in on-chain vaults.</li>
            </ul>

            <div className="mt-8 p-4 rounded-lg bg-[#1B1F24] border border-[#242A30] flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-xs">Ready to inspect the code?</div>
                <div className="text-xs text-zinc-400">Proceed to the quick start guide to build and test locally.</div>
              </div>
              <Link
                href="/docs/start-here/quick-start"
                className="px-3 py-1.5 rounded bg-[#5B8DEF] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#5B8DEF]/90"
              >
                <span>Quick Start</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        );

      case 'start-here/quick-start':
        return (
          <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
            <p>
              This guide walks through cloning, building, testing, and deploying TwilightBook on Solana localnet or devnet.
            </p>

            <h2 id="prerequisites" className="text-xl font-bold text-white border-b border-[#242A30] pb-2 mt-8">
              Prerequisites
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Rust 1.79+ &amp; Cargo</li>
              <li>Solana CLI 1.18.17+</li>
              <li>Anchor CLI 0.30.1</li>
              <li>Node.js 18+ and npm</li>
            </ul>

            <h2 id="clone-and-build" className="text-xl font-bold text-white border-b border-[#242A30] pb-2 mt-8">
              Clone &amp; Build
            </h2>
            <CodeBlock
              language="bash"
              code={`git clone https://github.com/sadik-tofik/twilight-book.git
cd twilight-book

# Install dependencies
npm install

# Build Anchor program (utilizes patches/ for proc-macro2 and anchor-syn)
anchor build`}
            />

            <h2 id="running-bankrun-tests" className="text-xl font-bold text-white border-b border-[#242A30] pb-2 mt-8">
              Running Bankrun Tests
            </h2>
            <p>
              TwilightBook features 24 exhaustive unit and integration tests powered by <code>solana-bankrun</code> and <code>anchor-bankrun</code>, executing in under 4 seconds without spinning up a full test validator.
            </p>
            <CodeBlock
              language="bash"
              code={`# Run all Bankrun test suites
npm test`}
            />
            <div className="p-3 rounded bg-[#3ECF8E]/10 border border-[#3ECF8E]/30 text-[#3ECF8E] text-xs font-mono">
              ✓ 24 passing tests including zero vault leakage and $6.00 buyer surplus refund verification!
            </div>

            <h2 id="devnet-deployment" className="text-xl font-bold text-white border-b border-[#242A30] pb-2 mt-8">
              Devnet Deployment
            </h2>
            <CodeBlock
              language="bash"
              code={`# Configure Solana CLI for devnet
solana config set --url https://api.devnet.solana.com

# Deploy the compiled program
anchor deploy --provider.cluster devnet`}
            />
          </div>
        );

      case 'start-here/architecture':
        return (
          <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
            <p>
              The TwilightBook architecture is organized around the <strong>Pyth Circuit Evaluator</strong>, which continuously senses oracle reliability and controls the transition between continuous AMM-style execution and discrete batch auctions.
            </p>

            <ArchitectureDiagram />

            <h2 id="circuit-evaluator" className="text-xl font-bold text-white border-b border-[#242A30] pb-2 mt-8">
              Pyth Circuit Evaluator
            </h2>
            <p>
              The circuit evaluator is executed permissionlessly via <code>evaluate_market_mode</code>. It decodes the raw byte layout of the market&apos;s Pyth price account without external oracles or off-chain dependencies:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Price Status:</strong> Must equal <code>PriceStatus::Trading</code> (1). If <code>Halted</code> (2) or <code>Auction</code> (3), the circuit trips immediately.</li>
              <li><strong>Confidence Spread (BPS):</strong> Checks <code>(conf * 10,000) / price ≤ max_conf_bps</code> (default 200 bps = 2.00%).</li>
              <li><strong>Staleness:</strong> Asserts <code>current_timestamp - publish_time ≤ 60 seconds</code>.</li>
            </ul>

            <h2 id="state-machine" className="text-xl font-bold text-white border-b border-[#242A30] pb-2 mt-8">
              Market State Machine
            </h2>
            <p>
              When the circuit detects elevated uncertainty, <code>market.mode</code> flips from <code>Continuous</code> to <code>BatchAuction</code>. Orders are escrowed into a 32-slot ring buffer (<code>EpochBatchState</code>).
            </p>

            <h2 id="account-model" className="text-xl font-bold text-white border-b border-[#242A30] pb-2 mt-8">
              Account Model &amp; PDAs
            </h2>
            <div className="overflow-x-auto my-4">
              <table className="w-full text-left border-collapse border border-[#242A30] text-xs font-mono">
                <thead>
                  <tr className="bg-[#131619] text-[#8A919C] border-b border-[#242A30]">
                    <th className="p-2.5">Account</th>
                    <th className="p-2.5">PDA Seeds</th>
                    <th className="p-2.5">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#242A30]">
                  <tr>
                    <td className="p-2.5 text-[#5B8DEF]">Market</td>
                    <td className="p-2.5">[b&quot;market&quot;, base_mint, quote_mint]</td>
                    <td className="p-2.5 text-zinc-300">Global market parameters &amp; mode state</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-[#B98CE8]">EpochBatchState</td>
                    <td className="p-2.5">[b&quot;batch&quot;, market, epoch_id.to_le_bytes()]</td>
                    <td className="p-2.5 text-zinc-300">32-slot order ring buffer &amp; clearing result</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-[#3ECF8E]">Vault Base / Quote</td>
                    <td className="p-2.5">[b&quot;vault_base&quot; / b&quot;vault_quote&quot;, market]</td>
                    <td className="p-2.5 text-zinc-300">SPL token vaults holding all deposited funds</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 text-zinc-400">MockOracle (Demo)</td>
                    <td className="p-2.5">[b&quot;mock_oracle&quot;, base_mint, quote_mint]</td>
                    <td className="p-2.5 text-zinc-300">Hackathon demo injection oracle owned by program</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'core-concepts/continuous-vs-twilight':
        return (
          <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
            <h2 id="the-135-hour-window" className="text-xl font-bold text-white border-b border-[#242A30] pb-2">
              The 135-Hour Window
            </h2>
            <blockquote className="p-4 rounded-lg bg-[#131619] border-l-4 border-[#B98CE8] text-zinc-200 italic font-sans my-4">
              &ldquo;Traditional markets close roughly 135 hours a week. Tokenized equities on Solana don&apos;t — but the price feed backing them does effectively &apos;close&apos; too: Pyth&apos;s confidence interval widens or the feed halts. A continuous AMM pool left running against a stale price during that window is exactly the setup for adverse selection — someone with real news trades against a price that hasn&apos;t moved. TwilightBook&apos;s <code>evaluate_market_mode</code> watches Pyth&apos;s own status and confidence width and switches the market into discrete batch auctions the moment the feed stops being trustworthy for continuous pricing, then switches back once it isn&apos;t.&rdquo;
            </blockquote>

            <h2 id="adverse-selection" className="text-xl font-bold text-white border-b border-[#242A30] pb-2 mt-8">
              Adverse Selection in AMMs
            </h2>
            <p>
              In continuous automated market makers, constant product or concentrated liquidity curves assume symmetric information. When an external market closure occurs (e.g. Friday 4:00 PM EST to Sunday 6:00 PM EST), real-world events still happen: earnings calls, macroeconomic releases, geopolitical events.
            </p>
            <p>
              When an off-market event occurs, the true fundamental valuation moves instantly. But an AMM curve remains anchored to stale liquidity. The first actors to trade against the AMM are not retail buyers — they are latency arbitrageurs extracting liquidity provider surplus.
            </p>

            <h2 id="dynamic-mode-switch" className="text-xl font-bold text-white border-b border-[#242A30] pb-2 mt-8">
              The Dynamic Mode Switch
            </h2>
            <p>
              By pooling bids and asks over an epoch duration (e.g. 75 slots, ~30 seconds) into a discrete uniform auction, individual transaction timestamps within the epoch are eliminated. No one can front-run another order inside the batch because all filled orders execute at the identical clearing price P*.
            </p>
          </div>
        );

      case 'core-concepts/uniform-price-clearing':
        return (
          <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
            <h2 id="uniform-pricing-principle" className="text-xl font-bold text-white border-b border-[#242A30] pb-2">
              The Uniform Price Principle
            </h2>
            <p>
              Every order in a batch clears at <strong>ONE single price (P*)</strong> — not the limit price named by each individual trader, but the single market-clearing price that maximizes total executed volume (Q*).
            </p>

            <h2 id="worked-example" className="text-xl font-bold text-white border-b border-[#242A30] pb-2 mt-8">
              Concrete Worked Example
            </h2>
            <p>
              Consider the exact scenario hand-solved and verified in <code>tests/bankrun/uniform_clearing.test.ts</code>:
            </p>
            <div className="p-4 rounded-lg bg-[#131619] border border-[#242A30] font-mono text-xs my-3 space-y-2">
              <div className="text-[#3ECF8E] font-bold">Bids Placed:</div>
              <div>• Buyer 1: 10 shares @ limit price $214.80</div>
              <div>• Buyer 2: 5 shares @ limit price $214.50</div>
              <div className="text-[#E5544D] font-bold pt-2">Asks Placed:</div>
              <div>• Seller 1: 8 shares @ limit price $214.20</div>
              <div>• Seller 2: 10 shares @ limit price $214.60</div>
            </div>

            <p>The clearing engine tests candidate prices from the order book:</p>
            <ul className="list-disc pl-5 space-y-1 font-mono text-xs">
              <li>At P = $214.20: Cumulative Bid = 15, Cumulative Ask = 8 → Matched = 8</li>
              <li>At P = $214.50: Cumulative Bid = 15, Cumulative Ask = 8 → Matched = 8</li>
              <li>At P = $214.60: Cumulative Bid = 10, Cumulative Ask = 18 → <strong>Matched = 10 (Maximum!)</strong></li>
              <li>At P = $214.80: Cumulative Bid = 10, Cumulative Ask = 18 → Matched = 10</li>
            </ul>

            <h2 id="tie-break-rule" className="text-xl font-bold text-white border-b border-[#242A30] pb-2 mt-8">
              Tie-Break Rule
            </h2>
            <p>
              Both $214.60 and $214.80 achieve the maximum matched volume of 10 shares. TwilightBook applies a deterministic tie-break rule: <strong>the price nearest to the Pyth oracle reference price (P_ref = $214.50) wins</strong>.
            </p>
            <p>
              Since |$214.60 - $214.50| = $0.10 &lt; |$214.80 - $214.50| = $0.30, the auction clears at:
            </p>
            <div className="p-3 rounded bg-[#B98CE8]/10 border border-[#B98CE8]/30 text-[#B98CE8] font-mono text-sm font-bold">
              P* = $214.60, Q* = 10 shares
            </div>

            <h2 id="price-improvement-refund" className="text-xl font-bold text-white border-b border-[#242A30] pb-2 mt-8">
              Buyer Price-Improvement Refund
            </h2>
            <p>
              Buyer 1 escrowed funds at their limit price of $214.80 ($2,148.00 total for 10 shares). Because the trade cleared at the lower uniform price of $214.60 ($2,146.00 total), Buyer 1 is entitled to the difference:
            </p>
            <div className="p-3 rounded bg-[#3ECF8E]/10 border border-[#3ECF8E]/30 text-[#3ECF8E] font-mono text-xs">
              Refund = 10 shares × ($214.80 - $214.60) = $2.00 price-improvement surplus returned on claim!
            </div>
          </div>
        );

      case 'core-concepts/confidence-bands':
        return (
          <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
            <h2 id="formula" className="text-xl font-bold text-white border-b border-[#242A30] pb-2">
              Mathematical Formulation
            </h2>
            <p>
              To eliminate non-market orders and malicious price spoofing, TwilightBook enforces a bounded confidence band around the Pyth reference price:
            </p>
            <div className="p-4 rounded-lg bg-[#131619] border border-[#242A30] font-mono text-sm text-center my-4">
              <span className="text-[#3ECF8E]">P_min = P_ref - k × σ</span>
              <span className="mx-4 text-zinc-500">|</span>
              <span className="text-[#B98CE8]">P_max = P_ref + k × σ</span>
            </div>
            <p>
              Where <code>P_ref</code> is Pyth&apos;s current price, <code>σ</code> is the confidence interval, and <code>k</code> is the confidence multiplier (default <code>k = 2</code>).
            </p>

            <h2 id="client-validation" className="text-xl font-bold text-white border-b border-[#242A30] pb-2 mt-8">
              Client-Side vs. On-Chain Enforcement
            </h2>
            <p>
              Any order whose limit price falls outside <code>[P_min, P_max]</code> is rejected on-chain with error:
            </p>
            <CodeBlock
              language="rust"
              code={`#[error_code]
pub enum TwilightError {
    #[msg("Order limit price exceeds allowable oracle confidence band")]
    OrderPriceExceedsConfidenceBand, // 6006
}`}
            />
            <p>
              The TwilightBook frontend performs real-time client-side validation against this band before transaction signing, preventing users from burning gas on failed transactions.
            </p>
          </div>
        );

      case 'instructions/initialize-market':
        return (
          <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
            <p className="text-base text-white">One-time instruction to initialize a new tokenized equity market pair and its vaults.</p>

            <h2 id="accounts" className="text-xl font-bold text-white border-b border-[#242A30] pb-2 mt-8">Accounts</h2>
            <div className="overflow-x-auto my-4">
              <table className="w-full text-left border border-[#242A30] text-xs font-mono">
                <thead><tr className="bg-[#131619] text-[#8A919C]"><th className="p-2">Account</th><th className="p-2">Type</th><th className="p-2">Notes</th></tr></thead>
                <tbody className="divide-y divide-[#242A30]">
                  <tr><td className="p-2 text-[#5B8DEF]">authority</td><td className="p-2">Signer, Writable</td><td className="p-2">Pays rent for Market and vaults</td></tr>
                  <tr><td className="p-2 text-[#5B8DEF]">market</td><td className="p-2">PDA, Writable</td><td className="p-2">Seeds: [b&quot;market&quot;, base_mint, quote_mint]</td></tr>
                  <tr><td className="p-2 text-[#5B8DEF]">base_mint</td><td className="p-2">Account</td><td className="p-2">SPL Token mint (e.g. TSLAx)</td></tr>
                  <tr><td className="p-2 text-[#5B8DEF]">quote_mint</td><td className="p-2">Account</td><td className="p-2">Quote token mint (USDC)</td></tr>
                  <tr><td className="p-2 text-[#5B8DEF]">vault_base</td><td className="p-2">PDA, Writable</td><td className="p-2">Token account owned by Market PDA</td></tr>
                  <tr><td className="p-2 text-[#5B8DEF]">vault_quote</td><td className="p-2">PDA, Writable</td><td className="p-2">Token account owned by Market PDA</td></tr>
                  <tr><td className="p-2 text-[#5B8DEF]">pyth_feed</td><td className="p-2">Account</td><td className="p-2">Pyth V2 Price account feed</td></tr>
                </tbody>
              </table>
            </div>

            <h2 id="arguments" className="text-xl font-bold text-white border-b border-[#242A30] pb-2 mt-8">Arguments</h2>
            <ul className="list-disc pl-5 space-y-1 font-mono text-xs">
              <li><code>max_conf_bps: u64</code> — Threshold in basis points to flip between modes (default 200 = 2.00%).</li>
              <li><code>epoch_duration_slots: u64</code> — Duration of batch auction epochs in slots (default 75).</li>
              <li><code>conf_filter_mult: u64</code> — Confidence multiplier &apos;k&apos; for bands (default 2).</li>
            </ul>

            <h2 id="example" className="text-xl font-bold text-white border-b border-[#242A30] pb-2 mt-8">Example</h2>
            <CodeBlock
              language="typescript"
              code={`await program.methods
  .initializeMarket(new BN(200), new BN(75), new BN(2))
  .accounts({
    authority: wallet.publicKey,
    market: marketPda,
    baseMint,
    quoteMint,
    vaultBase,
    vaultQuote,
    pythFeed,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
    rent: SYSVAR_RENT_PUBKEY,
  })
  .rpc();`}
            />
          </div>
        );

      case 'instructions/evaluate-market-mode':
        return (
          <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
            <p className="text-base text-white">Permissionless circuit evaluator instruction that checks Pyth oracle status and flips market mode.</p>

            <h2 id="accounts" className="text-xl font-bold text-white border-b border-[#242A30] pb-2 mt-8">Accounts</h2>
            <div className="overflow-x-auto my-4">
              <table className="w-full text-left border border-[#242A30] text-xs font-mono">
                <thead><tr className="bg-[#131619] text-[#8A919C]"><th className="p-2">Account</th><th className="p-2">Type</th><th className="p-2">Notes</th></tr></thead>
                <tbody className="divide-y divide-[#242A30]">
                  <tr><td className="p-2 text-[#5B8DEF]">market</td><td className="p-2">PDA, Writable</td><td className="p-2">Updates mode to continuous or batchAuction</td></tr>
                  <tr><td className="p-2 text-[#5B8DEF]">pyth_feed</td><td className="p-2">Account</td><td className="p-2">Pyth V2 price account matching market.pyth_feed</td></tr>
                  <tr><td className="p-2 text-[#5B8DEF]">epoch_batch</td><td className="p-2">PDA, Writable</td><td className="p-2">Lazily initialized if epoch 0 does not exist</td></tr>
                </tbody>
              </table>
            </div>

            <h2 id="example" className="text-xl font-bold text-white border-b border-[#242A30] pb-2 mt-8">Example</h2>
            <CodeBlock
              language="typescript"
              code={`await program.methods
  .evaluateMarketMode()
  .accounts({
    market: marketPda,
    pythFeed: pythFeedPubkey,
    epochBatch: epochBatchPda,
    payer: wallet.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .rpc();`}
            />
          </div>
        );

      case 'instructions/place-batch-order':
        return (
          <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
            <p className="text-base text-white">Places a limit bid or ask into the active epoch batch ring buffer, escrowing tokens into the vault.</p>

            <h2 id="arguments" className="text-xl font-bold text-white border-b border-[#242A30] pb-2 mt-8">Arguments</h2>
            <ul className="list-disc pl-5 space-y-1 font-mono text-xs">
              <li><code>side: OrderSide</code> — <code>&#123; bid: &#123;&#125; &#125;</code> or <code>&#123; ask: &#123;&#125; &#125;</code>.</li>
              <li><code>lot_size: u64</code> — Number of shares (6-decimal fixed point, e.g. 10_000_000 for 10 shares).</li>
              <li><code>limit_price: u64</code> — Dollar limit price (6-decimal fixed point, e.g. 214_500_000 for $214.50).</li>
            </ul>

            <h2 id="example" className="text-xl font-bold text-white border-b border-[#242A30] pb-2 mt-8">Example</h2>
            <CodeBlock
              language="typescript"
              code={`// Buy 10 shares at limit price $214.80
const lotSize = new BN(10_000_000);
const limitPrice = new BN(214_800_000);

await program.methods
  .placeBatchOrder({ bid: {} }, lotSize, limitPrice)
  .accounts({
    user: wallet.publicKey,
    market: marketPda,
    epochBatch: epochBatchPda,
    vaultQuote,
    userQuoteAta,
    pythFeed,
    tokenProgram: TOKEN_PROGRAM_ID,
  })
  .rpc();`}
            />
          </div>
        );

      case 'instructions/cancel-batch-order':
        return (
          <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
            <p className="text-base text-white">Cancels an unfilled batch order and returns escrowed tokens, subject to the anti-sniping freeze window.</p>

            <div className="p-3 rounded bg-[#E5544D]/10 border border-[#E5544D]/30 text-[#E5544D] text-xs">
              <strong>Freeze Window Rule:</strong> Reverts with <code>FreezeWindowActive (6008)</code> inside the last 10 slots before <code>epoch_batch.end_slot</code>.
            </div>

            <h2 id="example" className="text-xl font-bold text-white border-b border-[#242A30] pb-2 mt-8">Example</h2>
            <CodeBlock
              language="typescript"
              code={`// Cancel order at index 0
await program.methods
  .cancelBatchOrder(0)
  .accounts({
    user: wallet.publicKey,
    market: marketPda,
    epochBatch: epochBatchPda,
    vaultQuote,
    userQuoteAta,
    tokenProgram: TOKEN_PROGRAM_ID,
  })
  .rpc();`}
            />
          </div>
        );

      case 'instructions/settle-batch-auction':
        return (
          <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
            <p className="text-base text-white">Permissionless keeper action to clear the batch auction once the epoch ends and advance to the next epoch.</p>

            <h2 id="example" className="text-xl font-bold text-white border-b border-[#242A30] pb-2 mt-8">Example</h2>
            <CodeBlock
              language="typescript"
              code={`await program.methods
  .settleBatchAuction()
  .accounts({
    keeper: wallet.publicKey,
    market: marketPda,
    currentBatch: currentBatchPda,
    nextBatch: nextBatchPda,
    pythFeed,
    systemProgram: SystemProgram.programId,
  })
  .rpc();`}
            />
          </div>
        );

      case 'instructions/claim-order-proceeds':
        return (
          <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
            <p className="text-base text-white">Claims bought tokens, sale proceeds, unfilled returns, and price-improvement refunds for a settled order.</p>

            <h2 id="example" className="text-xl font-bold text-white border-b border-[#242A30] pb-2 mt-8">Example</h2>
            <CodeBlock
              language="typescript"
              code={`await program.methods
  .claimOrderProceeds(orderIndex)
  .accounts({
    user: wallet.publicKey,
    market: marketPda,
    epochBatch: epochBatchPda,
    vaultBase,
    vaultQuote,
    userBaseAta,
    userQuoteAta,
    tokenProgram: TOKEN_PROGRAM_ID,
  })
  .rpc();`}
            />
          </div>
        );

      case 'security/invariants':
        return (
          <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
            <p className="text-base text-white">
              The TwilightBook security model is formally defined by 5 core protocol invariants that must hold across all transactions.
            </p>

            <h2 id="core-invariants" className="text-xl font-bold text-white border-b border-[#242A30] pb-2 mt-8">
              Core Protocol Invariants
            </h2>
            <div className="space-y-3 my-4">
              <div className="p-3.5 rounded-lg bg-[#131619] border border-[#242A30]">
                <div className="font-mono text-xs font-bold text-[#3ECF8E]">INV-01: Zero Base Token Leakage</div>
                <div className="text-xs text-zinc-300 mt-1">
                  <code>Vault_Base_Balance == sum(filled_bid_shares_unclaimed) + sum(unfilled_ask_shares_unclaimed)</code>
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-[#131619] border border-[#242A30]">
                <div className="font-mono text-xs font-bold text-[#3ECF8E]">INV-02: Zero Quote Token Leakage</div>
                <div className="text-xs text-zinc-300 mt-1">
                  <code>Vault_Quote_Balance == sum(seller_proceeds_unclaimed) + sum(buyer_surplus_and_unfilled_unclaimed)</code>
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-[#131619] border border-[#242A30]">
                <div className="font-mono text-xs font-bold text-[#B98CE8]">INV-03: Single Uniform Execution Price</div>
                <div className="text-xs text-zinc-300 mt-1">
                  Every trade in an epoch batch executes at the identical price P*. No trader receives worse than their limit price.
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-[#131619] border border-[#242A30]">
                <div className="font-mono text-xs font-bold text-[#5B8DEF]">INV-04: Non-Crossing Solvency</div>
                <div className="text-xs text-zinc-300 mt-1">
                  If bids and asks do not cross, matched volume Q* is 0 and 100% of escrowed funds are returned without fee.
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-[#131619] border border-[#242A30]">
                <div className="font-mono text-xs font-bold text-[#E5544D]">INV-05: Anti-Sniping Freeze Window</div>
                <div className="text-xs text-zinc-300 mt-1">
                  Cancellations are rejected once <code>current_slot &gt;= end_slot - 10</code>, preventing last-millisecond spoofing.
                </div>
              </div>
            </div>

            <h2 id="stride-threat-model" className="text-xl font-bold text-white border-b border-[#242A30] pb-2 mt-8">
              STRIDE Threat Analysis
            </h2>
            <div className="overflow-x-auto my-4">
              <table className="w-full text-left border border-[#242A30] text-xs font-mono">
                <thead>
                  <tr className="bg-[#131619] text-[#8A919C]">
                    <th className="p-2">Threat</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Mitigation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#242A30]">
                  <tr>
                    <td className="p-2 text-white">Stale Price Exploitation</td>
                    <td className="p-2 text-[#E5544D]">Tampering</td>
                    <td className="p-2 text-zinc-300">Pyth Circuit Evaluator checks publish_time &lt;= 60s and flips mode.</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-white">MEV Sandwich Attacks</td>
                    <td className="p-2 text-[#E5544D]">Information Disclosure</td>
                    <td className="p-2 text-zinc-300">Discrete batch auctions eliminate intra-epoch transaction order advantage.</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-white">Last-Slot Order Pulling</td>
                    <td className="p-2 text-[#E5544D]">Denial of Service</td>
                    <td className="p-2 text-zinc-300">10-slot cancellation freeze window prior to settlement.</td>
                  </tr>
                  <tr>
                    <td className="p-2 text-white">Vault Fund Drainage</td>
                    <td className="p-2 text-[#E5544D]">Elevation of Privilege</td>
                    <td className="p-2 text-zinc-300">Vault authorities are strictly Market PDAs signed via seeds.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'security/known-limitations':
        return (
          <div className="space-y-6 text-sm text-zinc-300 leading-relaxed">
            <h2 id="pro-rata-dust" className="text-xl font-bold text-white border-b border-[#242A30] pb-2">
              Pro-Rata Rounding Dust
            </h2>
            <blockquote className="p-4 rounded-lg bg-[#131619] border-l-4 border-[#B98CE8] text-zinc-200 font-sans my-4">
              &ldquo;Pro-rata fills can leave up to (n-1) atoms of rounding dust per side at a tied clearing price, always reclaimable via <code>claim_order_proceeds</code>, never lost.&rdquo;
            </blockquote>
            <p>
              When multiple orders sit at the exact clearing price P* and their combined volume exceeds the matched quantity Q*, shares are allocated pro-rata using integer division. Any fractional integer remainder stays in the user&apos;s unfilled lot size and is returned during claim.
            </p>

            <h2 id="mock-oracle-scope" className="text-xl font-bold text-white border-b border-[#242A30] pb-2 mt-8">
              Demo-Only Mock Oracle
            </h2>
            <blockquote className="p-4 rounded-lg bg-[#131619] border-l-4 border-[#E5544D] text-zinc-200 font-sans my-4">
              &ldquo;<code>set_mock_oracle</code> is a demo-only instruction with no authority gating, never part of a real deployment.&rdquo;
            </blockquote>
            <p>
              In production mainnet deployments, <code>market.pyth_feed</code> points directly to Pyth&apos;s real Price account. The mock oracle instruction exists solely so hackathon evaluators and demo operators can simulate market halts and weekend confidence spikes on demand.
            </p>
          </div>
        );

      default:
        return (
          <div className="text-zinc-400">Documentation content is loading...</div>
        );
    }
  };

  return (
    <div className="flex gap-12">
      <div className="flex-1 min-w-0">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-4">
          <Link href="/docs" className="hover:text-zinc-300">Docs</Link>
          <span>/</span>
          <span className="capitalize">{page.section.replace('-', ' ')}</span>
          <span>/</span>
          <span className="text-[#5B8DEF]">{page.title}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#EDEFF2] tracking-tight mb-2">
          {page.title}
        </h1>
        <p className="text-sm text-[#8A919C] mb-8 font-normal">
          {page.description}
        </p>

        {renderBody()}

        <FeedbackWidget
          filePath={`app/src/lib/docsData.ts`}
          prev={page.prev}
          next={page.next}
        />
      </div>

      <DocsTOC headings={page.headings} />
    </div>
  );
};
