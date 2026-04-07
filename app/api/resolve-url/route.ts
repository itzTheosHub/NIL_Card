import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get("url")

    if (!url) return NextResponse.json({ error: "No URL provided" }, { status: 400 })

    try {
        let response = await fetch(url, { method: "HEAD", redirect: "follow" })
        if (!response.ok) {
            response = await fetch(url, { method: "GET", redirect: "follow" })
        }
        return NextResponse.json({ resolvedUrl: response.url })
    } catch {
        return NextResponse.json({ error: "Failed to resolve URL" }, { status: 500 })
    }
}
