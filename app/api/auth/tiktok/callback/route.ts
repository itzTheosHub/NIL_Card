import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { exchangeCodeForTokens, encryptTokens, fetchAllStats } from "@/lib/tiktok"

/**
 * GET /api/auth/tiktok/callback
 *
 * TikTok redirects here after the athlete approves permissions.
 * - Verifies CSRF state
 * - Exchanges code for access + refresh tokens
 * - Stores encrypted tokens in `profiles`
 * - Pulls stats from TikTok API
 * - Writes stats to `profile_social_stats` with is_verified = true
 * - Redirects back to the originating page
 */
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin

  // ── 1. Parse query params ──────────────────────────────────
  const code = request.nextUrl.searchParams.get("code")
  const state = request.nextUrl.searchParams.get("state")
  const error = request.nextUrl.searchParams.get("error")

  // TikTok sends error if user denied or something went wrong
  if (error) {
    const errorDesc = request.nextUrl.searchParams.get("error_description") || "Authorization denied"
    const fallback = "/onboarding/connect"
    return NextResponse.redirect(
      new URL(`${fallback}?tiktok_error=${encodeURIComponent(errorDesc)}`, baseUrl)
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/onboarding/connect?tiktok_error=Missing+authorization+code", baseUrl)
    )
  }

  // ── 2. Verify CSRF state from cookie ───────────────────────
  const oauthCookie = request.cookies.get("tiktok_oauth_state")?.value
  let from = "/onboarding/connect"

  if (!oauthCookie) {
    return NextResponse.redirect(
      new URL(`${from}?tiktok_error=Session+expired.+Please+try+again.`, baseUrl)
    )
  }

  let codeVerifier: string
  try {
    const parsed = JSON.parse(oauthCookie)
    if (parsed.state !== state) {
      return NextResponse.redirect(
        new URL(`${from}?tiktok_error=Invalid+state.+Please+try+again.`, baseUrl)
      )
    }
    from = parsed.from || from
    codeVerifier = parsed.codeVerifier
  } catch {
    return NextResponse.redirect(
      new URL(`${from}?tiktok_error=Invalid+session.+Please+try+again.`, baseUrl)
    )
  }

  if (!codeVerifier) {
    return NextResponse.redirect(
      new URL(`${from}?tiktok_error=Session+missing+PKCE+verifier.+Please+try+again.`, baseUrl)
    )
  }

  // ── 3. Verify the user is authenticated ────────────────────
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL("/login", baseUrl))
  }

  // ── 4. Exchange code for tokens ────────────────────────────
  const redirectUri = `${baseUrl}/api/auth/tiktok/callback`

  let tokens
  try {
    tokens = await exchangeCodeForTokens(code, redirectUri, codeVerifier)
  } catch (err: any) {
    console.error("TikTok token exchange error:", err.message)
    return NextResponse.redirect(
      new URL(`${from}?tiktok_error=${encodeURIComponent("Failed to connect TikTok. Please try again.")}`, baseUrl)
    )
  }

  // ── 5. Encrypt and store tokens in profiles ────────────────
  const { encrypted_access_token, encrypted_refresh_token } = encryptTokens(tokens)
  const now = new Date()
  const tokenExpiresAt = new Date(now.getTime() + tokens.expires_in * 1000)
  const refreshExpiresAt = new Date(now.getTime() + tokens.refresh_expires_in * 1000)

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      tiktok_access_token: encrypted_access_token,
      tiktok_refresh_token: encrypted_refresh_token,
      tiktok_user_id: tokens.open_id,
      tiktok_token_expires_at: tokenExpiresAt.toISOString(),
      tiktok_refresh_expires_at: refreshExpiresAt.toISOString(),
    })
    .eq("id", user.id)

  if (updateError) {
    console.error("Failed to store TikTok tokens:", updateError)
    return NextResponse.redirect(
      new URL(`${from}?tiktok_error=${encodeURIComponent("Failed to save connection. Please try again.")}`, baseUrl)
    )
  }

  // ── 6. Pull stats from TikTok API ─────────────────────────
  let stats
  try {
    stats = await fetchAllStats(tokens.access_token)
  } catch (err: any) {
    console.error("TikTok stats fetch error:", err.message)
    // Tokens are stored — stats can be retried later via Refresh
    return NextResponse.redirect(
      new URL(`${from}?tiktok_connected=true&tiktok_stats_error=true`, baseUrl)
    )
  }

  // ── 7. Write stats to profile_social_stats ─────────────────
  // First, check if a TikTok row already exists for this profile
  const { data: existingStats } = await supabase
    .from("profile_social_stats")
    .select("id")
    .eq("profile_id", user.id)
    .eq("platform", "tiktok")
    .single()

  const statsPayload = {
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

  if (existingStats) {
    const { error: statsError } = await supabase
      .from("profile_social_stats")
      .update(statsPayload)
      .eq("id", existingStats.id)

    if (statsError) {
      console.error("Failed to update TikTok stats:", statsError)
    }
  } else {
    const { error: statsError } = await supabase
      .from("profile_social_stats")
      .insert(statsPayload)

    if (statsError) {
      console.error("Failed to insert TikTok stats:", statsError)
    }
  }

  // ── 8. Sync follower count to social_links table ───────────
  // social_links is a separate table (profile_id, platform, url, follower_count).
  // Upsert the TikTok row so the card shows the verified follower count.
  const tiktokUrl = stats.username.startsWith("@")
    ? `https://www.tiktok.com/${stats.username}`
    : `https://www.tiktok.com/@${stats.username}`

  await supabase
    .from("social_links")
    .upsert(
      {
        profile_id: user.id,
        platform: "tiktok",
        url: tiktokUrl,
        follower_count: stats.follower_count,
      },
      { onConflict: "profile_id,platform" }
    )

  // ── 9. Clear the OAuth cookie and redirect back ────────────
  const response = NextResponse.redirect(
    new URL(`${from}?tiktok_connected=true`, baseUrl)
  )

  response.cookies.set("tiktok_oauth_state", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // Delete the cookie
  })

  return response
}
