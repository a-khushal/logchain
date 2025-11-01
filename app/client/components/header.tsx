"use client"

interface HeaderProps {
  walletConnected: boolean
  onWalletConnect: () => void
}

export default function Header({ walletConnected, onWalletConnect }: HeaderProps) {
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

          <button
            onClick={onWalletConnect}
            className={`px-4 py-2 rounded font-mono text-sm font-bold transition-colors border ${
              walletConnected
                ? "bg-accent text-accent-foreground border-accent hover:bg-accent/90"
                : "bg-secondary text-foreground border-border hover:bg-secondary/80"
            }`}
          >
            {walletConnected ? "✓ Connected" : "Connect Wallet"}
          </button>
        </div>
      </div>
    </header>
  )
}
