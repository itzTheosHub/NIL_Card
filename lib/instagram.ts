import crypto from "crypto"
import { encryptToken, decryptToken } from "@/lib/token-encryption"

const GRAPH_VERSION = "v25.0"
const AUTH_BASE = "https://www.instagram.com"
const TOKEN_BASE = "https://api.instagram.com"
const GRAPH_BASE = `https://graph.instagram.com/${GRAPH_VERSION}`

export function buildAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID!,
    redirect_uri: redirectUri,
    scope: "instagram_business_basic",
    response_type: "code",
    state,
  })
  return `${AUTH_BASE}/oauth/authorize?${params}`
}

export async function exchangeCodeForShortLivedToken(
  code: string,
  redirectUri: string
): Promise<{ access_token: string; user_id: string }> {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID!,
    client_secret: process.env.INSTAGRAM_APP_SECRET!,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code,
  })
  const res = await fetch(`${TOKEN_BASE}/oauth/access_token`, {
    method: "POST",
    body: params,
  })
  const data = await res.json()
  if (data.error_message || data.error) {
    throw new Error(`Token exchange failed: ${data.error_message || data.error?.message}`)
  }
  return { access_token: data.access_token, user_id: String(data.user_id) }
}

export async function exchangeForLongLivedToken(
  shortLivedToken: string
): Promise<{ access_token: string; expires_in: number }> {
  const params = new URLSearchParams({
    grant_type: "ig_exchange_token",
    client_secret: process.env.INSTAGRAM_APP_SECRET!,
    access_token: shortLivedToken,
  })
  const res = await fetch(`https://graph.instagram.com/access_token`, {
    method: "POST",
    body: params,
  })
  const data = await res.json()
  if (data.error) throw new Error(`Long-lived token exchange failed: ${data.error.message}`)
  return { access_token: data.access_token, expires_in: data.expires_in }
}

export async function refreshLongLivedToken(
  currentToken: string
): Promise<{ access_token: string; expires_in: number }> {
  const params = new URLSearchParams({
    grant_type: "ig_refresh_token",
    access_token: currentToken,
  })
  const res = await fetch(`https://graph.instagram.com/refresh_access_token`, {
    method: "POST",
    body: params,
  })
  const data = await res.json()
  if (data.error) throw new Error(`Token refresh failed: ${data.error.message}`)
  return { access_token: data.access_token, expires_in: data.expires_in }
}

export interface InstagramStats {
  username: string
  followers: number
  media_count: number
  engagement_rate: number | null
  avg_views: number | null
}

export async function fetchInstagramStats(
  igUserId: string,
  accessToken: string
): Promise<InstagramStats> {
  const profileRes = await fetch(
    `${GRAPH_BASE}/me?fields=id,username,followers_count,media_count&access_token=${accessToken}`
  )
  const profileData = await profileRes.json()

  if (profileData.error) {
    console.error("IG profile fetch raw error:", JSON.stringify(profileData.error))
    throw new Error(`Instagram profile fetch failed: ${profileData.error.message}`)
  }

  let engagementRate: number | null = null
  let avgViews: number | null = null

  // Engagement rate from recent posts
  try {
    const mediaRes = await fetch(
      `${GRAPH_BASE}/${igUserId}/media?fields=id,media_type,like_count,comments_count&limit=20&access_token=${accessToken}`
    )
    const mediaData = await mediaRes.json()

    if (!mediaData.error && mediaData.data?.length > 0 && profileData.followers_count > 0) {
      const posts = mediaData.data
      const totalInteractions = posts.reduce(
        (sum: number, p: any) => sum + (p.like_count ?? 0) + (p.comments_count ?? 0),
        0
      )
      engagementRate = parseFloat(
        ((totalInteractions / posts.length / profileData.followers_count) * 100).toFixed(2)
      )
    }
  } catch { /* non-fatal */ }

  // Avg views from recent videos/reels
  try {
    const videoRes = await fetch(
      `${GRAPH_BASE}/${igUserId}/media?fields=id,media_type,video_views&limit=20&access_token=${accessToken}`
    )
    const videoData = await videoRes.json()

    if (!videoData.error && videoData.data) {
      const videoStats = videoData.data.filter(
        (m: any) => (m.media_type === "VIDEO" || m.media_type === "REELS") && m.video_views != null
      )
      if (videoStats.length > 0) {
        avgViews = Math.round(
          videoStats.reduce((sum: number, m: any) => sum + (m.video_views ?? 0), 0) / videoStats.length
        )
      }
    }
  } catch { /* non-fatal */ }

  return {
    username: profileData.username,
    followers: profileData.followers_count,
    media_count: profileData.media_count ?? 0,
    engagement_rate: engagementRate,
    avg_views: avgViews,
  }
}

export { encryptToken, decryptToken }
