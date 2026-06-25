"use client"
import { motion } from "framer-motion"

interface Props {
  className?: string
  size?: number
  animate?: boolean
}

export function BrainIllustration({ className = "", size = 120, animate = true }: Props) {
  const content = (
    <svg width={size} height={size * 0.9} viewBox="0 0 120 108" fill="none">
      <defs>
        <radialGradient id="bl-left" cx="35%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#FDE8D8" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FDBA74" stopOpacity="0.45" />
        </radialGradient>
        <radialGradient id="bl-right" cx="65%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#F97316" stopOpacity="0.35" />
        </radialGradient>
      </defs>

      {/* Left lobe */}
      <path
        d="M 58,82 C 40,82 14,70 12,50 C 8,28 22,8 42,13 C 48,5 56,8 58,22 C 58,42 58,64 58,82 Z"
        fill="url(#bl-left)"
        stroke="#FDBA74"
        strokeWidth="0.6"
        strokeOpacity="0.55"
      />
      {/* Right lobe */}
      <path
        d="M 62,82 C 80,82 106,69 108,49 C 112,27 98,7 78,13 C 72,5 64,8 62,22 C 62,42 62,64 62,82 Z"
        fill="url(#bl-right)"
        stroke="#FDBA74"
        strokeWidth="0.6"
        strokeOpacity="0.45"
      />
      {/* Brain stem */}
      <path
        d="M 54,82 C 54,90 56,97 60,98 C 64,97 66,90 66,82"
        fill="#FDBA74"
        fillOpacity="0.35"
      />
      {/* Center fissure */}
      <path
        d="M 60,22 C 59,36 59,58 60,82"
        stroke="#E85D04"
        strokeWidth="0.7"
        strokeOpacity="0.2"
        fill="none"
      />

      {/* Left sulci */}
      <path d="M 20,36 C 30,28 42,26 50,32" stroke="#E85D04" strokeWidth="0.8" strokeOpacity="0.22" strokeLinecap="round" fill="none" />
      <path d="M 17,53 C 27,46 39,44 49,48" stroke="#E85D04" strokeWidth="0.8" strokeOpacity="0.22" strokeLinecap="round" fill="none" />
      <path d="M 21,69 C 31,63 43,61 51,65" stroke="#E85D04" strokeWidth="0.8" strokeOpacity="0.18" strokeLinecap="round" fill="none" />

      {/* Right sulci */}
      <path d="M 100,36 C 90,28 78,26 70,32" stroke="#E85D04" strokeWidth="0.8" strokeOpacity="0.22" strokeLinecap="round" fill="none" />
      <path d="M 103,53 C 93,46 81,44 71,48" stroke="#E85D04" strokeWidth="0.8" strokeOpacity="0.22" strokeLinecap="round" fill="none" />
      <path d="M 99,69 C 89,63 77,61 69,65" stroke="#E85D04" strokeWidth="0.8" strokeOpacity="0.18" strokeLinecap="round" fill="none" />

      {/* Outer neural nodes */}
      <circle cx="8" cy="32" r="3.5" fill="#E85D04" fillOpacity="0.82" />
      <circle cx="22" cy="8" r="2.5" fill="#D97706" fillOpacity="0.72" />
      <circle cx="60" cy="4" r="3" fill="#E85D04" fillOpacity="0.9" />
      <circle cx="98" cy="8" r="2.5" fill="#D97706" fillOpacity="0.72" />
      <circle cx="112" cy="32" r="3.5" fill="#E85D04" fillOpacity="0.82" />
      <circle cx="6" cy="60" r="2" fill="#D97706" fillOpacity="0.6" />
      <circle cx="114" cy="60" r="2" fill="#D97706" fillOpacity="0.6" />

      {/* Neural connection lines */}
      <polyline
        points="8,32 22,8 60,4 98,8 112,32"
        stroke="#E85D04"
        strokeWidth="0.8"
        strokeOpacity="0.32"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="8" y1="32" x2="6" y2="60" stroke="#D97706" strokeWidth="0.8" strokeOpacity="0.28" strokeLinecap="round" />
      <line x1="112" y1="32" x2="114" y2="60" stroke="#D97706" strokeWidth="0.8" strokeOpacity="0.28" strokeLinecap="round" />
    </svg>
  )

  if (!animate) return <div className={`pointer-events-none ${className}`}>{content}</div>

  return (
    <motion.div
      className={`pointer-events-none ${className}`}
      animate={{ scale: [1, 1.03, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {content}
    </motion.div>
  )
}
