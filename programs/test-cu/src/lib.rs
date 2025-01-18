use anchor_lang::prelude::*;

use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

declare_id!("1pvpzSKwaEk6D29zse1qWfUUACmPnqzEpVEEudWX3m3");

#[program]
pub mod test_cu {
    use super::*;

    pub fn test_cu_consumption(_ctx: Context<TestCUConsumption>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct TestCUConsumption<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,

    #[account(mint::token_program = token_program)]
    pub mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        init,
        payer = sender,
        associated_token::mint = mint,
        associated_token::authority = sender,
        associated_token::token_program = token_program
    )]
    pub sender_ata: Box<InterfaceAccount<'info, TokenAccount>>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}
