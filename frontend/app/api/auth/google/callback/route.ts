import { NextRequest, NextResponse } from "next/server"

const BACKEND =
  process.env.NEXT_INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8001"

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")
  const error = req.nextUrl.searchParams.get("error")

  if (!code || error) {
    return NextResponse.redirect(new URL("/auth/login?error=oauth_failed", req.url))
  }

  try {
    const callbackUrl = new URL("/auth/google/callback", BACKEND)
    callbackUrl.searchParams.set("code", code)

    const res = await fetch(callbackUrl, { redirect: "manual" })
    const location = res.headers.get("location")

    if (location) {
      return NextResponse.redirect(location)
    }

    return NextResponse.redirect(new URL("/auth/login?error=oauth_failed", req.url))
  } catch {
    return NextResponse.redirect(new URL("/auth/login?error=oauth_failed", req.url))
  }
}
