"use client"

import { useState, useEffect } from "react"
import { useFetchAuditTrail } from "@/hooks/useLogchain"
import { Buffer } from "buffer"
import Image from "next/image"

interface ProofPanelProps {
    selectedServer: string | null
}

export default function ProofPanel({ selectedServer }: ProofPanelProps) {
    const [trail, setTrail] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const fetchAuditTrail = useFetchAuditTrail()

    useEffect(() => {
        let isMounted = true

        const fetchTrail = async () => {
            if (!selectedServer) {
                setTrail(null)
                return
            }

            setIsLoading(true)
            try {
                const data = await fetchAuditTrail(selectedServer)
                if (isMounted) {
                    setTrail(data)
                }
            } catch (err) {
                console.error("Failed to fetch audit trail:", err)
                if (isMounted) setTrail(null)
            } finally {
                if (isMounted) setIsLoading(false)
            }
        }

        fetchTrail()

        return () => {
            isMounted = false
        }
    }, [selectedServer])

    const getStatusColor = () => {
        if (!trail) return "text-muted-foreground"
        if (trail.rootHash?.every((x: number) => x === 0)) return "text-muted-foreground"
        return "text-accent"
    }

    const getStatusBgColor = () => {
        if (!trail) return "bg-secondary"
        if (trail.rootHash?.every((x: number) => x === 0)) return "bg-secondary"
        return "bg-green-900/20"
    }

    const getStatusText = () => {
        if (!trail) return "○ NOT CONNECTED"
        if (trail.rootHash?.every((x: number) => x === 0)) return "○ NO ANCHORS YET"
        return "✓ VERIFIED ON SOLANA"
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const downloadProof = () => {
        if (!trail) return

        const proofJson = JSON.stringify(
            {
                merkleRoot: Array.isArray(trail.rootHash)
                    ? Buffer.from(trail.rootHash).toString('hex')
                    : trail.rootHash,
                batchId: trail.batchId.toNumber ? trail.batchId.toNumber() : Number(trail.batchId),
                entriesAnchored: trail.entriesAnchored.toNumber ? trail.entriesAnchored.toNumber() : Number(trail.entriesAnchored),
                timestamp: trail.timestamp.toNumber ? trail.timestamp.toNumber() : Number(trail.timestamp),
                anchorSlot: trail.anchorSlot.toNumber ? trail.anchorSlot.toNumber() : Number(trail.anchorSlot),
            },
            null,
            2
        )
        const element = document.createElement("a")
        element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(proofJson))
        element.setAttribute("download", `proof-batch-${trail.batchId}.json`)
        element.style.display = "none"
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
    }

    const batchId = trail?.batchId.toNumber ? trail.batchId.toNumber() : Number(trail?.batchId || 0)
    const entriesAnchored = trail?.entriesAnchored.toNumber ? trail.entriesAnchored.toNumber() : Number(trail?.entriesAnchored || 0)
    const timestamp = trail?.timestamp.toNumber ? trail.timestamp.toNumber() : Number(trail?.timestamp || 0)
    const merkleRoot = Array.isArray(trail?.rootHash)
        ? Buffer.from(trail.rootHash).toString('hex')
        : trail?.rootHash?.toString() || "0000000000000000000000000000000000000000000000000000000000000000"
    const lastAnchorTime = new Date(timestamp * 1000).toLocaleString()

    return (
        <div className="flex flex-col h-full">
            <div className="px-4 py-3 border-b border-border bg-secondary">
                <h2 className="font-mono text-sm font-bold text-accent">{"[PROOF PANEL]"}</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
                {isLoading ? (
                    <div className="text-muted-foreground">Loading proof...</div>
                ) : !selectedServer ? (
                    <div className="text-muted-foreground">Select a server to view proof</div>
                ) : (
                    <>
                        <div className={`p-3 rounded border-2 ${getStatusBgColor()}`}>
                            <div className={`font-bold ${getStatusColor()} flex items-center gap-2`}>
                                {getStatusText() === "✓ VERIFIED ON SOLANA" ? (
                                    <>
                                        <p className="mt-0.75">✓ VERIFIED ON</p>
                                        <Image
                                            src="/solanaLogo.png"
                                            alt="Solana"
                                            width={80}
                                            height={80}
                                        />
                                    </>
                                ) : (
                                    getStatusText()
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="text-muted-foreground">MERKLE ROOT</div>
                            <div className="bg-secondary border border-border rounded p-2">
                                <div className="break-all font-bold text-accent text-xs">{merkleRoot}</div>
                                <button
                                    onClick={() => copyToClipboard(merkleRoot)}
                                    className={`mt-0.5 text-xs px-2 py-1 rounded transition-colors ${
                                        copied
                                            ? "bg-accent text-accent-foreground"
                                            : "bg-accent text-accent-foreground hover:bg-accent/90"
                                    }`}
                                >
                                    {copied ? "✓ Copied" : "Copy"}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="text-muted-foreground">BATCH ID</div>
                            <div className="bg-secondary border border-border rounded px-3 py-2 text-accent font-bold">
                                batch-{String(batchId).padStart(4, "0")}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="text-muted-foreground">ENTRIES ANCHORED</div>
                            <div className="bg-secondary border border-border rounded px-3 py-2 text-accent font-bold">
                                {entriesAnchored.toLocaleString()}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="text-muted-foreground">LAST ANCHOR TIME</div>
                            <div className="bg-secondary border border-border rounded px-3 py-2 text-accent font-bold text-xs">
                                {timestamp > 0 ? lastAnchorTime : "Never"}
                            </div>
                        </div>

                        <button
                            onClick={downloadProof}
                            disabled={!trail || trail.rootHash?.every((x: number) => x === 0)}
                            className="w-full px-4 py-2 bg-secondary border border-border rounded font-bold hover:bg-secondary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Download Proof
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}