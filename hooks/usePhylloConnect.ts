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
    async (platform: PhylloPlatform, maxAttempts = 5) => {
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await new Promise((r) => setTimeout(r, 2000))

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
          "We couldn't pull your stats. This can happen if:\n• Your account is set to private\n• The platform is temporarily down\n\nTry Again or enter your stats manually below.",
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
              // Start polling for stats — webhook will populate the DB within a few seconds
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
