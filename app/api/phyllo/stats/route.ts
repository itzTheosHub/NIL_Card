import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  // Authenticate the current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Fetch profile id + audience columns from profiles
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(
      "id, audience_age_18_24, audience_age_25_34, audience_age_35_plus, audience_gender_male, audience_gender_female, audience_top_city, audience_top_country"
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

  // Fetch per-platform stats from profile_social_stats
  const { data: statsRows } = await supabase
    .from("profile_social_stats")
    .select("platform, followers, avg_views, engagement_rate, total_posts, connected")
    .eq("profile_id", profile.id)

  const igRow = statsRows?.find((r) => r.platform === "instagram") ?? null
  const ttRow = statsRows?.find((r) => r.platform === "tiktok") ?? null

  // Structure the response per-platform so the frontend can check
  // whether a specific platform's stats have landed yet.
  const instagram = igRow?.connected
    ? {
        connected: true,
        followers: igRow.followers,
        avgViews: igRow.avg_views,
        engagementRate: igRow.engagement_rate,
        totalPosts: igRow.total_posts,
        hasStats: igRow.followers != null,
      }
    : { connected: false, hasStats: false }

  const tiktok = ttRow?.connected
    ? {
        connected: true,
        followers: ttRow.followers,
        avgViews: ttRow.avg_views,
        engagementRate: ttRow.engagement_rate,
        totalPosts: ttRow.total_posts,
        hasStats: ttRow.followers != null,
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
