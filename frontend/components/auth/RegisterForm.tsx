"use client"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Eye, EyeOff } from "lucide-react"
import { api } from "@/lib/api"

const schema = z.object({
  name: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "At least 8 characters"),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ["confirm"] })

type FormData = z.infer<typeof schema>

const inputCls = "w-full rounded-xl border border-warm-border bg-warm-950 px-4 py-3 text-sm text-[#1C1410] placeholder-gray-warm/60 outline-none transition-all focus:border-[#E85D04] focus:ring-2 focus:ring-[#E85D04]/10"

function strength(pw: string) {
  let s = 0
  if (pw.length >= 8) s++
  if (/[A-Z]/.test(pw)) s++
  if (/[0-9]/.test(pw)) s++
  if (/[^A-Za-z0-9]/.test(pw)) s++
  return s
}

const strColors = ["bg-red-400", "bg-amber-400", "bg-sky-400", "bg-emerald-500"]
const strLabels = ["Weak", "Fair", "Good", "Strong"]

export function RegisterForm() {
  const [error, setError] = useState("")
  const [showPw, setShowPw] = useState(false)
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })
  const pw = watch("password", "")
  const str = strength(pw)

  async function onSubmit(data: FormData) {
    setError("")
    try {
      await api.auth.register({ name: data.name, email: data.email, password: data.password })
      const loginRes = await api.auth.login({ email: data.email, password: data.password })
      sessionStorage.setItem("sentinel_email", data.email)
      sessionStorage.setItem("sentinel_partial_token", loginRes.partial_token)
      window.location.href = "/auth/verify"
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-warm">Full name</label>
        <input {...register("name")} type="text" placeholder="Your name" autoComplete="name" className={inputCls} />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-warm">Email</label>
        <input {...register("email")} type="email" placeholder="you@example.com" autoComplete="email" className={inputCls} />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-warm">Password</label>
        <div className="relative">
          <input {...register("password")} type={showPw ? "text" : "password"} placeholder="••••••••" autoComplete="new-password" className={`${inputCls} pr-11`} />
          <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-warm hover:text-[#1C1410] transition-colors">
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {pw && (
          <div className="mt-2">
            <div className="flex gap-1 mb-1">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < str ? strColors[str - 1] : "bg-warm-600"}`} />
              ))}
            </div>
            <p className="text-xs text-gray-warm">{pw ? strLabels[str - 1] ?? "" : ""}</p>
          </div>
        )}
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-warm">Confirm password</label>
        <input {...register("confirm")} type="password" placeholder="••••••••" autoComplete="new-password" className={inputCls} />
        {errors.confirm && <p className="mt-1 text-xs text-red-600">{errors.confirm.message}</p>}
      </div>
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      <button type="submit" disabled={isSubmitting}
        className="w-full rounded-full bg-gradient-to-r from-[#E85D04] to-[#C2410C] py-3.5 text-sm font-semibold text-white shadow-glow transition-all hover:shadow-glow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0">
        {isSubmitting ? "Creating account…" : "Create account"}
      </button>
    </form>
  )
}
