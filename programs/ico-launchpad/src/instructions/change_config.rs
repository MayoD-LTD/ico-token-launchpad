use crate::*;

#[derive(Accounts)]
pub struct ChangeConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_bytes()],
        bump,
        has_one = admin @ LaunchpadError::InvalidAdmin,
    )]
    pub global_pool: Box<Account<'info, GlobalPool>>,
}

impl ChangeConfig<'_> {
    pub fn process_instruction(ctx: &mut Context<Self>, paused: u8) -> Result<()> {
        let global_pool = &mut ctx.accounts.global_pool;

        global_pool.is_paused = paused;

        Ok(())
    }
}
