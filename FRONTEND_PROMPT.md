# TwilightBook — Cockpit + Docs Site Build Prompt

You're building the Next.js frontend for **TwilightBook**, a Solana program
(Anchor) that runs a 24/7 tokenized-equity market, switching between
continuous AMM-style swaps and discrete uniform-price batch auctions
depending on live Pyth oracle data. The on-chain program is complete and
tested — your job is the frontend only. Do not modify the Anchor program.

This prompt covers TWO deliverables: the trading cockpit, and a developer
documentation site. Build both in the same app.

---

## PART A — Design System (read this before building anything)

**Role:** Act as a senior product designer building a professional trading
terminal — think Bloomberg Terminal, TradingView, or a Vercel dashboard, not
a marketing landing page. The judging criterion that matters most is "could
this be a real app people use" — every visual choice should read as
*credible infrastructure*, not spectacle. Restraint is the differentiator
here, not maximalism.

### Palette (exact hex — do not substitute)

| Token | Hex | Use |
|---|---|---|
| `bg-base` | `#0B0D10` | App background |
| `bg-surface` | `#131619` | Cards, panels |
| `bg-surface-raised` | `#1B1F24` | Modals, dropdowns |
| `border-subtle` | `#242A30` | Card borders, dividers |
| `text-primary` | `#EDEFF2` | Headings, primary values |
| `text-muted` | `#8A919C` | Labels, secondary text |
| `accent-continuous` | `#3ECF8E` | Continuous/CLMM mode — market open, calm |
| `accent-twilight` | `#B98CE8` | Batch Auction mode — the "twilight" violet from the project name |
| `accent-danger` | `#E5544D` | Errors, rejected orders, frozen-window warnings |
| `accent-neutral` | `#5B8DEF` | Links, informational highlights |

### Typography

- **Headings / UI labels:** `Inter` (or `Geist Sans` if available) — tight
  tracking, weights 500-700 only. No decorative serif anywhere; this is not
  an editorial site.
- **All numbers — prices, lot sizes, slot counts, addresses, timestamps:**
  `JetBrains Mono` or `IBM Plex Mono`. Every single price, balance, and
  countdown digit on screen must be monospace, tabular-nums. This one rule
  does more for "looks like a real trading app" than anything else here —
  proportional-width numbers jittering as they update reads as amateur.
- **No italic, no serif, no display/drama fonts.** This is the opposite
  register of a cinematic landing page — the fonts should disappear into
  the data.

### Fixed rules (never change once set)

- `rounded-lg` (8px) on cards, `rounded-full` only on status pills and the
  countdown ring. No large soft-UI radii — sharp, structural corners read
  as "instrument," not "consumer app."
- No noise overlays, no glassmorphism, no custom cursor, no particle
  backgrounds. Flat, high-contrast, dark surfaces.
- Motion budget is small and functional, not decorative:
  - Numbers that change (price, countdown, balances) animate with a brief
    `150ms ease-out` count-up/count-down, never a hard cut.
  - The Market State Badge (Continuous vs Twilight) crossfades over
    `200ms` on change — this is the one moment worth a beat of polish,
    because it's the entire value proposition.
  - The countdown ring updates every second, no easing needed (it's a
    literal clock, not a decorative animation).
  - Nothing else moves. No hover-lift, no magnetic buttons, no scroll-
    triggered reveals. A trading terminal that animates on scroll reads as
    unserious.
- Status colors are the ONLY color-coding in the UI. Don't invent a second
  accent system for anything else — if it's not Continuous/Twilight/
  danger/informational, it's `text-muted` or `text-primary`, full stop.

### Why this direction, stated plainly

A hackathon judge sees dozens of submissions in one sitting. The ones that
read as "a real trading venue" beat the ones that read as "a cool demo,"
because the rubric literally asks "could this be a real app." Restraint,
monospace numbers, and a calm dark palette are what real trading
infrastructure looks like — TradingView, dYdX, Bloomberg. Save visual
flourish for a marketing page this project doesn't have yet.

---

## PART B — The Cockpit (trading UI)

### Source of truth

After `anchor build`, the IDL at `target/idl/twilight_book.json` and the
generated types at `target/types/twilight_book.ts` are authoritative for
every account shape and instruction signature below. If anything here
conflicts with the IDL, the IDL wins.

### On-chain data shapes (from the IDL)

**Market** (PDA: `["market", base_mint, quote_mint]`)
- `mode`: `{ continuous: {} }` | `{ batchAuction: {} }` — the central UI state
- `currentEpoch: u64`
- `epochDurationSlots: u64` (default 75, ~30s at 400ms/slot)
- `maxConfBps: u64` (default 200 = 2.00%) — threshold that flips mode
- `confFilterMult: u64` (default 2, the "k" in the confidence band)
- `pythFeed`, `baseMint`, `quoteMint`, `vaultBase`, `vaultQuote`: pubkeys

**EpochBatchState** (PDA: `["batch", market, epoch_id_le_bytes]`)
- `status`: `{ acceptingOrders: {} }` | `{ frozen: {} }` | `{ settled: {} }` | `{ voided: {} }`
- `startSlot`, `endSlot: u64` — the countdown ring's range
- `totalBidVolume`, `totalAskVolume: u64` — depth chart bars
- `clearingPrice: u64` (6-decimal fixed point, 0 until Settled) — P*
- `matchedVolume: u64` — Q*
- `orderCount: u16`, `orders: BatchOrder[32]` (fixed-size array — entries past `orderCount` are meaningless, and any entry with `lotSize === 0` within `orderCount` is a cancelled order, not a real one — filter both out)

**BatchOrder** (embedded, not a standalone account)
- `user: Pubkey`, `side: { bid: {} } | { ask: {} }`, `lotSize`, `limitPrice`, `filledLotSize: u64`, `claimed: bool`

### Price/amount encoding — get this wrong and every number is off by 10^6

Every price and lot size is a **plain u64 representing a 6-decimal fixed
point number**, NOT SPL token base-unit decimals (though it happens to
match this project's 6-decimal mints). `214_500_000` means $214.50.
`10_000_000` lot size means 10 shares. Divide by `1_000_000` for display;
multiply by `1_000_000` and round to an integer before sending a
`BN`/instruction argument. Use `BN` (from `@coral-xyz/anchor`) for all of
these in instruction calls, not plain JS numbers.

### Instructions you'll call

`program.methods.<name>(...).accounts({...}).rpc()` per Anchor's standard
client pattern, camelCase as the IDL exposes them:

- `initializeMarket(maxConfBps, epochDurationSlots, confFilterMult)` — one-time setup, likely a deploy script, not the live UI
- `evaluateMarketMode()` — permissionless; call periodically (a button or a background poll every few seconds) to re-check Pyth and flip `market.mode`
- `placeBatchOrder(side, lotSize, limitPrice)` — `side` is `{ bid: {} }` or `{ ask: {} }`. **Only enabled when `market.mode === { batchAuction: {} }`** — gate the button, don't rely on the transaction failing to communicate that
- `cancelBatchOrder(orderIndex)` — reverts inside the last 10 slots before `epochBatch.endSlot` (anti-sniping freeze window) — disable the button once inside that window
- `settleBatchAuction()` — permissionless keeper action, only valid once `currentSlot >= epochBatch.endSlot` — a "Settle Now" button disabled/hidden until the countdown hits zero
- `claimOrderProceeds(orderIndex)` — only valid once `status` is `settled` or `voided`
- `setMockOracle(price, conf, expo, status, publishTime)` — **DEMO CONTROLS ONLY**, not part of the real protocol — see below

### Required UI (PDR §8)

1. **Market State Badge** — the single most important element. `Continuous`
   uses `accent-continuous`, `Batch Auction` uses `accent-twilight`. Crossfade
   per the motion rules above.
2. **Pyth Uncertainty Band Indicator** — oracle price, confidence (sigma),
   and the resulting `[P_ref - k*sigma, P_ref + k*sigma]` band. You'll need
   to decode the raw Pyth account yourself for display (same byte layout as
   `tests/fixtures/pyth_mocks.ts` — ask for that file if you need exact
   offsets); no instruction returns this as plain numbers.
3. **Countdown Ring** — time remaining until `epochBatch.endSlot`. Poll
   `connection.getSlot()` and estimate `(endSlot - currentSlot) * 0.4s`;
   don't present it as more precise than that.
4. **Depth Chart** — `totalBidVolume` vs `totalAskVolume`, plus the band from #2.
5. **Order form** — side toggle, amount, limit price, validated client-side
   against the confidence band before submitting (the program rejects
   out-of-band prices with `OrderPriceExceedsConfidenceBand`; catching it
   client-side is much better UX than a failed transaction).
6. **Judge injection controls** — small, clearly separate panel; not
   something a real user would see.

### Demo controls — exact values

`expo=-6` for all. `publishTime` = current Unix seconds (`now`), or
`now - 300` for a stale-feed demo.

- **"Simulate Market Open"**: `price=214_500_000, conf=200_000, status=1, publishTime=now`
- **"Simulate Weekend Shock"**: `price=214_500_000, conf=6_000_000, status=1, publishTime=now` (~2798 bps, forces BatchAuction)
- **"Simulate Market Halt"** (optional third): same as first but `status=2`

`setMockOracle` doesn't itself update `market.mode` — chain a call to
`evaluateMarketMode()` right after, or make both steps obvious to the
demo operator.

### Not your responsibility

- Deploying the program / running `initializeMarket` — assume a deploy
  script already created Market, vaults, and the mock oracle account
- Any Anchor/Rust changes — flag mismatches with the IDL rather than guess
- Wallet adapter specifics — standard `@solana/wallet-adapter-react` against devnet

---

## PART C — Documentation Site (`/docs`)

Build a `/docs` route in the same app, modeled closely on
**solana.com/docs** — not "docs-flavored," structurally the same pattern:

- **Persistent top nav** with sections: `Start Here` / `Core Concepts` /
  `Instructions` (their equivalent of "API") / `Security`. Same idea as
  Solana's `Start here / Concepts / API / Finance / Resources`.
- **Left sidebar**, page tree within the active top-nav section.
- **Right-rail table of contents** generated from the page's own headings,
  sticky while scrolling.
- **`Cmd+K` search** (a real search index if you have time; a simple
  client-side fuzzy filter over page titles/headings is an acceptable
  fallback under deadline pressure).
- **Feedback widget** at the bottom of each page ("Is this page helpful?
  Yes/No"), plus an **"Edit Page"** link pointing at the corresponding file
  in the GitHub repo.
- **Prev/Next breadcrumb links** at the bottom of every page, in
  reading order.
- Dark mode by default, matching Part A's palette exactly — this is one
  continuous product, not a themed sub-site.
- Code blocks: monospace font from Part A, syntax highlighting, a copy
  button on hover — standard, don't over-design this.

If your framework has a docs-specific toolkit available (Fumadocs, Nextra,
or similar) and it's already in your stack, prefer it over hand-rolling
sidebar/TOC/search logic — it's the same category of tool
solana.com/docs itself is built on.

### Page tree and content

```
/docs
|-- Start Here
|   |-- index                 -- what TwilightBook is, one paragraph, link out
|   |-- quick-start           -- clone, anchor build, anchor test, devnet deploy
|   `-- architecture          -- the diagram + one-paragraph explanation below
|-- Core Concepts
|   |-- continuous-vs-twilight  -- why the mode switch exists at all
|   |-- uniform-price-clearing  -- P*/Q* in plain language, the tie-break rule
|   `-- confidence-bands        -- what k*sigma means and why orders get rejected
|-- Instructions
|   |-- initialize-market
|   |-- evaluate-market-mode
|   |-- place-batch-order
|   |-- cancel-batch-order
|   |-- settle-batch-auction
|   `-- claim-order-proceeds
`-- Security
    |-- invariants            -- the IVM's core invariants, in prose
    `-- known-limitations     -- pro-rata rounding dust, demo-only mock oracle
```

Each **Instructions** page follows one fixed template (same discipline as
solana.com/docs's RPC method pages — one shape, repeated):

```
## <instruction_name>

One-sentence purpose.

### Accounts
| Account | Type | Notes |
(pulled directly from the IDL -- don't hand-write these, generate them)

### Arguments
| Name | Type | Meaning |

### Errors it can return
| Error | When |

### Example
```ts
// a real, working snippet using @coral-xyz/anchor
```
```

### Content for Core Concepts and Architecture pages

Use this as the actual prose — don't invent different explanations, this
is the accurate version:

**continuous-vs-twilight.mdx**: Traditional markets close roughly 135 hours
a week. Tokenized equities on Solana don't — but the price feed backing
them does effectively "close" too: Pyth's confidence interval widens or
the feed halts. A continuous AMM pool left running against a stale price
during that window is exactly the setup for adverse selection — someone
with real news trades against a price that hasn't moved. TwilightBook's
`evaluate_market_mode` watches Pyth's own status and confidence width and
switches the market into discrete batch auctions the moment the feed
stops being trustworthy for continuous pricing, then switches back once
it isn't.

**uniform-price-clearing.mdx**: Every order in a batch clears at ONE
price — not the price each trader named, the single price that matches
the most volume. Walk through the actual worked example from
`tests/bankrun/uniform_clearing.test.ts` (bids 10@$214.80 + 5@$214.50
against asks 8@$214.20 + 10@$214.60 clearing at $214.60 for 10 shares)
as a concrete illustration, including the tie-break rule (nearest to the
oracle reference price wins a tie in matched volume).

**confidence-bands.mdx**: `P_min = P_ref - k*sigma`, `P_max = P_ref + k*sigma`.
Any limit price outside that band is rejected before it ever reaches the
order book — this is what stops someone from placing an order against a
price the oracle itself doesn't trust.

**architecture.mdx**: reuse the PDR §1 architecture diagram (ASCII in the
source docs — redraw it as a real diagram, don't ship ASCII art in a
polished docs site) and the one-paragraph description of the Pyth circuit
evaluator sitting between continuous swaps and the batch ring buffer.

### Security page content

Pull directly from the project's Threat Model / STRIDE table and the IVM —
present the 5 core invariants and the 5 threat/mitigation pairs as
readable prose tables, not a raw copy-paste of the source spec's
markdown tables. `known-limitations.mdx` must state plainly, in these
words or close to them: pro-rata fills can leave up to `(n-1)` atoms of
rounding dust per side at a tied clearing price, always reclaimable via
`claim_order_proceeds`, never lost; and `set_mock_oracle` is a demo-only
instruction with no authority gating, never part of a real deployment.
