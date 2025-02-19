use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

use crate::*;

#[derive(Accounts)]
#[instruction(seed: u64)]
pub struct RescueToken<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_bytes()],
        bump,
    )]
    pub global_pool: Box<Account<'info, GlobalPool>>,

    #[account(
        mut,
        seeds = [ICO_POT_SEED.as_bytes(), seed.to_le_bytes().as_ref()],
        bump,
        has_one = ico_mint,
    )]
    pub ico_pot: Box<Account<'info, IcoState>>,

    #[account(
        mint::token_program = token_program,
    )]
    pub ico_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(init_if_needed,
        associated_token::mint = ico_mint,
        associated_token::authority = admin,
        associated_token::token_program = token_program,
        payer = admin,
    )]
    pub admin_ico_account: Box<InterfaceAccount<'info, TokenAccount>>,

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

impl RescueToken<'_> {
    pub fn process_instruction(ctx: &mut Context<Self>, seed: u64) -> Result<()> {
        let global_pool = &mut ctx.accounts.global_pool;

        // check ico admin
        require!(
            global_pool.admin.eq(&ctx.accounts.admin.key()),
            LaunchpadError::InvalidAdmin
        );

        // resue all token from ico
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
                    from: ctx.accounts.ico_token_vault.to_account_info(),
                    mint: ctx.accounts.ico_mint.to_account_info(),
                    to: ctx.accounts.admin_ico_account.to_account_info(),
                    authority: ctx.accounts.ico_pot.to_account_info(),
                },
                signer_seeds,
            ),
            ctx.accounts.ico_token_vault.amount,
            ctx.accounts.ico_mint.decimals,
        )?;

        Ok(())
    }
}
