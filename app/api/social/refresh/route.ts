import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { decryptToken, encryptToken } from "@/lib/token-encryption"
import { fetchAllStats, refreshAccessToken, encryptTokens } from "@/lib/tiktok"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { platform } = await request.json()

  if (platform === "tiktok") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("tiktok_access_token, tiktok_refresh_token, tiktok_token_expires_at")
      .eq("id", user.id)
      .single()

    if (!profile?.tiktok_access_token) {
      return NextResponse.json({ error: "TikTok not connected" }, { status: 400 })
    }

    let accessToken = decryptToken(profile.tiktok_access_token)

    // Refresh the access token if it's expired
    const tokenExpired = new Date(profile.tiktok_token_expires_at) < new Date()
    if (tokenExpired && profile.tiktok_refresh_token) {
      try {
        const newTokens = await refreshAccessToken(profile.tiktok_refresh_token)
        const { encrypted_access_token, encrypted_refresh_token } = encryptTokens(newTokens)
        const now = new Date()

        await supabase.from("profiles").update({
          tiktok_access_token: encrypted_access_token,
          tiktok_refresh_token: encrypted_refresh_token,
          tiktok_token_expires_at: new Date(now.getTime() + newTokens.expires_in * 1000).toISOString(),
          tiktok_refresh_expires_at: new Date(now.getTime() + newTokens.refresh_expires_in * 1000).toISOString(),
        }).eq("id", user.id)

        accessToken = newTokens.access_token
      } catch {
        return NextResponse.json({ error: "TikTok token expired — please reconnect" }, { status: 401 })
      }
    }

    try {
      const stats = await fetchAllStats(accessToken)
      const now = new Date()

      const { data: existing } = await supabase
        .from("profile_social_stats")
        .select("id")
        .eq("profile_id", user.id)
        .eq("platform", "tiktok")
        .single()

      const payload = {
        profile_id: user.id,
        platform: "tiktok" as const,
        username: stats.username,
        followers: stats.follower_count,
        total_posts: stats.video_count,
        avg_views: stats.avg_views,
        likes_count: stats.likes_count,
        connected: true,
        is_verified: true,
        last_synced_at: now.toISOString(),
      }

      if (existing) {
        await supabase.from("profile_social_stats").update(payload).eq("id", existing.id)
      } else {
        await supabase.from("profile_social_stats").insert(payload)
      }

      // Keep social_links follower count in sync
      const tiktokUrl = stats.username.startsWith("@")
        ? `https://www.tiktok.com/${stats.username}`
        : `https://www.tiktok.com/@${stats.username}`

      await supabase.from("social_links").upsert(
        { profile_id: user.id, platform: "tiktok", url: tiktokUrl, follower_count: stats.follower_count },
        { onConflict: "profile_id,platform" }
      )

      return NextResponse.json({ ok: true })
    } catch (err: any) {
      return NextResponse.json({ error: err.message || "Failed to refresh TikTok stats" }, { status: 500 })
    }
  }

  if (platform === "instagram") {
    // Instagram refresh — placeholder until Instagram OAuth is built
    return NextResponse.json({ error: "Instagram not yet supported" }, { status: 400 })
  }

  return NextResponse.json({ error: "Unknown platform" }, { status: 400 })
}
