

Looking at the implementation plan and existing files, I need to update three files. The plan provides new implementations, but I need to carefully merge them with the existing code rather than blindly replacing. Let me analyze what changes are actually needed:

1. **`lib/phyllo-client.ts`** — The plan adds `PHYLLO_PLATFORMS` array, API helper functions (`createPhylloUser`, `createPhylloToken`, `disconnectPhylloPlatform`, `fetchPhylloStats`), and `PhylloStatsResponse` type. The existing file already has the SDK loading and connect logic. I need to merge both.

2. **`hooks/usePhylloConnect.ts`** — The plan adds initial stats loading on mount, polling after connection, and a `refresh` function. The existing hook has the basic connect/disconnect flow. I need to enhance the existing hook with these new capabilities.

3. **`components/PhylloConnectSection.tsx`** — The plan adds "Refresh Stats" button, better connected state UI with checkmarks. The existing component is close but needs the refresh button and initial loading from the API.

FILE: lib/phyllo-client.ts
```
// lib/phyllo-client.ts
// Client-side Phyllo helpers. Do NOT put server credentials here.

export type PhylloConfig = {
  clientDisplayName: string
  environment: "sandbox" | "staging" | "production"
  userId: string
  token: string
  workPlatformId: string  // singular — one platform per SDK session
}

export type PhylloCallbacks = {
  onAccountConnected: (accountId: string, workPlatformId: string, userId: string) => void
  onAccountDisconnected: (accountId: string, workPlatformId: string, userId: string) => void
  onTokenExpired: (userId: string) => void
  onExit: (reason: string, userId: string) => void
  onConnectionFailure: (reason: string, workPlatformId: string, userId: string) => void
}

// Phyllo work platform IDs (from Phyllo docs)
export const PHYLLO_PLATFORM_IDS = {
  instagram: "9bb8913b-ddd9-430b-a66a-d74d846e6c66",
  tiktok: "de55aeec-0dc8-4119-bf90-16b3d1f0c987",
} as const

export type PhylloPlatform = keyof typeof PHYLLO_PLATFORM_IDS

export const PHYLLO_PLATFORMS: { id: PhylloPlatform; label: string; workPlatformId: string }[] = [
  { id: "instagram", label: "Instagram", workPlatformId: PHYLLO_PLATFORM_IDS.instagram },
  { id: "tiktok", label: "TikTok", workPlatformId: PHYLLO_PLATFORM_IDS.tiktok },
]

export function getPhylloEnvironment(): "sandbox" | "staging" | "production" {
  const env = process.env.NEXT_PUBLIC_PHYLLO_ENVIRONMENT
  if (env === "production") return "production"
  if (env === "staging") return "staging"
  return "sandbox"
}

const PHYLLO_SDK_URL = "https://cdn.getphyllo.com/connect/v2/phyllo-connect.js"

/**
 * Loads the Phyllo Connect web SDK from CDN if not already loaded.
 * Returns the window.PhylloConnect object once ready.
 */
async function loadPhylloSDK(): Promise<any> {
  if (typeof window === "undefined") {
    throw new Error("Phyllo SDK can only be loaded client-side")
  }

  // Already loaded — return immediately
  if ((window as any).PhylloConnect) {
    return (window as any).PhylloConnect
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script")
    script.src = PHYLLO_SDK_URL
    script.onload = () => {
      if ((window as any).PhylloConnect) {
        resolve((window as any).PhylloConnect)
      } else {
        reject(new Error("Phyllo SDK loaded but window.PhylloConnect is undefined — verify the SDK URL"))
      }
    }
    script.onerror = () => reject(new Error("Failed to load Phyllo SDK from CDN"))
    document.head.appendChild(script)
  })
}

/**
 * Loads the Phyllo Connect web SDK and opens the connect modal.
 * Must be called client-side only.
 */
export async function openPhylloConnect(
  config: PhylloConfig,
  callbacks: PhylloCallbacks
) {
  const PhylloConnect = await loadPhylloSDK()

  const phylloConnect = PhylloConnect.initialize({
    clientDisplayName: config.clientDisplayName,
    environment: config.environment,
    userId: config.userId,
    token: config.token,
    workPlatformId: config.workPlatformId,
  })

  // Phyllo web SDK uses event listeners, not inline callback props
  phylloConnect.on("accountConnected", callbacks.onAccountConnected)
  phylloConnect.on("accountDisconnected", callbacks.onAccountDisconnected)
  phylloConnect.on("tokenExpired", callbacks.onTokenExpired)
  phylloConnect.on("exit", callbacks.onExit)
  phylloConnect.on("connectionFailure", callbacks.onConnectionFailure)

  phylloConnect.open()

  return phylloConnect
}

// ---- API helper functions ----

/**
 * Creates a Phyllo user (or retrieves existing) for the current athlete.
 * Returns the phyllo_user_id.
 */
export async function createPhylloUser(): Promise<string> {
  const res = await fetch("/api/phyllo/create-user", { method: "POST" })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || "Failed to create Phyllo user")
  }
  const data = await res.json()
  return data.phyllo_user_id
}

/**
 * Creates a short-lived SDK token for opening the Phyllo Connect modal.
 */
export async function createPhylloToken(phylloUserId: string): Promise<string> {
  const res = await fetch("/api/phyllo/create-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phyllo_user_id: phylloUserId }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || "Failed to create Phyllo token")
  }
  const data = await res.json()
  return data.sdk_token
}

/**
 * Disconnects a platform from the athlete's Phyllo account.
 */
export async function disconnectPhylloPlatform(platform: PhylloPlatform): Promise<void> {
  const res = await fetch("/api/phyllo/disconnect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ platform }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || "Failed to disconnect platform")
  }
}

export type PhylloStatsResponse = {
  instagram_connected: boolean
  tiktok_connected: boolean
  instagram_followers: number | null
  tiktok_followers: number | null
  instagram_avg_views: number | null
  tiktok_avg_views: number | null
  instagram_engagement_rate: number | null
  tiktok_engagement_rate: number | null
  instagram_total_posts: number | null
  tiktok_total_posts: number | null
  instagram_username: string | null
  tiktok_username: string | null
}

/**
 * Fetches the current user's per-platform Phyllo stats from our DB.
 */
export async function fetchPhylloStats(): Promise<PhylloStatsResponse> {
  const res = await fetch("/api/phyllo/stats")
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || "Failed to fetch Phyllo stats")
  }
  return res.json()
}
```

FILE: hooks/usePhylloConnect.ts
```
"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import {
  openPhylloConnect,
  PHYLLO_PLATFORM_IDS,
  getPhylloEnvironment,
  fetchPhylloStats,
  disconnectPhylloPlatform as apiDisconnectPlatform,
  type PhylloPlatform,
  type PhylloStatsResponse,
} from "@/lib/phyllo-client"

export type PhylloConnectionState = {
  instagram: "idle" | "connecting" | "connected" | "error"
  tiktok: "idle" | "connecting" | "connected" | "error"
}

export type PhylloStats = {
  followers: number | null
  avgViews: number | null
  engagementRate: number | null
  totalPosts: number | null
  username: string | null
}

export type PhylloPlatformStats = {
  instagram: PhylloStats | null
  tiktok: PhylloStats | null
}

type UsePhylloConnectOptions = {
  onStatsReceived?: (platform: PhylloPlatform, stats: PhylloStats) => void
  onError?: (platform: PhylloPlatform, error: string) => void
  onDisconnected?: (platform: PhylloPlatform) => void
  onConnected?: (platform: PhylloPlatform, accountId: string) => void
}

export function usePhylloConnect(options: UsePhylloConnectOptions = {}) {
  const optionsRef = useRef(options)
  optionsRef.current = options

  const [initialLoading, setInitialLoading] = useState(true)
  const [connectionState, setConnectionState] = useState<PhylloConnectionState>({
    instagram: "idle",
    tiktok: "idle",
  })
  const [platformStats, setPlatformStats] = useState<PhylloPlatformStats>({
    instagram: null,
    tiktok: null,
  })
  const [errors, setErrors] = useState<{ instagram: string | null; tiktok: string | null }>({
    instagram: null,
    tiktok: null,
  })
  const [phylloUserId, setPhylloUserId] = useState<string | null>(null)

  // Parse the stats API response into per-platform PhylloStats
  const parseStatsResponse = useCallback(
    (data: PhylloStatsResponse): { instagram: PhylloStats; tiktok: PhylloStats } => {
      const igStats: PhylloStats = {
        followers: data.instagram_followers,
        avgViews: data.instagram_avg_views,
        engagementRate: data.instagram_engagement_rate,
        totalPosts: data.instagram_total_posts,
        username: data.instagram_username,
      }

      const tkStats: PhylloStats = {
        followers: data.tiktok_followers,
        avgViews: data.tiktok_avg_views,
        engagementRate: data.tiktok_engagement_rate,
        totalPosts: data.tiktok_total_posts,
        username: data.tiktok_username,
      }

      // Update connection state based on what the DB says
      setConnectionState((prev) => ({
        ...prev,
        instagram: data.instagram_connected ? "connected" : prev.instagram === "connecting" ? "connecting" : "idle",
        tiktok: data.tiktok_connected ? "connected" : prev.tiktok === "connecting" ? "connecting" : "idle",
      }))

      // Update stats for connected platforms
      setPlatformStats((prev) => ({
        ...prev,
        instagram: data.instagram_connected ? igStats : prev.instagram,
        tiktok: data.tiktok_connected ? tkStats : prev.tiktok,
      }))

      return { instagram: igStats, tiktok: tkStats }
    },
    []
  )

  // Load initial state from DB on mount
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await fetchPhylloStats()
        if (!cancelled) {
          parseStatsResponse(data)
        }
      } catch {
        // User might not have a profile yet — that's fine
      } finally {
        if (!cancelled) setInitialLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [parseStatsResponse])

  // Poll for stats after connecting — Phyllo webhook may take a few seconds
  const pollForStats = useCallback(
    async (platform: PhylloPlatform, maxAttempts = 10) => {
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        // Wait 3 seconds between polls
        await new Promise((r) => setTimeout(r, 3000))

        try {
          const data = await fetchPhylloStats()
          const connectedKey = `${platform}_connected` as keyof PhylloStatsResponse
          if (data[connectedKey]) {
            const parsed = parseStatsResponse(data)
            const stats = parsed[platform]

            // Fire the callback so ProfileForm can auto-populate fields
            if (optionsRef.current?.onStatsReceived) {
              optionsRef.current.onStatsReceived(platform, stats)
            }
            return
          }
        } catch {
          // Keep polling
        }
      }

      // If we exhausted all attempts, show a helpful message
      setErrors((prev) => ({
        ...prev,
        [platform]:
          "Stats are still loading. This can happen if your account is private or the platform is temporarily slow. Try refreshing in a minute.",
      }))
    },
    [parseStatsResponse]
  )

  const connectPlatform = useCallback(
    async (platform: PhylloPlatform) => {
      setConnectionState((prev) => ({ ...prev, [platform]: "connecting" }))
      setErrors((prev) => ({ ...prev, [platform]: null }))

      try {
        // Step 1: Create or retrieve Phyllo user
        const userRes = await fetch("/api/phyllo/create-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })

        if (!userRes.ok) {
          const errData = await userRes.json()
          throw new Error(errData.error || "Failed to create Phyllo user")
        }

        const { phyllo_user_id } = await userRes.json()
        setPhylloUserId(phyllo_user_id)

        // Step 2: Create SDK token
        const tokenRes = await fetch("/api/phyllo/create-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phyllo_user_id }),
        })

        if (!tokenRes.ok) {
          const errData = await tokenRes.json()
          throw new Error(errData.error || "Failed to create SDK token")
        }

        const { sdk_token } = await tokenRes.json()

        // Step 3: Open Phyllo Connect SDK
        await openPhylloConnect(
          {
            clientDisplayName: "NIL Card",
            environment: getPhylloEnvironment(),
            userId: phyllo_user_id,
            token: sdk_token,
            workPlatformId: PHYLLO_PLATFORM_IDS[platform],
          },
          {
            onAccountConnected: (_accountId, _workPlatformId, _userId) => {
              setConnectionState((prev) => ({ ...prev, [platform]: "connected" }))
              optionsRef.current?.onConnected?.(platform, _accountId)
              // Start polling for stats — webhook will populate the DB
              pollForStats(platform)
            },
            onAccountDisconnected: (_accountId, _workPlatformId, _userId) => {
              setConnectionState((prev) => ({ ...prev, [platform]: "idle" }))
              setPlatformStats((prev) => ({ ...prev, [platform]: null }))
              optionsRef.current?.onDisconnected?.(platform)
            },
            onTokenExpired: (_userId) => {
              setConnectionState((prev) => ({ ...prev, [platform]: "error" }))
              setErrors((prev) => ({
                ...prev,
                [platform]: "Session expired. Please try again.",
              }))
            },
            onExit: (_reason, _userId) => {
              // If the user closed without connecting, reset to idle
              setConnectionState((prev) => ({
                ...prev,
                [platform]: prev[platform] === "connected" ? "connected" : "idle",
              }))
            },
            onConnectionFailure: (reason, _workPlatformId, _userId) => {
              setConnectionState((prev) => ({ ...prev, [platform]: "error" }))
              setErrors((prev) => ({
                ...prev,
                [platform]: reason || "Connection failed. Please try again.",
              }))
              optionsRef.current?.onError?.(platform, reason)
            },
          }
        )
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error"
        setConnectionState((prev) => ({ ...prev, [platform]: "error" }))
        setErrors((prev) => ({ ...prev, [platform]: message }))
        optionsRef.current?.onError?.(platform, message)
      }
    },
    [pollForStats]
  )

  // Refresh stats for an already-connected platform
  const refreshPlatform = useCallback(
    async (platform: PhylloPlatform) => {
      setErrors((prev) => ({ ...prev, [platform]: null }))

      try {
        const data = await fetchPhylloStats()
        const parsed = parseStatsResponse(data)
        const stats = parsed[platform]

        if (optionsRef.current?.onStatsReceived) {
          optionsRef.current.onStatsReceived(platform, stats)
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to refresh stats"
        setErrors((prev) => ({ ...prev, [platform]: message }))
      }
    },
    [parseStatsResponse]
  )

  const disconnectPlatform = useCallback(
    async (platform: PhylloPlatform) => {
      try {
        await apiDisconnectPlatform(platform)

        setConnectionState((prev) => ({ ...prev, [platform]: "idle" }))
        setPlatformStats((prev) => ({ ...prev, [platform]: null }))
        setErrors((prev) => ({ ...prev, [platform]: null }))
        optionsRef.current?.onDisconnected?.(platform)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error"
        setErrors((prev) => ({ ...prev, [platform]: message }))
      }
    },
    []
  )

  return {
    connectionState,
    platformStats,
    errors,
    phylloUserId,
    initialLoading,
    connectPlatform,
    refreshPlatform,
    disconnectPlatform,
    setConnectionState,
    setPlatformStats,
  }
}
```

FILE: components/PhylloConnectSection.tsx
```
"use client"

import { Check, Loader2, AlertCircle, Instagram, RefreshCw, Unplug } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  usePhylloConnect,
  type PhylloConnectionState,
  type PhylloPlatformStats,
  type PhylloStats,
} from "@/hooks/usePhylloConnect"
import type { PhylloPlatform } from "@/lib/phyllo-client"
import { useEffect, useState } from "react"

// TikTok icon (lucide doesn't have one)
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.21 8.21 0 0 0 4.76 1.52V6.78a4.83 4.83 0 0 1-1-.09z" />
    </svg>
  )
}

type PhylloConnectSectionProps = {
  initialConnectionState?: Partial<PhylloConnectionState>
  initialPlatformStats?: Partial<PhylloPlatformStats>
  onStatsReceived?: (platform: PhylloPlatform, stats: PhylloStats) => void
  onDisconnected?: (platform: PhylloPlatform) => void
  onConnected?: (platform: PhylloPlatform, accountId: string) => void
}

const PLATFORMS: { key: PhylloPlatform; label: string; icon: React.ReactNode }[] = [
  {
    key: "instagram",
    label: "Instagram",
    icon: <Instagram className="h-5 w-5" />,
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: <TikTokIcon className="h-5 w-5" />,
  },
]

export default function PhylloConnectSection({
  initialConnectionState,
  initialPlatformStats,
  onStatsReceived,
  onDisconnected,
  onConnected,
}: PhylloConnectSectionProps) {
  const {
    connectionState,
    platformStats,
    errors,
    initialLoading,
    connectPlatform,
    refreshPlatform,
    disconnectPlatform,
    setConnectionState,
    setPlatformStats,
  } = usePhylloConnect({
    onStatsReceived,
    onDisconnected,
    onConnected,
  })

  const [refreshingPlatform, setRefreshingPlatform] = useState<PhylloPlatform | null>(null)

  // Apply initial states on mount (from parent, e.g. server-loaded data)
  useEffect(() => {
    if (initialConnectionState) {
      setConnectionState((prev) => ({ ...prev, ...initialConnectionState }))
    }
    if (initialPlatformStats) {
      setPlatformStats((prev) => ({ ...prev, ...initialPlatformStats }))
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRefresh = async (platform: PhylloPlatform) => {
    setRefreshingPlatform(platform)
    try {
      await refreshPlatform(platform)
    } finally {
      setRefreshingPlatform(null)
    }
  }

  if (initialLoading) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-1">
            Connect Your Social Accounts
          </h3>
          <p className="text-xs text-gray-500">
            Link your accounts to automatically verify your follower counts and engagement stats.
          </p>
        </div>
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          <span className="ml-2 text-sm text-gray-500">Loading connections…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-1">
          Connect Your Social Accounts
        </h3>
        <p className="text-xs text-gray-500">
          Link your accounts to automatically verify your follower counts and engagement stats.
        </p>
      </div>

      <div className="space-y-3">
        {PLATFORMS.map(({ key, label, icon }) => {
          const state = connectionState[key]
          const stats = platformStats[key]
          const error = errors[key]
          const isRefreshing = refreshingPlatform === key

          return (
            <div
              key={key}
              className={`flex items-center justify-between rounded-lg border p-3 ${
                state === "connected"
                  ? "border-green-200 bg-green-50/50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    state === "connected"
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {icon}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    {state === "connected" && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  {state === "connected" && stats?.username && (
                    <p className="text-xs text-gray-500">@{stats.username}</p>
                  )}
                  {state === "connected" && stats?.followers != null && (
                    <p className="text-xs text-gray-500">
                      {stats.followers.toLocaleString()} followers
                      {stats.engagementRate != null && (
                        <span className="ml-2">
                          · {(stats.engagementRate * 100).toFixed(1)}% engagement
                        </span>
                      )}
                    </p>
                  )}
                  {state === "connected" && !stats && (
                    <p className="text-xs text-green-600">Connected — loading stats…</p>
                  )}
                  {error && (
                    <p className="flex items-center gap-1 text-xs text-red-500 mt-0.5">
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />
                      {error}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {state === "idle" || state === "error" ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => connectPlatform(key)}
                  >
                    Connect
                  </Button>
                ) : state === "connecting" ? (
                  <Button type="button" variant="outline" size="sm" disabled>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    Connecting
                  </Button>
                ) : state === "connected" ? (
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-gray-500 hover:text-gray-700"
                      onClick={() => handleRefresh(key)}
                      disabled={isRefreshing}
                      title="Refresh stats"
                    >
                      <RefreshCw
                        className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
                      />
                      <span className="ml-1">Refresh</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-gray-400 hover:text-red-500"
                      onClick={() => disconnectPlatform(key)}
                      title="Disconnect"
                    >
                      <Unplug className="h-3.5 w-3.5" />
                      <span className="ml-1">Disconnect</span>
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

NOTES:
- The `lib/phyllo-client.ts` file was extended (not replaced) with the new API helper functions (`createPhylloUser`, `createPhylloToken`, `disconnectPhylloPlatform`, `fetchPhylloStats`) and the `PHYLLO_PLATFORMS` array and `PhylloStatsResponse` type. All existing exports are preserved.
- The `hooks/usePhylloConnect.ts` hook was enhanced with: `initialLoading` state, `useEffect` for loading stats on mount, `pollForStats` after connection, `refreshPlatform` function, and `useRef` for stable callback references. The existing `connectPlatform` and `disconnectPlatform` functions were updated to use the new utilities. The `options` parameter is now stored in a ref to avoid stale closures.
- The `components/PhylloConnectSection.tsx` component now shows: a loading spinner during `initialLoading`, green border/background for connected platforms, a green checkmark next to connected platform names, engagement rate display, a "Refresh" button with spinning icon, and a "Disconnect" button with the `Unplug` icon. The component consumes the new `initialLoading` and `refreshPlatform` from the hook.
- The `/api/phyllo/stats` endpoint is expected to return a `PhylloStatsResponse` shape. That endpoint should be implemented in a separate step if not already present.