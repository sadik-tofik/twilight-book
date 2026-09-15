use anchor_lang::prelude::*;

use crate::state::*;

// REQ-F02: permissionless. Reads Pyth; flips Market.mode; rolls epoch_id
// forward and inits a new EpochBatchState when entering/continuing BatchAuction.
#[derive(Accounts)]
pub struct EvaluateMarketMode<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,

    /// CHECK: must equal market.pyth_feed; deserialized via pyth-sdk-solana.
    #[account(address = market.pyth_feed)]
    pub pyth_feed: UncheckedAccount<'info>,

    // TODO(Sprint 2): add `#[account(init_if_needed, ...)] epoch_batch:
    // Account<'info, EpochBatchState>` at seeds [BATCH_SEED, market,
    // (market.current_epoch + 1).to_le_bytes()] once epoch rollover is wired up.
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<EvaluateMarketMode>) -> Result<()> {
    // TODO(Sprint 2), per SRS 4.2 REQ-F02:
    // 1. Zero-copy deserialize ctx.accounts.pyth_feed via pyth-sdk-solana.
    // 2. Staleness: current_timestamp - publish_time <= 60s, else force BatchAuction.
    // 3. UncertaintyBps = (conf / price) * 10_000.
    // 4. status != Trading OR UncertaintyBps >= market.max_conf_bps
    //      => mode = BatchAuction (roll epoch if past end_slot)
    //    else => mode = Continuous
    let _ = ctx;
    unimplemented!("Sprint 2: Pyth circuit evaluation")
}
