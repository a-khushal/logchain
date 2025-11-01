"use client"

import type React from "react"
import { useState } from "react"
import { useRegisterServer } from "@/hooks/useLogchain"
import { useWallet } from "@solana/wallet-adapter-react"

interface RegisterServerModalProps {
  onClose: () => void
  onSuccess?: (serverId: string) => void
}

export default function RegisterServerModal({ onClose, onSuccess }: RegisterServerModalProps) {
  const [formData, setFormData] = useState({
    serverId: "",
    description: "",
    stake: "0.1",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const registerServer = useRegisterServer()
  const { connected } = useWallet()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!connected) {
      setError("Wallet not connected")
      return
    }

    if (!formData.serverId.trim()) {
      setError("Server ID is required")
      return
    }

    if (!formData.description.trim()) {
      setError("Description is required")
      return
    }

    const stakeAmount = parseFloat(formData.stake)
    if (isNaN(stakeAmount) || stakeAmount < 0.1) {
      setError("Stake must be at least 0.1 SOL")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const stakeAmountLamports = Math.round(stakeAmount * 1e9)
      const result = await registerServer(formData.serverId, formData.description, stakeAmountLamports)

      onSuccess?.(formData.serverId)
      setFormData({ serverId: "", description: "", stake: "0.1" })
      onClose()
      return
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register server")
      console.error("Registration error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
      <div className="bg-popover border-2 border-accent rounded p-6 w-96 max-w-[90vw] font-mono">
        <h3 className="text-lg font-bold text-accent mb-4">[REGISTER SERVER]</h3>

        {!connected && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-500 text-sm">
            Connect wallet to register server
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-2">Server ID (max 32 chars)</label>
            <input
              type="text"
              maxLength={32}
              value={formData.serverId}
              onChange={(e) => setFormData({ ...formData, serverId: e.target.value })}
              placeholder="srv-001"
              disabled={isLoading || !connected}
              className="w-full px-3 py-2 bg-secondary border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-2">Description (max 100 chars)</label>
            <textarea
              maxLength={100}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Primary API server"
              disabled={isLoading || !connected}
              className="w-full px-3 py-2 bg-secondary border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent font-mono text-sm resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              rows={3}
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-2">Stake Amount (min 0.1 SOL)</label>
            <div className="flex items-center">
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={formData.stake}
                onChange={(e) => setFormData({ ...formData, stake: e.target.value })}
                placeholder="0.5"
                disabled={isLoading || !connected}
                className="flex-1 px-3 py-2 bg-secondary border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className="ml-2 text-muted-foreground text-sm">SOL</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-secondary border border-border rounded text-foreground hover:bg-secondary/80 transition-colors font-mono text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !connected}
              className="flex-1 px-4 py-2 bg-accent text-accent-foreground border border-accent rounded hover:bg-accent/90 transition-colors font-mono text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Registering..." : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}