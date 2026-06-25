"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff } from "lucide-react"
import { api } from "@/lib/api"

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Required"),
})
type FormData = z.infer<typeof schema>

const inputCls = "w-full rounded-xl border border-warm-border bg-warm-950 px-4 py-3 text-sm text-[#1C1410] placeholder-gray-warm/60 outline-none transition-all focus:border-[#E85D04] focus:ring-2 focus:ring-[#E85D04]/10"

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
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-warm">Email</label>
        <input {...register("email")} type="email" placeholder="you@example.com" autoComplete="email" className={inputCls} />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-warm">Password</label>
        <div className="relative">
          <input {...register("password")} type={showPw ? "text" : "password"} placeholder="••••••••" autoComplete="current-password" className={`${inputCls} pr-11`} />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-warm hover:text-[#1C1410] transition-colors">
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
      <button type="submit" disabled={isSubmitting}
        className="w-full rounded-full bg-gradient-to-r from-[#E85D04] to-[#C2410C] py-3.5 text-sm font-semibold text-white shadow-glow transition-all hover:shadow-glow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0">
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  )
}
