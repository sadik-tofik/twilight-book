use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

use crate::state::*;

// REQ-F04
#[derive(Accounts)]
pub struct PlaceBatchOrder<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    pub market: Box<Account<'info, Market>>,

    #[account(
        mut,
        seeds = [BATCH_SEED, market.key().as_ref(), market.current_epoch.to_le_bytes().as_ref()],
        bump
    )]
    pub epoch_batch: Box<Account<'info, EpochBatchState>>,

    /// CHECK: must equal market.pyth_feed; read for confidence-band validation.
    #[account(address = market.pyth_feed)]
    pub pyth_feed: UncheckedAccount<'info>,

    #[account(mut, address = market.vault_base)]
    pub vault_base: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut, address = market.vault_quote)]
    pub vault_quote: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(mut)]
    pub user_base_ata: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut)]
    pub user_quote_ata: Box<InterfaceAccount<'info, TokenAccount>>,

    pub base_mint: Box<InterfaceAccount<'info, Mint>>,
    pub quote_mint: Box<InterfaceAccount<'info, Mint>>,
    pub token_program: Interface<'info, TokenInterface>,
}

pub fn handler(
    ctx: Context<PlaceBatchOrder>,
    side: OrderSide,
    lot_size: u64,
    limit_price: u64,
) -> Result<()> {
    // TODO(Sprint 3), per SRS 4.2 REQ-F04:
    // 1. assert market.mode == BatchAuction (else NotInBatchMode)
    // 2. assert epoch_batch.status == AcceptingOrders
    // 3. assert current_slot < epoch_batch.end_slot - FREEZE_WINDOW_SLOTS (else BatchFrozen)
    // 4. assert epoch_batch.order_count < MAX_ORDERS_PER_BATCH (else BatchFull)
    // 5. load Pyth P_ref, sigma; assert limit_price in
    //    [P_ref - k*sigma, P_ref + k*sigma] (else OrderPriceExceedsConfidenceBand)
    // 6. CPI transfer: Bid -> quote from user_quote_ata to vault_quote,
    //    Ask -> base from user_base_ata to vault_base (checked_mul for amounts)
    // 7. write BatchOrder at orders[order_count], increment order_count
    let _ = (ctx, side, lot_size, limit_price);
    unimplemented!("Sprint 3: place_batch_order")
}

// REQ-F05
#[derive(Accounts)]
pub struct CancelBatchOrder<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    pub market: Box<Account<'info, Market>>,

    #[account(
        mut,
        seeds = [BATCH_SEED, market.key().as_ref(), market.current_epoch.to_le_bytes().as_ref()],
        bump
    )]
    pub epoch_batch: Box<Account<'info, EpochBatchState>>,

    #[account(mut, address = market.vault_base)]
    pub vault_base: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut, address = market.vault_quote)]
    pub vault_quote: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(mut)]
    pub user_base_ata: Box<InterfaceAccount<'info, TokenAccount>>,
    #[account(mut)]
    pub user_quote_ata: Box<InterfaceAccount<'info, TokenAccount>>,

    pub token_program: Interface<'info, TokenInterface>,
}

pub fn cancel_handler(ctx: Context<CancelBatchOrder>, order_index: u16) -> Result<()> {
    // TODO(Sprint 3), per SRS 4.1 REQ-F05:
    // 1. assert current_slot < epoch_batch.end_slot - FREEZE_WINDOW_SLOTS (else BatchFrozen)
    // 2. assert order belongs to user (else OrderOwnerMismatch)
    // 3. CPI transfer escrowed amount back to user's ATA, zero the order slot
    let _ = (ctx, order_index);
    unimplemented!("Sprint 3: cancel_batch_order")
}
