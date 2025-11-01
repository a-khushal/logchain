"use client"

interface StatusBarProps {
    autoScroll: boolean
    onAutoScrollToggle: () => void
}

export default function StatusBar({ autoScroll, onAutoScrollToggle }: StatusBarProps) {
    return (
        <div className="border-t border-border bg-card px-4 py-3 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent"></div>
                <span className="text-foreground">Status: All logs verified</span>
            </div>

            <div className="flex items-center gap-4 text-muted-foreground">
                <span>Connected to Devnet</span>
                <span>{"•"}</span>
                <span>5 servers registered</span>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={onAutoScrollToggle}
                    className={`px-3 py-1 rounded font-bold transition-colors border ${autoScroll
                            ? "bg-accent text-accent-foreground border-accent"
                            : "bg-secondary border-border hover:bg-secondary/80"
                        }`}
                >
                    {autoScroll ? "Auto-Scroll" : "Auto-Scroll"}
                </button>
                <button className="px-3 py-1 bg-secondary border border-border rounded hover:bg-secondary/80 transition-colors font-bold">
                    Close Trail
                </button>
            </div>
        </div>
    )
}
