# Step 6: Build /api/phyllo/webhook route



# Step 6: Build `/api/phyllo/webhook` route

## Context & Design Decisions

The Phyllo webhook route receives POST requests from Phyllo's servers when data is ready after an athlete connects their social account. Phyllo sends webhooks for different events — we care about:

1. **`ACCOUNTS.CONNECTED`** — marks the platform as connected in our DB
2. **`PROFILES.ADDED` / `PROFILES.UPDATED`** — contains follower count, username, etc.
3. **`ENGAGEMENT.ADDED` / `ENGAGEMENT.UPDATED`** — contains engagement rate, avg views, total posts

We need to:
- Verify the webhook signature to prevent spoofing (Phyllo signs webhooks)
- Map Phyllo's `work_platform_id` to our platform names (instagram/tiktok)
- Fetch the detailed data from Phyllo's API using the IDs provided in the webhook
- Write the stats to our `profiles` table
- Use the Supabase **service role** key (not the anon key) since webhooks are server-to-server with no user session

---

## File 1: `lib/phyllo-server.ts` — Shared server-side Phyllo utilities

```typescript
// lib/phyllo-server.ts

/**
 * Server-side Phyllo utilities — used by API routes only.
 * Never import this from client components.
 */

// Phyllo work platform IDs — these are stable UUIDs from Phyllo's docs
export const PHYLLO_PLATFORM_IDS: Record<string, string> = {
  "9bb8913b-ddd9-430b-a66a-d74d846e6c66": "instagram",
  "de55aeec-0dc8-4119-bf90-16b3d1f0c987": "tiktok",
} as const

export type PhylloPlatformName = "instagram" | "tiktok"

/**
 * Resolve a Phyllo work_platform_id to our internal platform name.
 * Returns null if the platform is not supported (e.g. Twitter/X).
 */
export function resolvePlatform(workPlatformId: string): PhylloPlatformName | null {
  return (PHYLLO_PLATFORM_IDS[workPlatformId] as PhylloPlatformName) ?? null
}

/**
 * Base URL for Phyllo API — staging vs production based on env.
 */
export function getPhylloBaseUrl(): string {
  return process.env.PHYLLO_ENV === "production"
    ? "https://api.getphyllo.com"
    : "https://api.staging.getphyllo.com"
}

/**
 * Build the Basic auth header for Phyllo API calls.
 */
export function getPhylloAuthHeader(): string {
  const clientId = process.env.PHYLLO_CLIENT_ID!
  const secret = process.env.PHYLLO_SECRET!
  return "Basic " + Buffer.from(`${clientId}:${secret}`).toString("base64")
}

/**
 * Fetch wrapper for Phyllo API with auth headers pre-configured.
 */
export async function phylloFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const url = `${getPhylloBaseUrl()}${path}`
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: getPhylloAuthHeader(),
      ...options.headers,
    },
  })
}
```

---

## File 2: `lib/supabase-admin.ts` — Service role Supabase client for server-to-server operations

```typescript
// lib/supabase-admin.ts

/**
 * Supabase client using the SERVICE_ROLE key.
 * Used ONLY in server-side contexts (webhooks, cron jobs) where there is no user session.
 * Never import this from client code.
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars")
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
```

---

## File 3: `app/api/phyllo/webhook/route.ts` — The webhook handler

```typescript
// app/api/phyllo/webhook/route.ts

import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createAdminClient } from "@/lib/supabase-admin"
import { phylloFetch, resolvePlatform, type PhylloPlatformName } from "@/lib/phyllo-server"

// ─── Webhook signature verification ─────────────────────────────────
// Phyllo signs webhooks using HMAC-SHA256 with your client secret.
// The signature is sent in the `x-phyllo-signature` header.

function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!signature) return false

  const secret = process.env.PHYLLO_SECRET
  if (!secret) return false

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex")

  // Constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}

// ─── Phyllo webhook event types we handle ───────────────────────────

type PhylloWebhookEvent = {
  event: string
  data: {
    id: string
    user_id: string              // Phyllo user ID (maps to profiles.phyllo_user_id)
    account_id?: string
    work_platform_id?: string
    platform_username?: string
    [key: string]: unknown
  }
  created_at: string
}

// ─── Helper: look up our profile by phyllo_user_id ──────────────────

async function getProfileByPhylloUserId(phylloUserId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("id, phyllo_user_id, instagram_connected, tiktok_connected")
    .eq("phyllo_user_id", phylloUserId)
    .single()

  if (error || !data) return null
  return data
}

// ─── Helper: fetch profile data from Phyllo API ─────────────────────

async function fetchPhylloProfile(accountId: string) {
  // GET /v1/social/profiles?account_id={accountId}
  const res = await phylloFetch(`/v1/social/profiles?account_id=${accountId}`)
  if (!res.ok) return null
  const body = await res.json()
  // Phyllo returns a list; take the first one
  return body.data?.[0] ?? null
}

// ─── Helper: fetch engagement data from Phyllo API ──────────────────

async function fetchPhylloEngagement(accountId: string) {
  // GET /v1/social/engagement/audience?account_id={accountId}
  // This returns engagement metrics for the account
  const res = await phylloFetch(`/v1/engagement/audience?account_id=${accountId}`)
  if (!res.ok) return null
  const body = await res.json()
  return body.data?.[0] ?? null
}

// ─── Helper: fetch audience demographics from Phyllo API ────────────

async function fetchPhylloAudience(accountId: string) {
  // GET /v1/social/audience?account_id={accountId}
  const res = await phylloFetch(`/v1/social/audience?account_id=${accountId}`)
  if (!res.ok) return null
  const body = await res.json()
  return body.data?.[0] ?? null
}

// ─── Helper: build column-name prefix from platform ─────────────────

function platformPrefix(platform: PhylloPlatformName): string {
  return platform // "instagram" or "tiktok"
}

// ─── Helper: process profile + engagement data for a connected account ─

async function processAccountData(phylloUserId: string, accountId: string, workPlatformId: string) {
  const platform = resolvePlatform(workPlatformId)
  if (!platform) {
    console.log(`[phyllo/webhook] Unsupported platform: ${workPlatformId}, skipping`)
    return
  }

  const profile = await getProfileByPhylloUserId(phylloUserId)
  if (!profile) {
    console.error(`[phyllo/webhook] No profile found for phyllo_user_id: ${phylloUserId}`)
    return
  }

  const prefix = platformPrefix(platform)
  const supabase = createAdminClient()

  // Fetch profile data (followers, username, total posts)
  const phylloProfile = await fetchPhylloProfile(accountId)

  // Fetch engagement data (engagement rate, avg views)
  const phylloEngagement = await fetchPhylloEngagement(accountId)

  // Fetch audience demographics
  const phylloAudience = await fetchPhylloAudience(accountId)

  // Build the update payload dynamically
  const updatePayload: Record<string, unknown> = {
    [`${prefix}_connected`]: true,
  }

  // --- Profile data ---
  if (phylloProfile) {
    if (phylloProfile.follower_count != null) {
      updatePayload[`${prefix}_followers`] = phylloProfile.follower_count
    }
    if (phylloProfile.content_count != null) {
      updatePayload[`${prefix}_total_posts`] = phylloProfile.content_count
    }
    // Also update the social_links table with username if available
    if (phylloProfile.platform_username) {
      await updateSocialLinkUsername(
        supabase,
        profile.id,
        platform,
        phylloProfile.platform_username,
        phylloProfile.follower_count
      )
    }
  }

  // --- Engagement data ---
  if (phylloEngagement) {
    if (phylloEngagement.engagement_rate != null) {
      updatePayload[`${prefix}_engagement_rate`] = phylloEngagement.engagement_rate
    }
    // Average views: Phyllo may provide this as `average_views` or we derive it
    if (phylloEngagement.average_views != null) {
      updatePayload[`${prefix}_avg_views`] = phylloEngagement.average_views
    } else if (phylloEngagement.avg_views_per_content != null) {
      updatePayload[`${prefix}_avg_views`] = phylloEngagement.avg_views_per_content
    }
  }

  // --- Audience demographics ---
  if (phylloAudience) {
    const ageBreakdown = parseAgeBreakdown(phylloAudience.demographics?.age)
    const genderBreakdown = parseGenderBreakdown(phylloAudience.demographics?.gender)
    const locationData = parseLocationData(phylloAudience.demographics?.country, phylloAudience.demographics?.city)

    if (ageBreakdown) {
      updatePayload.audience_age_18_24 = ageBreakdown.age_18_24
      updatePayload.audience_age_25_34 = ageBreakdown.age_25_34
      updatePayload.audience_age_35_plus = ageBreakdown.age_35_plus
    }

    if (genderBreakdown) {
      updatePayload.audience_gender_male = genderBreakdown.male
      updatePayload.audience_gender_female = genderBreakdown.female
    }

    if (locationData) {
      if (locationData.topCity) updatePayload.audience_top_city = locationData.topCity
      if (locationData.topCountry) updatePayload.audience_top_country = locationData.topCountry
    }
  }

  // Write to profiles table
  const { error: updateError } = await supabase
    .from("profiles")
    .update(updatePayload)
    .eq("id", profile.id)

  if (updateError) {
    console.error(`[phyllo/webhook] Failed to update profile ${profile.id}:`, updateError.message)
  } else {
    console.log(`[phyllo/webhook] Updated profile ${profile.id} for ${platform}:`, Object.keys(updatePayload))
  }
}

// ─── Helper: update social_links table with Phyllo username/followers ─

async function updateSocialLinkUsername(
  supabase: ReturnType<typeof createAdminClient>,
  profileId: string,
  platform: PhylloPlatformName,
  username: string,
  followerCount?: number
) {
  // Check if social link already exists
  const { data: existing } = await supabase
    .from("social_links")
    .select("id")
    .eq("profile_id", profileId)
    .eq("platform", platform)
    .single()

  const url = `@${username}`

  if (existing) {
    // Update existing link
    const updateData: Record<string, unknown> = { url }
    if (followerCount != null) updateData.follower_count = followerCount

    await supabase
      .from("social_links")
      .update(updateData)
      .eq("id", existing.id)
  } else {
    // Insert new link
    await supabase
      .from("social_links")
      .insert({
        profile_id: profileId,
        platform,
        url,
        follower_count: followerCount ?? 0,
      })
  }
}

// ─── Demographic parsing helpers ────────────────────────────────────

type AgeEntry = { name: string; value: number }
type GenderEntry = { name: string; value: number }
type LocationEntry = { name: string; value: number }

function parseAgeBreakdown(ageData: AgeEntry[] | undefined | null) {
  if (!ageData || !Array.isArray(ageData)) return null

  let age_18_24 = 0
  let age_25_34 = 0
  let age_35_plus = 0

  for (const entry of ageData) {
    const name = entry.name?.toLowerCase() ?? ""
    const value = entry.value ?? 0

    // Phyllo age ranges vary — map them to our buckets
    if (name.includes("18") && name.includes("24")) {
      age_18_24 += value
    } else if (name.includes("13") && name.includes("17")) {
      // Under 18, skip or lump — we don't track this bucket
    } else if (name.includes("25") && name.includes("34")) {
      age_25_34 += value
    } else if (
      name.includes("35") ||
      name.includes("45") ||
      name.includes("55") ||
      name.includes("65") ||
      name.includes("above") ||
      name.includes("+")
    ) {
      age_35_plus += value
    }
  }

  return { age_18_24, age_25_34, age_35_plus }
}

function parseGenderBreakdown(genderData: GenderEntry[] | undefined | null) {
  if (!genderData || !Array.isArray(genderData)) return null

  let male = 0
  let female = 0

  for (const entry of genderData) {
    const name = entry.name?.toLowerCase() ?? ""
    if (name === "male" || name === "m") {
      male = entry.value ?? 0
    } else if (name === "female" || name === "f") {
      