import { Link, useParams } from "react-router-dom"
import { MapPin } from "lucide-react"

import { SEO } from "@/components/SEO"
import { SectionHeader } from "@/components/SectionHeader"
import { PropertyCard } from "@/components/properties/PropertyCard"
import { PropertyGridSkeleton } from "@/components/skeletons/PropertyCardSkeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useProperties } from "@/hooks/useProperties"

const CITY_META: Record<string, { label: string; university: string; description: string }> = {
  austin: {
    label: "Austin",
    university: "University of Texas at Austin",
    description: "Find student housing near UT Austin. Browse apartments, houses, and studios available for rent in Austin, TX.",
  },
  atlanta: {
    label: "Atlanta",
    university: "Georgia Tech & Emory University",
    description: "Student housing near Georgia Tech and Emory. Find affordable rentals in Atlanta, GA.",
  },
  minneapolis: {
    label: "Minneapolis",
    university: "University of Minnesota",
    description: "Student housing near the University of Minnesota. Browse listings in Minneapolis, MN.",
  },
  boston: {
    label: "Boston",
    university: "Boston University & Northeastern",
    description: "Find student housing near Boston University, Northeastern, and more. Browse rentals in Boston, MA.",
  },
  "los-angeles": {
    label: "Los Angeles",
    university: "UCLA & USC",
    description: "Student housing near UCLA and USC. Find apartments and rooms for rent in Los Angeles, CA.",
  },
  "new-york": {
    label: "New York",
    university: "NYU & Columbia",
    description: "Student housing near NYU and Columbia University. Browse listings in New York, NY.",
  },
  chicago: {
    label: "Chicago",
    university: "University of Chicago & Northwestern",
    description: "Student housing near University of Chicago and Northwestern. Browse listings in Chicago, IL.",
  },
  houston: {
    label: "Houston",
    university: "University of Houston & Rice",
    description: "Student housing near University of Houston and Rice University. Browse listings in Houston, TX.",
  },
}

export function CityPage() {
  const { city } = useParams<{ city: string }>()
  const { data: properties = [], isLoading } = useProperties()

  const slug = city?.toLowerCase() ?? ""
  const meta = CITY_META[slug]
  const cityLabel = meta?.label ?? (city ? city.charAt(0).toUpperCase() + city.slice(1) : "")

  const cityListings = properties.filter((p) =>
    p.city.toLowerCase().includes(cityLabel.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12">
      <div className="mx-auto max-w-6xl space-y-10">
        <SEO
          title={`Student Housing in ${cityLabel}`}
          description={meta?.description ?? `Find student housing in ${cityLabel}. Browse listings on CampusLease.`}
          url={`/cities/${slug}`}
        />

        <div className="rounded-3xl bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-300 p-8 text-slate-900">
          <div className="flex items-center gap-2 text-sm font-semibold opacity-70">
            <MapPin size={14} /> {cityLabel}
          </div>
          <SectionHeader
            eyebrow="Student Housing"
            title={`Rentals in ${cityLabel}`}
            subtitle={meta?.university ? `Near ${meta.university}` : "Browse available listings"}
          />
          <div className="mt-4 flex gap-3">
            <Button asChild>
              <Link to={`/map?city=${encodeURIComponent(cityLabel)}`}>View on Map</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/map">All Cities</Link>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <PropertyGridSkeleton count={6} />
        ) : cityListings.length === 0 ? (
          <Card className="border border-white/10 bg-white/5">
            <CardContent className="flex flex-col items-center gap-4 py-16 text-center text-slate-300">
              <MapPin size={32} />
              <p className="text-lg font-semibold">No listings in {cityLabel} yet.</p>
              <p className="text-sm text-slate-400">Be the first to list a property here.</p>
              <Button asChild>
                <Link to="/create">List Your Property</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">{cityListings.length} listing{cityListings.length !== 1 ? "s" : ""} available</p>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {cityListings.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
