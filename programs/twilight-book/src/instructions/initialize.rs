use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenInterface};

use crate::state::*;

// REQ-F01: initializes Market PDA, binds Pyth feed, configures vault escrows via CPI.
#[derive(Accounts)]
pub struct InitializeMarket<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = Market::SIZE,
        seeds = [MARKET_SEED, base_mint.key().as_ref(), quote_mint.key().as_ref()],
        bump
    )]
    pub market: Box<Account<'info, Market>>,

    pub base_mint: Box<InterfaceAccount<'info, Mint>>,
    pub quote_mint: Box<InterfaceAccount<'info, Mint>>,

    /// CHECK: initialized via CPI in handler (Sprint 1)
    #[account(
        mut,
        seeds = [VAULT_BASE_SEED, market.key().as_ref()],
        bump,
    )]
    pub vault_base: UncheckedAccount<'info>,

    /// CHECK: initialized via CPI in handler (Sprint 1)
    #[account(
        mut,
        seeds = [VAULT_QUOTE_SEED, market.key().as_ref()],
        bump,
    )]
    pub vault_quote: UncheckedAccount<'info>,

    /// CHECK: validated in `handler` (Sprint 2) via pyth-sdk-solana's
    /// zero-copy PriceFeed deserialization, not by Anchor's account macro.
    pub pyth_feed: UncheckedAccount<'info>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitializeMarket>,
    max_conf_bps: u64,
    epoch_duration_slots: u64,
    conf_filter_mult: u64,
) -> Result<()> {
    // TODO(Sprint 1):
    // - populate ctx.accounts.market fields (authority, mints, vaults,
    //   pyth_feed, mode = Continuous, current_epoch = 0, bump)
    // - validate epoch_duration_slots / conf_filter_mult are non-zero and sane
    // - store PDA bump via ctx.bumps.market
    let _ = (ctx, max_conf_bps, epoch_duration_slots, conf_filter_mult);
    unimplemented!("Sprint 1: Market state population")
}
