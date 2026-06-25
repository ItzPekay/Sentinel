"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { api } from "@/lib/api"
import type { BloodSugarResponse } from "@/lib/types"
import { GlucoseGauge } from "@/components/charts/GlucoseGauge"
import { GlucoseIllustration } from "@/components/illustrations/GlucoseIllustration"
import { clsx } from "clsx"

const ZONES = [
  { label: "Critical Low", min: 20, max: 54, color: "#DC2626", bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  { label: "Low", min: 55, max: 69, color: "#D97706", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  { label: "Normal", min: 70, max: 99, color: "#059669", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  { label: "High", min: 100, max: 249, color: "#7C3AED", bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  { label: "Critical High", min: 250, max: 600, color: "#DC2626", bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
]

function getZone(v: number) {
  return ZONES.find((z) => v >= z.min && v <= z.max) ?? ZONES[2]
}

export default function BloodSugarPage() {
  const [glucoseVal, setGlucoseVal] = useState(100)
  const [result, setResult] = useState<BloodSugarResponse | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState("")

  const zone = getZone(glucoseVal)
  const pct = ((glucoseVal - 20) / (600 - 20)) * 100

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true); setErr("")
    try {
      const res = await api.speech.submitBloodSugar(glucoseVal)
      setResult(res)
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Submission failed")
    } finally { setSubmitting(false) }
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-playfair text-4xl font-bold text-[#1C1410]">Log Glucose</h1>
          <p className="mt-1 text-gray-warm">Enter your blood sugar reading for a clinical AI assessment</p>
        </div>
        <GlucoseIllustration size={64} className="hidden md:block opacity-80 flex-shrink-0 ml-4" />
      </div>

      <AnimatePresence mode="wait">
        {result ? (
          <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className={clsx("rounded-card-lg p-6 border",
              result.emergency_alert_dispatched ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"
            )}>
              <div className="flex items-center gap-3 mb-4">
                <div>
                  <span className="font-mono text-5xl font-bold text-[#1C1410]">{result.logged_value}</span>
                  <span className="text-sm text-gray-warm ml-1">mg/dL</span>
                </div>
              </div>
              {result.emergency_alert_dispatched && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-100 px-4 py-2.5 mb-4">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-live" />
                  <p className="text-sm font-semibold text-red-700">Emergency contact has been alerted</p>
                </div>
              )}
              <p className="text-sm leading-relaxed text-[#1C1410]">{result.medical_assessment}</p>
            </div>
            <button onClick={() => setResult(null)}
              className="rounded-full border border-warm-border bg-white px-6 py-2.5 text-sm font-medium text-gray-warm hover:border-[#7C3AED]/40 hover:text-[#1C1410] transition-all">
              ← Log another reading
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={onSubmit} className="space-y-6">
            {/* Gauge card */}
            <div className="rounded-card-lg bg-white border-glow-electric shadow-elevated relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(circle at center, ${zone.color}05 0%, transparent 65%)` }} />
              <div className="p-6 text-center relative z-10">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-warm mb-4">Blood Glucose Reading</p>
                {/* Gauge */}
                <div className="flex justify-center mb-2">
                  <GlucoseGauge value={glucoseVal} />
                </div>
              </div>

              {/* Slider */}
              <div className="px-6 pb-6 space-y-3">
                <input
                  type="range" min={20} max={600} value={glucoseVal}
                  onChange={(e) => setGlucoseVal(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none"
                  style={{
                    background: `linear-gradient(to right, ${zone.color} 0%, ${zone.color} ${pct}%, #E8DDD5 ${pct}%, #E8DDD5 100%)`,
                    accentColor: zone.color,
                  }}
                />
                {/* Zone scale */}
                <div className="relative h-6 w-full">
                  {ZONES.map((z, i) => {
                    const leftPct = ((z.min - 20) / 580) * 100
                    const widthPct = ((z.max - z.min) / 580) * 100
                    const isActive = z.label === zone.label
                    return (
                      <motion.div key={i} className="absolute top-0 text-center"
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                        animate={{ scale: isActive ? 1.05 : 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="h-1 w-full rounded-sm mb-1" style={{ background: z.color, opacity: isActive ? 0.8 : 0.28 }} />
                        <p className="text-[8px] font-semibold" style={{ color: z.color, opacity: isActive ? 1 : 0.6 }}>{z.label}</p>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Zone reference strip */}
            <div className="flex gap-1.5 flex-wrap">
              {ZONES.map((z) => {
                const isActive = z.label === zone.label
                return (
                  <motion.div
                    key={z.label}
                    animate={{ scale: isActive ? 1.04 : 1 }}
                    transition={{ duration: 0.15 }}
                    className={clsx(
                      "rounded-full px-3 py-1 text-[10px] font-semibold border transition-all",
                      isActive ? `${z.bg} ${z.text} ${z.border} shadow-sm` : "bg-white border-warm-border text-gray-warm"
                    )}
                  >
                    {z.label} {z.min}–{z.max === 600 ? "600+" : z.max}
                  </motion.div>
                )
              })}
            </div>

            {/* Manual input */}
            <div className="flex items-center gap-3 rounded-card bg-white border border-warm-border px-4 py-3 shadow-card">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-warm shrink-0">Or type a value:</label>
              <input
                type="number" min={20} max={600} value={glucoseVal}
                onChange={(e) => setGlucoseVal(Math.max(20, Math.min(600, Number(e.target.value))))}
                className="flex-1 bg-transparent text-center font-mono text-lg font-bold text-[#1C1410] outline-none"
              />
              <span className="text-xs text-gray-warm shrink-0">mg/dL</span>
            </div>

            {err && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-700">{err}</p>
              </div>
            )}

            <button type="submit" disabled={submitting || glucoseVal < 20 || glucoseVal > 600}
              className="group relative overflow-hidden w-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] py-4 text-sm font-semibold text-white shadow-glow-violet transition-all hover:shadow-glow-violet hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0">
              <span className="relative z-10">{submitting ? "Getting AI assessment…" : "Get clinical assessment"}</span>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}
