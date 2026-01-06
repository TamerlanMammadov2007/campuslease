import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"

type MobileHeaderProps = {
  open: boolean
  onToggle: () => void
}

export function MobileHeader({ open, onToggle }: MobileHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-slate-950/60 px-4 py-4 backdrop-blur lg:hidden">
      <div>
        <p className="text-lg font-semibold text-white">CampusLease</p>
        <p className="text-xs text-slate-300">Student Housing</p>
      </div>
      <Button variant="ghost" size="icon" onClick={onToggle}>
        {open ? <X size={20} /> : <Menu size={20} />}
      </Button>
    </header>
  )
}
