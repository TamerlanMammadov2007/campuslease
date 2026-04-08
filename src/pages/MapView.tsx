import React from "react"
import { GoogleMap, OverlayView, InfoWindow, useLoadScript } from "@react-google-maps/api"
import { Link } from "react-router-dom"
import { Bed, Bath, X } from "lucide-react"

import { Breadcrumb } from "@/components/Breadcrumb"
import { PropertyFilters } from "@/components/properties/PropertyFilters"
import type { PropertyFiltersState } from "@/components/properties/PropertyFilters"
import { Button } from "@/components/ui/button"
import { useProperties } from "@/hooks/useProperties"

const defaultFilters: PropertyFiltersState = {
  query: "",
  university: "",
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

const defaultImage =
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=600&auto=format&fit=crop"

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
    )
      return false
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
      !filters.amenities.every((a) => property.amenities.includes(a))
    )
      return false
    return true
  })

  const mapCenter =
    filtered[0]?.coordinates ?? properties[0]?.coordinates ?? {
      lat: 30.2849,
      lng: -97.7361,
    }

  const selected = filtered.find((p) => p.id === selectedId)

  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: "Map View" }]} />
      <PropertyFilters value={filters} onChange={setFilters} />

      <div className="flex gap-4" style={{ height: "calc(100vh - 220px)", minHeight: 500 }}>
        {/* Map */}
        <div className="flex-1 overflow-hidden rounded-3xl border border-white/10">
          {!apiKey ? (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-slate-300">
              Add VITE_GOOGLE_MAPS_API_KEY to your environment to load the map.
            </div>
          ) : loadError ? (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-red-200">
              Google Maps failed to load. Check your API key.
            </div>
          ) : !isLoaded ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-300">
              Loading map...
            </div>
          ) : (
            <GoogleMap
              key={`${mapCenter.lat}-${mapCenter.lng}`}
              center={mapCenter}
              zoom={12}
              mapContainerClassName="h-full w-full"
              options={{
                clickableIcons: false,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                zoomControlOptions: {
                  position: (window as any).google.maps.ControlPosition.RIGHT_BOTTOM,
                },
              }}
            >
              {filtered.map((property) => (
                <OverlayView
                  key={property.id}
                  position={property.coordinates}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                >
                  <button
                    onClick={() =>
                      setSelectedId(
                        selectedId === property.id ? null : property.id,
                      )
                    }
                    style={{
                      transform: "translate(-50%, -100%)",
                      whiteSpace: "nowrap",
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold shadow-lg transition-transform hover:scale-105 ${
                      selectedId === property.id
                        ? "bg-orange-400 text-slate-900"
                        : "bg-slate-900 text-white"
                    }`}
                  >
                    ${property.price.toLocaleString()}/mo
                  </button>
                </OverlayView>
              ))}

              {selected ? (
                <InfoWindow
                  position={selected.coordinates}
                  onCloseClick={() => setSelectedId(null)}
                  options={{ pixelOffset: new (window as any).google.maps.Size(0, -40) }}
                >
                  <div className="w-56 overflow-hidden rounded-xl">
                    <div className="relative">
                      <img
                        src={selected.images[0] ?? defaultImage}
                        alt={selected.title}
                        className="h-32 w-full object-cover"
                      />
                    </div>
                    <div className="space-y-1.5 p-3">
                      <p className="text-sm font-semibold leading-tight text-slate-900">
                        {selected.title}
                      </p>
                      <p className="text-sm font-bold text-slate-900">
                        ${selected.price.toLocaleString()}/mo
                      </p>
                      <div className="flex gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <Bed size={12} /> {selected.bedrooms} Bed
                        </span>
                        <span className="flex items-center gap-1">
                          <Bath size={12} /> {selected.bathrooms} Bath
                        </span>
                      </div>
                      <Link
                        to={`/properties/${selected.id}`}
                        className="mt-2 block rounded-lg bg-slate-900 px-3 py-1.5 text-center text-xs font-semibold text-white hover:bg-slate-700"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </InfoWindow>
              ) : null}
            </GoogleMap>
          )}
        </div>

        {/* Listing panel */}
        <div className="hidden w-80 flex-shrink-0 overflow-y-auto lg:block">
          <p className="mb-3 text-sm text-slate-300">
            {filtered.length} listing{filtered.length !== 1 ? "s" : ""} found
          </p>
          <div className="space-y-3">
            {filtered.map((property) => (
              <button
                key={property.id}
                onClick={() =>
                  setSelectedId(
                    selectedId === property.id ? null : property.id,
                  )
                }
                className={`w-full overflow-hidden rounded-2xl border text-left transition ${
                  selectedId === property.id
                    ? "border-orange-400/60 bg-orange-400/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <img
                  src={property.images[0] ?? defaultImage}
                  alt={property.title}
                  className="h-32 w-full object-cover"
                />
                <div className="space-y-1 p-3">
                  <p className="text-sm font-semibold text-white line-clamp-1">
                    {property.title}
                  </p>
                  <p className="text-xs text-slate-400">{property.city}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-orange-300">
                      ${property.price.toLocaleString()}/mo
                    </span>
                    <span className="text-xs text-slate-400">
                      {property.bedrooms}bd · {property.bathrooms}ba
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
