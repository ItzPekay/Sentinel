"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Mic, Camera, Droplets, History, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/hooks/useAuth"
import { RiskBadge } from "@/components/shared/RiskBadge"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { BrainIllustration } from "@/components/illustrations/BrainIllustration"
import { SpeechScoreChart } from "@/components/charts/SpeechScoreChart"
import { api } from "@/lib/api"
import type { SpeechHistoryRecord } from "@/lib/types"

const QUICK = [
  { href: "/speech", icon: Mic, label: "Analyze Speech", desc: "Check speech patterns", color: "#059669", bg: "#ECFDF5", border: "#059669" },
  { href: "/camera", icon: Camera, label: "Live Camera", desc: "View & analyze feed", color: "#0EA5E9", bg: "#F0F9FF", border: "#0EA5E9" },
  { href: "/blood-sugar", icon: Droplets, label: "Log Glucose", desc: "Submit blood reading", color: "#7C3AED", bg: "#F5F3FF", border: "#7C3AED" },
  { href: "/history", icon: History, label: "View History", desc: "All health records", color: "#D97706", bg: "#FFFBEB", border: "#D97706" },
]

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { ease: [0.0, 0.0, 0.2, 1] as [number, number, number, number], duration: 0.4 } } }

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const [history, setHistory] = useState<SpeechHistoryRecord[]>([])
  const [histLoading, setHistLoading] = useState(true)

  useEffect(() => {
    api.history.speech()
      .then(setHistory)
      .catch(() => {})
      .finally(() => setHistLoading(false))
  }, [])

  const latest = history[0]
  const firstName = user?.name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there"

  const today = new Date()
  const analysesToday = history.filter((r) => {
    const d = new Date(r.timestamp)
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear()
  }).length

  if (loading) return (
    <div className="flex justify-center items-center pt-32"><LoadingSpinner /></div>
  )

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">

      {/* Greeting */}
      <motion.div variants={item}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-warm mb-1">
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h1 className="font-playfair text-4xl font-bold text-[#1C1410]">
              {greeting()}, {firstName}.
            </h1>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-live" />
              <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">Monitoring</span>
            </div>
            <BrainIllustration size={72} className="hidden md:block opacity-70" />
          </div>
        </div>
      </motion.div>

      {/* Today's status strip */}
      {!histLoading && latest && (
        <motion.div variants={item}>
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Last Score",
                value: Math.round(latest.combined_slur_score).toString(),
                color: latest.combined_slur_score >= 70 ? "#DC2626" : latest.combined_slur_score >= 40 ? "#D97706" : "#059669",
              },
              {
                label: "Classification",
                value: latest.classification === "Non Stroke" ? "Clear" : latest.classification,
                color: latest.classification === "Stroke" ? "#DC2626" : latest.classification === "Warning" ? "#D97706" : "#059669",
              },
              {
                label: "Today",
                value: `${analysesToday} check${analysesToday !== 1 ? "s" : ""}`,
                color: "#E85D04",
              },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-card bg-white border border-warm-border px-4 py-3 shadow-card">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-warm mb-1">{label}</p>
                <p className="font-mono text-sm font-bold" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Latest analysis */}
      <motion.div variants={item}>
        {latest ? (
          <div className="rounded-card-lg bg-white border-glow-electric p-6 shadow-elevated relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#E85D04]/04 rounded-full blur-2xl -translate-y-12 translate-x-12" />
            <p className="text-xs font-bold uppercase tracking-widest text-gray-warm mb-4">Last speech analysis</p>
            <div className="flex items-center gap-6 relative z-10">
              <div className="relative">
                <span className="relative font-mono text-6xl font-bold text-[#1C1410]">
                  {Math.round(latest.combined_slur_score)}
                </span>
              </div>
              <div>
                <RiskBadge classification={latest.classification} size="lg" />
                <p className="mt-2 text-xs text-gray-warm">
                  {new Date(latest.timestamp).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
            {latest.transcribed_text && (
              <p className="mt-3 text-sm italic text-gray-warm relative z-10 truncate">&ldquo;{latest.transcribed_text}&rdquo;</p>
            )}
            {/* Sparkline */}
            {history.length >= 2 && (
              <div className="mt-4 relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-warm mb-1.5">Score trend</p>
                <SpeechScoreChart data={history} height={52} />
              </div>
            )}
          </div>
        ) : !histLoading ? (
          <div className="rounded-card-lg bg-white border border-warm-border p-6 text-center shadow-card">
            <p className="text-[#E85D04] font-semibold mb-1">No analyses yet</p>
            <p className="text-sm text-gray-warm">Head to Speech to run your first check.</p>
          </div>
        ) : null}
      </motion.div>

      {/* Quick actions */}
      <motion.div variants={item}>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-warm mb-3">Quick actions</p>
        <div className="grid grid-cols-2 gap-3">
          {QUICK.map(({ href, icon: Icon, label, desc, color, bg, border }) => (
            <Link key={href} href={href}
              className="group relative rounded-card bg-white border border-warm-border p-5 transition-all duration-200 overflow-hidden hover:-translate-y-0.5 hover:shadow-elevated"
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = `${border}40` }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "" }}
            >
              {/* Background watermark illustration */}
              <div className="absolute bottom-0 right-0 w-16 h-16 opacity-[0.035] pointer-events-none">
                <Icon className="w-full h-full" style={{ color }} />
              </div>
              <div className="relative z-10">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300"
                  style={{ background: bg, border: `1px solid ${color}25` }}>
                  <Icon className="h-5 w-5 transition-transform group-hover:scale-110" style={{ color }} />
                </div>
                <p className="font-semibold text-[#1C1410] text-sm">{label}</p>
                <p className="mt-0.5 text-xs text-gray-warm">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Emergency contact reminder */}
      {!user?.emergency_contact_email && (
        <motion.div variants={item}>
          <div className="flex items-center gap-3 rounded-card border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-700">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>
              Set your emergency contact so Sentinel can alert them instantly.{" "}
              <Link href="/profile" className="font-semibold underline hover:text-amber-900 transition-colors">Set it up →</Link>
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
