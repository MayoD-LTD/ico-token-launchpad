use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

use crate::*;

#[derive(Accounts)]
#[instruction(ico_seed: u64, purchase_seed: u64)]
pub struct Claim<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(
        seeds = [GLOBAL_AUTHORITY_SEED.as_bytes()],
        bump,
    )]
    pub global_pool: Box<Account<'info, GlobalPool>>,

    #[account(
        seeds = [ICO_POT_SEED.as_bytes(), ico_seed.to_le_bytes().as_ref()],
        bump,
        has_one = ico_mint,
    )]
    pub ico_pot: Box<Account<'info, IcoState>>,

    #[account(
        mint::token_program = token_program,
    )]
    pub ico_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(mut,
        seeds = [USER_PURCHASE_SEED.as_bytes(), purchase_seed.to_le_bytes().as_ref()],
        bump,
    )]
    pub user_purchase: Box<Account<'info, UserPurchase>>,

    #[account(init_if_needed,
        associated_token::mint = ico_mint,
        associated_token::authority = buyer,
        associated_token::token_program = token_program,
        payer = buyer,
    )]
    pub buyer_ico_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(mut,
        associated_token::mint = ico_mint,
        associated_token::authority = ico_pot,
        associated_token::token_program = token_program,
    )]
    pub ico_token_vault: Box<InterfaceAccount<'info, TokenAccount>>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl Claim<'_> {
    pub fn process_instruction(
        ctx: &mut Context<Self>,
        ico_seed: u64,
        _purchase_seed: u64,
    ) -> Result<()> {
        let global_pool = &mut ctx.accounts.global_pool;
        let ico_pot = &mut ctx.accounts.ico_pot;
        let user_purchase = &mut ctx.accounts.user_purchase;

        require!(
            user_purchase.ico.eq(&ico_pot.key()),
            LaunchpadError::IncorrectIcoAddress
        );

        // stop if launchpad is paused
        require!(global_pool.is_paused == 0, LaunchpadError::IsPaused);

        // stop if ico pot is closed
        require!(ico_pot.is_closed == 0, LaunchpadError::PotIsClosed);

        let claim_amount = user_purchase.get_unlocked(ico_pot);

        // no unlocked claims
        require!(claim_amount > 0, LaunchpadError::NoAvailableTokens);

        require!(
            ctx.accounts.ico_token_vault.amount >= claim_amount,
            LaunchpadError::InsufficientTokenBalance
        );

        user_purchase.total_claimed = user_purchase
            .total_claimed
            .checked_add(claim_amount)
            .unwrap();

        // claim unlocked ico tokens
        let inner_seeds = [
            ICO_POT_SEED.as_bytes(),
            &ico_seed.to_le_bytes(),
            &[ctx.bumps.ico_pot],
        ];
        let signer_seeds = &[&inner_seeds[..]];
        transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                TransferChecked {
                    from: ctx.accounts.ico_token_vault.to_account_info(),
                    mint: ctx.accounts.ico_mint.to_account_info(),
                    to: ctx.accounts.buyer_ico_account.to_account_info(),
                    authority: ico_pot.to_account_info(),
                },
                signer_seeds,
            ),
            claim_amount,
            ctx.accounts.ico_mint.decimals,
        )?;

        Ok(())
    }
}
