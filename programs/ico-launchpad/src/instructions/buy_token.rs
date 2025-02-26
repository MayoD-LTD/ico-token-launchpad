use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

use crate::*;

#[derive(Accounts)]
#[instruction(seed: u64)]
pub struct BuyToken<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(
        seeds = [GLOBAL_AUTHORITY_SEED.as_bytes()],
        bump,
    )]
    pub global_pool: Box<Account<'info, GlobalPool>>,

    #[account(
        mut,
        seeds = [ICO_POT_SEED.as_bytes(), seed.to_le_bytes().as_ref()],
        bump,
        has_one = ico_mint,
        has_one = cost_mint,
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

    #[account(init,
        seeds = [USER_PURCHASE_SEED.as_bytes(), ico_pot.key().to_bytes().as_ref(), ico_pot.purchase_seq_num.to_le_bytes().as_ref()],
        bump,
        payer = buyer,
        space = UserPurchase::DATA_SIZE,
    )]
    pub user_purchase: Box<Account<'info, UserPurchase>>,

    #[account(init_if_needed,
        associated_token::mint = ico_mint,
        associated_token::authority = buyer,
        associated_token::token_program = ico_token_program,
        payer = buyer,
    )]
    pub buyer_ico_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(mut,
        associated_token::mint = ico_mint,
        associated_token::authority = ico_pot,
        associated_token::token_program = ico_token_program,
    )]
    pub ico_token_vault: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(mut,
        associated_token::mint = cost_mint,
        associated_token::authority = buyer,
        associated_token::token_program = cost_token_program,
    )]
    pub buyer_cost_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(mut,
        associated_token::mint = cost_mint,
        associated_token::authority = ico_pot,
        associated_token::token_program = cost_token_program,
    )]
    pub cost_escrow_vault: Box<InterfaceAccount<'info, TokenAccount>>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub ico_token_program: Interface<'info, TokenInterface>,
    pub cost_token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

impl BuyToken<'_> {
    pub fn process_instruction(
        ctx: &mut Context<Self>,
        seed: u64,
        amount_to_buy: u64,
    ) -> Result<()> {
        let global_pool = &mut ctx.accounts.global_pool;
        let ico_pot = &mut ctx.accounts.ico_pot;
        let user_purchase = &mut ctx.accounts.user_purchase;

        // stop if launchpad is paused
        require!(global_pool.is_paused == 0, LaunchpadError::IsPaused);

        // stop if ico pot is closed
        require!(ico_pot.is_closed == 0, LaunchpadError::PotIsClosed);

        let now = Clock::get().unwrap().unix_timestamp;
        require!(ico_pot.start_date < now, LaunchpadError::InvalidSalePeriod);
        require!(
            ico_pot.end_date == 0 || ico_pot.end_date > now,
            LaunchpadError::InvalidSalePeriod
        );

        let (available_amount, amount_to_pay) = ico_pot.get_value(amount_to_buy);
        // all ico tokens sold out
        require!(available_amount > 0, LaunchpadError::NoAvailableTokens);

        // insufficient cost token
        require!(
            ctx.accounts.buyer_cost_account.amount > amount_to_pay,
            LaunchpadError::InsufficientTokenBalance
        );

        // pay cost token
        transfer_checked(
            CpiContext::new(
                ctx.accounts.cost_token_program.to_account_info(),
                TransferChecked {
                    from: ctx.accounts.buyer_cost_account.to_account_info(),
                    mint: ctx.accounts.cost_mint.to_account_info(),
                    to: ctx.accounts.cost_escrow_vault.to_account_info(),
                    authority: ctx.accounts.buyer.to_account_info(),
                },
            ),
            amount_to_pay,
            ctx.accounts.cost_mint.decimals,
        )?;

        // update ico state
        ico_pot.total_received = ico_pot.total_received.checked_add(amount_to_pay).unwrap();
        ico_pot.total_sold = ico_pot.total_sold.checked_add(available_amount).unwrap();

        // calculate bonus
        let bonus = ico_pot.get_bonus(available_amount);

        // calculate unlocked
        let (unlocked, locked) = ico_pot.get_unlocked(available_amount.checked_add(bonus).unwrap());

        let now = Clock::get().unwrap().unix_timestamp;
        user_purchase.seed = ico_pot.purchase_seq_num;
        user_purchase.buyer = ctx.accounts.buyer.key();
        user_purchase.ico = ico_pot.key();
        user_purchase.buy_amount = available_amount;
        user_purchase.buy_date = now;
        user_purchase.bonus = bonus;
        // allocate vesting
        user_purchase.locked_amount = locked;

        // transfer unlocked ico tokens
        require!(
            ctx.accounts.ico_token_vault.amount >= unlocked,
            LaunchpadError::InsufficientTokenBalance
        );
        let inner_seeds = [
            ICO_POT_SEED.as_bytes(),
            &seed.to_le_bytes(),
            &[ctx.bumps.ico_pot],
        ];
        let signer_seeds = &[&inner_seeds[..]];
        transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.ico_token_program.to_account_info(),
                TransferChecked {
                    from: ctx.accounts.ico_token_vault.to_account_info(),
                    mint: ctx.accounts.ico_mint.to_account_info(),
                    to: ctx.accounts.buyer_ico_account.to_account_info(),
                    authority: ico_pot.to_account_info(),
                },
                signer_seeds,
            ),
            unlocked,
            ctx.accounts.ico_mint.decimals,
        )?;

        ico_pot.purchase_seq_num += 1;

        Ok(())
    }
}
