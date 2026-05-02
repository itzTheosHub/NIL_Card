import type { PhylloPlatform } from "@/lib/phyllo-client"

export type PhylloPlatformStats = {
  connected: boolean
  hasStats: boolean
  followers?: number | null
  avgViews?: number | null
  engagementRate?: number | null
  totalPosts?: number | null
}

export type PhylloAudienceStats = {
  age18_24: number | null
  age25_34: number | null
  age35Plus: number | null
  genderMale: number | null
  genderFemale: number | null
  topCity: string | null
  topCountry: string | null
}

export type PhylloStatsResponse = {
  instagram: PhylloPlatformStats
  tiktok: PhylloPlatformStats
  audience: PhylloAudienceStats
}

/**
 * Fetches the current user's Phyllo stats from our API.
 * Returns null if the request fails.
 */
export async function fetchPhylloStats(): Promise<PhylloStatsResponse | null> {
  try {
    const res = await fetch("/api/phyllo/stats", { method: "GET" })
    if (!res.ok) return null
    return (await res.json()) as PhylloStatsResponse
  } catch {
    return null
  }
}

/**
 * Polls `/api/phyllo/stats` until the given platform has stats ready,
 * or until maxRetries is exhausted.
 *
 * Returns the full stats response if the platform's stats arrive,
 * or null if we timed out.
 */
export async function pollForPlatformStats(
  platform: PhylloPlatform,
  options?: { intervalMs?: number; maxRetries?: number }
): Promise<PhylloStatsResponse | null> {
  const intervalMs = options?.intervalMs ?? 2000
  const maxRetries = options?.maxRetries ?? 5

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Wait before polling (skip wait on first attempt)
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs))
    }

    const stats = await fetchPhylloStats()
    if (!stats) continue

    const platformKey = platform === "instagram" ? "instagram" : "tiktok"
    if (stats[platformKey].hasStats) {
      return stats
    }
  }

  return null
}
