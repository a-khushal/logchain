# Logchain

Distributed log management on Solana blockchain. Register servers, add logs, anchor batches, verify on-chain.

## Quick Start

### Deploy Program

1. Update program address in `anchor.toml` and `lib.rs`
2. Build and deploy:
```bash
anchor build
anchor deploy
```
3. Copy IDL and types from `target/` to `app/client/lib/program/`

### Run App

```bash
cd app/client
npm i
npm run dev
```

Visit `http://localhost:3000`

## Usage

- **Register Server**: Provide Server ID, description, and stake amount
- **Add Logs**: Select server, choose level (INFO/WARNING/ERROR), enter message
- **Anchor Batch**: Anchor all new logs to blockchain
- **View Proof**: See merkle root and verification status in proof panel

## Sample Logs

INFO:
```
Server initialized successfully on port 3000. Environment: production. Region: us-east-1. Database: postgresql connected.
```

WARNING:
```
Memory usage approaching threshold: 87% of allocated heap (1.74GB of 2GB). Consider investigating potential memory leaks.
```

ERROR:
```
Database connection failed: Unable to connect to postgresql://db.example.com:5432 after 3 retry attempts. Connection timeout exceeded (5000ms).
```