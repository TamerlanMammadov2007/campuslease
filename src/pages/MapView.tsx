import React from "react"
import { GoogleMap, InfoWindow, Marker, useLoadScript } from "@react-google-maps/api"
import { Link } from "react-router-dom"

import { PropertyFilters } from "@/components/properties/PropertyFilters"
import type { PropertyFiltersState } from "@/components/properties/PropertyFilters"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useProperties } from "@/hooks/useProperties"

const defaultFilters: PropertyFiltersState = {
  query: "",
  type: "",
  bedrooms: "",
  bathrooms: "",
  minPrice: 800,
  maxPrice: 2500,
  furnished: false,
  pets: false,
  parking: false,
  amenities: [],
}

export function MapView() {
  const { data: properties = [] } = useProperties()
  const [filters, setFilters] = React.useState(defaultFilters)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey ?? "",
  })

  const filtered = properties.filter((property) => {
    if (
      filters.query &&
      !`${property.address} ${property.city}`
        .toLowerCase()
        .includes(filters.query.toLowerCase())
    ) {
      return false
    }
    if (filters.type && property.type !== filters.type) return false
    if (filters.bedrooms && property.bedrooms < Number(filters.bedrooms))
      return false
    if (filters.bathrooms && property.bathrooms < Number(filters.bathrooms))
      return false
    if (property.price < filters.minPrice || property.price > filters.maxPrice)
      return false
    if (filters.furnished && !property.furnished) return false
    if (filters.pets && !property.petsAllowed) return false
    if (filters.parking && !property.parkingAvailable) return false
    if (
      filters.amenities.length &&
      !filters.amenities.every((amenity) => property.amenities.includes(amenity))
    ) {
      return false
    }
    return true
  })

  const mapCenter =
    filtered[0]?.coordinates ?? properties[0]?.coordinates ?? {
      lat: 30.2849,
      lng: -97.7361,
    }

  const selected = filtered.find((property) => property.id === selectedId)
  const defaultImage =
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=300&auto=format&fit=crop"

  const getMarkerIcon = React.useCallback(
    (url?: string) => {
      const maps = (window as any).google?.maps
      if (!maps) return undefined
      const safeUrl = (url || defaultImage).replace(/'/g, "%27")
      return {
        url: safeUrl,
        scaledSize: new maps.Size(54, 54),
        anchor: new maps.Point(27, 54),
      }
    },
    [defaultImage],
  )

  return (
    <div className="space-y-6">
      <PropertyFilters value={filters} onChange={setFilters} />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="h-[520px] overflow-hidden rounded-3xl border border-white/10">
          {!apiKey ? (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-300">
              Add VITE_GOOGLE_MAPS_API_KEY to your .env file to load Google
              Maps.
            </div>
          ) : loadError ? (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-red-200">
              Google Maps failed to load. Check your API key and billing
              settings.
            </div>
          ) : !isLoaded ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-300">
              Loading map...
            </div>
          ) : (
            <GoogleMap
              key={`${mapCenter.lat}-${mapCenter.lng}`}
              center={mapCenter}
              zoom={11}
              mapContainerClassName="h-full w-full"
              options={{
                clickableIcons: false,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
              }}
            >
              {filtered.map((property) => (
                <Marker
                  key={property.id}
                  position={property.coordinates}
                  icon={getMarkerIcon(property.images[0])}
                  onClick={() => setSelectedId(property.id)}
                />
              ))}
              {selected ? (
                <InfoWindow
                  position={selected.coordinates}
                  onCloseClick={() => setSelectedId(null)}
                >
                  <div className="space-y-2">
                    <img
                      src={
                        selected.images[0] ??
                        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop"
                      }
                      alt={selected.title}
                      className="h-20 w-full rounded-lg object-cover"
                    />
                    <div className="text-sm font-semibold">
                      {selected.title}
                    </div>
                    <div className="text-xs text-slate-600">
                      {selected.address}, {selected.city}
                    </div>
                    <div className="text-xs font-semibold text-orange-600">
                      ${selected.price}/mo
                    </div>
                  </div>
                </InfoWindow>
              ) : null}
            </GoogleMap>
          )}
        </div>
        <div className="space-y-4">
          {selected ? (
            <Card className="border border-white/10 bg-white/10">
              <CardContent className="space-y-3">
                <img
                  src={
                    selected.images[0] ??
                    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop"
                  }
                  alt={selected.title}
                  className="h-36 w-full rounded-2xl object-cover"
                />
                <div>
                  <p className="text-lg font-semibold text-white">
                    {selected.title}
                  </p>
                  <p className="text-xs text-slate-300">
                    {selected.address}, {selected.city}
                  </p>
                </div>
                <div className="text-sm text-orange-200">
                  ${selected.price}/mo
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm">
                    <Link to={`/properties/${selected.id}`}>
                      View Details
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedId(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-white/10 bg-white/10">
              <CardContent className="space-y-3 text-sm text-slate-300">
                Select a marker to preview the property.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
