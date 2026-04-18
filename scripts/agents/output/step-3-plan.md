# Step 3: Build /api/phyllo/create-user route



# Step 3: Build `/api/phyllo/create-user` API Route

## Design Decisions

1. **Authentication required** — Only logged-in athletes can create a Phyllo user. We verify the session via Supabase auth.
2. **Idempotent** — If the athlete already has a `phyllo_user_id` stored in their profile, we return it instead of creating a duplicate. This matches the PRD's "Creates or retrieves a Phyllo user for the athlete" description.
3. **Phyllo API base URL** — We use an env var `PHYLLO_BASE_URL` so we can toggle between staging (`https://api.staging.getphyllo.com`) and production (`https://api.getphyllo.com`) without code changes. This addresses the open question in the PRD.
4. **Auth to Phyllo** — Phyllo's API uses Basic Auth with `PHYLLO_CLIENT_ID:PHYLLO_SECRET` base64-encoded, per their docs.
5. **External ID** — We use the Supabase user ID as Phyllo's `external_id` so there's a 1:1 mapping.

---

## 1. Environment Variables

Add these to `.env.local` (and to Vercel dashboard):

```env
PHYLLO_CLIENT_ID=your_phyllo_client_id
PHYLLO_SECRET=your_phyllo_secret
PHYLLO_BASE_URL=https://api.staging.getphyllo.com
```

> Switch `PHYLLO_BASE_URL` to `https://api.getphyllo.com` for production.

---

## 2. Phyllo API Helper

Create a shared helper so all Phyllo routes use the same auth/base URL logic.

### File: `lib/phyllo.ts`

```ts
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

---

## 3. API Route

### File: `app/api/phyllo/create-user/route.ts`

```ts
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

---

## 4. Supabase Migration (if not already run from Step 1)

The `phyllo_user_id` column must exist on the `profiles` table. If you haven't run the Step 1 migration yet, here's the minimal SQL needed for this route to work:

```sql
-- Migration: add phyllo_user_id to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phyllo_user_id text;
```

Run this in the Supabase SQL Editor or as a migration file at `supabase/migrations/20250101000001_add_phyllo_user_id.sql`.

---

## 5. No npm installs needed

This route only uses `fetch` (built into Node 18+/Next.js), `NextRequest`/`NextResponse`, and the existing Supabase client. No new packages required.

---

## Summary of files

| Action | File Path |
|--------|-----------|
| **Create** | `lib/phyllo.ts` |
| **Create** | `app/api/phyllo/create-user/route.ts` |
| **Run (if needed)** | SQL migration to add `phyllo_user_id` column |

### How the frontend will call this (preview for Step 5)

```ts
const res = await fetch("/api/phyllo/create-user", { method: "POST" })
const { phyllo_user_id } = await res.json()
// Then pass phyllo_user_id to /api/phyllo/create-token in the next step
```