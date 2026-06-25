"use client"
import { motion } from "framer-motion"

interface Props {
  value: number
}

function getZoneInfo(v: number): { label: string; color: string } {
  if (v < 55) return { label: "Critical Low", color: "#DC2626" }
  if (v < 70) return { label: "Low", color: "#D97706" }
  if (v < 100) return { label: "Normal", color: "#059669" }
  if (v < 250) return { label: "High", color: "#7C3AED" }
  return { label: "Critical High", color: "#DC2626" }
}

export function GlucoseGauge({ value }: Props) {
  const { label, color } = getZoneInfo(value)

  const cx = 100
  const cy = 108
  const r = 82
  const MIN = 20
  const MAX = 600
  const SWEEP = 240
  const START_DEG = 150

  const pct = Math.min(1, Math.max(0, (value - MIN) / (MAX - MIN)))
  const arcLength = r * (SWEEP * Math.PI / 180)

  const toXY = (deg: number) => ({
    x: cx + r * Math.cos(deg * Math.PI / 180),
    y: cy + r * Math.sin(deg * Math.PI / 180),
  })

  const trackStart = toXY(START_DEG)
  const trackEnd = toXY(START_DEG + SWEEP)

  const trackPath = `M ${trackStart.x.toFixed(2)},${trackStart.y.toFixed(2)} A ${r},${r} 0 1,1 ${trackEnd.x.toFixed(2)},${trackEnd.y.toFixed(2)}`

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="200" height="175" viewBox="0 0 200 175">
        {/* Track */}
        <path d={trackPath} fill="none" stroke="#E8DDD5" strokeWidth="12" strokeLinecap="round" />

        {/* Animated fill arc via dashoffset */}
        <motion.path
          d={trackPath}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={arcLength}
          initial={{ strokeDashoffset: arcLength }}
          animate={{ strokeDashoffset: arcLength - pct * arcLength }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{ filter: `drop-shadow(0 0 5px ${color}55)` }}
        />

        {/* Value */}
        <text
          x="100"
          y="105"
          textAnchor="middle"
          style={{ fontFamily: "var(--font-jetbrains)", fontSize: 40, fontWeight: 700, fill: "#1C1410" }}
        >
          {value}
        </text>
        <text
          x="100"
          y="124"
          textAnchor="middle"
          style={{ fontFamily: "var(--font-inter)", fontSize: 11, fill: "#78716C", fontWeight: 600, letterSpacing: 1.5 }}
        >
          MG/DL
        </text>

        {/* Zone ticks — min and max labels */}
        <text
          x={trackStart.x - 6}
          y={trackStart.y + 14}
          textAnchor="middle"
          style={{ fontFamily: "var(--font-jetbrains)", fontSize: 9, fill: "#78716C" }}
        >
          20
        </text>
        <text
          x={trackEnd.x + 6}
          y={trackEnd.y + 14}
          textAnchor="middle"
          style={{ fontFamily: "var(--font-jetbrains)", fontSize: 9, fill: "#78716C" }}
        >
          600
        </text>
      </svg>

      <span className="text-sm font-semibold" style={{ color }}>
        {label}
      </span>
    </div>
  )
}
