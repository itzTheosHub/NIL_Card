import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { buildAuthUrl, generatePKCE } from "@/lib/tiktok"
import crypto from "crypto"

/**
 * GET /api/auth/tiktok
 *
 * Initiates the TikTok OAuth flow.
 * Accepts an optional `from` query param to know where to redirect back after callback.
 * Stores the CSRF state + return path in a cookie for the callback to read.
 */
export async function GET(request: NextRequest) {
  // Verify the user is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Determine where to redirect after OAuth completes
  const from = request.nextUrl.searchParams.get("from") || "/onboarding/connect"

  // Generate CSRF state token + PKCE pair
  const state = crypto.randomBytes(32).toString("hex")
  const { codeVerifier, codeChallenge } = generatePKCE()

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin
  const redirectUri = `${baseUrl}/api/auth/tiktok/callback`

  const authUrl = buildAuthUrl(redirectUri, state, codeChallenge)

  // Build the response that redirects to TikTok
  const response = NextResponse.redirect(authUrl)

  // Store state + return path + PKCE verifier in a secure httpOnly cookie
  // The callback will verify state and use codeVerifier to exchange the code
  response.cookies.set("tiktok_oauth_state", JSON.stringify({ state, from, codeVerifier }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 minutes — enough for the OAuth flow
  })

  return response
}
