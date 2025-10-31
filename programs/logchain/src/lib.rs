use anchor_lang::prelude::*;

declare_id!("EPg3oEpf92FNPecbPfX7vkjjNVbNq6NyAdgPj9thL9Mt");

#[program]
pub mod logchain {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
