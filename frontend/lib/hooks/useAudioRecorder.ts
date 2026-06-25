"use client"
import { useCallback, useEffect, useRef, useState } from "react"

type RecorderState = "idle" | "recording" | "processing"

export function useAudioRecorder() {
  const [state, setState] = useState<RecorderState>("idle")
  const [waveformData, setWaveformData] = useState<number[]>(new Array(32).fill(128))
  const [elapsed, setElapsed] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const resolveRef = useRef<((blob: Blob) => void) | null>(null)

  const start = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const ctx = new AudioContext()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64
      ctx.createMediaStreamSource(stream).connect(analyser)
      analyserRef.current = analyser

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" })
      chunksRef.current = []
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mediaRef.current = recorder
      recorder.start(100)

      setState("recording")
      setElapsed(0)
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000)

      const data = new Uint8Array(analyser.frequencyBinCount)
      const loop = () => {
        analyser.getByteTimeDomainData(data)
        setWaveformData(Array.from(data))
        rafRef.current = requestAnimationFrame(loop)
      }
      loop()
    } catch {
      setError("Microphone access denied. Please allow microphone access and try again.")
    }
  }, [])

  const stop = useCallback((): Promise<Blob> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve
      if (timerRef.current) clearInterval(timerRef.current)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      setState("processing")
      const recorder = mediaRef.current
      if (!recorder) { resolve(new Blob()); return }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        recorder.stream.getTracks().forEach((t) => t.stop())
        resolveRef.current?.(blob)
      }
      recorder.stop()
    })
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const reset = useCallback(() => {
    setState("idle")
    setElapsed(0)
    setWaveformData(new Array(32).fill(128))
    setError(null)
  }, [])

  return { state, waveformData, elapsed, error, start, stop, reset }
}
