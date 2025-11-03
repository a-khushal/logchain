"use client"

import { useState, useCallback, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Buffer } from "buffer"
import {
    useAddLogEntry,
    useFetchLogEntries,
    useAnchorBatch,
    useFetchAuditTrail
} from "@/hooks/useLogchain"

export default function LogManagement({ serverId, isActive = true }: { serverId: string; isActive?: boolean }) {
    const [logMessage, setLogMessage] = useState("")
    const [logLevel, setLogLevel] = useState("INFO")
    const [isAdding, setIsAdding] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [logCount, setLogCount] = useState(0)
    const { connected } = useWallet()
    const addLogEntry = useAddLogEntry()

    const handleAddLog = useCallback(async () => {
        if (!logMessage.trim()) {
            setError("Log message cannot be empty")
            return
        }

        setIsAdding(true)
        setError(null)

        try {
            const logData = JSON.stringify({
                level: logLevel,
                message: logMessage,
                timestamp: new Date().toISOString(),
            })

            await addLogEntry(serverId, Buffer.from(logData))
            setLogMessage("")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add log entry")
        } finally {
            setIsAdding(false)
        }
    }, [logMessage, logLevel, serverId, addLogEntry])

    if (!isActive) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-destructive font-mono text-sm">Server is not active</div>
            </div>
        )
    }

    return (
        <div key={serverId} className="flex flex-col h-full space-y-4">
            <div className="border border-border p-4 bg-card">
                <h3 className="text-accent font-mono text-sm font-bold mb-3">[ADD LOG ENTRY]</h3>
                <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <select
                            value={logLevel}
                            onChange={(e) => setLogLevel(e.target.value)}
                            className="bg-card border border-border text-foreground px-2 py-1 text-xs font-mono"
                            disabled={!connected || isAdding}
                        >
                            <option value="INFO">INFO</option>
                            <option value="WARNING">WARNING</option>
                            <option value="ERROR">ERROR</option>
                        </select>
                        <div className="text-xs text-muted-foreground ml-auto">{logMessage.length}/1024</div>
                    </div>
                    <textarea
                        value={logMessage}
                        onChange={(e) => setLogMessage(e.target.value.slice(0, 1024))}
                        placeholder="Enter log message..."
                        className="w-full h-24 p-2 border border-border text-foreground font-mono text-sm disabled:opacity-50 bg-black"
                        disabled={!connected || isAdding}
                    />
                    {error && <div className="p-3 text-destructive text-xs font-mono">{error}</div>}
                    <button
                        onClick={handleAddLog}
                        disabled={!connected || isAdding || !logMessage.trim()}
                        className="px-4 py-2 bg-accent text-accent-foreground font-mono text-sm font-bold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed w-full transition-colors border border-accent"
                    >
                        {isAdding ? "ADDING..." : "ADD LOG"}
                    </button>
                </div>
            </div>

            <LogStream serverId={serverId} onLogCountChange={setLogCount} />

            <BatchAnchorCard serverId={serverId} logCount={logCount} />
        </div>
    )
}

function LogStream({ serverId, onLogCountChange }: { serverId: string; onLogCountChange: (count: number) => void }) {
    const [logs, setLogs] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const fetchLogEntries = useFetchLogEntries()

    useEffect(() => {
        let isMounted = true

        const fetchLogs = async () => {
            if (!serverId) return

            try {
                const entries = await (fetchLogEntries as any)(serverId, true)
                if (isMounted) {
                    setLogs(entries)
                    onLogCountChange(entries.length)
                }
            } catch (err) {
                console.error("Failed to fetch logs:", err)
            } finally {
                if (isMounted) setIsLoading(false)
            }
        }

        fetchLogs()

        return () => {
            isMounted = false
        }
    }, [serverId, refreshTrigger, fetchLogEntries])

    useEffect(() => {
        const timer = setInterval(() => {
            setRefreshTrigger(prev => prev + 1)
        }, 3000)

        return () => clearInterval(timer)
    }, [])

    if (isLoading) {
        return (
            <div className="border border-border p-4 bg-card h-64 text-foreground">
                <h3 className="text-accent font-mono text-sm font-bold mb-3">[LOG STREAM]</h3>
                <div className="text-muted-foreground text-sm">Loading logs...</div>
            </div>
        )
    }

    return (
        <div className="border border-border p-4 bg-card h-64 overflow-y-auto text-foreground">
            <h3 className="text-accent font-mono text-sm font-bold mb-3">[LOG STREAM] ({logs.length})</h3>
            {logs.length === 0 ? (
                <div className="p-3 text-muted-foreground text-xs font-mono">No log entries found</div>
            ) : (
                <div className="space-y-1">
                    {logs.map((log, i) => (
                        <LogEntry key={`${log.publicKey}-${i}`} log={log} />
                    ))}
                </div>
            )}
        </div>
    )
}

function LogEntry({ log }: { log: any }) {
    let levelColor = "text-muted-foreground"
    let levelText = "INFO"
    let message = ""
    let timestamp = ""

    if (log.data) {
        levelText = log.data.level || "INFO"
        message = log.data.message || ""
        timestamp = log.data.timestamp ? new Date(log.data.timestamp).toLocaleTimeString() : ""

        if (levelText === "WARNING") {
            levelColor = "text-warning"
        } else if (levelText === "ERROR") {
            levelColor = "text-destructive"
        }
    } else if (log.dataBytes && log.dataBytes.length > 0) {
        timestamp = log.timestamp ? new Date(Number(log.timestamp) * 1000).toLocaleTimeString() : ""
        levelText = "DATA"
        message = `[${log.dataBytes.join(", ")}]`
    } else {
        timestamp = log.timestamp ? new Date(Number(log.timestamp) * 1000).toLocaleTimeString() : ""
        levelText = "DATA"
        message = "[]"
    }

    return (
        <div className="font-mono text-xs border-b border-border/50 pb-2 mb-2 hover:bg-secondary/50 p-2 rounded transition-colors">
            <div className="flex items-start gap-3 mb-1">
                <span className="text-muted-foreground min-w-fit">[{timestamp}]</span>
                <span className={`${levelColor} font-bold min-w-fit px-2 py-0.5 rounded text-xs ${levelText === "ERROR" ? "bg-destructive/20 text-destructive" : levelText === "WARNING" ? "bg-yellow-500/20 text-yellow-500" : "bg-accent/20"}`}>
                    {levelText}
                </span>
            </div>
            <div className="text-foreground wrap-break-words pl-2 text-xs leading-relaxed">
                {message}
            </div>
        </div>
    )
}

function BatchAnchorCard({ serverId, logCount }: { serverId: string; logCount: number }) {
    const [isAnchoring, setIsAnchoring] = useState(false)
    const [trail, setTrail] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const fetchAuditTrail = useFetchAuditTrail()
    const anchorBatch = useAnchorBatch()

    useEffect(() => {
        let isMounted = true

        const fetchTrail = async () => {
            if (!serverId) return
            try {
                const data = await fetchAuditTrail(serverId)
                if (isMounted) {
                    setTrail(data)
                }
            } catch (err) {
                console.error("Failed to fetch audit trail:", err)
            }
        }

        fetchTrail()

        return () => {
            isMounted = false
        }
    }, [serverId, fetchAuditTrail])

    const handleAnchorBatch = useCallback(async () => {
        if (!trail || isAnchoring || logCount === 0) return

        setIsAnchoring(true)
        setError(null)

        try {
            const entriesAnchored = trail.entriesAnchored.toNumber ? trail.entriesAnchored.toNumber() : Number(trail.entriesAnchored)
            const newLogCount = logCount - entriesAnchored

            if (newLogCount <= 0) {
                setError("No new logs to anchor")
                setIsAnchoring(false)
                return
            }

            await anchorBatch(serverId, newLogCount)

            await new Promise(resolve => setTimeout(resolve, 2000))
            const updatedTrail = await fetchAuditTrail(serverId)
            setTrail(updatedTrail)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to anchor batch")
        } finally {
            setIsAnchoring(false)
        }
    }, [trail, serverId, isAnchoring, logCount, anchorBatch, fetchAuditTrail])

    if (!trail) {
        return (
            <div className="border border-border p-4 bg-card">
                <h3 className="text-accent font-mono text-sm font-bold mb-3">[ANCHOR BATCH]</h3>
                <div className="text-muted-foreground text-sm mb-3">Loading batch info...</div>
                <button
                    onClick={async () => {
                        const data = await fetchAuditTrail(serverId)
                        setTrail(data)
                    }}
                    className="px-4 py-2 bg-accent text-accent-foreground font-mono text-sm font-bold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed w-full transition-colors border border-accent"
                >
                    Refresh
                </button>
            </div>
        )
    }

    const batchId = trail.batchId.toNumber ? trail.batchId.toNumber() : Number(trail.batchId)
    const nextBatchId = trail.nextBatchId.toNumber ? trail.nextBatchId.toNumber() : Number(trail.nextBatchId)
    const entriesAnchored = trail.entriesAnchored.toNumber ? trail.entriesAnchored.toNumber() : Number(trail.entriesAnchored)
    const newLogCount = logCount - entriesAnchored
    const rootHashStr = Array.isArray(trail.rootHash)
        ? Buffer.from(trail.rootHash).toString('hex')
        : trail.rootHash?.toString() || "0000000000000000000000000000000000000000000000000000000000000000"

    return (
        <div className="border border-border p-4 bg-card text-foreground">
            <h3 className="text-accent font-mono text-sm font-bold mb-3">[ANCHOR BATCH]</h3>
            <div className="space-y-2 text-xs font-mono text-foreground">
                <div className="text-foreground">Batch ID: {batchId}</div>
                <div className="text-foreground">Next Batch: {nextBatchId}</div>
                <div className="text-foreground">Entries Anchored: {entriesAnchored}</div>
                <div className="text-foreground">Total Logs: {logCount}</div>
                <div className="text-foreground">New Logs: {newLogCount}</div>
                <div className="truncate text-foreground">Root: {rootHashStr}</div>
                {error && <div className="text-destructive">{error}</div>}
                <button
                    onClick={handleAnchorBatch}
                    disabled={isAnchoring || newLogCount <= 0}
                    className="mt-2 px-4 py-2 bg-accent text-accent-foreground font-mono text-sm font-bold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed w-full transition-colors border border-accent"
                >
                    {isAnchoring ? "ANCHORING..." : "ANCHOR BATCH"}
                </button>
            </div>
        </div>
    )
}