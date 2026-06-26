"use client"
import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, CheckCircle, Mic, RotateCcw } from "lucide-react"
import { clsx } from "clsx"
import { api } from "@/lib/api"
import { useAudioRecorder } from "@/lib/hooks/useAudioRecorder"
import type { BloodSugarResponse, SpeechAnalysisResponse } from "@/lib/types"
import { RiskBadge } from "@/components/shared/RiskBadge"

function Waveform({ data }: { data: number[] }) {
  const bars = [0, 8, 16, 24, 32, 40, 48].map((i) => Math.max(6, ((data[i] ?? 128) - 128) / 128 * 28 + 18))
  return (
    <div className="flex items-center gap-1 h-10">
      {bars.map((h, i) => (
        <motion.div key={i} className="w-1.5 rounded-full bg-white"
          animate={{ height: h }} transition={{ duration: 0.04 }} style={{ height: h }} />
      ))}
    </div>
  )
}

const ZONES = [
  { label: "Critical Low", min: 20, max: 54, color: "#DC2626" },
  { label: "Low", min: 55, max: 69, color: "#D97706" },
  { label: "Normal", min: 70, max: 99, color: "#059669" },
  { label: "High", min: 100, max: 249, color: "#7C3AED" },
  { label: "Critical High", min: 250, max: 600, color: "#DC2626" },
]

function getZone(v: number) {
  return ZONES.find((z) => v >= z.min && v <= z.max) ?? ZONES[2]
}

export default function EmergencyCheckPage() {
  const router = useRouter()

  // Glucose state
  const [glucoseVal, setGlucoseVal] = useState(100)
  const [glucoseResult, setGlucoseResult] = useState<BloodSugarResponse | null>(null)
  const [glucoseSubmitting, setGlucoseSubmitting] = useState(false)
  const [glucoseErr, setGlucoseErr] = useState("")

  // Speech state
  const { state: recState, waveformData, elapsed, error: recError, start, stop, reset: resetRec } = useAudioRecorder()
  const [speechResult, setSpeechResult] = useState<SpeechAnalysisResponse | null>(null)
  const [speechErr, setSpeechErr] = useState("")

  const zone = getZone(glucoseVal)
  const pct = ((glucoseVal - 20) / (600 - 20)) * 100

  async function submitGlucose(e: React.FormEvent) {
    e.preventDefault()
    setGlucoseSubmitting(true)
    setGlucoseErr("")
    try {
      const res = await api.speech.submitBloodSugar(glucoseVal)
      setGlucoseResult(res)
    } catch (e) {
      setGlucoseErr(e instanceof Error ? e.message : "Submission failed")
    } finally {
      setGlucoseSubmitting(false)
    }
  }

  const handleMicPress = useCallback(async () => {
    if (recState === "idle") await start()
  }, [recState, start])

  const handleMicRelease = useCallback(async () => {
    if (recState !== "recording") return
    const blob = await stop()
    setSpeechErr("")
    try {
      const res = await api.speech.analyze(blob, `emergency-${Date.now()}.webm`)
      setSpeechResult(res)
    } catch (e) {
      setSpeechErr(e instanceof Error ? e.message : "Analysis failed")
    }
  }, [recState, stop])

  const bothDone = glucoseResult !== null && speechResult !== null

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-4 rounded-card-lg border border-red-200 bg-red-50 px-5 py-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 border border-red-200">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <div>
          <p className="font-playfair text-xl font-bold text-red-800">Stroke Risk Detected</p>
          <p className="text-sm text-red-600 mt-0.5">Emergency contacts have been notified. Please complete both checks below.</p>
        </div>
      </div>

      {/* Completion banner */}
      <AnimatePresence>
        {bothDone && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-card-lg border border-emerald-200 bg-emerald-50 px-5 py-4"
          >
            <CheckCircle className="h-6 w-6 text-emerald-600 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-emerald-800">Both checks complete</p>
              <p className="text-sm text-emerald-600">Results have been saved to the patient record.</p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              Dashboard
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Check 1: Blood Glucose ── */}
      <section className="rounded-card-lg border border-warm-border bg-white shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-warm-border">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#7C3AED]/10 text-sm font-bold text-[#7C3AED]">1</span>
            <p className="font-playfair text-lg font-bold text-[#1C1410]">Blood Glucose</p>
          </div>
          {glucoseResult && <CheckCircle className="h-5 w-5 text-emerald-500" />}
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">
            {glucoseResult ? (
              <motion.div key="glucose-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <div className={clsx("rounded-xl p-4 border", glucoseResult.emergency_alert_dispatched ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200")}>
                  <p className="font-mono text-4xl font-bold text-[#1C1410]">{glucoseResult.logged_value} <span className="text-base font-normal text-gray-warm">mg/dL</span></p>
                  <p className="mt-2 text-sm text-[#1C1410] leading-relaxed">{glucoseResult.medical_assessment}</p>
                </div>
                <button
                  onClick={() => setGlucoseResult(null)}
                  className="flex items-center gap-2 text-sm text-gray-warm hover:text-[#1C1410] transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Re-enter reading
                </button>
              </motion.div>
            ) : (
              <motion.form key="glucose-form" onSubmit={submitGlucose} className="space-y-4">
                {/* Slider */}
                <div className="space-y-2">
                  <div className="flex items-end justify-between">
                    <span className="font-mono text-3xl font-bold text-[#1C1410]">{glucoseVal}</span>
                    <span className="text-sm text-gray-warm mb-1">mg/dL</span>
                  </div>
                  <input
                    type="range" min={20} max={600} value={glucoseVal}
                    onChange={(e) => setGlucoseVal(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer outline-none"
                    style={{
                      background: `linear-gradient(to right, ${zone.color} 0%, ${zone.color} ${pct}%, #E8DDD5 ${pct}%, #E8DDD5 100%)`,
                      accentColor: zone.color,
                    }}
                  />
                  <div className="flex justify-between text-[10px] text-gray-warm">
                    <span>20</span><span>600</span>
                  </div>
                </div>

                {/* Zone label */}
                <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border"
                  style={{ color: zone.color, borderColor: `${zone.color}40`, background: `${zone.color}0d` }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: zone.color }} />
                  {zone.label}
                </div>

                {/* Manual input */}
                <div className="flex items-center gap-3 rounded-xl border border-warm-border bg-warm-950 px-4 py-2.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-warm shrink-0">Or type:</label>
                  <input
                    type="number" min={20} max={600} value={glucoseVal}
                    onChange={(e) => setGlucoseVal(Math.max(20, Math.min(600, Number(e.target.value))))}
                    className="flex-1 bg-transparent text-center font-mono text-lg font-bold text-[#1C1410] outline-none"
                  />
                  <span className="text-xs text-gray-warm shrink-0">mg/dL</span>
                </div>

                {glucoseErr && <p className="text-sm text-red-600">{glucoseErr}</p>}

                <button
                  type="submit"
                  disabled={glucoseSubmitting}
                  className="w-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 disabled:opacity-50"
                >
                  {glucoseSubmitting ? "Saving…" : "Submit reading"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── Check 2: Speech Test ── */}
      <section className="rounded-card-lg border border-warm-border bg-white shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-warm-border">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E85D04]/10 text-sm font-bold text-[#E85D04]">2</span>
            <p className="font-playfair text-lg font-bold text-[#1C1410]">Speech Test</p>
          </div>
          {speechResult && <CheckCircle className="h-5 w-5 text-emerald-500" />}
        </div>

        <div className="p-5 flex flex-col items-center gap-5">
          {/* Phrase prompt */}
          {!speechResult && (
            <div className="w-full rounded-xl border border-warm-border bg-warm-950 px-5 py-3 text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-warm mb-1">Say this phrase clearly</p>
              <p className="font-playfair text-2xl font-bold text-[#1C1410]">&ldquo;the sky is blue&rdquo;</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {speechResult ? (
              <motion.div key="speech-result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-3">
                <div className={clsx("rounded-xl p-4 border", speechResult.data.classification === "Stroke" ? "bg-red-50 border-red-200" : speechResult.data.classification === "Warning" ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200")}>
                  <div className="flex items-center justify-between mb-2">
                    <RiskBadge classification={speechResult.data.classification} size="lg" />
                    <span className="font-mono text-2xl font-bold text-[#1C1410]">{Math.round(speechResult.data.overall_slur_score)}</span>
                  </div>
                  {speechResult.data.transcription && (
                    <p className="text-sm italic text-gray-warm">&ldquo;{speechResult.data.transcription}&rdquo;</p>
                  )}
                </div>
                <button
                  onClick={() => { resetRec(); setSpeechResult(null); setSpeechErr("") }}
                  className="flex items-center gap-2 text-sm text-gray-warm hover:text-[#1C1410] transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Try again
                </button>
              </motion.div>
            ) : (
              <motion.div key="speech-record" className="flex flex-col items-center gap-4">
                <div className="relative">
                  {recState === "recording" && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-[#E85D04]/15 animate-ring-pulse" />
                      <div className="absolute inset-0 rounded-full bg-[#E85D04]/08 animate-ring-pulse" style={{ animationDelay: "0.6s" }} />
                    </>
                  )}
                  <button
                    onMouseDown={handleMicPress} onMouseUp={handleMicRelease}
                    onTouchStart={handleMicPress} onTouchEnd={handleMicRelease}
                    disabled={recState === "processing"}
                    className={clsx(
                      "relative flex h-36 w-36 flex-col items-center justify-center rounded-full transition-all duration-300 select-none border-2",
                      recState === "idle" && "bg-white border-[#E85D04]/25 hover:border-[#E85D04]/50 hover:shadow-glow animate-breathe shadow-card",
                      recState === "recording" && "bg-gradient-to-br from-[#E85D04] to-[#C2410C] border-[#E85D04] shadow-glow-lg",
                      recState === "processing" && "bg-white border-warm-border cursor-wait",
                    )}
                  >
                    {recState === "idle" && (
                      <>
                        <Mic className="h-10 w-10 text-[#E85D04]" />
                        <span className="mt-2 text-[10px] font-semibold text-gray-warm uppercase tracking-wide">Hold to speak</span>
                      </>
                    )}
                    {recState === "recording" && (
                      <>
                        <Waveform data={waveformData} />
                        <span className="mt-1 font-mono text-sm font-bold text-white/90">
                          {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
                        </span>
                      </>
                    )}
                    {recState === "processing" && (
                      <div className="relative h-10 w-10">
                        <div className="absolute inset-0 animate-spin rounded-full border-2 border-warm-border border-t-[#E85D04]" />
                      </div>
                    )}
                  </button>
                </div>
                {recState === "idle" && <p className="text-sm text-gray-warm text-center">Hold the button while speaking the phrase above</p>}
                {recState === "recording" && <p className="text-sm font-semibold text-[#E85D04] animate-pulse">Recording… release when done</p>}
                {recState === "processing" && <p className="text-sm text-gray-warm">Analyzing speech…</p>}
              </motion.div>
            )}
          </AnimatePresence>

          {(recError || speechErr) && (
            <div className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700">{recError || speechErr}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
