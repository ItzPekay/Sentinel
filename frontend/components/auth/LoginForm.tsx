"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { api } from "@/lib/api"

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Required"),
})
type FormData = z.infer<typeof schema>

export function LoginForm() {
  const [error, setError] = useState("")
  const [showPw, setShowPw] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError("")
    try {
      const res = await api.auth.login(data)
      sessionStorage.setItem("sentinel_email", data.email)
      sessionStorage.setItem("sentinel_partial_token", res.partial_token)
      window.location.href = "/auth/verify"
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Email */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-warm">Email</label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-warm/70 pointer-events-none" />
          <input
            {...register("email")}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full rounded-xl border-2 border-warm-border bg-[#FDFAF6] pl-10 pr-4 py-3 text-sm text-[#1C1410] placeholder-gray-warm/50 outline-none transition-all focus:border-[#E85D04] focus:bg-white focus:ring-4 focus:ring-[#E85D04]/08"
          />
        </div>
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-warm">Password</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-warm/70 pointer-events-none" />
          <input
            {...register("password")}
            type={showPw ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            className="w-full rounded-xl border-2 border-warm-border bg-[#FDFAF6] pl-10 pr-11 py-3 text-sm text-[#1C1410] placeholder-gray-warm/50 outline-none transition-all focus:border-[#E85D04] focus:bg-white focus:ring-4 focus:ring-[#E85D04]/08"
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-warm hover:text-[#1C1410] transition-colors"
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="group relative w-full overflow-hidden rounded-full bg-gradient-to-r from-[#E85D04] to-[#C2410C] py-3.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(232,93,4,0.35)] transition-all hover:shadow-[0_6px_20px_rgba(232,93,4,0.45)] hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
      >
        <span className="relative z-10">{isSubmitting ? "Signing in…" : "Sign in"}</span>
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </button>
    </form>
  )
}
