"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Loader2,
  Sparkles,
  Info,
} from "lucide-react"
import Header from "@/components/Header"
import ConnectedAccountsCard, { type PlatformStats } from "@/components/ConnectedAccountsCard"
import { createClient } from "@/lib/supabase"

export default function OnboardingConnectPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col bg-[#08090a] text-white">
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
    }>
      <OnboardingConnectInner />
    </Suspense>
  )
}

function OnboardingConnectInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [platforms, setPlatforms] = useState<PlatformStats[]>([])

  // Post-OAuth feedback from query params
  const tiktokConnected = searchParams.get("tiktok_connected") === "true"
  const tiktokError = searchParams.get("tiktok_error")
  const tiktokStatsError = searchParams.get("tiktok_stats_error") === "true"
  const instagramConnected = searchParams.get("instagram_connected") === "true"
  const instagramError = searchParams.get("instagram_error")
  const instagramStatsError = searchParams.get("instagram_stats_error") === "true"

  const fetchConnectionStatus = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    setUser(user)

    // Fetch profile for token expiry data
    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "instagram_user_id, instagram_token_expires_at, tiktok_user_id, tiktok_token_expires_at, tiktok_refresh_expires_at"
      )
      .eq("id", user.id)
      .single()

    // Fetch social stats for both platforms
    const { data: stats } = await supabase
      .from("profile_social_stats")
      .select("platform, username, followers, engagement_rate, avg_views, total_posts, likes_count, is_verified, last_synced_at, connected")
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
      likes_count: igStats?.likes_count || null,
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
      likes_count: ttStats?.likes_count || null,
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
          {/* Page header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-violet-600 to-blue-500 rounded-full mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Connect your social accounts
            </h1>
            <p className="text-zinc-400">
              Pull your real stats automatically. Brands trust verified numbers.
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-0 mb-8">
            {/* Step 1 — completed */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border border-zinc-700 text-zinc-500">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-sm font-medium text-zinc-500">Basics</span>
            </div>
            <div className="w-12 h-px bg-zinc-700 mx-3" />
            {/* Step 2 — current */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-gradient-to-r from-violet-600 to-blue-500 text-white">
                2
              </div>
              <span className="text-sm font-medium text-white">Connect</span>
            </div>
            <div className="w-12 h-px bg-zinc-700 mx-3" />
            {/* Step 3 — upcoming */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border border-zinc-700 text-zinc-500">
                3
              </div>
              <span className="text-sm font-medium text-zinc-500">Profile</span>
            </div>
          </div>

          {/* Instagram Creator/Business account warning */}
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-200/90">
              <p className="font-medium text-amber-300 mb-1">
                Instagram requires a Creator or Business account.
              </p>
              <p className="text-amber-200/70 leading-relaxed">
                Personal accounts won&apos;t work. Switching is free and takes 30 seconds:
                Settings → Account → Switch to Professional Account. You can switch back anytime.
              </p>
            </div>
          </div>

          {/* OAuth error messages from query params */}
          {tiktokError && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-red-300">TikTok connection failed</p>
                <p className="text-red-200/70 mt-0.5">{decodeURIComponent(tiktokError)}</p>
              </div>
            </div>
          )}

          {instagramError && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-red-300">Instagram connection failed</p>
                <p className="text-red-200/70 mt-0.5">{decodeURIComponent(instagramError)}</p>
              </div>
            </div>
          )}

          {/* Stats pull warnings (connected but stats failed) */}
          {tiktokConnected && tiktokStatsError && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4">
              <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-200/90">
                <p className="font-medium text-amber-300">TikTok connected, but stats couldn&apos;t be pulled</p>
                <p className="text-amber-200/70 mt-0.5">
                  Your account is linked — you can try refreshing stats from your profile settings.
                </p>
              </div>
            </div>
          )}

          {instagramConnected && instagramStatsError && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4">
              <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-200/90">
                <p className="font-medium text-amber-300">Instagram connected, but stats couldn&apos;t be pulled</p>
                <p className="text-amber-200/70 mt-0.5">
                  Your account is linked — you can try refreshing stats from your profile settings.
                </p>
              </div>
            </div>
          )}

          {/* Success messages for just-connected platforms */}
          {tiktokConnected && !tiktokStatsError && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-300 font-medium">
                TikTok connected successfully! Your stats have been synced.
              </p>
            </div>
          )}

          {instagramConnected && !instagramStatsError && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-300 font-medium">
                Instagram connected successfully! Your stats have been synced.
              </p>
            </div>
          )}

          {/* Connected Accounts Card */}
          <ConnectedAccountsCard
            platforms={platforms}
            returnTo="/onboarding/connect"
            showTokenExpiry={false}
            onUpdate={fetchConnectionStatus}
          />

          {/* Bottom actions */}
          <div className="flex items-center justify-between mt-8">
            <Link
              href="/onboarding/profile"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Skip for now
            </Link>

            <button
              onClick={() => router.push("/onboarding/profile")}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 text-white text-sm font-semibold transition-all hover:shadow-[0_0_16px_rgba(124,58,237,0.4)]"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Helper text */}
          {!hasAnyConnection && (
            <p className="text-xs text-zinc-600 text-center mt-4">
              You can always connect your accounts later from your profile settings.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
