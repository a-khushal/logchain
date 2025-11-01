"use client";

import { useState, useEffect, useCallback } from "react";
import RegisterServerModal from "./register-server-modal";
import { useFetchAllServers } from "@/hooks/useLogchain";
import { useWallet } from "@solana/wallet-adapter-react";
import { debounce } from "lodash";

interface ServerManagementProps {
  selectedServer: string | null;
  onSelectServer: (serverId: string) => void;
}

export default function ServerManagement({ selectedServer, onSelectServer }: ServerManagementProps) {
  const [showModal, setShowModal] = useState(false);
  const [servers, setServers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchAllServers = useFetchAllServers();
  const { connected } = useWallet();

  const loadServers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAllServers();
      setServers(data);
      if (data.length > 0 && !selectedServer) onSelectServer(data[0].serverId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load servers");
    } finally {
      setIsLoading(false);
    }
  }, [fetchAllServers, selectedServer, onSelectServer]);

  const debouncedLoadServers = useCallback(
    debounce(() => loadServers(), 800),
    [loadServers]
  );

  useEffect(() => {
    if (connected && servers.length === 0) loadServers();
    else if (!connected) setServers([]);
  }, [connected, servers.length]);

  const handleServerRegistered = async (serverId: string) => {
    setShowModal(false);
    await loadServers();
    onSelectServer(serverId);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border bg-secondary flex items-center justify-between">
        <h2 className="font-mono text-sm font-bold text-accent">{"[SERVERS]"}</h2>
        <button
          onClick={debouncedLoadServers}
          disabled={isLoading || !connected}
          className="px-2 py-1 bg-accent text-accent-foreground rounded font-mono text-xs font-bold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "..." : "Refresh"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!connected ? (
          <div className="p-3">
            <div className="p-3 bg-red-500/20 border border-red-500 rounded text-red-500 text-xs font-mono">
              Connect wallet to view servers
            </div>
          </div>
        ) : isLoading ? (
          <div className="p-3 text-muted-foreground text-xs font-mono">Loading servers...</div>
        ) : error ? (
          <div className="p-3 text-red-500 text-xs font-mono">{error}</div>
        ) : servers.length === 0 ? (
          <div className="p-3 text-muted-foreground text-xs font-mono">No servers registered</div>
        ) : (
          <div className="p-3 space-y-2">
            {servers.map((server) => (
              <div
                key={server.serverId}
                onClick={() => onSelectServer(server.serverId)}
                className={`p-3 rounded cursor-pointer transition-colors border font-mono text-xs ${selectedServer === server.serverId
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-card border-border hover:bg-secondary text-foreground"
                  }`}
              >
                <div className="font-bold">{server.serverId}</div>
                <div
                  className={`mt-1 space-y-0.5 font-medium ${selectedServer === server.serverId ? "text-neutral-800" : "text-muted-foreground"
                    }`}
                >
                  <div>ID: {server.serverId}</div>
                  <div>Entries: {server.entryCount?.toString() || "0"}</div>
                  <div>Active: {server.isActive ? "Yes" : "No"}</div>
                  <div>Stake: {(Number(server.stake) / 1e9).toFixed(2)} SOL</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border bg-secondary">
        <button
          onClick={() => setShowModal(true)}
          disabled={!connected}
          className="w-full px-3 py-2 bg-accent text-accent-foreground rounded font-mono text-xs font-bold hover:bg-accent/90 transition-colors border border-accent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + Register Server
        </button>
      </div>

      {showModal && (
        <RegisterServerModal onClose={() => setShowModal(false)} onSuccess={handleServerRegistered} />
      )}
    </div>
  );
}