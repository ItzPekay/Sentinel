import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get("sentinel_token")?.value
  if (!token) return NextResponse.json({ error: "No token" }, { status: 401 })
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString())
    return NextResponse.json({ user_id: payload.user_id, email: payload.email, name: payload.name })
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}
