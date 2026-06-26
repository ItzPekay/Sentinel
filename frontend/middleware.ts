import { NextRequest, NextResponse } from "next/server"

const PUBLIC_PATHS = ["/auth/login", "/auth/register", "/auth/verify", "/auth/callback", "/"]

export function middleware(req: NextRequest) {
  const token = req.cookies.get("sentinel_token")?.value
  const { pathname } = req.nextUrl
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p) || pathname.startsWith("/api/")

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }
  if (token && (pathname === "/auth/login" || pathname === "/auth/register")) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.ico|.*\\.webp).*)"],
}
