use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

use crate::*;

#[derive(Accounts)]
#[instruction(seed: u64)]
pub struct WithdrawCost<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        seeds = [ICO_POT_SEED.as_bytes(), seed.to_le_bytes().as_ref()],
        bump,
        has_one = cost_mint,
    )]
    pub ico_pot: Box<Account<'info, IcoState>>,

    #[account(
        mint::token_program = token_program,
    )]
    pub cost_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(init_if_needed,
        associated_token::mint = cost_mint,
        associated_token::authority = authority,
        associated_token::token_program = token_program,
        payer = authority,
    )]
    pub authority_ico_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(mut,
        associated_token::mint = cost_mint,
        associated_token::authority = ico_pot,
        associated_token::token_program = token_program,
    )]
    pub cost_escrow_vault: Box<InterfaceAccount<'info, TokenAccount>>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl WithdrawCost<'_> {
    pub fn process_instruction(ctx: &mut Context<Self>, seed: u64) -> Result<()> {
        // check ico authority
        require!(
            ctx.accounts.ico_pot.owner.eq(&ctx.accounts.authority.key()),
            LaunchpadError::InvalidIcoOwner
        );

        // withdraw cost tokens from escrow vault
        let inner_seeds = [
            ICO_POT_SEED.as_bytes(),
            &seed.to_le_bytes(),
            &[ctx.bumps.ico_pot],
        ];
        let signer_seeds = &[&inner_seeds[..]];
        transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                TransferChecked {
                    from: ctx.accounts.cost_escrow_vault.to_account_info(),
                    mint: ctx.accounts.cost_mint.to_account_info(),
                    to: ctx.accounts.authority_ico_account.to_account_info(),
                    authority: ctx.accounts.ico_pot.to_account_info(),
                },
                signer_seeds,
            ),
            ctx.accounts.cost_escrow_vault.amount,
            ctx.accounts.cost_mint.decimals,
        )?;

        Ok(())
    }
}
