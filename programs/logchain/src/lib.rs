use anchor_lang::prelude::*;

declare_id!("EPg3oEpf92FNPecbPfX7vkjjNVbNq6NyAdgPj9thL9Mt");

#[program]
pub mod logchain {
    use super::*;

    pub fn anchor_root(
        ctx: Context<AnchorRoot>,
        root: [u8; 32],
        batch_id: u64,
        server_id: String,
        log_count: u64,
    ) -> Result<()> {
        let trail = &mut ctx.accounts.trail;

        require!(
            batch_id == trail.next_batch_id,
            LogChainError::InvalidBatchSequence
        );

        require!(server_id.len() <= 32, LogChainError::ServerIdTooLong);
        require!(log_count > 0 && log_count <= 1000, LogChainError::InvalidLogCount);

        trail.root = root;
        trail.batch_id = batch_id;
        trail.next_batch_id = batch_id + 1;
        trail.server_id = server_id.clone();
        trail.log_count = log_count;
        trail.timestamp = Clock::get()?.unix_timestamp;
        trail.authority = ctx.accounts.authority.key();

        emit!(RootAnchored {
            root,
            batch_id,
            server_id,
            log_count,
            timestamp: trail.timestamp,
        });

        Ok(())
    }

    pub fn close_trail(ctx: Context<CloseTrail>) -> Result<()> {
        let trail = &ctx.accounts.trail;
        require!(trail.authority == ctx.accounts.authority.key(), LogChainError::Unauthorized);
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(batch_id: u64, server_id: String)]
pub struct AnchorRoot<'info> {
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + AuditTrail::INIT_SPACE,
        seeds = [b"logchain-trail", server_id.as_bytes()],
        bump
    )]
    pub trail: Account<'info, AuditTrail>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseTrail<'info> {
    #[account(mut, close = authority)]
    pub trail: Account<'info, AuditTrail>,
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct AuditTrail {
    pub root: [u8; 32],
    pub batch_id: u64,
    pub next_batch_id: u64,
    #[max_len(32)]
    pub server_id: String,
    pub log_count: u64,
    pub timestamp: i64,
    pub authority: Pubkey,
}

#[event]
pub struct RootAnchored {
    pub root: [u8; 32],
    pub batch_id: u64,
    pub server_id: String,
    pub log_count: u64,
    pub timestamp: i64,
}

#[error_code]
pub enum LogChainError {
    #[msg("Batch ID must be sequential")]
    InvalidBatchSequence,
    #[msg("Server ID too long (max 32 chars)")]
    ServerIdTooLong,
    #[msg("Log count must be 1-1000")]
    InvalidLogCount,
    #[msg("Only authority can close")]
    Unauthorized,
}
