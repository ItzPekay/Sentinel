"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { api } from "@/lib/api"

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

  return (
    <div className="w-full max-w-md animate-fade-up">
      <div className="rounded-card-lg bg-white border border-warm-border p-8 shadow-elevated text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 relative w-16 h-16">
          <div className="absolute inset-0 rounded-full bg-[#E85D04]/15 blur-xl animate-glow-pulse" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#E85D04]/08 border border-[#E85D04]/20">
            <svg className="h-7 w-7 text-[#E85D04]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <h1 className="font-playfair text-3xl font-bold text-[#1C1410]">Check your email.</h1>
        <p className="mt-2 text-sm text-gray-warm">
          We sent a 6-digit code to{" "}
          <span className="font-semibold text-[#E85D04]">{email || "your email"}</span>
        </p>

        {/* OTP inputs */}
        <div className="mt-8 flex justify-center gap-2.5">
          {digits.map((d, i) => (
            <input key={i}
              ref={(el) => { refs.current[i] = el }}
              type="text" inputMode="numeric" maxLength={1} value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className="h-14 w-11 rounded-xl border-2 border-warm-border bg-warm-950 text-center font-mono text-xl font-bold text-[#E85D04] outline-none transition-all focus:border-[#E85D04] focus:ring-2 focus:ring-[#E85D04]/10 focus:scale-105"
            />
          ))}
        </div>

        {/* Timer */}
        <div className="mt-6">
          <div className="h-1 w-full rounded-full bg-warm-600 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[#E85D04] to-[#D97706] transition-all duration-1000"
              style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-sm text-gray-warm">
            {secondsLeft > 0
              ? `Code expires in ${mins}:${String(secs).padStart(2, "0")}`
              : "Code expired"}
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {submitting && (
          <p className="mt-3 text-sm text-[#E85D04] animate-pulse">Verifying your code…</p>
        )}

        {secondsLeft === 0 && (
          <Link href="/auth/login" className="mt-4 inline-block text-sm font-semibold text-[#E85D04] hover:underline">
            ← Go back and try again
          </Link>
        )}
      </div>
    </div>
  )
}
