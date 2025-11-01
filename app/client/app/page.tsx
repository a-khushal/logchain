"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import LogStream from "@/components/log-stream"
import ProofPanel from "@/components/proof-panel"
import StatusBar from "@/components/status-bar"
import LogDetailModal from "@/components/log-detail-modal"
import { generateMockLogs, type LogEntry } from "@/lib/mock-data"
import { useWallet } from "@solana/wallet-adapter-react"

export default function Home() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [selectedServer, setSelectedServer] = useState("web-01")
  const [autoScroll, setAutoScroll] = useState(true)
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [tamperDetected, setTamperDetected] = useState(false)
  const [tamperLineIndex, setTamperLineIndex] = useState<number | null>(null)
  const { connected } = useWallet()

  useEffect(() => {
    setLogs(generateMockLogs(50))
  }, [])

  useEffect(() => {
    if (!autoScroll) return

    const interval = setInterval(() => {
      setLogs((prev) => {
        const newLog = generateMockLogs(1)[0]
        return [newLog, ...prev].slice(0, 100)
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [autoScroll])

  const handleLogClick = (log: LogEntry, index: number) => {
    setSelectedLog(log)
    setShowModal(true)

    if (log.tampered) {
      setTamperDetected(true)
      setTamperLineIndex(index)
    }
  }

  useEffect(() => {
    if (connected) {
      setTamperDetected(true)
      setTamperLineIndex(Math.floor(Math.random() * logs.length))
    }
  }, [connected, logs.length])

  if (!connected) {
    return (
      <div className="flex flex-col h-screen bg-[#0f0f0f] text-white">
        <Header />
        <div className="flex-1 flex justify-center items-center text-white text-xl">
          Connect your wallet.
        </div>
      </div>
    );
  }  

  return (
    <div className="flex flex-col h-screen bg-[#0f0f0f]">
      <Header />

      <div className="flex flex-1 overflow-hidden gap-0">
        <Sidebar selectedServer={selectedServer} onServerChange={setSelectedServer} logsCount={logs.length} />

        <div className="flex-1 flex gap-4 p-4 overflow-hidden md:flex-col">
          <div className="flex-1 overflow-hidden">
            <LogStream
              logs={logs}
              selectedServer={selectedServer}
              onLogClick={handleLogClick}
              autoScroll={autoScroll}
              tamperLineIndex={tamperLineIndex}
            />
          </div>

          <div className="w-80 overflow-hidden md:w-full md:h-64">
            <ProofPanel 
              isConnected={connected} 
              tamperDetected={tamperDetected} 
            />
          </div>
        </div>
      </div>

      <StatusBar
        tamperDetected={tamperDetected}
        autoScroll={autoScroll}
        onToggleScroll={() => setAutoScroll(!autoScroll)}
        isConnected={connected}
      />

      {showModal && selectedLog && <LogDetailModal log={selectedLog} onClose={() => setShowModal(false)} />}
    </div>
  )
}
