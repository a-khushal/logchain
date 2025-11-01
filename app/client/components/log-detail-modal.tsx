"use client"

import type { LogEntry } from "@/lib/mock-data"

interface LogDetailModalProps {
  log: LogEntry
  onClose: () => void
}

export default function LogDetailModal({ log, onClose }: LogDetailModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-6 w-96 max-w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Log Details</h2>
          <button onClick={onClose} className="text-[#808080] hover:text-[#e5e5e5] text-xl leading-none">
            ×
          </button>
        </div>

        <div className="space-y-3 font-mono text-sm">
          <div>
            <p className="text-[#808080] text-xs uppercase mb-1">Timestamp</p>
            <p className="text-[#e5e5e5]">{log.timestamp}</p>
          </div>
          <div>
            <p className="text-[#808080] text-xs uppercase mb-1">Server</p>
            <p className="text-[#e5e5e5]">{log.server}</p>
          </div>
          <div>
            <p className="text-[#808080] text-xs uppercase mb-1">Method</p>
            <p className="text-[#e5e5e5]">{log.method}</p>
          </div>
          <div>
            <p className="text-[#808080] text-xs uppercase mb-1">Endpoint</p>
            <p className="text-[#e5e5e5]">{log.endpoint}</p>
          </div>
          <div>
            <p className="text-[#808080] text-xs uppercase mb-1">Status</p>
            <p className={log.status >= 200 && log.status < 300 ? "text-[#10b981]" : "text-[#ef4444]"}>{log.status}</p>
          </div>
          <div>
            <p className="text-[#808080] text-xs uppercase mb-1">Hash</p>
            <p className="text-[#10b981] truncate font-mono text-xs">{log.hash}</p>
          </div>
          {log.tampered && (
            <div className="mt-4 p-3 bg-[#ef4444] bg-opacity-20 border border-[#ef4444] rounded">
              <p className="text-[#e5e5e5] font-bold text-sm">⚠ This log was tampered with</p>
              <p className="text-[#e5e5e5] text-xs mt-1">Current hash does not match blockchain record</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded text-[#e5e5e5] hover:border-[#10b981] transition-colors text-sm font-medium"
          >
            Close
          </button>
          <button className="flex-1 px-4 py-2 bg-[#10b981] text-[#0f0f0f] border border-[#10b981] rounded hover:bg-[#0ea574] transition-colors text-sm font-medium">
            Verify Hash
          </button>
        </div>
      </div>
    </div>
  )
}
