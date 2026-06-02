import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { buildAuthUrl } from "@/lib/instagram"
import crypto from "crypto"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.redirect(new URL("/login", request.url))

  const from = request.nextUrl.searchParams.get("from") || "/onboarding/connect"
  const state = crypto.randomBytes(32).toString("hex")

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin
  const redirectUri = `${baseUrl}/api/auth/instagram/callback`

  const authUrl = buildAuthUrl(redirectUri, state)
  const response = NextResponse.redirect(authUrl)

  response.cookies.set("instagram_oauth_state", JSON.stringify({ state, from }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  })

  return response
}
