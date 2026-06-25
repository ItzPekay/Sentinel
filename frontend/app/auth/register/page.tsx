import { RegisterForm } from "@/components/auth/RegisterForm"
import { GoogleButton } from "@/components/auth/GoogleButton"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md animate-fade-up">
      <div className="rounded-card-lg bg-white border border-warm-border p-8 shadow-elevated">
        <div className="mb-8">
          <h1 className="font-playfair text-3xl font-bold text-[#1C1410]">Create your account.</h1>
          <p className="mt-2 text-sm text-gray-warm">Start protecting your health in under 2 minutes.</p>
        </div>
        <div className="space-y-6">
          <GoogleButton />
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-warm-border" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-warm">or register with email</span></div>
          </div>
          <RegisterForm />
        </div>
        <p className="mt-6 text-center text-xs text-gray-warm">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-[#E85D04] hover:text-[#C2410C] transition-colors">Sign in →</Link>
        </p>
      </div>
    </div>
  )
}
