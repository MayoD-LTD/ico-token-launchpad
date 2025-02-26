use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

use crate::*;

#[derive(Accounts)]
pub struct CreateIco<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_bytes()],
        bump,
    )]
    pub global_pool: Box<Account<'info, GlobalPool>>,

    #[account(
        init,
        space = IcoState::DATA_SIZE,
        seeds = [ICO_POT_SEED.as_bytes(), global_pool.ico_seq_num.to_le_bytes().as_ref()],
        bump,
        payer = creator
    )]
    pub ico_pot: Box<Account<'info, IcoState>>,

    #[account(
        mint::token_program = ico_token_program,
    )]
    pub ico_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mint::token_program = cost_token_program,
    )]
    pub cost_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(mut,
        associated_token::mint = ico_mint,
        associated_token::authority = creator,
        associated_token::token_program = ico_token_program,
    )]
    pub creator_ico_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(init,
        associated_token::mint = ico_mint,
        associated_token::authority = ico_pot,
        associated_token::token_program = ico_token_program,
        payer = creator
    )]
    pub ico_token_vault: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(init,
        associated_token::mint = cost_mint,
        associated_token::authority = ico_pot,
        associated_token::token_program = cost_token_program,
        payer = creator,
    )]
    pub cost_escrow_vault: Box<InterfaceAccount<'info, TokenAccount>>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub ico_token_program: Interface<'info, TokenInterface>,
    pub cost_token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl CreateIco<'_> {
    pub fn process_instruction(ctx: &mut Context<Self>, params: CreateIcoParams) -> Result<()> {
        let global_pool = &mut ctx.accounts.global_pool;
        let ico_pot = &mut ctx.accounts.ico_pot;

        // stop if launchpad is paused
        require!(global_pool.is_paused == 0, LaunchpadError::IsPaused);

        ico_pot.seed = global_pool.ico_seq_num;
        ico_pot.owner = ctx.accounts.creator.key();

        ico_pot.ico_mint = ctx.accounts.ico_mint.key();
        ico_pot.ico_decimals = (10 as u64).pow(ctx.accounts.ico_mint.decimals as u32);
        ico_pot.amount = params.amount;

        ico_pot.cost_mint = ctx.accounts.cost_mint.key();

        let now = Clock::get().unwrap().unix_timestamp;
        require!(params.start_date > now, LaunchpadError::InvalidDateConfig);
        require!(
            params.end_date == 0 || params.end_date > params.start_date,
            LaunchpadError::InvalidDateConfig
        );
        ico_pot.start_price = params.start_price;
        ico_pot.end_price = params.end_price;
        ico_pot.start_date = params.start_date;
        ico_pot.end_date = params.end_date;

        require!(
            params.bonus_percentage <= 10000,
            LaunchpadError::InvalidPercentageValue
        );
        require!(
            params.bonus_activator <= 10000,
            LaunchpadError::InvalidPercentageValue
        );
        ico_pot.bonus_reserve = params.bonus_reserve;
        ico_pot.bonus_percentage = params.bonus_percentage;
        ico_pot.bonus_activator = params.bonus_activator;

        let deposit_amount = params.amount.checked_add(params.bonus_reserve).unwrap();
        require!(
            ctx.accounts.creator_ico_account.amount >= deposit_amount,
            LaunchpadError::InsufficientTokenBalance
        );
        // deposit ico tokens
        transfer_checked(
            CpiContext::new(
                ctx.accounts.ico_token_program.to_account_info(),
                TransferChecked {
                    from: ctx.accounts.creator_ico_account.to_account_info(),
                    mint: ctx.accounts.ico_mint.to_account_info(),
                    to: ctx.accounts.ico_token_vault.to_account_info(),
                    authority: ctx.accounts.creator.to_account_info(),
                },
            ),
            deposit_amount,
            ctx.accounts.ico_mint.decimals,
        )?;

        require!(
            params.unlock_percentage <= 10000,
            LaunchpadError::InvalidPercentageValue
        );
        ico_pot.unlock_percentage = params.unlock_percentage;
        require!(params.cliff_period >= 0, LaunchpadError::InvalidDateConfig);
        ico_pot.cliff_period = params.cliff_period;
        require!(
            params.vesting_percentage <= 10000,
            LaunchpadError::InvalidPercentageValue
        );
        ico_pot.vesting_percentage = params.vesting_percentage;
        require!(
            params.vesting_interval > 0,
            LaunchpadError::InvalidDateConfig
        );
        ico_pot.vesting_interval = params.vesting_interval;

        global_pool.total_ico_count += 1;
        global_pool.ico_seq_num += 1;

        Ok(())
    }
}
