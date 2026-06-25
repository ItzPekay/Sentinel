import { Sidebar } from "@/components/layout/Sidebar"
import { BottomNav } from "@/components/layout/BottomNav"
import { BlobBackground } from "@/components/shared/BlobBackground"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-warm-900">
      <BlobBackground />
      <Sidebar />
      <main className="md:ml-60 min-h-screen pb-24 md:pb-0">
        <div className="mx-auto max-w-2xl px-4 py-8 md:px-8">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
