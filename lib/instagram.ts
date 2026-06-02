import crypto from "crypto"
import { encryptToken, decryptToken } from "@/lib/token-encryption"

const GRAPH_VERSION = "v25.0"
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`

function appsecretProof(accessToken: string): string {
  return crypto
    .createHmac("sha256", process.env.INSTAGRAM_APP_SECRET!)
    .update(accessToken)
    .digest("hex")
}

function withProof(accessToken: string, extra?: Record<string, string>): string {
  const params = new URLSearchParams({
    access_token: accessToken,
    appsecret_proof: appsecretProof(accessToken),
    ...extra,
  })
  return params.toString()
}

export function buildAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID!,
    redirect_uri: redirectUri,
    scope: "instagram_basic,instagram_manage_insights,pages_show_list",
    response_type: "code",
    state,
  })
  return `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth?${params}`
}

export async function exchangeCodeForShortLivedToken(code: string, redirectUri: string): Promise<string> {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID!,
    client_secret: process.env.INSTAGRAM_APP_SECRET!,
    redirect_uri: redirectUri,
    code,
  })
  const res = await fetch(`${GRAPH_BASE}/oauth/access_token`, {
    method: "POST",
    body: params,
  })
  const data = await res.json()
  if (data.error) throw new Error(`Token exchange failed: ${data.error.message}`)
  return data.access_token
}

export async function exchangeForLongLivedToken(
  shortLivedToken: string
): Promise<{ access_token: string; expires_in: number }> {
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: process.env.INSTAGRAM_APP_ID!,
    client_secret: process.env.INSTAGRAM_APP_SECRET!,
    fb_exchange_token: shortLivedToken,
  })
  const res = await fetch(`${GRAPH_BASE}/oauth/access_token?${params}`)
  const data = await res.json()
  if (data.error) throw new Error(`Long-lived token exchange failed: ${data.error.message}`)
  return { access_token: data.access_token, expires_in: data.expires_in }
}

export async function refreshLongLivedToken(
  currentToken: string
): Promise<{ access_token: string; expires_in: number }> {
  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: process.env.INSTAGRAM_APP_ID!,
    client_secret: process.env.INSTAGRAM_APP_SECRET!,
    fb_exchange_token: currentToken,
  })
  const res = await fetch(`${GRAPH_BASE}/oauth/access_token?${params}`)
  const data = await res.json()
  if (data.error) throw new Error(`Token refresh failed: ${data.error.message}`)
  return { access_token: data.access_token, expires_in: data.expires_in }
}

export async function getInstagramAccountId(accessToken: string): Promise<string> {
  const pagesRes = await fetch(`${GRAPH_BASE}/me/accounts?${withProof(accessToken)}`)
  const pagesData = await pagesRes.json()

  if (pagesData.error) {
    throw new Error(`Failed to fetch Facebook Pages: ${pagesData.error.message}`)
  }

  if (!pagesData.data?.length) {
    throw new Error(
      "No Facebook Pages found. Link your Instagram account to a Facebook Page first, then try again."
    )
  }

  for (const page of pagesData.data) {
    const igRes = await fetch(
      `${GRAPH_BASE}/${page.id}?fields=instagram_business_account&${withProof(accessToken)}`
    )
    const igData = await igRes.json()
    if (igData.instagram_business_account?.id) {
      return igData.instagram_business_account.id
    }
  }

  throw new Error(
    "No Instagram Business or Creator account linked to your Facebook Page. Switch your Instagram to a Professional account first."
  )
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
    `${GRAPH_BASE}/${igUserId}?fields=username,followers_count,media_count&${withProof(accessToken)}`
  )
  const profileData = await profileRes.json()

  if (profileData.error) {
    throw new Error(`Instagram profile fetch failed: ${profileData.error.message}`)
  }

  let engagementRate: number | null = null
  let avgViews: number | null = null

  // Engagement rate from recent posts (like_count + comments_count)
  try {
    const mediaRes = await fetch(
      `${GRAPH_BASE}/${igUserId}/media?fields=id,media_type,like_count,comments_count&limit=20&${withProof(accessToken)}`
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
  } catch { /* non-fatal — engagement stays null */ }

  // Avg views from recent videos/reels
  try {
    const videoRes = await fetch(
      `${GRAPH_BASE}/${igUserId}/media?fields=id,media_type,video_views&limit=20&${withProof(accessToken)}`
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
  } catch { /* non-fatal — avg_views stays null */ }

  return {
    username: profileData.username,
    followers: profileData.followers_count,
    media_count: profileData.media_count ?? 0,
    engagement_rate: engagementRate,
    avg_views: avgViews,
  }
}

// Re-export encrypt/decrypt for use in routes
export { encryptToken, decryptToken }
