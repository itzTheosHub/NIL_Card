# Step 8: Wire up connected state UI (checkmark, refresh, disconnect)



# Step 8: Wire up connected state UI (checkmark, refresh, disconnect)

This step focuses on updating `PhylloConnectSection` to show the proper connected/disconnected state per platform, with green checkmarks, "Refresh Stats" buttons, and "Disconnect" buttons. This requires understanding the full flow, so I'll also need to provide/update the supporting hooks and client utilities that this component depends on.

Let me trace through what already exists and what needs to be built:

- `ProfileForm.tsx` already imports `PhylloConnectSection` and `usePhylloConnect` types
- We need to implement the full `PhylloConnectSection` component
- We need to implement the `usePhylloConnect` hook
- We need to implement the `phyllo-client` utility

## File 1: `lib/phyllo-client.ts`

```ts
// lib/phyllo-client.ts

export type PhylloPlatform = "instagram" | "tiktok"

export const PHYLLO_PLATFORMS: { id: PhylloPlatform; label: string; workPlatformId: string }[] = [
  { id: "instagram", label: "Instagram", workPlatformId: "9bb8913b-ddd9-430b-a66a-d74d846e6c66" },
  { id: "tiktok", label: "TikTok", workPlatformId: "de55aeec-0dc8-4119-bf90-16b3d1f0c987" },
]

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

## File 2: `hooks/usePhylloConnect.ts`

```ts
// hooks/usePhylloConnect.ts

"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  createPhylloUser,
  createPhylloToken,
  disconnectPhylloPlatform,
  fetchPhylloStats,
  PHYLLO_PLATFORMS,
  type PhylloPlatform,
  type PhylloStatsResponse,
} from "@/lib/phyllo-client"

export type PhylloStats = {
  followers: number | null
  avgViews: number | null
  engagementRate: number | null
  totalPosts: number | null
  username: string | null
}

export type PlatformState = {
  connected: boolean
  loading: boolean
  error: string | null
  stats: PhylloStats | null
}

type UsePhylloConnectReturn = {
  platforms: Record<PhylloPlatform, PlatformState>
  connect: (platform: PhylloPlatform) => Promise<void>
  refresh: (platform: PhylloPlatform) => Promise<void>
  disconnect: (platform: PhylloPlatform) => Promise<void>
  initialLoading: boolean
}

/**
 * Hook that manages the full Phyllo Connect lifecycle:
 * - Loads existing connection state on mount
 * - Opens the Phyllo SDK modal to connect a platform
 * - Polls for stats after connection
 * - Refreshes stats on demand
 * - Disconnects a platform
 */
export function usePhylloConnect(callbacks?: {
  onStatsReceived?: (platform: PhylloPlatform, stats: PhylloStats) => void
  onConnected?: (platform: PhylloPlatform, accountId: string) => void
  onDisconnected?: (platform: PhylloPlatform) => void
}): UsePhylloConnectReturn {
  const callbacksRef = useRef(callbacks)
  callbacksRef.current = callbacks

  const [initialLoading, setInitialLoading] = useState(true)
  const [platforms, setPlatforms] = useState<Record<PhylloPlatform, PlatformState>>({
    instagram: { connected: false, loading: false, error: null, stats: null },
    tiktok: { connected: false, loading: false, error: null, stats: null },
  })

  // Helper to update a single platform's state
  const updatePlatform = useCallback(
    (platform: PhylloPlatform, updates: Partial<PlatformState>) => {
      setPlatforms((prev) => ({
        ...prev,
        [platform]: { ...prev[platform], ...updates },
      }))
    },
    []
  )

  // Parse the stats response from our API into per-platform PhylloStats
  const parseStatsResponse = useCallback(
    (data: PhylloStatsResponse) => {
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

      setPlatforms((prev) => ({
        ...prev,
        instagram: {
          ...prev.instagram,
          connected: data.instagram_connected,
          stats: data.instagram_connected ? igStats : prev.instagram.stats,
        },
        tiktok: {
          ...prev.tiktok,
          connected: data.tiktok_connected,
          stats: data.tiktok_connected ? tkStats : prev.tiktok.stats,
        },
      }))

      return { instagram: igStats, tiktok: tkStats, raw: data }
    },
    []
  )

  // Load initial state on mount
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
      updatePlatform(platform, { loading: true, error: null })

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        // Wait 3 seconds between polls
        await new Promise((r) => setTimeout(r, 3000))

        try {
          const data = await fetchPhylloStats()
          const connectedKey = `${platform}_connected` as keyof PhylloStatsResponse
          if (data[connectedKey]) {
            const parsed = parseStatsResponse(data)
            const stats = parsed[platform]
            updatePlatform(platform, { loading: false })

            // Fire the callback so ProfileForm can auto-populate fields
            if (callbacksRef.current?.onStatsReceived) {
              callbacksRef.current.onStatsReceived(platform, stats)
            }
            return
          }
        } catch {
          // Keep polling
        }
      }

      // If we exhausted all attempts
      updatePlatform(platform, {
        loading: false,
        error: "We couldn't pull your stats. This can happen if your account is set to private or the platform is temporarily down.",
      })
    },
    [updatePlatform, parseStatsResponse]
  )

  // Open Phyllo Connect SDK modal for a platform
  const connect = useCallback(
    async (platform: PhylloPlatform) => {
      updatePlatform(platform, { loading: true, error: null })

      try {
        // 1. Create or retrieve the Phyllo user
        const phylloUserId = await createPhylloUser()

        // 2. Get a short-lived SDK token
        const sdkToken = await createPhylloToken(phylloUserId)

        // 3. Find the work_platform_id for this platform
        const platformConfig = PHYLLO_PLATFORMS.find((p) => p.id === platform)
        if (!platformConfig) throw new Error(`Unknown platform: ${platform}`)

        // 4. Dynamically import and launch the Phyllo SDK
        // The Phyllo Connect SDK attaches to window — we load it via script tag
        await loadPhylloSDK()

        const phylloConnect = (window as any).PhylloConnect.initialize({
          clientDisplayName: "NIL Card",
          environment: process.env.NEXT_PUBLIC_PHYLLO_ENV === "production" ? "production" : "staging",
          userId: phylloUserId,
          token: sdkToken,
          workPlatformId: platformConfig.workPlatformId,
        })

        phylloConnect.on("accountConnected", (accountId: string, _workPlatformId: string, _userId: string) => {
          updatePlatform(platform, { connected: true })
          if (callbacksRef.current?.onConnected) {
            callbacksRef.current.onConnected(platform, accountId)
          }
          // Start polling for stats — webhook will populate the DB
          pollForStats(platform)
        })

        phylloConnect.on("accountDisconnected", (_accountId: string, _workPlatformId: string, _userId: string) => {
          updatePlatform(platform, { connected: false, stats: null })
          if (callbacksRef.current?.onDisconnected) {
            callbacksRef.current.onDisconnected(platform)
          }
        })

        phylloConnect.on("tokenExpired", (_userId: string) => {
          updatePlatform(platform, {
            loading: false,
            error: "Session expired. Please try again.",
          })
        })

        phylloConnect.on("exit", (_reason: string, _userId: string) => {
          // If still loading and not connected, stop the spinner
          setPlatforms((prev) => {
            if (prev[platform].loading && !prev[platform].connected) {
              return {
                ...prev,
                [platform]: { ...prev[platform], loading: false },
              }
            }
            return prev
          })
        })

        phylloConnect.open()
      } catch (err: any) {
        updatePlatform(platform, {
          loading: false,
          error: err.message || "Failed to open connect modal. Please try again.",
        })
      }
    },
    [updatePlatform, pollForStats]
  )

  // Refresh stats for an already-connected platform
  const refresh = useCallback(
    async (platform: PhylloPlatform) => {
      updatePlatform(platform, { loading: true, error: null })

      try {
        const data = await fetchPhylloStats()
        const parsed = parseStatsResponse(data)
        const stats = parsed[platform]
        updatePlatform(platform, { loading: false })

        if (callbacksRef.current?.onStatsReceived) {
          callbacksRef.current.onStatsReceived(platform, stats)
        }
      } catch (err: any) {
        updatePlatform(platform, {
          loading: false,
          error: err.message || "Failed to refresh stats.",
        })
      }
    },
    [updatePlatform, parseStatsResponse]
  )

  // Disconnect a platform
  const disconnect = useCallback(
    async (platform: PhylloPlatform) => {
      updatePlatform(platform, { loading: true, error: null })

      try {
        await disconnectPhylloPlatform(platform)
        updatePlatform(platform, {
          connected: false,
          loading: false,
          stats: null,
          error: null,
        })
        if (callbacksRef.current?.onDisconnected) {
          callbacksRef.current.onDisconnected(platform)
        }
      } catch (err: any) {
        updatePlatform(platform, {
          loading: false,
          error: err.message || "Failed to disconnect.",
        })
      }
    },
    [updatePlatform]
  )

  return { platforms, connect, refresh, disconnect, initialLoading }
}

// ---- Helper: Load the Phyllo Connect SDK script ----

let phylloSDKPromise: Promise<void> | null = null

function loadPhylloSDK(): Promise<void> {
  if (phylloSDKPromise) return phylloSDKPromise

  phylloSDKPromise = new Promise((resolve, reject) => {
    // If already loaded
    if ((window as any).PhylloConnect) {
      resolve()
      return
    }

    const script = document.createElement("script")
    script.src = "https://cdn.getphyllo.com/connect/v2/phyllo-connect.js"
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      phylloSDKPromise = null
      reject(new Error("Failed to load Phyllo Connect SDK"))
    }
    document.head.appendChild(script)
  })

  return phylloSDKPromise
}
```

## File 3: `components/PhylloConnectSection.tsx`

```tsx
// components/PhylloConnectSection.tsx

"use client"

import { CheckCircle2, RefreshCw, Unplug, Instagram, Loader2, AlertCircle } from "lucide-react"