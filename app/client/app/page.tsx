"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import LogStream from "@/components/log-stream"
import ProofPanel from "@/components/proof-panel"
import StatusBar from "@/components/status-bar"
import LogDetailModal from "@/components/log-detail-modal"
import RegisterServerModal from "@/components/register-server-modal"
import { generateMockLogs, type LogEntry } from "@/lib/mock-data"

export default function Home() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [servers, setServers] = useState(["web-01", "api-02", "db-01", "cache-03"])
  const [newServerBadges, setNewServerBadges] = useState<Set<string>>(new Set())
  const [selectedServer, setSelectedServer] = useState("web-01")
  const [isConnected, setIsConnected] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)
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

  useEffect(() => {
    if (newServerBadges.size === 0) return

    const timer = setTimeout(() => {
      setNewServerBadges(new Set())
    }, 10000)

    return () => clearTimeout(timer)
  }, [newServerBadges])

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

  const handleRegisterServer = (serverId: string, description: string, stake: number) => {
    setServers((prev) => [...prev, serverId])
    setNewServerBadges((prev) => new Set([...prev, serverId]))
    setSelectedServer(serverId)
  }

  return (
    <div className="flex flex-col h-screen bg-[#0f0f0f]">
      <Header />

      <div className="flex flex-1 overflow-hidden gap-0">
        <Sidebar
          servers={servers}
          selectedServer={selectedServer}
          onServerChange={setSelectedServer}
          onRegisterClick={() => setShowRegisterModal(true)}
          newServerBadges={newServerBadges}
          logsCount={logs.length}
        />

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

      <RegisterServerModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onRegister={handleRegisterServer}
        existingServers={servers}
      />
    </div>
  )
}
