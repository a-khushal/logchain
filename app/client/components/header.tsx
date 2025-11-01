"use client"

import dynamic from 'next/dynamic';

const WalletMultiButton = dynamic(
    () =>
        import('@solana/wallet-adapter-react-ui').then(
            (mod) => mod.WalletMultiButton
        ),
    { ssr: false }
);

export default function Header() {
    return (
        <header className="border-b border-border px-6 py-4 bg-card">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="font-mono text-xl font-bold text-accent">
                        {"["}LOGCHAIN{"]"}
                    </div>
                    <span className="text-muted-foreground text-sm">Solana Audit Trail Verification</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded border border-border">
                        <div className="w-2 h-2 rounded-full bg-accent"></div>
                        <span className="text-sm text-muted-foreground font-mono">Devnet</span>
                    </div>

                    <WalletMultiButton />
                </div>
            </div>
        </header>
    )
}
