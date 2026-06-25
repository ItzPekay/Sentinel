"use client"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, Suspense } from "react"

function OAuthCallbackInner() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const token = searchParams.get("token")
    if (!token) {
      router.push("/auth/login?error=oauth_failed")
      return
    }
    fetch("/api/auth/set-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).then(() => router.push("/dashboard"))
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-warm">Completing sign-in…</p>
    </div>
  )
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-warm">Loading…</p>
      </div>
    }>
      <OAuthCallbackInner />
    </Suspense>
  )
}
