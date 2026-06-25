import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { token } = await req.json()
  const cookieStore = await cookies()
  cookieStore.set("sentinel_token", token, {
    httpOnly: false,
    path: "/",
    maxAge: 3600,
    sameSite: "lax",
  })
  return NextResponse.json({ ok: true })
}
