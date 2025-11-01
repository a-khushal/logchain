"use client"

import dynamic from "next/dynamic";

const WalletMultiButton = dynamic(
    () =>
        import('@solana/wallet-adapter-react-ui').then(
            (mod) => mod.WalletMultiButton
        ),
    { ssr: false }
);

export default function Header() {
    return (
        <header className="border-b border-[#2a2a2a] px-6 py-3 bg-[#0f0f0f] flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#10b981] rounded flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                        stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        className="w-5 h-5">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-white">LogChain</h1>
            </div>

            <WalletMultiButton />
        </header>
    )
}
