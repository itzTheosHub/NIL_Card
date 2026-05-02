

FILE: app/api/phyllo/stats/route.ts
```
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const supabase = createClient()

  // Authenticate the current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Fetch the Phyllo-related columns from the profiles table
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      `
      instagram_connected,
      tiktok_connected,
      instagram_followers,
      tiktok_followers,
      instagram_avg_views,
      tiktok_avg_views,
      instagram_engagement_rate,
      tiktok_engagement_rate,
      instagram_total_posts,
      tiktok_total_posts,
      audience_age_18_24,
      audience_age_25_34,
      audience_age_35_plus,
      audience_gender_male,
      audience_gender_female,
      audience_top_city,
      audience_top_country
    `
    )
    .eq("id", user.id)
    .single()

  if (profileError) {
    return NextResponse.json(
      { error: "Failed to fetch profile stats" },
      { status: 500 }
    )
  }

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  // Structure the response per-platform so the frontend can check
  // whether a specific platform's stats have landed yet.
  const instagram =
    profile.instagram_connected
      ? {
          connected: true,
          followers: profile.instagram_followers,
          avgViews: profile.instagram_avg_views,
          engagementRate: profile.instagram_engagement_rate,
          totalPosts: profile.instagram_total_posts,
          // Stats are considered "ready" when we have at least a follower count
          hasStats: profile.instagram_followers != null,
        }
      : { connected: false, hasStats: false }

  const tiktok =
    profile.tiktok_connected
      ? {
          connected: true,
          followers: profile.tiktok_followers,
          avgViews: profile.tiktok_avg_views,
          engagementRate: profile.tiktok_engagement_rate,
          totalPosts: profile.tiktok_total_posts,
          hasStats: profile.tiktok_followers != null,
        }
      : { connected: false, hasStats: false }

  const audience = {
    age18_24: profile.audience_age_18_24,
    age25_34: profile.audience_age_25_34,
    age35Plus: profile.audience_age_35_plus,
    genderMale: profile.audience_gender_male,
    genderFemale: profile.audience_gender_female,
    topCity: profile.audience_top_city,
    topCountry: profile.audience_top_country,
  }

  return NextResponse.json({
    instagram,
    tiktok,
    audience,
  })
}
```

FILE: lib/phyllo-stats.ts
```
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
```

NOTES:
- No new npm packages required for this step.
- No new SQL migrations required — the profile columns (`instagram_connected`, `instagram_followers`, etc.) were already added in step 1 of the build order.
- The `PhylloPlatform` type is imported from `@/lib/phyllo-client` which should already exist from a prior step. If that type doesn't exist yet, it should be defined as `export type PhylloPlatform = "instagram" | "tiktok"` in `lib/phyllo-client.ts`.