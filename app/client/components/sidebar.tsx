"use client"

interface SidebarProps {
    servers: string[]
    selectedServer: string
    onServerChange: (server: string) => void
    onRegisterClick: () => void
    newServerBadges: Set<string>
    logsCount: number
}

export default function Sidebar({
    servers,
    selectedServer,
    onServerChange,
    onRegisterClick,
    newServerBadges,
    logsCount,
}: SidebarProps) {
    return (
        <aside className="w-64 border-r border-[#2a2a2a] p-6 bg-[#0f0f0f] overflow-y-auto hidden md:block">
            <div className="space-y-6">
                <div>
                    <label className="text-xs font-semibold text-[#808080] uppercase tracking-wider">Server</label>
                    <select
                        value={selectedServer}
                        onChange={(e) => onServerChange(e.target.value)}
                        className="mt-3 w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-[#e5e5e5] text-sm focus:outline-none focus:border-[#10b981]"
                    >
                        {servers.map((server) => (
                            <option key={server} value={server}>
                                {server}
                                {newServerBadges.has(server) ? " (NEW)" : ""}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={onRegisterClick}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-4 py-2 text-[#e5e5e5] text-sm font-medium hover:bg-[#2a2a2a] transition-colors flex items-center justify-center gap-2"
                >
                    <span>+</span>
                    <span>Register Server</span>
                </button>

                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-4 space-y-3">
                    <div>
                        <p className="text-xs text-[#808080] uppercase tracking-wider">Batch ID</p>
                        <p className="text-lg font-mono font-semibold text-white mt-1">Batch #42</p>
                    </div>
                    <div className="border-t border-[#2a2a2a] pt-3">
                        <p className="text-xs text-[#808080] uppercase tracking-wider">Logs Anchored</p>
                        <p className="text-lg font-mono font-semibold text-[#10b981] mt-1">{logsCount.toLocaleString()}</p>
                    </div>
                    <div className="border-t border-[#2a2a2a] pt-3">
                        <p className="text-xs text-[#808080] uppercase tracking-wider">Last Anchor</p>
                        <p className="text-sm text-[#e5e5e5] mt-1">2 min ago</p>
                    </div>
                </div>

                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-4">
                    <p className="text-xs text-[#808080] uppercase tracking-wider mb-2">Authority</p>
                    <div className="bg-[#10b981] bg-opacity-10 border border-[#10b981] rounded px-2 py-1 inline-block">
                        <p className="text-xs font-medium text-black">Owner</p>
                    </div>
                </div>
            </div>
        </aside>
    )
}
