import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get("sentinel_token")?.value ?? ""
  const backendUrl = process.env.NEXT_INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001"

  let res: Response
  try {
    res = await fetch(`${backendUrl}/camera/stream`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
  } catch {
    return new Response("Camera unavailable", { status: 503 })
  }

  if (!res.ok || !res.body) {
    return new Response("Camera unavailable", { status: 503 })
  }

  return new Response(res.body, {
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "multipart/x-mixed-replace; boundary=frame",
      "Cache-Control": "no-cache, no-store",
      "X-Accel-Buffering": "no",
    },
  })
}
