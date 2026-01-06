import React from "react"
import { motion } from "framer-motion"
import { Search } from "lucide-react"

import { SectionHeader } from "@/components/SectionHeader"
import { CompareBar } from "@/components/properties/CompareBar"
import { PropertyFilters } from "@/components/properties/PropertyFilters"
import type { PropertyFiltersState } from "@/components/properties/PropertyFilters"
import { PropertyCard } from "@/components/properties/PropertyCard"
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

export function Browse() {
  const { data: properties = [] } = useProperties()
  const [filters, setFilters] = React.useState(defaultFilters)

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

  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 p-8 text-white shadow-xl">
        <SectionHeader
          eyebrow="Student Housing"
          title="Student Housing Made Easy"
          subtitle="Search curated listings, compare features, and connect instantly with property owners."
        />
        <div className="mt-6 flex items-center gap-3 text-sm text-white/80">
          <Search size={16} />
          {filtered.length} properties match your filters
        </div>
      </div>

      <PropertyFilters value={filters} onChange={setFilters} />

      <motion.div
        layout
        className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
      >
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

      <CompareBar properties={properties} />
    </div>
  )
}
