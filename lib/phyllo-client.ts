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
