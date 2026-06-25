interface Props { message: string; submessage?: string }

export function EmptyState({ message, submessage }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-[#E85D04]/15 blur-2xl" />
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="relative">
          <circle cx="40" cy="40" r="36" stroke="#E8DDD5" strokeWidth="2" />
          <circle cx="40" cy="40" r="28" stroke="#E85D04" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.4" />
          <path d="M 20 40 L 28 40 L 34 28 L 40 52 L 46 36 L 50 40 L 60 40"
            stroke="#E85D04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"
            style={{ filter: "drop-shadow(0 0 4px rgba(232,93,4,0.5))" }}
          />
        </svg>
      </div>
      <p className="font-playfair text-xl text-[#1C1410]">{message}</p>
      {submessage && <p className="mt-2 text-sm text-gray-warm max-w-xs">{submessage}</p>}
    </div>
  )
}
