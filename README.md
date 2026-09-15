# TwilightBook

Discrete uniform-price batch auction protocol for tokenized equities on
Solana. Full spec: BRS / SRS / PDR / TDD (see project docs, not included in
this repo).

## Sprint status

- [x] **Sprint 0** — repo scaffold, state structs, error codes, instruction
      contexts with `unimplemented!()`/`todo!()` bodies, test stubs
- [ ] **Sprint 1** — `initialize_market`
- [ ] **Sprint 2** — `evaluate_market_mode` (Pyth circuit evaluator)
- [ ] **Sprint 3** — `place_batch_order` / `cancel_batch_order`
- [ ] **Sprint 4** — `math::clearing::solve_uniform_price` + `settle_batch_auction`
- [ ] **Sprint 5** — `claim_order_proceeds` + full IVM (15 assertions)
- [ ] **Sprint 6** — frontend cockpit (separate design agent)
- [ ] **Sprint 7** — devnet deploy, security audit, `EVIDENCE.md`

## Setup

Requires Rust, Solana CLI 1.18.17, Anchor CLI 0.30.1, Node 18+.

```bash
cp .env.example .env        # fill in ANCHOR_WALLET etc — .env is gitignored
solana-keygen new -o target/deploy/twilight_book-keypair.json
anchor keys list             # copy the printed pubkey into
                              # Anchor.toml [programs.localnet] and
                              # declare_id!() in src/lib.rs — the placeholder
                              # there does NOT match a real keypair yet
yarn install
anchor build
anchor test
```

## Every `unimplemented!()` / `todo!()` in this repo is intentional

This is a Sprint 0 scaffold, not a broken build. Account contexts (accounts,
seeds, constraints) are filled in against the SRS/PDR; handler *logic* is
deferred to the sprint noted in each function's `// TODO(Sprint N)` comment.
`anchor build` should succeed; calling an unimplemented instruction panics on
purpose until its sprint lands.
