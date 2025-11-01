"use client"

import { useState, useEffect, useRef } from "react"

interface LogEntry {
  id: string
  timestamp: string
  server: string
  level: "info" | "warning" | "error"
  message: string
  statusCode?: number
}

interface LogViewerProps {
  selectedServer: string | null
  autoScroll: boolean
}

const mockLogs: LogEntry[] = [
  {
    id: "1",
    timestamp: "2025-01-11 14:32:45",
    server: "srv-001",
    level: "info",
    message: "Request received from 192.168.1.100",
    statusCode: 200,
  },
  {
    id: "2",
    timestamp: "2025-01-11 14:32:46",
    server: "srv-002",
    level: "info",
    message: "Database query executed successfully",
    statusCode: 200,
  },
  {
    id: "3",
    timestamp: "2025-01-11 14:32:47",
    server: "srv-001",
    level: "warning",
    message: "High memory usage detected: 85%",
  },
  {
    id: "4",
    timestamp: "2025-01-11 14:32:48",
    server: "srv-003",
    level: "error",
    message: "Authentication failed for user admin@example.com",
    statusCode: 401,
  },
  {
    id: "5",
    timestamp: "2025-01-11 14:32:49",
    server: "srv-002",
    level: "info",
    message: "Batch anchored to Solana: batch-42",
    statusCode: 200,
  },
]

export default function LogViewer({ selectedServer, autoScroll }: LogViewerProps) {
  const [logs, setLogs] = useState<LogEntry[]>(mockLogs)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterLevel, setFilterLevel] = useState<"all" | "info" | "warning" | "error">("all")
  const scrollRef = useRef<HTMLDivElement>(null)
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs, autoScroll])

  const filteredLogs = logs.filter((log) => {
    const matchesServer = !selectedServer || log.server === selectedServer
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.server.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = filterLevel === "all" || log.level === filterLevel

    return matchesServer && matchesSearch && matchesLevel
  })

  const getLevelColor = (level: string) => {
    switch (level) {
      case "info":
        return "text-accent"
      case "warning":
        return "text-yellow-400"
      case "error":
        return "text-destructive"
      default:
        return "text-foreground"
    }
  }

  const getLevelBgColor = (level: string) => {
    switch (level) {
      case "info":
        return "bg-green-900/20"
      case "warning":
        return "bg-yellow-900/20"
      case "error":
        return "bg-red-900/20"
      default:
        return "bg-secondary"
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border bg-secondary">
        <h2 className="font-mono text-sm font-bold text-accent">{"[LOG STREAM]"}</h2>
      </div>

      <div className="px-4 py-3 border-b border-border bg-card space-y-2">
        <input
          type="text"
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 bg-secondary border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent font-mono text-xs"
        />
        <div className="flex gap-2">
          {(["all", "info", "warning", "error"] as const).map((level) => (
            <button
              key={level}
              onClick={() => setFilterLevel(level)}
              className={`px-3 py-1 rounded font-mono text-xs font-bold transition-colors border ${filterLevel === level
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-secondary border-border hover:bg-secondary/80"
                }`}
            >
              {level.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-xs">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            onClick={() => setSelectedLog(log)}
            className={`p-2 rounded cursor-pointer transition-colors border hover:bg-secondary/50 ${getLevelBgColor(
              log.level,
            )} border-border`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex gap-2">
                  <span className="text-muted-foreground">{log.timestamp}</span>
                  <span className="text-muted-foreground">[{log.server}]</span>
                  <span className={`font-bold ${getLevelColor(log.level)}`}>{log.level.toUpperCase()}</span>
                </div>
                <div className="text-foreground mt-1">{log.message}</div>
              </div>
              {log.statusCode && (
                <div className={`ml-2 font-bold ${log.statusCode >= 400 ? "text-destructive" : "text-accent"}`}>
                  {log.statusCode}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedLog && (
        <div
          className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="bg-popover border-2 border-accent rounded p-6 w-96 max-w-[90vw] font-mono"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-accent mb-4">[LOG DETAILS]</h3>

            <div className="space-y-3 text-xs mb-6">
              <div>
                <span className="text-muted-foreground">Timestamp: </span>
                <span className="text-foreground">{selectedLog.timestamp}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Server: </span>
                <span className="text-foreground">{selectedLog.server}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Level: </span>
                <span className={getLevelColor(selectedLog.level)}>{selectedLog.level.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Message: </span>
                <span className="text-foreground block mt-1 wrap-break-word">{selectedLog.message}</span>
              </div>
              {selectedLog.statusCode && (
                <div>
                  <span className="text-muted-foreground">Status Code: </span>
                  <span className={selectedLog.statusCode >= 400 ? "text-destructive" : "text-accent"}>
                    {selectedLog.statusCode}
                  </span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Entry Hash: </span>
                <span className="text-accent font-bold break-all">0x{Math.random().toString(16).slice(2, 18)}...</span>
              </div>
              <div>
                <span className="text-muted-foreground">Previous Hash: </span>
                <span className="text-accent font-bold break-all">0x{Math.random().toString(16).slice(2, 18)}...</span>
              </div>
              <div>
                <span className="text-muted-foreground">Data Hash: </span>
                <span className="text-accent font-bold break-all">0x{Math.random().toString(16).slice(2, 18)}...</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded font-bold hover:bg-accent/90 transition-colors border border-accent">
                Verify Hash
              </button>
              <button
                onClick={() => setSelectedLog(null)}
                className="flex-1 px-4 py-2 bg-secondary border border-border rounded hover:bg-secondary/80 transition-colors font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
