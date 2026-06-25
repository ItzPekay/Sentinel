"use client"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { api } from "@/lib/api"
import { RiskBadge } from "@/components/shared/RiskBadge"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { EmptyState } from "@/components/shared/EmptyState"
import { SpeechScoreChart } from "@/components/charts/SpeechScoreChart"
import type { SpeechHistoryRecord, BloodSugarRecord, VoiceCommandRecord, Classification } from "@/lib/types"
import { clsx } from "clsx"

type FilterType = "all" | "speech" | "glucose" | "commands"
type AnyRecord = { id: string; _type: string; _date: string; [k: string]: unknown }

function formatDate(d: string) {
  return new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
}

const TYPE_CONFIG = {
  speech: { label: "Speech", color: "#059669", dot: "bg-emerald-500" },
  glucose: { label: "Glucose", color: "#7C3AED", dot: "bg-violet-500" },
  command: { label: "Command", color: "#D97706", dot: "bg-amber-500" },
}

const TABS: { key: FilterType; label: string; color: string }[] = [
  { key: "all", label: "All", color: "#E85D04" },
  { key: "speech", label: "Speech", color: "#059669" },
  { key: "glucose", label: "Glucose", color: "#7C3AED" },
  { key: "commands", label: "Commands", color: "#D97706" },
]

function MiniSparkline({ score }: { score: number }) {
  const color = score >= 70 ? "#DC2626" : score >= 40 ? "#D97706" : "#059669"
  const h = Math.max(4, Math.round((score / 100) * 20))
  return (
    <svg width="24" height="20" viewBox="0 0 24 20" fill="none" className="flex-shrink-0">
      <rect x="0" y={20 - h} width="5" height={h} rx="2" fill={color} fillOpacity="0.35" />
      <rect x="7" y={20 - Math.max(4, h * 0.7)} width="5" height={Math.max(4, h * 0.7)} rx="2" fill={color} fillOpacity="0.55" />
      <rect x="14" y={20 - Math.max(4, h * 0.85)} width="5" height={Math.max(4, h * 0.85)} rx="2" fill={color} fillOpacity="0.75" />
      <rect x="21" y={20 - h} width="3" height={h} rx="1.5" fill={color} fillOpacity="1" />
    </svg>
  )
}

export default function HistoryPage() {
  const [filter, setFilter] = useState<FilterType>("all")
  const [speech, setSpeech] = useState<SpeechHistoryRecord[]>([])
  const [glucose, setGlucose] = useState<BloodSugarRecord[]>([])
  const [commands, setCommands] = useState<VoiceCommandRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.history.speech(), api.history.bloodSugar(), api.history.voiceCommands()])
      .then(([s, g, c]) => { setSpeech(s); setGlucose(g); setCommands(c) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const all: AnyRecord[] = [
    ...speech.map((r) => ({ ...r, _type: "speech", _date: r.timestamp })),
    ...glucose.map((r) => ({ ...r, _type: "glucose", _date: r.date })),
    ...commands.map((r) => ({ ...r, _type: "command", _date: r.date })),
  ].sort((a, b) => new Date(b._date).getTime() - new Date(a._date).getTime())

  const filtered = filter === "all" ? all
    : filter === "speech" ? all.filter((r) => r._type === "speech")
    : filter === "glucose" ? all.filter((r) => r._type === "glucose")
    : all.filter((r) => r._type === "command")

  const showChart = (filter === "all" || filter === "speech") && speech.length >= 2

  if (loading) return (
    <div className="flex justify-center items-center pt-32"><LoadingSpinner /></div>
  )

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-playfair text-4xl font-bold text-[#1C1410]">History</h1>
        <p className="mt-1 text-gray-warm">{all.length} health records · All time</p>
      </div>

      {/* Speech trend chart */}
      <AnimatePresence>
        {showChart && (
          <motion.div
            key="chart"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.0, 0.0, 0.2, 1] }}
            className="rounded-card-lg bg-white border border-warm-border p-5 shadow-card"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-warm">Speech score trend</p>
              <span className="text-[10px] font-mono text-[#E85D04]">{speech.length} sessions</span>
            </div>
            <SpeechScoreChart data={speech} height={88} showAxes limit={14} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(({ key, label, color }) => (
          <motion.button
            key={key}
            onClick={() => setFilter(key)}
            whileTap={{ scale: 0.97 }}
            className={clsx(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition-all border",
              filter === key
                ? "text-white border-transparent shadow-sm"
                : "border-warm-border bg-white text-gray-warm hover:text-[#1C1410] hover:border-[#E85D04]/30"
            )}
            style={filter === key ? { background: color } : {}}
          >
            {label}
          </motion.button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No records yet" submessage="Start by analyzing your speech or logging your glucose." />
      ) : (
        <div className="relative space-y-3 pl-7">
          {/* Timeline line */}
          <div className="absolute left-2.5 top-2 bottom-2 w-px bg-gradient-to-b from-[#E85D04]/40 via-[#7C3AED]/30 to-transparent" />

          <AnimatePresence>
            {filtered.map((r, idx) => {
              const cfg = TYPE_CONFIG[r._type as keyof typeof TYPE_CONFIG]
              return (
                <motion.div key={r.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ delay: idx * 0.025, duration: 0.35, ease: [0.0, 0.0, 0.2, 1] }}
                  className="relative"
                >
                  {/* Timeline dot */}
                  <div className="absolute -left-5 top-4 h-3 w-3 rounded-full border-2 border-white z-10 shadow-sm"
                    style={{ background: cfg?.color ?? "#E85D04" }} />

                  <div className="rounded-card bg-white border border-warm-border p-4 transition-all hover:border-[#E85D04]/25 hover:shadow-card card-hover shadow-sm">
                    {/* Type badge + date */}
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest"
                        style={{ background: `${cfg?.color}12`, color: cfg?.color, border: `1px solid ${cfg?.color}20` }}>
                        <span className="h-1 w-1 rounded-full" style={{ background: cfg?.color }} />
                        {cfg?.label}
                      </span>
                      <span className="text-xs text-gray-warm">{formatDate(r._date)}</span>
                    </div>

                    {r._type === "speech" && (() => {
                      const s = r as unknown as SpeechHistoryRecord & AnyRecord
                      return (
                        <div className="flex items-center gap-3">
                          <MiniSparkline score={s.combined_slur_score} />
                          <span className="font-mono text-2xl font-bold text-[#1C1410]">
                            {Math.round(s.combined_slur_score)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <RiskBadge classification={s.classification as Classification} size="sm" />
                            {s.transcribed_text && (
                              <p className="mt-1 text-xs italic text-gray-warm truncate">&ldquo;{s.transcribed_text}&rdquo;</p>
                            )}
                          </div>
                        </div>
                      )
                    })()}

                    {r._type === "glucose" && (() => {
                      const g = r as unknown as BloodSugarRecord & AnyRecord
                      const gZone = g.blood_sugar_reading != null
                        ? g.blood_sugar_reading < 55 ? { color: "#DC2626", label: "Critical Low" }
                          : g.blood_sugar_reading < 70 ? { color: "#D97706", label: "Low" }
                            : g.blood_sugar_reading < 100 ? { color: "#059669", label: "Normal" }
                              : g.blood_sugar_reading < 250 ? { color: "#7C3AED", label: "High" }
                                : { color: "#DC2626", label: "Critical High" }
                        : null
                      return (
                        <div className="flex items-center gap-3">
                          {gZone && <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ background: gZone.color }} />}
                          <span className="font-mono text-2xl font-bold" style={{ color: gZone?.color ?? "#7C3AED" }}>
                            {g.blood_sugar_reading ?? "—"}
                          </span>
                          <span className="text-sm text-gray-warm">mg/dL</span>
                          {gZone && <span className="text-xs font-semibold" style={{ color: gZone.color }}>{gZone.label}</span>}
                          {g.critical_alert && (
                            <span className="ml-auto rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">Critical</span>
                          )}
                        </div>
                      )
                    })()}

                    {r._type === "command" && (() => {
                      const c = r as unknown as VoiceCommandRecord & AnyRecord
                      return (
                        <div className="flex items-center gap-2">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4 text-[#D97706] shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                          <p className="text-sm font-medium text-[#1C1410]">{c.voice_command}</p>
                        </div>
                      )
                    })()}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
