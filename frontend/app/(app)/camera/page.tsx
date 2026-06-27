"use client"
import { useState, useRef } from "react"
import { Camera, Scan, RefreshCw } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { api } from "@/lib/api"
import type { PredictionResponse } from "@/lib/types"
import { FaceScanIllustration } from "@/components/illustrations/FaceScanIllustration"
import { clsx } from "clsx"

export default function CameraPage() {
  const [snapshot, setSnapshot] = useState<string | null>(null)
  const snapshotUrlRef = useRef<string | null>(null)
  const [detection, setDetection] = useState<PredictionResponse | null>(null)
  const [streamError, setStreamError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [scanActive, setScanActive] = useState(false)

  async function takeSnapshot() {
    setLoading(true)
    try {
      const res = await fetch("/api/camera/snapshot")
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      if (snapshotUrlRef.current) URL.revokeObjectURL(snapshotUrlRef.current)
      const url = URL.createObjectURL(blob)
      snapshotUrlRef.current = url
      setSnapshot(url)
      setDetection(null)
    } catch {
      alert("Could not capture snapshot.")
    } finally { setLoading(false) }
  }

  async function runDetection() {
    setLoading(true); setScanActive(true)
    try {
      const result = await api.predict.run()
      setDetection(result)
    } catch (e) {
      alert(e instanceof Error ? e.message : "Detection failed.")
    } finally {
      setLoading(false)
      setTimeout(() => setScanActive(false), 1000)
    }
  }

  const confidencePct = detection ? Math.round(detection.confidence * 100) : 0
  const isHighRisk = detection && detection.label === "Stroke" && detection.confidence > 0.7

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-playfair text-4xl font-bold text-[#1C1410]">Live Camera</h1>
        <p className="mt-1 text-gray-warm">Real-time feed from your Raspberry Pi camera</p>
      </div>

      {/* Camera feed */}
      <div className="relative overflow-hidden rounded-card-lg border border-warm-border bg-warm-950 shadow-elevated">
        {/* Corner accents */}
        {(["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"] as const).map((pos, i) => (
          <motion.div key={i} className={`absolute ${pos} h-5 w-5 border-[#0EA5E9]`}
            animate={scanActive ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.5 }}
            transition={{ duration: 0.6, repeat: scanActive ? Infinity : 0 }}
            style={{
              borderTopWidth: i < 2 ? 2.5 : 0,
              borderBottomWidth: i >= 2 ? 2.5 : 0,
              borderLeftWidth: i % 2 === 0 ? 2.5 : 0,
              borderRightWidth: i % 2 === 1 ? 2.5 : 0,
              boxShadow: scanActive ? "0 0 8px rgba(14,165,233,0.5)" : "none",
              transition: "box-shadow 0.3s ease",
            }} />
        ))}

        {streamError ? (
          <div className="flex h-80 flex-col items-center justify-center gap-6">
            <FaceScanIllustration size={180} />
            <div className="text-center">
              <p className="font-playfair text-xl text-[#1C1410]">Camera offline</p>
              <p className="text-sm text-gray-warm mt-1">Pi server unreachable. Check your connection.</p>
            </div>
            <button onClick={() => setStreamError(false)}
              className="flex items-center gap-2 rounded-full border border-warm-border bg-white px-4 py-2 text-sm text-gray-warm hover:text-[#1C1410] hover:border-[#0EA5E9]/40 transition-all">
              <RefreshCw className="h-3.5 w-3.5" /> Retry
            </button>
          </div>
        ) : (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/api/camera/stream"
              alt="Live camera feed"
              className="w-full"
              onError={() => setStreamError(true)}
            />
            {scanActive && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                  className="absolute left-0 right-0 h-0.5"
                  style={{ background: "linear-gradient(90deg, transparent 0%, rgba(14,165,233,0.6) 20%, rgba(14,165,233,0.9) 50%, rgba(14,165,233,0.6) 80%, transparent 100%)", boxShadow: "0 0 12px rgba(14,165,233,0.6)" }}
                  animate={{ top: ["-2%", "102%"] }}
                  transition={{ duration: 1.4, ease: "linear", repeat: Infinity }}
                />
              </div>
            )}
            <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white/90 px-2.5 py-1 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-live" />
              <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">Live</span>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button onClick={takeSnapshot} disabled={loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-warm-border bg-white py-3.5 text-sm font-semibold text-[#1C1410] transition-all hover:border-[#0EA5E9]/40 hover:bg-warm-700 disabled:opacity-50">
          <Camera className="h-4 w-4" /> Capture snapshot
        </button>
        <button onClick={runDetection} disabled={loading}
          className="group relative overflow-hidden flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] py-3.5 text-sm font-semibold text-white shadow-glow-sky transition-all hover:shadow-glow-sky disabled:opacity-50">
          <span className="relative z-10 flex items-center gap-2"><Scan className="h-4 w-4" /> Run AI detection</span>
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </button>
      </div>

      {/* Snapshot + detection result */}
      <AnimatePresence>
        {snapshot && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-card-lg border border-warm-border shadow-elevated">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={snapshot} alt="Snapshot" className="w-full" />
            {detection && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/95 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-warm">Detection</p>
                    <p className="font-playfair text-xl font-bold text-[#1C1410]">{detection.label}</p>
                  </div>
                  <div className={clsx("rounded-full px-4 py-1.5 font-mono text-sm font-bold border",
                    isHighRisk ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"
                  )}>
                    {confidencePct}%
                  </div>
                </div>
                <div className="mt-3 h-1.5 w-full rounded-full bg-warm-600 overflow-hidden">
                  <motion.div className="h-full rounded-full"
                    style={{ background: isHighRisk ? "#DC2626" : "#059669" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${confidencePct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {detection && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={clsx("rounded-card-lg p-5 border",
            isHighRisk ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"
          )}>
          <div className="flex items-center gap-3">
            <div className={clsx("h-10 w-10 rounded-xl flex items-center justify-center",
              isHighRisk ? "bg-red-100" : "bg-emerald-100"
            )}>
              <span className="text-xl">{isHighRisk ? "⚠️" : "✓"}</span>
            </div>
            <div>
              <p className="font-semibold text-[#1C1410]">{detection.label}</p>
              <p className="text-xs text-gray-warm">{confidencePct}% confidence · Source: {detection.source}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
