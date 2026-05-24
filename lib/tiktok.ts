/**
 * TikTok API helper functions.
 * Handles token exchange, token refresh, and stats fetching.
 *
 * TikTok API v2 reference:
 * - Auth: https://developers.tiktok.com/doc/oauth-user-access-token-management
 * - User Info: https://developers.tiktok.com/doc/tiktok-api-v2-get-user-info
 * - Video List: https://developers.tiktok.com/doc/tiktok-api-v2-video-list
 */

import crypto from "crypto"
import { encryptToken, decryptToken } from "@/lib/token-encryption"

/**
 * Generate a PKCE code_verifier + code_challenge pair.
 * TikTok Login Kit v2 requires PKCE (S256 method).
 */
export function generatePKCE(): { codeVerifier: string; codeChallenge: string } {
  const codeVerifier = crypto.randomBytes(32).toString("base64url")
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url")
  return { codeVerifier, codeChallenge }
}

const TIKTOK_TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/"
const TIKTOK_USER_INFO_URL = "https://open.tiktokapis.com/v2/user/info/"
const TIKTOK_VIDEO_LIST_URL = "https://open.tiktokapis.com/v2/video/list/"

export type TikTokTokens = {
  access_token: string
  refresh_token: string
  open_id: string
  expires_in: number           // seconds until access token expiry
  refresh_expires_in: number   // seconds until refresh token expiry
}

export type TikTokUserInfo = {
  username: string
  follower_count: number
  following_count: number
  likes_count: number
  video_count: number
}

export type TikTokStats = TikTokUserInfo & {
  avg_views: number | null
}

/**
 * Exchange an authorization code for TikTok access + refresh tokens.
 */
export async function exchangeCodeForTokens(code: string, redirectUri: string, codeVerifier: string): Promise<TikTokTokens> {
  const res = await fetch(TIKTOK_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  })

  const data = await res.json()

  if (data.error || !data.access_token) {
    const errMsg = data.error_description || data.error || "Failed to exchange TikTok code"
    throw new Error(`TikTok token exchange failed: ${errMsg}`)
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    open_id: data.open_id,
    expires_in: data.expires_in,
    refresh_expires_in: data.refresh_expires_in,
  }
}

/**
 * Refresh an expired TikTok access token using the refresh token.
 * Returns new tokens (TikTok rotates both on refresh).
 */
export async function refreshAccessToken(encryptedRefreshToken: string): Promise<TikTokTokens> {
  const refreshToken = decryptToken(encryptedRefreshToken)

  const res = await fetch(TIKTOK_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  })

  const data = await res.json()

  if (data.error || !data.access_token) {
    const errMsg = data.error_description || data.error || "Failed to refresh TikTok token"
    throw new Error(`TikTok token refresh failed: ${errMsg}`)
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    open_id: data.open_id,
    expires_in: data.expires_in,
    refresh_expires_in: data.refresh_expires_in,
  }
}

/**
 * Fetch user info (profile + stats) from TikTok API v2.
 */
export async function fetchUserInfo(accessToken: string): Promise<TikTokUserInfo> {
  const fields = [
    "display_name",
    "username",
    "follower_count",
    "following_count",
    "likes_count",
    "video_count",
  ].join(",")

  const res = await fetch(`${TIKTOK_USER_INFO_URL}?fields=${fields}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const data = await res.json()

  if (data.error?.code || !data.data?.user) {
    const errMsg = data.error?.message || "Failed to fetch TikTok user info"
    throw new Error(`TikTok user info failed: ${errMsg}`)
  }

  const user = data.data.user

  return {
    username: user.username || user.display_name || "",
    follower_count: user.follower_count ?? 0,
    following_count: user.following_count ?? 0,
    likes_count: user.likes_count ?? 0,
    video_count: user.video_count ?? 0,
  }
}

/**
 * Calculate average views from the user's recent videos.
 * Fetches up to 20 most recent videos and averages their view counts.
 * Returns null if no videos are available.
 */
export async function fetchAvgViews(accessToken: string): Promise<number | null> {
  const res = await fetch(`${TIKTOK_VIDEO_LIST_URL}?fields=view_count`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      max_count: 20,
    }),
  })

  const data = await res.json()

  if (data.error?.code || !data.data?.videos) {
    // Not a hard failure — athlete may have no videos
    return null
  }

  const videos = data.data.videos as Array<{ view_count?: number }>

  if (videos.length === 0) return null

  const totalViews = videos.reduce((sum, v) => sum + (v.view_count ?? 0), 0)
  return Math.round(totalViews / videos.length)
}

/**
 * Fetch all TikTok stats in one call (user info + avg views).
 */
export async function fetchAllStats(accessToken: string): Promise<TikTokStats> {
  const [userInfo, avgViews] = await Promise.all([
    fetchUserInfo(accessToken),
    fetchAvgViews(accessToken),
  ])

  return {
    ...userInfo,
    avg_views: avgViews,
  }
}

/**
 * Encrypt tokens for storage.
 */
export function encryptTokens(tokens: TikTokTokens) {
  return {
    encrypted_access_token: encryptToken(tokens.access_token),
    encrypted_refresh_token: encryptToken(tokens.refresh_token),
  }
}

/**
 * Build the TikTok OAuth authorization URL.
 */
export function buildAuthUrl(redirectUri: string, state: string, codeChallenge: string): string {
  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY!,
    response_type: "code",
    scope: "user.info.basic,user.info.profile,user.info.stats,video.list",
    redirect_uri: redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  })

  return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`
}
