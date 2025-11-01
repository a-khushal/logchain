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

export default function LogManagement({ serverId }: { serverId: string }) {
    const [logMessage, setLogMessage] = useState("")
    const [logLevel, setLogLevel] = useState("INFO")
    const [isAdding, setIsAdding] = useState(false)
    const [error, setError] = useState<string | null>(null)
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

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="border border-gray-700 p-4 bg-black">
                <h3 className="text-green-500 font-mono text-sm font-bold mb-3">[ADD LOG ENTRY]</h3>
                <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <select
                            value={logLevel}
                            onChange={(e) => setLogLevel(e.target.value)}
                            className="bg-black border border-gray-700 text-white px-2 py-1 text-xs font-mono"
                            disabled={!connected || isAdding}
                        >
                            <option value="INFO">INFO</option>
                            <option value="WARNING">WARNING</option>
                            <option value="ERROR">ERROR</option>
                        </select>
                        <div className="text-xs text-gray-500 ml-auto">{logMessage.length}/1024</div>
                    </div>
                    <textarea
                        value={logMessage}
                        onChange={(e) => setLogMessage(e.target.value.slice(0, 1024))}
                        placeholder="Enter log message..."
                        className="w-full h-24 p-2 bg-black border border-gray-700 text-white font-mono text-sm disabled:opacity-50"
                        disabled={!connected || isAdding}
                    />
                    {error && <div className="text-red-500 text-xs">{error}</div>}
                    <button
                        onClick={handleAddLog}
                        disabled={!connected || isAdding || !logMessage.trim()}
                        className="px-4 py-2 bg-green-500 text-black font-mono text-sm font-bold hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed w-full"
                    >
                        {isAdding ? "ADDING..." : "ADD LOG"}
                    </button>
                </div>
            </div>

            <LogStream serverId={serverId} />

            <BatchAnchorCard serverId={serverId} />
        </div>
    )
}

function LogStream({ serverId }: { serverId: string }) {
    const [logs, setLogs] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const fetchLogEntries = useFetchLogEntries()

    useEffect(() => {
        let isMounted = true

        const fetchLogs = async () => {
            if (!serverId) return
            setIsLoading(true)
            try {
                const entries = await fetchLogEntries(serverId)
                if (isMounted) {
                    setLogs(entries)
                }
            } catch (err) {
                console.error("Failed to fetch logs:", err)
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        fetchLogs()

        return () => {
            isMounted = false
        }
    }, [serverId, fetchLogEntries])

    if (isLoading && logs.length === 0) {
        return (
            <div className="border border-gray-700 p-4 bg-black h-64">
                <h3 className="text-green-500 font-mono text-sm font-bold mb-3">[LOG STREAM]</h3>
                <div className="text-gray-500 text-sm">Loading logs...</div>
            </div>
        )
    }

    return (
        <div className="border border-gray-700 p-4 bg-black h-64 overflow-y-auto">
            <h3 className="text-green-500 font-mono text-sm font-bold mb-3">[LOG STREAM]</h3>
            {logs.length === 0 ? (
                <div className="text-gray-500 text-sm">No log entries found</div>
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
    let levelColor = "text-gray-400"
    let levelText = "INFO"

    if (log.level === "WARNING") {
        levelColor = "text-yellow-400"
        levelText = "WARNING"
    } else if (log.level === "ERROR") {
        levelColor = "text-red-400"
        levelText = "ERROR"
    }

    const timestamp = new Date(Number(log.timestamp) * 1000).toLocaleTimeString()
    const entryHashShort = log.entryHash?.slice(0, 12).toString() || "?"

    return (
        <div className="font-mono text-xs border-b border-gray-800 pb-1">
            <span className="text-gray-500">[{timestamp}]</span>
            <span className={`${levelColor} font-bold ml-2`}>{levelText.padEnd(7)}</span>
            <span className="text-white ml-2">[{entryHashShort}]</span>
        </div>
    )
}

function BatchAnchorCard({ serverId }: { serverId: string }) {
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
        if (!trail || isAnchoring) return

        setIsAnchoring(true)
        setError(null)

        try {
            const batchId = trail.batchId.toNumber ? trail.batchId.toNumber() : Number(trail.batchId)
            const logCount = trail.entriesInBatch.toNumber ? trail.entriesInBatch.toNumber() : Number(trail.entriesInBatch)

            await anchorBatch(serverId, batchId, logCount)

            const updatedTrail = await fetchAuditTrail(serverId)
            setTrail(updatedTrail)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to anchor batch")
        } finally {
            setIsAnchoring(false)
        }
    }, [trail, serverId, isAnchoring, anchorBatch, fetchAuditTrail])

    if (!trail) {
        return (
            <div className="border border-gray-700 p-4 bg-black">
                <h3 className="text-green-500 font-mono text-sm font-bold mb-3">[ANCHOR BATCH]</h3>
                <div className="text-gray-500 text-sm">Loading batch info...</div>
            </div>
        )
    }

    const batchId = trail.batchId.toNumber ? trail.batchId.toNumber() : Number(trail.batchId)
    const entriesCount = trail.entriesInBatch.toNumber ? trail.entriesInBatch.toNumber() : Number(trail.entriesInBatch)
    const rootHashStr = Array.isArray(trail.rootHash)
        ? Buffer.from(trail.rootHash).toString('hex').slice(0, 16)
        : trail.rootHash.toString().slice(0, 16)

    return (
        <div className="border border-gray-700 p-4 bg-black">
            <h3 className="text-green-500 font-mono text-sm font-bold mb-3">[ANCHOR BATCH]</h3>
            <div className="space-y-2 text-xs font-mono">
                <div>Batch ID: {batchId}</div>
                <div>Entries: {entriesCount}</div>
                <div className="truncate">Root: {rootHashStr}...</div>
                {error && <div className="text-red-500">{error}</div>}
                <button
                    onClick={handleAnchorBatch}
                    disabled={isAnchoring || entriesCount === 0}
                    className="mt-2 px-4 py-2 bg-green-500 text-black font-mono text-sm font-bold hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed w-full"
                >
                    {isAnchoring ? "ANCHORING..." : "ANCHOR BATCH"}
                </button>
            </div>
        </div>
    )
}