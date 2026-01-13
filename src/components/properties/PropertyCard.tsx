import { Heart, MapPin, Square, BedDouble, Bath, CheckSquare } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useApp } from "@/context/AppContext"
import type { Property } from "@/data/types"
import { cn } from "@/lib/utils"

type PropertyCardProps = {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  const { favorites, toggleFavorite, compareIds, toggleCompare, isAuthenticated } = useApp()
  const isFavorite = favorites.includes(property.id)
  const isCompared = compareIds.includes(property.id)
  const compareDisabled = !isCompared && compareIds.length >= 4

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <img
          src={
            property.images[0] ??
            "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop"
          }
          alt={property.title}
          className="h-48 w-full object-cover"
          loading="lazy"
        />
        <Badge variant="amber" className="absolute left-4 top-4">
          ${property.price}/mo
        </Badge>
        <button
          className={cn(
            "absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-slate-900/60 text-white transition",
            isFavorite && "bg-rose-500/90 text-white",
          )}
          onClick={() => {
            if (!isAuthenticated) {
              toast.error("Please log in to save favorites.")
              return
            }
            toggleFavorite(property.id)
            toast(isFavorite ? "Removed from favorites." : "Saved to favorites.")
          }}
          aria-label="Toggle favorite"
        >
          <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Link
            to={`/properties/${property.id}`}
            className="text-lg font-semibold text-white hover:text-orange-200"
          >
            {property.title}
          </Link>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <MapPin size={14} />
            {property.address}, {property.city}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-200">
          <span className="flex items-center gap-1">
            <BedDouble size={14} /> {property.bedrooms} bd
          </span>
          <span className="flex items-center gap-1">
            <Bath size={14} /> {property.bathrooms} ba
          </span>
          <span className="flex items-center gap-1">
            <Square size={14} /> {property.squareFeet} sqft
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <Button asChild size="sm" variant="outline">
            <Link to={`/properties/${property.id}`}>View Details</Link>
          </Button>
        <button
          onClick={() => {
            if (!isAuthenticated) {
              toast.error("Please log in to compare listings.")
              return
            }
            toggleCompare(property.id)
          }}
          className={cn(
              "flex items-center gap-2 rounded-full border border-white/20 px-3 py-2 text-xs text-white transition",
              isCompared && "border-orange-300/80 bg-orange-400/20 text-orange-100",
              compareDisabled && "cursor-not-allowed opacity-40",
            )}
            disabled={compareDisabled}
          >
            {isCompared ? (
              <CheckSquare size={14} />
            ) : (
              <Square size={14} />
            )}
            Compare
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
