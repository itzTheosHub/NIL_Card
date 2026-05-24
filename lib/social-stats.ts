import { SupabaseClient } from "@supabase/supabase-js"

export type PlatformStatsData = {
  platform: "instagram" | "tiktok"
  connected: boolean
  username?: string | null
  followers?: number | null
  engagement_rate?: number | null
  avg_views?: number | null
  last_synced_at?: string | null
  token_expires_at?: string | null
  refresh_expires_at?: string | null
}

/**
 * Fetch connected account status + stats for a given user.
 * Returns an array of PlatformStatsData for Instagram and TikTok.
 *
 * Works with both server and client Supabase clients.
 */
export async function fetchConnectedAccounts(
  supabase: SupabaseClient,
  userId: string
): Promise<PlatformStatsData[]> {
  // Fetch profile token metadata
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "instagram_user_id, instagram_token_expires_at, tiktok_user_id, tiktok_token_expires_at, tiktok_refresh_expires_at"
    )
    .eq("id", userId)
    .single()

  // Fetch social stats for both platforms
  const { data: stats } = await supabase
    .from("profile_social_stats")
    .select("platform, username, followers, engagement_rate, avg_views, is_verified, last_synced_at, connected")
    .eq("profile_id", userId)
    .in("platform", ["instagram", "tiktok"])

  const instagramStats = stats?.find((s: any) => s.platform === "instagram")
  const tiktokStats = stats?.find((s: any) => s.platform === "tiktok")

  const instagramConnected = !!(profile?.instagram_user_id && instagramStats?.connected)
  const tiktokConnected = !!(profile?.tiktok_user_id && tiktokStats?.connected)

  const result: PlatformStatsData[] = [
    {
      platform: "instagram",
      connected: instagramConnected,
      username: instagramStats?.username || null,
      followers: instagramStats?.followers || null,
      engagement_rate: instagramStats?.engagement_rate || null,
      avg_views: instagramStats?.avg_views || null,
      last_synced_at: instagramStats?.last_synced_at || null,
      token_expires_at: profile?.instagram_token_expires_at || null,
      refresh_expires_at: null,
    },
    {
      platform: "tiktok",
      connected: tiktokConnected,
      username: tiktokStats?.username || null,
      followers: tiktokStats?.followers || null,
      engagement_rate: null, // TikTok doesn't provide engagement rate directly
      avg_views: tiktokStats?.avg_views || null,
      last_synced_at: tiktokStats?.last_synced_at || null,
      token_expires_at: profile?.tiktok_token_expires_at || null,
      refresh_expires_at: profile?.tiktok_refresh_expires_at || null,
    },
  ]

  return result
}
