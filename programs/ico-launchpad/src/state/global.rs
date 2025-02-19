use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct GlobalPool {
    pub admin: Pubkey,
    pub total_ico_count: u64,
    pub ico_seq_num: u64,
    pub is_paused: u8,    // default 0 - false, 1 - true (paused)
    pub extra: u128,
}

impl GlobalPool {
    pub const DATA_SIZE: usize = 8 + std::mem::size_of::<GlobalPool>();
}
