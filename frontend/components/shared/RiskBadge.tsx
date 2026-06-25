import { clsx } from "clsx"
import type { Classification } from "@/lib/types"

interface Props { classification: Classification | null; size?: "sm" | "md" | "lg" }

const MAP: Record<string, { border: string; text: string; bg: string; dot: string; label: string }> = {
  "Non Stroke": {
    border: "border-emerald-200",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    label: "Non Stroke",
  },
  Warning: {
    border: "border-amber-200",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    label: "Warning",
  },
  Stroke: {
    border: "border-red-200",
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
    label: "Stroke Detected",
  },
}

export function RiskBadge({ classification, size = "md" }: Props) {
  if (!classification) return null
  const { border, bg, text, dot, label } = MAP[classification] ?? MAP["Non Stroke"]
  return (
    <span className={clsx(
      "inline-flex items-center gap-1.5 rounded-full font-sans font-semibold border",
      border, bg, text,
      size === "sm" && "px-2.5 py-0.5 text-xs",
      size === "md" && "px-3 py-1 text-sm",
      size === "lg" && "px-4 py-1.5 text-base",
    )}>
      <span className={clsx("rounded-full", dot,
        size === "sm" ? "h-1 w-1" : "h-1.5 w-1.5",
        classification === "Stroke" && "animate-live",
      )} />
      {label}
    </span>
  )
}
