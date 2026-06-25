"use client"
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts"

interface DataPoint {
  timestamp: string
  combined_slur_score: number
}

interface Props {
  data: DataPoint[]
  height?: number
  showAxes?: boolean
  limit?: number
}

function scoreColor(score: number) {
  if (score >= 70) return "#DC2626"
  if (score >= 40) return "#D97706"
  return "#059669"
}

export function SpeechScoreChart({ data, height = 64, showAxes = false, limit = 7 }: Props) {
  const slice = data.slice(-limit)
  const chartData = slice.map((d) => ({
    date: new Date(d.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    score: Math.round(d.combined_slur_score),
  }))

  const avgScore = chartData.length > 0 ? chartData.reduce((s, d) => s + d.score, 0) / chartData.length : 0
  const color = scoreColor(avgScore)

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chartData} margin={{ top: 4, right: 2, bottom: 0, left: 2 }}>
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.28} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        {showAxes && (
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "#78716C", fontFamily: "var(--font-jetbrains)" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
        )}
        <Tooltip
          contentStyle={{
            background: "#fff",
            border: "1px solid #E8DDD5",
            borderRadius: 10,
            fontFamily: "var(--font-jetbrains)",
            fontSize: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
          labelStyle={{ color: "#57534E", fontFamily: "var(--font-inter)", fontSize: 11 }}
          formatter={(v) => [v, "Risk Score"]}
          cursor={{ stroke: color, strokeWidth: 1, strokeOpacity: 0.4 }}
        />
        <Area
          dataKey="score"
          type="monotone"
          stroke={color}
          strokeWidth={2}
          fill="url(#scoreGrad)"
          dot={false}
          activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
          animationDuration={800}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
