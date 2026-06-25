"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Mic, Camera, History, User } from "lucide-react"
import { clsx } from "clsx"

const TABS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home", color: "#E85D04" },
  { href: "/speech", icon: Mic, label: "Speech", color: "#059669" },
  { href: "/camera", icon: Camera, label: "Camera", color: "#0EA5E9" },
  { href: "/history", icon: History, label: "History", color: "#D97706" },
  { href: "/profile", icon: User, label: "Profile", color: "#7C3AED" },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-warm-border shadow-[0_-1px_0_0_#E8DDD5]">
      <div className="flex safe-area-inset-bottom">
        {TABS.map(({ href, icon: Icon, label, color }) => {
          const active = pathname.startsWith(href)
          return (
            <Link key={href} href={href}
              className={clsx(
                "flex flex-1 flex-col items-center justify-center py-3 gap-0.5 text-[10px] font-medium transition-colors",
                active ? "text-[#1C1410]" : "text-gray-warm"
              )}
            >
              <div className="relative">
                <Icon
                  className="h-5 w-5"
                  style={active ? { color } : {}}
                />
                {active && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full"
                    style={{ background: color }} />
                )}
              </div>
              <span style={active ? { color } : {}}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
