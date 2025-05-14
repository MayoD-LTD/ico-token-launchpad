pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use error::*;
pub use instructions::*;
pub use state::*;

declare_id!("HXfrMHGx97CqoHidGSNcHvdn2GWcgdaVKkT6S42bMAhX");

#[program]
pub mod ico_launchpad {
    use super::*;

    /**
     * Initialize global pool
     */
    pub fn initialize(mut ctx: Context<Initialize>) -> Result<()> {
        Initialize::process_instruction(&mut ctx)
    }

    /** Admin can transfer admin authority */
    pub fn transfer_admin(mut ctx: Context<TransferAdmin>, new_admin: Pubkey) -> Result<()> {
        TransferAdmin::process_instruction(&mut ctx, new_admin)
    }

    /** Admin can change global config */
    pub fn change_config(mut ctx: Context<ChangeConfig>, paused: u8) -> Result<()> {
        ChangeConfig::process_instruction(&mut ctx, paused)
    }

    /** Create ICO pot */
    pub fn create_ico(mut ctx: Context<CreateIco>, params: CreateIcoParams) -> Result<()> {
        CreateIco::process_instruction(&mut ctx, params)
    }

    /** Close ICO pot with owner authority */
    pub fn close_ico(mut ctx: Context<CloseIco>, seed: u64) -> Result<()> {
        CloseIco::process_instruction(&mut ctx, seed)
    }

    /** Purchase ico token by paying cost token */
    pub fn buy_token(mut ctx: Context<BuyToken>, seed: u64, amount: u64, ref_code: String) -> Result<()> {
        BuyToken::process_instruction(&mut ctx, seed, amount, ref_code)
    }

    /** Claim unlocked token as buyer */
    pub fn claim(mut ctx: Context<Claim>, ico_seed: u64, purchase_seed: u64) -> Result<()> {
        Claim::process_instruction(&mut ctx, ico_seed, purchase_seed)
    }

    /** Withdraw cost token collection as owner */
    pub fn withdraw_cost(mut ctx: Context<WithdrawCost>, seed: u64) -> Result<()> {
        WithdrawCost::process_instruction(&mut ctx, seed)
    }

    /** Force withdraw all tokens from Ico pot as admin */
    pub fn rescue_token(mut ctx: Context<RescueToken>, seed: u64) -> Result<()> {
        RescueToken::process_instruction(&mut ctx, seed)
    }
}
