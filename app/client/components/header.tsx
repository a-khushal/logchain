"use client"

interface HeaderProps {
  onConnect: () => void
  isConnected: boolean
}

export default function Header({ onConnect, isConnected }: HeaderProps) {
  return (
    <header className="border-b border-[#2a2a2a] px-6 py-4 bg-[#0f0f0f] flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#10b981] rounded flex items-center justify-center">
          <span className="text-[#0f0f0f] font-bold text-sm">⛓</span>
        </div>
        <h1 className="text-2xl font-bold text-white">LogChain</h1>
      </div>

      <button
        onClick={onConnect}
        className={`px-4 py-2 rounded border text-sm font-medium transition-colors ${
          isConnected
            ? "bg-[#10b981] text-[#0f0f0f] border-[#10b981]"
            : "bg-[#1a1a1a] text-[#e5e5e5] border-[#2a2a2a] hover:border-[#10b981]"
        }`}
      >
        {isConnected ? "✓ Connected" : "Connect Wallet"}
      </button>
    </header>
  )
}
