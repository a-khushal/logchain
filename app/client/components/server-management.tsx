"use client"

import { useState } from "react"
import RegisterServerModal from "./register-server-modal"

interface ServerManagementProps {
  selectedServer: string | null
  onSelectServer: (serverId: string) => void
}

const mockServers = [
  {
    id: "srv-001",
    name: "API Server 1",
    entries: 1247,
    lastBatchId: "batch-42",
    lastAnchor: "2 min ago",
  },
  {
    id: "srv-002",
    name: "Database Server",
    entries: 3891,
    lastBatchId: "batch-41",
    lastAnchor: "15 min ago",
  },
  {
    id: "srv-003",
    name: "Auth Service",
    entries: 562,
    lastBatchId: "batch-40",
    lastAnchor: "1 hour ago",
  },
]

export default function ServerManagement({ selectedServer, onSelectServer }: ServerManagementProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border bg-secondary">
        <h2 className="font-mono text-sm font-bold text-accent">{"[SERVERS]"}</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-2">
          {mockServers.map((server) => (
            <div
              key={server.id}
              onClick={() => onSelectServer(server.id)}
              className={`p-3 rounded cursor-pointer transition-colors border font-mono text-xs ${selectedServer === server.id
                ? "bg-accent text-accent-foreground border-accent"
                : "bg-card border-border hover:bg-secondary text-foreground"
                }`}
            >
              <div className="font-bold">{server.name}</div>
              <div className={selectedServer === server.id ? `text-neutral-800 mt-1 space-y-0.5 font-medium`: `text-muted-foreground mt-1 space-y-0.5 font-medium`}>
                <div>ID: {server.id}</div>
                <div>Entries: {server.entries}</div>
                <div>Batch: {server.lastBatchId}</div>
                <div>Anchor: {server.lastAnchor}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 border-t border-border bg-secondary">
        <button
          onClick={() => setShowModal(true)}
          className="w-full px-3 py-2 bg-accent text-accent-foreground rounded font-mono text-xs font-bold hover:bg-accent/90 transition-colors border border-accent"
        >
          + Register Server
        </button>
      </div>

      {showModal && <RegisterServerModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
