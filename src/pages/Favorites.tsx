import { Heart } from "lucide-react"
import { Link } from "react-router-dom"

import { SectionHeader } from "@/components/SectionHeader"
import { Card, CardContent } from "@/components/ui/card"
import { PropertyCard } from "@/components/properties/PropertyCard"
import { useApp } from "@/context/AppContext"
import { useProperties } from "@/hooks/useProperties"
import { Button } from "@/components/ui/button"

export function Favorites() {
  const { favorites } = useApp()
  const { data: properties = [] } = useProperties()
  const favoriteProperties = properties.filter((property) =>
    favorites.includes(property.id),
  )

  if (favoriteProperties.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center text-slate-200">
          <Heart size={32} />
          <p>No favorites yet.</p>
          <Button asChild>
            <Link to="/browse">Browse Properties</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Favorites"
        title="Saved Listings"
        subtitle="Your curated collection of CampusLease properties."
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {favoriteProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  )
}
