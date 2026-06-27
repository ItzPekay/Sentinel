"use client"
import { motion } from "framer-motion"

interface Props {
  className?: string
  size?: number
}

export function FaceScanIllustration({ className = "", size = 200 }: Props) {
  return (
    <div className={`pointer-events-none ${className}`}>
      <svg width={size} height={size * 1.1} viewBox="0 0 200 220" fill="none">
        {/* Corner brackets */}
        <path d="M 18,18 L 18,46 M 18,18 L 46,18" stroke="#0EA5E9" strokeWidth="2.2" strokeOpacity="0.85" strokeLinecap="round" />
        <path d="M 182,18 L 182,46 M 182,18 L 154,18" stroke="#0EA5E9" strokeWidth="2.2" strokeOpacity="0.85" strokeLinecap="round" />
        <path d="M 18,202 L 18,174 M 18,202 L 46,202" stroke="#0EA5E9" strokeWidth="2.2" strokeOpacity="0.85" strokeLinecap="round" />
        <path d="M 182,202 L 182,174 M 182,202 L 154,202" stroke="#0EA5E9" strokeWidth="2.2" strokeOpacity="0.85" strokeLinecap="round" />

        {/* Scan grid — horizontal */}
        {[38, 55, 72, 90, 110, 128, 145, 162].map((y) => (
          <line key={`h${y}`} x1="38" y1={y} x2="162" y2={y} stroke="#0EA5E9" strokeWidth="0.5" strokeOpacity="0.12" />
        ))}
        {/* Scan grid — vertical */}
        {[55, 80, 100, 120, 145].map((x) => (
          <line key={`v${x}`} x1={x} y1="18" x2={x} y2="202" stroke="#0EA5E9" strokeWidth="0.5" strokeOpacity="0.12" />
        ))}

        {/* Face oval */}
        <ellipse cx="100" cy="100" rx="60" ry="78" stroke="#0EA5E9" strokeWidth="1.5" strokeOpacity="0.45" fill="#F0F9FF" fillOpacity="0.25" />

        {/* Dashed detection ring around face */}
        <ellipse cx="100" cy="100" rx="66" ry="84" stroke="#0EA5E9" strokeWidth="0.8" strokeOpacity="0.28" strokeDasharray="5 4" fill="none" />

        {/* Eyes */}
        <ellipse cx="74" cy="86" rx="9" ry="7" stroke="#0EA5E9" strokeWidth="1.2" strokeOpacity="0.55" fill="#E0F2FE" fillOpacity="0.35" />
        <ellipse cx="126" cy="86" rx="9" ry="7" stroke="#0EA5E9" strokeWidth="1.2" strokeOpacity="0.55" fill="#E0F2FE" fillOpacity="0.35" />
        <circle cx="74" cy="86" r="3" fill="#0EA5E9" fillOpacity="0.7" />
        <circle cx="126" cy="86" r="3" fill="#0EA5E9" fillOpacity="0.7" />

        {/* Eye detection boxes */}
        <rect x="62" y="77" width="24" height="18" rx="3" stroke="#0EA5E9" strokeWidth="0.7" strokeOpacity="0.35" fill="none" strokeDasharray="3 2" />
        <rect x="114" y="77" width="24" height="18" rx="3" stroke="#0EA5E9" strokeWidth="0.7" strokeOpacity="0.35" fill="none" strokeDasharray="3 2" />

        {/* Nose */}
        <path d="M 100,100 L 92,122 C 92,127 96,130 100,130 C 104,130 108,127 108,122 Z" stroke="#0EA5E9" strokeWidth="1" strokeOpacity="0.38" fill="none" strokeLinejoin="round" />

        {/* Mouth */}
        <path d="M 78,148 C 88,160 112,160 122,148" stroke="#0EA5E9" strokeWidth="1.2" strokeOpacity="0.48" fill="none" strokeLinecap="round" />
        {/* Mouth detection */}
        <rect x="74" y="142" width="52" height="22" rx="4" stroke="#0EA5E9" strokeWidth="0.7" strokeOpacity="0.3" fill="none" strokeDasharray="3 2" />

        {/* Animated scan line */}
        <motion.g
          animate={{ y: [0, 184, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <line x1="38" y1="18" x2="162" y2="18" stroke="#0EA5E9" strokeWidth="1.5" strokeOpacity="0.55" />
        </motion.g>

        {/* Labels */}
        <text x="20" y="12" fill="#0EA5E9" fillOpacity="0.55" style={{ fontSize: 7, fontFamily: "monospace", letterSpacing: 1 }}>FACE_SCAN</text>
        <text x="148" y="12" fill="#0EA5E9" fillOpacity="0.55" style={{ fontSize: 7, fontFamily: "monospace" }}>LIVE</text>
        <text x="20" y="214" fill="#0EA5E9" fillOpacity="0.4" style={{ fontSize: 7, fontFamily: "monospace" }}>AI_DETECT</text>
        <text x="148" y="214" fill="#0EA5E9" fillOpacity="0.4" style={{ fontSize: 7, fontFamily: "monospace" }}>v2.1</text>

        {/* Face measurement lines */}
        <line x1="40" y1="86" x2="63" y2="86" stroke="#0EA5E9" strokeWidth="0.6" strokeOpacity="0.3" strokeDasharray="2 2" />
        <line x1="137" y1="86" x2="160" y2="86" stroke="#0EA5E9" strokeWidth="0.6" strokeOpacity="0.3" strokeDasharray="2 2" />
      </svg>
    </div>
  )
}
