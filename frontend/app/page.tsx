"use client"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { HeroIllustration } from "@/components/illustrations/HeroIllustration"

const MODULES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
    label: "Speech Analysis", value: "14", unit: "risk score",
    status: "Non Stroke", statusColor: "#059669", statusBg: "#ECFDF5", statusBorder: "#A7F3D0",
    color: "#E85D04", bg: "#FFF7ED",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82V15.18a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    label: "Camera Feed", value: "—", unit: "live",
    status: "Clear", statusColor: "#059669", statusBg: "#ECFDF5", statusBorder: "#A7F3D0",
    color: "#0EA5E9", bg: "#F0F9FF",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
      </svg>
    ),
    label: "Blood Glucose", value: "94", unit: "mg/dL",
    status: "Normal", statusColor: "#059669", statusBg: "#ECFDF5", statusBorder: "#A7F3D0",
    color: "#7C3AED", bg: "#F5F3FF",
  },
]

const STEPS = [
  {
    num: "01",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    title: "Create your account",
    desc: "Sign up in under a minute. Add your emergency contact — that's the person we'll reach if something looks wrong.",
  },
  {
    num: "02",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    title: "Run your daily checks",
    desc: "Say a short phrase to test your speech. Let the camera scan for facial changes. Log a glucose reading.",
  },
  {
    num: "03",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    title: "We alert the right people",
    desc: "If Sentinel spots something serious, it emails your emergency contact instantly — with a full report.",
  },
]

const FEATURES = [
  {
    color: "#E85D04", bg: "#FFF7ED", border: "#FDBA74",
    illustration: (
      <svg viewBox="0 0 56 56" fill="none" className="h-full w-full">
        <defs>
          <radialGradient id="f1g" cx="50%" cy="40%"><stop offset="0%" stopColor="#FDE8D8" stopOpacity="0.9" /><stop offset="100%" stopColor="#FDBA74" stopOpacity="0.3" /></radialGradient>
        </defs>
        <ellipse cx="28" cy="32" rx="14" ry="18" fill="url(#f1g)" stroke="#E85D04" strokeWidth="0.8" strokeOpacity="0.4" />
        <path d="M 28,14 C 28,14 18,24 18,32 C 18,38 22,42 28,42 C 34,42 38,38 38,32 C 38,24 28,14 28,14 Z" fill="#E85D04" fillOpacity="0.08" />
        <path d="M 12,32 L 16,28 L 18,34 L 20,24 L 22,38 L 24,30 L 26,34 L 28,32 L 44,32" stroke="#E85D04" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="8" cy="32" r="2.5" fill="#E85D04" fillOpacity="0.7" />
        <circle cx="48" cy="32" r="2.5" fill="#E85D04" fillOpacity="0.7" />
      </svg>
    ),
    title: "Speech Analysis",
    desc: "Say one phrase. Sentinel transcribes it and scores it against a reference in under 2 seconds — slurring is one of the earliest stroke signs.",
  },
  {
    color: "#0EA5E9", bg: "#F0F9FF", border: "#BAE6FD",
    illustration: (
      <svg viewBox="0 0 56 56" fill="none" className="h-full w-full">
        <defs>
          <radialGradient id="f2g" cx="50%" cy="50%"><stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.8" /><stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.1" /></radialGradient>
        </defs>
        <ellipse cx="28" cy="28" rx="16" ry="20" fill="url(#f2g)" stroke="#0EA5E9" strokeWidth="0.8" strokeOpacity="0.4" />
        <circle cx="28" cy="28" r="8" fill="#0EA5E9" fillOpacity="0.12" stroke="#0EA5E9" strokeWidth="1" strokeOpacity="0.5" />
        <circle cx="28" cy="28" r="3.5" fill="#0EA5E9" fillOpacity="0.8" />
        <line x1="8" y1="8" x2="18" y2="18" stroke="#0EA5E9" strokeWidth="0.8" strokeOpacity="0.35" strokeLinecap="round" />
        <line x1="48" y1="8" x2="38" y2="18" stroke="#0EA5E9" strokeWidth="0.8" strokeOpacity="0.35" strokeLinecap="round" />
        <line x1="8" y1="48" x2="18" y2="38" stroke="#0EA5E9" strokeWidth="0.8" strokeOpacity="0.35" strokeLinecap="round" />
        <line x1="48" y1="48" x2="38" y2="38" stroke="#0EA5E9" strokeWidth="0.8" strokeOpacity="0.35" strokeLinecap="round" />
        <path d="M 8,8 L 18,8 M 8,8 L 8,18" stroke="#0EA5E9" strokeWidth="1.5" strokeOpacity="0.7" strokeLinecap="round" />
        <path d="M 48,8 L 38,8 M 48,8 L 48,18" stroke="#0EA5E9" strokeWidth="1.5" strokeOpacity="0.7" strokeLinecap="round" />
      </svg>
    ),
    title: "Camera Detection",
    desc: "A YOLOv8 model watches your Raspberry Pi camera feed for facial asymmetry and drooping — classic visual stroke signs that a person might miss.",
  },
  {
    color: "#7C3AED", bg: "#F5F3FF", border: "#C4B5FD",
    illustration: (
      <svg viewBox="0 0 56 56" fill="none" className="h-full w-full">
        <defs>
          <radialGradient id="f3g" cx="45%" cy="35%"><stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.6" /><stop offset="100%" stopColor="#7C3AED" stopOpacity="0.15" /></radialGradient>
        </defs>
        <path d="M 28,6 C 28,6 12,26 12,38 C 12,48 19,52 28,52 C 37,52 44,48 44,38 C 44,26 28,6 28,6 Z" fill="url(#f3g)" stroke="#7C3AED" strokeWidth="0.9" strokeOpacity="0.4" />
        <polygon points="28,28 34,32 34,40 28,44 22,40 22,32" stroke="#7C3AED" strokeWidth="0.8" strokeOpacity="0.5" fill="#7C3AED" fillOpacity="0.06" />
        <circle cx="28" cy="28" r="2.5" fill="#7C3AED" fillOpacity="0.75" />
        <circle cx="34" cy="32" r="1.8" fill="#7C3AED" fillOpacity="0.55" />
        <circle cx="34" cy="40" r="1.8" fill="#7C3AED" fillOpacity="0.55" />
        <circle cx="22" cy="32" r="1.8" fill="#7C3AED" fillOpacity="0.55" />
        <circle cx="22" cy="40" r="1.8" fill="#7C3AED" fillOpacity="0.55" />
      </svg>
    ),
    title: "Blood Glucose",
    desc: "Low glucose mimics stroke symptoms. Sentinel runs a clinical-grade assessment across 10 ranges and alerts your emergency contact if levels are dangerous.",
  },
]

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { ease: [0.0, 0.0, 0.2, 1] as [number, number, number, number], duration: 0.5 } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? "show" : "hidden"} className={className}>
      {children}
    </motion.div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FDFAF6] overflow-x-hidden">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#EDE5D8]" style={{ background: "rgba(253,250,246,0.94)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <motion.div
              className="h-8 w-8 rounded-xl bg-[#E85D04] flex items-center justify-center"
              whileHover={{ scale: 1.08 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="currentColor">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </motion.div>
            <span className="font-playfair text-[17px] font-bold text-[#1C1410] tracking-tight">Sentinel</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-[#57534E] hover:text-[#1C1410] transition-colors rounded-lg hover:bg-[#F5EDE0]">
              Sign in
            </Link>
            <Link href="/auth/register" className="group relative overflow-hidden px-5 py-2 text-sm font-semibold text-white bg-[#E85D04] rounded-full hover:bg-[#C2410C] transition-colors">
              <span className="relative z-10">Get started →</span>
              <span className="absolute inset-0 -z-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-24 pb-0">
        <div className="mx-auto max-w-6xl px-6">
          <div className="pt-16 flex flex-col lg:flex-row items-center gap-8 lg:gap-0">

            {/* Left: headline + CTA */}
            <div className="flex-1 lg:pr-8">
              {/* Badge */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.0, 0.0, 0.2, 1] }} className="mb-8 flex lg:justify-start justify-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#FFF7ED] border border-[#FDBA74] px-4 py-1.5 text-xs font-semibold text-[#C2410C]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E85D04] animate-dot-pulse" />
                  AI-powered stroke monitoring
                </span>
              </motion.div>

              {/* Headline */}
              <div className="text-center lg:text-left max-w-xl">
                <motion.h1
                  className="font-playfair text-5xl md:text-6xl font-bold leading-[1.05] text-[#1C1410]"
                  initial="hidden"
                  animate="show"
                  variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
                >
                  {["Protecting the people", ""].map((line, i) => (
                    <motion.span key={i} variants={fadeUp} className="block">
                      {i === 0 ? line : (
                        <span className="relative inline-block">
                          <span className="relative z-10" style={{ background: "linear-gradient(135deg, #E85D04 0%, #C2410C 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                            you love.
                          </span>
                          <motion.span
                            className="absolute bottom-1 left-0 h-3 bg-[#FED7AA] -z-10 -rotate-1 rounded"
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ delay: 0.7, duration: 0.55, ease: [0.0, 0.0, 0.2, 1] }}
                          />
                        </span>
                      )}
                    </motion.span>
                  ))}
                </motion.h1>

                <motion.p
                  className="mt-6 text-lg leading-relaxed text-[#57534E] max-w-md lg:max-w-none"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5, ease: [0.0, 0.0, 0.2, 1] }}
                >
                  Sentinel watches over your health around the clock — listening for slurred speech,
                  watching your camera feed, and tracking blood glucose. One alert can save a life.
                </motion.p>

                <motion.div
                  className="mt-8 flex items-center gap-3 flex-wrap lg:justify-start justify-center"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.5, ease: [0.0, 0.0, 0.2, 1] }}
                >
                  <Link href="/auth/register"
                    className="group relative overflow-hidden inline-flex items-center gap-2 rounded-full bg-[#E85D04] px-8 py-3.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(232,93,4,0.35)] hover:bg-[#C2410C] hover:-translate-y-0.5 transition-all">
                    <span className="relative z-10 flex items-center gap-2">
                      Start for free
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </span>
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </Link>
                  <Link href="/auth/login"
                    className="inline-flex items-center rounded-full border border-[#EDE5D8] bg-white px-8 py-3.5 text-sm font-semibold text-[#1C1410] hover:border-[#E85D04]/40 hover:bg-[#FFF7ED] transition-all">
                    Sign in
                  </Link>
                </motion.div>

                {/* Stats */}
                <motion.div
                  className="mt-10 flex items-center gap-10 flex-wrap lg:justify-start justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  {[{ value: "< 2s", label: "Speech results" }, { value: "24 / 7", label: "Active monitoring" }, { value: "3-in-1", label: "Detection layers" }].map(({ value, label }) => (
                    <div key={label} className="text-center">
                      <p className="font-mono text-2xl font-bold text-[#E85D04]">{value}</p>
                      <p className="mt-0.5 text-xs font-medium text-[#57534E]">{label}</p>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Right: Hero illustration */}
            <motion.div
              className="hidden lg:flex flex-shrink-0 items-center justify-center"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.0, 0.0, 0.2, 1] }}
            >
              <HeroIllustration />
            </motion.div>
          </div>

          {/* Product preview */}
          <motion.div
            className="mt-14 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: [0.0, 0.0, 0.2, 1] }}
          >
            <div className="rounded-2xl border border-[#EDE5D8] bg-white shadow-[0_8px_60px_rgba(0,0,0,0.08),0_2px_12px_rgba(0,0,0,0.04)] overflow-hidden">
              {/* Chrome bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#EDE5D8] bg-[#FDFAF6]">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[#FC5F57]" />
                  <div className="h-3 w-3 rounded-full bg-[#FDBC2C]" />
                  <div className="h-3 w-3 rounded-full bg-[#2BC840]" />
                </div>
                <div className="flex-1 mx-3">
                  <div className="mx-auto max-w-[160px] rounded bg-[#EDE5D8] px-3 py-0.5 text-center text-[11px] text-[#57534E] font-mono">sentinel.app/dashboard</div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-live" />
                  Live
                </div>
              </div>
              {/* Dashboard preview */}
              <div className="p-5 space-y-3 bg-[#FDFAF6]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#57534E] mb-3">Active monitoring</p>
                {MODULES.map((m, i) => (
                  <motion.div
                    key={m.label}
                    className="flex items-center gap-4 rounded-xl bg-white border border-[#EDE5D8] px-4 py-3"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.08, duration: 0.4, ease: [0.0, 0.0, 0.2, 1] }}
                  >
                    <div className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: m.bg, color: m.color }}>{m.icon}</div>
                    <div className="flex-1 min-w-0"><p className="text-xs font-medium text-[#57534E]">{m.label}</p></div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-mono text-base font-bold" style={{ color: m.color }}>
                        {m.value}
                        {m.unit !== "live" && m.unit !== "risk score" && (<span className="text-[10px] font-normal text-[#57534E] ml-1">{m.unit}</span>)}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold" style={{ color: m.statusColor, background: m.statusBg, borderColor: m.statusBorder }}>
                        ✓ {m.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
                {/* ECG strip */}
                <div className="rounded-xl bg-white border border-[#EDE5D8] px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-semibold text-[#57534E]">Neural pattern</p>
                    <span className="text-[10px] font-mono text-[#E85D04]">72 bpm</span>
                  </div>
                  <div className="h-8 overflow-hidden relative">
                    <div className="absolute inset-0 flex animate-ecg-scroll" style={{ width: "200%" }}>
                      {[0, 1].map((i) => (
                        <svg key={i} viewBox="0 0 320 28" className="flex-none h-full" style={{ width: "50%" }} preserveAspectRatio="none">
                          <path d="M 0,14 L 40,14 L 55,14 C 62,14 66,9 70,6 C 74,3 78,6 82,14 L 86,14 L 89,18 L 94,2 L 99,24 L 104,14 L 116,14 C 124,14 130,8 135,6 C 140,4 145,8 150,14 L 320,14" stroke="#E85D04" strokeWidth="1.8" fill="none" style={{ filter: "drop-shadow(0 0 3px rgba(232,93,4,0.5))" }} />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="py-16 px-6 mt-16" style={{ background: "#FFF7ED" }}>
        <div className="mx-auto max-w-5xl">
          {/* ECG line */}
          <div className="w-full h-6 overflow-hidden opacity-30 mb-10">
            <div className="flex animate-ecg-scroll" style={{ width: "200%" }}>
              {[0, 1].map((i) => (
                <svg key={i} viewBox="0 0 640 24" className="flex-none h-full" style={{ width: "50%" }} preserveAspectRatio="none">
                  <path d="M0,12 L80,12 L90,12 C95,12 98,8 101,5 C104,2 107,5 110,12 L114,12 L116,16 L119,2 L122,22 L125,12 L140,12 L160,12 C168,12 174,6 178,4 C182,2 186,6 190,12 L320,12 L400,12 C408,12 413,7 416,4 C420,2 424,7 428,12 L430,12 L432,16 L435,2 L438,22 L440,12 L460,12 L640,12" stroke="#E85D04" strokeWidth="1.5" fill="none" />
                </svg>
              ))}
            </div>
          </div>
          <Section className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: "< 2s", label: "Speech results", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6 mx-auto mb-3 text-[#E85D04]"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg> },
              { value: "24 / 7", label: "Active monitoring", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6 mx-auto mb-3 text-[#E85D04]"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg> },
              { value: "3-in-1", label: "Detection layers", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-6 w-6 mx-auto mb-3 text-[#E85D04]"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg> },
            ].map(({ value, label, icon }) => (
              <motion.div key={label} variants={fadeUp}>
                {icon}
                <p className="font-mono text-3xl font-bold text-[#E85D04]">{value}</p>
                <p className="mt-1 text-xs font-medium text-[#57534E]">{label}</p>
              </motion.div>
            ))}
          </Section>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-5xl">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-14">
              <p className="text-xs font-bold uppercase tracking-widest text-[#E85D04] mb-3">Simple by design</p>
              <h2 className="font-playfair text-4xl font-bold text-[#1C1410]">How Sentinel works</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {STEPS.map(({ num, icon, title, desc }, i) => (
                <motion.div key={num} variants={fadeUp} className="relative group">
                  {/* Connector line (desktop) */}
                  {i < 2 && (
                    <div className="hidden md:block absolute top-8 left-[calc(100%+0px)] w-full h-px" style={{ background: "linear-gradient(90deg, #E85D04/30, transparent)", width: "calc(100% - 48px)", left: "calc(100% - 0px)" }}>
                      <div className="h-full w-full" style={{ background: "linear-gradient(90deg, rgba(232,93,4,0.2), rgba(232,93,4,0.05))" }} />
                    </div>
                  )}
                  <div className="rounded-2xl bg-white border border-[#EDE5D8] p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 relative overflow-hidden">
                    {/* Step number watermark */}
                    <div className="absolute -bottom-3 -right-2 font-mono text-8xl font-bold text-[#EDE5D8] leading-none select-none">{num}</div>
                    {/* Icon */}
                    <div className="relative z-10 mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF7ED] border border-[#FDBA74] text-[#E85D04]">
                      {icon}
                    </div>
                    <h3 className="relative z-10 font-playfair text-lg font-bold text-[#1C1410] mb-2">{title}</h3>
                    <p className="relative z-10 text-sm leading-relaxed text-[#57534E]">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-16 px-6 bg-neural-dots" style={{ background: "linear-gradient(180deg, #FFF7ED 0%, #FDFAF6 100%)" }}>
        <div className="mx-auto max-w-5xl">
          <Section>
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="font-playfair text-4xl font-bold text-[#1C1410]">Three ways to stay safe.</h2>
              <p className="mt-3 text-[#57534E] max-w-md mx-auto text-sm leading-relaxed">
                Sentinel combines three independent signals to catch stroke risk early — any one of them alone is useful, together they&apos;re powerful.
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {FEATURES.map(({ color, bg, border, illustration, title, desc }) => (
                <motion.div
                  key={title}
                  variants={fadeUp}
                  className="group rounded-2xl bg-white border p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 overflow-hidden relative"
                  style={{ borderColor: border, borderTopWidth: 3, borderTopColor: color }}
                >
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl overflow-hidden" style={{ background: bg, border: `1px solid ${border}` }}>
                    {illustration}
                  </div>
                  <h3 className="font-playfair text-lg font-bold text-[#1C1410] mb-2">{title}</h3>
                  <p className="text-sm leading-relaxed text-[#57534E]">{desc}</p>
                </motion.div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 px-6 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-[500px] w-[500px] rounded-full" style={{ background: "radial-gradient(circle, rgba(232,93,4,0.06) 0%, transparent 70%)" }} />
        </div>
        <Section>
          <motion.div variants={fadeUp} className="mx-auto max-w-xl text-center relative z-10">
            <h2 className="font-playfair text-4xl font-bold text-[#1C1410]">Set it up in 2 minutes.</h2>
            <p className="mt-4 text-[#57534E] leading-relaxed">
              Create an account, add your emergency contact, and Sentinel starts watching. No hardware required beyond your Raspberry Pi.
            </p>
            <Link href="/auth/register"
              className="group relative overflow-hidden mt-8 inline-flex items-center gap-2 rounded-full bg-[#E85D04] px-10 py-4 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(232,93,4,0.35)] hover:bg-[#C2410C] hover:-translate-y-0.5 transition-all">
              <span className="relative z-10 flex items-center gap-2">
                Start for free
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </span>
              <span className="absolute inset-0 bg-[length:200%_100%] animate-shimmer" style={{ backgroundImage: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)" }} />
            </Link>
          </motion.div>
        </Section>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#EDE5D8] py-8 px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-[#E85D04] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white" fill="currentColor">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="font-playfair font-bold text-[#1C1410] text-sm">Sentinel</span>
          </div>
          <p className="text-xs text-[#57534E]">© 2024 Sentinel · Your health data is encrypted and never sold</p>
        </div>
      </footer>
    </div>
  )
}
