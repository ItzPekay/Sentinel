import { LoginForm } from "@/components/auth/LoginForm"
import { GoogleButton } from "@/components/auth/GoogleButton"
import Link from "next/link"
import { Shield } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="w-full max-w-md animate-fade-up">
      <div className="relative rounded-2xl bg-white overflow-hidden border-[3px] border-[#E85D04]/40 shadow-[0_24px_64px_rgba(0,0,0,0.12)]">

        <div className="px-8 pt-8 pb-8">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#FDBA74] bg-[#FFF7ED] px-3 py-1 mb-5">
              <Shield className="h-3 w-3 text-[#E85D04]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C2410C]">Secure sign in</span>
            </div>
            <h1 className="font-playfair text-3xl font-bold text-[#1C1410]">Welcome back.</h1>
            <p className="mt-1.5 text-sm text-gray-warm">Sign in to your Sentinel account to continue.</p>
          </div>

          <div className="space-y-5">
            <LoginForm />

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-warm-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-gray-warm">or continue with</span>
              </div>
            </div>

            <GoogleButton />
          </div>

          <p className="mt-6 text-center text-xs text-gray-warm">
            No account?{" "}
            <Link href="/auth/register" className="font-semibold text-[#E85D04] hover:text-[#C2410C] transition-colors">
              Create one →
            </Link>
          </p>
        </div>

        {/* Bottom security strip */}
        <div className="border-t border-warm-border bg-[#FDFAF6] px-8 py-3 flex items-center justify-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <p className="text-[11px] text-gray-warm">256-bit encryption · 2FA protected</p>
        </div>
      </div>
    </div>
  )
}
