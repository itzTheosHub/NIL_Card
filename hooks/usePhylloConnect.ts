"use client"

import { useState, useCallback } from "react"
import {
  openPhylloConnect,
  PHYLLO_PLATFORM_IDS,
  getPhylloEnvironment,
  type PhylloPlatform,
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
              // Simply mark as connected — polling for stats will be added later
              setConnectionState((prev) => ({ ...prev, [platform]: "connected" }))
              options.onConnected?.(platform, _accountId)
            },
            onAccountDisconnected: (_accountId, _workPlatformId, _userId) => {
              setConnectionState((prev) => ({ ...prev, [platform]: "idle" }))
              setPlatformStats((prev) => ({ ...prev, [platform]: null }))
              options.onDisconnected?.(platform)
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
              options.onError?.(platform, reason)
            },
          }
        )
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error"
        setConnectionState((prev) => ({ ...prev, [platform]: "error" }))
        setErrors((prev) => ({ ...prev, [platform]: message }))
        options.onError?.(platform, message)
      }
    },
    [options]
  )

  const disconnectPlatform = useCallback(
    async (platform: PhylloPlatform) => {
      try {
        const res = await fetch("/api/phyllo/disconnect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ platform }),
        })

        if (!res.ok) {
          const errData = await res.json()
          throw new Error(errData.error || "Failed to disconnect")
        }

        setConnectionState((prev) => ({ ...prev, [platform]: "idle" }))
        setPlatformStats((prev) => ({ ...prev, [platform]: null }))
        setErrors((prev) => ({ ...prev, [platform]: null }))
        options.onDisconnected?.(platform)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error"
        setErrors((prev) => ({ ...prev, [platform]: message }))
      }
    },
    [options]
  )

  return {
    connectionState,
    platformStats,
    errors,
    phylloUserId,
    connectPlatform,
    disconnectPlatform,
    setConnectionState,
    setPlatformStats,
  }
}
