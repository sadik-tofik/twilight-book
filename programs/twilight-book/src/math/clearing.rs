use crate::state::epoch_batch::{BatchOrder, OrderSide};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ClearingResult {
    Voided,
    Settled { clearing_price: u64, matched_volume: u64 },
}

// TDD §2 "Deterministic Discrete Uniform Price Clearance". Deliberately NOT
// implemented in Sprint 0 — this is the CU-riskiest routine in the whole
// program (O(N^2) scan across <=32 candidate prices, worst-case 520k CU per
// PDR §5). Sprint 4 should write this + a standalone CU-profiling harness
// BEFORE wiring it into settle_batch_auction, so a bad worst-case shows up
// as a failing unit test rather than as locked funds on devnet (RSK-02).
#[allow(dead_code)]
pub fn solve_uniform_price(
    orders: &[BatchOrder],
    order_count: usize,
    p_ref: u64,
    p_min: u64,
    p_max: u64,
) -> ClearingResult {
    let _ = (orders, order_count, p_ref, p_min, p_max);
    todo!("Sprint 4: uniform price clearing engine, TDD §2")
}

// NOTE: SRS 7.2.2 requires checked arithmetic with panic-revert on overflow,
// not saturating/wrapping ops — these stubs will need to return
// Result<u64, TwilightError> (via checked_add) once implemented in Sprint 4,
// not silently clamp.
#[allow(dead_code)]
fn demand_at(orders: &[BatchOrder], order_count: usize, p: u64) -> u64 {
    orders[..order_count]
        .iter()
        .filter(|o| o.side == OrderSide::Bid && o.limit_price >= p)
        .fold(0u64, |acc, o| acc.checked_add(o.lot_size).expect("overflow"))
}

#[allow(dead_code)]
fn supply_at(orders: &[BatchOrder], order_count: usize, p: u64) -> u64 {
    orders[..order_count]
        .iter()
        .filter(|o| o.side == OrderSide::Ask && o.limit_price <= p)
        .fold(0u64, |acc, o| acc.checked_add(o.lot_size).expect("overflow"))
}
