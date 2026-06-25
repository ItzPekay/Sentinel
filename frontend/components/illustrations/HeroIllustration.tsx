"use client"
import { motion } from "framer-motion"

interface Props {
  className?: string
}

export function HeroIllustration({ className = "" }: Props) {
  return (
    <div className={`relative pointer-events-none select-none ${className}`}>
      <svg width="420" height="440" viewBox="0 0 420 440" fill="none">
        <defs>
          <radialGradient id="hero-head-g" cx="50%" cy="42%" r="58%">
            <stop offset="0%" stopColor="#FDE8D8" stopOpacity="0.82" />
            <stop offset="100%" stopColor="#FDBA74" stopOpacity="0.22" />
          </radialGradient>
          <radialGradient id="hero-body-g" cx="50%" cy="25%" r="70%">
            <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#F97316" stopOpacity="0.08" />
          </radialGradient>
          <radialGradient id="hero-glow-g" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E85D04" stopOpacity="0.09" />
            <stop offset="100%" stopColor="#E85D04" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient background glow */}
        <circle cx="210" cy="185" r="200" fill="url(#hero-glow-g)" />

        {/* Shoulders / chest */}
        <path
          d="M 118,240 C 78,262 52,308 46,380 L 46,440 L 374,440 L 374,380 C 368,308 342,262 302,240 C 272,226 238,220 210,220 C 182,220 148,226 118,240 Z"
          fill="url(#hero-body-g)"
          stroke="#FDBA74"
          strokeWidth="0.8"
          strokeOpacity="0.35"
        />

        {/* Neck */}
        <path
          d="M 192,210 C 192,226 198,238 210,240 C 222,238 228,226 228,210 Z"
          fill="#FDE8D8"
          fillOpacity="0.48"
        />

        {/* Head — organic slight oval */}
        <ellipse
          cx="210"
          cy="148"
          rx="92"
          ry="104"
          fill="url(#hero-head-g)"
          stroke="#FDBA74"
          strokeWidth="1"
          strokeOpacity="0.45"
        />

        {/* Subtle face features */}
        {/* Eyes */}
        <ellipse cx="178" cy="140" rx="11" ry="7" fill="#E85D04" fillOpacity="0.08" />
        <ellipse cx="242" cy="140" rx="11" ry="7" fill="#E85D04" fillOpacity="0.08" />
        {/* Mouth hint */}
        <path d="M 192,180 C 200,186 220,186 228,180" stroke="#E85D04" strokeWidth="0.8" strokeOpacity="0.12" strokeLinecap="round" fill="none" />

        {/* Neural pathways */}
        {/* Upper left */}
        <path d="M 172,72 C 148,52 112,38 72,28" stroke="#E85D04" strokeWidth="1.3" strokeOpacity="0.38" fill="none" strokeLinecap="round" />
        {/* Upper right */}
        <path d="M 248,72 C 272,52 308,38 348,28" stroke="#E85D04" strokeWidth="1.3" strokeOpacity="0.38" fill="none" strokeLinecap="round" />
        {/* Far left */}
        <path d="M 120,140 C 88,135 52,128 22,122" stroke="#D97706" strokeWidth="1" strokeOpacity="0.32" fill="none" strokeLinecap="round" />
        {/* Far right */}
        <path d="M 300,140 C 332,135 368,128 398,122" stroke="#D97706" strokeWidth="1" strokeOpacity="0.32" fill="none" strokeLinecap="round" />
        {/* Lower left */}
        <path d="M 132,210 C 104,228 78,252 58,278" stroke="#E85D04" strokeWidth="1" strokeOpacity="0.28" fill="none" strokeLinecap="round" />
        {/* Lower right */}
        <path d="M 288,210 C 316,228 342,252 362,278" stroke="#E85D04" strokeWidth="1" strokeOpacity="0.28" fill="none" strokeLinecap="round" />
        {/* Top center */}
        <path d="M 210,44 C 210,28 210,14 210,4" stroke="#E85D04" strokeWidth="1.3" strokeOpacity="0.42" fill="none" strokeLinecap="round" />

        {/* Geometric nodes at pathway endpoints */}
        <circle cx="72" cy="28" r="7.5" fill="#E85D04" fillOpacity="0.88" />
        <circle cx="348" cy="28" r="7.5" fill="#E85D04" fillOpacity="0.88" />
        <circle cx="22" cy="122" r="5.5" fill="#D97706" fillOpacity="0.78" />
        <circle cx="398" cy="122" r="5.5" fill="#D97706" fillOpacity="0.78" />
        <circle cx="58" cy="278" r="5" fill="#E85D04" fillOpacity="0.72" />
        <circle cx="362" cy="278" r="5" fill="#E85D04" fillOpacity="0.72" />
        <circle cx="210" cy="4" r="6" fill="#E85D04" fillOpacity="0.92" />

        {/* Secondary nodes along pathways */}
        <circle cx="122" cy="52" r="4" fill="#D97706" fillOpacity="0.62" />
        <circle cx="298" cy="52" r="4" fill="#D97706" fillOpacity="0.62" />
        <circle cx="70" cy="186" r="3.5" fill="#E85D04" fillOpacity="0.5" />
        <circle cx="350" cy="186" r="3.5" fill="#E85D04" fillOpacity="0.5" />

        {/* Geometric connecting lines between outer nodes */}
        <path d="M 72,28 L 22,122 L 58,278" stroke="#E85D04" strokeWidth="0.7" strokeOpacity="0.18" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 348,28 L 398,122 L 362,278" stroke="#E85D04" strokeWidth="0.7" strokeOpacity="0.18" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M 72,28 L 210,4 L 348,28" stroke="#D97706" strokeWidth="0.7" strokeOpacity="0.18" fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {/* Pulse ring — chest area */}
        <circle cx="210" cy="342" r="22" fill="#E85D04" fillOpacity="0.1" stroke="#E85D04" strokeWidth="1.2" strokeOpacity="0.45" />
        {/* Heart */}
        <path
          d="M 210,352 C 210,352 196,340 196,333 C 196,328 200,324 205,324 C 207,324 209,325 210,327 C 211,325 213,324 215,324 C 220,324 224,328 224,333 C 224,340 210,352 210,352 Z"
          fill="white"
          fillOpacity="0.88"
        />
      </svg>

      {/* Animated pulse rings rendered as a DOM overlay */}
      <motion.div
        className="absolute rounded-full border border-[#E85D04]/30"
        style={{ width: 56, height: 56, left: "50%", top: 342, x: "-50%", y: "-50%" }}
        animate={{ scale: [1, 2.4], opacity: [0.5, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.div
        className="absolute rounded-full border border-[#E85D04]/20"
        style={{ width: 56, height: 56, left: "50%", top: 342, x: "-50%", y: "-50%" }}
        animate={{ scale: [1, 2.4], opacity: [0.4, 0] }}
        transition={{ duration: 2.2, delay: 0.9, repeat: Infinity, ease: "easeOut" }}
      />
    </div>
  )
}
