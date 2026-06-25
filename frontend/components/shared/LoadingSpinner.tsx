export function LoadingSpinner({ className = "" }: { className?: string }) {
  return (
    <div className={`relative h-10 w-10 ${className}`}>
      <div className="absolute inset-0 animate-spin rounded-full border-2 border-warm-border border-t-[#E85D04]" />
      <div className="absolute inset-1 animate-spin rounded-full border-2 border-warm-border border-t-[#D97706]" style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
    </div>
  )
}
