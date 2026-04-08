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

// Known university coordinates — partial matches work (e.g. "georgia tech" matches)
const UNIVERSITY_COORDS: { keywords: string[]; coords: { lat: number; lng: number }; zoom: number }[] = [
  { keywords: ["georgia tech", "georgia institute"], coords: { lat: 33.7756, lng: -84.3963 }, zoom: 15 },
  { keywords: ["ut austin", "university of texas at austin", "texas austin"], coords: { lat: 30.2849, lng: -97.7341 }, zoom: 15 },
  { keywords: ["ucla", "uc los angeles", "california los angeles"], coords: { lat: 34.0689, lng: -118.4452 }, zoom: 15 },
  { keywords: ["usc", "university of southern california"], coords: { lat: 34.0224, lng: -118.2851 }, zoom: 15 },
  { keywords: ["uc berkeley", "berkeley", "cal berkeley"], coords: { lat: 37.8724, lng: -122.2595 }, zoom: 15 },
  { keywords: ["stanford"], coords: { lat: 37.4275, lng: -122.1697 }, zoom: 15 },
  { keywords: ["harvard"], coords: { lat: 42.3770, lng: -71.1167 }, zoom: 15 },
  { keywords: ["mit", "massachusetts institute"], coords: { lat: 42.3601, lng: -71.0942 }, zoom: 15 },
  { keywords: ["nyu", "new york university"], coords: { lat: 40.7295, lng: -73.9965 }, zoom: 15 },
  { keywords: ["columbia"], coords: { lat: 40.8075, lng: -73.9626 }, zoom: 15 },
  { keywords: ["yale"], coords: { lat: 41.3163, lng: -72.9223 }, zoom: 15 },
  { keywords: ["princeton"], coords: { lat: 40.3431, lng: -74.6551 }, zoom: 15 },
  { keywords: ["university of michigan", "umich", "michigan ann arbor"], coords: { lat: 42.2780, lng: -83.7382 }, zoom: 15 },
  { keywords: ["ohio state", "osu columbus"], coords: { lat: 40.0076, lng: -83.0300 }, zoom: 15 },
  { keywords: ["penn state", "pennsylvania state"], coords: { lat: 40.7982, lng: -77.8599 }, zoom: 15 },
  { keywords: ["university of florida", "uf gainesville"], coords: { lat: 29.6436, lng: -82.3549 }, zoom: 15 },
  { keywords: ["florida state", "fsu"], coords: { lat: 30.4418, lng: -84.2985 }, zoom: 15 },
  { keywords: ["university of georgia", "uga"], coords: { lat: 33.9480, lng: -83.3774 }, zoom: 15 },
  { keywords: ["emory"], coords: { lat: 33.7940, lng: -84.3248 }, zoom: 15 },
  { keywords: ["unc", "university of north carolina", "chapel hill"], coords: { lat: 35.9049, lng: -79.0469 }, zoom: 15 },
  { keywords: ["duke"], coords: { lat: 36.0014, lng: -78.9382 }, zoom: 15 },
  { keywords: ["vanderbilt"], coords: { lat: 36.1447, lng: -86.8027 }, zoom: 15 },
  { keywords: ["university of chicago", "uchicago"], coords: { lat: 41.7886, lng: -87.5987 }, zoom: 15 },
  { keywords: ["northwestern"], coords: { lat: 42.0565, lng: -87.6753 }, zoom: 15 },
  { keywords: ["purdue"], coords: { lat: 40.4259, lng: -86.9081 }, zoom: 15 },
  { keywords: ["university of washington", "uw seattle"], coords: { lat: 47.6553, lng: -122.3035 }, zoom: 15 },
  { keywords: ["university of colorado", "cu boulder"], coords: { lat: 40.0076, lng: -105.2659 }, zoom: 15 },
  { keywords: ["arizona state", "asu tempe"], coords: { lat: 33.4255, lng: -111.9400 }, zoom: 15 },
  { keywords: ["university of arizona", "uarizona"], coords: { lat: 32.2319, lng: -110.9501 }, zoom: 15 },
  { keywords: ["texas a&m", "texas a and m", "tamu"], coords: { lat: 30.6187, lng: -96.3365 }, zoom: 15 },
  { keywords: ["rice university", "rice houston"], coords: { lat: 29.7174, lng: -95.4018 }, zoom: 15 },
  { keywords: ["tulane"], coords: { lat: 29.9401, lng: -90.1213 }, zoom: 15 },
  { keywords: ["lsu", "louisiana state"], coords: { lat: 30.4133, lng: -91.1800 }, zoom: 15 },
  { keywords: ["university of miami", "um coral gables"], coords: { lat: 25.7214, lng: -80.2792 }, zoom: 15 },
  { keywords: ["boston university", "bu boston"], coords: { lat: 42.3505, lng: -71.1054 }, zoom: 15 },
  { keywords: ["northeastern"], coords: { lat: 42.3398, lng: -71.0892 }, zoom: 15 },
  { keywords: ["carnegie mellon", "cmu pittsburgh"], coords: { lat: 40.4433, lng: -79.9436 }, zoom: 15 },
  { keywords: ["university of pittsburgh", "pitt"], coords: { lat: 40.4444, lng: -79.9608 }, zoom: 15 },
  { keywords: ["rutgers"], coords: { lat: 40.5008, lng: -74.4474 }, zoom: 15 },
  { keywords: ["virginia tech", "vt blacksburg"], coords: { lat: 37.2284, lng: -80.4234 }, zoom: 15 },
  { keywords: ["university of virginia", "uva"], coords: { lat: 38.0336, lng: -78.5080 }, zoom: 15 },
]

function findUniversityCoords(query: string) {
  const q = query.toLowerCase().trim()
  if (!q) return null
  for (const entry of UNIVERSITY_COORDS) {
    if (entry.keywords.some((kw) => q.includes(kw) || kw.includes(q))) {
      return entry
    }
  }
  return null
}

export function MapView() {
  const { data: properties = [], isLoading } = useProperties()
  const [filters, setFilters] = React.useState(defaultFilters)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [showFullMap, setShowFullMap] = React.useState(false)
  const mapRef = React.useRef<google.maps.Map | null>(null)
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey ?? "",
  })

  // Pan map when university filter changes
  React.useEffect(() => {
    if (!mapRef.current) return
    const match = findUniversityCoords(filters.university)
    if (match) {
      mapRef.current.panTo(match.coords)
      mapRef.current.setZoom(match.zoom)
    }
  }, [filters.university])

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
          onLoad={(map) => { mapRef.current = map }}
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
