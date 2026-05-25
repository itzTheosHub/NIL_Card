"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Instagram,
  Music,
  CheckCircle,
  RefreshCw,
  Unlink,
  Link as LinkIcon,
  AlertTriangle,
  Loader2,
} from "lucide-react"

type PlatformStats = {
  platform: "instagram" | "tiktok"
  connected: boolean
  username?: string | null
  followers?: number | null
  engagement_rate?: number | null
  avg_views?: number | null
  total_posts?: number | null
  last_synced_at?: string | null
  token_expires_at?: string | null
  refresh_expires_at?: string | null // TikTok only
}

type ConnectedAccountsCardProps = {
  platforms: PlatformStats[]
  /** Where to redirect back after OAuth (e.g. "/onboarding/connect" or "/profile/maya-chen/edit") */
  returnTo?: string
  /** Show token expiry warnings (used on settings page) */
  showTokenExpiry?: boolean
  /** Callback after a successful refresh or disconnect so parent can re-fetch data */
  onUpdate?: () => void
}

function formatFollowers(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K"
  }
  return num.toString()
}

function timeAgo(dateString: string): string {
  const now = new Date()
  const then = new Date(dateString)
  const diffMs = now.getTime() - then.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffSec < 60) return "just now"
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`
  if (diffDay < 30) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`
  return then.toLocaleDateString()
}

function daysUntil(dateString: string): number {
  const now = new Date()
  const then = new Date(dateString)
  return Math.floor((then.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function isExpired(dateString: string): boolean {
  return new Date(dateString) < new Date()
}

const platformConfig = {
  instagram: {
    label: "Instagram",
    icon: Instagram,
    emoji: "📸",
    authPath: "/api/auth/instagram",
    color: "text-pink-400",
  },
  tiktok: {
    label: "TikTok",
    icon: Music,
    emoji: "🎵",
    authPath: "/api/auth/tiktok",
    color: "text-cyan-400",
  },
}

function PlatformRow({
  stats,
  returnTo,
  showTokenExpiry,
  onUpdate,
}: {
  stats: PlatformStats
  returnTo: string
  showTokenExpiry: boolean
  onUpdate?: () => void
}) {
  const [refreshing, setRefreshing] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()

  const config = platformConfig[stats.platform]
  const Icon = config.icon

  // Determine token expiry status
  let tokenExpired = false
  let tokenExpiryWarning: string | null = null

  if (stats.connected && showTokenExpiry) {
    if (stats.platform === "instagram" && stats.token_expires_at) {
      if (isExpired(stats.token_expires_at)) {
        tokenExpired = true
      } else {
        const days = daysUntil(stats.token_expires_at)
        if (days < 14) {
          tokenExpiryWarning = `Your Instagram token expires in ${days} day${days === 1 ? "" : "s"}. Refresh to extend.`
        }
      }
    }
    if (stats.platform === "tiktok" && stats.refresh_expires_at) {
      if (isExpired(stats.refresh_expires_at)) {
        tokenExpired = true
      }
    }
  }

  async function handleRefresh() {
    setRefreshing(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const res = await fetch("/api/social/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: stats.platform }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to refresh stats")
      }

      setSuccessMessage("Stats refreshed successfully")
      setTimeout(() => setSuccessMessage(null), 3000)
      onUpdate?.()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setRefreshing(false)
    }
  }

  async function handleDisconnect() {
    if (!confirm(`Disconnect ${config.label}? Your stats will revert to manual entry.`)) {
      return
    }

    setDisconnecting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const res = await fetch("/api/social/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: stats.platform }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to disconnect")
      }

      setSuccessMessage("Disconnected successfully")
      setTimeout(() => setSuccessMessage(null), 3000)
      onUpdate?.()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setDisconnecting(false)
    }
  }

  function handleConnect() {
    const params = new URLSearchParams({ from: returnTo })
    window.location.href = `${config.authPath}?${params.toString()}`
  }

  // ── Connected state ──────────────────────────────────────────
  if (stats.connected && !tokenExpired) {
    return (
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          {/* Left: platform info */}
          <div className="flex items-start gap-3 min-w-0">
            <div className={`mt-0.5 ${config.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">{config.label}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                  <CheckCircle className="w-3 h-3" />
                  Connected
                </span>
              </div>
              {stats.username && (
                <p className="text-sm text-zinc-400 mt-0.5">
                  @{stats.username.replace(/^@/, "")}
                </p>
              )}
              {/* Stats grid */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                {stats.followers != null && (
                  <span className="text-xs text-zinc-400">
                    <span className="text-white font-medium">{formatFollowers(stats.followers)}</span> followers
                  </span>
                )}
                {stats.avg_views != null && (
                  <span className="text-xs text-zinc-400">
                    <span className="text-white font-medium">{formatFollowers(stats.avg_views)}</span> avg views
                  </span>
                )}
                {stats.engagement_rate != null && (
                  <span className="text-xs text-zinc-400">
                    <span className="text-white font-medium">{stats.engagement_rate.toFixed(1)}%</span> engagement
                  </span>
                )}
                {stats.total_posts != null && (
                  <span className="text-xs text-zinc-400">
                    <span className="text-white font-medium">{stats.total_posts}</span> posts
                  </span>
                )}
              </div>
              {stats.last_synced_at && (
                <p className="text-xs text-zinc-600 mt-1">
                  Last synced: {timeAgo(stats.last_synced_at)}
                </p>
              )}
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing || disconnecting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {refreshing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              Refresh Stats
            </button>
            <button
              type="button"
              onClick={handleDisconnect}
              disabled={refreshing || disconnecting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-red-500/10 hover:border-red-500/20 text-zinc-400 hover:text-red-400 text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {disconnecting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Unlink className="w-3.5 h-3.5" />
              )}
              Disconnect
            </button>
          </div>
        </div>

        {/* Token expiry warning */}
        {tokenExpiryWarning && (
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300">{tokenExpiryWarning}</p>
          </div>
        )}

        {/* Success / Error messages */}
        {successMessage && (
          <p className="text-xs text-emerald-400 pl-8">{successMessage}</p>
        )}
        {error && (
          <p className="text-xs text-red-400 pl-8">{error}</p>
        )}
      </div>
    )
  }

  // ── Token expired state (needs reconnect) ────────────────────
  if (stats.connected && tokenExpired) {
    return (
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`mt-0.5 ${config.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">{config.label}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs font-medium">
                  <AlertTriangle className="w-3 h-3" />
                  Expired
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Your {config.label} connection has expired. Reconnect to continue syncing stats.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConnect}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 text-white text-xs font-semibold transition-all hover:shadow-[0_0_12px_rgba(124,58,237,0.3)] shrink-0"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            Reconnect {config.label}
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-400 pl-8">{error}</p>
        )}
      </div>
    )
  }

  // ── Disconnected state ───────────────────────────────────────
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="text-zinc-500">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">{config.label}</span>
              <span className="text-xs text-zinc-500">— Not connected</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleConnect}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 text-white text-xs font-semibold transition-all hover:shadow-[0_0_12px_rgba(124,58,237,0.3)] shrink-0"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          Connect {config.label}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-400 pl-8">{error}</p>
      )}
    </div>
  )
}

export default function ConnectedAccountsCard({
  platforms,
  returnTo = "/onboarding/connect",
  showTokenExpiry = false,
  onUpdate,
}: ConnectedAccountsCardProps) {
  // Ensure we always show both platforms, even if not passed in
  const instagramStats = platforms.find((p) => p.platform === "instagram") || {
    platform: "instagram" as const,
    connected: false,
  }
  const tiktokStats = platforms.find((p) => p.platform === "tiktok") || {
    platform: "tiktok" as const,
    connected: false,
  }

  return (
    <div
      className="bg-zinc-900 rounded-2xl p-6 space-y-5"
      style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }}
    >
      <div>
        <h2 className="text-lg font-semibold text-white">Connected Accounts</h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          Connect your social accounts to auto-sync verified stats.
        </p>
      </div>

      {/* Instagram row */}
      <PlatformRow
        stats={instagramStats}
        returnTo={returnTo}
        showTokenExpiry={showTokenExpiry}
        onUpdate={onUpdate}
      />

      {/* Divider */}
      <div className="h-px bg-white/10" />

      {/* TikTok row */}
      <PlatformRow
        stats={tiktokStats}
        returnTo={returnTo}
        showTokenExpiry={showTokenExpiry}
        onUpdate={onUpdate}
      />
    </div>
  )
}

export type { PlatformStats, ConnectedAccountsCardProps }
