use anchor_lang::prelude::*;

#[error_code]
pub enum LaunchpadError {
    #[msg("Admin address dismatch")]
    InvalidAdmin,
    #[msg("Admin paused whole launchpad")]
    IsPaused,
    #[msg("ICO date configs should be future time")]
    InvalidDateConfig,
    #[msg("Token account balance insufficient")]
    InsufficientTokenBalance,
    #[msg("Percentage value should less than 10000 = 100%")]
    InvalidPercentageValue,
    #[msg("ICO owner does not match with passed address")]
    InvalidIcoOwner,
    #[msg("All ICO tokens sold out")]
    NoAvailableTokens,
    #[msg("ICO is closed by owner or admin")]
    PotIsClosed,
    #[msg("ICO is closed already")]
    AlreadyClosed,
    #[msg("User purchase ICO pot address not matched with passed account")]
    IncorrectIcoAddress,
    #[msg("ICO not started or already ended")]
    InvalidSalePeriod,
    #[msg("ICO amount and reserve should not zero")]
    InvalidAmountConfig,
}
