"use client"
import { useCallback, useEffect, useState } from "react"
import { Mic, RotateCcw, Phone, CheckCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAudioRecorder } from "@/lib/hooks/useAudioRecorder"
import { RiskBadge } from "@/components/shared/RiskBadge"
import { BrainIllustration } from "@/components/illustrations/BrainIllustration"
import { api } from "@/lib/api"
import type { SpeechAnalysisResponse, CommandResponse } from "@/lib/types"
import { clsx } from "clsx"

const ECG_MINI = "M 0,20 L 20,20 L 28,20 C 32,20 35,14 38,11 C 41,8 44,11 47,20 L 50,20 L 52,24 L 55,4 L 58,36 L 61,20 L 70,20 C 76,20 82,13 86,11 C 90,9 94,13 98,20 L 160,20"

const PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  angle: i * 45,
  delay: i * 0.06,
}))

function ResultRing({ score, classification }: { score: number; classification: string }) {
  const r = 80
  const circ = 2 * Math.PI * r
  const fill = circ - (score / 100) * circ
  const color =
    classification === "Non Stroke" ? "#059669"
      : classification === "Warning" ? "#D97706"
        : "#DC2626"
  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none">
        {PARTICLES.map(({ angle, delay }) => {
          const rad = (angle * Math.PI) / 180
          const tx = Math.cos(rad) * 60
          const ty = Math.sin(rad) * 60
          return (
            <motion.div
              key={angle}
              className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full"
              style={{ background: color, marginLeft: -4, marginTop: -4 }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: tx, y: ty, opacity: 0, scale: 0 }}
              transition={{ delay, duration: 0.7, ease: "easeOut" }}
            />
          )
        })}
      </div>
      <div className="absolute inset-0 rounded-full blur-2xl opacity-20" style={{ background: color }} />
      <svg width="200" height="200" viewBox="0 0 200 200" className="relative drop-shadow-lg">
        <circle cx="100" cy="100" r={r} fill="none" stroke="#E8DDD5" strokeWidth="10" />
        <motion.circle cx="100" cy="100" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: fill }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ transformOrigin: "center", transform: "rotate(-90deg)", filter: `drop-shadow(0 0 6px ${color}80)` }}
        />
        <text x="100" y="95" textAnchor="middle" style={{ fontFamily: "var(--font-jetbrains)", fontSize: 36, fontWeight: 700, fill: "#1C1410" }}>
          {Math.round(score)}
        </text>
        <text x="100" y="116" textAnchor="middle" style={{ fontFamily: "var(--font-inter)", fontSize: 11, fill: "#78716C", fontWeight: 600, letterSpacing: 2 }}>
          RISK SCORE
        </text>
      </svg>
    </div>
  )
}

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

function CommandResultCard({ result }: { result: CommandResponse }) {
  const isGuardian = result.matched_intent === "contact_guardian"
  const isUnknown = result.matched_intent === "unknown"
  const accentColor = isGuardian ? "#DC2626" : "#78716C"
  const Icon = isGuardian ? Phone : CheckCircle

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-sm space-y-4"
    >
      <div className="flex flex-col items-center gap-3 pt-2">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: `${accentColor}15`, border: `2px solid ${accentColor}30` }}
        >
          <Icon className="h-7 w-7" style={{ color: accentColor }} />
        </div>
        <p className="text-center text-base font-semibold text-[#1C1410]">
          {isUnknown ? "Command not recognized" : "Command matched"}
        </p>
      </div>

      <div className="rounded-card-lg bg-white border border-warm-border p-5 space-y-4 shadow-card">
        {result.raw_audio_heard && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-warm mb-1">What we heard</p>
            <p className="text-sm text-[#1C1410] italic">&ldquo;{result.raw_audio_heard}&rdquo;</p>
          </div>
        )}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-warm mb-1">Action</p>
          <p className="text-sm text-[#1C1410]">{result.frontend_ui_direction}</p>
        </div>
        {isGuardian && result.alert_sent && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-live flex-shrink-0" />
            <p className="text-xs font-semibold text-red-700">Emergency contact notified</p>
          </div>
        )}
        {isGuardian && !result.alert_sent && result.alert_skipped_reason && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
            <p className="text-xs font-semibold text-amber-700">{result.alert_skipped_reason}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

type Mode = "analyze" | "command"

export default function SpeechPage() {
  const { state, waveformData, elapsed, error, start, stop, reset } = useAudioRecorder()
  const [mode, setMode] = useState<Mode>("analyze")
  const [result, setResult] = useState<SpeechAnalysisResponse | null>(null)
  const [cmdResult, setCmdResult] = useState<CommandResponse | null>(null)
  const [apiError, setApiError] = useState("")

  const handlePress = useCallback(async () => {
    if (state === "idle") { await start() }
  }, [state, start])

  const handleRelease = useCallback(async () => {
    if (state !== "recording") return
    const blob = await stop()
    setApiError("")
    try {
      if (mode === "analyze") {
        const res = await api.speech.analyze(blob, `recording-${Date.now()}.webm`)
        setResult(res)
      } else {
        const res = await api.speech.command(blob, `command-${Date.now()}.webm`)
        setCmdResult(res)
      }
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "Processing failed")
    }
  }, [state, stop, mode])

  useEffect(() => {
    if (state === "recording" && elapsed >= 8) {
      handleRelease()
    }
  }, [elapsed, state, handleRelease])

  function handleReset() {
    reset()
    setResult(null)
    setCmdResult(null)
    setApiError("")
  }

  function handleModeSwitch(m: Mode) {
    setMode(m)
    handleReset()
  }

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  const hasResult = result !== null || cmdResult !== null

  return (
    <div className="flex flex-col items-center space-y-8 animate-fade-up">
      {/* Header */}
      <div className="text-center w-full flex items-start justify-between">
        <div className="flex-1">
          <h1 className="font-playfair text-4xl font-bold text-[#1C1410]">Speech Analysis</h1>
          <p className="mt-2 text-gray-warm">Sentinel will analyze your speech for stroke indicators</p>
        </div>
        <BrainIllustration size={90} className="hidden md:block opacity-75 flex-shrink-0 ml-4" />
      </div>

      {/* Mode toggle */}
      <div className="flex w-full rounded-xl border border-warm-border bg-white p-1 shadow-sm gap-1">
        {(["analyze", "command"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeSwitch(m)}
            className={clsx(
              "flex-1 rounded-lg py-2 text-sm font-semibold transition-all",
              mode === m
                ? "bg-[#E85D04] text-white shadow-sm"
                : "text-gray-warm hover:text-[#1C1410]"
            )}
          >
            {m === "analyze" ? "Stroke Analysis" : "Voice Command"}
          </button>
        ))}
      </div>

      {/* Context card */}
      <AnimatePresence mode="wait">
        {mode === "analyze" ? (
          <motion.div key="phrase-card"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="w-full rounded-card-lg bg-white border-glow-electric px-8 py-5 text-center shadow-elevated">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-warm mb-2">Say this phrase clearly</p>
            <p className="font-playfair text-3xl font-bold text-[#1C1410]">&ldquo;the sky is blue&rdquo;</p>
          </motion.div>
        ) : (
          <motion.div key="cmd-card"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="w-full rounded-card-lg bg-white border border-warm-border px-6 py-5 shadow-card space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-warm">Supported commands</p>
            <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-100 px-4 py-2.5">
              <Phone className="h-4 w-4 text-red-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#1C1410]">&ldquo;contact family&rdquo; or &ldquo;emergency&rdquo;</p>
                <p className="text-xs text-gray-warm">Alerts your emergency contact</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ECG decoration */}
      {!hasResult && (
        <div className="w-full h-10 overflow-hidden opacity-50 px-4">
          <svg viewBox="0 0 320 40" className="w-full h-full" preserveAspectRatio="none">
            <path d={ECG_MINI.replace("160", "320")} stroke="#E85D04" strokeWidth="2" fill="none"
              style={{ filter: "drop-shadow(0 0 4px rgba(232,93,4,0.65))" }} className="animate-ecg-draw-in" />
            <path d={ECG_MINI.replace("160", "320")} stroke="#D97706" strokeWidth="1" fill="none" opacity="0.4"
              style={{ filter: "drop-shadow(0 0 6px rgba(217,119,6,0.8))" }} />
          </svg>
        </div>
      )}

      {/* Main control */}
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 w-full max-w-sm">
            <ResultRing score={result.data.overall_slur_score} classification={result.data.classification} />
            <RiskBadge classification={result.data.classification} size="lg" />
            {result.alert.message && (
              <p className="text-center text-sm text-gray-warm px-4">{result.alert.message}</p>
            )}
            <div className="w-full rounded-card-lg bg-white border border-warm-border p-5 space-y-4 shadow-card">
              {result.data.transcription && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-warm mb-1">What we heard</p>
                  <p className="text-sm text-[#1C1410] italic">&ldquo;{result.data.transcription}&rdquo;</p>
                </div>
              )}
              {result.alert_sent && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-live flex-shrink-0" />
                  <p className="text-xs font-semibold text-red-700">Emergency contact notified</p>
                </div>
              )}
            </div>
            <button onClick={handleReset}
              className="flex items-center gap-2 rounded-full border border-warm-border bg-white px-6 py-2.5 text-sm font-medium text-gray-warm hover:border-[#E85D04]/40 hover:text-[#1C1410] transition-all">
              <RotateCcw className="h-4 w-4" /> Analyze again
            </button>
          </motion.div>
        ) : cmdResult ? (
          <motion.div key="cmd-result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 w-full">
            <CommandResultCard result={cmdResult} />
            <button onClick={handleReset}
              className="flex items-center gap-2 rounded-full border border-warm-border bg-white px-6 py-2.5 text-sm font-medium text-gray-warm hover:border-[#E85D04]/40 hover:text-[#1C1410] transition-all">
              <RotateCcw className="h-4 w-4" /> Try again
            </button>
          </motion.div>
        ) : (
          <motion.div key="record" className="flex flex-col items-center gap-6">
            <div className="relative">
              {state === "recording" && (
                <>
                  <div className="absolute inset-0 rounded-full bg-[#E85D04]/15 animate-ring-pulse" />
                  <div className="absolute inset-0 rounded-full bg-[#E85D04]/08 animate-ring-pulse" style={{ animationDelay: "0.6s" }} />
                </>
              )}
              <button
                onMouseDown={handlePress} onMouseUp={handleRelease}
                onTouchStart={handlePress} onTouchEnd={handleRelease}
                disabled={state === "processing"}
                className={clsx(
                  "relative flex h-48 w-48 flex-col items-center justify-center rounded-full transition-all duration-300 select-none border-2",
                  state === "idle" && "bg-white border-[#E85D04]/25 hover:border-[#E85D04]/50 hover:shadow-glow animate-breathe shadow-card",
                  state === "recording" && "bg-gradient-to-br from-[#E85D04] to-[#C2410C] border-[#E85D04] shadow-glow-lg",
                  state === "processing" && "bg-white border-warm-border cursor-wait",
                )}
              >
                {state === "idle" && (
                  <>
                    <Mic className="h-12 w-12 text-[#E85D04]" />
                    <span className="mt-3 text-xs font-semibold text-gray-warm uppercase tracking-wide">Hold to speak</span>
                  </>
                )}
                {state === "recording" && (
                  <>
                    <Waveform data={waveformData} />
                    <span className="mt-2 font-mono text-sm font-bold text-white/90">{mins}:{String(secs).padStart(2, "0")}</span>
                  </>
                )}
                {state === "processing" && (
                  <div className="relative h-12 w-12">
                    <div className="absolute inset-0 animate-spin rounded-full border-2 border-warm-border border-t-[#E85D04]" />
                    <div className="absolute inset-1.5 animate-spin rounded-full border-2 border-warm-border border-t-[#D97706]" style={{ animationDirection: "reverse" }} />
                  </div>
                )}
              </button>
            </div>

            <div className="text-center">
              {state === "idle" && (
                <p className="text-sm text-gray-warm">
                  {mode === "analyze" ? "Hold the button while speaking the phrase (max 8s)" : "Hold and say your command (max 8s)"}
                </p>
              )}
              {state === "recording" && <p className="text-sm font-semibold text-[#E85D04] animate-pulse">Recording… release when done</p>}
              {state === "processing" && (
                <p className="text-sm text-gray-warm">
                  {mode === "analyze" ? "Analyzing your speech with AI…" : "Processing command…"}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {(error || apiError) && (
        <div className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error || apiError}</p>
        </div>
      )}
    </div>
  )
}
