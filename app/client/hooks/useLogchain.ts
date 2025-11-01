import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';
import { useProgram } from './useProgram';
import * as web3 from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

type AnchorRootParams = {
    root: number[];
    batchId: number;
    serverId: string;
    logCount: number;
};

export function useLogchainProgram() {
    const program = useProgram();
    const { publicKey } = program?.provider.wallet || {};

    const anchorRoot = useCallback(async ({
        root,
        batchId,
        serverId,
        logCount
    }: AnchorRootParams) => {
        if (!program || !publicKey) {
            throw new Error('Wallet not connected');
        }

        const [trailPDA] = await PublicKey.findProgramAddress(
            [
                Buffer.from('logchain-trail'),
                Buffer.from(serverId)
            ],
            program.programId
        );

        try {
            const tx = await program.rpc.anchorRoot(
                root,
                new BN(batchId),
                serverId,
                new BN(logCount),
                {
                    accounts: {
                        trail: trailPDA,
                        authority: publicKey,
                        systemProgram: web3.SystemProgram.programId as web3.PublicKey,
                    },
                }
            );

            return tx;
        } catch (error) {
            console.error('Error anchoring root:', error);
            throw error;
        }
    }, [program, publicKey]);

    const closeTrail = useCallback(async (serverId: string) => {
        if (!program || !publicKey) {
            throw new Error('Wallet not connected');
        }

        const [trailPDA] = await PublicKey.findProgramAddress(
            [
                Buffer.from('logchain-trail'),
                Buffer.from(serverId)
            ],
            program.programId
        );

        try {
            const tx = await program.rpc.closeTrail({
                accounts: {
                    trail: trailPDA,
                    authority: publicKey,
                },
            });

            return tx;
        } catch (error) {
            console.error('Error closing trail:', error);
            throw error;
        }
    }, [program, publicKey]);

    const fetchTrail = useCallback(async (serverId: string) => {
        if (!program) return null;

        try {
            const [trailPDA] = await PublicKey.findProgramAddress(
                [
                    Buffer.from('logchain-trail'),
                    Buffer.from(serverId)
                ],
                program.programId
            );

            return await program.account.auditTrail.fetch(trailPDA);
        } catch (error) {
            console.error('Error fetching trail:', error);
            return null;
        }
    }, [program]);

    const subscribeToTrail = useCallback((serverId: string, callback: (trail: any) => void) => {
        if (!program) return () => {};

        let subscriptionId: number;

        const setupSubscription = async () => {
            const [trailPDA] = await PublicKey.findProgramAddress(
                [
                    Buffer.from('logchain-trail'),
                    Buffer.from(serverId)
                ],
                program.programId
            );

            subscriptionId = program.provider.connection.onAccountChange(
                trailPDA,
                (accountInfo) => {
                    const data = program.coder.accounts.decode('AuditTrail', accountInfo.data);
                    callback(data);
                }
            );
        };

        setupSubscription().catch(console.error);

        return () => {
            if (subscriptionId) {
                program.provider.connection.removeAccountChangeListener(subscriptionId);
            }
        };
    }, [program]);

    return {
        program,
        programId: program?.programId,
        anchorRoot,
        closeTrail,
        fetchTrail,
        subscribeToTrail,
    };
}

export function useAnchorRoot() {
    const { anchorRoot } = useLogchainProgram();
    return anchorRoot;
}

export function useCloseTrail() {
    const { closeTrail } = useLogchainProgram();
    return closeTrail;
}

export function useTrail(serverId: string) {
    const [trail, setTrail] = useState<any>(null);
    const { fetchTrail, subscribeToTrail } = useLogchainProgram();

    useEffect(() => {
        if (!fetchTrail) return;

        const loadTrail = async () => {
            const trailData = await fetchTrail(serverId);
            setTrail(trailData);
        };

        loadTrail();
    }, [fetchTrail, serverId]);

    useEffect(() => {
        if (!subscribeToTrail) return () => { };

        const unsubscribe = subscribeToTrail(serverId, (updatedTrail) => {
            setTrail(updatedTrail);
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [subscribeToTrail, serverId]);

    return trail;
}
