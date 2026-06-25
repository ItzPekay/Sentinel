import { NextRequest } from "next/server"

const BACKEND =
  process.env.NEXT_INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8001"

async function proxy(req: NextRequest, path: string[]) {
  const targetPath = path.filter(Boolean).join("/")
  const url = `${BACKEND}/${targetPath}${req.nextUrl.search}`

  const headers = new Headers()
  const auth = req.headers.get("authorization")
  if (auth) headers.set("Authorization", auth)
  const contentType = req.headers.get("content-type")
  if (contentType) headers.set("Content-Type", contentType)

  let body: BodyInit | undefined
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.blob()
  }

  try {
    const res = await fetch(url, { method: req.method, headers, body })
    const resHeaders = new Headers()
    const ct = res.headers.get("content-type")
    if (ct) resHeaders.set("Content-Type", ct)
    return new Response(res.body, { status: res.status, headers: resHeaders })
  } catch (error) {
    return Response.json(
      {
        detail: "Backend unreachable",
        backend: BACKEND,
        error: error instanceof Error ? error.message : "Unknown proxy error",
      },
      { status: 503 },
    )
  }
}

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path)
}
export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path)
}
export async function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path)
}
export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path)
}
