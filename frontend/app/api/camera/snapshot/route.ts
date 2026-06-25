import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get("sentinel_token")?.value ?? ""
  const backendUrl = process.env.NEXT_INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001"
  const res = await fetch(`${backendUrl}/camera/snapshot`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })
  if (!res.ok) return new Response("No frame", { status: 503 })
  const bytes = await res.arrayBuffer()
  return new Response(bytes, {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "no-store" },
  })
}
