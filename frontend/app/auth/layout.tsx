export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-warm-900">
      {/* Left branding panel — desktop only */}
      <div className="hidden md:flex md:w-[420px] lg:w-[500px] flex-col justify-between flex-shrink-0 relative overflow-hidden border-r border-warm-border"
        style={{ background: "linear-gradient(160deg, #FFF7ED 0%, #FEF3C7 60%, #FDF8F3 100%)" }}>
        {/* Ambient glows */}
        <div className="absolute top-0 left-0 h-80 w-80 rounded-full bg-[#E85D04]/10 blur-[80px]" />
        <div className="absolute bottom-0 right-0 h-60 w-60 rounded-full bg-[#D97706]/10 blur-[80px]" />
        <div className="bg-neural-dots absolute inset-0 opacity-60" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#E85D04] to-[#C2410C] flex items-center justify-center shadow-glow">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <p className="font-playfair text-xl font-bold text-[#1C1410]">Sentinel</p>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-warm">Stroke Predictor</p>
            </div>
          </div>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="font-playfair text-4xl font-bold leading-tight text-[#1C1410]">
              Protecting those<br />
              <span className="text-gradient-electric">who matter most.</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-gray-warm max-w-sm">
              Sentinel watches over your loved ones using AI — monitoring speech patterns,
              camera feeds, and blood glucose in real time.
            </p>

            {/* Mini ECG display */}
            <div className="mt-10 rounded-2xl bg-white border border-warm-border p-4 overflow-hidden shadow-card">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-warm">Neural Activity</p>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-live" />
                  <span className="text-xs text-emerald-600 font-semibold">LIVE</span>
                </div>
              </div>
              <div className="relative h-14 overflow-hidden rounded-lg bg-warm-950">
                <div className="absolute inset-0 flex" style={{ width: "200%" }}>
                  {[0, 1].map((i) => (
                    <svg key={i} viewBox="0 0 640 56" className="flex-none animate-ecg-scroll"
                      style={{ width: "50%" }} preserveAspectRatio="none">
                      <path
                        d="M 0,28 L 40,28 L 55,28 C 62,28 66,21 70,17 C 74,13 78,16 82,28 L 86,28 L 89,34 L 94,4 L 99,50 L 104,28 L 116,28 C 124,28 130,20 135,17 C 140,14 145,20 150,28 L 320,28 L 335,28 C 342,28 346,21 350,17 C 354,13 358,16 362,28 L 366,28 L 369,34 L 374,4 L 379,50 L 384,28 L 396,28 C 404,28 410,20 415,17 C 420,14 425,20 430,28 L 640,28"
                        className="ecg-line-electric"
                      />
                      <path
                        d="M 0,28 L 40,28 L 55,28 C 62,28 66,21 70,17 C 74,13 78,16 82,28 L 86,28 L 89,34 L 94,4 L 99,50 L 104,28 L 116,28 C 124,28 130,20 135,17 C 140,14 145,20 150,28 L 320,28 L 335,28 C 342,28 346,21 350,17 C 354,13 358,16 362,28 L 366,28 L 369,34 L 374,4 L 379,50 L 384,28 L 396,28 C 404,28 410,20 415,17 C 420,14 425,20 430,28 L 640,28"
                        className="ecg-line-glow"
                      />
                    </svg>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature pills */}
            <div className="mt-6 flex flex-wrap gap-2">
              {["Speech Analysis", "Camera Detection", "Blood Glucose", "Emergency Alerts"].map((f) => (
                <span key={f} className="rounded-full border border-warm-border bg-white px-3 py-1 text-xs text-gray-warm shadow-sm">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-warm/70">© 2024 Sentinel · Your data is encrypted and never sold</p>
        </div>
      </div>

      {/* Right: form area */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-warm-900 min-h-screen">
        {children}
      </div>
    </div>
  )
}
