"use client"

import type React from "react"

import { useState } from "react"

interface RegisterServerModalProps {
  onClose: () => void
}

export default function RegisterServerModal({ onClose }: RegisterServerModalProps) {
  const [formData, setFormData] = useState({
    serverId: "",
    description: "",
    stake: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle Solana program call here
    console.log("Register server:", formData)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50">
      <div className="bg-popover border-2 border-accent rounded p-6 w-96 max-w-[90vw] font-mono">
        <h3 className="text-lg font-bold text-accent mb-4">[REGISTER SERVER]</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-2">Server ID (max 32 chars)</label>
            <input
              type="text"
              maxLength={32}
              value={formData.serverId}
              onChange={(e) => setFormData({ ...formData, serverId: e.target.value })}
              placeholder="srv-001"
              className="w-full px-3 py-2 bg-secondary border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent font-mono text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-2">Description (max 100 chars)</label>
            <textarea
              maxLength={100}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Primary API server"
              className="w-full px-3 py-2 bg-secondary border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent font-mono text-sm resize-none"
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
                className="flex-1 px-3 py-2 bg-secondary border border-border rounded text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent font-mono text-sm"
              />
              <span className="ml-2 text-muted-foreground text-sm">SOL</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-secondary border border-border rounded text-foreground hover:bg-secondary/80 transition-colors font-mono text-sm font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-accent text-accent-foreground border border-accent rounded hover:bg-accent/90 transition-colors font-mono text-sm font-bold"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
