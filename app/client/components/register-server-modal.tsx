"use client"

import type React from "react"

import { useState } from "react"

interface RegisterServerModalProps {
    isOpen: boolean
    onClose: () => void
    onRegister: (serverId: string, description: string, stake: number) => void
    existingServers: string[]
}

const isValidId = (id: string) => /^[a-z0-9-]+$/i.test(id) && id.length > 0 && id.length <= 32

export default function RegisterServerModal({
    isOpen,
    onClose,
    onRegister,
    existingServers,
}: RegisterServerModalProps) {
    const [serverId, setServerId] = useState("")
    const [description, setDescription] = useState("")
    const [stake, setStake] = useState("0.01")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const isValid = isValidId(serverId) && !existingServers.includes(serverId) && Number(stake) >= 0.005

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isValid) return

        setIsLoading(true)
        setError("")

        setTimeout(() => {
            onRegister(serverId, description, Number(stake))
            setServerId("")
            setDescription("")
            setStake("0.01")
            setIsLoading(false)
            onClose()
        }, 500)
    }

    if (!isOpen) return null

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded w-full max-w-md max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-[#1a1a1a] border-b border-[#2a2a2a] p-6 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-[#e5e5e5]">Register New Server</h2>
                        <button onClick={onClose} className="text-[#808080] hover:text-[#e5e5e5] text-xl leading-none">
                            ×
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        <div>
                            <label className="text-xs font-semibold text-[#808080] uppercase tracking-wider">Server ID</label>
                            <input
                                type="text"
                                value={serverId}
                                onChange={(e) => {
                                    setServerId(e.target.value)
                                    setError("")
                                }}
                                placeholder="web-01"
                                maxLength={32}
                                className="mt-2 w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded px-3 py-2 text-[#e5e5e5] text-sm focus:outline-none focus:border-[#10b981]"
                            />
                            <p className="text-xs text-[#808080] mt-1">Alphanumeric and hyphens only</p>
                            {serverId && !isValidId(serverId) && <p className="text-xs text-[#ef4444] mt-1">Invalid format</p>}
                            {serverId && existingServers.includes(serverId) && (
                                <p className="text-xs text-[#ef4444] mt-1">Server already exists</p>
                            )}
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-[#808080] uppercase tracking-wider">
                                Description (Optional)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Main web server – Frankfurt"
                                rows={3}
                                className="mt-2 w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded px-3 py-2 text-[#e5e5e5] text-sm focus:outline-none focus:border-[#10b981] resize-none"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-[#808080] uppercase tracking-wider">
                                Initial Stake (SOL)
                            </label>
                            <input
                                type="number"
                                value={stake}
                                onChange={(e) => {
                                    setStake(e.target.value)
                                    setError("")
                                }}
                                min="0.005"
                                step="0.001"
                                className="mt-2 w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded px-3 py-2 text-[#e5e5e5] text-sm focus:outline-none focus:border-[#10b981]"
                            />
                            <p className="text-xs text-[#808080] mt-1">Pays for PDA rent + first batch (min: 0.005 SOL)</p>
                            {Number(stake) < 0.005 && <p className="text-xs text-[#ef4444] mt-1">Minimum stake is 0.005 SOL</p>}
                        </div>

                        {error && (
                            <div className="bg-[#ef4444] bg-opacity-10 border border-[#ef4444] rounded p-3">
                                <p className="text-xs text-[#ef4444]">{error}</p>
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                className="flex-1 bg-[#2a2a2a] border border-[#3a3a3a] rounded px-4 py-2 text-[#e5e5e5] text-sm font-medium hover:bg-[#3a3a3a] disabled:opacity-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!isValid || isLoading}
                                className="flex-1 bg-[#10b981] rounded px-4 py-2 text-white text-sm font-medium hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? "Registering..." : "Register"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}
