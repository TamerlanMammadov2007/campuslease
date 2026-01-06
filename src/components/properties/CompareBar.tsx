import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useApp } from "@/context/AppContext"
import type { Property } from "@/data/types"

type CompareBarProps = {
  properties: Property[]
}

export function CompareBar({ properties }: CompareBarProps) {
  const { compareIds, clearCompare } = useApp()

  if (compareIds.length === 0) {
    return null
  }

  const selected = properties.filter((property) =>
    compareIds.includes(property.id),
  )

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 mx-auto w-[min(95%,900px)] rounded-3xl border border-white/10 bg-slate-900/80 p-4 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {selected.map((property) => (
            <div
              key={property.id}
              className="h-12 w-12 overflow-hidden rounded-2xl border border-white/10"
            >
              <img
                src={
                  property.images[0] ??
                  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop"
                }
                alt={property.title}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
          <div>
            <p className="text-sm font-semibold text-white">
              {selected.length} properties selected
            </p>
            <button
              className="text-xs text-slate-300 hover:text-white"
              onClick={clearCompare}
            >
              Clear selection
            </button>
          </div>
        </div>
        <Button asChild>
          <Link to="/compare">Compare</Link>
        </Button>
      </div>
    </div>
  )
}
