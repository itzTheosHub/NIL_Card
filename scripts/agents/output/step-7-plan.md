# Step 7: Build /api/phyllo/disconnect route



## Step 7: Build `/api/phyllo/disconnect` route

This route allows an authenticated athlete to disconnect a specific platform (Instagram or TikTok) from their Phyllo account. It calls the Phyllo API to delete the account, then updates the `profiles` table to mark that platform as disconnected.

### Design Decisions

1. **We don't clear the stats columns** — per the PRD: "Disconnect removes the Phyllo connection for that platform (does not clear the stats already saved)". We only set `instagram_connected` / `tiktok_connected` to `false`.
2. **We need the Phyllo account ID** to call their delete endpoint. The frontend will pass this (it gets it from the SDK callbacks and/or from the `profile_social_stats` / profiles table). Alternatively, we look it up via the Phyllo API using the user's `phyllo_user_id`. I'm going with the approach of accepting an `accountId` from the frontend AND looking up the account via Phyllo's API as a fallback if no `accountId` is provided.
3. **Auth check** — we verify the user is logged in via Supabase auth before proceeding, matching the pattern used elsewhere.

---

### File 1: `app/api/phyllo/disconnect/route.ts`

```ts
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
```

---

### File 2: `lib/supabase-server.ts` (if it doesn't already exist)

Based on the existing `@/lib/supabase` import used on the client side, we need a server-side Supabase client for API routes. If you already have this file, skip it — but for completeness, here's what it should look like for Next.js App Router API routes:

```ts
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  )
}
```

---

### No new SQL migration needed

This step only *reads* `phyllo_user_id` and *updates* `instagram_connected` / `tiktok_connected` — columns that were already added in Step 1.

---

### No new npm installs needed

The `@supabase/ssr` package should already be installed. No additional dependencies are required for this route.

---

### How the frontend calls this route

For reference, here's how the `PhylloConnectSection` component (or the `usePhylloConnect` hook) would call this endpoint:

```ts
// Example usage from the frontend
const handleDisconnect = async (platform: "instagram" | "tiktok", accountId?: string) => {
  const res = await fetch("/api/phyllo/disconnect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ platform, accountId }),
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error || "Failed to disconnect")
  }

  return res.json()
}
```

---

### Summary

| Aspect | Detail |
|--------|--------|
| **Route** | `POST /api/phyllo/disconnect` |
| **Auth** | Supabase session cookie (server-side) |
| **Request body** | `{ platform: "instagram" | "tiktok", accountId?: string }` |
| **Phyllo API call** | `POST /v1/accounts/{id}/disconnect` |
| **DB update** | Sets `instagram_connected` or `tiktok_connected` to `false` |
| **Stats preserved** | Yes — follower counts, engagement rate, etc. remain untouched |
| **Error handling** | 401 (no auth), 400 (bad platform), 404 (no Phyllo user), 502 (Phyllo API fail), 500 (DB fail) |