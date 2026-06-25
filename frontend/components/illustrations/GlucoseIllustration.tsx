interface Props {
  className?: string
  size?: number
}

export function GlucoseIllustration({ className = "", size = 80 }: Props) {
  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 80 96"
      fill="none"
      className={`pointer-events-none ${className}`}
    >
      <defs>
        <radialGradient id="glucose-fill" cx="45%" cy="38%" r="62%">
          <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.28" />
        </radialGradient>
      </defs>

      {/* Droplet body */}
      <path
        d="M 40,6 C 40,6 8,48 8,66 C 8,84 22,94 40,94 C 58,94 72,84 72,66 C 72,48 40,6 40,6 Z"
        fill="url(#glucose-fill)"
        stroke="#7C3AED"
        strokeWidth="1.2"
        strokeOpacity="0.45"
      />

      {/* Inner hex center */}
      <polygon
        points="40,50 51,56 51,70 40,76 29,70 29,56"
        stroke="#7C3AED"
        strokeWidth="0.9"
        strokeOpacity="0.5"
        fill="#7C3AED"
        fillOpacity="0.07"
      />

      {/* Crystal rays from hex vertices */}
      <line x1="40" y1="38" x2="40" y2="50" stroke="#7C3AED" strokeWidth="0.8" strokeOpacity="0.38" />
      <line x1="51" y1="56" x2="62" y2="51" stroke="#7C3AED" strokeWidth="0.8" strokeOpacity="0.3" />
      <line x1="51" y1="70" x2="62" y2="75" stroke="#7C3AED" strokeWidth="0.8" strokeOpacity="0.3" />
      <line x1="40" y1="76" x2="40" y2="88" stroke="#7C3AED" strokeWidth="0.8" strokeOpacity="0.28" />
      <line x1="29" y1="70" x2="18" y2="75" stroke="#7C3AED" strokeWidth="0.8" strokeOpacity="0.3" />
      <line x1="29" y1="56" x2="18" y2="51" stroke="#7C3AED" strokeWidth="0.8" strokeOpacity="0.3" />

      {/* Outer nodes */}
      <circle cx="40" cy="38" r="2.5" fill="#7C3AED" fillOpacity="0.72" />
      <circle cx="62" cy="51" r="2" fill="#7C3AED" fillOpacity="0.55" />
      <circle cx="62" cy="75" r="2" fill="#7C3AED" fillOpacity="0.55" />
      <circle cx="40" cy="88" r="2" fill="#7C3AED" fillOpacity="0.5" />
      <circle cx="18" cy="75" r="2" fill="#7C3AED" fillOpacity="0.55" />
      <circle cx="18" cy="51" r="2" fill="#7C3AED" fillOpacity="0.55" />

      {/* Outer hex ring connecting nodes */}
      <polygon
        points="40,38 62,51 62,75 40,88 18,75 18,51"
        stroke="#7C3AED"
        strokeWidth="0.6"
        strokeOpacity="0.22"
        fill="none"
        strokeDasharray="3 3"
      />

      {/* Highlight */}
      <ellipse cx="30" cy="36" rx="8" ry="5" fill="white" fillOpacity="0.2" transform="rotate(-30 30 36)" />
    </svg>
  )
}
