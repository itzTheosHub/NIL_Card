# Step 5: Install Phyllo SDK, add connect buttons to ProfileForm

## ALREADY COMPLETED — DO NOT REGENERATE
- `lib/phyllo-client.ts` — already written, do not overwrite
- `hooks/usePhylloConnect.ts` — already written, do not overwrite
- `components/PhylloConnectSection.tsx` — already written, do not overwrite

## REMAINING TASK — THIS RUN ONLY
Update `components/ProfileForm.tsx` to integrate PhylloConnectSection:
- Import `PhylloConnectSection` from `@/components/PhylloConnectSection`
- Render it at the top of the form, above the "Basic Info" section
- Wire `onConnected` callback to auto-populate `total_followers`, `avg_views`, `engagement_rate` fields using the stats returned from the hook
- Keep all existing manual input fields as-is (they remain the fallback)
- Do not rewrite or restructure any other part of the form

## IMPORTANT CONSTRAINTS
- Do NOT add client-side code to `lib/phyllo.ts` — that file is server-only (holds private credentials PHYLLO_CLIENT_ID and PHYLLO_SECRET).
- Do NOT implement `/api/phyllo/stats` polling — that route does not exist yet.
- `NEXT_PUBLIC_PHYLLO_ENVIRONMENT` is a new env var — note it in a NOTES section at the end rather than assuming it exists.



# Step 5: Install Phyllo SDK, Add Connect Buttons to ProfileForm

## npm Install Commands

```bash
npm install phyllo-connect
```

> **Note:** Phyllo's Connect SDK for web is distributed as `phyllo-connect` on npm. If the package name changes, check [Phyllo's docs](https://docs.getphyllo.com). The SDK exposes a `PhylloConnect.initialize()` method that opens the OAuth modal.

---

## File 1: `lib/phyllo.ts` (NEW)

A small utility to initialize the Phyllo Connect SDK on the client side.

```ts
// lib/phyllo.ts

export type PhylloConfig = {
  clientDisplayName: string
  environment: "staging" | "production"
  userId: string
  token: string
  workPlatformIds: string[]
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

export function getPhylloEnvironment(): "staging" | "production" {
  return process.env.NEXT_PUBLIC_PHYLLO_ENVIRONMENT === "production"
    ? "production"
    : "staging"
}

/**
 * Dynamically imports and initializes the Phyllo Connect SDK.
 * Must be called client-side only.
 */
export async function openPhylloConnect(
  config: PhylloConfig,
  callbacks: PhylloCallbacks
) {
  // Dynamic import to avoid SSR issues
  const PhylloConnect = (await import("phyllo-connect")).default

  const phylloConnect = PhylloConnect.initialize({
    clientDisplayName: config.clientDisplayName,
    environment: config.environment,
    userId: config.userId,
    token: config.token,
    workPlatformIds: config.workPlatformIds,
    ...callbacks,
  })

  phylloConnect.open()

  return phylloConnect
}
```

---

## File 2: `hooks/usePhylloConnect.ts` (NEW)

A React hook that encapsulates the full Phyllo flow: create user → get token → open SDK → handle callbacks.

```ts
// hooks/usePhylloConnect.ts

"use client"

import { useState, useCallback } from "react"
import {
  openPhylloConnect,
  PHYLLO_PLATFORM_IDS,
  getPhylloEnvironment,
  type PhylloPlatform,
} from "@/lib/phyllo"

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
            workPlatformIds: [PHYLLO_PLATFORM_IDS[platform]],
          },
          {
            onAccountConnected: async (accountId, workPlatformId, _userId) => {
              setConnectionState((prev) => ({ ...prev, [platform]: "connected" }))

              // Poll for stats after a short delay (Phyllo needs time to fetch data)
              await pollForStats(platform, phyllo_user_id, accountId)
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
            onExit: (reason, _userId) => {
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
      } catch (err: any) {
        setConnectionState((prev) => ({ ...prev, [platform]: "error" }))
        setErrors((prev) => ({ ...prev, [platform]: err.message }))
        options.onError?.(platform, err.message)
      }
    },
    [options]
  )

  const pollForStats = useCallback(
    async (platform: PhylloPlatform, phylloUserId: string, accountId: string) => {
      // Poll up to 10 times, 3 seconds apart, waiting for Phyllo to process data
      const maxAttempts = 10
      const delay = 3000

      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, delay))

        try {
          const res = await fetch(
            `/api/phyllo/stats?phyllo_user_id=${phylloUserId}&platform=${platform}&account_id=${accountId}`
          )

          if (res.ok) {
            const data = await res.json()

            if (data.stats && data.stats.followers !== null) {
              const stats: PhylloStats = {
                followers: data.stats.followers ?? null,
                avgViews: data.stats.avg_views ?? null,
                engagementRate: data.stats.engagement_rate ?? null,
                totalPosts: data.stats.total_posts ?? null,
                username: data.stats.username ?? null,
              }

              setPlatformStats((prev) => ({ ...prev, [platform]: stats }))
              options.onStatsReceived?.(platform, stats)
              return
            }
          }
        } catch {
          // Continue polling
        }
      }

      // If polling exhausted, still mark as connected but note no stats
      setErrors((prev) => ({
        ...prev,
        [platform]: "Account connected but stats are still loading. They'll appear shortly.",
      }))
    },
    [options]
  )

  const refreshStats = useCallback(
    async (platform: PhylloPlatform) => {
      if (!phylloUserId) return

      setConnectionState((prev) => ({ ...prev, [platform]: "connecting" }))
      setErrors((prev) => ({ ...prev, [platform]: null }))

      try {
        // Re-trigger a token + SDK flow so Phyllo re-fetches latest data
        const tokenRes = await fetch("/api/phyllo/create-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phyllo_user_id: phylloUserId }),
        })

        if (!tokenRes.ok) {
          throw new Error("Failed to refresh token")
        }

        const { sdk_token } = await tokenRes.json()

        await openPhylloConnect(
          {
            clientDisplayName: "NIL Card",
            environment: getPhylloEnvironment(),
            userId: phylloUserId,
            token: sdk_token,
            workPlatformIds: [PHYLLO_PLATFORM_IDS[platform]],
          },
          {
            onAccountConnected: async (accountId, _wpId, _uId) => {
              setConnectionState((prev) => ({ ...prev, [platform]: "connected" }))
              await pollForStats(platform, phylloUserId, accountId)
            },
            onAccountDisconnected: () => {
              setConnectionState((prev) => ({ ...prev, [platform]: "idle" }))
              setPlatformStats((prev) => ({ ...prev, [platform]: null }))
            },
            onTokenExpired: () => {
              setConnectionState((prev) => ({ ...prev, [platform]: "error" }))
            },
            onExit: () => {
              setConnectionState((prev) => ({
                ...prev,
                [platform]: prev[platform] === "connected" ? "connected" : "idle",
              }))
            },
            onConnectionFailure: (reason) => {
              setConnectionState((prev) => ({ ...prev, [platform]: "error" }))
              setErrors((prev) => ({ ...prev, [platform]: reason }))
            },
          }
        )
      } catch (err: any) {
        setConnectionState((prev) => ({ ...prev, [platform]: "error" }))
        setErrors((prev) => ({ ...prev, [platform]: err.message }))
      }
    },
    [phylloUserId, pollForStats]
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
      } catch (err: any) {
        setErrors((prev) => ({ ...prev, [platform]: err.message }))
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
    refreshStats,
    disconnectPlatform,
    setConnectionState,
    setPlatformStats,
  }
}
```

---

## File 3: `components/PhylloConnectSection.tsx` (NEW)

A self-contained component that renders the "Connect your accounts" UI.

```tsx
// components/PhylloConnectSection.tsx

"use client"

import { Check, RefreshCw, Unplug, Loader2, AlertCircle, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  usePhylloConnect,
  type PhylloConnectionState,
  type PhylloPlatformStats,
  type PhylloStats,
} from "@/hooks/usePhylloConnect"
import type { PhylloPlatform } from "@/lib/phyllo"

// TikTok icon (lucide doesn't have one)
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.21 8.21 0 0 0 4.76 1.52V6.78a4.83 4.83 0 0 1-1-.09z"/>
    </svg>
  )
}

type PhylloConnectSectionProps = {
  initialConnectionState?: Partial<PhylloConnectionState>
  initialPlatformStats?: Partial<PhylloPlatformStats>
  onStatsReceived: (platform: PhylloPlatform, stats: PhylloStats) => void
  onDisconnected?: (platform: PhylloPlatform) => void
}

export default function PhylloConnectSection({
  initialConnectionState,
  initialPlatformStats,
  onStatsReceived,
  onDisconnected,
}: Ph