"use client"

import { useState } from "react"
import { useDeactivateServer } from "@/hooks/useLogchain"

interface StatusBarProps {
    autoScroll: boolean
    onAutoScrollToggle: () => void
    selectedServer: string | null
    isActive?: boolean
}

export default function StatusBar({ autoScroll, onAutoScrollToggle, selectedServer, isActive }: StatusBarProps) {
    const [isClosing, setIsClosing] = useState(false)
    const deactivateServer = useDeactivateServer()

    const handleCloseTrail = async () => {
        if (!selectedServer) return

        setIsClosing(true)
        try {
            await deactivateServer(selectedServer)
        } finally {
            setIsClosing(false)
        }
    }

    return (
        <div className="border-t border-border bg-card px-4 py-3 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isActive ? "bg-accent" : "bg-destructive"}`}></div>
                <span className="text-foreground">{isActive ? "Status: All logs verified" : "Status: Server inactive"}</span>
            </div>

            <div className="flex items-center gap-4 text-muted-foreground">
                <span>Connected to Devnet</span>
                <span>{"•"}</span>
                <span>{selectedServer || "No server"}</span>
            </div>

            <div className="flex items-center gap-3">
                <button
                    onClick={onAutoScrollToggle}
                    disabled={!isActive}
                    className={`px-3 py-1 rounded font-bold transition-colors border ${autoScroll
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-secondary border-border hover:bg-secondary/80"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {autoScroll ? "Auto-Scroll" : "Auto-Scroll"}
                </button>
                <button
                    onClick={handleCloseTrail}
                    disabled={isClosing || !selectedServer || !isActive}
                    className="px-3 py-1 bg-secondary border border-border rounded hover:bg-secondary/80 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isClosing ? "Closing..." : "Close Trail"}
                </button>
            </div>
        </div>
    )
}