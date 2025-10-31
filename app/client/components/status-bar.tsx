"use client"

interface StatusBarProps {
    tamperDetected: boolean
    autoScroll: boolean
    onToggleScroll: () => void
    isConnected: boolean
}

export default function StatusBar({ tamperDetected, autoScroll, onToggleScroll, isConnected }: StatusBarProps) {
    return (
        <div className="border-t border-[#2a2a2a] px-6 py-3 bg-[#0f0f0f] flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
                <span
                    className={`inline-block w-2 h-2 rounded-full ${tamperDetected ? "bg-[#ef4444]" : "bg-[#10b981]"}`}
                ></span>
                <span className={tamperDetected ? "text-[#ef4444]" : "text-[#10b981]"}>
                    {tamperDetected ? "⚠ TAMPERING DETECTED — Line 142 was modified" : "✓ No tampering detected"}
                </span>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={onToggleScroll}
                    className={`px-3 py-1 rounded border text-xs font-medium transition-colors ${autoScroll
                            ? "bg-[#10b981] text-[#0f0f0f] border-[#10b981]"
                            : "bg-[#1a1a1a] border-[#2a2a2a] text-[#e5e5e5] hover:border-[#10b981]"
                        }`}
                >
                    {autoScroll ? "Auto-Scroll: ON" : "Auto-Scroll: OFF"}
                </button>

                {isConnected && (
                    <button
                        disabled
                        className="px-3 py-1 rounded border border-[#2a2a2a] text-xs font-medium text-[#808080] cursor-not-allowed opacity-50"
                    >
                        Close Trail
                    </button>
                )}
            </div>
        </div>
    )
}
