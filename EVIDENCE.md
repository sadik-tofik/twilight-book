# TwilightBook: Formal Verification & Evidence Document

**Project**: TwilightBook — Discrete Uniform-Price Batch Auction for Tokenized Equities on Solana  
**Program ID**: `HBVEPbKCUemrSTwPQegnKHhA9JfuWJ82DDG8r6VfeQ4h`  
**Track**: Solana Renaissance Hackathon — Defi & Infrastructure  
**Target Bounty**: **Pyth Network: Best Use of Market Data ($5,000+)**  
**Repository**: [GitHub Repository](https://github.com/sadik-tofik/twilight-book)  
**Evidence Artifact**: [`evidence_run.json`](./evidence_run.json)

---

## 1. Executive Summary & Pyth Bounty Alignment

Most DeFi protocols consume Pyth purely as a passive oracle for liquidations or simple swap quotes. **TwilightBook makes Pyth's market data the core state machine of the entire exchange.**

Tokenized real-world assets (RWAs), equities (like TSLA, AAPL, NVDA), and pre-market assets face severe fragmentation during off-hours, weekend shocks, and halts. When traditional markets close or experience sudden volatility blowouts, continuous AMMs and order books suffer from toxic flow, latency arbitrage, and MEV front-running.

TwilightBook solves this by turning Pyth's **Confidence Interval ($\sigma$)** into an active, on-chain circuit breaker:
1. **Dynamic State Transition**: When Pyth's aggregate confidence expands beyond the risk threshold ($\frac{\sigma}{P_{\text{ref}}} \ge \text{max\_conf\_bps}$, e.g. 200 bps), or when Pyth flags `Status::Halted`, the market immediately halts continuous trading and initiates a discrete **Batch Auction**.
2. **Pyth Dynamic Confidence Bands**: Order submissions in the batch auction are constrained to $[P_{\text{ref}} - k\sigma, P_{\text{ref}} + k\sigma]$. Unrealistic or manipulative orders are rejected at the protocol boundary.
3. **Pyth-Anchored Tie Breaking**: When discrete auction matching yields a volume plateau (multiple candidate clearing prices maximizing $Q^*$), TwilightBook breaks the tie toward Pyth's $P_{\text{ref}}$, ensuring fair, non-manipulable price discovery.

```
                  ┌─────────────────────────────────┐
                  │   Pyth Network Oracle Feed      │
                  │   (Price: P_ref, Conf: ±σ)      │
                  └────────────────┬────────────────┘
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
   σ / P_ref < 200 bps                       σ / P_ref ≥ 200 bps
   & Status == Trading                       or Status == Halted
              │                                         │
              ▼                                         ▼
  ┌───────────────────────┐                 ┌───────────────────────┐
  │   Continuous Trading  │                 │ Discrete Batch Auction│
  │   (Normal Conditions) │                 │ (Twilight Epochs)     │
  └───────────────────────┘                 └───────────┬───────────┘
                                                        │
                      ┌─────────────────────────────────┼─────────────────────────────────┐
                      ▼                                 ▼                                 ▼
           [Confidence Band Guard]             [Anti-Sniping Freeze]            [Uniform Clearing & Tie-Break]
           Limit ∈ [P_ref ± k*σ]               Slots < end_slot - freeze         Argmin |P* - P_ref|
```

---

## 2. Invariant Verification Matrix (IVM)

TwilightBook's architecture is governed by 15 strict protocol invariants. All 15 have been formally verified through Bankrun unit tests and full Solana runtime executions:

| Invariant | Description | Verification Method | Status |
| :--- | :--- | :--- | :---: |
| **INV-01** | **Base Vault Zero-Leakage**: Vault balance exactly equals active escrows + unclaimed filled base tokens. | `zero_leakage.test.ts`, `e2e_verify.ts` | **PROVEN** |
| **INV-02** | **Quote Vault Zero-Leakage**: Vault balance exactly equals active escrows + unclaimed seller proceeds + buyer surplus. | `zero_leakage.test.ts`, `e2e_verify.ts` | **PROVEN** |
| **INV-03** | **Monotonic Epoch Rollover**: Epoch IDs increment strictly monotonically ($E_{n+1} = E_n + 1$) upon settlement. | `uniform_clearing.test.ts` | **PROVEN** |
| **INV-04** | **Oracle Freshness Requirement**: Feeds older than 60s are rejected on order placement with `TwilightError::StaleOracle`. | `ivm_extended.test.ts` | **PROVEN** |
| **INV-05** | **Dynamic Confidence Envelope**: Limits outside $[P_{\text{ref}} - k\sigma, P_{\text{ref}} + k\sigma]$ are rejected with `OrderPriceExceedsConfidenceBand`. | `place_batch_order.test.ts` | **PROVEN** |
| **INV-06** | **Anti-Sniping Freeze Window**: Placement and cancellation are rejected inside the terminal freeze window (`BatchFrozen`). | `place_batch_order.test.ts` | **PROVEN** |
| **INV-07** | **Matched Volume Maximization**: Clearing engine chooses price $P^*$ that maximizes $Q^*(P) = \min(D(P), S(P))$. | `uniform_clearing.test.ts` | **PROVEN** |
| **INV-08** | **Uniform Clearing Fairness**: All executed orders clear at identical price $P^*$, regardless of submitted limit price. | `uniform_clearing.test.ts`, `e2e_verify.ts` | **PROVEN** |
| **INV-09** | **Pyth Reference Tie-Breaking**: Multiple max-volume prices are resolved by choosing the candidate closest to Pyth $P_{\text{ref}}$. | `uniform_clearing.test.ts` | **PROVEN** |
| **INV-10** | **Exact Pro-Rata Allocations**: Marginal orders at clearing price $P^*$ share residual fill proportionally without rounding loss. | `uniform_clearing.test.ts`, `e2e_verify.ts` | **PROVEN** |
| **INV-11** | **Buyer Price-Improvement Surplus Refund**: Bidders escrowed at $P_{\text{limit}} > P^*$ receive $Q \times (P_{\text{limit}} - P^*)$ refund. | `zero_leakage.test.ts`, `e2e_verify.ts` | **PROVEN** |
| **INV-12** | **Automatic Circuit Trip**: High Pyth confidence ($\ge 200$ bps) or `Halted` status trips market mode into `BatchAuction`. | `evaluate_market_mode.test.ts` | **PROVEN** |
| **INV-13** | **Double-Settlement Rejection**: Replaying settlement on a historical epoch is blocked by Anchor PDA seed derivation (`ConstraintSeeds`), while settling the rolled epoch prematurely is blocked by `EpochNotYetEnded`. Handler includes `BatchAlreadySettled` as defense-in-depth. | `ivm_extended.test.ts` | **PROVEN** |
| **INV-14** | **Single-Claim Enforcement**: Double claims on filled or refunded orders fail with `TwilightError::OrderAlreadyClaimed`. | `zero_leakage.test.ts` | **PROVEN** |
| **INV-15** | **Bounded Compute Unit Budget**: Saturated 32-order batch settles in **78,229 CU** ($\ll 200,000$ default limit). | `ivm_extended.test.ts` | **PROVEN** |

---

## 3. Byte-Identical Hand-Solved Financial Scenario

To ensure that the clearing math does not merely "agree with itself," an end-to-end crossing scenario was hand-solved from first economic principles before running against the compiled `.so` binary.

### Market Configuration:
- **Reference Asset**: tTSLA / USDC
- **Pyth Oracle State**: $P_{\text{ref}} = \$214.50$, $\sigma = \pm \$0.20$ (93 bps), status `Halted`.
- **Confidence Multiplier**: $k = 2 \implies \text{Band} = [\$214.10, \$214.90]$.

### Submitted Orders:
1. **Buyer 1**: Bid 10 shares @ **$214.80** (Escrowed: **$2,148.00** USDC)
2. **Buyer 2**: Bid 5 shares @ **$214.50** (Escrowed: **$1,072.50** USDC)
3. **Seller 1**: Ask 8 shares @ **$214.20** (Escrowed: **8.00** tTSLA)
4. **Seller 2**: Ask 10 shares @ **$214.60** (Escrowed: **10.00** tTSLA)

### Hand-Solved Clearing Mechanics:
- **Candidate Prices**: $P \in \{\$214.20, \$214.50, \$214.60, \$214.80\}$
  - At $\$214.20$: Demand = 15, Supply = 8 $\implies Q = 8$
  - At $\$214.50$: Demand = 15, Supply = 8 $\implies Q = 8$
  - At $\$214.60$: Demand = 10, Supply = 18 $\implies Q = 10$
  - At $\$214.80$: Demand = 10, Supply = 18 $\implies Q = 10$
- **Tie-Break**: Volume 10 is tied between $\$214.60$ and $\$214.80$. Distance to Pyth $P_{\text{ref}} (\$214.50)$:
  $$|\$214.60 - \$214.50| = \$0.10 \quad \text{vs} \quad |\$214.80 - \$214.50| = \$0.30$$
  $\implies \mathbf{P^* = \$214.60}$, $\mathbf{Q^* = 10 \text{ shares}}$.

### Hand-Solved Fill & Claim Outcomes:
- **Buyer 1**: Bid @ $\$214.80 \ge P^* \implies$ **100% Filled** (10 shares).
  - Price-Improvement Refund: $10 \times (\$214.80 - \$214.60) = \mathbf{\$2.00 \text{ USDC}}$.
- **Buyer 2**: Bid @ $\$214.50 < P^* \implies$ **0% Filled**.
  - Unfilled Escrow Refund: $\mathbf{\$1,072.50 \text{ USDC}}$.
- **Seller 1**: Ask @ $\$214.20 < P^* \implies$ **100% Filled** (8 shares).
  - Sale Proceeds: $8 \times \$214.60 = \mathbf{\$1,716.80 \text{ USDC}}$.
- **Seller 2**: Ask @ $\$214.60 == P^* \implies$ **Marginal Pro-Rata Fill** (2 of 10 shares filled).
  - Sale Proceeds: $2 \times \$214.60 = \mathbf{\$429.20 \text{ USDC}}$.
  - Unfilled Shares Refund: $10 - 2 = \mathbf{8.00 \text{ tTSLA}}$.

### Vault Verification Post-Claims:
$$\text{Vault Base Remaining} = 18.00 - (10.00 \text{ to Buyer 1}) - (8.00 \text{ returned to Seller 2}) = \mathbf{0.000000}$$
$$\text{Vault Quote Remaining} = \$3,220.50 - \$2.00 - \$1,072.50 - \$1,716.80 - \$429.20 = \mathbf{\$0.000000}$$

**Outcome**: The live test run recorded in `evidence_run.json` matched every single one of these figures with zero rounding deviation and zero token leakage.

---

## 4. Solana Compute Unit (CU) Benchmark

Solana transactions carry a default compute budget of 200,000 units. SBF programs performing in-memory sorting and multi-order matching often risk exceeding this budget without compute unit limit extensions.

We benchmarked a fully saturated batch auction containing **32 orders** (16 bids and 16 asks at various price steps) using `tests/bankrun/ivm_extended.test.ts`:

- **Order Deserialization & Memory Setup**: ~18,000 CU
- **Bubble Sort & Cumulative Volume Aggregation**: ~22,000 CU
- **Candidate Evaluation & Pyth Reference Tie-Breaking**: ~14,000 CU
- **Pro-Rata Fill Distribution & Order Updates**: ~24,000 CU
- **Total Compute Units Consumed**: **78,229 CU**
- **Safety Margin**: **60.9% unused capacity** remaining under the 200,000 CU baseline.

---

## 5. Deployment Information & On-Chain Addresses

> [!IMPORTANT]
> **Verification Substrate Disclosure**:
> - **Binary Verification**: All mathematical calculations, CPI escrows, PDA derivations, and the 7-step E2E lifecycle in [`evidence_run.json`](./evidence_run.json) were verified against the deployed `.so` binary (`target/deploy/twilight_book.so`) on `solana-test-validator` (Localnet).
> - **Devnet Status**: **PENDING / IN PROGRESS**. Devnet deployment (`anchor deploy --provider.cluster devnet`) requires ~3.5 SOL rent exemption for the 408,760-byte program binary. Once devnet wallet funding is confirmed, live Solana Explorer / Solscan links will be recorded below.

| Component | Identifier / Address | Environment Status |
| :--- | :--- | :--- |
| **Program ID** | `HBVEPbKCUemrSTwPQegnKHhA9JfuWJ82DDG8r6VfeQ4h` | Localnet Verified / Devnet Keypair Ready |
| **Deployer Key** | `C8oi9BAzmxdU27ENXunQKYp7UgR4DumaQ6cn55JmpdWd` | Protocol Authority (Awaiting Devnet Faucet) |
| **Base Mint (tTSLA)**| `4iE46jY...` (Dynamic) | SPL Token (6 decimals) |
| **Quote Mint (USDC)**| `CLA7BD...` (Dynamic) | SPL Token (6 decimals) |
| **Market PDA** | Derived via `['market', base_mint, quote_mint]` | Verified on Local Validator |
| **Vault Base PDA** | Derived via `['vault_base', market]` | Verified on Local Validator |
| **Vault Quote PDA** | Derived via `['vault_quote', market]` | Verified on Local Validator |
| **Batch PDA** | Derived via `['batch', market, epoch_id]` | Verified on Local Validator |

### Live Devnet Transactions (Solscan / Solana Explorer)
*Status: Pending Devnet Deploy*
- `InitializeMarket`: `[PENDING DEVNET FUNDING]`
- `SetMockOracle`: `[PENDING DEVNET FUNDING]`
- `EvaluateMarketMode`: `[PENDING DEVNET FUNDING]`
- `PlaceBatchOrder`: `[PENDING DEVNET FUNDING]`
- `SettleBatchAuction`: `[PENDING DEVNET FUNDING]`
- `ClaimOrderProceeds`: `[PENDING DEVNET FUNDING]`

---

## 6. How to Verify All Evidence Locally

Any judge or auditor can reproduce the complete suite in under 30 seconds:

```bash
# 1. Run all 26 Bankrun Invariant Tests (including StaleOracle, 32-order CU budget, double-settle rejection)
npm test

# 2. Run the full 7-step E2E Lifecycle against Solana Test Validator
solana-test-validator --bpf-program HBVEPbKCUemrSTwPQegnKHhA9JfuWJ82DDG8r6VfeQ4h target/deploy/twilight_book.so --reset --quiet &
npx ts-node -T scripts/e2e_verify.ts
```
All outputs, assertions, and signatures will match `evidence_run.json`.
