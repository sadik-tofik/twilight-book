use anchor_lang::prelude::*;
use anchor_spl::token_interface::{TokenAccount, TokenInterface};

use crate::state::*;

// REQ-F07
#[derive(Accounts)]
pub struct ClaimOrderProceeds<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    pub market: Box<Account<'info, Market>>,

    #[account(mut)]
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

pub fn handler(ctx: Context<ClaimOrderProceeds>, order_index: u16) -> Result<()> {
    // TODO(Sprint 5), per SRS 4.1 REQ-F07:
    // 1. assert epoch_batch.status == Settled (or Voided, for 100% refund path)
    // 2. assert order belongs to user and !claimed (else OrderOwnerMismatch / OrderAlreadyClaimed)
    // 3. compute owed base/quote from filled_lot_size vs. clearing_price
    // 4. CPI transfer vault -> user ATA (Checks-Effects-Interactions: set
    //    claimed = true BEFORE the transfer CPI, per SRS 7.2.3)
    let _ = (ctx, order_index);
    unimplemented!("Sprint 5: claim_order_proceeds")
}
