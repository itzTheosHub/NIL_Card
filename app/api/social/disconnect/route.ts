import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { platform } = await request.json()

  if (platform === "tiktok") {
    // Clear TikTok token columns from profiles
    await supabase.from("profiles").update({
      tiktok_access_token: null,
      tiktok_refresh_token: null,
      tiktok_user_id: null,
      tiktok_token_expires_at: null,
      tiktok_refresh_expires_at: null,
    }).eq("id", user.id)

    // Mark stats row as disconnected and unverified
    await supabase.from("profile_social_stats").update({
      connected: false,
      is_verified: false,
    }).eq("profile_id", user.id).eq("platform", "tiktok")

    return NextResponse.json({ ok: true })
  }

  if (platform === "instagram") {
    await supabase.from("profiles").update({
      instagram_access_token: null,
      instagram_user_id: null,
      instagram_token_expires_at: null,
    }).eq("id", user.id)

    await supabase.from("profile_social_stats").update({
      connected: false,
      is_verified: false,
    }).eq("profile_id", user.id).eq("platform", "instagram")

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: "Unknown platform" }, { status: 400 })
}
