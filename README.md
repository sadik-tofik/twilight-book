# TwilightBook

Discrete uniform-price batch auction protocol for tokenized equities on
Solana. Full spec: BRS / SRS / PDR / TDD (see project docs, not included in
this repo).

## Sprint status

- [x] **Sprint 0** — repo scaffold, state structs, error codes, instruction
      contexts with `unimplemented!()`/`todo!()` bodies, test stubs
- [x] **Sprint 1** — `initialize_market` (manual vault-creation CPIs, Market PDA authority, Bankrun tests)
- [x] **Sprint 2** — `evaluate_market_mode` (Pyth circuit evaluator, Bankrun tests)
- [x] **Sprint 3** — `place_batch_order` / `cancel_batch_order` (Pyth confidence band, escrow CPIs, slot freeze, Bankrun tests)
- [x] **Sprint 4** — `math::clearing::solve_uniform_price` + `settle_batch_auction` (uniform clearing engine, tie-break, pro-rata fills, epoch rollover, Bankrun tests)
- [ ] **Sprint 5** — `claim_order_proceeds` + full IVM (15 assertions)
- [ ] **Sprint 6** — frontend cockpit (separate design agent)
- [ ] **Sprint 7** — devnet deploy, security audit, `EVIDENCE.md`

## Toolchain & IDL Patches (`patches/`)

`proc-macro2` and `anchor-syn` are locally patched under `patches/` (configured in root `Cargo.toml` via `[patch.crates-io]`) to fix IDL generation under Rust ≥1.79:
- `anchor-syn`: Resolves `lib.rs` path using `CARGO_MANIFEST_DIR` rather than calling unstable `proc_macro2::Span::source_file().path()` (which was removed in `proc-macro2 >= 1.0.95`).
- `proc-macro2`: Safely falls back to `fallback::SourceFile` rather than referencing `proc_macro::SourceFile` compiler intrinsics that fail when Anchor CLI sets `RUSTC_BOOTSTRAP=1`.

See commit `73d2795` for details. **Do not remove `patches/`** during cleanup — revisit only on a full workspace upgrade to Anchor 0.31+.

## Setup

Requires Rust, Solana CLI 1.18.17, Anchor CLI 0.30.1, Node 18+.

```bash
cp .env.example .env        # fill in ANCHOR_WALLET etc — .env is gitignored
solana-keygen new -o target/deploy/twilight_book-keypair.json
anchor keys list             # copy the printed pubkey into
                              # Anchor.toml [programs.localnet] and
                              # declare_id!() in src/lib.rs — the placeholder
                              # there does NOT match a real keypair yet
npm install
anchor build
npm test
```

## Every `unimplemented!()` / `todo!()` in this repo is intentional

Account contexts (accounts, seeds, constraints) are filled in against the SRS/PDR; handler *logic* is
deferred to the sprint noted in each function's `// TODO(Sprint N)` comment.
`anchor build` should succeed; calling an unimplemented instruction panics on
purpose until its sprint lands.
