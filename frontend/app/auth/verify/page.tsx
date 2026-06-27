"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { api } from "@/lib/api"
import { Mail } from "lucide-react"

export default function VerifyPage() {
  const [digits, setDigits] = useState(["", "", "", "", "", ""])
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(600)
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const email = typeof window !== "undefined" ? sessionStorage.getItem("sentinel_email") ?? "" : ""

  useEffect(() => {
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [])

  const submit = useCallback(async (code: string) => {
    const partial_token = sessionStorage.getItem("sentinel_partial_token") ?? ""
    if (!partial_token) { setError("Session expired. Please log in again."); return }
    setSubmitting(true); setError("")
    try {
      const res = await api.auth.verifyOtp({ partial_token, otp_code: code })
      await fetch("/api/auth/set-token", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: res.access_token }) })
      window.location.href = "/dashboard"
    } catch {
      setError("Invalid or expired code. Please try again.")
      setSubmitting(false)
    }
  }, [])

  function handleChange(i: number, val: string) {
    const ch = val.replace(/\D/g, "").slice(-1)
    const next = [...digits]; next[i] = ch; setDigits(next)
    if (ch && i < 5) refs.current[i + 1]?.focus()
    if (next.every(Boolean)) submit(next.join(""))
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus()
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (pasted.length === 6) {
      setDigits(pasted.split("")); refs.current[5]?.focus()
      submit(pasted)
    }
    e.preventDefault()
  }

  const mins = Math.floor(secondsLeft / 60)
  const secs = secondsLeft % 60
  const progress = (secondsLeft / 600) * 100
  const isExpired = secondsLeft === 0

  return (
    <div className="w-full max-w-md animate-fade-up">
      <div className="relative rounded-2xl bg-white overflow-hidden border-[3px] border-[#E85D04]/40 shadow-[0_24px_64px_rgba(0,0,0,0.12)]">

        <div className="px-8 pt-8 pb-8 text-center">
          {/* Icon */}
          <div className="mx-auto mb-6 relative inline-flex">
            <div className="absolute inset-0 rounded-full bg-[#E85D04]/20 blur-xl" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFF7ED] to-[#FEF3C7] border border-[#FDBA74] shadow-sm">
              <Mail className="h-7 w-7 text-[#E85D04]" />
            </div>
          </div>

          <h1 className="font-playfair text-3xl font-bold text-[#1C1410]">Check your email.</h1>
          <p className="mt-2 text-sm text-gray-warm leading-relaxed">
            We sent a 6-digit code to{" "}
            <span className="font-semibold text-[#1C1410]">{email || "your email"}</span>
          </p>

          {/* OTP inputs */}
          <div className="mt-8 flex justify-center gap-2">
            {digits.map((d, i) => (
              <input key={i}
                ref={(el) => { refs.current[i] = el }}
                type="text" inputMode="numeric" maxLength={1} value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className="h-14 w-11 rounded-xl border-[3px] border-warm-border bg-[#FDFAF6] text-center font-mono text-xl font-bold text-[#E85D04] outline-none transition-all focus:border-[#E85D04] focus:bg-white focus:ring-4 focus:ring-[#E85D04]/10 focus:scale-105"
                style={{ borderColor: d ? "#E85D04" : undefined }}
              />
            ))}
          </div>

          {/* Timer bar */}
          <div className="mt-7 space-y-2">
            <div className="h-1.5 w-full rounded-full bg-warm-600 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${progress}%`,
                  background: progress > 50 ? "linear-gradient(90deg,#E85D04,#D97706)" : progress > 20 ? "linear-gradient(90deg,#D97706,#FBBF24)" : "linear-gradient(90deg,#DC2626,#EF4444)"
                }}
              />
            </div>
            <p className="text-xs text-gray-warm">
              {isExpired ? "Code expired" : `Expires in ${mins}:${String(secs).padStart(2, "0")}`}
            </p>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {submitting && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-warm-border border-t-[#E85D04]" />
              <p className="text-sm text-[#E85D04]">Verifying…</p>
            </div>
          )}

          {isExpired && (
            <Link href="/auth/login" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#E85D04] hover:text-[#C2410C] transition-colors">
              ← Back to sign in
            </Link>
          )}
        </div>

        {/* Bottom strip */}
        <div className="border-t border-warm-border bg-[#FDFAF6] px-8 py-3 flex items-center justify-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <p className="text-[11px] text-gray-warm">Didn&apos;t get it? Check your spam folder</p>
        </div>
      </div>
    </div>
  )
}
