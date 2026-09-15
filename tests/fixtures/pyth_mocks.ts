// Sprint 2: byte-level Pyth PriceFeed account mocks for Bankrun tests.
//
// Needs to produce raw account data matching pyth-sdk-solana's on-chain
// layout so `evaluate_market_mode`'s zero-copy deserialization can read it
// directly — a JSON/object mock won't work here, it has to be real bytes.
//
// Planned exports:
//   mockPythAccount({ price, conf, status, publishTime }): AccountInfo
//   TRADING_TIGHT_CONF   — status=Trading, conf/price well under 200bps
//   TRADING_WIDE_CONF    — status=Trading, conf/price over 200bps (forces BatchAuction)
//   HALTED               — status=Halted
//   STALE                — publishTime > 60s in the past

export {};
