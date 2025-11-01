"use client"

import { useCallback, useMemo } from "react"
import { useProgram } from "./useProgram"
import { useWallet } from "@solana/wallet-adapter-react"
import { PublicKey, SystemProgram, Keypair } from "@solana/web3.js"
import { BN } from "@coral-xyz/anchor"
import pRetry from "p-retry"

export interface ServerAccount {
    publicKey: PublicKey
    serverId: string
    authority: PublicKey
    description: string
    isActive: boolean
    registeredAt: BN
    stake: BN
    entryCount: BN
    lastEntryHash: number[]
    lastAnchorSlot: BN
}

export const clearServerCache = () => { }

export function useFetchAllServers() {
    const program = useProgram()
    const { connected } = useWallet()

    const fetchAllServers = useCallback(async () => {
        if (!connected) throw new Error("Wallet not connected")
        if (!program) throw new Error("Program not initialized")

        const run = async () => {
            const servers = await program.account.serverAccount.all()
            return servers.map((s: any) => ({
                publicKey: s.publicKey,
                ...s.account,
            }))
        }

        return pRetry(run, {
            retries: 5,
            factor: 2,
            minTimeout: 500,
        })
    }, [connected, program])

    return fetchAllServers
}

export const useRegisterServer = () => {
    const program = useProgram()
    const { publicKey } = useWallet()

    return useCallback(
        async (serverId: string, description: string, stakeAmount: number) => {
            if (!program || !publicKey) throw new Error("Wallet not connected")
            const [serverPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("server"), Buffer.from(serverId)],
                program.programId
            )
            const stakeAccount = Keypair.generate()
            const tx = await program.methods
                .registerServer(serverId, description)
                .accountsStrict({
                    serverAccount: serverPDA,
                    authority: publicKey,
                    stake: stakeAccount.publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .signers([stakeAccount])
                .preInstructions([
                    SystemProgram.createAccount({
                        fromPubkey: publicKey,
                        newAccountPubkey: stakeAccount.publicKey,
                        lamports: stakeAmount,
                        space: 0,
                        programId: SystemProgram.programId,
                    }),
                ])
                .rpc()
            return { tx, serverPDA, stakeAccount }
        },
        [program, publicKey]
    )
}

export const useAddLogEntry = () => {
    const program = useProgram()
    const { publicKey } = useWallet()

    return useCallback(async (serverId: string, entryData: Buffer) => {
        if (!program || !publicKey) throw new Error('Wallet not connected')

        const [serverPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from('server'), Buffer.from(serverId)],
            program.programId
        )

        const logEntryKeypair = Keypair.generate()

        const tx = await program.methods
            .addLogEntry(entryData)
            .accountsStrict({
                serverAccount: serverPDA,
                logEntry: logEntryKeypair.publicKey,
                authority: publicKey,
                systemProgram: SystemProgram.programId,
            })
            .signers([logEntryKeypair])
            .rpc()

        return { tx, logEntryPDA: logEntryKeypair.publicKey }
    }, [program, publicKey])
}

export const useAnchorBatch = () => {
    const program = useProgram()
    const { publicKey } = useWallet()

    return useCallback(
        async (serverId: string, logCount: number) => {
            if (!program || !publicKey) throw new Error("Wallet not connected")

            const [serverPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("server"), Buffer.from(serverId)],
                program.programId
            )
            const [trailPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("logchain-trail"), serverPDA.toBuffer()],
                program.programId
            )

            let trail
            try {
                trail = await program.account.auditTrail.fetch(trailPDA)
            } catch (error) {
                trail = null
            }

            const batchId = trail ? (trail.nextBatchId.toNumber ? trail.nextBatchId.toNumber() : Number(trail.nextBatchId)) : 0

            const tx = await program.methods
                .anchorBatch(new BN(batchId), new BN(logCount))
                .accountsStrict({
                    serverAccount: serverPDA,
                    trail: trailPDA,
                    authority: publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .rpc()
            return { tx, trailPDA }
        },
        [program, publicKey]
    )
}

export const useFetchAuditTrail = () => {
    const program = useProgram()
    return useCallback(
        async (serverId: string) => {
            if (!program) return null
            try {
                const [serverPDA] = PublicKey.findProgramAddressSync(
                    [Buffer.from("server"), Buffer.from(serverId)],
                    program.programId
                )
                const [trailPDA] = PublicKey.findProgramAddressSync(
                    [Buffer.from("logchain-trail"), serverPDA.toBuffer()],
                    program.programId
                )
                let trail
                try {
                    trail = await program.account.auditTrail.fetch(trailPDA)
                } catch (error) {
                    if (error instanceof Error && (error.message.includes('Account does not exist') || error.message.includes('no data'))) {
                        return {
                            publicKey: trailPDA,
                            server: serverPDA,
                            batchId: new BN(0),
                            nextBatchId: new BN(0),
                            rootHash: Array(32).fill(0),
                            entriesInBatch: new BN(0),
                            entriesAnchored: new BN(0),
                            timestamp: new BN(0),
                            authority: serverPDA,
                            anchorSlot: new BN(0)
                        }
                    }
                    throw error
                }
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
                }
            } catch (error) {
                console.error('Error fetching audit trail:', error)
                return null
            }
        },
        [program]
    )
}

export const useFetchLogEntries = () => {
    const program = useProgram()
    return useCallback(
        async (serverId: string) => {
            if (!program) return []

            const [serverPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("server"), Buffer.from(serverId)],
                program.programId
            )

            const logEntries = await program.account.logEntry.all()
            return logEntries
                .filter((le: any) => {
                    return le.account.server &&
                        le.account.server.equals(serverPDA)
                })
                .map((le: any) => ({
                    publicKey: le.publicKey,
                    server: le.account.server,
                    entryIndex: le.account.entryIndex,
                    timestamp: le.account.timestamp,
                    entryHash: le.account.entryHash,
                    previousHash: le.account.previousHash,
                    dataHash: le.account.dataHash,
                }))
        },
        [program]
    )
}

export const useVerifyEntry = () => {
    const program = useProgram()
    return useCallback(
        async (logEntryPDA: PublicKey, serverPDA: PublicKey) => {
            if (!program) throw new Error("Program not initialized")
            const tx = await program.methods
                .verifyEntry()
                .accounts({
                    logEntry: logEntryPDA,
                    serverAccount: serverPDA,
                })
                .rpc()
            return { tx }
        },
        [program]
    )
}

export const useDeactivateServer = () => {
    const program = useProgram()
    const { publicKey } = useWallet()

    return useCallback(
        async (serverId: string) => {
            if (!program || !publicKey) throw new Error("Wallet not connected")
            const [serverPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("server"), Buffer.from(serverId)],
                program.programId
            )
            const tx = await program.methods
                .deactivateServer()
                .accounts({
                    serverAccount: serverPDA,
                    authority: publicKey,
                })
                .rpc()
            return { tx }
        },
        [program, publicKey]
    )
}

export const useLogchain = () => {
    const fetchAllServers = useFetchAllServers()
    const registerServer = useRegisterServer()
    const addLogEntry = useAddLogEntry()
    const anchorBatch = useAnchorBatch()
    const fetchAuditTrail = useFetchAuditTrail()
    const fetchLogEntries = useFetchLogEntries()
    const verifyEntry = useVerifyEntry()
    const deactivateServer = useDeactivateServer()
    return useMemo(
        () => ({
            fetchAllServers,
            registerServer,
            addLogEntry,
            anchorBatch,
            fetchAuditTrail,
            fetchLogEntries,
            verifyEntry,
            deactivateServer,
        }),
        [
            fetchAllServers,
            registerServer,
            addLogEntry,
            anchorBatch,
            fetchAuditTrail,
            fetchLogEntries,
            verifyEntry,
            deactivateServer,
        ]
    )
}