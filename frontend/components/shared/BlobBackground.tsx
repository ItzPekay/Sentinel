export function BlobBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Warm orange — top left */}
      <div
        className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full opacity-20 blur-[120px] animate-blob-drift"
        style={{ background: "radial-gradient(circle, #E85D04 0%, transparent 70%)" }}
      />
      {/* Amber — bottom right */}
      <div
        className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full opacity-15 blur-[100px] animate-blob-drift"
        style={{ background: "radial-gradient(circle, #D97706 0%, transparent 70%)", animationDelay: "3s" }}
      />
      {/* Rose — center */}
      <div
        className="absolute top-1/2 left-1/3 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 blur-[90px] animate-blob-drift"
        style={{ background: "radial-gradient(circle, #7C3AED 0%, transparent 70%)", animationDelay: "6s" }}
      />
    </div>
  )
}
