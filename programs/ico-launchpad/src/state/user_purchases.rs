use anchor_lang::prelude::*;

use super::IcoState;

#[account]
#[derive(Default)]
pub struct UserPurchase {
    pub seed: u64,
    pub buyer: Pubkey,
    pub ico: Pubkey,
    pub buy_amount: u64,    // purchased ico token amount
    pub buy_date: i64,      // purchased time
    pub bonus: u64,         // generated bonus when purchase
    pub locked_amount: u64, // vesting locked amount when purchase
    pub total_claimed: u64, // total claimed of unlocked amounts
    pub extra: u128,
}

impl UserPurchase {
    pub const DATA_SIZE: usize = 8 + std::mem::size_of::<UserPurchase>();

    pub fn get_unlocked(&mut self, ico_pot: &IcoState) -> u64 {
        if self.locked_amount == 0 {
            // vesting not used
            return 0;
        }

        let cliff_finish = self.buy_date + ico_pot.cliff_period;
        let now = Clock::get().unwrap().unix_timestamp;
        if cliff_finish > now {
            // no unlocked during cliff period
            return 0;
        }

        let intervals = (now - cliff_finish)
            .checked_div(ico_pot.vesting_interval)
            .unwrap()
            + 1;
        let mut total_unlocked = self
            .locked_amount
            .checked_mul(intervals as u64)
            .unwrap()
            .checked_mul(ico_pot.vesting_percentage as u64)
            .unwrap()
            / 10000;

        if total_unlocked > self.locked_amount {
            total_unlocked = self.locked_amount;
        }

        return total_unlocked.checked_sub(self.total_claimed).unwrap();
    }
}
