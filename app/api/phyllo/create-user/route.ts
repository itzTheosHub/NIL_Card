import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"
import { getPhylloBaseUrl, getPhylloAuthHeader } from "@/lib/phyllo"

export async function POST(request: NextRequest) {
  const supabase = await createClient()

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
    .maybeSingle()

  if (profileError) {
    return NextResponse.json(
      { error: "Failed to look up profile." },
      { status: 500 }
    )
  }

  // If already has a phyllo_user_id, return it (idempotent)
  if (profile?.phyllo_user_id) {
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
        name: `user-${user.id}`,
        external_id: user.id,
      }),
    })

    if (!phylloResponse.ok) {
      const errorBody = await phylloResponse.text()
      console.error("Phyllo create-user error:", phylloResponse.status, errorBody)

      // If user already exists in Phyllo, fetch them by external_id instead
      let parsedError: any = {}
      try { parsedError = JSON.parse(errorBody) } catch {}
      const errorCode = parsedError?.error?.code ?? parsedError?.error?.error_code ?? ""

      if (errorCode === "user_exists_with_external_id") {
        const lookupRes = await fetch(
          `${phylloBaseUrl}/v1/users?external_id=${user.id}`,
          { headers: { Authorization: authHeader, "Content-Type": "application/json" } }
        )
        if (lookupRes.ok) {
          const lookupData = await lookupRes.json()
          const existingId: string = lookupData?.data?.[0]?.id
          if (existingId) {
            if (profile !== null) {
              await supabase.from("profiles").update({ phyllo_user_id: existingId }).eq("id", user.id)
            }
            return NextResponse.json({ phyllo_user_id: existingId, existing: true })
          }
        }
      }

      return NextResponse.json(
        { error: "Failed to create Phyllo user", detail: errorBody },
        { status: phylloResponse.status }
      )
    }

    const phylloData = await phylloResponse.json()
    const phylloUserId: string = phylloData.id

    // 4. If profile exists, save phyllo_user_id — skip if no profile yet
    if (profile !== null) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ phyllo_user_id: phylloUserId })
        .eq("id", user.id)

      if (updateError) {
        console.error("Failed to save phyllo_user_id:", updateError)
      }
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
