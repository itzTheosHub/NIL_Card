import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

const PHYLLO_BASE_URL = process.env.PHYLLO_ENV === "production"
  ? "https://api.getphyllo.com"
  : "https://api.staging.getphyllo.com"

const PHYLLO_CLIENT_ID = process.env.PHYLLO_CLIENT_ID!
const PHYLLO_SECRET = process.env.PHYLLO_SECRET!

function getPhylloAuthHeader(): string {
  const credentials = Buffer.from(`${PHYLLO_CLIENT_ID}:${PHYLLO_SECRET}`).toString("base64")
  return `Basic ${credentials}`
}

// Map platform names to Phyllo's work_platform_id values
const PLATFORM_IDS: Record<string, string> = {
  instagram: "9bb8913b-ddd9-430b-a66a-d74d846e6c66",
  tiktok: "de55aeec-0dc8-4119-bf90-16b3d1f0c987",
}

type DisconnectRequestBody = {
  platform: string
  accountId?: string
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the user via Supabase
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Parse and validate request body
    const body: DisconnectRequestBody = await request.json()
    const { platform, accountId } = body

    if (!platform || !["instagram", "tiktok"].includes(platform)) {
      return NextResponse.json(
        { error: "Invalid platform. Must be 'instagram' or 'tiktok'." },
        { status: 400 }
      )
    }

    // 3. Look up the user's phyllo_user_id from our DB
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("phyllo_user_id")
      .eq("id", user.id)
      .single()

    if (profileError || !profile?.phyllo_user_id) {
      return NextResponse.json(
        { error: "No Phyllo account found for this user." },
        { status: 404 }
      )
    }

    const phylloUserId = profile.phyllo_user_id

    // 4. Resolve the Phyllo account ID to disconnect
    let resolvedAccountId = accountId

    if (!resolvedAccountId) {
      // Look up accounts for this Phyllo user filtered by platform
      const workPlatformId = PLATFORM_IDS[platform]
      const accountsRes = await fetch(
        `${PHYLLO_BASE_URL}/v1/accounts?user_id=${phylloUserId}&work_platform_id=${workPlatformId}&limit=1`,
        {
          method: "GET",
          headers: {
            Authorization: getPhylloAuthHeader(),
            "Content-Type": "application/json",
          },
        }
      )

      if (!accountsRes.ok) {
        const errBody = await accountsRes.text()
        console.error("Phyllo accounts lookup failed:", accountsRes.status, errBody)
        return NextResponse.json(
          { error: "Failed to look up Phyllo account for this platform." },
          { status: 502 }
        )
      }

      const accountsData = await accountsRes.json()
      const accounts = accountsData.data

      if (!accounts || accounts.length === 0) {
        // No account found on Phyllo side — just update our DB
        const connectedColumn = platform === "instagram" ? "instagram_connected" : "tiktok_connected"

        await supabase
          .from("profiles")
          .update({ [connectedColumn]: false })
          .eq("id", user.id)

        return NextResponse.json({
          success: true,
          message: `No Phyllo account found for ${platform}. Marked as disconnected.`,
        })
      }

      resolvedAccountId = accounts[0].id
    }

    // 5. Call Phyllo API to disconnect (delete) the account
    const disconnectRes = await fetch(
      `${PHYLLO_BASE_URL}/v1/accounts/${resolvedAccountId}/disconnect`,
      {
        method: "POST",
        headers: {
          Authorization: getPhylloAuthHeader(),
          "Content-Type": "application/json",
        },
      }
    )

    // Phyllo returns 200 on success. Some versions may return 204.
    if (!disconnectRes.ok && disconnectRes.status !== 204) {
      const errBody = await disconnectRes.text()
      console.error("Phyllo disconnect failed:", disconnectRes.status, errBody)

      // If 404, the account was already removed on Phyllo's side — still update our DB
      if (disconnectRes.status !== 404) {
        return NextResponse.json(
          { error: "Failed to disconnect account on Phyllo." },
          { status: 502 }
        )
      }
    }

    // 6. Update our DB: set the platform's connected flag to false
    const connectedColumn = platform === "instagram" ? "instagram_connected" : "tiktok_connected"

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ [connectedColumn]: false })
      .eq("id", user.id)

    if (updateError) {
      console.error("Failed to update profile after disconnect:", updateError)
      return NextResponse.json(
        { error: "Disconnected on Phyllo but failed to update profile." },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      platform,
      message: `${platform} disconnected successfully.`,
    })
  } catch (err: any) {
    console.error("Phyllo disconnect error:", err)
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    )
  }
}
