"use client"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Camera, Scan, RefreshCw, Upload, X, AlertTriangle } from "lucide-react"
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

  const emergencyPromptRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadPreviewUrlRef = useRef<string | null>(null)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadDetection, setUploadDetection] = useState<PredictionResponse | null>(null)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadError, setUploadError] = useState("")

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

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (uploadPreviewUrlRef.current) URL.revokeObjectURL(uploadPreviewUrlRef.current)
    const url = URL.createObjectURL(file)
    uploadPreviewUrlRef.current = url
    setUploadFile(file)
    setUploadPreview(url)
    setUploadDetection(null)
    setUploadError("")
    e.target.value = ""
  }

  async function handleUploadDetect() {
    if (!uploadFile) return
    setUploadLoading(true)
    setUploadError("")
    try {
      const result = await api.predict.run(uploadFile)
      setUploadDetection(result)
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Detection failed.")
    } finally {
      setUploadLoading(false)
    }
  }

  function handleUploadClear() {
    if (uploadPreviewUrlRef.current) URL.revokeObjectURL(uploadPreviewUrlRef.current)
    uploadPreviewUrlRef.current = null
    setUploadFile(null)
    setUploadPreview(null)
    setUploadDetection(null)
    setUploadError("")
  }

  const confidencePct = detection ? Math.round(detection.confidence * 100) : 0
  const isHighRisk = detection && detection.label === "Stroke" && detection.confidence > 0.7

  const uploadConfidencePct = uploadDetection ? Math.round(uploadDetection.confidence * 100) : 0
  const uploadIsHighRisk = uploadDetection && uploadDetection.label === "Stroke" && uploadDetection.confidence > 0.7

  useEffect(() => {
    if (isHighRisk || uploadIsHighRisk) {
      setTimeout(() => {
        emergencyPromptRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      }, 300)
    }
  }, [isHighRisk, uploadIsHighRisk])

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="font-playfair text-4xl font-bold text-[#1C1410]">Live Camera</h1>
        <p className="mt-1 text-gray-warm">Real-time feed from your Raspberry Pi camera</p>
      </div>

      {/* Camera feed */}
      <div className="relative overflow-hidden rounded-card-lg border border-warm-border bg-warm-950 shadow-elevated">
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

      {/* Live camera action buttons */}
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

      {/* Snapshot + detection overlay */}
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

      {isHighRisk && (
        <motion.div ref={emergencyPromptRef} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Link href="/emergency-check"
            className="group flex items-center gap-4 rounded-card-lg border-2 border-red-300 bg-red-50 p-5 transition-all hover:border-red-400 hover:bg-red-100">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 border border-red-200 group-hover:bg-red-200 transition-colors">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-playfair text-base font-bold text-red-800">Complete emergency checks →</p>
              <p className="text-sm text-red-600 mt-0.5">Confirm with a blood glucose reading and speech test now.</p>
            </div>
          </Link>
        </motion.div>
      )}

      {/* ── Upload section ── */}
      <div className="relative flex items-center gap-4 py-2">
        <div className="flex-1 border-t border-warm-border" />
        <span className="text-xs font-medium text-gray-warm">or upload an image</span>
        <div className="flex-1 border-t border-warm-border" />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {!uploadPreview ? (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-warm-border bg-white py-3.5 text-sm font-semibold text-[#1C1410] transition-all hover:border-[#E85D04]/40 hover:bg-warm-700"
        >
          <Upload className="h-4 w-4" /> Choose image
        </button>
      ) : (
        <div className="space-y-4">
          {/* Upload preview with optional detection overlay */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-card-lg border border-warm-border shadow-elevated"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={uploadPreview} alt="Upload preview" className="w-full" />
            {uploadDetection && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/95 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-warm">Detection</p>
                    <p className="font-playfair text-xl font-bold text-[#1C1410]">{uploadDetection.label}</p>
                  </div>
                  <div className={clsx("rounded-full px-4 py-1.5 font-mono text-sm font-bold border",
                    uploadIsHighRisk ? "bg-red-50 border-red-200 text-red-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"
                  )}>
                    {uploadConfidencePct}%
                  </div>
                </div>
                <div className="mt-3 h-1.5 w-full rounded-full bg-warm-600 overflow-hidden">
                  <motion.div className="h-full rounded-full"
                    style={{ background: uploadIsHighRisk ? "#DC2626" : "#059669" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadConfidencePct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}
            <button
              onClick={handleUploadClear}
              className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 border border-warm-border text-gray-warm backdrop-blur-sm transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>

          {/* Upload action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-full border border-warm-border bg-white px-5 py-3 text-sm font-semibold text-[#1C1410] transition-all hover:border-[#E85D04]/40 hover:bg-warm-700"
            >
              <Upload className="h-4 w-4" /> Change
            </button>
            <button
              onClick={handleUploadDetect}
              disabled={uploadLoading}
              className="group relative overflow-hidden flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] py-3 text-sm font-semibold text-white shadow-glow-sky transition-all hover:shadow-glow-sky disabled:opacity-50"
            >
              {uploadLoading ? (
                <span className="relative z-10 flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Analyzing…
                </span>
              ) : (
                <span className="relative z-10 flex items-center gap-2">
                  <Scan className="h-4 w-4" /> Detect from upload
                </span>
              )}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </div>

          {uploadError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700">{uploadError}</p>
            </div>
          )}

          {uploadDetection && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={clsx("rounded-card-lg p-5 border",
                uploadIsHighRisk ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"
              )}>
              <div className="flex items-center gap-3">
                <div className={clsx("h-10 w-10 rounded-xl flex items-center justify-center",
                  uploadIsHighRisk ? "bg-red-100" : "bg-emerald-100"
                )}>
                  <span className="text-xl">{uploadIsHighRisk ? "⚠️" : "✓"}</span>
                </div>
                <div>
                  <p className="font-semibold text-[#1C1410]">{uploadDetection.label}</p>
                  <p className="text-xs text-gray-warm">{uploadConfidencePct}% confidence · Source: {uploadDetection.source}</p>
                </div>
              </div>
            </motion.div>
          )}

          {uploadIsHighRisk && (
            <motion.div ref={emergencyPromptRef} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Link href="/emergency-check"
                className="group flex items-center gap-4 rounded-card-lg border-2 border-red-300 bg-red-50 p-5 transition-all hover:border-red-400 hover:bg-red-100">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 border border-red-200 group-hover:bg-red-200 transition-colors">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-playfair text-base font-bold text-red-800">Complete emergency checks →</p>
                  <p className="text-sm text-red-600 mt-0.5">Confirm with a blood glucose reading and speech test now.</p>
                </div>
              </Link>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
