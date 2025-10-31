"use client"

interface ProofPanelProps {
    isConnected: boolean
    tamperDetected: boolean
}

export default function ProofPanel({ isConnected, tamperDetected }: ProofPanelProps) {
    const mockMerkleRoot = "0x7f3e2c1d9a4b5e8c6f7d2a3b1e9f4c5d"

    const handleCopy = () => {
        navigator.clipboard.writeText(mockMerkleRoot)
    }

    const handleDownload = () => {
        const proof = {
            merkleRoot: mockMerkleRoot,
            timestamp: new Date().toISOString(),
            verified: !tamperDetected,
            batchId: "Batch #42",
        }
        const blob = new Blob([JSON.stringify(proof, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "proof.json"
        a.click()
    }

    return (
        <div className="flex flex-col h-full bg-[#1a1a1a] border border-[#2a2a2a] rounded overflow-hidden">
            <div className="px-4 py-3 border-b border-[#2a2a2a] bg-[#0f0f0f]">
                <p className="text-xs font-semibold text-[#808080] uppercase tracking-wider">Proof Panel</p>
            </div>

            <div className="flex-1 flex flex-col p-4 space-y-4 overflow-y-auto">
                <div>
                    <p className="text-xs text-[#808080] uppercase tracking-wider mb-2">Current Merkle Root</p>
                    <div className="flex items-center gap-2 bg-[#0f0f0f] border border-[#2a2a2a] rounded p-3">
                        <code className="text-xs font-mono text-[#10b981] flex-1 truncate">{mockMerkleRoot}</code>
                        <button
                            onClick={handleCopy}
                            className="p-1 hover:bg-[#2a2a2a] rounded transition-colors text-[#e5e5e5]"
                            title="Copy hash"
                        >
                            📋
                        </button>
                    </div>
                </div>

                <div>
                    <p className="text-xs text-[#808080] uppercase tracking-wider mb-2">Status</p>
                    <div
                        className={`px-3 py-2 rounded border text-sm font-medium flex items-center gap-2 ${tamperDetected
                                ? "bg-[#ef4444] bg-opacity-20 border-[#ef4444] text-[#ef4444]"
                                : isConnected
                                    ? "bg-[#10b981] bg-opacity-20 border-[#10b981] text-[#10b981]"
                                    : "bg-[#2a2a2a] border-[#2a2a2a] text-[#808080]"
                            }`}
                    >
                        <span
                            className={`inline-block w-2 h-2 rounded-full shrink-0 ${tamperDetected ? "bg-[#ef4444]" : isConnected ? "bg-[#10b981]" : "bg-[#808080]"
                                }`}
                        ></span>
                        {tamperDetected ? "TAMPERING DETECTED" : isConnected ? "VERIFIED ON SOLANA" : "NOT CONNECTED"}
                    </div>
                </div>

                {isConnected && !tamperDetected && (
                    <a
                        href="https://solscan.io"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#10b981] hover:text-[#10b981] hover:underline"
                    >
                        View on Solscan →
                    </a>
                )}
                <button
                    onClick={handleDownload}
                    className="mt-auto px-4 py-2 bg-[#10b981] text-[#0f0f0f] border border-[#10b981] rounded hover:bg-[#0ea574] transition-colors text-sm font-medium"
                >
                    Download Proof (JSON)
                </button>
            </div>
        </div>
    )
}
