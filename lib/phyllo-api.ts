// lib/phyllo-api.ts

const PHYLLO_BASE_URL = process.env.PHYLLO_ENV === "production"
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

export type PhylloEngagementDataWithRaw = PhylloEngagementData & {
  _avgLikes: number
  _avgComments: number
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
    const data = await phylloFetch(`/profiles?account_id=${accountId}`)
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
 * GET /v1/social/contents?account_id={accountId}&limit=30
 */
export async function fetchPhylloEngagement(accountId: string): Promise<PhylloEngagementDataWithRaw | null> {
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
      _avgLikes: avgLikes,
      _avgComments: avgComments,
    }
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
