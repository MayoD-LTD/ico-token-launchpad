use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub struct CreateIcoParams {
    pub amount: u64,
    pub start_price: u64,
    pub end_price: u64,
    pub start_date: i64,
    pub end_date: i64,

    pub bonus_reserve: u64,
    pub bonus_percentage: u16,
    pub bonus_activator: u16,

    pub unlock_percentage: u16,
    pub cliff_period: i64,
    pub vesting_percentage: u16,
    pub vesting_interval: i64,
}

#[account]
#[derive(Default)]
pub struct IcoState {
    pub seed: u64,     // id of ICO
    pub owner: Pubkey, //  address of ICO owner (creator) who will receive payment tokens

    pub ico_mint: Pubkey,  // ICO token
    pub ico_decimals: u64, // decimal of ICO  - 10 ^ 9 default
    pub amount: u64,       // amount of token to sell

    pub cost_mint: Pubkey, // if address(0) - native coin
    pub start_price: u64,  // price of 1 token in cost tokens
    pub end_price: u64, // if 0 then price is fixed, else price grows liner from startPrice to endPrice based on sold tokens.
    pub start_date: i64, // timestamp when ICO starts. The date must be in future.
    pub end_date: i64, // timestamp when ICO ends, if 0 then ICO will be active until sell all tokens

    pub bonus_reserve: u64, // amount of tokens that will be used for bonus. Bonus will be paid until it's available
    pub bonus_percentage: u16, // percent of bonus (with 2 decimals) which will be added to bought amount. I.e. 2500 = 25%
    pub bonus_activator: u16, // percent of total ICO tokens that should be bought to activate bonus (with 2 decimals). I.e. 1000 = 10%
    // Let say total amount of tokens on this ICO is 1,000,000, so to receive bonus a user should buy at least 100,000 tokens at ones (10%)
    pub is_closed: u8, // ICO is closed

    pub total_sold: u64,     // total amount of sold tokens
    pub total_received: u64, // total amount received (in paymentToken)

    // parameters of vesting
    pub unlock_percentage: u16, // percentage (with 2 decimals) of initially unlocked token. I.e. 500 means 5% unlocked and 95% will go to vesting, 10000 means 100% unlocked (vesting will not be used)
    pub cliff_period: i64, // cliff period (in seconds). The first release will be after this time.
    pub vesting_percentage: u16, // percentage (with 2 decimals) of locked tokens will be unlocked every interval I.e. 500 means 5% per vestingInterval
    pub vesting_interval: i64,   // interval (in seconds) of vesting (i.e. 2592000 = 30 days)

    pub purchase_seq_num: u64, // seq num to identify users purchases

    pub extra: u128,
}

impl IcoState {
    pub const DATA_SIZE: usize = 8 + std::mem::size_of::<IcoState>();

    // return value of cost token to pay for the ico tokens amount
    pub fn get_value(&self, amount: u64) -> (u64, u64) {
        let mut available_amount = self.amount - self.total_sold;

        if amount < available_amount {
            available_amount = amount;
        }

        if self.end_price == 0 {
            // fixed price
            let value = available_amount
                .checked_mul(self.start_price)
                .unwrap()
                .checked_div(self.ico_decimals)
                .unwrap();
            return (available_amount, value);
        } else {
            let current_price = self.start_price
                + (self.end_price - self.start_price)
                    .checked_mul(self.total_sold)
                    .unwrap()
                    .checked_div(self.amount)
                    .unwrap();
            let executed_end_price = self.start_price
                + (self.end_price - self.start_price)
                    .checked_mul(self.total_sold + available_amount)
                    .unwrap()
                    .checked_div(self.amount)
                    .unwrap();
            let value = available_amount
                .checked_mul(current_price + executed_end_price)
                .unwrap()
                .checked_div(2 * self.ico_decimals)
                .unwrap();
            return (available_amount, value);
        }
    }

    pub fn get_bonus(&mut self, amount: u64) -> u64 {
        if self.bonus_reserve == 0 {
            return 0;
        }

        let bonus_condition = self
            .amount
            .checked_mul(self.bonus_activator as u64)
            .unwrap()
            / 10000;

        if bonus_condition <= amount {
            let mut bonus = amount.checked_mul(self.bonus_percentage as u64).unwrap() / 10000;
            if bonus > self.bonus_reserve {
                bonus = self.bonus_reserve;
            }
            self.bonus_reserve -= bonus;
            return bonus;
        }

        return 0;
    }

    pub fn get_unlocked(&self, amount: u64) -> (u64, u64) {
        let unlocked = amount.checked_mul(self.unlock_percentage as u64).unwrap() / 10000;
        (unlocked, amount - unlocked)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ico_calc() -> Result<()> {
        let mut mockup: IcoState = IcoState {
            seed: 0,
            owner: Pubkey::default(),

            ico_mint: Pubkey::default(),
            ico_decimals: 1_000_000_000,   // decimal is 9
            amount: 1_000_000_000_000_000, // 1M tokens

            cost_mint: Pubkey::default(),
            start_price: 1_000_000_000, // 1 cost token for 1 ICO token
            end_price: 0,               // use fixed price
            start_date: 10000,          // current timestamp mockup
            end_date: 0,                // selling until all tokens are sold

            bonus_reserve: 1_000_000_000_000, // use 1k tokens as bonus
            bonus_percentage: 10,             // 0.1% of total bonus reserve
            bonus_activator: 100,             // 1% of total ICO tokens amount

            is_closed: 0, // 1 is closed

            total_sold: 0,
            total_received: 0,

            unlock_percentage: 10000, // not use vesting
            cliff_period: 0,
            vesting_percentage: 0,
            vesting_interval: 0,

            purchase_seq_num: 0, // increase sequantly every purchase

            extra: 0, // extra space for version upgrade
        };

        let test_amount = 1_000_000_000;
        let big_test_amount = 100_000_000_000_000;
        let (available, cost_value) = mockup.get_value(test_amount);
        assert_eq!(available, test_amount);
        assert_eq!(cost_value, test_amount);

        let bonus = mockup.get_bonus(big_test_amount);
        assert_eq!(bonus, 100_000_000_000);

        let (unlocked, locked) = mockup.get_unlocked(big_test_amount);
        assert_eq!(unlocked, big_test_amount);
        assert_eq!(locked, 0);

        Ok(())
    }
}
