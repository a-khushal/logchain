export interface LogEntry {
    id: string
    timestamp: string
    server: string
    method: string
    endpoint: string
    status: number
    hash: string
    tampered: boolean
}

const SERVERS = ["web-01", "api-02", "db-01", "cache-03"]
const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"]
const ENDPOINTS = [
    "/health",
    "/api/users",
    "/api/posts",
    "/api/auth/login",
    "/api/data",
    "/webhook/payment",
    "/db/query",
    "/cache/get",
]
const STATUSES = [200, 201, 204, 400, 401, 404, 500, 503]

function generateHash(): string {
    const chars = "0123456789abcdef"
    return Array.from({ length: 64 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("")
}

function generateTimestamp(): string {
    const hour = String(Math.floor(Math.random() * 24)).padStart(2, "0")
    const minute = String(Math.floor(Math.random() * 60)).padStart(2, "0")
    const second = String(Math.floor(Math.random() * 60)).padStart(2, "0")
    return `${hour}:${minute}:${second}`
}

export function generateMockLogs(count: number): LogEntry[] {
    return Array.from({ length: count }, (_, i) => ({
        id: `log-${Date.now()}-${i}`,
        timestamp: generateTimestamp(),
        server: SERVERS[Math.floor(Math.random() * SERVERS.length)],
        method: METHODS[Math.floor(Math.random() * METHODS.length)],
        endpoint: ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)],
        status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
        hash: generateHash(),
        tampered: Math.random() < 0.05, // 5% tamper rate
    }))
}
