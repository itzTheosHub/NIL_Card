# Step 9: Test end-to-end on staging

# Step 9: Build `GET /api/phyllo/stats` Route

Looking at the build order more carefully, step 9 is actually **"Build `GET /api/phyllo/stats` route"** — the description says:

> Build `GET /api/phyllo/stats` route — queries `profile_social_stats` for the current auth user, returns per-platform stats; used by the frontend to poll for stats after the SDK connect callback fires

Step 11 is "Test end-to-end on staging" which isn't a code step. Let me implement step 9.

---

## File 1: `app/api/phyllo/stats/route.ts`

This route returns the current user's Phyllo-populated social stats from the `profiles` table, structured per-platform so the frontend can poll for them after the SDK connect callback fires.

```ts
// app/api/phyllo/stats/route.ts

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

---

## File 2: `lib/phyllo-stats.ts`

A small client-side helper that the `usePhylloConnect` hook (and any other component) can use to fetch stats and determine readiness. This keeps the fetch logic out of the hook itself and makes it testable.

```ts
// lib/phyllo-stats.ts

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

---

## Decision Notes

1. **Why structure per-platform in the response?** The frontend polls for a *specific* platform's stats after connecting that platform. By including a `hasStats` boolean per platform, the polling loop can check `response.instagram.hasStats` (or `tiktok`) without parsing individual fields. This is what step 10 (the polling loop) will consume.

2. **Why a separate `lib/phyllo-stats.ts`?** The PRD step 10 says to add polling in `usePhylloConnect.ts`'s `onAccountConnected`. Having `pollForPlatformStats` as an importable function keeps the hook clean and makes the polling logic independently testable.

3. **Auth pattern:** Matches the existing codebase — uses `createClient()` from `@/lib/supabase` and calls `supabase.auth.getUser()` to identify the caller. No API keys or tokens needed; the Supabase client reads the auth cookie from the request.

4. **No new npm installs needed** for this step.

5. **No new SQL migrations needed** — the columns referenced here (`instagram_connected`, `instagram_followers`, etc.) were already added in step 1 of the build order.