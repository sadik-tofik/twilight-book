# TwilightBook: Live Demo Script & Browser Walkthrough

**Format**: 3-Minute Hackathon Judging Presentation  
**Target Audience**: Solana Renaissance Judges & Pyth Bounty Evaluators  
**App URL**: `http://localhost:3000` (Local) / Deployed Cockpit  
**Backup Evidence**: `EVIDENCE.md`, `evidence_run.json`, `AUDIT.md`  

---

## 1. The 3-Minute Live Pitch Script

### [0:00 - 0:45] The Problem: Toxic MEV in Tokenized Equities
> *"Hi everyone. Bringing traditional equities—like Tesla, Apple, and Nvidia—on-chain is one of the biggest multi-trillion dollar frontiers for Solana. But tokenized RWAs have a fatal flaw: traditional stock markets sleep, while Solana never does.*
>
> *When Wall Street closes on Friday, or when an earnings release halts a stock, continuous order books and AMMs turn into toxic bloodbaths. The moment a shock occurs, latency arbitrageurs, MEV bots, and predatory front-runners pick off passive liquidity before retail investors can even refresh their browser.*
>
> *Continuous double auctions work when markets are liquid and information is continuous. When information is discontinuous, continuous trading breaks."*

### [0:45 - 1:30] The Solution: TwilightBook & The Pyth State Machine
> *"Meet **TwilightBook**—a discrete, uniform-price batch auction protocol that operates as an adaptive state machine powered by Pyth Network.*
>
> *Unlike protocols that simply use Pyth for price displays or liquidations, TwilightBook makes Pyth's **Confidence Interval** the heartbeat of the market. When Pyth's confidence interval expands beyond 200 basis points, or when a market halt is detected, TwilightBook's on-chain circuit immediately suspends continuous trading and transitions the market into a **Twilight Batch Auction**.*
>
> *During the auction epoch:*
> 1. *All traders submit orders inside a dynamic Pyth confidence band ($P_{\text{ref}} \pm 2\sigma$), preventing fat-finger errors and off-market spoofing.*
> 2. *In the final slots, an anti-sniping freeze activates, eliminating last-millisecond order sniping.*
> 3. *At epoch expiry, a permissionless keeper invokes our clearing engine. Every single order clears at a **single uniform price ($P^*$)** that maximizes matched volume ($Q^*$)."*

### [1:30 - 2:30] The Live Cockpit Demo
*(Demonstrator connects Phantom or Solflare wallet on `localhost:3000`)*

> *"Let's see this live in our Trading Cockpit:*
> 1. **Continuous Baseline**: *Notice our market status indicator is currently glowing green in `Continuous` mode. Pyth reports tTSLA at \$214.50 with tight confidence ($\pm \$0.20$).*
> 2. **Simulating Weekend Shock**: *Using our Judge Injection Panel, let's simulate what happens when Sunday afternoon earnings leak: we inject a confidence blowout to $\pm \$6.00$ with Halted status. Instantly, our on-chain circuit trips: the banner turns Twilight Purple, and Epoch 0 begins accepting orders.*
> 3. **Order Placement**: *We place a buy order for 10 shares @ \$214.80. The protocol verifies our limit falls inside the Pyth envelope and escrows quote tokens.*
> 4. **Batch Settlement**: *As the slot counter crosses the epoch end slot, we trigger `Settle Batch Auction`. Look at the transaction logs: in just **78k compute units**, the protocol extracts candidate prices, breaks the volume tie towards Pyth's reference price (\$214.60), and calculates pro-rata fills.*
> 5. **Surplus & Zero-Leakage**: *When we hit `Claim Proceeds`, the buyer doesn't just receive their 10 shares of tTSLA—they receive a **\$2.00 price-improvement cash refund** because the clearing price was lower than their limit! Both vaults land at exactly zero token leakage."*

### [2:30 - 3:00] Conclusion & Rubric Fit
> *"TwilightBook proves that high-performance batch auctions don't belong on an off-chain server—they can run natively, trustlessly, and cheaply on Solana L1.*
> 
> *Our codebase features 26 passing Bankrun tests, a 15-point Invariant Verification Matrix, an audited smart contract, and byte-identical financial precision. Thank you!"*

---

## 2. Browser & Wallet Click-Through Checklist

Run through this checklist in the browser before presenting to ensure 100% readiness:

- [ ] **Step 1: Wallet Connection**
  - Click `Connect Wallet` in the top right header.
  - Verify connected pubkey is displayed and wallet indicator turns green.
- [ ] **Step 2: Check Initial Mode**
  - Verify top status banner shows `Mode: Continuous` or `Mode: BatchAuction`.
  - Check Pyth feed card displaying live price, confidence, and status.
- [ ] **Step 3: Judge Injection Panel**
  - Click `Inject Weekend Shock (Wide Conf / Halted)`. Sign transaction.
  - Click `Evaluate Market Mode`. Verify banner switches to purple `BatchAuction (Twilight Epoch 0)`.
- [ ] **Step 4: Order Submission**
  - In `Place Batch Order`, select `Buy (Bid)`.
  - Enter `Lot Size: 10`, `Limit Price: 214.80`.
  - Click `Submit Order`. Approve transaction in wallet.
  - Verify order appears in the `Active Epoch Orders` table with Escrow status.
- [ ] **Step 5: Anti-Sniping Verification**
  - Observe slot countdown. Attempt to cancel or place an order when remaining slots $< 5$.
  - Confirm the UI disables the buttons or reports `BatchFrozen` protection.
- [ ] **Step 6: Settle Batch Auction**
  - Wait for epoch end slot.
  - Click `Settle Batch Auction`.
  - Verify clearing summary appears: `P* = $214.60`, `Q* = 10 shares`.
- [ ] **Step 7: Claim Proceeds**
  - Click `Claim Order Proceeds`.
  - Verify token accounts receive base tokens and quote refunds.
- [ ] **Step 8: Developer Docs**
  - Click `Docs` in top navigation.
  - Verify architecture, mathematical formulas, and IVM documentation render cleanly.

---

## 3. Contingency & Backup Plan

If RPC latency or wallet extensions experience delays during a live judging session:
1. **Fallback Video / Screencast**: Have a 90-second MP4 recording of the full browser click-through saved locally on desktop ready to play immediately.
2. **Terminal Verification**: Run `npx ts-node -T scripts/e2e_verify.ts` in an open terminal. It runs the entire 7-step sequence in under 10 seconds and prints green checkmarks for every assertion.
3. **Artifact Reference**: Point judges to [`EVIDENCE.md`](./EVIDENCE.md) and [`evidence_run.json`](./evidence_run.json) for cryptographically verified transaction signatures and account derivations.
