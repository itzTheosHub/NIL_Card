import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import {
  exchangeCodeForShortLivedToken,
  exchangeForLongLivedToken,
  getInstagramAccountId,
  fetchInstagramStats,
  encryptToken,
} from "@/lib/instagram"

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin

  const code = request.nextUrl.searchParams.get("code")
  const state = request.nextUrl.searchParams.get("state")
  const error = request.nextUrl.searchParams.get("error")

  if (error) {
    const errorDesc = request.nextUrl.searchParams.get("error_description") || "Authorization denied"
    return NextResponse.redirect(
      new URL(`/onboarding/connect?instagram_error=${encodeURIComponent(errorDesc)}`, baseUrl)
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/onboarding/connect?instagram_error=Missing+authorization+code", baseUrl)
    )
  }

  // ── Verify CSRF state ──────────────────────────────────────
  const oauthCookie = request.cookies.get("instagram_oauth_state")?.value
  let from = "/onboarding/connect"

  if (!oauthCookie) {
    return NextResponse.redirect(
      new URL(`${from}?instagram_error=Session+expired.+Please+try+again.`, baseUrl)
    )
  }

  try {
    const parsed = JSON.parse(oauthCookie)
    if (parsed.state !== state) {
      return NextResponse.redirect(
        new URL(`${from}?instagram_error=Invalid+state.+Please+try+again.`, baseUrl)
      )
    }
    from = parsed.from || from
  } catch {
    return NextResponse.redirect(
      new URL(`${from}?instagram_error=Invalid+session.+Please+try+again.`, baseUrl)
    )
  }

  // ── Verify Supabase session ────────────────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL("/login", baseUrl))

  const redirectUri = `${baseUrl}/api/auth/instagram/callback`

  // ── Exchange code → short-lived → long-lived token ─────────
  let longLivedToken: string
  let expiresIn: number

  try {
    const shortLived = await exchangeCodeForShortLivedToken(code, redirectUri)
    const longLived = await exchangeForLongLivedToken(shortLived)
    longLivedToken = longLived.access_token
    expiresIn = longLived.expires_in
  } catch (err: any) {
    console.error("Instagram token exchange error:", err.message)
    return NextResponse.redirect(
      new URL(
        `${from}?instagram_error=${encodeURIComponent("Failed to connect Instagram. Please try again.")}`,
        baseUrl
      )
    )
  }

  // ── Get Instagram Business Account ID ─────────────────────
  let igUserId: string
  try {
    igUserId = await getInstagramAccountId(longLivedToken)
  } catch (err: any) {
    console.error("Instagram account ID error:", err.message)
    return NextResponse.redirect(
      new URL(`${from}?instagram_error=${encodeURIComponent(err.message)}`, baseUrl)
    )
  }

  // ── Store encrypted token in profiles ─────────────────────
  const now = new Date()
  const tokenExpiresAt = new Date(now.getTime() + expiresIn * 1000)

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      instagram_access_token: encryptToken(longLivedToken),
      instagram_user_id: igUserId,
      instagram_token_expires_at: tokenExpiresAt.toISOString(),
    })
    .eq("id", user.id)

  if (updateError) {
    console.error("Failed to store Instagram token:", updateError)
    return NextResponse.redirect(
      new URL(
        `${from}?instagram_error=${encodeURIComponent("Failed to save connection. Please try again.")}`,
        baseUrl
      )
    )
  }

  // ── Pull Instagram stats ───────────────────────────────────
  let stats
  try {
    stats = await fetchInstagramStats(igUserId, longLivedToken)
  } catch (err: any) {
    console.error("Instagram stats fetch error:", err.message)
    const response = NextResponse.redirect(
      new URL(`${from}?instagram_connected=true&instagram_stats_error=true`, baseUrl)
    )
    clearCookie(response)
    return response
  }

  // ── Write stats to profile_social_stats ───────────────────
  const { data: existingStats } = await supabase
    .from("profile_social_stats")
    .select("id")
    .eq("profile_id", user.id)
    .eq("platform", "instagram")
    .single()

  const statsPayload = {
    profile_id: user.id,
    platform: "instagram" as const,
    username: stats.username,
    followers: stats.followers,
    total_posts: stats.media_count,
    avg_views: stats.avg_views,
    engagement_rate: stats.engagement_rate,
    connected: true,
    is_verified: true,
    last_synced_at: now.toISOString(),
  }

  if (existingStats) {
    await supabase
      .from("profile_social_stats")
      .update(statsPayload)
      .eq("id", existingStats.id)
  } else {
    await supabase.from("profile_social_stats").insert(statsPayload)
  }

  // ── Sync to social_links ───────────────────────────────────
  await supabase.from("social_links").upsert(
    {
      profile_id: user.id,
      platform: "instagram",
      url: `https://www.instagram.com/${stats.username}`,
      follower_count: stats.followers,
    },
    { onConflict: "profile_id,platform" }
  )

  const response = NextResponse.redirect(
    new URL(`${from}?instagram_connected=true`, baseUrl)
  )
  clearCookie(response)
  return response
}

function clearCookie(response: NextResponse) {
  response.cookies.set("instagram_oauth_state", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
}
