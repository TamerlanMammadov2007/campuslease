import { useState } from "react"

import { MobileHeader } from "@/components/layout/MobileHeader"
import { Sidebar } from "@/components/layout/Sidebar"
import { cn } from "@/lib/utils"

export function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <MobileHeader open={open} onToggle={() => setOpen((prev) => !prev)} />
        <div
          className={cn(
            "fixed inset-0 z-40 hidden bg-black/60 lg:hidden",
            open && "block",
          )}
          onClick={() => setOpen(false)}
        />
        <div
          className={cn(
            "fixed left-0 top-0 z-50 h-full w-72 -translate-x-full transition-transform lg:static lg:translate-x-0",
            open && "translate-x-0",
          )}
        >
          <Sidebar onNavigate={() => setOpen(false)} />
        </div>
        <main className="flex-1 px-4 pb-16 pt-8 md:px-6 lg:px-10 lg:pt-12 2xl:px-12">
          {children}
        </main>
      </div>
    </div>
  )
}
