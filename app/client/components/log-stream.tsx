"use client"

import { useEffect, useRef } from "react"
import type { LogEntry } from "@/lib/mock-data"

interface LogStreamProps {
  logs: LogEntry[]
  selectedServer: string
  onLogClick: (log: LogEntry, index: number) => void
  autoScroll: boolean
  tamperLineIndex: number | null
}

export default function LogStream({ logs, selectedServer, onLogClick, autoScroll, tamperLineIndex }: LogStreamProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [logs, autoScroll])

  const filteredLogs = logs.filter((log) => log.server === selectedServer)

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] border border-[#2a2a2a] rounded overflow-hidden">
      <div className="px-4 py-3 border-b border-[#2a2a2a] bg-[#0f0f0f]">
        <p className="text-xs font-semibold text-[#808080] uppercase tracking-wider">
          Live Log Stream — {selectedServer}
        </p>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto font-mono text-sm space-y-0"
        onMouseEnter={() => {
          /* Pause scroll on hover handled by parent */
        }}
      >
        {filteredLogs.length === 0 ? (
          <div className="p-4 text-[#808080] text-center">No logs for this server</div>
        ) : (
          filteredLogs.map((log, index) => (
            <div
              key={log.id}
              onClick={() => onLogClick(log, index)}
              className={`px-4 py-2 border-b border-[#2a2a2a] cursor-pointer transition-colors ${
                log.tampered
                  ? "bg-[#ef4444] bg-opacity-20 text-[#ef4444] hover:bg-opacity-30"
                  : tamperLineIndex === index
                    ? "bg-[#10b981] bg-opacity-10 text-[#e5e5e5] hover:bg-opacity-20"
                    : "text-[#a0a0a0] hover:bg-[#2a2a2a] hover:text-[#e5e5e5]"
              }`}
              title={`Hash: ${log.hash}`}
            >
              <span className="text-[#808080]">[{log.timestamp}]</span>
              <span className="ml-2 text-[#e5e5e5] font-semibold">[{log.server}]</span>
              <span className="ml-2">{log.method}</span>
              <span className="ml-2">{log.endpoint}</span>
              <span
                className={`ml-2 font-bold ${
                  log.status >= 200 && log.status < 300
                    ? "text-[#10b981]"
                    : log.status >= 400
                      ? "text-[#ef4444]"
                      : "text-[#e5e5e5]"
                }`}
              >
                {log.status}
              </span>
              {log.tampered && <span className="ml-2 text-[#ef4444]">⚠ TAMPERED</span>}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
