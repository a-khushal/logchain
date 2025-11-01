'use client';

import { useCallback, useMemo } from 'react';
import { useProgram } from './useProgram';
import { useWallet } from '@solana/wallet-adapter-react';
import { Keypair, PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

export interface ServerAccount {
    publicKey: PublicKey;
    serverId: string;
    authority: PublicKey;
    description: string;
    isActive: boolean;
    registeredAt: BN;
    stake: BN;
    entryCount: BN;
    lastEntryHash: number[];
    lastAnchorSlot: BN;
}

export interface LogEntryAccount {
    publicKey: PublicKey;
    server: PublicKey;
    entryIndex: BN;
    timestamp: BN;
    entryHash: number[];
    previousHash: number[];
    dataHash: number[];
}

export interface AuditTrailAccount {
    publicKey: PublicKey;
    server: PublicKey;
    batchId: BN;
    nextBatchId: BN;
    rootHash: number[];
    entriesInBatch: BN;
    entriesAnchored: BN;
    timestamp: BN;
    authority: PublicKey;
    anchorSlot: BN;
}

export const useFetchAllServers = () => {
    const program = useProgram();
    const { publicKey } = useWallet();

    return useCallback(async () => {
        if (!program || !publicKey) return [];
        try {
            const servers = await program.account.serverAccount.all();
            return servers.map(s => ({
                publicKey: s.publicKey,
                serverId: s.account.serverId,
                authority: s.account.authority,
                description: s.account.description,
                isActive: s.account.isActive,
                registeredAt: s.account.registeredAt,
                stake: s.account.stake,
                entryCount: s.account.entryCount,
                lastEntryHash: s.account.lastEntryHash,
                lastAnchorSlot: s.account.lastAnchorSlot,
            } as ServerAccount));
        } catch (error) {
            console.error('Error fetching servers:', error);
            return [];
        }
    }, [program, publicKey]);
};

export const useRegisterServer = () => {
    const program = useProgram();
    const { publicKey } = useWallet();

    return useCallback(async (serverId: string, description: string, stakeAmount: number) => {
        if (!program || !publicKey) throw new Error('Wallet not connected');

        const [serverPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from('server'), Buffer.from(serverId)],
            program.programId
        );

        const tx = await program.methods
            .registerServer(serverId, description)
            .accountsStrict({
                serverAccount: serverPDA,
                authority: publicKey,
                stake: publicKey,
                systemProgram: PublicKey.default,
            })
            .rpc();

        return { tx, serverPDA };
    }, [program, publicKey]);
};

export const useAddLogEntry = () => {
    const program = useProgram();
    const { publicKey } = useWallet();

    return useCallback(async (serverId: string, entryData: Buffer) => {
        if (!program || !publicKey) throw new Error('Wallet not connected');

        const [serverPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from('server'), Buffer.from(serverId)],
            program.programId
        );

        const logEntryKeypair = Keypair.generate();

        const tx = await program.methods
            .addLogEntry(Buffer.from(entryData))
            .accountsStrict({
                serverAccount: serverPDA,
                logEntry: logEntryKeypair.publicKey,
                authority: publicKey,
                systemProgram: PublicKey.default,
            })
            .signers([logEntryKeypair])
            .rpc();

        return { tx, logEntryPDA: logEntryKeypair.publicKey };
    }, [program, publicKey]);
};

export const useAnchorBatch = () => {
    const program = useProgram();
    const { publicKey } = useWallet();

    return useCallback(async (serverId: string, batchId: number, logCount: number) => {
        if (!program || !publicKey) throw new Error('Wallet not connected');

        const [serverPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from('server'), Buffer.from(serverId)],
            program.programId
        );

        const [trailPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from('logchain-trail'), serverPDA.toBuffer()],
            program.programId
        );

        const tx = await program.methods
            .anchorBatch(new BN(batchId), new BN(logCount))
            .accountsStrict({
                serverAccount: serverPDA,
                trail: trailPDA,
                authority: publicKey,
                systemProgram: PublicKey.default,
            })
            .rpc();

        return { tx, trailPDA };
    }, [program, publicKey]);
};

export const useFetchAuditTrail = () => {
    const program = useProgram();

    return useCallback(async (serverId: string) => {
        if (!program) return null;
        try {
            const [serverPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from('server'), Buffer.from(serverId)],
                program.programId
            );

            const [trailPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from('logchain-trail'), serverPDA.toBuffer()],
                program.programId
            );

            const trail = await program.account.auditTrail.fetch(trailPDA);
            return {
                publicKey: trailPDA,
                server: trail.server,
                batchId: trail.batchId,
                nextBatchId: trail.nextBatchId,
                rootHash: trail.rootHash,
                entriesInBatch: trail.entriesInBatch,
                entriesAnchored: trail.entriesAnchored,
                timestamp: trail.timestamp,
                authority: trail.authority,
                anchorSlot: trail.anchorSlot,
            } as AuditTrailAccount;
        } catch (error) {
            console.error('Error fetching audit trail:', error);
            return null;
        }
    }, [program]);
};

export const useFetchLogEntries = () => {
    const program = useProgram();

    return useCallback(async (serverId: string) => {
        if (!program) return [];
        try {
            const logEntries = await program.account.logEntry.all();
            return logEntries
                .filter(le => le.account.server)
                .map(le => ({
                    publicKey: le.publicKey,
                    server: le.account.server,
                    entryIndex: le.account.entryIndex,
                    timestamp: le.account.timestamp,
                    entryHash: le.account.entryHash,
                    previousHash: le.account.previousHash,
                    dataHash: le.account.dataHash,
                } as LogEntryAccount));
        } catch (error) {
            console.error('Error fetching log entries:', error);
            return [];
        }
    }, [program]);
};

export const useVerifyEntry = () => {
    const program = useProgram();

    return useCallback(async (logEntryPDA: PublicKey, serverPDA: PublicKey) => {
        if (!program) throw new Error('Program not initialized');

        const tx = await program.methods
            .verifyEntry()
            .accounts({
                logEntry: logEntryPDA,
                serverAccount: serverPDA,
            })
            .rpc();

        return { tx };
    }, [program]);
};

export const useDeactivateServer = () => {
    const program = useProgram();
    const { publicKey } = useWallet();

    return useCallback(async (serverId: string) => {
        if (!program || !publicKey) throw new Error('Wallet not connected');

        const [serverPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from('server'), Buffer.from(serverId)],
            program.programId
        );

        const tx = await program.methods
            .deactivateServer()
            .accounts({
                serverAccount: serverPDA,
                authority: publicKey,
            })
            .rpc();

        return { tx };
    }, [program, publicKey]);
};

export const useLogchain = () => {
    const fetchAllServers = useFetchAllServers();
    const registerServer = useRegisterServer();
    const addLogEntry = useAddLogEntry();
    const anchorBatch = useAnchorBatch();
    const fetchAuditTrail = useFetchAuditTrail();
    const fetchLogEntries = useFetchLogEntries();
    const verifyEntry = useVerifyEntry();
    const deactivateServer = useDeactivateServer();

    return useMemo(() => ({
        fetchAllServers,
        registerServer,
        addLogEntry,
        anchorBatch,
        fetchAuditTrail,
        fetchLogEntries,
        verifyEntry,
        deactivateServer,
    }), [
        fetchAllServers,
        registerServer,
        addLogEntry,
        anchorBatch,
        fetchAuditTrail,
        fetchLogEntries,
        verifyEntry,
        deactivateServer,
    ]);
};