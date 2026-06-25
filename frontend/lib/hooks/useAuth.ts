"use client"
import { useEffect, useState } from "react"

interface AuthUser { user_id: string; email: string; name?: string; emergency_contact_email?: string | null }

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { setUser(data); setLoading(false) })
      .catch(() => { setUser(null); setLoading(false) })
  }, [])

  return { user, loading }
}
