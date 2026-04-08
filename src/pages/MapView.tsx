import React from "react"
import { motion } from "framer-motion"
import { GoogleMap, OverlayView, InfoWindow, useLoadScript } from "@react-google-maps/api"
import { Link } from "react-router-dom"
import { Bed, Bath, MapPin, X } from "lucide-react"

import { Breadcrumb } from "@/components/Breadcrumb"
import { CompareBar } from "@/components/properties/CompareBar"
import { PropertyFilters } from "@/components/properties/PropertyFilters"
import type { PropertyFiltersState } from "@/components/properties/PropertyFilters"
import { PropertyCard } from "@/components/properties/PropertyCard"
import { PropertyGridSkeleton } from "@/components/skeletons/PropertyCardSkeleton"
import { useProperties } from "@/hooks/useProperties"

const defaultFilters: PropertyFiltersState = {
  query: "",
  university: "",
  type: "",
  bedrooms: "",
  bathrooms: "",
  minPrice: 500,
  maxPrice: 3000,
  furnished: false,
  pets: false,
  parking: false,
  amenities: [],
}

const defaultImage =
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=600&auto=format&fit=crop"

export function MapView() {
  const { data: properties = [], isLoading } = useProperties()
  const [filters, setFilters] = React.useState(defaultFilters)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [showFullMap, setShowFullMap] = React.useState(false)
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey ?? "",
  })

  const filtered = properties.filter((property) => {
    if (
      filters.query &&
      !`${property.title} ${property.address} ${property.city}`
        .toLowerCase()
        .includes(filters.query.toLowerCase())
    )
      return false
    if (
      filters.university &&
      !(property.nearbyUniversity ?? "")
        .toLowerCase()
        .includes(filters.university.toLowerCase())
    )
      return false
    if (filters.type && property.type !== filters.type) return false
    if (filters.bedrooms && property.bedrooms < Number(filters.bedrooms)) return false
    if (filters.bathrooms && property.bathrooms < Number(filters.bathrooms)) return false
    if (property.price < filters.minPrice || property.price > filters.maxPrice) return false
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
    filtered[0]?.coordinates ?? properties[0]?.coordinates ?? { lat: 30.2849, lng: -97.7361 }

  const selected = filtered.find((p) => p.id === selectedId)

  const MapComponent = ({ height }: { height: string }) => (
    <div className={`overflow-hidden rounded-2xl border border-white/10 ${height}`}>
      {!apiKey ? (
        <div className="flex h-full items-center justify-center text-sm text-slate-400">
          Google Maps API key required.
        </div>
      ) : loadError ? (
        <div className="flex h-full items-center justify-center text-sm text-red-300">
          Failed to load map.
        </div>
      ) : !isLoaded ? (
        <div className="flex h-full items-center justify-center text-sm text-slate-400">
          Loading map...
        </div>
      ) : (
        <GoogleMap
          center={mapCenter}
          zoom={12}
          mapContainerClassName="h-full w-full"
          options={{
            clickableIcons: false,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {filtered.map((property) => (
            <OverlayView
              key={property.id}
              position={property.coordinates}
              mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
            >
              <button
                onClick={() => {
                  setSelectedId(selectedId === property.id ? null : property.id)
                  if (!showFullMap) setShowFullMap(true)
                }}
                style={{ transform: "translate(-50%, -100%)", whiteSpace: "nowrap" }}
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
          {selected && showFullMap ? (
            <InfoWindow
              position={selected.coordinates}
              onCloseClick={() => setSelectedId(null)}
              options={{ pixelOffset: new (window as any).google.maps.Size(0, -40) }}
            >
              <div className="w-56 overflow-hidden rounded-xl">
                <img
                  src={selected.images[0] ?? defaultImage}
                  alt={selected.title}
                  className="h-32 w-full object-cover"
                />
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
  )

  // Full screen map mode
  if (showFullMap) {
    return (
      <div className="fixed inset-0 z-50 flex bg-slate-950">
        <button
          onClick={() => { setShowFullMap(false); setSelectedId(null) }}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg hover:bg-slate-700"
        >
          <X size={18} />
        </button>

        <div className="absolute left-4 top-4 z-10 rounded-xl bg-slate-900/90 px-3 py-2 text-sm font-semibold text-white shadow">
          {filtered.length} listing{filtered.length !== 1 ? "s" : ""} found
        </div>

        <div className="flex-1">
          <MapComponent height="h-full" />
        </div>

        <div className="hidden w-80 flex-shrink-0 overflow-y-auto border-l border-white/10 bg-slate-950 p-4 lg:block">
          <div className="space-y-3">
            {filtered.map((property) => (
              <button
                key={property.id}
                onClick={() => setSelectedId(selectedId === property.id ? null : property.id)}
                className={`w-full overflow-hidden rounded-2xl border text-left transition ${
                  selectedId === property.id
                    ? "border-orange-400/60 bg-orange-400/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <img
                  src={property.images[0] ?? defaultImage}
                  alt={property.title}
                  className="h-28 w-full object-cover"
                />
                <div className="space-y-1 p-3">
                  <p className="line-clamp-1 text-sm font-semibold text-white">
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
    )
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Listings" }]} />

      {/* Map */}
      <div className="relative">
        <MapComponent height="h-64" />
        <button
          onClick={() => setShowFullMap(true)}
          className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-900/30 transition hover:bg-slate-900/40"
        >
          <span className="flex items-center gap-2 rounded-lg bg-slate-900/90 px-4 py-2 text-sm font-semibold text-white shadow">
            <MapPin size={14} />
            Show on map
          </span>
        </button>
      </div>

      {/* Filters */}
      <PropertyFilters value={filters} onChange={setFilters} />

      {/* Count */}
      <p className="text-sm text-slate-300">
        <span className="font-semibold text-white">{filtered.length}</span> listings found
      </p>

      {/* Listing cards */}
      {isLoading ? (
        <PropertyGridSkeleton />
      ) : (
        <motion.div layout className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((property) => (
            <motion.div
              key={property.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PropertyCard property={property} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-lg font-semibold text-white">No results found</p>
          <p className="mt-2 text-sm text-slate-400">
            Try adjusting your filters or clearing them to see more listings.
          </p>
        </div>
      )}

      <CompareBar properties={properties} />
    </div>
  )
}
