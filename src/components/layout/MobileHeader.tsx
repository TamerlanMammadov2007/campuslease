import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"

type MobileHeaderProps = {
  open: boolean
  onToggle: () => void
}

export function MobileHeader({ open, onToggle }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur lg:hidden">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-amber-400 text-slate-900">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </div>
        <p className="text-base font-semibold text-white">CampusLease</p>
      </div>
      <Button variant="ghost" size="icon" onClick={onToggle} className="h-9 w-9">
        {open ? <X size={20} /> : <Menu size={20} />}
      </Button>
    </header>
  )
}
