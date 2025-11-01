use anchor_lang::prelude::*;
use sha2::{Digest, Sha256};

declare_id!("9zoLvF6r9jcLwYQhvR1SDh6Nwk9NXLNncHCETaHk7sMi");

#[program]
pub mod logchain {
    use super::*;

    pub fn register_server(
        ctx: Context<RegisterServer>,
        server_id: String,
        description: String,
    ) -> Result<()> {
        let server = &mut ctx.accounts.server_account;

        require!(server_id.len() <= 32, LogChainError::ServerIdTooLong);
        require!(description.len() <= 100, LogChainError::DescriptionTooLong);

        server.authority = ctx.accounts.authority.key();
        server.server_id = server_id;
        server.description = description;
        server.is_active = true;
        server.registered_at = Clock::get()?.unix_timestamp;
        server.stake = ctx.accounts.stake.lamports();
        server.entry_count = 0;
        server.last_entry_hash = [0; 32];
        server.last_anchor_slot = 0;

        Ok(())
    }

    pub fn add_log_entry(ctx: Context<AddLogEntry>, entry_data: Vec<u8>) -> Result<()> {
        let server = &mut ctx.accounts.server_account;

        require!(server.is_active, LogChainError::ServerInactive);
        require!(
            server.authority == ctx.accounts.authority.key(),
            LogChainError::Unauthorized
        );
        require!(entry_data.len() <= 1024, LogChainError::EntryTooLarge);

        let mut hasher = Sha256::new();
        hasher.update(&server.last_entry_hash);
        hasher.update(&entry_data);
        let entry_hash = hasher.finalize();
        let entry_hash_bytes: [u8; 32] = entry_hash.as_slice().try_into().unwrap();

        let log_entry = &mut ctx.accounts.log_entry;
        log_entry.server = server.key();
        log_entry.entry_index = server.entry_count;
        log_entry.timestamp = Clock::get()?.unix_timestamp;
        log_entry.entry_hash = entry_hash_bytes;
        log_entry.previous_hash = server.last_entry_hash;
        log_entry.data_hash = {
            let mut hasher = Sha256::new();
            hasher.update(&entry_data);
            let hash = hasher.finalize();
            hash.as_slice().try_into().unwrap()
        };

        server.last_entry_hash = entry_hash_bytes;
        server.entry_count += 1;

        emit!(LogEntryAdded {
            server: server.key(),
            entry_index: log_entry.entry_index,
            entry_hash: entry_hash_bytes,
            timestamp: log_entry.timestamp,
        });

        Ok(())
    }

    pub fn anchor_batch(ctx: Context<AnchorBatch>, batch_id: u64, log_count: u64) -> Result<()> {
        let server = &ctx.accounts.server_account;
        let trail = &mut ctx.accounts.trail;

        require!(server.is_active, LogChainError::ServerInactive);
        require!(
            server.authority == ctx.accounts.authority.key(),
            LogChainError::Unauthorized
        );
        require!(
            batch_id == trail.next_batch_id,
            LogChainError::InvalidBatchSequence
        );
        require!(
            log_count > 0 && log_count <= 10000,
            LogChainError::InvalidLogCount
        );
        require!(
            server.entry_count >= trail.entries_anchored + log_count,
            LogChainError::InsufficientEntries
        );

        trail.server = server.key();
        trail.batch_id = batch_id;
        trail.next_batch_id = batch_id + 1;
        trail.root_hash = server.last_entry_hash;
        trail.entries_in_batch = log_count;
        trail.entries_anchored = trail.entries_anchored + log_count;
        trail.timestamp = Clock::get()?.unix_timestamp;
        trail.authority = ctx.accounts.authority.key();
        trail.anchor_slot = Clock::get()?.slot;

        emit!(RootAnchored {
            server: server.key(),
            batch_id,
            root_hash: server.last_entry_hash,
            entries_in_batch: log_count,
            entries_anchored: trail.entries_anchored,
            timestamp: trail.timestamp,
        });

        Ok(())
    }

    pub fn verify_entry(ctx: Context<VerifyEntry>) -> Result<()> {
        let log_entry = &ctx.accounts.log_entry;
        let server = &ctx.accounts.server_account;

        require!(
            log_entry.server == server.key(),
            LogChainError::EntryServerMismatch
        );
        require!(server.is_active, LogChainError::ServerInactive);

        emit!(EntryVerified {
            server: server.key(),
            entry_index: log_entry.entry_index,
            entry_hash: log_entry.entry_hash,
            verified_at: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    pub fn close_trail(ctx: Context<CloseTrail>) -> Result<()> {
        let trail = &ctx.accounts.trail;

        require!(
            trail.authority == ctx.accounts.authority.key(),
            LogChainError::Unauthorized
        );

        Ok(())
    }

    pub fn deactivate_server(ctx: Context<DeactivateServer>) -> Result<()> {
        let server = &mut ctx.accounts.server_account;

        require!(
            server.authority == ctx.accounts.authority.key(),
            LogChainError::Unauthorized
        );
        require!(server.is_active, LogChainError::ServerInactive);

        server.is_active = false;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(server_id: String, description: String)]
pub struct RegisterServer<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + ServerAccount::INIT_SPACE,
        seeds = [b"server", server_id.as_bytes()],
        bump,
    )]
    pub server_account: Account<'info, ServerAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        constraint = stake.to_account_info().owner == &System::id(),
        constraint = stake.lamports() >= 100_000_000,
    )]
    /// CHECK: The stake account is only used to verify the minimum stake amount and ownership by the system program.
    pub stake: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddLogEntry<'info> {
    #[account(mut)]
    pub server_account: Account<'info, ServerAccount>,

    #[account(
        init,
        payer = authority,
        space = 8 + LogEntry::INIT_SPACE,
    )]
    pub log_entry: Account<'info, LogEntry>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(batch_id: u64)]
pub struct AnchorBatch<'info> {
    #[account(mut)]
    pub server_account: Account<'info, ServerAccount>,

    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + AuditTrail::INIT_SPACE,
        seeds = [b"logchain-trail", server_account.key().as_ref()],
        bump
    )]
    pub trail: Account<'info, AuditTrail>,

    #[account(mut)]
    pub authority: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VerifyEntry<'info> {
    pub log_entry: Account<'info, LogEntry>,
    pub server_account: Account<'info, ServerAccount>,
}

#[derive(Accounts)]
pub struct CloseTrail<'info> {
    #[account(mut, close = authority)]
    pub trail: Account<'info, AuditTrail>,

    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeactivateServer<'info> {
    #[account(mut)]
    pub server_account: Account<'info, ServerAccount>,

    #[account(mut)]
    pub authority: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct ServerAccount {
    pub authority: Pubkey,
    #[max_len(32)]
    pub server_id: String,
    #[max_len(100)]
    pub description: String,
    pub is_active: bool,
    pub registered_at: i64,
    pub stake: u64,
    pub entry_count: u64,
    pub last_entry_hash: [u8; 32],
    pub last_anchor_slot: u64,
}

#[account]
#[derive(InitSpace)]
pub struct LogEntry {
    pub server: Pubkey,
    pub entry_index: u64,
    pub timestamp: i64,
    pub entry_hash: [u8; 32],
    pub previous_hash: [u8; 32],
    pub data_hash: [u8; 32],
}

#[account]
#[derive(InitSpace)]
pub struct AuditTrail {
    pub server: Pubkey,
    pub batch_id: u64,
    pub next_batch_id: u64,
    pub root_hash: [u8; 32],
    pub entries_in_batch: u64,
    pub entries_anchored: u64,
    pub timestamp: i64,
    pub authority: Pubkey,
    pub anchor_slot: u64,
}

#[event]
pub struct LogEntryAdded {
    pub server: Pubkey,
    pub entry_index: u64,
    pub entry_hash: [u8; 32],
    pub timestamp: i64,
}

#[event]
pub struct RootAnchored {
    pub server: Pubkey,
    pub batch_id: u64,
    pub root_hash: [u8; 32],
    pub entries_in_batch: u64,
    pub entries_anchored: u64,
    pub timestamp: i64,
}

#[event]
pub struct EntryVerified {
    pub server: Pubkey,
    pub entry_index: u64,
    pub entry_hash: [u8; 32],
    pub verified_at: i64,
}

#[error_code]
pub enum LogChainError {
    #[msg("Server ID is too long (max 32 chars)")]
    ServerIdTooLong,

    #[msg("Description is too long (max 100 chars)")]
    DescriptionTooLong,

    #[msg("Server is not active")]
    ServerInactive,

    #[msg("Batch ID must be sequential")]
    InvalidBatchSequence,

    #[msg("Log count must be between 1 and 10000")]
    InvalidLogCount,

    #[msg("Only authority can perform this action")]
    Unauthorized,

    #[msg("Entry too large (max 1024 bytes)")]
    EntryTooLarge,

    #[msg("Entry server mismatch")]
    EntryServerMismatch,

    #[msg("Insufficient entries to anchor")]
    InsufficientEntries,
}
