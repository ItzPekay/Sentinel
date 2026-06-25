"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Mic, Camera, Droplets, History, User } from "lucide-react"
import { clsx } from "clsx"

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", color: "#E85D04" },
  { href: "/speech", icon: Mic, label: "Speech", color: "#059669" },
  { href: "/camera", icon: Camera, label: "Camera", color: "#0EA5E9" },
  { href: "/blood-sugar", icon: Droplets, label: "Blood Sugar", color: "#7C3AED" },
  { href: "/history", icon: History, label: "History", color: "#D97706" },
  { href: "/profile", icon: User, label: "Profile", color: "#E85D04" },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-60 flex-col z-20 bg-white border-r border-warm-border shadow-[1px_0_0_0_#E8DDD5]">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-warm-border">
        <div className="flex items-center gap-2.5">
          <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-[#E85D04] to-[#C2410C] flex items-center justify-center shadow-glow flex-shrink-0">
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white animate-live" />
          </div>
          <div>
            <span className="font-playfair text-lg font-bold text-[#1C1410] leading-none">Sentinel</span>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-warm leading-none mt-0.5">Stroke Predictor</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {NAV.map(({ href, icon: Icon, label, color }) => {
          const active = pathname.startsWith(href)
          return (
            <Link key={href} href={href}
              className={clsx(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                active
                  ? "text-[#1C1410]"
                  : "text-gray-warm hover:text-[#1C1410] hover:bg-warm-700"
              )}
              style={active ? {
                background: `${color}12`,
                border: `1px solid ${color}25`,
                boxShadow: `0 0 12px ${color}10`,
              } : {}}
            >
              <Icon
                className="h-4 w-4 shrink-0 transition-all duration-200"
                style={active ? { color } : {}}
              />
              <span>{label}</span>
              {active && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full animate-dot-pulse"
                  style={{ background: color }} />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-warm-border">
        <div className="flex items-center gap-2 px-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-live" />
          <p className="text-xs text-gray-warm">System active</p>
        </div>
      </div>
    </aside>
  )
}
