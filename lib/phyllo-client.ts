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
