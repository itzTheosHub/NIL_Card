

FILE: app/api/phyllo/create-token/route.ts
```
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

const PHYLLO_BASE_URL = process.env.PHYLLO_ENV === "production"
  ? "https://api.getphyllo.com"
  : "https://api.staging.getphyllo.com"

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Verify the user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Parse request body
  let body: { phyllo_user_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { phyllo_user_id } = body

  if (!phyllo_user_id) {
    return NextResponse.json(
      { error: "phyllo_user_id is required" },
      { status: 400 }
    )
  }

  // Optional: verify this phyllo_user_id actually belongs to the authenticated user
  // This prevents a user from generating tokens for someone else's Phyllo account
  const { data: profile } = await supabase
    .from("profiles")
    .select("phyllo_user_id")
    .eq("id", user.id)
    .single()

  if (profile && profile.phyllo_user_id && profile.phyllo_user_id !== phyllo_user_id) {
    return NextResponse.json(
      { error: "phyllo_user_id does not match authenticated user" },
      { status: 403 }
    )
  }

  // Build Basic auth header
  const clientId = process.env.PHYLLO_CLIENT_ID
  const secret = process.env.PHYLLO_SECRET

  if (!clientId || !secret) {
    console.error("Missing PHYLLO_CLIENT_ID or PHYLLO_SECRET env vars")
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    )
  }

  const credentials = Buffer.from(`${clientId}:${secret}`).toString("base64")

  try {
    const response = await fetch(`${PHYLLO_BASE_URL}/v1/sdk-tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({
        user_id: phyllo_user_id,
        products: [
          "IDENTITY",
          "IDENTITY.AUDIENCE",
          "ENGAGEMENT",
          "ENGAGEMENT.AUDIENCE",
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Phyllo SDK token error:", response.status, errorData)
      return NextResponse.json(
        { error: "Failed to create SDK token", details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Phyllo returns { sdk_token: string, expires_at: string }
    return NextResponse.json({
      sdk_token: data.sdk_token,
      expires_at: data.expires_at,
    })
  } catch (error) {
    console.error("Phyllo SDK token request failed:", error)
    return NextResponse.json(
      { error: "Failed to connect to Phyllo" },
      { status: 500 }
    )
  }
}
```

FILE: lib/supabase-server.ts
```
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

NOTES:

1. **npm install** — Ensure `@supabase/ssr` is installed:
   ```bash
   npm install @supabase/ssr
   ```

2. **Environment variables** — Confirm these are set in `.env.local` (should already exist from Steps 2–3):
   ```
   PHYLLO_CLIENT_ID=your_phyllo_client_id
   PHYLLO_SECRET=your_phyllo_secret
   PHYLLO_ENV=staging
   ```
   Set `PHYLLO_ENV=production` when deploying to prod.

3. **No SQL migrations** are needed for this step — the `phyllo_user_id` column was added in Step 1.

4. **`lib/supabase-server.ts`** — If this file already exists in your project (possibly at a different path), skip creating it and update the import in the route file to match your existing path.