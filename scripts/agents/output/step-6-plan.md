# Step 6: Build /api/phyllo/webhook route

## CRITICAL CONSTRAINTS — READ BEFORE IMPLEMENTING

### Actual DB Schema (do NOT deviate from this)

**Table: `profile_social_stats`** — one row per platform per profile
| Column | Type | Notes |
|--------|------|-------|
| `profile_id` | UUID | FK to profiles.id |
| `platform` | TEXT | `'instagram'` or `'tiktok'` |
| `followers` | INT4 | |
| `avg_views` | FLOAT4 | |
| `engagement_rate` | FLOAT4 | |
| `total_posts` | INT4 | |
| `connected` | BOOLEAN | Set to true on ACCOUNTS.CONNECTED |
| `phyllo_account_id` | TEXT | Store Phyllo account ID here |
| `last_synced_at` | TIMESTAMPTZ | Update on every write |

Use upsert (`INSERT ... ON CONFLICT (profile_id, platform) DO UPDATE`) for all writes to this table.

**Table: `profiles`** — audience columns only (shared across platforms)
| Column | Type |
|--------|------|
| `audience_age_18_24` | FLOAT4 |
| `audience_age_25_34` | FLOAT4 |
| `audience_age_35_plus` | FLOAT4 |
| `audience_gender_male` | FLOAT4 |
| `audience_gender_female` | FLOAT4 |
| `audience_top_city` | TEXT |
| `audience_top_country` | TEXT |

Do NOT write `instagram_followers`, `tiktok_followers`, `ig_avg_views`, `tt_avg_views` or any per-platform columns to the `profiles` table — they do not exist.

### Profile Lookup
- Use `profiles.id` (not `profiles.user_id`) as the FK to `profile_social_stats`
- Look up the profile by `phyllo_user_id` from the webhook payload to get `profiles.id`



# Step 6: Build `/api/phyllo/webhook` route

This webhook route receives POST requests from Phyllo when data is ready (account connected, profile data available, engagement data available). It verifies the webhook authenticity, parses the event type, fetches the relevant data from Phyllo's API, and writes the stats to the `profiles` table in Supabase.

## Design Decisions

1. **Webhook signature verification**: Phyllo doesn't document a signature header for webhooks in their public docs. Instead, we verify the payload contains a valid `phyllo_user_id` that exists in our DB. Additionally, I've added an optional webhook secret check via a custom header — if `PHYLLO_WEBHOOK_SECRET` is set, we validate it. This prevents random POST requests from writing to our DB.

2. **Event types handled**: Phyllo sends webhooks for various events. The key ones we care about:
   - `ACCOUNTS.CONNECTED` — marks the platform as connected in our DB
   - `PROFILES.ADDED` / `PROFILES.UPDATED` — contains follower count, username
   - `ENGAGEMENT.ADDED` / `ENGAGEMENT.UPDATED` — contains engagement metrics (avg views, engagement rate, total posts)
   - `AUDIENCE.ADDED` / `AUDIENCE.UPDATED` — contains demographic data

3. **Data fetching pattern**: When we receive a webhook, we use the `account_id` from the payload to fetch the full data from Phyllo's REST API (rather than relying solely on webhook payload which may be incomplete). This ensures we get complete, structured data.

4. **Supabase admin client**: The webhook runs server-side without a user session, so we use the service role key to write directly to the `profiles` table.

---

## Files

### 1. `lib/phyllo-api.ts` — Phyllo REST API helper (server-side)

This shared helper handles authentication and data fetching from Phyllo's API. It's used by the webhook and could also be used by the `refresh` flow later.

```typescript
// lib/phyllo-api.ts

const PHYLLO_BASE_URL = process.env.NODE_ENV === "production"
  ? "https://api.getphyllo.com"
  : "https://api.staging.getphyllo.com"

const PHYLLO_API_VERSION = "v1"

function getAuthHeader(): string {
  const clientId = process.env.PHYLLO_CLIENT_ID
  const secret = process.env.PHYLLO_SECRET
  if (!clientId || !secret) {
    throw new Error("Missing PHYLLO_CLIENT_ID or PHYLLO_SECRET env vars")
  }
  return `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`
}

async function phylloFetch(path: string): Promise<any> {
  const res = await fetch(`${PHYLLO_BASE_URL}/${PHYLLO_API_VERSION}${path}`, {
    method: "GET",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Phyllo API error ${res.status}: ${body}`)
  }

  return res.json()
}

// ---------- Types ----------

export type PhylloPlatformId = "instagram" | "tiktok"

export type PhylloProfileData = {
  platform: PhylloPlatformId | string
  username: string | null
  followerCount: number | null
  totalPosts: number | null
}

export type PhylloEngagementData = {
  platform: PhylloPlatformId | string
  engagementRate: number | null
  avgViews: number | null
  totalPosts: number | null
}

export type PhylloAudienceData = {
  age18_24: number | null
  age25_34: number | null
  age35Plus: number | null
  genderMale: number | null
  genderFemale: number | null
  topCity: string | null
  topCountry: string | null
}

// ---------- Fetch functions ----------

/**
 * Fetch profile(s) for a given Phyllo account.
 * GET /v1/social/profiles?account_id={accountId}
 */
export async function fetchPhylloProfiles(accountId: string): Promise<PhylloProfileData | null> {
  try {
    const data = await phylloFetch(`/social/profiles?account_id=${accountId}`)
    const profiles = data?.data
    if (!profiles || profiles.length === 0) return null

    const profile = profiles[0]
    const platformName = profile.platform?.name?.toLowerCase() ?? profile.work_platform?.name?.toLowerCase() ?? null

    return {
      platform: platformName,
      username: profile.username ?? profile.platform_username ?? null,
      followerCount: profile.reputation?.follower_count ?? profile.follower_count ?? null,
      totalPosts: profile.reputation?.content_count ?? profile.content_count ?? null,
    }
  } catch (err) {
    console.error("[phyllo-api] fetchPhylloProfiles error:", err)
    return null
  }
}

/**
 * Fetch engagement data for a given Phyllo account.
 * GET /v1/social/engagement/audience?account_id={accountId}
 * Or fallback: GET /v1/social/contents?account_id={accountId} and compute
 */
export async function fetchPhylloEngagement(accountId: string): Promise<PhylloEngagementData | null> {
  try {
    // Try the engagement endpoint
    const data = await phylloFetch(`/social/contents?account_id=${accountId}&limit=30`)
    const contents = data?.data
    if (!contents || contents.length === 0) return null

    // Derive platform from first content item
    const platformName = contents[0]?.platform?.name?.toLowerCase() ??
      contents[0]?.work_platform?.name?.toLowerCase() ?? null

    // Calculate engagement rate and avg views from recent content
    let totalLikes = 0
    let totalComments = 0
    let totalViews = 0
    let viewCount = 0

    for (const item of contents) {
      totalLikes += item.engagement?.like_count ?? item.like_count ?? 0
      totalComments += item.engagement?.comment_count ?? item.comment_count ?? 0
      const views = item.engagement?.view_count ?? item.view_count ?? 0
      if (views > 0) {
        totalViews += views
        viewCount++
      }
    }

    const avgViews = viewCount > 0 ? Math.round(totalViews / viewCount) : null

    // We'll compute engagement rate later using follower count from the profile
    // For now, store raw totals and let the webhook handler compute
    const avgLikes = contents.length > 0 ? totalLikes / contents.length : 0
    const avgComments = contents.length > 0 ? totalComments / contents.length : 0

    return {
      platform: platformName,
      engagementRate: null, // Will be computed with follower count
      avgViews,
      totalPosts: data?.metadata?.total ?? contents.length,
      // Attach raw averages so the caller can compute engagement rate
      _avgLikes: avgLikes,
      _avgComments: avgComments,
    } as PhylloEngagementData & { _avgLikes: number; _avgComments: number }
  } catch (err) {
    console.error("[phyllo-api] fetchPhylloEngagement error:", err)
    return null
  }
}

/**
 * Fetch audience demographics for a given Phyllo account.
 * GET /v1/social/audience?account_id={accountId}
 */
export async function fetchPhylloAudience(accountId: string): Promise<PhylloAudienceData | null> {
  try {
    const data = await phylloFetch(`/social/audience?account_id=${accountId}`)
    const audience = data?.data
    if (!audience || audience.length === 0) return null

    const demo = audience[0]

    // Parse age buckets
    const ageBuckets = demo?.demographics?.age ?? demo?.age_distribution ?? []
    let age18_24 = 0
    let age25_34 = 0
    let age35Plus = 0

    for (const bucket of ageBuckets) {
      const range = bucket.name ?? bucket.range ?? bucket.label ?? ""
      const value = bucket.value ?? bucket.percentage ?? 0
      if (range.includes("18") || range.includes("13-17") || range.includes("18-24")) {
        if (range.includes("18") || range.includes("24")) age18_24 += value
      }
      if (range.includes("25") || range.includes("25-34")) {
        age25_34 += value
      }
      if (range.includes("35") || range.includes("45") || range.includes("55") || range.includes("65") || range.includes("35+") || range.includes("35-44") || range.includes("45-54") || range.includes("55-64") || range.includes("65+")) {
        age35Plus += value
      }
    }

    // Parse gender
    const genderBuckets = demo?.demographics?.gender ?? demo?.gender_distribution ?? []
    let genderMale = 0
    let genderFemale = 0

    for (const bucket of genderBuckets) {
      const name = (bucket.name ?? bucket.label ?? "").toLowerCase()
      const value = bucket.value ?? bucket.percentage ?? 0
      if (name.includes("male") && !name.includes("female")) genderMale = value
      if (name.includes("female")) genderFemale = value
    }

    // Parse top locations
    const cities = demo?.demographics?.cities ?? demo?.city_distribution ?? []
    const countries = demo?.demographics?.countries ?? demo?.country_distribution ?? []
    const topCity = cities.length > 0 ? (cities[0].name ?? cities[0].label ?? null) : null
    const topCountry = countries.length > 0 ? (countries[0].name ?? countries[0].label ?? null) : null

    return {
      age18_24: age18_24 || null,
      age25_34: age25_34 || null,
      age35Plus: age35Plus || null,
      genderMale: genderMale || null,
      genderFemale: genderFemale || null,
      topCity,
      topCountry,
    }
  } catch (err) {
    console.error("[phyllo-api] fetchPhylloAudience error:", err)
    return null
  }
}

/**
 * Fetch account details to determine platform.
 * GET /v1/accounts/{accountId}
 */
export async function fetchPhylloAccount(accountId: string): Promise<{ platform: string; userId: string } | null> {
  try {
    const data = await phylloFetch(`/accounts/${accountId}`)
    const platformName = data?.platform?.name?.toLowerCase() ?? data?.work_platform?.name?.toLowerCase() ?? null
    const userId = data?.user?.id ?? data?.user_id ?? null

    return {
      platform: platformName ?? "unknown",
      userId: userId ?? "",
    }
  } catch (err) {
    console.error("[phyllo-api] fetchPhylloAccount error:", err)
    return null
  }
}
```

---

### 2. `lib/supabase-admin.ts` — Supabase admin client for server-side writes without user session

```typescript
// lib/supabase-admin.ts

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * Creates a Supabase client using the service role key.
 * This bypasses RLS and should ONLY be used in server-side code
 * (API routes, webhooks) — never in the browser.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

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

### 3. `app/api/phyllo/webhook/route.ts` — The webhook handler

```typescript
// app/api/phyllo/webhook/route.ts

import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"
import {
  fetchPhylloAccount,
  fetchPhylloProfiles,
  fetchPhylloEngagement,
  fetchPhylloAudience,
} from "@/lib/phyllo-api"

// Phyllo webhook event names we handle
const ACCOUNT_EVENTS = ["ACCOUNTS.CONNECTED"]
const PROFILE_EVENTS = ["PROFILES.ADDED", "PROFILES.UPDATED"]
const ENGAGEMENT_EVENTS = ["ENGAGEMENT.ADDED", "ENGAGEMENT.UPDATED"]
const AUDIENCE_EVENTS = ["AUDIENCE.ADDED", "AUDIENCE.UPDATED"]

const SUPPORTED_PLATFORMS = ["instagram", "tiktok"]

export async function POST(request: NextRequest) {
  // 1. Optional webhook secret verification
  const webhookSecret = process.env.PHYLLO_WEBHOOK_SECRET
  if (webhookSecret) {
    const headerSecret = request.headers.get("x-phyllo-secret") ??
      request.headers.get("x-webhook-secret")
    if (headerSecret !== webhookSecret) {
      console.warn("[phyllo/webhook] Invalid webhook secret")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  // 2. Parse body
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const eventName: string = body?.event ?? body?.name ?? ""
  const accountId: string = body?.data?.account_id ?? body?.account_id ?? ""
  const userId: string = body?.data?.user_id ?? body?.user_id ?? ""

  console.log(`[phyllo/webhook] Received event: ${eventName}, account: ${accountId}, user: ${userId}`)

  // 3. We need at least an account_id or user_id to proceed
  if (!accountId && !userId) {
    console.warn("[phyllo/webhook] No account_id or user_id in payload, skipping")
    // Return 200 so Phyllo doesn't retry
    return NextResponse.json({ received: true })
  }

  // 4. Determine which platform and which internal user this belongs to
  const supabase = createAdminClient()
  let platform: string = ""
  let phylloUserId: string = userId

  if (accountId) {
    const accountInfo = await fetchPhylloAccount(accountId)
    if (accountInfo) {
      platform = accountInfo.platform
      if (!phylloUserId) phylloUserId = accountInfo.userId
    }
  }

  // 5. Look up the profile in our DB by phyllo_user_id
  if (!phylloUserId) {
    console.warn("[phyllo/webhook] Could not determine phyllo_user_id, skipping")
    return NextResponse.json({ received: true })
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, instagram_followers, tiktok_followers")
    .eq("phyllo_user_id", phylloUserId)
    .single()

  if (profileError || !profile) {
    console.warn(`[phyllo/webhook] No profile found for phyllo_user_id=${phylloUserId}`, profileError?.message)
    // Return 200 so Phyllo doesn't retry endlessly
    return NextResponse.json({ received: true })
  }

  const profileId = profile.id

  // Skip