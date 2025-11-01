"use client"

import { useState } from "react"
import Header from "@/components/header"
import ProofPanel from "@/components/proof-panel"
import StatusBar from "@/components/status-bar"
import ServerManagement from "@/components/server-management"
import LogManagement from "@/components/log-management"
import { useWallet } from "@solana/wallet-adapter-react"

export default function Home() {
  const [selectedServer, setSelectedServer] = useState<string | null>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const { connected } = useWallet();

  if (!connected) {
    return (
      <div className="h-screen w-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-lg">Connect your wallet to verify logs.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header />

      <div className="flex flex-1 overflow-hidden gap-4 p-4">
        <div className="w-64 flex flex-col border border-border rounded overflow-hidden">
          <ServerManagement selectedServer={selectedServer} onSelectServer={setSelectedServer} />
        </div>
        <div className="flex-1 flex flex-col border border-border rounded overflow-hidden">
          {selectedServer ? (
            <LogManagement serverId={selectedServer} />
          ) : (
            <div className="flex items-center justify-center text-muted-foreground">
              Select a server to view logs
            </div>
          )}
        </div>

        <div className="w-72 flex flex-col border border-border rounded overflow-hidden">
          <ProofPanel selectedServer={selectedServer} />
        </div>
      </div>

      <StatusBar autoScroll={autoScroll} onAutoScrollToggle={() => setAutoScroll(!autoScroll)} />
    </div>
  )
}