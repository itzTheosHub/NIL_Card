"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Loader2,
  Settings,
  Shield,
} from "lucide-react"
import Header from "@/components/Header"
import ConnectedAccountsCard, { type PlatformStats } from "@/components/ConnectedAccountsCard"
import { createClient } from "@/lib/supabase"

export default function ConnectedAccountsSettingsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [platforms, setPlatforms] = useState<PlatformStats[]>([])

  const fetchConnectionStatus = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    // Fetch profile for token expiry data + username for back link
    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "username, instagram_user_id, instagram_token_expires_at, tiktok_user_id, tiktok_token_expires_at, tiktok_refresh_expires_at"
      )
      .eq("id", user.id)
      .single()

    if (profile) setProfile(profile)

    // Fetch social stats for both platforms
    const { data: stats } = await supabase
      .from("profile_social_stats")
      .select("platform, username, followers, engagement_rate, avg_views, total_posts, is_verified, last_synced_at, connected")
      .eq("profile_id", user.id)
      .in("platform", ["instagram", "tiktok"])

    const platformData: PlatformStats[] = []

    // Build Instagram status
    const igStats = stats?.find((s: any) => s.platform === "instagram")
    platformData.push({
      platform: "instagram",
      connected: !!profile?.instagram_user_id && (igStats?.connected ?? false),
      username: igStats?.username || null,
      followers: igStats?.followers || null,
      engagement_rate: igStats?.engagement_rate || null,
      avg_views: igStats?.avg_views || null,
      total_posts: igStats?.total_posts || null,
      last_synced_at: igStats?.last_synced_at || null,
      token_expires_at: profile?.instagram_token_expires_at || null,
    })

    // Build TikTok status
    const ttStats = stats?.find((s: any) => s.platform === "tiktok")
    platformData.push({
      platform: "tiktok",
      connected: !!profile?.tiktok_user_id && (ttStats?.connected ?? false),
      username: ttStats?.username || null,
      followers: ttStats?.followers || null,
      engagement_rate: null,
      avg_views: ttStats?.avg_views || null,
      total_posts: ttStats?.total_posts || null,
      last_synced_at: ttStats?.last_synced_at || null,
      token_expires_at: profile?.tiktok_token_expires_at || null,
      refresh_expires_at: profile?.tiktok_refresh_expires_at || null,
    })

    setPlatforms(platformData)
    setLoading(false)
  }, [supabase, router])

  useEffect(() => {
    fetchConnectionStatus()
  }, [fetchConnectionStatus])

  const hasAnyConnection = platforms.some((p) => p.connected)

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#08090a] text-white">
        {/* Ambient background blobs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-violet-600/20 blur-[120px] rounded-full" />
          <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-blue-500/15 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-violet-600/10 blur-[100px] rounded-full" />
        </div>

        <Header hidePillNav />

        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#08090a] text-white">
      {/* Ambient background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-violet-600/20 blur-[120px] rounded-full" />
        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-blue-500/15 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-violet-600/10 blur-[100px] rounded-full" />
      </div>

      <Header hidePillNav />

      <main className="flex-1 flex justify-center px-4 pt-24 pb-8 relative">
        <div className="w-full max-w-2xl">
          {/* Back link */}
          <Link
            href={profile?.username ? `/profile/${profile.username}/edit` : "/"}
            className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to profile
          </Link>

          {/* Page header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-violet-600 to-blue-500 rounded-full mb-4">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Connected Accounts
            </h1>
            <p className="text-zinc-400">
              Manage your social media connections, refresh stats, and monitor token health.
            </p>
          </div>

          {/* Connected Accounts Card — with token expiry enabled */}
          <ConnectedAccountsCard
            platforms={platforms}
            returnTo="/settings/connected-accounts"
            showTokenExpiry={true}
            onUpdate={fetchConnectionStatus}
          />

          {/* Verification info card */}
          <div
            className="mt-6 bg-zinc-900 rounded-2xl p-6"
            style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                <Shield className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  How verification works
                </h3>
                <ul className="space-y-2 text-sm text-zinc-400">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span>
                      When you connect a social account, your stats are pulled directly from the platform API and marked as{" "}
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                        ✓ Verified
                      </span>{" "}
                      on your NIL Card.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span>Brands see verified stats as more trustworthy, which can lead to more partnership inquiries.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-zinc-500 mt-0.5">•</span>
                    <span>If you disconnect, your stats revert to self-reported and become manually editable again.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-zinc-500 mt-0.5">•</span>
                    <span>
                      Instagram requires a Creator or Business account.
                      TikTok requires a public account.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Token health info — only shown when at least one account is connected */}
          {hasAnyConnection && (
            <div
              className="mt-4 bg-zinc-900 rounded-2xl p-6"
              style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)" }}
            >
              <h3 className="text-sm font-semibold text-white mb-3">
                Token Health
              </h3>
              <div className="space-y-3">
                {platforms
                  .filter((p) => p.connected)
                  .map((p) => {
                    const config = {
                      instagram: { label: "Instagram", tokenDuration: "60 days" },
                      tiktok: { label: "TikTok", tokenDuration: "365 days (refresh token)" },
                    }[p.platform]

                    // Calculate token status
                    let statusText = ""
                    let statusColor = "text-emerald-400"
                    let expiresAt: string | null = null

                    if (p.platform === "instagram" && p.token_expires_at) {
                      expiresAt = p.token_expires_at
                    } else if (p.platform === "tiktok" && p.refresh_expires_at) {
                      expiresAt = p.refresh_expires_at
                    }

                    if (expiresAt) {
                      const now = new Date()
                      const expiry = new Date(expiresAt)
                      const daysLeft = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

                      if (daysLeft < 0) {
                        statusText = "Expired — reconnect required"
                        statusColor = "text-red-400"
                      } else if (daysLeft < 7) {
                        statusText = `Expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"} — refresh soon`
                        statusColor = "text-red-400"
                      } else if (daysLeft < 14) {
                        statusText = `Expires in ${daysLeft} days — consider refreshing`
                        statusColor = "text-amber-400"
                      } else {
                        statusText = `Healthy — ${daysLeft} days remaining`
                        statusColor = "text-emerald-400"
                      }
                    } else {
                      statusText = "No expiry data available"
                      statusColor = "text-zinc-500"
                    }

                    return (
                      <div key={p.platform} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-zinc-300 font-medium">{config.label}</p>
                          <p className="text-xs text-zinc-500">
                            Token duration: {config.tokenDuration}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs font-medium ${statusColor}`}>
                            {statusText}
                          </p>
                          {p.last_synced_at && (
                            <p className="text-xs text-zinc-600 mt-0.5">
                              Last synced: {formatTimeAgo(p.last_synced_at)}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          {/* Quick links */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            {profile?.username && (
              <Link
                href={`/profile/${profile.username}`}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                View my NIL Card →
              </Link>
            )}
            {profile?.username && (
              <Link
                href={`/profile/${profile.username}/edit`}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Edit profile →
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

// ── Helper ──────────────────────────────────────────────────────
function formatTimeAgo(dateString: string): string {
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
