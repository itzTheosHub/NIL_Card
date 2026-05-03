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

  // Fetch per-platform stats from profile_social_stats
  const { data: statsRows, error: statsError } = await supabase
    .from("profile_social_stats")
    .select("platform, followers, avg_views, engagement_rate, total_posts, connected, username")
    .eq("profile_id", user.id)

  if (statsError) {
    return NextResponse.json(
      { error: "Failed to fetch profile stats" },
      { status: 500 }
    )
  }

  const igRow = statsRows?.find((r) => r.platform === "instagram") ?? null
  const ttRow = statsRows?.find((r) => r.platform === "tiktok") ?? null

  return NextResponse.json({
    instagram_connected: igRow?.connected ?? false,
    instagram_followers: igRow?.followers ?? null,
    instagram_avg_views: igRow?.avg_views ?? null,
    instagram_engagement_rate: igRow?.engagement_rate ?? null,
    instagram_total_posts: igRow?.total_posts ?? null,
    instagram_username: igRow?.username ?? null,
    tiktok_connected: ttRow?.connected ?? false,
    tiktok_followers: ttRow?.followers ?? null,
    tiktok_avg_views: ttRow?.avg_views ?? null,
    tiktok_engagement_rate: ttRow?.engagement_rate ?? null,
    tiktok_total_posts: ttRow?.total_posts ?? null,
    tiktok_username: ttRow?.username ?? null,
  })
}
