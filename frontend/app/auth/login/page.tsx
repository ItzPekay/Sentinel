import { LoginForm } from "@/components/auth/LoginForm"
import { GoogleButton } from "@/components/auth/GoogleButton"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="w-full max-w-md animate-fade-up">
      <div className="rounded-card-lg bg-white border border-warm-border p-8 shadow-elevated">
        <div className="mb-8">
          <h1 className="font-playfair text-3xl font-bold text-[#1C1410]">Welcome back.</h1>
          <p className="mt-2 text-sm text-gray-warm">Sign in to your Sentinel account.</p>
        </div>

        <div className="space-y-6">
          <LoginForm />
          <div className="relative">
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
    </div>
  )
}
