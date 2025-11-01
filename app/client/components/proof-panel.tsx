"use client"

import { useState } from "react"

interface ProofPanelState {
    merkleRoot: string
    batchId: number
    entriesAnchored: number
    lastAnchorTime: string
    status: "verified" | "tampering" | "not-connected"
}

const mockProof: ProofPanelState = {
    merkleRoot: "0x4c9c22d69531c31f8cbe2c90d9c9d9c9d9c9d9c9d9c9d9c9d9c9d9c9d9c9d9c9",
    batchId: 42,
    entriesAnchored: 5247,
    lastAnchorTime: "2025-01-11 14:32:15",
    status: "verified",
}

export default function ProofPanel() {
    const [proof] = useState<ProofPanelState>(mockProof)

    const getStatusColor = () => {
        switch (proof.status) {
            case "verified":
                return "text-accent"
            case "tampering":
                return "text-destructive"
            default:
                return "text-muted-foreground"
        }
    }

    const getStatusBgColor = () => {
        switch (proof.status) {
            case "verified":
                return "bg-green-900/20"
            case "tampering":
                return "bg-red-900/20"
            default:
                return "bg-secondary"
        }
    }

    const getStatusText = () => {
        switch (proof.status) {
            case "verified":
                return "✓ VERIFIED ON SOLANA"
            case "tampering":
                return "⚠ TAMPERING DETECTED"
            default:
                return "○ NOT CONNECTED"
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    const downloadProof = () => {
        const proofJson = JSON.stringify(proof, null, 2)
        const element = document.createElement("a")
        element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(proofJson))
        element.setAttribute("download", `proof-${proof.batchId}.json`)
        element.style.display = "none"
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
    }

    return (
        <div className="flex flex-col h-full">
            <div className="px-4 py-3 border-b border-border bg-secondary">
                <h2 className="font-mono text-sm font-bold text-accent">{"[PROOF PANEL]"}</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
                <div className={`p-3 rounded border-2 ${getStatusBgColor()}`}>
                    <div className={`font-bold ${getStatusColor()}`}>{getStatusText()}</div>
                </div>

                <div className="space-y-1">
                    <div className="text-muted-foreground">MERKLE ROOT</div>
                    <div className="bg-secondary border border-border rounded p-2">
                        <div className="break-all font-bold text-accent">{proof.merkleRoot}</div>
                        <button
                            onClick={() => copyToClipboard(proof.merkleRoot)}
                            className="mt-2 text-xs px-2 py-1 bg-accent text-accent-foreground rounded hover:bg-accent/90 transition-colors"
                        >
                            Copy
                        </button>
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="text-muted-foreground">BATCH ID</div>
                    <div className="bg-secondary border border-border rounded px-3 py-2 text-accent font-bold">
                        batch-{String(proof.batchId).padStart(4, "0")}
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="text-muted-foreground">ENTRIES ANCHORED</div>
                    <div className="bg-secondary border border-border rounded px-3 py-2 text-accent font-bold">
                        {proof.entriesAnchored.toLocaleString()}
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="text-muted-foreground">LAST ANCHOR TIME</div>
                    <div className="bg-secondary border border-border rounded px-3 py-2 text-accent font-bold">
                        {proof.lastAnchorTime}
                    </div>
                </div>

                <button className="w-full px-4 py-2 bg-accent text-accent-foreground rounded font-bold hover:bg-accent/90 transition-colors border border-accent mt-4">
                    Anchor to Solana
                </button>

                <button
                    onClick={downloadProof}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded font-bold hover:bg-secondary/80 transition-colors"
                >
                    Download Proof
                </button>
            </div>
        </div>
    )
}
