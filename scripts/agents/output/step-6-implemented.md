

Looking at the implementation plan and the critical constraints, the existing webhook route is writing per-platform columns (`instagram_followers`, `tiktok_followers`, `ig_avg_views`, `tt_avg_views`, etc.) directly to the `profiles` table — which violates the schema. All per-platform data must go to `profile_social_stats` via upsert, and only shared audience data goes to `profiles`.

Let me rewrite the webhook route accordingly. The `lib/phyllo-api.ts` and `lib/supabase-admin.ts` files are already correct and don't need changes.

FILE: app/api/phyllo/webhook/route.ts
```
// app/api/phyllo/webhook/route.ts

import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"
import {
  fetchPhylloAccount,
  fetchPhylloProfiles,
  fetchPhylloEngagement,
  fetchPhylloAudience,
  PhylloEngagementDataWithRaw,
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
    const headerSecret =
      request.headers.get("x-phyllo-secret") ??
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

  console.log(
    `[phyllo/webhook] Received event: ${eventName}, account: ${accountId}, user: ${userId}`,
  )

  // 3. We need at least an account_id or user_id to proceed
  if (!accountId && !userId) {
    console.warn("[phyllo/webhook] No account_id or user_id in payload, skipping")
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
    .select("id")
    .eq("phyllo_user_id", phylloUserId)
    .single()

  if (profileError || !profile) {
    console.warn(
      `[phyllo/webhook] No profile found for phyllo_user_id=${phylloUserId}`,
      profileError?.message,
    )
    return NextResponse.json({ received: true })
  }

  const profileId: string = profile.id

  // Skip unsupported platforms
  if (platform && !SUPPORTED_PLATFORMS.includes(platform)) {
    console.log(`[phyllo/webhook] Unsupported platform "${platform}", skipping`)
    return NextResponse.json({ received: true })
  }

  // 6. Handle event types
  try {
    if (ACCOUNT_EVENTS.includes(eventName)) {
      await handleAccountConnected(supabase, profileId, platform, accountId)
    } else if (PROFILE_EVENTS.includes(eventName)) {
      await handleProfileData(supabase, profileId, accountId)
    } else if (ENGAGEMENT_EVENTS.includes(eventName)) {
      await handleEngagementData(supabase, profileId, accountId)
    } else if (AUDIENCE_EVENTS.includes(eventName)) {
      await handleAudienceData(supabase, profileId, platform, accountId)
    } else {
      console.log(`[phyllo/webhook] Unhandled event type: ${eventName}`)
    }
  } catch (err) {
    console.error(`[phyllo/webhook] Error handling event ${eventName}:`, err)
    // Still return 200 to prevent infinite retries
  }

  return NextResponse.json({ received: true })
}

// ---------- Helpers ----------

/**
 * Upsert a row into profile_social_stats.
 * Uses ON CONFLICT (profile_id, platform) DO UPDATE.
 */
async function upsertSocialStats(
  supabase: ReturnType<typeof createAdminClient>,
  profileId: string,
  platform: string,
  data: Record<string, any>,
) {
  const row = {
    profile_id: profileId,
    platform,
    last_synced_at: new Date().toISOString(),
    ...data,
  }

  const { error } = await supabase
    .from("profile_social_stats")
    .upsert(row, { onConflict: "profile_id,platform" })

  if (error) {
    console.error(
      `[phyllo/webhook] Error upserting profile_social_stats for ${platform}:`,
      error.message,
    )
  }
}

// ---------- Event Handlers ----------

async function handleAccountConnected(
  supabase: ReturnType<typeof createAdminClient>,
  profileId: string,
  platform: string,
  accountId: string,
) {
  console.log(
    `[phyllo/webhook] Account connected: platform=${platform}, account=${accountId}`,
  )

  if (!platform || !SUPPORTED_PLATFORMS.includes(platform)) {
    console.warn("[phyllo/webhook] Unknown platform on ACCOUNTS.CONNECTED, skipping upsert")
    return
  }

  // Mark connected = true and store the phyllo_account_id
  await upsertSocialStats(supabase, profileId, platform, {
    connected: true,
    phyllo_account_id: accountId,
  })
}

async function handleProfileData(
  supabase: ReturnType<typeof createAdminClient>,
  profileId: string,
  accountId: string,
) {
  const profileData = await fetchPhylloProfiles(accountId)
  if (!profileData) {
    console.warn("[phyllo/webhook] No profile data returned from Phyllo API")
    return
  }

  const platform = profileData.platform
  if (!platform || !SUPPORTED_PLATFORMS.includes(platform)) {
    console.warn(`[phyllo/webhook] Unsupported platform "${platform}" in profile data`)
    return
  }

  console.log(
    `[phyllo/webhook] Profile data for ${platform}: username=${profileData.username}, followers=${profileData.followerCount}`,
  )

  const statsData: Record<string, any> = {
    phyllo_account_id: accountId,
    connected: true,
  }

  if (profileData.followerCount !== null) statsData.followers = profileData.followerCount
  if (profileData.totalPosts !== null) statsData.total_posts = profileData.totalPosts

  await upsertSocialStats(supabase, profileId, platform, statsData)
}

async function handleEngagementData(
  supabase: ReturnType<typeof createAdminClient>,
  profileId: string,
  accountId: string,
) {
  const engagementData = (await fetchPhylloEngagement(
    accountId,
  )) as PhylloEngagementDataWithRaw | null
  if (!engagementData) {
    console.warn("[phyllo/webhook] No engagement data returned from Phyllo API")
    return
  }

  const platform = engagementData.platform
  if (!platform || !SUPPORTED_PLATFORMS.includes(platform)) {
    console.warn(`[phyllo/webhook] Unsupported platform "${platform}" in engagement data`)
    return
  }

  console.log(
    `[phyllo/webhook] Engagement data for ${platform}: avgViews=${engagementData.avgViews}, posts=${engagementData.totalPosts}`,
  )

  // To compute engagement rate we need the current follower count from profile_social_stats
  let engagementRate: number | null = null
  const avgInteractions =
    (engagementData._avgLikes ?? 0) + (engagementData._avgComments ?? 0)

  if (avgInteractions > 0) {
    const { data: existing } = await supabase
      .from("profile_social_stats")
      .select("followers")
      .eq("profile_id", profileId)
      .eq("platform", platform)
      .single()

    const followers = existing?.followers
    if (followers && followers > 0) {
      engagementRate = parseFloat(
        ((avgInteractions / followers) * 100).toFixed(2),
      )
    }
  }

  const statsData: Record<string, any> = {}

  if (engagementRate !== null) statsData.engagement_rate = engagementRate
  if (engagementData.avgViews !== null) statsData.avg_views = engagementData.avgViews
  if (engagementData.totalPosts !== null) statsData.total_posts = engagementData.totalPosts

  await upsertSocialStats(supabase, profileId, platform, statsData)
}

async function handleAudienceData(
  supabase: ReturnType<typeof createAdminClient>,
  profileId: string,
  platform: string,
  accountId: string,
) {
  const audienceData = await fetchPhylloAudience(accountId)
  if (!audienceData) {
    console.warn("[phyllo/webhook] No audience data returned from Phyllo API")
    return
  }

  console.log(
    `[phyllo/webhook] Audience data for ${platform}: topCity=${audienceData.topCity}, topCountry=${audienceData.topCountry}`,
  )

  // Audience demographics are stored on the profiles table (shared across platforms).
  // Per the schema, these are profile-level columns, not per-platform.
  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  }

  if (audienceData.age18_24 !== null) updateData.audience_age_18_24 = audienceData.age18_24
  if (audienceData.age25_34 !== null) updateData.audience_age_25_34 = audienceData.age25_34
  if (audienceData.age35Plus !== null) updateData.audience_age_35_plus = audienceData.age35Plus
  if (audienceData.genderMale !== null) updateData.audience_gender_male = audienceData.genderMale
  if (audienceData.genderFemale !== null)
    updateData.audience_gender_female = audienceData.genderFemale
  if (audienceData.topCity) updateData.audience_top_city = audienceData.topCity
  if (audienceData.topCountry) updateData.audience_top_country = audienceData.topCountry

  // Only update profiles if we have meaningful data beyond just updated_at
  if (Object.keys(updateData).length > 1) {
    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", profileId)

    if (error) {
      console.error("[phyllo/webhook] Error updating audience data on profiles:", error.message)
    }
  }

  // Also update last_synced_at on the platform's social stats row
  if (platform && SUPPORTED_PLATFORMS.includes(platform)) {
    await upsertSocialStats(supabase, profileId, platform, {})
  }
}
```

## NOTES

The key changes from the existing webhook route:

1. **All per-platform data now writes to `profile_social_stats`** via the `upsertSocialStats` helper, which does `INSERT ... ON CONFLICT (profile_id, platform) DO UPDATE`. This replaces the old pattern of writing `instagram_followers`, `ig_avg_views`, `ig_engagement_rate`, `ig_handle`, `tt_handle`, etc. directly to the `profiles` table.

2. **`handleAccountConnected`** now upserts `connected: true` and `phyllo_account_id` into `profile_social_stats` instead of writing `ig_account_id`/`tt_account_id` to `profiles`.

3. **`handleProfileData`** writes `followers`, `total_posts`, `phyllo_account_id` to `profile_social_stats` instead of `instagram_followers`/`tiktok_followers`/`ig_total_posts` on `profiles`.

4. **`handleEngagementData`** writes `engagement_rate`, `avg_views`, `total_posts` to `profile_social_stats`. It reads the current `followers` from `profile_social_stats` (not `profiles`) to compute engagement rate.

5. **`handleAudienceData`** writes shared audience demographics (`audience_age_18_24`, `audience_gender_male`, `audience_top_city`, etc.) to the `profiles` table — these are the only columns that belong there per the schema.

6. **Profile lookup** uses `profiles.id` obtained via `phyllo_user_id`, and that `id` is used as `profile_id` FK in `profile_social_stats`.

7. The `lib/phyllo-api.ts` and `lib/supabase-admin.ts` files were already correct and require no changes.