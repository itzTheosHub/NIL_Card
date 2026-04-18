

FILE: lib/phyllo.ts
```
/**
 * Shared Phyllo API utilities.
 * All Phyllo routes import from here so credentials & base URL are centralised.
 */

export function getPhylloBaseUrl(): string {
  const url = process.env.PHYLLO_BASE_URL
  if (!url) throw new Error("Missing PHYLLO_BASE_URL env var")
  return url.replace(/\/$/, "") // strip trailing slash
}

export function getPhylloAuthHeader(): string {
  const clientId = process.env.PHYLLO_CLIENT_ID
  const secret = process.env.PHYLLO_SECRET

  if (!clientId || !secret) {
    throw new Error("Missing PHYLLO_CLIENT_ID or PHYLLO_SECRET env vars")
  }

  const encoded = Buffer.from(`${clientId}:${secret}`).toString("base64")
  return `Basic ${encoded}`
}
```

FILE: app/api/phyllo/create-user/route.ts
```
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"
import { getPhylloBaseUrl, getPhylloAuthHeader } from "@/lib/phyllo"

export async function POST(request: NextRequest) {
  const supabase = createClient()

  // 1. Authenticate the request — only logged-in users
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 2. Check if athlete already has a Phyllo user ID stored
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("phyllo_user_id")
    .eq("id", user.id)
    .single()

  if (profileError) {
    return NextResponse.json(
      { error: "Profile not found. Create a profile first." },
      { status: 404 }
    )
  }

  // If already has a phyllo_user_id, return it (idempotent)
  if (profile.phyllo_user_id) {
    return NextResponse.json({
      phyllo_user_id: profile.phyllo_user_id,
      existing: true,
    })
  }

  // 3. Create a new user in Phyllo
  try {
    const phylloBaseUrl = getPhylloBaseUrl()
    const authHeader = getPhylloAuthHeader()

    const phylloResponse = await fetch(`${phylloBaseUrl}/v1/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        name: user.email ?? `user-${user.id}`,
        external_id: user.id,
        work_platform_ids: [
          "9bb8913b-ddd9-430b-a66a-d74d846e6c66", // Instagram
          "de55aeec-0dc8-4119-bf90-16b3d1f0c987", // TikTok
        ],
      }),
    })

    if (!phylloResponse.ok) {
      const errorBody = await phylloResponse.text()
      console.error("Phyllo create-user error:", phylloResponse.status, errorBody)
      return NextResponse.json(
        { error: "Failed to create Phyllo user", detail: errorBody },
        { status: phylloResponse.status }
      )
    }

    const phylloData = await phylloResponse.json()
    const phylloUserId: string = phylloData.id

    // 4. Store phyllo_user_id in the profiles table
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ phyllo_user_id: phylloUserId })
      .eq("id", user.id)

    if (updateError) {
      console.error("Failed to save phyllo_user_id:", updateError)
      // Still return the ID — the Phyllo user was created successfully.
      // The frontend can retry the save, or the webhook flow will still work.
      return NextResponse.json({
        phyllo_user_id: phylloUserId,
        existing: false,
        warning: "Phyllo user created but failed to save to profile",
      })
    }

    return NextResponse.json({
      phyllo_user_id: phylloUserId,
      existing: false,
    })
  } catch (err: any) {
    console.error("Phyllo create-user exception:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

NOTES:

1. **Environment variables** — Add these to `.env.local` (and Vercel dashboard for deployment):
   ```
   PHYLLO_CLIENT_ID=your_phyllo_client_id
   PHYLLO_SECRET=your_phyllo_secret
   PHYLLO_BASE_URL=https://api.staging.getphyllo.com
   ```
   Switch `PHYLLO_BASE_URL` to `https://api.getphyllo.com` for production.

2. **SQL migration** — If not already run from Step 1, execute this in the Supabase SQL Editor or save as `supabase/migrations/20250101000001_add_phyllo_user_id.sql`:
   ```sql
   ALTER TABLE profiles
     ADD COLUMN IF NOT EXISTS phyllo_user_id text;
   ```

3. **No npm installs needed** — This route uses only `fetch` (built into Node 18+/Next.js), `NextRequest`/`NextResponse`, and the existing Supabase client from `@/lib/supabase`.