"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import LogStream from "@/components/log-stream"
import ProofPanel from "@/components/proof-panel"
import StatusBar from "@/components/status-bar"
import LogDetailModal from "@/components/log-detail-modal"
import { generateMockLogs, type LogEntry } from "@/lib/mock-data"

export default function Home() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [selectedServer, setSelectedServer] = useState("web-01")
  const [isConnected, setIsConnected] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [tamperDetected, setTamperDetected] = useState(false)
  const [tamperLineIndex, setTamperLineIndex] = useState<number | null>(null)

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

  const handleWalletConnect = () => {
    setIsConnected(!isConnected)
    if (!isConnected) {
      setTimeout(() => {
        setTamperDetected(true)
        setTamperLineIndex(Math.floor(Math.random() * logs.length))
      }, 500)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#0f0f0f]">
      <Header onConnect={handleWalletConnect} isConnected={isConnected} />

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
            <ProofPanel isConnected={isConnected} tamperDetected={tamperDetected} />
          </div>
        </div>
      </div>

      <StatusBar
        tamperDetected={tamperDetected}
        autoScroll={autoScroll}
        onToggleScroll={() => setAutoScroll(!autoScroll)}
        isConnected={isConnected}
      />

      {showModal && selectedLog && <LogDetailModal log={selectedLog} onClose={() => setShowModal(false)} />}
    </div>
  )
}
